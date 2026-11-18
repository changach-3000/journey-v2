import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import RouteCard from '../components/RouteCard.jsx';
import { Search } from '../components/Icons.jsx';
import { useRoutes } from '../lib/data.jsx';
import { ACTIVITY } from '../lib/tone.js';
import { SITE } from '../siteConfig.js';

const SORTS = { featured: 'Featured first', shortest: 'Shortest', longest: 'Longest', az: 'A to Z' };

export default function Explore() {
  const { routes, loading } = useRoutes();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const type = params.get('type') ?? '';
  const region = params.get('region') ?? '';
  const tag = params.get('tag') ?? '';
  const difficulty = params.get('difficulty') ?? '';
  const sort = params.get('sort') ?? 'featured';

  useEffect(() => {
    document.title = `Explore routes · ${SITE.name}`;
  }, []);

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const regions = useMemo(() => [...new Set(routes.map((r) => r.region))].sort(), [routes]);
  const types = useMemo(() => [...new Set(routes.map((r) => r.activity))], [routes]);
  const tags = useMemo(() => [...new Set(routes.flatMap((r) => r.tags))].sort(), [routes]);
  const hasDifficulty = routes.some((r) => r.difficulty);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = routes.filter((r) => {
      if (type && r.activity !== type) return false;
      if (region && r.region !== region) return false;
      if (tag && !r.tags.includes(tag)) return false;
      if (difficulty && r.difficulty !== difficulty) return false;
      if (!needle) return true;
      const hay = [r.title, r.tagline, r.region, r.country, r.summary, ...r.tags, ...r.highlights.map((h) => h.name)].join(' ').toLowerCase();
      return needle.split(/\s+/).every((w) => hay.includes(w));
    });
    const by = {
      featured: (a, b) => a.order - b.order,
      shortest: (a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9),
      longest: (a, b) => (b.distanceKm ?? 0) - (a.distanceKm ?? 0),
      az: (a, b) => a.title.localeCompare(b.title),
    };
    return [...list].sort(by[sort] ?? by.featured);
  }, [routes, q, type, region, tag, difficulty, sort]);

  const anyFilter = q || type || region || tag || difficulty;

  return (
    <div className="wrap">
      <div className="page-head">
        <p className="eyebrow">The collection</p>
        <h1>Explore routes.</h1>
        <p>Every route here was travelled by someone who wrote down what it was like. Filter by where, what kind, or just what sounds good.</p>
      </div>

      <div className="filters">
        <div className="filters__row">
          <label className="searchbox">
            <Search />
            <span className="visually-hidden">Search routes</span>
            <input value={q} onChange={(e) => set('q', e.target.value)} placeholder="Search places, lakes, vibes…" />
          </label>
          <select className="select" value={region} onChange={(e) => set('region', e.target.value)} aria-label="Region">
            <option value="">All regions</option>
            {regions.map((r) => <option key={r}>{r}</option>)}
          </select>
          {hasDifficulty && (
            <select className="select" value={difficulty} onChange={(e) => set('difficulty', e.target.value)} aria-label="Difficulty">
              <option value="">Any difficulty</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>
          )}
          <select className="select" value={sort} onChange={(e) => set('sort', e.target.value === 'featured' ? '' : e.target.value)} aria-label="Sort">
            {Object.entries(SORTS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </div>
        <div className="filters__row">
          <span className="filters__label">Type</span>
          {types.map((t) => (
            <button key={t} type="button" className="chip" aria-pressed={type === t} onClick={() => set('type', type === t ? '' : t)}>
              {ACTIVITY[t] ?? t}
            </button>
          ))}
        </div>
        <div className="filters__row">
          <span className="filters__label">Vibe</span>
          {tags.map((t) => (
            <button key={t} type="button" className="chip" aria-pressed={tag === t} onClick={() => set('tag', tag === t ? '' : t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <p className="results__count" aria-live="polite">
        {loading ? 'Loading…' : `${shown.length} ${shown.length === 1 ? 'route' : 'routes'}`}
        {anyFilter && (
          <>
            {' · '}
            <Link to="/routes" style={{ textDecoration: 'underline' }}>clear filters</Link>
          </>
        )}
      </p>

      {shown.length ? (
        <div className="grid-cards">
          {shown.map((r, i) => <RouteCard key={r.slug} route={r} tilt={i % 3 === 0 ? -0.5 : i % 3 === 1 ? 0.4 : 0} />)}
        </div>
      ) : (
        !loading && (
          <div className="empty">
            <span className="sticker sticker--tilt sticker--sun">No luck</span>
            <h3>Nothing matches that yet.</h3>
            <p>Try fewer filters, or add the route you were looking for.</p>
            <Link to="/contribute" className="btn">Add a route</Link>
          </div>
        )
      )}
    </div>
  );
}
