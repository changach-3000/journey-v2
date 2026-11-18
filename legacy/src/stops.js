// The scroll journey. One "chapter" per screen of scrolling.
// Trip chapters point at a trip in data/trips.js and frame the map around that trip's route.
// Edit the copy freely; it's placeholder wording drawn from the stories.
import { trips } from './data/trips.js';

// Basemap. With a MapTiler key (put it in .env.local as VITE_MAPTILER_KEY=...) the site uses
// MapTiler's style below. With no key it falls back to CARTO's free dark map so nothing breaks.
// Other MapTiler styles worth trying: 'dataviz-dark', 'backdrop-dark', 'basic-v2-dark',
// 'streets-v2-dark', 'outdoor-v2' (terrain contours) and 'satellite'.
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAPTILER_STYLE = 'dataviz-dark';
const CARTO_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const STYLE_URL = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/${MAPTILER_STYLE}/style.json?key=${MAPTILER_KEY}`
  : CARTO_STYLE;

// Elevation tiles for the relief shading (hills, escarpments, the Rift Valley wall). Needs the key.
// Set RELIEF to false in main.js's style.load block, or remove this line, to turn it off.
export const TERRAIN_URL = MAPTILER_KEY
  ? `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`
  : null;

export const chapters = [
  {
    id: 'earth',
    kind: 'world',
    eyebrow: 'The Wandering Butterfly',
    title: 'The world is\nlarge.',
    body: 'Scroll to leave the globe and follow the roads actually travelled.',
    name: 'Earth',
    center: [30, 5],
    zoom: 1.6,
    pitch: 0,
    bearing: 0,
  },
  {
    id: 'north',
    kind: 'trip',
    tripId: 'north',
    eyebrow: 'Feb – Mar 2026',
    title: 'North, to\nthe border.',
    name: 'Nairobi → Moyale → Mt Kenya',
    pitch: 20,
    bearing: 0,
  },
  {
    id: 'easter',
    kind: 'trip',
    tripId: 'easter',
    eyebrow: 'Easter 2026',
    title: 'Five counties\nto Eldoret.',
    name: 'Nairobi → Eldoret',
    pitch: 25,
    bearing: 0,
  },
  {
    id: 'bunduz',
    kind: 'trip',
    tripId: 'bunduz',
    eyebrow: 'Autumn 2026',
    title: 'A tent\non the ridge.',
    name: 'Karen → Bunduz',
    pitch: 45,
    bearing: 20,
    // A short trip, so don't zoom in absurdly far.
    maxZoom: 10.5,
  },
  {
    id: 'baringo',
    kind: 'trip',
    tripId: 'baringo',
    eyebrow: 'Oct – Nov 2026',
    title: 'Baringo,\nby road.',
    name: 'Nairobi → Baringo → Eldoret',
    pitch: 35,
    bearing: 0,
  },
  {
    id: 'all',
    kind: 'overview',
    eyebrow: 'So far',
    title: 'Four roads.\nOne country.',
    body: 'More roads, more stories. This map keeps growing.',
    name: 'Kenya',
    pitch: 0,
    bearing: 0,
  },
];

export const tripById = Object.fromEntries(trips.map((t) => [t.id, t]));
