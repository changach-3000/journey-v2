import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Marquee from '../components/Marquee.jsx';
import RouteCard from '../components/RouteCard.jsx';
import { Arrow, Compass, MapPin, Route as RouteIcon, Upload } from '../components/Icons.jsx';
import { useRoutes } from '../lib/data.jsx';
import { ACTIVITY, toneStyle } from '../lib/tone.js';
import { SITE } from '../siteConfig.js';

const count = (items) => {
  const m = new Map();
  items.filter(Boolean).forEach((k) => m.set(k, (m.get(k) || 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

export default function Home() {
  const { routes } = useRoutes();
  useEffect(() => {
    document.title = `${SITE.name}: ${SITE.tagline}`;
  }, []);

  const featured = useMemo(() => routes.filter((r) => r.featured).slice(0, 4), [routes]);
  const regions = useMemo(() => count(routes.map((r) => r.region)), [routes]);
  const tags = useMemo(() => count(routes.flatMap((r) => r.tags)).slice(0, 10), [routes]);
  const types = useMemo(() => count(routes.map((r) => r.activity)), [routes]);

  const places = useMemo(() => {
    const seen = new Set();
    return routes
      .flatMap((r) => r.highlights.map((h) => ({ name: h.name, route: r })))
      .filter((p) => !seen.has(p.name) && seen.add(p.name))
      .slice(0, 12);
  }, [routes]);
  const ticker = useMemo(() => [...new Set([...routes.map((r) => r.region), ...places.map((p) => p.name)])].slice(0, 16), [routes, places]);

  return (
    <>
      <Hero />
      <section className="section">
        <div className="wrap">
          <div className="section__head">
            <div>
              <p className="eyebrow">What’s this?</p>
              <h2>A growing collection of real journeys.</h2>
            </div>
            <p className="section__lede">Not itineraries from a brochure. Routes people actually travelled, with the stories, the stops and the line to follow.</p>
          </div>
          <div className="how">
            {[
              { icon: <Compass width={28} height={28} />, tone: '#FFE29A', h: 'Discover', p: 'Browse by region, vibe or type of trip and find somewhere you’ve never been.' },
              { icon: <RouteIcon width={28} height={28} />, tone: '#A8E6DF', h: 'Follow', p: 'Open the route in Google Maps or download the GPX or KML and drive or walk the same line.' },
              { icon: <Upload width={28} height={28} />, tone: '#FFC4B3', h: 'Share', p: 'Travelled somewhere good? Add your route and your story to the collection.' },
            ].map((t) => (
              <div className="how__item" key={t.h} style={{ '--tint': t.tone }}>
                <div className="how__icon">{t.icon}</div>
                <h3>{t.h}</h3>
                <p>{t.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section__head">
            <div>
              <p className="eyebrow">Fresh from the road</p>
              <h2>Start with these.</h2>
            </div>
            <Link to="/routes" className="btn btn--ghost">
              See all routes <Arrow width={18} height={18} />
            </Link>
          </div>
          <div className="grid-feature">
            {featured.map((r, i) => (
              <RouteCard key={r.slug} route={r} size={i === 0 ? 'lg' : 'md'} tilt={i === 0 ? -0.6 : i % 2 ? 0.8 : -0.5} />
            ))}
            <Link to="/routes" className="more-tile">
              <h3>The whole collection</h3>
              <p>{routes.length} routes so far, and more on the way.</p>
              <span className="btn btn--ghost" style={{ justifySelf: 'center' }}>
                Explore <Arrow width={18} height={18} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section__head">
            <div>
              <p className="eyebrow">Ways to explore</p>
              <h2>Where do you feel like going?</h2>
            </div>
          </div>
          <div className="ways">
            <div className="ways__group">
              <h3>By region</h3>
              <div className="ways__chips">
                {regions.map(([name, n]) => (
                  <Link key={name} className="chip" to={`/routes?region=${encodeURIComponent(name)}`}>
                    {name} <small>{n}</small>
                  </Link>
                ))}
              </div>
            </div>
            <div className="ways__group">
              <h3>By vibe</h3>
              <div className="ways__chips">
                {tags.map(([name, n]) => (
                  <Link key={name} className="chip" to={`/routes?tag=${encodeURIComponent(name)}`}>
                    {name} <small>{n}</small>
                  </Link>
                ))}
              </div>
            </div>
            <div className="ways__group">
              <h3>By type</h3>
              <div className="ways__chips">
                {types.map(([name, n]) => (
                  <Link key={name} className="chip" to={`/routes?type=${name}`}>
                    {ACTIVITY[name] ?? name} <small>{n}</small>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {places.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section__head">
              <div>
                <p className="eyebrow">A glimpse</p>
                <h2>Places you’ll pass.</h2>
              </div>
              <p className="section__lede">Lakes, border towns, ridges and highways. A few of the stops waiting along the routes.</p>
            </div>
          </div>
          <div className="places" tabIndex={0} aria-label="Places along the routes">
            {places.map((p) => (
              <Link key={p.name} to={`/routes/${p.route.slug}`} className="place" style={toneStyle(p.route)}>
                <MapPin />
                <span className="place__name">{p.name}</span>
                <span className="place__route">on {p.route.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="band">
          <span className="sticker sticker--tomato sticker--tilt" style={{ position: 'absolute', right: '6%', top: '1.4rem' }}>Open invitation</span>
          <div className="band__grid">
            <div>
              <p className="eyebrow" style={{ color: 'var(--ink)' }}>Contribute</p>
              <h2>Got a route worth sharing?</h2>
              <p>Add it to the collection. Upload your GPX, tell us what it was like, and the next person gets to follow in your tracks.</p>
              <Link to="/contribute" className="btn">
                Add your route <Arrow width={18} height={18} />
              </Link>
            </div>
            <ol className="band__steps">
              <li>Upload your route (GPX)</li>
              <li>Tell the story, add the tips</li>
              <li>We review it and publish it</li>
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
