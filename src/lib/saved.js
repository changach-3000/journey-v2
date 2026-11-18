// Saved routes. Today they live in this browser (localStorage). When accounts arrive they move to
// Convex (the `bookmarks` table is already in the schema) and this hook keeps the same shape.
import { useCallback, useEffect, useState } from 'react';

const KEY = 'wanderline:saved';
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

export function useSaved() {
  const [saved, setSaved] = useState(read);
  useEffect(() => {
    const sync = () => setSaved(read());
    window.addEventListener('wanderline:saved', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('wanderline:saved', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const toggle = useCallback((slug) => {
    const cur = read();
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* private mode: just keep it for this visit */
    }
    setSaved(next);
    window.dispatchEvent(new Event('wanderline:saved'));
  }, []);
  return { saved, isSaved: (slug) => saved.includes(slug), toggle };
}
