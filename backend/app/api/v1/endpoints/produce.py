"""Query parameters: the same endpoint, narrowed by the URL."""

from fastapi import APIRouter, Query

from app.schemas.produce import Kind, ProduceList, Season
from app.services import produce as produce_service

router = APIRouter(tags=["query parameters"])


@router.get(
    "/produce",
    response_model=ProduceList,
    summary="List fruit and vegetables",
    description=(
        "Every filter is optional and they combine. "
        "Try `/produce?kind=fruit`, then `?kind=fruit&color=red`, then add `&max_price=5`. "
        "The URL is the query -- nothing is hidden in a body."
    ),
)
async def list_produce(
    # Declaring these as typed parameters rather than reading them off
    # the request is what gives us validation and documentation for free:
    # `?kind=mineral` is rejected with a 422 that names the field and
    # lists the accepted values, and /docs renders a dropdown.
    kind: Kind | None = Query(default=None, description="fruit or vegetable."),
    color: str | None = Query(default=None, description="red, yellow, green, orange, purple, blue, white."),
    season: Season | None = Query(default=None, description="Matches that season plus anything available all year."),
    max_price: float | None = Query(default=None, gt=0, description="Euros per kilo, inclusive."),
    limit: int = Query(default=20, ge=1, le=100, description="Page size."),
    offset: int = Query(default=0, ge=0, description="How many to skip."),
) -> ProduceList:
    total, items = produce_service.search(
        kind=kind, color=color, season=season, max_price=max_price, limit=limit, offset=offset
    )
    return ProduceList(count=total, limit=limit, offset=offset, items=items)
