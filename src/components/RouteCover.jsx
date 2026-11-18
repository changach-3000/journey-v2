import { useMemo } from 'react';
import { decodePolyline } from '../lib/geo.js';
import { toneOf } from '../lib/tone.js';

// Cover art for a route: its photo if it has one, otherwise its own shape drawn as a little poster.
// (So even before you have photos, 10 routes still look like 10 different, intentional cards.)
const W = 400;
const H = 300;
const PAD = 38;

function thin(points, max) {
  if (points.length <= max) return points;
  const step = points.length / max;
  return Array.from({ length: max }, (_, i) => points[Math.floor(i * step)]).concat([points[points.length - 1]]);
}

export default function RouteCover({ route, detailed = false, className = '' }) {
  const tone = toneOf(route);
  const photo = route.media?.find((m) => m.kind === 'image' && m.src);

  const d = useMemo(() => {
    const src = detailed && route.path ? route.path : route.preview;
    if (!src) return null;
    const pts = thin(decodePolyline(src), detailed ? 500 : 90);
    const lngs = pts.map((p) => p[0]);
    const lats = pts.map((p) => p[1]);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const kx = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
    const w = Math.max((maxLng - minLng) * kx, 1e-6);
    const h = Math.max(maxLat - minLat, 1e-6);
    const s = Math.min((W - 2 * PAD) / w, (H - 2 * PAD) / h);
    const ox = (W - w * s) / 2;
    const oy = (H - h * s) / 2;
    const xy = pts.map(([lng, lat]) => [ox + (lng - minLng) * kx * s, oy + (maxLat - lat) * s]);
    return { path: xy.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(''), start: xy[0], end: xy[xy.length - 1] };
  }, [route.path, route.preview, detailed]);

  if (photo) {
    return (
      <div className={`cover cover--photo ${className}`}>
        <img src={photo.src} alt={photo.alt || route.title} loading="lazy" />
      </div>
    );
  }

  return (
    <div className={`cover ${className}`} style={{ '--tint': tone.tint, '--strong': tone.strong }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Shape of the route: ${route.title}`}>
        <rect width={W} height={H} fill="var(--tint)" />
        <circle cx="340" cy="52" r="70" fill="var(--strong)" opacity="0.22" />
        <circle cx="48" cy="262" r="96" fill="var(--strong)" opacity="0.16" />
        <path d="M-10 250 C 70 210, 130 270, 210 236 S 340 214, 420 252 V 320 H -10 Z" fill="var(--strong)" opacity="0.14" />
        {d && (
          <>
            <path d={d.path} fill="none" stroke="#FFFAF0" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
            <path d={d.path} fill="none" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={d.start[0]} cy={d.start[1]} r="8" fill="#FFFAF0" stroke="var(--ink)" strokeWidth="3.5" />
            <circle cx={d.end[0]} cy={d.end[1]} r="10" fill="var(--strong)" stroke="var(--ink)" strokeWidth="3.5" />
          </>
        )}
      </svg>
    </div>
  );
}
