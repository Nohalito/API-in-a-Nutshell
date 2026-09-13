"""Three doors, one token, and the difference between 401 and 403.

Written out three times rather than generated in a loop. A loop would be
shorter and would document worse: each of these is a distinct entry in
/docs with its own padlock and its own description, and the repetition
is the point being demonstrated.

The demo runs itself:

  1. Call /viewer with no token           -> 401, "I don't know you"
  2. Log in as viewer, call /viewer       -> 200
  3. Same token, call /admin              -> 403, "I know you, and no"
  4. Log in as admin, call /admin         -> 200

Steps 1 and 3 landing on different codes is the whole lesson. Both are
refusals; only one of them is worth retrying.
"""

from fastapi import APIRouter, Depends

from app.api.deps import require_role
from app.schemas.auth import Identity
from app.schemas.common import GreetingWithCaller

router = APIRouter(tags=["token auth"])

_FORBIDDEN = {403: {"description": "Valid token, insufficient role."}}
_UNAUTHORIZED = {401: {"description": "No token, or an invalid or expired one."}}


@router.get(
    "/viewer",
    response_model=GreetingWithCaller,
    summary="Viewer area",
    description="Any logged-in account reaches this: viewer is the lowest rank.",
    responses={**_UNAUTHORIZED, **_FORBIDDEN},
)
async def viewer_area(identity: Identity = Depends(require_role("viewer"))) -> GreetingWithCaller:
    return GreetingWithCaller(
        message="Hello Dataschool viewer!", area="viewer", callerRole=identity.role
    )


@router.get(
    "/editor",
    response_model=GreetingWithCaller,
    summary="Editor area",
    description="Editors and admins. A viewer's token gets a 403 here.",
    responses={**_UNAUTHORIZED, **_FORBIDDEN},
)
async def editor_area(identity: Identity = Depends(require_role("editor"))) -> GreetingWithCaller:
    return GreetingWithCaller(
        message="Hello Dataschool editor!", area="editor", callerRole=identity.role
    )


@router.get(
    "/admin",
    response_model=GreetingWithCaller,
    summary="Admin area",
    description="Admins only. Everyone else gets a 403, however valid their token.",
    responses={**_UNAUTHORIZED, **_FORBIDDEN},
)
async def admin_area(identity: Identity = Depends(require_role("admin"))) -> GreetingWithCaller:
    return GreetingWithCaller(
        message="Hello Dataschool admin!", area="admin", callerRole=identity.role
    )
