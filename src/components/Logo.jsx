import { Link } from 'react-router-dom';
import { SITE } from '../siteConfig.js';

// A wordmark with a little winding route as its tail. Swap the SVG for your own logo any time.
export default function Logo({ inverted }) {
  return (
    <Link to="/" className={`logo${inverted ? ' logo--inverted' : ''}`} aria-label={`${SITE.name} home`}>
      <svg viewBox="0 0 44 34" width="38" height="30" aria-hidden="true">
        <path d="M3 28c8 0 6-12 14-12s5 10 12 10 5-16 12-20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="39" cy="5" r="4.2" fill="var(--tomato)" stroke="var(--ink)" strokeWidth="2" />
      </svg>
      <span>{SITE.name}</span>
    </Link>
  );
}
