# Restaurant Digital Menu Template

A clean, mobile-first static template for restaurant digital menus. No framework, no build step — edit two JSON files, push, done.

**[Live Demo →](https://floshdev.github.io/restaurant-menu-template/)**

---

## Features

- **Zero dependencies** — plain HTML, CSS, vanilla JS
- **PWA-ready** — installable on mobile via Web App Manifest
- **JSON-driven** — all content in two files, no code edits needed
- **Fully themeable** — complete color palette from a single config key
- **Global + local search** — across all dishes or within the active category
- **Category subgroups** — for long sections like pizzas
- **Open Graph / SEO** — title, description, og:image from data
- **Auto-deploy** — GitHub Actions workflow included

## Stack

HTML · CSS · Vanilla JS · GitHub Pages

---

## Quick Start

1. Fork this repo
2. Edit `data/restaurant.json` — name, logo, colors, SEO
3. Edit `data/menu.json` — categories, dishes, prices
4. Push → GitHub Pages deploys automatically

---

## Structure

```
├── index.html          # Page shell and meta tags
├── app.js              # Rendering, search, navigation
├── styles.css          # Layout, responsive, theming
├── manifest.json       # PWA configuration
└── data/
    ├── restaurant.json # Branding, theme, SEO, highlights
    └── menu.json       # Categories, dishes, prices
```

---

## Data Format

### `data/restaurant.json`

```json
{
  "name": "Il Ristorante",
  "subtitle": "Ristorante & Pizzeria",
  "heroLabel": "Menù alla carta",
  "description": "A short introduction to the venue.",
  "logo": "./assets/logo.svg",
  "favicon": "./assets/favicon.svg",
  "appleTouchIcon": "./assets/apple-touch-icon.png",
  "maskIcon": "./assets/mask-icon.svg",
  "logoAlt": "Logo Il Ristorante",
  "footerNote": "Ask staff for allergen information.",
  "highlights": ["Fresh ingredients", "Local cuisine"],
  "theme": {
    "page": "#151312",
    "pageAlt": "#1d1917",
    "surface": "rgba(24, 20, 19, 0.92)",
    "surfaceSoft": "rgba(34, 28, 26, 0.94)",
    "surfaceStrong": "#0e0c0b",
    "accent": "#d1a15d",
    "accentStrong": "#f0c786",
    "accentMuted": "rgba(209, 161, 93, 0.16)",
    "text": "#f6efe7",
    "muted": "#bcae9f",
    "border": "rgba(240, 199, 134, 0.2)",
    "shadow": "0 32px 80px rgba(0, 0, 0, 0.4)",
    "glow": "rgba(209, 161, 93, 0.28)"
  },
  "seo": {
    "title": "Il Ristorante | Menù",
    "description": "Digital menu.",
    "ogImage": "./assets/og.jpg"
  }
}
```

**Quick theme swap:** change `accent`, `surface`, `text`, `muted` first — those drive most of the visual identity.

### `data/menu.json`

```json
[
  {
    "id": "antipasti",
    "title": "Antipasti",
    "items": [
      { "name": "Bruschetta", "price": "€ 6,00", "description": "tomato, basil" },
      { "name": "Prosciutto crudo", "price": "€ 9,00" }
    ]
  }
]
```

Each dish: `name` (required), `price` (required), `description` (optional).

---

## Category Subgroups

For long sections (e.g. pizzas), split items into labeled subgroups:

```json
{
  "id": "pizze",
  "title": "Pizze",
  "groups": [
    { "id": "classiche", "title": "Classic", "itemNames": ["Margherita", "Marinara"] },
    { "id": "speciali",  "title": "Special",  "itemNames": ["Boscaiola"] }
  ],
  "restGroup": { "id": "altre", "title": "Other pizzas" },
  "items": [
    { "name": "Margherita", "price": "€ 7,00" },
    { "name": "Marinara",   "price": "€ 5,00" },
    { "name": "Boscaiola",  "price": "€ 8,00" }
  ]
}
```

`itemNames` must match `name` values exactly. `restGroup` auto-collects anything not assigned to a group.

---

## Local Dev

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

> Opening `index.html` directly won't work — the app fetches JSON via `fetch()`, which requires a server.

### Testing on iPhone

Start the local server, find your Mac's IP, then open `http://<mac-ip>:8000` on the same Wi-Fi network.

```bash
ipconfig getifaddr en0
```

---

## Deploying to GitHub Pages

The repo includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

1. Push to `main`
2. Go to **Settings → Pages** in your fork
3. Set source to **GitHub Actions**
4. The site deploys automatically on every push

---

## Assets & Caching

- Prefer SVG for logo and favicon.
- If the browser caches an old asset, bust it with a query string: `./logo.svg?v=2`.
- All asset paths must stay relative to the project root.

---

## License

MIT
