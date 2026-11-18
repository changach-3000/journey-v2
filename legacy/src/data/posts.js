// Your Substack stories, linked to the trip they belong to.
const base = 'https://michellerita.substack.com/p/';
const post = (slug, title, date, tripId, blurb) => ({ title, date, tripId, blurb, url: base + slug });

export const posts = [
  post('an-itch-for-roads-less-traveled', 'An Itch for Roads Less Traveled', '2026-02-22', 'north', 'Where the itch came from.'),
  post('optical-nutrition-the-road-that-changes', 'Optical Nutrition: The Road That Changes You', '2026-03-01', 'north', 'Nairobi to Marsabit.'),
  post('where-kenya-meets-ethiopia', 'Where Kenya Meets Ethiopia', '2026-03-09', 'north', 'A border town and a lot of kindness.'),
  post('where-the-forest-hides-a-lake', 'Where the Forest Hides a Lake', '2026-03-16', 'north', 'Marsabit’s crater lake, then south.'),
  post('3455-meters-of-love-and-stillness', '3,455 Meters of Love and Stillness', '2026-03-23', 'north', 'A birthday above the clouds.'),
  post('the-long-way-home', 'The Long Way Home', '2026-03-30', 'north', 'Heat, still water and a dam detour.'),
  post('easter-highways-and-home-the-long', 'Easter, Highways & Home', '2026-04-27', 'easter', 'The highway everyone takes home.'),
  post('when-life-changes-the-itinerary', 'When Life Changes the Itinerary', '2026-10-08', 'bunduz', 'Joy and grief at the same table.'),
  post('the-road-to-baringo-of-goats-equators', 'The Road to Baringo', '2026-10-12', 'baringo', 'Goats, equators and being someone’s flower.'),
  post('lake-baringo-crocodile-neighbours', 'Lake Baringo: Crocodile Neighbours', '2026-10-19', 'baringo', 'Fish pedicures and a little Love Island.'),
  post('lake-bogoria-flamingo-barbies-a-questionable', 'Lake Bogoria: Flamingo Barbies', '2026-10-26', 'baringo', 'A questionable road, a sunset worth walking for.'),
  post('the-long-way-home-cheploch-gorges', 'The Long Way Home: Cheploch Gorges', '2026-11-10', 'baringo', 'Tugen Hills and a reunion with Moo-moo.'),
];
