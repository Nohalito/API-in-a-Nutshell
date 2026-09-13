"""Querying the produce store.

The layer between the route and the data. It exists so the endpoint can
stay a description of the HTTP contract -- parameters in, status out --
while the question of *what matches what* lives somewhere it can be
tested without spinning up a web server.

Swap app.data.produce for a real database and only this file changes.
"""

from app.data.produce import PRODUCE
from app.schemas.produce import ProduceItem


def search(
    kind: str | None = None,
    color: str | None = None,
    season: str | None = None,
    max_price: float | None = None,
    limit: int = 20,
    offset: int = 0,
) -> tuple[int, list[ProduceItem]]:
    """Filter, then page. Returns the total match count and one page.

    The count is taken *before* slicing, which is the whole reason this
    returns a tuple: a client showing "20 of 137" needs the number it did
    not receive, and computing it after the slice would always report the
    page size.

    A `season` filter deliberately also matches "all" -- something
    available year round is available in summer too, and a filter that
    hid bananas from a summer query would be quietly wrong.
    """
    rows = PRODUCE

    if kind is not None:
        rows = [r for r in rows if r["kind"] == kind]
    if color is not None:
        rows = [r for r in rows if r["color"] == color.lower()]
    if season is not None:
        rows = [r for r in rows if r["season"] == season or r["season"] == "all"]
    if max_price is not None:
        rows = [r for r in rows if r["price_per_kg"] <= max_price]

    total = len(rows)
    page = rows[offset : offset + limit]
    return total, [ProduceItem(**row) for row in page]
