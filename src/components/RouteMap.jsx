import { useEffect, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
// Vite relocates bundled files, so tell MapLibre where its worker really lives.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { boundsOf, decodePolyline } from '../lib/geo.js';
import { MAP_STYLE } from '../siteConfig.js';
import { toneOf } from '../lib/tone.js';

/** The route on a real map, with numbered stops. `focus` = { i, nonce } flies to stop i. */
export default function RouteMap({ route, pins, focus }) {
  const el = useRef(null);
  const live = useRef({});

  useEffect(() => {
    let map;
    let cancelled = false;
    (async () => {
      const ml = await import('maplibre-gl');
      if (cancelled || !el.current) return;
      ml.setWorkerUrl(workerUrl);
      const line = decodePolyline(route.path);
      map = new ml.Map({
        container: el.current,
        style: MAP_STYLE,
        bounds: boundsOf(line),
        fitBoundsOptions: { padding: 56 },
        cooperativeGestures: true, // scroll the page normally; ctrl/two-finger to zoom the map
        attributionControl: { compact: true },
      });
      map.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        map.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: line } } });
        const lineLayout = { 'line-cap': 'round', 'line-join': 'round' };
        map.addLayer({ id: 'route-casing', type: 'line', source: 'route', layout: lineLayout, paint: { 'line-color': '#FFFAF0', 'line-width': 9 } });
        map.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: lineLayout, paint: { 'line-color': '#FF5B3A', 'line-width': 4.5 } });
      });

      const strong = toneOf(route).strong;
      const markers = pins.map((p, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mpin';
        btn.style.setProperty('--strong', strong);
        btn.textContent = String(i + 1);
        btn.setAttribute('aria-label', p.name);
        const popup = new ml.Popup({ offset: 18, closeButton: false }).setText(p.name);
        return new ml.Marker({ element: btn }).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map);
      });
      live.current = { map, markers };
    })();
    return () => {
      cancelled = true;
      map?.remove();
      live.current = {};
    };
    // Rebuild only when the route itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.slug]);

  useEffect(() => {
    const { map, markers } = live.current;
    if (!focus || !map) return;
    const p = pins[focus.i];
    markers.forEach((m, i) => {
      m.getElement().classList.toggle('is-active', i === focus.i);
      if (i !== focus.i && m.getPopup().isOpen()) m.togglePopup();
    });
    map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 9), speed: 1.3 });
    if (!markers[focus.i].getPopup().isOpen()) markers[focus.i].togglePopup();
  }, [focus, pins]);

  return <div ref={el} role="region" aria-label={`Map of ${route.title}`} />;
}
