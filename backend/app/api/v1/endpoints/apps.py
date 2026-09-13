"""A key in a header, identifying a program rather than a person."""

from fastapi import APIRouter, Depends

from app.api.deps import require_api_key
from app.schemas.common import Message

router = APIRouter(tags=["api key"])


@router.get(
    "/app",
    response_model=Message,
    summary="Authenticated application",
    description=(
        "Send the header `X-API-Key: nutshell-demo-key`.\n\n"
        "Send it once with the header missing to see the 401, then again with it. "
        "Note what is *not* here: no login step and no expiry. A key is a long-lived "
        "secret belonging to an application, which is exactly why it belongs in a "
        "header and not in the URL -- URLs end up in logs, history and Referer headers."
    ),
    responses={401: {"description": "Missing or unrecognised key."}},
)
async def authenticated_app(_: str = Depends(require_api_key)) -> Message:
    return Message(message="Hello authenticated app!")
