"""The simplest thing an API can do: answer."""

from fastapi import APIRouter

from app.schemas.common import Message

router = APIRouter(tags=["basics"])


@router.get(
    "/hello",
    response_model=Message,
    summary="Say hello",
    description="No credential, no parameters, no body. A request goes out and a JSON document comes back.",
)
async def root() -> Message:
    return Message(message="Hello Dataschool!")
