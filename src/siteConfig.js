// Things you'll want to tweak without touching components.
export const SITE = {
  name: 'Wanderline', // placeholder brand name: change it here and it updates everywhere
  tagline: 'Routes worth following.',
  description: 'Discover real routes, read the stories behind them, and follow the same line yourself.',
};

// Hero video clips. Drop landscape .mp4 files (6–10 s each, under ~4 MB, no sound needed) into
// public/media/hero/ and list them here. Until you do, the hero shows an illustrated scene.
// poster = a still image shown while the video loads; label = the place name on the sticker.
export const HERO_CLIPS = [
  // { src: '/media/hero/baringo.mp4', poster: '/media/hero/baringo.jpg', label: 'Lake Baringo' },
  // { src: '/media/hero/marsabit.mp4', poster: '/media/hero/marsabit.jpg', label: 'Marsabit' },
];

// Base map for route pages. With a MapTiler key (VITE_MAPTILER_KEY in .env.local) the site uses
// MapTiler's style; otherwise it falls back to CARTO's free "Voyager".
const KEY = import.meta.env.VITE_MAPTILER_KEY;
export const MAP_STYLE = KEY
  ? `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${KEY}`
  : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
