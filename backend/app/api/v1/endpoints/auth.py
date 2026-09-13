"""Trading a password for a token."""

from fastapi import APIRouter, Depends

from app.api.deps import authenticate_basic
from app.core import security
from app.schemas.auth import Identity, TokenResponse

router = APIRouter(tags=["token auth"])


@router.post(
    "/auth/login",
    response_model=TokenResponse,
    summary="Log in and receive a JWT",
    description=(
        "Send `Authorization: Basic <base64 of user:password>`. Accounts: "
        "`viewer:viewerpass`, `editor:editorpass`, `admin:adminpass`.\n\n"
        "The token that comes back goes on every following request as "
        "`Authorization: Bearer <token>`. Paste it into jwt.io -- the claims are "
        "readable by anyone, because a signature proves authorship, not secrecy."
    ),
    responses={401: {"description": "Missing or wrong credentials."}},
)
async def login(identity: Identity = Depends(authenticate_basic)) -> TokenResponse:
    """Why this exchange exists at all.

    The password is sent once, here, and then never again -- everything
    afterwards carries a token that expires on its own and says what it
    is allowed to do. A leaked token is a problem for half an hour; a
    leaked password is a problem until somebody notices.
    """
    token, expires_in = security.create_access_token(identity.username, identity.role)
    return TokenResponse(accessToken=token, expiresIn=expires_in, role=identity.role)
