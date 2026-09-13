"""Cross-cutting concerns: configuration, credentials, rate limiting.

Nothing in here knows about HTTP. That is the rule that keeps it
reusable -- security.py would work unchanged behind a CLI or a worker.
"""
