"""Credential checking and token minting.

Kept apart from the routes on purpose. A route should say *what* it
requires ("an editor"), never *how* that is established -- so all the
comparing, signing and decoding lives here, and the day the token format
changes, no endpoint file is touched.
"""

import secrets
from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import settings


def verify_password(username: str, password: str) -> str | None:
    """Return the account's role, or None if the credentials are wrong.

    `secrets.compare_digest` rather than `==` because a plain string
    comparison stops at the first wrong character, and the time it takes
    to fail is therefore a measurement of how much of the password was
    right. Over enough requests that leaks the secret one character at a
    time. The fix costs nothing, so there is no reason to skip it even
    here.

    The unknown-user branch still runs a comparison against a dummy value
    for the same reason: returning early would make "no such user" faster
    than "wrong password", which tells an attacker which usernames exist.
    """
    account = settings.accounts.get(username)
    if account is None:
        secrets.compare_digest(password, "dummy-value-for-constant-time")
        return None

    expected_password, role = account
    if not secrets.compare_digest(password, expected_password):
        return None
    return role


def verify_api_key(candidate: str) -> bool:
    return secrets.compare_digest(candidate, settings.api_key)


def create_access_token(username: str, role: str) -> tuple[str, int]:
    """Mint a signed JWT. Returns the token and its lifetime in seconds.

    The claims below are the registered ones from RFC 7519 plus `role`:
      sub  who the token is about
      iss  who issued it
      iat  when it was issued
      exp  when it stops being valid

    Worth saying out loud during a demo: none of this is encrypted. The
    middle segment is base64url and anyone holding the token can read it.
    The signature does not hide the claims, it only proves that nobody
    edited them after we signed.
    """
    now = datetime.now(timezone.utc)
    expires_in = settings.access_token_ttl_seconds
    payload = {
        "sub": username,
        "role": role,
        "iss": settings.jwt_issuer,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=expires_in)).timestamp()),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, expires_in


def decode_access_token(token: str) -> dict:
    """Verify a token and return its claims. Raises jwt.PyJWTError if bad.

    `algorithms=` is a whitelist, and passing it explicitly is the single
    most important line in this file. Left open, a library will honour
    whatever the *token itself* claims in its header -- including
    `alg: none`, which means unsigned, which means anyone can hand us an
    admin token they wrote themselves. Naming the algorithm we accept
    closes that whole family of attacks.

    Expiry is checked by PyJWT automatically; issuer only because we
    pass it.
    """
    return jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
        issuer=settings.jwt_issuer,
    )


def role_satisfies(caller_role: str, required_role: str) -> bool:
    """Does `caller_role` rank at or above `required_role`?

    Ranking rather than equality, so an admin is not locked out of the
    endpoints it obviously ought to reach. An unknown role ranks 0 and
    therefore satisfies nothing, which is the safe direction to fail.
    """
    ranks = settings.role_hierarchy
    return ranks.get(caller_role, 0) >= ranks.get(required_role, 0)
