"""The "database".

A list of dicts standing in for a real table. It lives in its own module
for one reason: every other layer can then pretend it is a database. The
service layer queries it, the endpoint layer never touches it, and the
day this becomes Postgres the only file that changes is this one and the
body of the service functions -- not a single route.

That separation is the whole point of the folder tree around it. In a
real project this file would be replaced by SQLAlchemy models plus a
session dependency, and the shape of everything above would hold.
"""

PRODUCE: list[dict] = [
    {"id": 1, "name": "Apple", "kind": "fruit", "color": "red", "season": "autumn", "price_per_kg": 2.40},
    {"id": 2, "name": "Banana", "kind": "fruit", "color": "yellow", "season": "all", "price_per_kg": 1.90},
    {"id": 3, "name": "Strawberry", "kind": "fruit", "color": "red", "season": "spring", "price_per_kg": 8.50},
    {"id": 4, "name": "Blueberry", "kind": "fruit", "color": "blue", "season": "summer", "price_per_kg": 12.00},
    {"id": 5, "name": "Orange", "kind": "fruit", "color": "orange", "season": "winter", "price_per_kg": 2.10},
    {"id": 6, "name": "Grape", "kind": "fruit", "color": "purple", "season": "autumn", "price_per_kg": 4.30},
    {"id": 7, "name": "Lemon", "kind": "fruit", "color": "yellow", "season": "winter", "price_per_kg": 3.20},
    {"id": 8, "name": "Peach", "kind": "fruit", "color": "orange", "season": "summer", "price_per_kg": 3.80},
    {"id": 9, "name": "Pear", "kind": "fruit", "color": "green", "season": "autumn", "price_per_kg": 2.60},
    {"id": 10, "name": "Cherry", "kind": "fruit", "color": "red", "season": "summer", "price_per_kg": 9.40},
    {"id": 11, "name": "Carrot", "kind": "vegetable", "color": "orange", "season": "all", "price_per_kg": 1.20},
    {"id": 12, "name": "Spinach", "kind": "vegetable", "color": "green", "season": "spring", "price_per_kg": 3.50},
    {"id": 13, "name": "Tomato", "kind": "vegetable", "color": "red", "season": "summer", "price_per_kg": 2.80},
    {"id": 14, "name": "Aubergine", "kind": "vegetable", "color": "purple", "season": "summer", "price_per_kg": 3.10},
    {"id": 15, "name": "Broccoli", "kind": "vegetable", "color": "green", "season": "autumn", "price_per_kg": 2.90},
    {"id": 16, "name": "Pumpkin", "kind": "vegetable", "color": "orange", "season": "autumn", "price_per_kg": 1.60},
    {"id": 17, "name": "Leek", "kind": "vegetable", "color": "green", "season": "winter", "price_per_kg": 2.20},
    {"id": 18, "name": "Beetroot", "kind": "vegetable", "color": "purple", "season": "winter", "price_per_kg": 1.80},
    {"id": 19, "name": "Cauliflower", "kind": "vegetable", "color": "white", "season": "autumn", "price_per_kg": 2.70},
    {"id": 20, "name": "Pepper", "kind": "vegetable", "color": "red", "season": "summer", "price_per_kg": 4.10},
]
