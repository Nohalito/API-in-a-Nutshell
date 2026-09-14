# API-in-a-Nutshell — Backend

The demo API for the *API in a Nutshell* talk. Every endpoint exists to show
exactly one idea, and the code is laid out the way a production FastAPI service
is laid out — the folder tree is part of what the project teaches.

## Running it

```bash
cd backend
source venv/Scripts/activate
pip install -r requirements.txt   # first time only
uvicorn app.main:app --reload --port 8000
```

Then open <http://localhost:8000/docs> — the interactive documentation is
generated from the code, and every endpoint below can be called from it.

## Endpoints

Everything is under `/api/v1`.

| Verb | Path | Demonstrates | Credential |
|---|---|---|---|
| `GET` | `/hello` | the plainest possible request | none |
| `POST` | `/echo` | a request body | Basic |
| `GET` | `/produce` | query parameters | none |
| `POST` | `/auth/login` | trading a password for a token | Basic |
| `GET` | `/viewer` `/editor` `/admin` | roles, and 401 vs 403 | Bearer |
| `GET` | `/app` | a key identifying an application | `X-API-Key` |
| `GET` | `/limited` | rate limiting and `429` | none |

### Credentials

All hardcoded — this is a teaching API, and the room needs to be able to log in.

| Username | Password | Role |
|---|---|---|
| `viewer` | `viewerpass` | viewer |
| `editor` | `editorpass` | editor |
| `admin` | `adminpass` | admin |
| `dataschool` | `dataschool` | viewer |

API key: `nutshell-demo-key`, sent as `X-API-Key`.

### Demo sequences

**Query parameters** — narrow the same endpoint three times:

```bash
curl "localhost:8000/api/v1/produce?kind=fruit"
curl "localhost:8000/api/v1/produce?kind=fruit&color=red"
curl "localhost:8000/api/v1/produce?kind=fruit&color=red&max_price=5"
curl "localhost:8000/api/v1/produce?kind=mineral"     # 422, and it says why
```

**401 vs 403** — the sequence the role endpoints exist for:

```bash
curl -i localhost:8000/api/v1/viewer                  # 401 — "I don't know you"

TOKEN=$(curl -s -X POST localhost:8000/api/v1/auth/login -u viewer:viewerpass \
        | python -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")

curl -i localhost:8000/api/v1/viewer -H "Authorization: Bearer $TOKEN"   # 200
curl -i localhost:8000/api/v1/admin  -H "Authorization: Bearer $TOKEN"   # 403 — "I know you, and no"
```

Both are refusals. Only one of them is worth retrying, and that is the whole
point — a client that treats a 403 like a 401 will refresh its token and retry
forever.

Paste the token into <https://jwt.io> to make the other point: the claims are
readable by anyone holding it. A signature proves nobody *edited* the token, not
that nobody can *read* it.

**Rate limiting** — three per twenty seconds, then it refuses:

```bash
for i in 1 2 3 4; do curl -i -s localhost:8000/api/v1/limited | head -1; done
```

Watch `X-RateLimit-Remaining` count down on the successes and `Retry-After`
appear on the refusal.

## Architecture

The layout is the conventional FastAPI one, and the layering rule is that
**dependencies point inwards**: routes may import services, services may import
data, and nothing ever imports in the other direction.

```
app/
├── main.py              app setup only — no route is defined here
├── core/                cross-cutting, and ignorant of HTTP
│   ├── config.py        every tunable value, from the environment
│   ├── security.py      password checks, JWT signing and verifying
│   └── rate_limit.py    a fixed-window limiter
├── api/
│   ├── deps.py          the dependencies routes share
│   └── v1/
│       ├── router.py    gathers every v1 endpoint into one router
│       └── endpoints/   one module per concept
├── schemas/             what goes over the wire (Pydantic)
├── services/            business logic, no HTTP
└── data/                the "database" — a list of dicts
```

Why it is worth splitting a small app this way:

- **`main.py` never grows.** Adding an endpoint means adding a file under
  `endpoints/` and one line in `router.py`. Application setup and request
  handling never get tangled.
- **A route says *what* it requires, never *how*.** `Depends(require_role("editor"))`
  enforces the rule, documents it in `/docs`, puts a padlock on the endpoint in
  the Swagger UI, and hands the route a typed object. The logic is written once,
  so it cannot drift between routes.
- **`core/` knows nothing about HTTP.** `security.py` would work unchanged
  behind a CLI or a background worker.
- **`services/` never raises `HTTPException`.** It takes plain arguments and
  returns plain objects, so the same function can serve a route today and a
  scheduled job tomorrow.
- **`schemas/` is separate from `data/`.** The shape you store and the shape you
  publish start out identical and then diverge — the moment there is a password
  column, a response model that mirrors the table becomes a leak.
- **`v1/` is a folder, not a suffix.** When v2 changes a response shape, v1 keeps
  answering its existing clients from these files, untouched.

## What is deliberately not production-ready

Called out because a teaching repo that quietly models bad practice is worse
than no repo:

- **Passwords are hardcoded in plaintext** in `core/config.py`. A real service
  stores a bcrypt or argon2 *hash*, so that a database leak does not hand over
  every account.
- **The JWT secret has a default.** Real deployments must supply
  `NUTSHELL_JWT_SECRET` and fail to start without it.
- **The rate limiter lives in one process's memory.** Run two workers and each
  gets its own counter, so the effective limit doubles. Shared state (Redis) is
  the real answer.
- **`cors_origins` is `["*"]`.** Safe *only* because this API uses no cookies —
  credentials travel in headers the page attaches explicitly. Add cookie auth and
  this must become a real list, because browsers reject `*` alongside
  `allow_credentials=True`.
- **The rate limiter keys on `request.client.host`.** Behind a proxy that is the
  proxy's IP and every user shares one bucket; a real deployment reads
  `X-Forwarded-For`, and trusts it only from a known proxy.

## Configuration

Every value in `core/config.py` can be overridden by an environment variable
prefixed `NUTSHELL_`, or by a `.env` file in this directory:

```bash
NUTSHELL_JWT_SECRET=something-long-and-random
NUTSHELL_API_KEY=your-own-key
NUTSHELL_RATE_LIMIT_REQUESTS=3
NUTSHELL_RATE_LIMIT_WINDOW_SECONDS=20
```
