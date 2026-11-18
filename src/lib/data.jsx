// The one place the app gets routes from.
//  - With VITE_CONVEX_URL set, everything comes from Convex (live, shared, editable in the dashboard).
//  - Without it, the same shapes come from convex/seedData.json, so the site works from day one.
// Pages only ever call useRoutes / useRoute / useSubmitRoute and never know which one they got.
import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from 'convex/react';
import { anyApi } from 'convex/server';
import { useCallback, useMemo } from 'react';
import seed from '../../convex/seedData.json';

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
export const HAS_CONVEX = Boolean(CONVEX_URL);
const client = HAS_CONVEX ? new ConvexReactClient(CONVEX_URL) : null;
const api = anyApi; // swap for the generated, typed `api` from convex/_generated once `npx convex dev` has run

// A list card only needs the light fields: never the long route line.
const toSummary = ({ path, stops, story, highlights, tips, packing, stories, ...rest }) => ({
  ...rest,
  highlights: highlights.slice(0, 6),
});
const localList = seed
  .filter((r) => r.status === 'published')
  .sort((a, b) => a.order - b.order)
  .map(toSummary);

/* ---------------- Convex-backed hooks ---------------- */
function useRoutesConvex() {
  const routes = useQuery(api.routes.list);
  return { routes: routes ?? [], loading: routes === undefined };
}
function useRouteConvex(slug) {
  const route = useQuery(api.routes.bySlug, { slug });
  return { route: route ?? null, loading: route === undefined };
}
function useSubmitRouteConvex() {
  return useMutation(api.routes.submit);
}

/* ---------------- Local (seed) hooks ---------------- */
function useRoutesLocal() {
  return { routes: localList, loading: false };
}
function useRouteLocal(slug) {
  const route = useMemo(() => seed.find((r) => r.slug === slug && r.status === 'published') ?? null, [slug]);
  return { route, loading: false };
}
function useSubmitRouteLocal() {
  // Keeps submissions in this browser so the form can be tried before Convex is connected.
  return useCallback(async (data) => {
    const key = 'wanderline:submissions';
    const all = JSON.parse(localStorage.getItem(key) || '[]');
    all.push({ ...data, submittedAt: Date.now() });
    localStorage.setItem(key, JSON.stringify(all));
    return { ok: true, local: true };
  }, []);
}

// Chosen once at load, so React's hook order never changes between renders.
export const useRoutes = HAS_CONVEX ? useRoutesConvex : useRoutesLocal;
export const useRoute = HAS_CONVEX ? useRouteConvex : useRouteLocal;
export const useSubmitRoute = HAS_CONVEX ? useSubmitRouteConvex : useSubmitRouteLocal;

export function DataProvider({ children }) {
  return HAS_CONVEX ? <ConvexProvider client={client}>{children}</ConvexProvider> : children;
}
