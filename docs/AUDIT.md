# Trevean Spice Website — Repository Audit
*2026-06-11 · audited against the agency creative brief*

## What the repo was

A zero-build static site (4 HTML pages, Tailwind CDN, inline styles) deployed to Vercel as raw static files (`vercel.json` disables install/build). Brand assets, blend artwork, and label PDFs live at the repo root. The standout piece of engineering was `blend.html`: a single data-driven template that renders five per-blend landing pages (`blend.html?blend=<slug>`) designed as NFC/QR tap destinations — freshness math, origin map, grower profile, recipes, analytics stub. That architecture was preserved and extended, not replaced.

## Critical findings (all fixed)

| # | Finding | Fix |
|---|---------|-----|
| 1 | **Three referenced images were never committed** (`Screenshot 2026-03-06 *.png`) — broken images on the homepage Kyoto/Night Market/subscription cards and in three blend galleries | Re-mapped to committed assets |
| 2 | **Pricing contradicted the business** — site showed $45/mo and $120/qtr; Spice Sage is $39/mo or $99/qtr | Corrected sitewide ($18/jar kept — consistent with the $15–25 brand range) |
| 3 | **Foreign brand mark on the homepage** — `Along_the_Golden_Route_version_2.png` has "ANCIENT SPICE CO." baked into the art | Pulled from use; clean middle band cropped to `silk-road-dunes.png` |
| 4 | **No commerce at all** — every "Add to Cart" button was dead; "Subscribe Now" linked to the shop page | Shared commerce layer (`store.js`): working cart drawer, localStorage persistence, Shopify Storefront API scaffold, waitlist fallback |
| 5 | **No email capture** anywhere | "Join the Spice Ledger" section + local capture + endpoint config |
| 6 | **No SEO** — no meta descriptions, OG tags, or structured data | Organization/ItemList/FAQ/Product JSON-LD, OG + canonical on all pages, dynamic per-blend schema |
| 7 | Shop page used placehold.co images despite real art in the repo | Real artwork wired in |
| 8 | Harvest dates on shop cards contradicted blend.html batch data | Aligned to batch data |

## Known debt (intentionally deferred)

- **Tailwind CDN in production** — ~300KB runtime compiler, the single biggest Lighthouse cost. Migrating to compiled CSS is the right move when the site stabilizes; it would also remove the console warning.
- **Image weight** — several PNGs are 5–15MB. They're lazy-loaded, but should be converted to WebP/AVIF with responsive `srcset` before launch. (Repo is ~57MB; consider moving label PDFs and unused art out of the deploy path.)
- **Grower photos are placeholders** (placehold.co) — real photography or commissioned portraits needed; this is the emotional core of the traceability story.
- **All jar renders are Persian Sunrise mockups** — need per-blend label renders from Pulp+Wire for product cards and the shop page.
- **`CLAUDE.md` references another machine** (Windows paths, `frontend-design` skill) — from the original kit author's environment; harmless but stale.
- **Root-level assets with spaces/parens in filenames** — works, but a `assets/` reorg would be cleaner. Deferred to avoid churning 57MB of binaries.

## File map after this round

- `store.js` — new shared commerce/email/reveal layer (see SHOPIFY-SETUP.md)
- `index.html` — rebuilt per brief (hero particles, freshness chart, NFC journey, phone demo, showcase, sustainability, trust, FAQ, ledger)
- `shop.html` — real imagery, working cart, $39/$99 subscription tiers, product schema
- `blend.html` — flavor-profile section added, cart wired, media fixed, per-blend SEO injected
- `about.html` — nav/cart/SEO alignment
- `persian-sunrise-jar.png`, `silk-road-dunes.png` — derived assets (background removal / crop)
