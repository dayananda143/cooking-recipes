---
name: Cooking Recipes
description: A household recipe box built for fast lookup while actually cooking.
colors:
  toasted-orange: "#f97316"
  toasted-orange-deep: "#ea580c"
  warm-linen: "#fff7ed"
  paper-white: "#ffffff"
  surface-charcoal: "#1f2937"
  ink-charcoal: "#111827"
  ink-near-black: "#030712"
  hairline-gray: "#f3f4f6"
  border-gray: "#e5e7eb"
  muted-gray: "#9ca3af"
  secondary-text-gray: "#6b7280"
  semantic-success: "#16a34a"
  semantic-warning: "#ca8a04"
  semantic-danger: "#dc2626"
  semantic-info: "#3b82f6"
typography:
  display:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  headline:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.toasted-orange}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.toasted-orange-deep}"
  chip-active:
    backgroundColor: "{colors.toasted-orange}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  chip-inactive:
    backgroundColor: "{colors.hairline-gray}"
    textColor: "{colors.secondary-text-gray}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
---

# Design System: Cooking Recipes

## 1. Overview

**Creative North Star: "The Family Recipe Box"**

This is the digital version of the index-card box on the kitchen counter: a little worn at the edges of use, never at the edges of trust. Every screen exists to answer one question fast — "what am I cooking, and what do I need" — so the design favors quiet legibility over decoration. One accent color (toasted orange) carries warmth; everything else is restrained charcoal-on-paper so the recipe content, not the chrome, is the thing you look at.

It explicitly rejects generic SaaS dashboard density (data tables, KPI tiles, sidebar-heavy chrome dressed up as a "tool"), recipe-blog clutter (ads, preambles, popups between you and the ingredient list), and playful/gamified consumer-app styling (badges, confetti, mascots) — this is a daily-use household object, not a marketing surface.

**Key Characteristics:**
- One accent (toasted orange), used deliberately and sparingly — never as a background wash.
- Flat list rows for sequential data (units, categories); elevation (shadow) reserved for things that are genuinely a card — recipe tiles, dialogs, dropdowns.
- Warm-tinted shadows (burnt-orange rgba, not flat black) so elevation reads as part of the same palette, not a generic UI-kit default.
- One destructive-confirmation pattern, one motion vocabulary, reused everywhere rather than invented per screen.

## 2. Colors

A single warm accent against a charcoal-on-paper neutral base; semantic status colors are used only where they carry real meaning (difficulty, public/private, destructive actions).

