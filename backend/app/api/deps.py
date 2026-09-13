"""Reusable dependencies: the things routes require, expressed once.

This file is the reason the folder tree is worth the trouble. A route
below says `identity: Identity = Depends(require_role("editor"))` and
that single line does four jobs: it enforces the rule, it documents the
rule in /docs, it puts a padlock on the endpoint in the Swagger UI, and
it hands the route a typed object instead of a raw header. None of that
logic is repeated per route, so none of it can drift between them.

A note on 401 versus 403, since the distinction is most of what the
role endpoints exist to teach:

  401 Unauthorized  "I do not know who you are."
                    The credential is missing, malformed or wrong.
                    It MUST come with a WWW-Authenticate header telling
                    the caller how to try again. The name is a historical
                    mistake -- it means unauthenticated.

  403 Forbidden     "I know exactly who you are, and no."
                    Retrying with the same credential is pointless, so
                    there is no WWW-Authenticate header.

Getting these backwards is one of the most common API bugs in the wild,
and it matters: a client library that sees a 401 will often try to
refresh its token and retry, which against a should-have-been-403 turns
one refused request into an infinite loop.
"""

import jwt
from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import APIKeyHeader, HTTPAuthorizationCredentials, HTTPBasic, HTTPBasicCredentials, HTTPBearer

from app.core import security
from app.core.config import settings
from app.core.rate_limit import FixedWindowLimiter
from app.schemas.auth import Identity

# auto_error=False on all three: we want to write the failure responses
# ourselves so the status codes and the WWW-Authenticate headers are
# exactly right, rather than accepting the library's defaults.
basic_scheme = HTTPBasic(auto_error=False, description="Username and password.")
bearer_scheme = HTTPBearer(auto_error=False, description="A JWT from POST /auth/login.")
api_key_scheme = APIKeyHeader(name=settings.api_key_header, auto_error=False)


def authenticate_basic(
    credentials: HTTPBasicCredentials | None = Depends(basic_scheme),
) -> Identity:
    """Username and password, sent as `Authorization: Basic <base64>`.

    Base64 is an encoding, not encryption -- it is trivially reversible,
    so Basic auth over plain HTTP hands the password to anyone on the
    wire. It is only ever acceptable over TLS.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This endpoint needs a username and password.",
            headers={"WWW-Authenticate": "Basic"},
        )

    role = security.verify_password(credentials.username, credentials.password)
    if role is None:
        # Same message whether the user does not exist or the password
        # was wrong: telling them apart is a free list of valid usernames.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wrong username or password.",
            headers={"WWW-Authenticate": "Basic"},
        )

    return Identity(username=credentials.username, role=role)


def get_current_identity(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Identity:
    """Whoever the Bearer token says is calling.

    Authentication only. Whether that identity may reach the endpoint is
    a separate question, answered by require_role below.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token. Log in at POST /auth/login, then send: Authorization: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        claims = security.decode_access_token(credentials.credentials)
    except jwt.ExpiredSignatureError:
        # Split out from the generic case because it is the one failure
        # the client can fix by itself, and saying so is the difference
        # between a client that refreshes and one that gives up.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="That token has expired. Log in again.",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="That token is not valid.",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )

    return Identity(username=claims["sub"], role=claims["role"])


def require_role(required: str):
    """Build a dependency that admits `required` and anything above it.

    A factory rather than a plain dependency because FastAPI's Depends()
    takes a callable with no arguments of its own -- so we close over the
    role and hand back a function shaped the way FastAPI expects.
    """

    def dependency(identity: Identity = Depends(get_current_identity)) -> Identity:
        if not security.role_satisfies(identity.role, required):
            # 403, not 401: the token is perfectly valid, it simply does
            # not reach this far. Sending 401 here would invite the
            # client to go and get another token, which would be the
            # same token.
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Your role is '{identity.role}'. This endpoint requires '{required}'.",
            )
        return identity

    return dependency


def require_api_key(key: str | None = Depends(api_key_scheme)) -> str:
    """A shared secret in a header, identifying an *application*.

    Different in kind from the token endpoints: an API key says which
    program is calling, a token says which person. Keys are long-lived
    and belong to a service; tokens are short-lived and belong to a
    session. Confusing the two is how long-lived credentials end up
    hardcoded in a mobile app.

    In the header rather than the query string because URLs are logged
    everywhere -- proxies, server access logs, browser history, the
    Referer sent to third parties. A key in a URL is a key in a dozen
    files you do not control.
    """
    if key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Missing the {settings.api_key_header} header.",
            headers={"WWW-Authenticate": settings.api_key_header},
        )
    if not security.verify_api_key(key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"That {settings.api_key_header} is not recognised.",
            headers={"WWW-Authenticate": settings.api_key_header},
        )
    return key


limiter = FixedWindowLimiter(
    limit=settings.rate_limit_requests,
    window_seconds=settings.rate_limit_window_seconds,
)


def rate_limited(request: Request, response: Response) -> None:
    """Allow a few requests per window, then refuse with 429.

    The X-RateLimit-* headers go out on success as well as on failure,
    which is what lets a well-behaved client slow down *before* it gets
    refused rather than backing off after the fact.

    Keyed on the client IP. Behind a proxy or load balancer that becomes
    the proxy's IP and every user shares one bucket, so a real deployment
    reads X-Forwarded-For instead -- and only trusts it when the proxy is
    known, since the client can otherwise just make one up.
    """
    key = request.client.host if request.client else "unknown"
    verdict = limiter.check(key)

    headers = {
        "X-RateLimit-Limit": str(verdict.limit),
        "X-RateLimit-Remaining": str(verdict.remaining),
        "X-RateLimit-Reset": str(verdict.reset_after),
    }

    if not verdict.allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit reached: {verdict.limit} requests per {settings.rate_limit_window_seconds}s. Try again in {verdict.reset_after}s.",
            # Retry-After is the standard way to say when to come back,
            # and the difference between a client that waits and one that
            # hammers a struggling server harder.
            headers={**headers, "Retry-After": str(verdict.reset_after)},
        )

    response.headers.update(headers)
