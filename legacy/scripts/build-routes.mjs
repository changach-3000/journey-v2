// Turns each trip's stops into a route line that follows real roads.
//   npm run routes            -> asks the free OSRM demo server for road geometry
//   npm run routes -- --offline -> straight lines between stops (no network needed)
// If a request fails, that trip falls back to straight lines and says so.
import { writeFile, mkdir } from 'node:fs/promises';
import { trips } from '../src/data/trips.js';

const OFFLINE = process.argv.includes('--offline');
const OSRM = process.env.OSRM_URL || 'https://router.project-osrm.org';

async function snap(coords) {
  const q = coords.map((c) => c.join(',')).join(';');
  const url = `${OSRM}/route/v1/driving/${q}?overview=full&geometries=geojson&continue_straight=false`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    headers: { 'user-agent': 'journey-travel-app/0.1' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 'Ok' || !json.routes?.[0]) throw new Error(json.message || json.code);
  return json.routes[0].geometry.coordinates;
}

const features = [];
for (const trip of trips) {
  const waypoints = trip.stops.filter((s) => s.route).map((s) => s.coords);
  let coordinates = waypoints;
  let mode = 'straight lines';
  if (!OFFLINE) {
    try {
      coordinates = await snap(waypoints);
      mode = 'road-snapped';
    } catch (err) {
      console.warn(`  ! ${trip.id}: routing failed (${err.message}); using straight lines`);
    }
  }
  console.log(`${trip.id}: ${coordinates.length} points, ${mode}`);
  features.push({
    type: 'Feature',
    properties: { id: trip.id, mode },
    geometry: { type: 'LineString', coordinates },
  });
}

await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(
  new URL('../src/data/routes.json', import.meta.url),
  JSON.stringify({ type: 'FeatureCollection', features })
);
console.log('wrote src/data/routes.json');
