// A looping ticker of place names. Pure CSS; it stops for people who prefer reduced motion.
export default function Marquee({ items }) {
  if (!items.length) return null;
  const row = (key) => (
    <ul className="marquee__row" aria-hidden={key === 'b'} key={key}>
      {items.map((t, i) => (
        <li key={`${t}-${i}`}>
          {t}
          <span className="marquee__dot" aria-hidden="true">✺</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee" role="presentation">
      <div className="marquee__track">
        {row('a')}
        {row('b')}
      </div>
    </div>
  );
}
