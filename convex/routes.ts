import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "route";

/** Everything a card needs, and nothing heavy (no route line, no long text). */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db
      .query("routes")
      .withIndex("by_status_order", (q) => q.eq("status", "published"))
      .collect();
    return docs.map(
      ({ path, stops, story, highlights, tips, packing, stories, status, submittedBy, ...card }) => ({
        ...card,
        highlights: highlights.slice(0, 6), // a few place names for the landing page
      })
    );
  },
});

/** One full route for its page. Drafts and pending submissions are never public. */
export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const doc = await ctx.db
      .query("routes")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    return doc && doc.status === "published" ? doc : null;
  },
});

/**
 * Anyone can submit a route; it is saved as "pending" and stays hidden until you publish it
 * (see `publish` below). TODO before opening this to the public: require sign-in and add
 * rate limiting so the queue can't be spammed.
 */
export const submit = mutation({
  args: {
    title: v.string(),
    region: v.string(),
    country: v.string(),
    activity: v.union(v.literal("road-trip"), v.literal("hike"), v.literal("mixed")),
    summary: v.string(),
    story: v.optional(v.string()),
    path: v.string(),
    preview: v.string(),
    distanceKm: v.optional(v.number()),
    stops: v.array(
      v.object({ name: v.string(), lat: v.number(), lng: v.number() })
    ),
    tips: v.optional(v.array(v.string())),
    submittedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const title = args.title.trim();
    if (title.length < 3 || title.length > 100) throw new Error("Please give the route a name (3–100 characters).");
    if (args.summary.length > 2000) throw new Error("The summary is too long (2,000 characters max).");
    if ((args.story ?? "").length > 20000) throw new Error("The story is too long.");
    if (args.path.length < 10 || args.path.length > 200_000) throw new Error("The route line looks invalid or too large.");
    if (args.stops.length > 60) throw new Error("Too many stops (60 max).");

    // Unique slug: add -2, -3, ... if the name is already taken.
    const base = slugify(title);
    let slug = base;
    for (let n = 2; await ctx.db.query("routes").withIndex("by_slug", (q) => q.eq("slug", slug)).first(); n++) {
      slug = `${base}-${n}`;
    }

    await ctx.db.insert("routes", {
      slug,
      title,
      country: args.country.trim() || "Kenya",
      region: args.region.trim() || "Unknown",
      activity: args.activity,
      tags: [],
      color: "sun",
      summary: args.summary.trim(),
      story: (args.story ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
      highlights: [],
      tips: (args.tips ?? []).filter(Boolean),
      packing: [],
      stories: [],
      media: [],
      distanceKm: args.distanceKm,
      path: args.path,
      preview: args.preview,
      stops: args.stops.map((s) => ({ ...s, pin: true, route: true })),
      featured: false,
      status: "pending",
      order: 1000,
      submittedBy: args.submittedBy,
    });
    return { ok: true, slug };
  },
});

/* ---- Moderation: internal functions. Run them from the Convex dashboard (Functions tab) or the
   CLI, e.g.  npx convex run routes:publish '{"slug":"my-route"}'  ---- */

export const publish = internalMutation({
  args: { slug: v.string(), order: v.optional(v.number()), featured: v.optional(v.boolean()) },
  handler: async (ctx, { slug, order, featured }) => {
    const doc = await ctx.db.query("routes").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (!doc) throw new Error(`No route with slug "${slug}"`);
    await ctx.db.patch(doc._id, {
      status: "published",
      ...(order !== undefined ? { order } : {}),
      ...(featured !== undefined ? { featured } : {}),
    });
  },
});

export const unpublish = internalMutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const doc = await ctx.db.query("routes").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (!doc) throw new Error(`No route with slug "${slug}"`);
    await ctx.db.patch(doc._id, { status: "draft" });
  },
});
