// Small geometry toolkit, used by the site AND by scripts/make-seed.mjs (so no browser APIs here).
// Coordinates are [lng, lat] pairs unless a function says otherwise.

const RAD = Math.PI / 180;

export function haversineKm([lng1, lat1], [lng2, lat2]) {
  const dLat = (lat2 - lat1) * RAD;
  const dLon = (lng2 - lng1) * RAD;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

export function lengthKm(coords) {
  let d = 0;
  for (let i = 1; i < coords.length; i++) d += haversineKm(coords[i - 1], coords[i]);
  return d;
}

export function boundsOf(coords) {
  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

/* ---------- Google "encoded polyline" (precision 5, ~1 m) ----------
   A whole route becomes one short string. That matters for Convex, which limits document
   size and array length, and it keeps list queries tiny. */
function encodeValue(v) {
  v = v < 0 ? ~(v << 1) : v << 1;
  let out = '';
  while (v >= 0x20) {
    out += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
    v >>= 5;
  }
  return out + String.fromCharCode(v + 63);
}

export function encodePolyline(coords) {
  let prevLat = 0;
  let prevLng = 0;
  let out = '';
  for (const [lng, lat] of coords) {
    const la = Math.round(lat * 1e5);
    const ln = Math.round(lng * 1e5);
    out += encodeValue(la - prevLat) + encodeValue(ln - prevLng);
    prevLat = la;
    prevLng = ln;
  }
  return out;
}

export function decodePolyline(str) {
  const coords = [];
  let i = 0;
  let lat = 0;
  let lng = 0;
  while (i < str.length) {
    for (const axis of ['lat', 'lng']) {
      let shift = 0;
      let result = 0;
      let b;
      do {
        b = str.charCodeAt(i++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === 'lat') lat += delta;
      else lng += delta;
    }
    coords.push([lng / 1e5, lat / 1e5]);
  }
  return coords;
}

/* ---------- line simplification (Ramer–Douglas–Peucker) ---------- */
function rdp(pts, eps) {
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
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (max > eps && idx > 0) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

/** Simplify a line. `eps` is in the same units as the points (degrees for lng/lat; 0.0003 is about 30 m).
    A route that ends where it starts has no usable baseline, so it is split at its farthest point first. */
export function simplifyLine(pts, eps) {
  if (pts.length < 4) return pts;
  const first = pts[0];
  const end = pts[pts.length - 1];
  if (Math.hypot(end[0] - first[0], end[1] - first[1]) < eps * 8) {
    let far = 1;
    let fd = 0;
    pts.forEach((p, i) => {
      const d = Math.hypot(p[0] - first[0], p[1] - first[1]);
      if (d > fd) {
        fd = d;
        far = i;
      }
    });
    return rdp(pts.slice(0, far + 1), eps).concat(rdp(pts.slice(far), eps).slice(1));
  }
  return rdp(pts, eps);
}

/** A small version of a line (about 60 points) for thumbnails and card artwork. */
export function previewLine(full) {
  let eps = 0.01;
  let l = simplifyLine(full, eps);
  while (l.length > 70 && eps < 1) {
    eps *= 1.5;
    l = simplifyLine(full, eps);
  }
  return l;
}
