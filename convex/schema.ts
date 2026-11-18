import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// A place on the route. `route` = part of the driving/walking line, `pin` = shown on the map,
// `minor` = pin whose label only appears on hover (keeps crowded maps readable).
const stop = v.object({
  name: v.string(),
  lat: v.number(),
  lng: v.number(),
  pin: v.boolean(),
  route: v.boolean(),
  minor: v.optional(v.boolean()),
  note: v.optional(v.string()),
});

const highlight = v.object({
  name: v.string(),
  note: v.optional(v.string()),
  lat: v.number(),
  lng: v.number(),
});

// Photos and videos. Use `src` for a file in /public or a URL; use `storageId` once files are
// uploaded to Convex file storage.
const media = v.object({
  kind: v.union(v.literal("image"), v.literal("video")),
  src: v.optional(v.string()),
  storageId: v.optional(v.id("_storage")),
  alt: v.optional(v.string()),
  poster: v.optional(v.string()),
});

export default defineSchema({
  routes: defineTable({
    slug: v.string(),
    title: v.string(),
    tagline: v.optional(v.string()),
    country: v.string(),
    region: v.string(),
    activity: v.union(v.literal("road-trip"), v.literal("hike"), v.literal("mixed")),
    tags: v.array(v.string()),
    color: v.string(), // palette key: sun | tomato | lake | leaf | plum | sky

    // The experience
    summary: v.string(),
    story: v.array(v.string()), // paragraphs
    highlights: v.array(highlight),
    tips: v.array(v.string()),
    packing: v.array(v.string()),
    stories: v.array(v.object({ title: v.string(), url: v.string() })), // links to longer write-ups
    media: v.array(media),

    // Practical facts. All optional: only show what is known first-hand.
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("moderate"), v.literal("hard"))),
    distanceKm: v.optional(v.number()),
    durationText: v.optional(v.string()), // e.g. "2 days" or "5–6 hours"
    elevationGainM: v.optional(v.number()),
    bestSeason: v.optional(v.string()),

    // Navigation. `path` is a Google-encoded polyline (precision 5): the whole route as one short
    // string, so it stays far below Convex's document and array limits. `preview` is a tiny version
    // used for card artwork so list queries never ship the full line.
    path: v.string(),
    preview: v.string(),
    stops: v.array(stop),

    // Curation and moderation
    featured: v.boolean(),
    status: v.union(v.literal("draft"), v.literal("pending"), v.literal("published")),
    order: v.number(),
    submittedBy: v.optional(v.string()), // becomes a users id once sign-in is added
  })
    .index("by_slug", ["slug"])
    .index("by_status_order", ["status", "order"]),

  // Ready for "save this route". The site stores saves in the browser for now; when sign-in
  // (e.g. Convex Auth) is added, this table takes over without any change to the pages.
  bookmarks: defineTable({
    userId: v.string(),
    routeId: v.id("routes"),
  })
    .index("by_user", ["userId"])
    .index("by_user_route", ["userId", "routeId"]),
});