### Primary
- **Toasted Orange** (#f97316): the one accent. Primary buttons, active nav/tab/filter state, focus rings, brand mark. Used on a deliberately small percentage of any given screen — its rarity is what makes it register as "the" action color.
- **Deep Toasted Orange** (#ea580c): hover/active state for the primary accent. Always a one-step darken, never a hue shift.

### Neutral
- **Paper White** (#ffffff): primary surface — cards, dialogs, light-mode page background.
- **Warm Linen** (#fff7ed): the login screen's wash background only — the one place a tinted neutral is used instead of pure white, to signal "outside the app" before you're in.
- **Charcoal Ink** (#1f2937 / #111827): heading and primary body text; also the dark-mode surface color (inverted role).
- **Near-Black** (#030712): dark-mode page background.
- **Hairline Gray** (#f3f4f6 / #e5e7eb): borders and dividers on flat list rows, inactive chip backgrounds.
- **Muted Gray** (#9ca3af / #6b7280): secondary/supporting text — timestamps, counts, placeholder copy.

### Semantic Status Colors
- **Success Green** (#16a34a): "easy" difficulty, public-recipe badge.
- **Warning Amber** (#ca8a04): "medium" difficulty.
- **Danger Red** (#dc2626): "hard" difficulty, destructive actions (delete icon, delete confirm button).
- **Info Blue** (#3b82f6): edit action only — kept distinct from the primary accent so "edit" never competes visually with "the" primary action.

### Named Rules
**The One Accent Rule.** Toasted Orange is the only saturated brand color on any screen. Status colors (green/amber/red/blue) are functional, not decorative, and never substitute for the primary accent on a CTA.

## 3. Typography

**Display/Body Font:** Outfit (with `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif` fallback) — one geometric sans across the whole interface, no second family.

**Character:** A single warm geometric sans, used in multiple weights instead of pairing fonts — keeps the "tidy and editorial" register without introducing a second voice the household has to parse.

### Hierarchy
- **Display** (700, 1.875rem/30px, 1.2 line-height): recipe detail title — the one place type is allowed to feel like a headline.
- **Headline** (700, 1.5rem/24px, 1.3 line-height): page titles ("All Recipes", "Units", "Ingredient Categories").
- **Title** (600, 0.875rem/14px, 1.4 line-height): section labels inside forms and cards ("Basic Info", "Ingredients").
- **Body** (400, 0.875rem/14px, 1.6 line-height): list rows, descriptions, form inputs. Capped informally by container width, not a hard ch limit — recipe descriptions are short by nature.
- **Label** (500, 0.75rem/12px, 1.4 line-height): metadata, counts, badges, timestamps.

### Named Rules
**The One Family Rule.** Outfit covers every role via weight (400/500/600/700/800), never a second typeface. If a future screen needs more contrast than weight provides, that's a signal to revisit this rule deliberately, not to quietly add a serif.

## 4. Elevation

This system is **hybrid**: most surfaces are flat with a 1px hairline border (sequential list rows — units, categories, category types), while genuine "floating" surfaces (recipe cards, modals, dropdowns) carry a warm-tinted shadow instead of the flat-black Tailwind default. The tint (burnt-orange rgba, not gray-black) keeps elevation feeling like it belongs to this palette rather than a generic component-library default.

### Shadow Vocabulary
- **`shadow-card`** (`0 1px 3px 0 rgba(154,52,18,0.08), 0 1px 2px -1px rgba(154,52,18,0.06)`): resting state for recipe grid cards, stat tiles, and the active "new/edit" form panel.
- **`shadow-card-hover`** (`0 4px 12px -2px rgba(154,52,18,0.12), 0 2px 4px -2px rgba(154,52,18,0.08)`): hover lift for recipe cards, and the resting state for the recipe hero image.
- **`shadow-card-lg`** (`0 12px 32px -8px rgba(154,52,18,0.18), 0 4px 12px -4px rgba(154,52,18,0.1)`): modals (delete confirmation), the header user-menu dropdown, and the login card — anything that floats above the whole page.

### Named Rules
**The Earned Elevation Rule.** A shadow only appears where something is genuinely a card (clickable, draggable, or modal). Sequential rows in a list (units, category types, ingredient categories) get a hairline border instead — never both a border and a shadow on the same flat row.

## 5. Components

### Buttons
- **Shape:** 8px radius (`rounded-lg`).
- **Primary:** Toasted Orange background, white text, hover → Deep Toasted Orange, `active:scale-95` to `active:scale-[0.98]` press feedback on every button in the system (no exceptions).
- **Ghost/Icon:** transparent background, muted-gray icon, hover → tinted background matching the icon's semantic color (e.g. red-50 wash under a delete icon), same active-scale press feedback.

### Chips (Filter Pills)
- **Style:** fully rounded (`rounded-full`), small label-weight text.
- **State:** active = Toasted Orange fill + white text; inactive = Hairline Gray fill + secondary-gray text, hover darkens the gray one step. Never more than one chip group's "active" pops with the primary accent at a time per screen.

### Cards
- **Recipe grid card:** 12px radius (`rounded-xl`), Paper White surface, `shadow-card` resting / `shadow-card-hover` on hover, image scales 1.05x on hover over 300ms ease-out.
- **Flat list row** (units, categories, category types): 12px radius, Paper White surface, 1px Hairline Gray border, **no shadow** — see Elevation's Earned Elevation Rule.

### Inputs / Fields
- **Style:** 8px radius, gray-300 border, Paper White background.
- **Focus:** 2px Toasted-Orange-tinted ring (`focus:ring-2 focus:ring-orange-400`), no border-color change — the ring carries the entire focus signal.

### Navigation
- **Style:** dark Charcoal sidebar (gray-900), white text. Inactive links are muted gray on transparent; active link gets a solid Toasted Orange fill, not just a text-color change. Mobile collapses to an off-canvas drawer (iOS-style `cubic-bezier(0.32, 0.72, 0, 1)` easing) with a fading scrim behind it.

### Confirm Dialog (signature component)
A single shared component used for every destructive action in the app (delete recipe, unit, category, category type) — backdrop fades, panel pops in from `scale(0.95)` (never `scale(0)`), centered `transform-origin` since it's not anchored to a trigger. Danger variant uses red for the confirm button; everything else about it stays identical regardless of which screen invoked it.

## 6. Do's and Don'ts

### Do:
- **Do** keep Toasted Orange (#f97316) as the only saturated accent on any screen — buttons, active states, focus rings.
- **Do** use a hairline border (1px, #f3f4f6/#e5e7eb) on flat sequential list rows instead of a shadow.
- **Do** tint shadows toward burnt-orange (rgba(154,52,18,...)) rather than flat black, on every card/modal/dropdown.
- **Do** give every pressable element `active:scale` feedback (0.90–0.98 depending on size) — no exceptions.
- **Do** reuse the single shared Confirm Dialog component for any destructive action; never a second bespoke dialog or a native `confirm()`.
- **Do** respect `prefers-reduced-motion` globally (already collapses animation/transition duration to near-zero).

### Don't:
- **Don't** introduce generic SaaS dashboard density — data tables, KPI stat tiles, sidebar-heavy admin chrome. This is a cookbook, not an analytics tool (per PRODUCT.md anti-references).
- **Don't** add recipe-blog clutter — ads, preambles, popups — anywhere between opening the app and seeing ingredients/steps.
- **Don't** add playful/gamified styling — badges, confetti, mascots, novelty icons — too cute for a daily household tool.
- **Don't** pair a border and a shadow on the same flat list row (the "ghost-card" tell).
- **Don't** use `scale(0)` as an entrance animation starting point — always `scale(0.95)` or higher, combined with opacity.
- **Don't** introduce a second typeface. Outfit covers every weight the system needs.
- **Don't** use `window.confirm()` / `window.alert()` for any in-app confirmation or error — always the styled dialog or toast.
