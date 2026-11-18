// Turning a route into something people can follow: Google Maps link, GPX, KML.
// GPX and KML carry the exact line. A Google Maps link can only carry a handful of stops
// (about 8 in-between points), so Google re-plans the roads between them.
import { decodePolyline } from './geo.js';

const esc = (s) =>
  String(s).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Stops that make up the driving/walking line, in order. */
export function routeStops(route) {
  return (route.stops || []).filter((s) => s.route);
}

/** A Google Maps directions link: first stop -> last stop, with up to 8 evenly-spread stops between. */
export function googleMapsUrl(route, maxWaypoints = 8) {
  const stops = routeStops(route);
  if (stops.length < 2) return null;
  const pt = (s) => `${s.lat},${s.lng}`;
  const origin = stops[0];
  const destination = stops[stops.length - 1];
  const middle = stops.slice(1, -1);
  let picked = middle;
  if (middle.length > maxWaypoints) {
    picked = Array.from({ length: maxWaypoints }, (_, i) => middle[Math.round(((i + 1) * (middle.length + 1)) / (maxWaypoints + 1)) - 1]);
  }
  const params = new URLSearchParams({
    api: '1',
    origin: pt(origin),
    destination: pt(destination),
    travelmode: route.activity === 'hike' ? 'walking' : 'driving',
  });
  if (picked.length) params.set('waypoints', picked.map(pt).join('|'));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function toGpx(route) {
  const line = decodePolyline(route.path);
  const wpts = (route.stops || [])
    .filter((s) => s.pin)
    .map((s) => `  <wpt lat="${s.lat}" lon="${s.lng}"><name>${esc(s.name)}</name>${s.note ? `<desc>${esc(s.note)}</desc>` : ''}</wpt>`)
    .join('\n');
  const trkpts = line.map(([lng, lat]) => `      <trkpt lat="${lat}" lon="${lng}"></trkpt>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Wanderline" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${esc(route.title)}</name>${route.tagline ? `<desc>${esc(route.tagline)}</desc>` : ''}</metadata>
${wpts}
  <trk>
    <name>${esc(route.title)}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>
`;
}

export function toKml(route) {
  const line = decodePolyline(route.path);
  const coords = line.map(([lng, lat]) => `${lng},${lat},0`).join(' ');
  const marks = (route.stops || [])
    .filter((s) => s.pin)
    .map(
      (s) =>
        `    <Placemark><name>${esc(s.name)}</name>${s.note ? `<description>${esc(s.note)}</description>` : ''}<Point><coordinates>${s.lng},${s.lat},0</coordinates></Point></Placemark>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${esc(route.title)}</name>
    <Style id="route"><LineStyle><color>ff3c5aff</color><width>4</width></LineStyle></Style>
    <Placemark>
      <name>${esc(route.title)}</name>
      <styleUrl>#route</styleUrl>
      <LineString><tessellate>1</tessellate><coordinates>${coords}</coordinates></LineString>
    </Placemark>
${marks}
  </Document>
</kml>
`;
}

export function downloadText(filename, text, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const downloadGpx = (route) => downloadText(`${slugify(route.title)}.gpx`, toGpx(route), 'application/gpx+xml');
export const downloadKml = (route) =>
  downloadText(`${slugify(route.title)}.kml`, toKml(route), 'application/vnd.google-earth.kml+xml');

/** Read a GPX file's text into { name, coords: [[lng,lat]], waypoints: [{name,lat,lng}] } (browser only). */
export function parseGpx(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('That file is not valid GPX.');
  const pts = (sel) => [...doc.querySelectorAll(sel)].map((n) => [Number(n.getAttribute('lon')), Number(n.getAttribute('lat'))]);
  let coords = pts('trkpt');
  if (!coords.length) coords = pts('rtept');
  if (coords.length < 2) throw new Error('No route found in that GPX file (it needs a track or a route).');
  const waypoints = [...doc.querySelectorAll('wpt')].map((n) => ({
    name: n.querySelector('name')?.textContent?.trim() || 'Waypoint',
    lat: Number(n.getAttribute('lat')),
    lng: Number(n.getAttribute('lon')),
  }));
  return { name: doc.querySelector('metadata > name, trk > name')?.textContent?.trim() || '', coords, waypoints };
}
