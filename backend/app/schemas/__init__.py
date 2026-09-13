"""Pydantic models describing what goes over the wire.

Separate from any database model on purpose. The shape you store and the
shape you publish start out identical and then diverge -- the moment you
add a password column, a response model that mirrors the table becomes a
leak. Keeping them apart from day one costs one file.
"""
