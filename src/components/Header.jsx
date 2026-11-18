import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import { Close, Heart, Menu } from './Icons.jsx';
import { useSaved } from '../lib/saved.js';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { saved } = useSaved();
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="header">
      <div className="header__bar">
        <Logo />
        <nav className={`nav${open ? ' is-open' : ''}`} aria-label="Main">
          <NavLink to="/routes">Explore</NavLink>
          <NavLink to="/saved">
            <Heart width={16} height={16} /> Saved{saved.length ? <span className="count">{saved.length}</span> : null}
          </NavLink>
          <Link to="/contribute" className="btn btn--sm">
            Add a route
          </Link>
        </nav>
        <button className="header__menu" type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <Close /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
