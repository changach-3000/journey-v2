import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import RouteCard from '../components/RouteCard.jsx';
import { useRoutes } from '../lib/data.jsx';
import { useSaved } from '../lib/saved.js';
import { SITE } from '../siteConfig.js';

export default function Saved() {
  const { routes } = useRoutes();
  const { saved } = useSaved();
  useEffect(() => {
    document.title = `Saved routes · ${SITE.name}`;
  }, []);
  const mine = routes.filter((r) => saved.includes(r.slug));
  return (
    <div className="wrap">
      <div className="page-head">
        <p className="eyebrow">Your shortlist</p>
        <h1>Saved routes.</h1>
        <p>Tap the heart on any route to keep it here. Saved on this device for now.</p>
      </div>
      {mine.length ? (
        <div className="grid-cards">{mine.map((r) => <RouteCard key={r.slug} route={r} />)}</div>
      ) : (
        <div className="empty">
          <span className="sticker sticker--tilt sticker--lake">Empty so far</span>
          <h3>No saved routes yet.</h3>
          <p>Find one that makes you want to pack a bag.</p>
          <Link to="/routes" className="btn">Explore routes</Link>
        </div>
      )}
    </div>
  );
}
