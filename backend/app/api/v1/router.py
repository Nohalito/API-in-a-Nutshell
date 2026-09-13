"""Every v1 endpoint, gathered into one router.

The aggregation lives here rather than in main.py so that adding an
endpoint never means editing the application setup. main.py mounts this
one object and stays the same size forever; a v2 would be a sibling
folder mounted alongside, with v1 still serving its existing clients --
which is what versioning is *for*.

Order matters only for documentation: /docs lists tags in the order
their routes are first seen, so this sequence is the order the deck
walks through them.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import apps, auth, echo, limits, meta, produce, roles

api_router = APIRouter()

api_router.include_router(meta.router)
api_router.include_router(echo.router)
api_router.include_router(produce.router)
api_router.include_router(auth.router)
api_router.include_router(roles.router)
api_router.include_router(apps.router)
api_router.include_router(limits.router)
