# Aurelia — E-commerce Storefront Landing Page

A free, responsive storefront landing page template built with plain HTML5, CSS3 and JavaScript — no frameworks, no build step. Designed to look and feel like a real modern online store, ready to download and adapt.

**[Live demo](https://lenivalestevao.github.io/ecommerce-storefront-landing/)**

## Features

- Sticky header with search, wishlist and a live cart counter
- Mobile off-canvas navigation menu
- Hero banner with a sale badge and dual call-to-action buttons
- Trust bar (free shipping, secure payment, easy returns, support)
- Shop-by-category grid, generated from a simple JavaScript array
- Featured products grid with ratings, sale badges, strikethrough pricing, wishlist toggle and an "Add to Cart" interaction
- Flash sale promo banner
- Customer testimonials with star ratings
- Newsletter signup form with a success message
- Fully responsive down to small mobile screens
- Zero dependencies — just HTML, CSS and vanilla JavaScript

## Using it as a template

Clone this repo, download the ZIP, or copy `index.html`, `style.css` and `script.js` into your own project. The whole color palette lives in CSS custom properties at the top of `style.css`:

```css
:root {
  --dark: #0f172a;
  --accent: #f97316;
  --accent-dark: #ea580c;
}
```

Categories, products and testimonials are rendered from plain data arrays at the top of `script.js`, so adding or editing items (icon, name, price, rating, review text) only takes editing one array — no HTML editing required.

## Project structure

```
index.html   Markup for the storefront layout
style.css    All styling, including the mobile breakpoints
script.js    Cart, wishlist, nav toggle and data-driven sections
```

## License

MIT — use it however you like, personal or commercial.
