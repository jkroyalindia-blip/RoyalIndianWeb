# Royal Indian Website

Static HTML website for Royal Indian with contact details, product catalog, localStorage cart and checkout confirmation flow.

## Project Structure

- `index.html`, `about.html`, `services.html`, `products.html`, `gallery.html`, `contact.html`, `checkout.html` - website pages
- `Assets/css/style.css` - shared site styles
- `Assets/js/main.js` - navigation, catalog, cart and checkout logic
- `Assets/js/products-data.js` - generated product data from `Products/*.xlsx`
- `Assets/images/` - product images used by the catalog
- `Content/` - source content documents
- `Products/` - source product spreadsheets

## Local Preview

Open `index.html` directly in a browser, or run the included static server:

```bash
node .codex-static-server.js
```

## GitHub Pages Deployment

1. Push this folder to a GitHub repository.
2. In GitHub, open `Settings > Pages`.
3. Set `Source` to `Deploy from a branch`.
4. Select the branch, usually `main`, and the root folder `/`.
5. Save. GitHub Pages will publish the static site.

No build step or payment gateway setup is required.
