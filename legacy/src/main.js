import { Map as MapLibreMap, Marker, setWorkerUrl } from 'maplibre-gl';
// Vite relocates bundled files, so tell MapLibre where its worker really lives.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './style.css';
import { chapters, tripById, STYLE_URL, TERRAIN_URL } from './stops.js';
import { trips, memories } from './data/trips.js';
import { buildFeatured } from './featured.js';
import routes from './data/routes.json';

setWorkerUrl(workerUrl);
gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const pad = (n) => String(n).padStart(2, '0');
const fmtCoord = ([lng, lat]) =>
  `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`;
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Fraction of each hop spent "sitting" on a chapter before/after travelling.
const DWELL = 0.22;

const n = chapters.length;
const journeyEl = document.getElementById('journey');
journeyEl.style.height = `${n * 150}vh`; // scroll length scales with the number of chapters

/* ------------------------------------------------------------------ */
/* Text cards                                                          */
/* ------------------------------------------------------------------ */
const cardsEl = document.getElementById('cards');
const cards = chapters.map((c) => {
  const trip = c.tripId ? tripById[c.tripId] : null;
  const el = document.createElement('article');
  el.className = 'card';
  if (trip) el.style.setProperty('--accent', trip.color);
  el.innerHTML = `
    <p class="card__eyebrow">${esc(c.eyebrow)}</p>
    <h1 class="card__title">${esc(c.title).replace(/\n/g, '<br />')}</h1>
    ${c.body ? `<p class="card__body">${esc(c.body)}</p>` : ''}`;
  cardsEl.appendChild(el);
  return el;
});

/* ------------------------------------------------------------------ */
/* Map                                                                 */
/* ------------------------------------------------------------------ */
const first = chapters[0];
const map = new MapLibreMap({
  container: 'map',
  style: STYLE_URL,
  center: first.center,
  zoom: first.zoom,
  pitch: first.pitch,
  bearing: first.bearing,
  interactive: false, // scroll owns the camera
  attributionControl: { compact: true },
  maxPitch: 75,
});

// Camera per chapter. Trip chapters are framed automatically around the trip's stops.
let cameras = chapters.map((c) => ({
  center: c.center ?? first.center,
  zoom: c.zoom ?? first.zoom,
  pitch: c.pitch,
  bearing: c.bearing,
}));

