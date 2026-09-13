"""A fixed-window rate limiter, in memory.

Deliberately about thirty lines, because the concept is worth showing in
full rather than importing. A production service reaches for Redis --
not because the algorithm is harder, but because this dict lives inside
one process: run two uvicorn workers and each gets its own counter, so
the effective limit doubles. That caveat is the lesson, and it is why
the real answer is shared state.

"Fixed window" means the clock resets on a schedule rather than sliding.
It is the simplest correct-enough approach, and its known flaw is worth
a sentence on a slide: a caller who spends their whole budget at the end
of one window and again at the start of the next gets double the limit
for a moment. Sliding-window and token-bucket exist to smooth that.
"""

import time
from dataclasses import dataclass, field
from threading import Lock


@dataclass
class Verdict:
    allowed: bool
    limit: int
    remaining: int
    reset_after: int


@dataclass
class FixedWindowLimiter:
    limit: int
    window_seconds: int
    # (window_started_at, count) per caller.
    _hits: dict[str, tuple[float, int]] = field(default_factory=dict)
    _lock: Lock = field(default_factory=Lock)

    def check(self, key: str) -> Verdict:
        """Count one request against `key` and say whether it is allowed.

        Locked because uvicorn can interleave requests: read-modify-write
        on a shared dict without one is a lost-update waiting to happen,
        and a rate limiter that occasionally forgets a request is not
        much of a rate limiter.
        """
        now = time.monotonic()
        with self._lock:
            started_at, count = self._hits.get(key, (now, 0))

            if now - started_at >= self.window_seconds:
                started_at, count = now, 0

            reset_after = max(0, int(self.window_seconds - (now - started_at)) + 1)

            if count >= self.limit:
                # Refused requests do not extend the window; the caller
                # should not be punished for knocking.
                self._hits[key] = (started_at, count)
                return Verdict(False, self.limit, 0, reset_after)

            count += 1
            self._hits[key] = (started_at, count)
            return Verdict(True, self.limit, self.limit - count, reset_after)
