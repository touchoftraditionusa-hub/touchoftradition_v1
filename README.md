# Touch of Tradition — static storefront

No build step. Open `index.html` or deploy this folder as-is.

## Before launch (all in the CONFIG block at the top of the script in index.html)
1. `whatsappNumber` — digits only, with country code (e.g. "14155550123"). WhatsApp ordering does nothing until set.
2. `email`, `instagram` — shown in footer/contact when set.
3. `newsletterEndpoint` — create a free form at formspree.io, paste its URL. Until then signup is an honest demo.
4. `pages` — replace the placeholder About/Shipping/Returns/Privacy/Terms text with your real policies.
5. PRODUCTS — replace sample products, INR/USD prices, colours and images (`assets/img/`).
6. Replace `YOURDOMAIN.com` in robots.txt and sitemap.xml.

## Shopify checkout (optional, recommended for real payments)
1. Create a Shopify store; add products (SKU/price) and enable Markets for India (INR) and United States (USD) so each market's prices are set in Shopify.
2. Add Shopify's **Headless** sales channel (or create a custom app) and copy the **public Storefront API access token**. It is designed to be public; never put an Admin API token in this site.
3. In `index.html` CONFIG set `shopify.domain` ("your-store.myshopify.com") and `shopify.storefrontToken`.
4. For each product in PRODUCTS set `shopifyVariantId` to the variant's ID, in the form `gid://shopify/ProductVariant/1234567890`.
5. Configure payment gateways, shipping and taxes in Shopify admin. Check which gateways Shopify offers for your business country (India often needs a third-party gateway).
Once set, the bag shows **Secure Checkout** (Shopify) and **Order via WhatsApp**. Shopify's prices are the source of truth at checkout; keep PRODUCTS prices in sync.

## Deploy (pick one)
- **Vercel CLI:** `cd site && npx vercel --prod`
- **Vercel/Netlify/Cloudflare Pages via GitHub:** push this folder, import repo, framework "Other", no build command, output dir `/`.
- **Netlify Drop:** drag the folder onto app.netlify.com/drop.
Then add your domain in the platform's Domains settings and set the DNS records they show.

## Not live yet
Online payments (checkout is a WhatsApp-confirmed enquiry), customer accounts, admin, real shipping/tax rules.
