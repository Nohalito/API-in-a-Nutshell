"""An endpoint you are meant to break."""

from fastapi import APIRouter, Depends

from app.api.deps import rate_limited
from app.core.config import settings
from app.schemas.common import Message

router = APIRouter(tags=["rate limiting"])


@router.get(
    "/limited",
    response_model=Message,
    # The dependency guards the route but returns nothing the handler
    # needs, so it is declared here rather than as a parameter. FastAPI
    # still runs it -- and still fails the request from inside it --
    # without cluttering the signature.
    dependencies=[Depends(rate_limited)],
    summary="Rate limited on purpose",
    description=(
        f"{settings.rate_limit_requests} requests per {settings.rate_limit_window_seconds} seconds. "
        "Press send four times quickly and the fourth comes back **429 Too Many Requests**.\n\n"
        "Watch the `X-RateLimit-Remaining` header count down on the successful calls, and "
        "`Retry-After` appear on the refusal. A limit that only says no is a limit clients "
        "have to guess at; these headers are how a well-behaved client knows to slow down "
        "before it gets refused."
    ),
    responses={429: {"description": "Too many requests. Check Retry-After."}},
)
async def limited() -> Message:
    return Message(message="Hello Dataschool! You are within the limit.")
