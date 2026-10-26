# Product form + inventory setup (no code after this)

If you set this up before, **replace** Code.gs and Form.html with the new ones, then Run `setup` again (it adds a `stock` column). Then Deploy > **Manage deployments** > pencil icon > Version: **New version** > Deploy. The Web app URL stays the same.

## First-time setup
1. Create a Google Sheet. Extensions > Apps Script. Paste all of `Code.gs`.
2. Change `PASSCODE` at the top to your own secret word.
3. Add an HTML file named exactly `Form` and paste all of `Form.html`.
4. Pick `setup` in the function dropdown and **Run** (approve Sheets and Drive access).
5. Deploy > New deployment > **Web app**. Execute as **Me**. Access **Anyone**. Copy the Web app URL: that is your **product form**. Share it and the passcode only with people who may edit products.

## Connect the website
In `index.html` CONFIG set `catalogUrl:"<your Web app URL>"` and redeploy the site once. The website reads `<URL>?action=catalog`, which returns availability only (no quantities). You do **not** need to publish the Sheet to the web.

## Using the form
- Pick the collection, enter name, price (USD), photo.
- Kurta / Ethnic Suits and Coord Sets: enter the quantity for each size (leave blank if you do not offer that size, 0 if sold out).
- All other collections: one quantity.
- Manage section: change quantities when you restock or after a sale and press Save. Set Status to Hidden to remove an item.
- Customers never see numbers. A size at 0 is greyed out; when every size (or the single quantity) is 0 the product shows **Sold out** and cannot be added to the bag.

## Important: stock does not drop by itself
Orders are confirmed on WhatsApp, so the website cannot know a sale really happened. After you confirm an order, open the form and reduce the quantity. (Automatic reduction is possible with Shopify checkout, which reports paid orders; ask if you want that.)

## Notes
- Photos load through Drive thumbnail links. If they ever stop loading, host the image elsewhere and paste its link into the `image` column.
- The Sheet itself stays private; only the catalogue endpoint is public.
