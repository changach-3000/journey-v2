// "Featured routes": one editorial section per trip, below the scroll journey.
// Each has photos, a short quote, the stories, and the exact route drawn as an SVG
// from the same road-snapped geometry the map uses (so it needs no map tiles).
import { posts } from './data/posts.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fmtDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const RAD = Math.PI / 180;

/* ---------------- geometry helpers ---------------- */
function lengthKm(coords) {
  let d = 0;
  for (let i = 1; i < coords.length; i++) {
    const [x1, y1] = coords[i - 1];
    const [x2, y2] = coords[i];
    const dLat = (y2 - y1) * RAD;
    const dLon = (x2 - x1) * RAD;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(y1 * RAD) * Math.cos(y2 * RAD) * Math.sin(dLon / 2) ** 2;
    d += 2 * 6371 * Math.asin(Math.sqrt(a));
  }
  return d;
}

// Ramer–Douglas–Peucker, iterative. Thousands of road points -> a few hundred.
function simplify(pts, eps) {
  // A trip that starts and ends in the same place (a loop) has no usable baseline for RDP,
  // so split it at the point farthest from the start and simplify each half on its own.
  const first = pts[0];
  const end = pts[pts.length - 1];
  if (pts.length > 3 && Math.hypot(end[0] - first[0], end[1] - first[1]) < eps * 8) {
    let far = 1, fd = 0;
    pts.forEach((p, i) => {
      const d = Math.hypot(p[0] - first[0], p[1] - first[1]);
      if (d > fd) { fd = d; far = i; }
    });
    return simplifyOpen(pts.slice(0, far + 1), eps).concat(simplifyOpen(pts.slice(far), eps).slice(1));
  }
  return simplifyOpen(pts, eps);
}

