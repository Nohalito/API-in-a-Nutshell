"""Every tunable value in one place, loaded from the environment.

Why a settings object rather than constants scattered through the code:
in a real deployment the secret, the allowed origins and the credentials
all change between your laptop and production, and they change *without
the code changing*. Pulling them into one class means there is exactly
one place to look when something is configured wrong, and the app can
refuse to start if a required value is missing rather than failing on
the first request that needs it.

Everything here has a demo-friendly default so `uvicorn app.main:app`
works with no setup at all. That is a deliberate choice for a talk, and
the wrong one for production -- see the note on `jwt_secret`.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="NUTSHELL_",
        extra="ignore",
    )

    project_name: str = "API in a Nutshell"
    api_v1_prefix: str = "/api/v1"

    # --- CORS ---------------------------------------------------------
    # The deck is served from a different origin than this API (port 8000
    # vs 8001 locally, GitHub Pages vs anywhere in deployment), so every
    # call the slides make is cross-origin and the browser will not show
    # the response unless the server opts in here.
    #
    # "*" is safe in this specific case only because we never use cookies:
    # our credentials travel in Authorization / X-API-Key headers, which
    # the browser only sends because the page explicitly attaches them.
    # The moment you add cookie auth this must become a real list, because
    # browsers reject "*" together with allow_credentials=True.
    cors_origins: list[str] = ["*"]

    # --- Passwords ----------------------------------------------------
    # Hardcoded on purpose: this is a teaching API and the room needs to
    # be able to log in. A real service stores a *hash* (bcrypt/argon2)
    # and never the password itself, so that a database leak does not
    # hand over every account.
    accounts: dict[str, tuple[str, str]] = {
        # username: (password, role)
        "viewer": ("viewerpass", "viewer"),
        "editor": ("editorpass", "editor"),
        "admin": ("adminpass", "admin"),
        # The plain POST demo uses this one; it has no role powers.
        "dataschool": ("dataschool", "viewer"),
    }

    # --- JWT ----------------------------------------------------------
    # HS256 is symmetric: the same secret signs and verifies. That makes
    # it cheap (one HMAC-SHA256, single-digit microseconds) but it also
    # means anyone who can verify a token can also mint one -- which is
    # why the asymmetric algorithms exist for multi-service setups.
    jwt_secret: str = "dataschool-demo-secret-not-for-production"
    jwt_algorithm: str = "HS256"
    jwt_issuer: str = "api-in-a-nutshell"
    access_token_ttl_seconds: int = 1800

    # --- API key ------------------------------------------------------
    api_key: str = "nutshell-demo-key"
    api_key_header: str = "X-API-Key"

    # --- Rate limit ---------------------------------------------------
    # Deliberately tiny so a room full of people hits the 429 within a
    # few seconds of trying.
    rate_limit_requests: int = 3
    rate_limit_window_seconds: int = 20

    # --- Role hierarchy -----------------------------------------------
    # Who can reach what. An admin inherits everything below it, which is
    # how role-based access control usually works in practice -- the
    # alternative (each role opens exactly one door) means your admins
    # end up holding three tokens.
    role_hierarchy: dict[str, int] = {"viewer": 1, "editor": 2, "admin": 3}


@lru_cache
def get_settings() -> Settings:
    """Cached so the environment is read once, not per request.

    FastAPI calls this through Depends() in places, and building a
    Settings object parses and validates every field -- cheap, but not
    free, and there is no reason to do it thousands of times.
    """
    return Settings()


settings = get_settings()
