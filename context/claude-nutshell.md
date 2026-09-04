# Claude Nutshell

My version of the plan in [nutshell.md](nutshell.md). Same bones, resequenced, with the redundancy squeezed out.

**Assumptions I made** (change these and the plan changes):
- 60 minutes, one speaker, colleagues who will *consume* APIs far more often than build them.
- One API used from the first slide to the last, per your own context note.
- The audience knows what a URL is and has seen JSON without knowing its name.

**Thesis** — the one sentence the room should leave with:
> An API is a contract: you send a structured request to an address, you get a structured answer back, and everything else in this talk is a clause of that contract.

---

## The plan

### 0°/ Cold open — 4 min

- **Live call, no context** — paste a URL in the browser, show the raw JSON, say nothing about what it is.
- **Ask the room** — "who has seen this before / who can tell me what it means?"
- **Promise** — "in an hour, every character on this screen will be boring to you."
- **Then** the background slide (who you are, why this dataschool).

> Your plan opens on Background → definition → metaphore. Hooking first buys you the attention to spend on the definition.

### 1°/ Kesako & why care — 9 min

- **Raw definition** — Application Programming Interface: a connection between programs. One line, move on.
- **The cable metaphore** — keep it exactly as you wrote it; it's the best asset in the deck.
- **Cut the metaphore's second half** — "different cables for different outlets" is the same point as *styles* in §3. Say it once, there.
- **The restaurant-app story** — keep. It lands the two reasons to call an API: *borrow data*, *borrow logic*.
- **Two named examples** — Google Maps (borrow data) and an LLM endpoint (borrow logic). Drop the weather app here; it's redundant with Maps and you'll want it later.
- **JSON in 90 seconds** — one object, one array, one nested value. Point at the cold-open payload.
- **Where a web API lives** — *one* slide: your machine → HTTP → their machine. No OSI layers, no 7-row diagram.

> TCP/IP is the biggest time trap in your current plan. The audience needs "HTTP is the language, the internet is the wire" and nothing more. Put the OSI slide in the appendix for whoever asks.

### 2°/ Anatomy of a call — 14 min ← the core

- **Two-column layout** — request on the left, response on the right, one component highlighted at a time.
- **Request: method** — CRUD reminder, GET/POST/PUT/DELETE, four lines.
- **Request: endpoint** — the address; routes vs nested routes (`/users` → `/users/{id}` → `/users/{id}/repos`).
- **Request: parameters** — path vs query, and what each is *for*.
- **Request: headers** — the metadata envelope; name-drop `Authorization` and `Accept` now so §5 is free.
- **Response: status** — 2xx / 4xx / 5xx as three buckets. "4xx is your fault, 5xx is theirs."
- **Response: headers** — show a real `X-RateLimit-Remaining` so §4 has something to point back at.
- **Response: body** — the JSON from the cold open, now annotated.
- **Hands-on, 4 min** — everyone makes one call, their own way (browser, Postman, curl, Excel, whatever).

> Anatomy before styles. You cannot compare REST and GraphQL with a room that hasn't seen a single request. Your plan has styles first — that's the one ordering change I'd insist on.

> The hands-on belongs *here*, not at the end. Attention peaks mid-talk, and every later section becomes "remember that thing you just did".

### 3°/ Styles — 5 min

- **REST** — the default; resources as URLs, HTTP verbs as actions. This is what they'll meet 95% of the time.
- **GraphQL** — one endpoint, the client asks for the exact fields it wants.
- **gRPC** — binary instead of JSON, machine-to-machine, fast and unreadable.
- **SOAP** — one sentence, said with pity, so they recognise it in legacy docs.
- **The takeaway** — different cables, same electricity. Callback to §1.

> Frame it as *"what changes between styles"* using the components from §2 — the body's format, the endpoint's shape. That's how the section earns its place instead of being trivia.

### 4°/ The contract's clauses (features) — 9 min

- **Rate limiting** — the API's speed limit. Teach it **once, here**, in full.
- **Pagination** — you don't get 10,000 rows; you get page 1 of 200.
- **Versioning** — `/v1/` vs `/v2/`, and why the API you integrated last year still works.
- **Idempotency** — calling twice must not charge twice. One concrete money example.
- **Content negotiation** — optional; cut first if you're behind.
- **HATEOAS** — do not teach here. It goes in §7 as an aside.

