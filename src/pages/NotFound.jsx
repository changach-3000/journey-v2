import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="wrap" style={{ paddingBlock: '4rem' }}>
      <div className="empty">
        <span className="sticker sticker--tilt sticker--tomato">404</span>
        <h3>This road doesn’t go anywhere.</h3>
        <p>The page you were after isn’t here. Let’s get you back on a real route.</p>
        <Link to="/routes" className="btn">Explore routes</Link>
      </div>
    </div>
  );
}