function boundsOf(coordsList) {
  const lngs = coordsList.map((c) => c[0]);
  const lats = coordsList.map((c) => c[1]);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

function computeCameras() {
  const w = map.getContainer().clientWidth;
  const h = map.getContainer().clientHeight;
  const wide = w > 900;
  // Leave room for the text card: left side on desktop, bottom on phones.
  const padding = wide
    ? { top: 90, bottom: 80, left: Math.min(w * 0.42, 600), right: 60 }
    : { top: 90, bottom: h * 0.5, left: 24, right: 24 };

  const allCoords = trips.flatMap((t) => t.stops.map((s) => s.coords)).concat(memories.map((m) => m.coords));

  cameras = chapters.map((c) => {
    if (c.kind === 'world') return { center: c.center, zoom: c.zoom, pitch: c.pitch, bearing: c.bearing };
    const coords = c.kind === 'overview' ? allCoords : tripById[c.tripId].stops.map((s) => s.coords);
    const cam = map.cameraForBounds(boundsOf(coords), {
      padding: c.kind === 'overview' ? { ...padding, left: wide ? padding.left : 24 } : padding,
      maxZoom: c.maxZoom ?? 12,
    });
    return { center: [cam.center.lng, cam.center.lat], zoom: cam.zoom, pitch: c.pitch, bearing: c.bearing };
  });
}

// line-gradient needs strictly ascending stops starting above 0.
function routeGradient(p, color, alpha) {
  const at = clamp(p, 0.0001, 0.9999);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  return ['step', ['line-progress'], `rgba(${r},${g},${b},${alpha})`, at, `rgba(${r},${g},${b},0)`];
}

const pinState = {};
const markerEls = {}; // tripId -> [elements]
const lineKey = {}; // tripId -> last painted state, to avoid redundant repaints

map.on('style.load', () => {
  try {
    map.setProjection({ type: 'globe' }); // flattens automatically as you zoom in
  } catch (e) {
    console.warn('Globe projection unavailable, using flat map.', e);
  }

  // Our pins carry the place names. Hide the basemap's town/road/POI labels so they don't fight
  // with ours. Country and continent names stay.
  let firstLabel;
  for (const layer of map.getStyle().layers) {
    if (layer.type !== 'symbol') continue;
    if (/country|continent/i.test(layer.id)) {
      firstLabel ??= layer.id;
    } else {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  }

  // Relief shading: hills and the Rift Valley wall show up as soft light and shadow.
  // Only with a MapTiler key. Set RELIEF to false to turn it off.
  const RELIEF = true;
  if (RELIEF && TERRAIN_URL) {
    try {
      map.addSource('terrain', { type: 'raster-dem', url: TERRAIN_URL, tileSize: 256 });
      map.addLayer(
        {
          id: 'relief',
          type: 'hillshade',
          source: 'terrain',
          paint: {
            'hillshade-exaggeration': 0.75,
            'hillshade-shadow-color': '#000000',
            'hillshade-highlight-color': '#6c7f93',
            'hillshade-accent-color': '#26313d',
          },
        },
        firstLabel
      );
    } catch (e) {
      console.warn('Relief shading unavailable.', e);
    }
  }

  trips.forEach((trip) => {
    const feature = routes.features.find((f) => f.properties.id === trip.id);
    if (!feature) return;
    map.addSource(`route-${trip.id}`, { type: 'geojson', lineMetrics: true, data: feature });
    map.addLayer({
      id: `route-glow-${trip.id}`,
      type: 'line',
      source: `route-${trip.id}`,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-width': 10, 'line-blur': 8, 'line-gradient': routeGradient(0, trip.color, 0.45) },
    });
    map.addLayer({
      id: `route-line-${trip.id}`,
      type: 'line',
      source: `route-${trip.id}`,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-width': 2.5, 'line-gradient': routeGradient(0, trip.color, 1) },
    });
  });

  // Pins are DOM markers (labels without font/glyph headaches).
  trips.forEach((trip) => {
    markerEls[trip.id] = [];
    const seen = new Set();
    trip.stops
      .filter((s) => s.pin)
      .forEach((s) => {
        const k = s.coords.join();
        if (seen.has(k)) return;
        seen.add(k);
        const el = document.createElement('div');
        el.className = 'pin' + (s.minor ? ' pin--minor' : '');
        el.style.setProperty('--pin', trip.color);
        el.innerHTML = `<div class="pin__in"><i></i><span>${esc(s.name)}</span></div>`;
        el.title = s.note || s.name;
        new Marker({ element: el, anchor: 'left', offset: [-4, 0] }).setLngLat(s.coords).addTo(map);
        markerEls[trip.id].push(el);
      });
  });
  memories.forEach((m) => {
    const el = document.createElement('div');
    el.className = 'pin pin--memory';
    el.innerHTML = `<div class="pin__in"><i></i><span>${esc(m.name)}</span></div>`;
    el.title = m.note;
    new Marker({ element: el, anchor: 'left', offset: [-4, 0] }).setLngLat(m.coords).addTo(map);
    (markerEls.memories ||= []).push(el);
  });

  // The first render ran before these pins existed; forget its cached states so they get applied.
  Object.keys(pinState).forEach((k) => delete pinState[k]);
  computeCameras();
  render(lastProgress);
});

/* ------------------------------------------------------------------ */
/* Render: scroll progress (0..1) -> camera, routes, pins, cards, HUD  */
/* ------------------------------------------------------------------ */
const hudPlace = document.getElementById('hud-place');
const hudCoords = document.getElementById('hud-coords');
const hudCount = document.getElementById('hud-count');
const bar = document.getElementById('progress-bar');
const hint = document.getElementById('scroll-hint');

let lastProgress = 0;

function setPinState(id, state) {
  if (pinState[id] === state) return;
  pinState[id] = state;
  (markerEls[id] || []).forEach((el) => {
    el.dataset.state = state; // future | active | past | all
  });
}

function render(p) {
  lastProgress = p;
  const t = p * (n - 1); // 0..n-1, integers are chapters
  const i = Math.min(Math.floor(t), n - 2);
  const f = t - i;
  const e = smooth(clamp((f - DWELL) / (1 - 2 * DWELL))); // eased travel with dwell at both ends
  const nearest = Math.round(t);

  const a = cameras[i];
  const b = cameras[i + 1];

  // Pull out a little mid-hop on longer legs so it feels like flying, not teleporting.
  const dist = Math.hypot(b.center[0] - a.center[0], b.center[1] - a.center[1]);
  const arc = Math.min(1.5, dist * 0.12);

  const lng = lerp(a.center[0], b.center[0], e);
  const lat = lerp(a.center[1], b.center[1], e);
  const zoom = Math.max(0.8, lerp(a.zoom, b.zoom, e) - arc * Math.sin(Math.PI * e));

  map.jumpTo({
    center: [lng, lat],
    zoom,
    pitch: lerp(a.pitch, b.pitch, e),
    bearing: lerp(a.bearing, b.bearing, e),
  });

  // Routes: each trip draws itself while its chapter is on screen, then stays dimmed.
  const onOverview = chapters[nearest].kind === 'overview';
  chapters.forEach((c, k) => {
    if (c.kind !== 'trip') return;
    const id = c.tripId;
    const drawn = clamp((t - (k - 0.3)) / 0.52); // starts just before arrival, done as you leave
    const isActive = nearest === k && !onOverview;
    const state = onOverview ? 'all' : t < k - 0.6 ? 'future' : isActive ? 'active' : 'past';
    const alpha = state === 'all' || state === 'active' ? 1 : 0.35;
    const trip = tripById[id];
    const key = `${drawn.toFixed(3)}|${alpha}`;
    if (lineKey[id] !== key && map.getLayer(`route-line-${id}`)) {
      lineKey[id] = key;
      const prog = state === 'all' ? 1 : drawn;
      map.setPaintProperty(`route-line-${id}`, 'line-gradient', routeGradient(prog, trip.color, alpha));
      map.setPaintProperty(`route-glow-${id}`, 'line-gradient', routeGradient(prog, trip.color, alpha * 0.45));
    }
    setPinState(id, state);
  });
  setPinState('memories', onOverview ? 'all' : 'future');

  // Cards: fade/slide around each integer t.
  cards.forEach((el, k) => {
    const d = t - k;
    const vis = 1 - clamp(Math.abs(d) / (DWELL + 0.12));
    el.style.opacity = vis.toFixed(3);
    el.style.transform = `translate3d(0, ${(d * -40).toFixed(1)}px, 0)`;
    el.style.pointerEvents = vis > 0.5 ? 'auto' : 'none';
  });

  // HUD
  hudPlace.textContent = chapters[nearest].name;
  hudCoords.textContent = fmtCoord([lng, lat]);
  hudCount.textContent = `${pad(nearest + 1)} / ${pad(n)}`;
  bar.style.transform = `scaleX(${p})`;
  hint.style.opacity = String(1 - clamp(p * 12));
}

map.on('resize', () => {
  if (!map.isStyleLoaded()) return;
  computeCameras();
  render(lastProgress);
});

/* ------------------------------------------------------------------ */
/* Scroll: Lenis smoothing + GSAP ScrollTrigger                        */
/* ------------------------------------------------------------------ */
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.085 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

ScrollTrigger.create({
  trigger: '#journey',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => render(self.progress),
});

render(0);

/* ------------------------------------------------------------------ */
/* Featured routes (below the journey)                                 */
/* ------------------------------------------------------------------ */
function flyToChapter(tripId) {
  const k = chapters.findIndex((c) => c.tripId === tripId);
  if (k < 0) return;
  const y = journeyEl.offsetTop + (k / (n - 1)) * (journeyEl.offsetHeight - window.innerHeight);
  if (lenis) lenis.scrollTo(y, { duration: 2.2 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

buildFeatured(document.getElementById('featured'), {
  trips,
  routes,
  gsap,
  ScrollTrigger,
  reduceMotion,
  onFly: flyToChapter,
});
window.addEventListener('load', () => ScrollTrigger.refresh());
