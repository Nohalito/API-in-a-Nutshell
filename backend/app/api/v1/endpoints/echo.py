"""A POST that proves the body arrived, behind Basic auth."""

from typing import Any

from fastapi import APIRouter, Body, Depends

from app.api.deps import authenticate_basic
from app.schemas.auth import Identity
from app.schemas.common import EchoResponse

router = APIRouter(tags=["basics"])


@router.post(
    "/echo",
    response_model=EchoResponse,
    summary="Send something, get it back",
    description=(
        "Demonstrates the two things a GET does not do: carry a body, and carry a password. "
        "Send `Authorization: Basic <base64 of user:password>` -- try `dataschool:dataschool`. "
        "The server echoes the body back so the room can see it made the trip."
    ),
    responses={401: {"description": "Missing or wrong credentials."}},
)
async def echo(
    payload: Any = Body(default=None, examples=[{"hello": "dataschool"}]),
    identity: Identity = Depends(authenticate_basic),
) -> EchoResponse:
    return EchoResponse(
        message="Hello Dataschool! Your POST arrived.",
        authenticatedAs=identity.username,
        received=payload,
    )
