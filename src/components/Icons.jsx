// Tiny stroke icons (24px grid). Decorative by default; pass `title` when an icon stands alone.
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const I = (d) => (props) => (
  <svg {...base} {...props}>
    {d}
  </svg>
);
export const Heart = ({ filled, ...p }) => (
  <svg {...base} {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.6 7.6 3.7 4.5 7 4.5c2 0 3.7 1.1 5 3 1.3-1.9 3-3 5-3 3.3 0 5.4 3.1 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z" />
  </svg>
);
export const Arrow = I(<><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>);
export const ArrowUpRight = I(<><path d="M7 17L17 7" /><path d="M8 7h9v9" /></>);
export const Download = I(<><path d="M12 4v11" /><path d="M7 11l5 5 5-5" /><path d="M5 20h14" /></>);
export const MapPin = I(<><path d="M12 21s-7-6.2-7-11.3A7 7 0 0 1 19 9.7C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>);
export const Share = I(<><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" /></>);
export const Search = I(<><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></>);
export const Menu = I(<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>);
export const Close = I(<><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>);
export const Check = I(<path d="M5 12.5l4.5 4.5L19 7" />);
export const Upload = I(<><path d="M12 16V5" /><path d="M7 9l5-5 5 5" /><path d="M5 20h14" /></>);
export const Route = I(<><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" /></>);
export const Compass = I(<><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>);
export const Spark = I(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />);
