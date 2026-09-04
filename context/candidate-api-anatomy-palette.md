# Candidate API Anatomy — Color Palette

Reference for reproducing this look in PowerPoint (or anywhere else). Source: `candidate-api-anatomy.html` in this same folder.

Every color below is used at **100% opacity** — no transparency/alpha blending anywhere in the template.

## Category colors (fill + text pairs)

Each category is one hue: a pale tint as the solid box fill, and a fully-saturated dark shade of the same hue as the text color on top of it.

| Category | Fill (hex) | Fill (RGB) | Text (hex) | Text (RGB) |
|---|---|---|---|---|
| Method | `#ece3fc` | 236, 227, 252 | `#5b21b6` | 91, 33, 182 |
| Endpoint | `#dbeafe` | 219, 234, 254 | `#1d4ed8` | 29, 78, 216 |
| Header | `#dcf5e2` | 220, 245, 226 | `#15803d` | 21, 128, 61 |
| Status | `#dcf5e2` | 220, 245, 226 | `#15803d` | 21, 128, 61 |
| Body | `#ffe7cf` | 255, 231, 207 | `#b3540a` | 179, 84, 10 |

Note: Header and Status intentionally share the exact same green — both represent response/request metadata as one visual family.

## Deck extension — fifth color ("Where to go next")

Not part of the original `candidate-api-anatomy.html` template — added for the "API in a Nutshell" slide deck, which needed a fifth hue once its "Where to go next" closing section split off from the "API at Scale" (body/orange) family. Same pairing rule as above: pale tint fill, saturated dark text, same hue.

| Category | Fill (hex) | Fill (RGB) | Text (hex) | Text (RGB) |
|---|---|---|---|---|
| Next | `#ffe1ec` | 255, 225, 236 | `#be123c` | 190, 18, 60 |

## Neutral / chrome colors

| Role | Hex | RGB | Used for |
|---|---|---|---|
| Background | `#ffffff` | 255, 255, 255 | Page and panel background |
| Border | `#e3e3e8` | 227, 227, 232 | 1px hairlines around panels and legend chips |
| Text primary | `#16171c` | 22, 23, 28 | Headings, uncategorized body text |
| Text secondary | `#6b6b76` | 107, 107, 118 | Subtitle, panel-head labels, legend descriptions |
| Text tertiary | `#97979f` | 151, 151, 159 | Eyebrow label, legend title |

## Pattern to reuse

- Solid fills only — no gradients, no opacity blending. If a lighter/darker variant is needed, pick a new solid tint rather than adding transparency.
- Pairing rule: pale tint (~90–95% lightness) for fill, saturated dark shade (~35–45% lightness) of the *same* hue for text on top of it — that's what keeps each category legible without a border.
- One hue = one category. Don't reuse a hue for two unrelated categories (Header/Status share green on purpose, because they're the same family, not by coincidence).

## Quick swatch list

For pasting into PowerPoint's "recent colors":

1. `#ffffff` — background
2. `#16171c` — primary text
3. `#5b21b6` / `#ece3fc` — method (purple)
4. `#1d4ed8` / `#dbeafe` — endpoint (blue)
5. `#15803d` / `#dcf5e2` — header / status (green)
6. `#b3540a` / `#ffe7cf` — body (orange)
7. `#be123c` / `#ffe1ec` — next (rose, deck extension)

## Fonts (not color, but part of the look)

- **Sans** (headings, labels): -apple-system, Segoe UI, Helvetica Neue, Arial
- **Mono** (code/data values): ui-monospace, Cascadia Code, SF Mono, Consolas
