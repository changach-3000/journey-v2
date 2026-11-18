import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { SITE } from '../siteConfig.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div>
          <Logo inverted />
          <p className="footer__blurb">{SITE.description}</p>
        </div>
        <nav aria-label="Footer">
          <h4>Explore</h4>
          <Link to="/routes">All routes</Link>
          <Link to="/saved">Saved routes</Link>
          <Link to="/contribute">Add a route</Link>
        </nav>
        <div>
          <h4>Good to know</h4>
          <p className="footer__small">
            Routes are shared by people who travelled them. Conditions change, so check roads, weather and local advice before you go.
          </p>
        </div>
      </div>
      <p className="footer__legal wrap">© {new Date().getFullYear()} {SITE.name}. Map data © OpenStreetMap contributors.</p>
    </footer>
  );
}
