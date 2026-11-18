import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HERO_CLIPS } from '../siteConfig.js';
import { Arrow, Search } from './Icons.jsx';

// People who ask for less motion, or are on a data-saver connection, get a still image instead of video.
function useCalm() {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setCalm(mq.matches || Boolean(navigator.connection?.saveData));
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return calm;
}

/** The illustrated scene shown until you add real clips. Original artwork, in the site palette. */
function HeroArt() {
  return (
    <svg className="heroart" viewBox="0 0 600 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="600" height="560" fill="#C7ECFB" />
      <g className="heroart__sun">
        <circle cx="448" cy="150" r="104" fill="#FFB938" opacity="0.28" />
        <circle cx="448" cy="150" r="66" fill="#FFB938" />
      </g>
      <g className="heroart__cloud" fill="#FFFAF0">
        <rect x="70" y="96" width="120" height="34" rx="17" />
        <rect x="104" y="76" width="70" height="34" rx="17" />
      </g>
      <g className="heroart__cloud heroart__cloud--b" fill="#FFFAF0" opacity="0.9">
        <rect x="300" y="196" width="96" height="28" rx="14" />
        <rect x="326" y="180" width="56" height="28" rx="14" />
      </g>
      <path d="M0 330 L120 210 L210 300 L320 170 L430 300 L520 230 L600 300 V560 H0Z" fill="#7A4BC2" opacity="0.28" />
      <path d="M0 380 L90 300 L190 372 L290 268 L400 372 L500 310 L600 380 V560 H0Z" fill="#14A7A0" opacity="0.55" />
      <path d="M0 440 C 120 380, 220 450, 330 410 S 520 380, 600 430 V560 H0Z" fill="#3F9B5B" />
      <ellipse cx="170" cy="470" rx="150" ry="36" fill="#8ED6F5" />
      <path d="M70 466 q40 -10 80 0 M150 478 q50 -10 100 0" stroke="#FFFAF0" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
      {[120, 176, 236].map((x, i) => (
        <g key={x} transform={`translate(${x} ${430 + (i % 2) * 8})`}>
          <path d="M0 26 V6 q0 -8 8 -6" stroke="#FF5B3A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="2" cy="30" rx="10" ry="7" fill="#FF8D75" />
          <path d="M2 36 V50" stroke="#FF5B3A" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
      <path d="M470 560 C 450 500, 330 500, 360 450 S 470 410, 400 392" fill="none" stroke="#FFFAF0" strokeWidth="38" strokeLinecap="round" />
      <path d="M470 560 C 450 500, 330 500, 360 450 S 470 410, 400 392" fill="none" stroke="#231A12" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 16" />
    </svg>
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const calm = useCalm();
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const videoRef = useRef(null);
  const clips = HERO_CLIPS;
  const clip = clips[i];
  const playVideo = clips.length > 0 && !calm;

  useEffect(() => {
    if (playVideo) videoRef.current?.play?.().catch(() => {});
  }, [i, playVideo]);

  const go = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/routes?q=${encodeURIComponent(q.trim())}` : '/routes');
  };

  return (
    <section className="hero">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="eyebrow">Real routes · real stories</p>
          <h1 className="hero__title">
            Find a <span className="squiggle">route</span> worth following.
          </h1>
          <p className="hero__lede">
            Discover journeys other people have actually taken, read what they were like, then download the line and follow it yourself.
          </p>
          <form className="hero__search" onSubmit={go} role="search">
            <Search />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “lake”, “Marsabit” or “road trip”" aria-label="Search routes" />
            <button className="btn" type="submit">Search</button>
          </form>
          <p className="hero__links">
            or <Link to="/routes">browse every route <Arrow width={16} height={16} /></Link>
          </p>
        </div>

        <div className="hero__visual">
          <div className="hero__frame">
            {playVideo ? (
              <video
                key={clip.src}
                ref={videoRef}
                className="hero__video"
                src={clip.src}
                poster={clip.poster}
                muted
                playsInline
                autoPlay
                preload="metadata"
                loop={clips.length === 1}
                onEnded={() => setI((n) => (n + 1) % clips.length)}
              />
            ) : clips.length > 0 && clip?.poster ? (
              <img className="hero__video" src={clip.poster} alt="" />
            ) : (
              <HeroArt />
            )}
          </div>
          <span className="sticker sticker--lg sticker--sun hero__sticker hero__sticker--a">{clip?.label || 'Lake Baringo'}</span>
          <span className="sticker sticker--lake hero__sticker hero__sticker--b">Download &amp; go</span>
          <span className="hero__badge" aria-hidden="true">
            <svg viewBox="0 0 120 120"><defs><path id="circ" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs><text><textPath href="#circ">GPX · KML · GOOGLE MAPS · </textPath></text></svg>
            <Arrow className="hero__badge-arrow" />
          </span>
        </div>
      </div>
    </section>
  );
}
