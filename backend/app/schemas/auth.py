"""Login and identity shapes."""

from pydantic import BaseModel, Field


class TokenResponse(BaseModel):
    """What a successful login hands back.

    The field is named `accessToken` rather than the `access_token` that
    Python style would suggest, because the deck's js/live.js reads
    `data.accessToken` off the response to capture the token. The wire
    format belongs to the client, not to the server's language -- this is
    exactly the kind of decision a schema file exists to make visible.
    """

    accessToken: str = Field(description="A signed JWT. Present it as: Authorization: Bearer <token>")
    tokenType: str = Field(default="Bearer", description="How to present the token.")
    expiresIn: int = Field(description="Seconds until the token stops being accepted.")
    role: str = Field(description="What this token is allowed to do.")


class Identity(BaseModel):
    """Who the caller turned out to be, once a token was verified."""

    username: str
    role: str