> **This fixes the biggest structural problem in your plan.** Rate limiting currently appears three times (§2 features, §3 security, §4 performance) and pagination twice. Teach each mechanism once, then in later sections spend *one sentence* on the new lens: "rate limiting, which you've met, is also how they stop an attacker" / "…and how they keep the service up on Black Friday."

### 5°/ Who are you, and what may you do — 10 min

- **The two questions** — authentication = *who are you*; authorization = *what may you do*. Say it once, clearly, and the whole section unlocks.
- **401 vs 403** — the two questions made visible in status codes. Best single slide of the section.
- **API key** — a password in a header. Show it.
- **API key golden rules** — never in a URL, never in git, never in front-end code. This is the slide with real-world consequences for your colleagues.
- **JWT** — a signed badge that carries claims; the server doesn't need to look you up.
- **Key vs token comparison table** — keep, as you planned.
- **OAuth** — the "Sign in with Google" flow, in a 4-arrow sequence diagram. Don't go deeper.
- **RBAC vs ABAC** — one line each. Role = *who you are*. Attribute = *what's true right now*.
- **Skip** the "call that fails with a key but works with a JWT" demo — you flagged it as maybe-too-much-work, and you're right. Use a 401 screenshot instead.

> This is the section your audience will actually be held to at work. If you overrun anywhere, overrun here and take the time from §6.

### 6°/ When it has to scale — 6 min

- **Reframe as the consumer's view** — "what do the API's limits mean for *my* integration?" rather than an infra tour.
- **Caching** — don't ask twice for the same unchanged answer.
- **Compression** — same data, fewer bytes on the wire.
- **API gateway** — one front door: routing, load balancing, rate limits, auth, logs. Introduce it as *the box that does most of §4 and §5 for you*.
- **Cut** — database indexing, performance testing, monitoring. They're real, and they belong to whoever builds the API, not this room.

> Your §4 currently re-lists rate limiting and pagination under "contract". Replace that with one callback slide: same clauses, now read from the provider's side.

### 7°/ Where to go next — 3 min

- **API vs URL** — a URL is an address; an API is the contract at that address.
- **API vs SDK** — the SDK is the API wrapped in your language, so you stop writing HTTP by hand.
- **API vs MCP** — the API is for your code; MCP is for an LLM to discover and call tools on its own. **Give this one the most airtime** — it's the question you'll actually get in 2026.
- **HATEOAS, as an aside** — the response tells you what you can do next. Then your own note as the closer: *"the web is RESTful; most 'REST APIs' aren't."* That's a good line to end on.
- **Integration patterns & frameworks** — a slide of names, marked "next dataschool". No teaching.

---

## Running example: my recommendation

Use **the GitHub REST API** as the spine, because a single API demonstrates almost every section for free and with no signup:

- `GET https://api.github.com/users/Nohalito` — the cold open. Works in a browser, no key.
- `.../users/Nohalito/repos?per_page=5&page=2` — path params, query params, nested routes, pagination.
- Response headers carry `X-RateLimit-Limit: 60` — rate limiting you can *see*.
- Add an `Authorization: Bearer` token → the same call jumps to 5000/hour. **Authentication as a visible, live upgrade** — that's your §5 demo, and it costs you one token.
- Hit a private repo without rights → 403 next to 401. Auth vs authz, live.

Keep **open-meteo.com** (no key, no signup, works in any browser) as the hands-on API so nobody is blocked by credentials in those 4 minutes.

## Cut list, in the order I'd cut

1. OSI / TCP-IP layers → appendix
2. Content negotiation
3. Performance infra beyond caching + gateway
4. RBAC/ABAC detail (keep the one-liners)
5. Integration patterns → next dataschool
6. Implementation frameworks → a slide of logos
7. Documentation tooling (Swagger/Postman/OpenAPI) → **you already cut this from nutshell.md; I agree, but be ready for the question**

## What I'd worry about

- **Section 2 will overrun.** It's eight components in fourteen minutes. Rehearse it with a timer; it's the section worth rehearsing.
- **The hands-on can die on corporate proxies.** Have the response pre-screenshotted, and one volunteer's screen shared as the fallback.
- **Mixed audience.** If engineers are in the room, they'll pull you toward §3 and §6. Park those questions out loud — "that's the next dataschool" — rather than following them.