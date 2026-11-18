// Builds convex/seedData.json from your original four trips (kept in legacy/src/data).
//   npm run seed:build
// The same file feeds the site before Convex is connected AND `npx convex run seed:run` afterwards,
// so the two never drift apart. Edit the META block below to change titles, regions, tags, etc.
import { readFile, writeFile } from 'node:fs/promises';
import { trips } from '../legacy/src/data/trips.js';
import { posts } from '../legacy/src/data/posts.js';
import { encodePolyline, simplifyLine, previewLine, lengthKm } from '../src/lib/geo.js';

const routesGeo = JSON.parse(await readFile(new URL('../legacy/src/data/routes.json', import.meta.url), 'utf8'));

// Human-written details per trip. Anything left out simply doesn't show on the site.
// Difficulty, duration, best season and tips are NOT filled in on purpose: add them only
// from first-hand knowledge, because people will use this to plan real journeys.
const META = {
  north: {
    slug: 'north-to-the-border',
    title: 'North to the Border',
    tagline: 'Nairobi to Moyale, then home around Mount Kenya.',
    region: 'Northern Kenya',
    activity: 'road-trip',
    tags: ['road trip', 'mountains', 'culture', 'crater lake'],
    color: 'sun',
  },
  easter: {
    slug: 'five-counties-to-eldoret',
    title: 'Five Counties to Eldoret',
    tagline: 'The highway everyone takes home, with nyama choma in the middle.',
    region: 'Rift Valley',
    activity: 'road-trip',
    tags: ['road trip', 'highway', 'lakes'],
    color: 'lake',
  },
  bunduz: {
    slug: 'a-tent-on-the-ridge',
    title: 'A Tent on the Ridge',
    tagline: 'A short drive out of Nairobi, a rough road, and a night of rain on canvas.',
    region: 'Kajiado',
    activity: 'road-trip',
    tags: ['weekend', 'camping', 'views'],
    color: 'plum',
  },
  baringo: {
    slug: 'baringo-by-road',
    title: 'Baringo, by Road',
    tagline: 'An equator stop, crocodile neighbours, flamingo pink and the Tugen Hills home.',
    region: 'Rift Valley',
    activity: 'road-trip',
    tags: ['lakes', 'wildlife', 'flamingos', 'road trip'],
    color: 'tomato',
  },
};

const clean = (s) => (s || '').replace(/\s*\(\?\)\s*/g, '').trim();

const out = trips.map((trip, i) => {
  const m = META[trip.id];
  const feature = routesGeo.features.find((f) => f.properties.id === trip.id);
  const full = feature.geometry.coordinates;
  const line = simplifyLine(full, 0.0003); // ~30 m: plenty for a route line, keeps documents small
  const seen = new Set();
  const stops = trip.stops.map((s) => ({
    name: s.name,
    lat: s.coords[1],
    lng: s.coords[0],
    pin: s.pin,
    route: s.route,
    minor: !!s.minor,
    ...(clean(s.note) ? { note: clean(s.note) } : {}),
  }));
  const highlights = trip.stops
    .filter((s) => s.pin && clean(s.note))
    .filter((s) => (seen.has(s.coords.join()) ? false : seen.add(s.coords.join())))
    .map((s) => ({ name: s.name, note: clean(s.note), lat: s.coords[1], lng: s.coords[0] }));

  return {
    slug: m.slug,
    title: m.title,
    tagline: m.tagline,
    country: 'Kenya',
    region: m.region,
    activity: m.activity,
    tags: m.tags,
    color: m.color,
    summary: trip.summary,
    story: [trip.summary],
    distanceKm: Math.round(lengthKm(full)),
    path: encodePolyline(line),
    // A tiny version of the line (about 60 points) used as cover art on route cards.
    preview: encodePolyline(previewLine(full)),
    stops,
    highlights,
    tips: [],
    packing: [],
    stories: posts.filter((p) => p.tripId === trip.id).map((p) => ({ title: p.title, url: p.url })),
    media: [],
    featured: true,
    status: 'published',
    order: i,
  };
});

await writeFile(new URL('../convex/seedData.json', import.meta.url), JSON.stringify(out));
for (const r of out) console.log(`${r.slug}: ${r.distanceKm} km, path ${r.path.length} chars, ${r.stops.length} stops, ${r.highlights.length} highlights`);
