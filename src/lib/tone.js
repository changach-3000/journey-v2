// Each route has a colour key (see `color` in the data). tint = soft background, strong = accent.
export const TONES = {
  sun:    { tint: '#FFE29A', strong: '#FFB938', name: 'Sunshine' },
  tomato: { tint: '#FFC4B3', strong: '#FF5B3A', name: 'Tomato' },
  lake:   { tint: '#A8E6DF', strong: '#14A7A0', name: 'Lake' },
  leaf:   { tint: '#BDE8C5', strong: '#3F9B5B', name: 'Leaf' },
  plum:   { tint: '#D9C8F5', strong: '#7A4BC2', name: 'Plum' },
  sky:    { tint: '#C7ECFB', strong: '#3AA7DB', name: 'Sky' },
};
export const toneOf = (route) => TONES[route?.color] ?? TONES.sun;
export const toneStyle = (route) => {
  const t = toneOf(route);
  return { '--tint': t.tint, '--strong': t.strong };
};

export const ACTIVITY = {
  'road-trip': 'Road trip',
  hike: 'Hike',
  mixed: 'Road & trail',
};
