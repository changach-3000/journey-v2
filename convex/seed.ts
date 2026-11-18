import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import seedData from "./seedData.json";

/**
 * Loads your first routes (convex/seedData.json) into the database.
 *   npx convex run seed:run            adds any route that isn't there yet (safe to re-run)
 *   npx convex run seed:run '{"replace":true}'   overwrites routes with the same slug
 * Rebuild the JSON from your original trips with:  npm run seed:build
 */
export const run = internalMutation({
  args: { replace: v.optional(v.boolean()) },
  handler: async (ctx, { replace }) => {
    let added = 0;
    let replaced = 0;
    for (const r of seedData as any[]) {
      const existing = await ctx.db.query("routes").withIndex("by_slug", (q) => q.eq("slug", r.slug)).unique();
      if (!existing) {
        await ctx.db.insert("routes", r);
        added++;
      } else if (replace) {
        await ctx.db.replace(existing._id, r);
        replaced++;
      }
    }
    return { added, replaced };
  },
});
