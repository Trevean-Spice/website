# Trevean Spice — Design System
*The visual language is "candlelit apothecary": dark, warm, editorial. Apple's restraint, Patagonia's conviction, a luxury spice house's materials.*

## Color tokens

| Token | Hex | Use |
|-------|-----|-----|
| `base` | `#1A1511` | Page background |
| `surface` | `#241E19` | Section alternation, cards' parent |
| `elevated` | `#302823` | Cards |
| `floating` | `#3D332C` | Highest surfaces |
| `cream` | `#F0E4D4` | Primary text |
| `muted` | `#A89888` | Secondary text |
| `silk-road` | `#8B2635` | Blend accent + primary CTA gradient |
| `kyoto` | `#6B8F71` | Blend accent + "fresh/positive" |
| `persian` | `#9B7B6B` | Blend accent |
| `night-market` | `#C4973B` | Blend accent + the brand's gold highlight |
| `caribbean` | `#7B3F5E` | Blend accent |

Rules: never flat black/white; every section gets layered radial gradients at 5–12% opacity; the SVG grain overlay (3%) sits over everything. Blend pages re-theme via `--accent` / `--accent-rgb` custom properties.

## Typography

- **Display:** Playfair Display, medium, tracking `-0.03em` on h1, `-0.02em` on h2. Italic + gold for the emphasized word ("Know your *spice*.").
- **Body:** DM Sans, 300–600, line-height 1.7, generous max-widths (`max-w-lg` to `max-w-2xl`).
- **Accent:** Cormorant Garamond italic — pull quotes and testimonials only.
- Eyebrows: 11–12px DM Sans, uppercase, tracking `0.2em`, muted.

## Motion

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` everywhere (spring-like, no bounce).
- Only `transform` and `opacity` animate. Never `transition-all`.
- Scroll reveals: `.reveal` → `.in` via IntersectionObserver (threshold ~0.18), 28px rise, staggered `reveal-d1/d2/d3`.
- Signature moments: hero spice-particle canvas (paused offscreen, killed under `prefers-reduced-motion`), NFC pulse rings, SVG line-draw on the decay chart, journey progress rail tied to scroll, 9s phone-demo keyframe loop, pointer-tracked card lighting.
- Every interactive element has hover, focus-visible (2px gold outline, 4px offset), and active states.
- All of it degrades under `prefers-reduced-motion: reduce`.

## Components

- **Buttons:** `.btn-primary` (silk-road gradient, uppercase, letter-spaced) / `.btn-outline` (hairline, gold on hover).
- **Cards:** `.blend-card` — elevated surface, image with gradient + accent multiply overlay, hover lift `-6px` + scale 1.01 + pointer light.
- **Cart drawer:** right slide-in 420px, `tv-` prefixed classes, injected by `store.js` — include `<span data-tv-cart-button></span>` in any nav.
- **Wave divider:** animated SVG strands between major sections — echoes the label artwork.
- **Forms:** `.ledger-input` pattern; success state swaps controls for a single confirmation line.

## Voice in UI copy

Direct, sensory, zero corporate filler. Headlines make claims ("Most spices are dead on arrival"), body copy proves them with specifics (names, dates, coordinates). The growers are always named. The phrase pattern "Tap the lid…" is the recurring CTA hook for traceability.
