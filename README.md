# Wanderline (working name)

A route discovery platform: browse real journeys, read the story behind each, view the route on a map and open it in Google Maps or download it as GPX/KML. Visitors can submit their own routes for review.

React + Vite front end, Convex backend, MapLibre maps. The old scroll-map site is kept in `legacy/`.

## Run it

```bash
npm install
npm run dev
```

With no backend configured the site runs on the four built-in routes (`convex/seedData.json`), so it works straight away.

## Connect Convex (routes as live data)

```bash
npx convex dev          # first run: log in, create a project; adds VITE_CONVEX_URL to .env.local
npm run seed:build      # regenerate convex/seedData.json from legacy/src/data
npx convex run seed:run # load the routes into Convex
```

Submitted routes arrive as `pending`. Review them in the Convex dashboard (Data > routes) and publish with
`npx convex run routes:publish '{"id":"<id>"}'` (or `routes:unpublish`). TODO before going public: sign-in and rate limiting on `routes:submit`.

## Data model (`convex/schema.ts`)

`routes`: slug, title, tagline, country, region, activity, tags, color, summary, story[], distanceKm, optional durationText / difficulty / elevationGainM / bestSeason, `path` (encoded polyline, the exact line), `preview` (tiny line for card art), stops[] (name, lat, lng, note), highlights[], tips[], packing[], stories[] (links), media[], featured, status, order. No dates.
`bookmarks`: defined for later; saves live in the browser (localStorage) for now.

## Navigation exports

- **Open in Google Maps**: origin, destination and up to 8 evenly spread waypoints. Google re-routes between them, so the line can differ slightly.
- **GPX / KML**: the exact line plus stops. Use these when the precise route matters.

## Customising

- Name, tagline, hero video: `src/siteConfig.js`. Put landscape `.mp4` clips in `public/media/hero/` and list them in `HERO_CLIPS`.
- Photos: add URLs to a route's `media` (Convex dashboard, or `seedData.json`). Routes without photos show their route-shape artwork.
- Difficulty, duration, season, tips and packing are empty on purpose: add them from first-hand knowledge.
- Map tiles: set `VITE_MAPTILER_KEY` in `.env.local`, otherwise free CARTO tiles are used.
- Static hosting needs an SPA fallback (all paths serve `index.html`).
