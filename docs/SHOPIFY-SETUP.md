# Shopify Go-Live — Activation Guide

The site ships with a dormant Shopify Storefront API integration in `store.js`. Until activated, "Checkout" shows a first-batch waitlist notice that routes visitors to the Spice Ledger email capture — no dead ends, no fake checkout.

## To activate

1. **Create the products in Shopify admin** (7 items):
   - Five jars at $18: The Silk Road, Kyoto Garden, Persian Sunrise, North African Night Market, Caribbean Sunset
   - Spice Sage Monthly ($39, subscription via Shopify Subscriptions or a selling-plan app)
   - Spice Sage Quarterly ($99, same)
2. **Create a custom app** (Settings → Apps → Develop apps) with Storefront API scopes: `unauthenticated_read_product_listings`, `unauthenticated_write_checkouts`. Copy the **Storefront access token** (this token is public-safe by design).
3. **Copy each variant's GID** (`gid://shopify/ProductVariant/1234567890`) into the matching `shopifyVariantId` in `store.js`.
4. **Add the config snippet** to every page, before the `store.js` include:
   ```html
   <script>
     window.TREVEAN_CONFIG = {
       shopifyDomain: 'trevean-spice.myshopify.com',
       storefrontToken: 'shpat_xxx-public-storefront-token',
       emailEndpoint: ''   // optional: Sender.net / form endpoint for Spice Ledger
     };
   </script>
   ```
5. Done. Checkout now calls `cartCreate` on the Storefront GraphQL API (2025-07) and hands off to Shopify's hosted checkout — cart drawer, inventory, taxes, and payments all ride Shopify rails. If the API call fails the UI degrades back to the waitlist notice.

## Email capture

`emailEndpoint` receives `POST {email, source}` as JSON. Until it's set, signups are stored in `localStorage` under `trevean_ledger_signups` (visible in DevTools) so pre-launch interest isn't lost — export before launch.

## Analytics

All commerce events (`add_to_cart`, `cart_open`, `begin_checkout`, `checkout_waitlist_shown`, `email_signup`, `blend_view`, `tap_demo_open`) push to `window.dataLayer`, GTM-ready.
