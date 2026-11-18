import { Link } from 'react-router-dom';
import RouteCover from './RouteCover.jsx';
import { Heart } from './Icons.jsx';
import { ACTIVITY, toneStyle } from '../lib/tone.js';
import { useSaved } from '../lib/saved.js';

export default function RouteCard({ route, size = 'md', tilt = 0 }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(route.slug);
  return (
    <article className={`rcard rcard--${size}`} style={{ ...toneStyle(route), '--tilt': `${tilt}deg` }}>
      <Link to={`/routes/${route.slug}`} className="rcard__link">
        <div className="rcard__media">
          <RouteCover route={route} />
          {route.tags?.[0] && <span className="sticker sticker--tilt">{route.tags[0]}</span>}
        </div>
        <div className="rcard__body">
          <p className="rcard__meta">
            {route.region} · {ACTIVITY[route.activity]}
          </p>
          <h3 className="rcard__title">{route.title}</h3>
          {route.tagline && <p className="rcard__tagline">{route.tagline}</p>}
          {route.distanceKm ? <p className="rcard__facts">{route.distanceKm.toLocaleString('en-GB')} km mapped</p> : null}
        </div>
      </Link>
      <button
        type="button"
        className={`rcard__save${saved ? ' is-saved' : ''}`}
        onClick={() => toggle(route.slug)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${route.title} from saved` : `Save ${route.title}`}
      >
        <Heart filled={saved} />
      </button>
    </article>
  );
}
