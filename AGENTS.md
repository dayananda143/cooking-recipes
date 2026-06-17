# Agent Notes

## Design Context

Full detail lives in `PRODUCT.md` (strategy) and `DESIGN.md` (visual system). Quick pointer for any agent touching the UI:

- **Register:** product (design serves the app, not a marketing surface)
- **North Star:** "The Family Recipe Box" — a household recipe collection built for fast lookup while actually cooking, not for browsing or admiring
- **The One Accent Rule:** Toasted Orange (`#f97316`) is the only saturated brand color on any screen
- **The One Family Rule:** Outfit covers every typographic role via weight; never a second typeface
- **The Earned Elevation Rule:** shadows only on things that are genuinely a card (recipe tiles, modals, dropdowns); flat list rows get a hairline border instead, never both

Before changing UI, read `DESIGN.md` for exact tokens (colors, shadows, components) and `PRODUCT.md`'s anti-references (no SaaS dashboard density, no recipe-blog clutter, no gamified styling).
