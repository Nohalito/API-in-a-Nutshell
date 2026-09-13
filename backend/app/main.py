"""Application setup -- and nothing else.

No route is defined in this file. That is the convention worth copying:
main.py wires the application together (middleware, documentation,
router mounting) and every actual endpoint lives under app/api/. When
something is wrong with a *request*, you look in the endpoint; when
something is wrong with the *app*, you look here. The two never get
tangled.

Run it:
    uvicorn app.main:app --reload --port 8000
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api.v1.router import api_router
from app.core.config import settings


def create_app() -> FastAPI:
    """Build the application.

    A factory rather than a module-level FastAPI() so tests can stand up
    a fresh, independent instance instead of importing a shared global
    that has already been mutated by whatever imported it first.
    """
    app = FastAPI(
        title=settings.project_name,
        version="1.0.0",
        description=(
            "A teaching API for the *API in a Nutshell* talk. Every endpoint exists to "
            "demonstrate exactly one idea: a plain read, a body, query parameters, "
            "Basic auth, bearer tokens with roles, an API key, and a rate limit.\n\n"
            "Everything below is runnable from this page -- use the **Authorize** button "
            "to supply credentials, then **Try it out** on any endpoint."
        ),
    )

    # Must be added before the app starts serving. Without it the browser
    # makes the request, the server answers it perfectly, and the
    # JavaScript still sees a network error -- because the browser
    # refuses to hand over a cross-origin response the server did not
    # explicitly permit. That failure is invisible server-side, which is
    # why it eats so many afternoons.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        # Authorization and X-API-Key are both "non-simple" headers, so
        # the browser sends an OPTIONS preflight before the real request
        # and will not proceed unless they are named as allowed.
        allow_headers=["*"],
        # Response headers are hidden from JavaScript unless listed here.
        # Without this the rate-limit demo can see the 429 but not the
        # Retry-After that explains it.
        expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "Retry-After"],
    )

    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.get("/", include_in_schema=False)
    async def index() -> RedirectResponse:
        """Opening the server in a browser should land somewhere useful."""
        return RedirectResponse(url="/docs")

    return app


app = create_app()


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
