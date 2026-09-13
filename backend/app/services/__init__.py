"""Business logic, with no knowledge of HTTP.

A service function takes plain arguments and returns plain objects. It
never raises HTTPException and never touches a Request -- that way the
same function serves a route today and a scheduled job tomorrow.
"""
