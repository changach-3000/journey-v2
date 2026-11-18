import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ExportPanel from '../components/ExportPanel.jsx';
import RouteCard from '../components/RouteCard.jsx';
import RouteCover from '../components/RouteCover.jsx';
import { Arrow, ArrowUpRight } from '../components/Icons.jsx';
import NotFound from './NotFound.jsx';
import { useRoute, useRoutes } from '../lib/data.jsx';
import { ACTIVITY, toneStyle } from '../lib/tone.js';
import { SITE } from '../siteConfig.js';

const RouteMap = lazy(() => import('../components/RouteMap.jsx')); // keeps the map library off the landing page

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function RoutePage() {
  const { slug } = useParams();
  const { route, loading } = useRoute(slug);
  const { routes } = useRoutes();
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    if (route) document.title = `${route.title} · ${SITE.name}`;
  }, [route]);

  // Numbered stops shown on the map and in the list (a place visited twice appears once).
  const pins = useMemo(() => {
    const seen = new Set();
    return (route?.stops ?? []).filter((s) => s.pin).filter((s) => {
      const k = `${s.lat},${s.lng}`;
      return seen.has(k) ? false : seen.add(k);
    });
  }, [route]);

  const related = useMemo(() => {
    if (!route) return [];
    const score = (r) => (r.region === route.region ? 2 : 0) + r.tags.filter((t) => route.tags.includes(t)).length;
    return routes.filter((r) => r.slug !== route.slug).sort((a, b) => score(b) - score(a)).slice(0, 3);
  }, [routes, route]);

  if (loading) return <p className="loading">Loading route…</p>;
  if (!route) return <NotFound />;

  const facts = [
    route.distanceKm && ['Distance', `${route.distanceKm.toLocaleString('en-GB')} km`],
    route.durationText && ['Duration', route.durationText],
    ['Type', ACTIVITY[route.activity]],
    route.difficulty && ['Difficulty', cap(route.difficulty)],
    route.elevationGainM && ['Climb', `${route.elevationGainM.toLocaleString('en-GB')} m`],
    route.bestSeason && ['Best time', route.bestSeason],
    pins.length && ['Stops', String(pins.length)],
  ].filter(Boolean);

  const focusStop = (i) => {
    setFocus({ i, nonce: Date.now() });
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="wrap" style={toneStyle(route)}>
      <Link to="/routes" className="crumb">
        <Arrow width={18} height={18} /> All routes
      </Link>

      <section className="rhero">
        <div>
          <div className="rhero__where">
            <span className="sticker sticker--sun">{route.region}</span>
            <span className="sticker">{route.country}</span>
            {route.tags.slice(0, 2).map((t) => <span key={t} className="sticker sticker--lake">{t}</span>)}
          </div>
          <h1>{route.title}</h1>
          {route.tagline && <p className="rhero__tagline">{route.tagline}</p>}
          <ExportPanel route={route} />
        </div>
        <div className="rhero__cover">
          <RouteCover route={route} detailed />
        </div>
      </section>

      <dl className="facts">
        {facts.map(([k, v]) => (
          <div className="fact" key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <section className="rsection">
        <p className="eyebrow">The journey</p>
        <h2>What it’s like.</h2>
        <div className="story">
          {(route.story?.length ? route.story : [route.summary]).map((p, i) => <p key={i}>{p}</p>)}
        </div>
        {route.stories?.length > 0 && (
          <div className="story-links">
            {route.stories.map((s) => (
              <a key={s.url} className="chip" href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title} <ArrowUpRight width={15} height={15} />
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="rsection" id="map">
        <p className="eyebrow">Follow it</p>
        <h2>The route.</h2>
        <div className="mapwrap">
          <Suspense fallback={<p className="loading">Loading map…</p>}>
            <RouteMap route={route} pins={pins} focus={focus} />
          </Suspense>
        </div>
        <p className="mapnote">
          <strong>Heads up:</strong> a Google Maps link can only hold about 8 stops, so Google may pick slightly different roads in between. For the <strong>exact line</strong>, download the GPX (works in Organic Maps, Komoot, AllTrails, Gaia GPS and most GPS devices) or the KML (import it into Google My Maps or Google Earth).
        </p>
      </section>

      {pins.length > 0 && (
        <section className="rsection">
          <p className="eyebrow">Along the way</p>
          <h2>Highlights &amp; stops.</h2>
          <ol className="stoplist">
            {pins.map((p, i) => (
              <li key={`${p.name}-${i}`}>
                <button type="button" onClick={() => focusStop(i)}>
                  <span className="stoplist__n">{i + 1}</span>
                  <span>
                    <span className="stoplist__name">{p.name}</span>
                    {p.note && <span className="stoplist__note" style={{ display: 'block' }}>{p.note}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      {(route.tips?.length > 0 || route.packing?.length > 0) && (
        <section className="rsection">
          <p className="eyebrow">Before you go</p>
          <h2>Tips &amp; what to carry.</h2>
          <div className="twocol">
            {route.tips?.length > 0 && (
              <div className="infocard"><h3>Good to know</h3><ul>{route.tips.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
            )}
            {route.packing?.length > 0 && (
              <div className="infocard" style={{ '--tint': '#C7ECFB' }}><h3>Pack this</h3><ul>{route.packing.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
            )}
          </div>
        </section>
      )}

      <section className="rsection">
        <p className="eyebrow">Photos &amp; video</p>
        <h2>See it.</h2>
        {route.media?.length ? (
          <div className="gallery">
            {route.media.map((m, i) =>
              m.kind === 'video' ? (
                <video key={i} src={m.src} poster={m.poster} controls playsInline preload="metadata" />
              ) : (
                <img key={i} src={m.src} alt={m.alt || ''} loading="lazy" />
              )
            )}
          </div>
        ) : (
          <p className="soon">Photos and video from this route are on their way.</p>
        )}
      </section>

      {related.length > 0 && (
        <section className="rsection">
          <p className="eyebrow">Keep exploring</p>
          <h2>More like this.</h2>
          <div className="grid-cards">{related.map((r) => <RouteCard key={r.slug} route={r} />)}</div>
        </section>
      )}
    </div>
  );
}
