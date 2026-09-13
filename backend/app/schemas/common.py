"""Shapes shared by more than one endpoint."""

from typing import Any

from pydantic import BaseModel, Field


class Message(BaseModel):
    """The plainest possible response body."""

    message: str


class GreetingWithCaller(Message):
    """A greeting that also says who the server thinks you are.

    The extra fields exist for the demo: when an admin's token opens
    /viewer, seeing `callerRole: admin` next to `area: viewer` makes it
    obvious that the two are different things, which is the point the
    role endpoints are there to make.
    """

    area: str = Field(description="The role this endpoint belongs to.")
    callerRole: str = Field(description="The role the presented token actually carries.")


class EchoResponse(Message):
    """Proof that the server received what you sent."""

    authenticatedAs: str
    received: Any = Field(description="The body exactly as it arrived, parsed back from JSON.")
