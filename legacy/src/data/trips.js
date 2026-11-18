// All trips, in the order you travelled them.
// Coordinates are [longitude, latitude] and were placed from general knowledge of the places
// mentioned in the stories, so treat them as "within a few km". Fix any that look wrong by
// dragging a pin on a map and copying the coordinates. Lines marked (?) are the least certain.
//
// Helpers:
//   p()  a named stop: gets a pin AND is part of the driving route (5th argument true = label only on hover)
//   v()  a "via" point: only steers the route along the right road, no pin
//   x()  a pin only: not on the driving route (boat trips, walks, memories)

const p = (name, lng, lat, note = '', minor = false) => ({ name, coords: [lng, lat], pin: true, route: true, note, minor });
const v = (name, lng, lat) => ({ name, coords: [lng, lat], pin: false, route: true });
const x = (name, lng, lat, note = '') => ({ name, coords: [lng, lat], pin: true, route: false, note, minor: true });

export const trips = [
  {
    id: 'north',
    name: 'North to the border',
    color: '#ffb454',
    dates: 'Feb–Mar 2026',
    title: 'North, to the border',
    summary: 'Eight hours to Marsabit, a day in Ethiopia, a crater lake in the clouds, and the long way home.',
    // Pull-quote for the Featured Routes section. Check each one against the post and swap in your favourite line.
    quote: null,
    // Photos for this trip: drop files in public/photos/north/ and list the file names here,
    // e.g. photos: ['hero.jpg', 'two.jpg', 'three.jpg']. The first one is the big image.
    photos: [],
    stops: [
      p('Nairobi', 36.8219, -1.2921, 'Left before dawn, with a stop at her mother’s place for tea and a prayer'),
      v('Thika', 37.0693, -1.0332),
      v('Murang’a', 37.152, -0.721),
      v('Othaya', 36.95, -0.55),
      p('Nyeri', 36.9511, -0.4201, 'Lunch, and university memories'),
      v('Nanyuki', 37.0722, 0.0067),
      v('Timau', 37.25, 0.09),
      p('Isiolo', 37.582, 0.3546, 'Acacias, camels, mosques'),
      p('Mt Ololokwe', 37.74, 0.78, 'Where everyone pulls over (?)', true),
      p('Marsabit', 37.9898, 2.3284, 'Saku Guest House'),
      v('Turbi', 38.28, 3.53),
      p('Moyale', 39.054, 3.523, 'Kenya–Ethiopia border, injera and coffee across the line'),
      v('Turbi (return)', 38.28, 3.53),
      v('Marsabit (return)', 37.9898, 2.3284),
      p('Marsabit National Park', 37.95, 2.37, 'Lake Paradise, a crater lake in the forest (?)', true),
      v('Isiolo (return)', 37.582, 0.3546),
      p('Meru', 37.6496, 0.047, 'Visit to a niece at KEMU'),
      p('Chogoria', 37.65, -0.2333, 'Airbnb base for the mountain'),
      p('Lake Ellis', 37.51, -0.18, 'Birthday at 3,455 m on Mt Kenya (?)', true),
      v('Chogoria (return)', 37.65, -0.2333),
      p('Embu', 37.45, -0.5333, 'Fresh produce for the family'),
      p('Masinga Dam', 37.6, -0.95, 'An unplanned detour, high-water marks on the trees (?)'),
      v('Matuu', 37.55, -1.15),
      v('Thika (return)', 37.0693, -1.0332),
      v('Nairobi (return)', 36.8219, -1.2921),
    ],
  },
  {
    id: 'easter',
    name: 'Easter to Eldoret',
    color: '#7bd8c4',
    dates: 'Easter 2026',
    title: 'Five counties to Eldoret',
    summary: 'The highway everyone takes home, with nyama choma in the middle.',
    // Pull-quote for the Featured Routes section. Check each one against the post and swap in your favourite line.
    quote: null,
    // Photos for this trip: drop files in public/photos/easter/ and list the file names here,
    // e.g. photos: ['hero.jpg', 'two.jpg', 'three.jpg']. The first one is the big image.
    photos: [],
    stops: [
      p('Nairobi', 36.8219, -1.2921, 'Left at 5 AM with siblings in tow'),
      p('Naivasha', 36.434, -0.7172, 'Sunrise'),
      p('Gilgil', 36.322, -0.498, 'Weighbridge delay, then a detour around Salgaa'),
      p('Nakuru', 36.08, -0.3031, 'Lake Nakuru and its flamingos from above'),
      p('Kabarak', 35.96, -0.17, 'Dropping food for a sister (?)'),
      p('Eldama Ravine', 35.717, 0.05, 'Nyama choma at Kwa Junior'),
      v('Kaptagat', 35.5, 0.38),
      p('Eldoret', 35.2698, 0.5143, 'Home: the farm, the cow, the geese'),
    ],
  },
  {
    id: 'bunduz',
    name: 'A tent on the ridge',
    color: '#c79bff',
    dates: 'Autumn 2026',
    title: 'A tent on the ridge',
    summary: 'An anniversary, a rough road, and a night of rain on canvas.',
    // Pull-quote for the Featured Routes section. Check each one against the post and swap in your favourite line.
    quote: { text: 'Sometimes, joy and grief sit at the same table.', from: 'When Life Changes the Itinerary' },
    // Photos for this trip: drop files in public/photos/bunduz/ and list the file names here,
    // e.g. photos: ['hero.jpg', 'two.jpg', 'three.jpg']. The first one is the big image.
    photos: [],
    stops: [
      p('Karen', 36.7, -1.32, 'Dinner at Matteos the night before'),
      v('Kiserian', 36.68, -1.43),
      p('Bunduz', 36.6, -1.55, 'Luxury tent, rain and a sunset over the ridge (? least certain)'),
    ],
  },
  {
    id: 'baringo',
    name: 'Baringo, by road',
    color: '#ff7a8a',
    dates: 'Oct–Nov 2026',
    title: 'Baringo, by road',
    summary: 'An equator stop, crocodile neighbours, flamingo pink, and the Tugen Hills home.',
    // Pull-quote for the Featured Routes section. Check each one against the post and swap in your favourite line.
    quote: { text: 'I was robbed. In broad daylight. By minors.', from: 'The Baringo series' },
    // Photos for this trip: drop files in public/photos/baringo/ and list the file names here,
    // e.g. photos: ['hero.jpg', 'two.jpg', 'three.jpg']. The first one is the big image.
    photos: [],
    stops: [
      p('Nairobi', 36.8219, -1.2921, 'Left on a Friday'),
      v('Ngong', 36.6522, -1.3667),
      v('Suswa', 36.37, -1.08),
      p('Naivasha', 36.434, -0.7172, 'Coffee and muffins at Delamere'),
      v('Gilgil', 36.322, -0.498),
      p('Nakuru', 36.08, -0.3031),
      p('Kabarak', 35.96, -0.17, 'Dennis’s alma mater (?)'),
      p('Mogotio', 35.97, 0.0, 'Equator stop, her fourth in Kenya'),
      p('Lake Bogoria Spa Resort', 36.05, 0.37, 'Goat soup, a naturally heated pool, thieving monkeys (?)'),
      p('Lake Baringo', 36.07, 0.63, 'Kambi ya Samaki: boats, crocodiles and fish eagles (?)'),
      x('Ol Kokwa Island', 36.06, 0.66, 'Hot springs and fish pedicures (?)'),
      x('Parmolok (Love Island)', 36.1, 0.72, 'Where a proposal almost happened (?)'),
      p('Lake Bogoria', 36.1, 0.27, 'Flamingos at sunset, on foot at the end (?)'),
      p('Tugen Hills viewpoint', 35.9, 0.6, 'A cold Coke above the lake (?)', true),
      p('Kabarnet', 35.745, 0.492, '', true),
      p('Cheploch Gorges', 35.63, 0.57, 'Kerio River gorge (?)'),
      p('Iten', 35.511, 0.67),
      p('Eldoret', 35.2698, 0.5143, 'Home, and a reunion with Moo-moo'),
    ],
  },
];

// Places from the “roots” story. Pins only, shown on the finale view.
export const memories = [
  { name: 'Kitale', coords: [35.002, 1.0191], note: 'High school, near Mount Elgon' },
  { name: 'Kisumu', coords: [34.7617, -0.0917], note: 'First mentoring trip, 2019' },
];