function simplifyOpen(pts, eps) {
  const last = pts.length - 1;
  if (last < 2) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[last] = 1;
  const stack = [[0, last]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a];
    const [bx, by] = pts[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    let max = 0;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len;
      if (d > max) { max = d; idx = i; }
    }
    if (max > eps && idx > 0) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

/* ---------------- the route drawing ---------------- */
function routeSvg(trip, line) {
  const pins = trip.stops.filter((s) => s.pin);
  const all = line.concat(pins.map((s) => s.coords));
  const lngs = all.map((c) => c[0]);
  const lats = all.map((c) => c[1]);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);

  const kx = Math.cos(((minLat + maxLat) / 2) * RAD); // keep shapes true at this latitude
  const spanX = Math.max((maxLng - minLng) * kx, 0.0001);
  const spanY = Math.max(maxLat - minLat, 0.0001);
  const padL = 28, padR = 150, padT = 30, padB = 30;
  const target = 470; // longest side of the drawing area, in SVG units
  const sc = target / Math.max(spanX, spanY);
  const W = Math.round(spanX * sc + padL + padR);
  const H = Math.round(spanY * sc + padT + padB);
  const proj = ([lng, lat]) => [padL + (lng - minLng) * kx * sc, padT + (maxLat - lat) * sc];

  const pts = simplify(line.map(proj), 0.7);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');

  // faint 1-degree graticule, so it reads as a survey chart
  let grid = '';
  for (let g = Math.ceil(minLng); g <= maxLng; g++) {
    const [x] = proj([g, minLat]);
    grid += `<line x1="${x.toFixed(1)}" y1="${padT - 12}" x2="${x.toFixed(1)}" y2="${H - padB + 12}" />`;
  }
  for (let g = Math.ceil(minLat); g <= maxLat; g++) {
    const [, y] = proj([minLng, g]);
    grid += `<line x1="${padL - 12}" y1="${y.toFixed(1)}" x2="${W - padR + 12}" y2="${y.toFixed(1)}" />`;
  }

  // pins: place each at its nearest point along the drawn line, so they "light up" as the line passes
  const placed = [];
  const seen = new Set();
  let dots = '';
  pins.forEach((s) => {
    const key = s.coords.join();
    if (seen.has(key)) return;
    seen.add(key);
    const [x, y] = proj(s.coords);
    let best = 0, bd = Infinity;
    pts.forEach((p, i) => {
      const dd = (p[0] - x) ** 2 + (p[1] - y) ** 2;
      if (dd < bd) { bd = dd; best = i; }
    });
    const at = pts.length > 1 ? best / (pts.length - 1) : 0;

    // greedy label placement: skip minor stops and anything that would collide
    let label = '';
    if (!s.minor) {
      const w = s.name.length * 6.6;
      const box = { x1: x + 10, x2: x + 10 + w, y1: y - 7, y2: y + 7 };
      const clash = placed.some((b) => !(box.x2 < b.x1 || box.x1 > b.x2 || box.y2 < b.y1 || box.y1 > b.y2));
      if (!clash) {
        placed.push(box);
        label = `<text x="${(x + 11).toFixed(1)}" y="${(y + 3.5).toFixed(1)}">${esc(s.name)}</text>`;
      }
    }
    dots += `<g class="pt" data-at="${at.toFixed(3)}"><title>${esc(s.name)}</title><circle class="pt__ring" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" /><circle class="pt__dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.8" />${label}</g>`;
  });

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Route map: ${esc(trip.title)}" preserveAspectRatio="xMidYMid meet">
    <g class="grid">${grid}</g>
    <path class="line line--glow" d="${d}" pathLength="1" />
    <path class="line" d="${d}" pathLength="1" />
    ${dots}
  </svg>`;
}

/* ---------------- one trip section ---------------- */
const photoSrc = (file) => `${import.meta.env.BASE_URL}photos/${file}`;

function photosHtml(trip) {
  const files = trip.photos || [];
  const slot = (i, cls) =>
    files[i]
      ? `<img class="${cls}" src="${photoSrc(trip.id + '/' + files[i])}" alt="" loading="lazy" />`
      : `<div class="${cls} photo--empty"><span>${i === 0 ? `Photo goes here<br /><small>public/photos/${trip.id}/</small>` : ''}</span></div>`;
  return `<div class="route__photos">
    ${slot(0, 'photo photo--hero')}
    <div class="route__strip">${slot(1, 'photo photo--thumb')}${slot(2, 'photo photo--thumb')}</div>
  </div>`;
}

function sectionHtml(trip, line) {
  const stories = posts.filter((p) => p.tripId === trip.id);
  const km = Math.round(lengthKm(line) / 10) * 10;
  const places = trip.stops.filter((s) => s.pin && !s.minor).length;
  const quote = trip.quote
    ? `<blockquote class="route__quote"><p>“${esc(trip.quote.text)}”</p><footer>${esc(trip.quote.from)}</footer></blockquote>`
    : '';
  return `
  <article class="route" id="route-${trip.id}" style="--accent:${trip.color}">
    ${photosHtml(trip)}
    <div class="route__body">
      <p class="eyebrow">${esc(trip.dates)}</p>
      <h3 class="route__title">${esc(trip.title)}</h3>
      <p class="route__summary">${esc(trip.summary)}</p>
      <dl class="route__stats">
        <div><dt>Mapped</dt><dd>≈ ${km.toLocaleString('en-GB')} km</dd></div>
        <div><dt>Places</dt><dd>${places}</dd></div>
        <div><dt>Stories</dt><dd>${stories.length}</dd></div>
      </dl>
      ${quote}
      <figure class="route__map">${routeSvg(trip, line)}</figure>
      <ul class="stories">${stories
        .map(
          (s) =>
            `<li><a href="${s.url}" target="_blank" rel="noopener"><time>${fmtDate(s.date)}</time><span>${esc(s.title)}</span></a></li>`
        )
        .join('')}</ul>
      <button class="route__fly" type="button" data-fly="${trip.id}">See it on the map <span aria-hidden="true">↑</span></button>
    </div>
  </article>`;
}

/* ---------------- public ---------------- */
export function buildFeatured(root, { trips, routes, gsap, ScrollTrigger, reduceMotion, onFly }) {
  if (!root) return;
  const lineFor = (id) => routes.features.find((f) => f.properties.id === id)?.geometry.coordinates;

  root.innerHTML = `
    <header class="featured__head">
      <p class="eyebrow">Featured routes</p>
      <h2 class="featured__title">The roads,<br />in full.</h2>
      <p class="featured__lede">Every trip so far: the exact route, the places along it and the stories behind it.</p>
    </header>
    ${trips.map((t) => (lineFor(t.id) ? sectionHtml(t, lineFor(t.id)) : '')).join('')}`;

  root.querySelectorAll('[data-fly]').forEach((btn) =>
    btn.addEventListener('click', () => onFly(btn.dataset.fly))
  );

  // The route draws itself as you scroll past; pins light up as the line reaches them.
  root.querySelectorAll('.route').forEach((section) => {
    const fig = section.querySelector('.route__map');
    const lines = section.querySelectorAll('.line');
    const pts = [...section.querySelectorAll('.pt')];
    if (reduceMotion) {
      pts.forEach((p) => p.classList.add('is-on'));
      return;
    }
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    ScrollTrigger.create({
      trigger: fig,
      start: 'top 85%',
      end: 'bottom 45%',
      scrub: true,
      onUpdate: (self) => {
        gsap.set(lines, { strokeDashoffset: 1 - self.progress });
        pts.forEach((p) => p.classList.toggle('is-on', self.progress >= Number(p.dataset.at) - 0.01));
      },
    });
  });
}
