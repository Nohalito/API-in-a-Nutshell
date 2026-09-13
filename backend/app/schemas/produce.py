"""What a produce request and response look like on the wire.

These classes are the API's *contract*. FastAPI reads them twice: once to
validate and coerce what arrives, and once to generate the OpenAPI
document at /docs. That second use is why the Field descriptions are
worth writing -- they become the documentation the room reads, with no
second copy to drift out of date.
"""

from typing import Literal

from pydantic import BaseModel, Field

Kind = Literal["fruit", "vegetable"]
Season = Literal["spring", "summer", "autumn", "winter", "all"]


class ProduceItem(BaseModel):
    id: int
    name: str
    kind: Kind
    color: str
    season: Season
    price_per_kg: float


class ProduceList(BaseModel):
    """A paginated list.

    Returning a bare JSON array is the common beginner shape and it
    paints you into a corner: there is nowhere to put the total count,
    and adding one later is a breaking change for every client. An
    envelope costs one level of nesting and leaves room to grow.
    """

    count: int = Field(description="How many items matched the filters in total.")
    limit: int = Field(description="How many were asked for in this page.")
    offset: int = Field(description="How many were skipped.")
    items: list[ProduceItem]
