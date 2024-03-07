import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, internalMutation } from "./_generated/server";
import { roles } from "./schema";

export const getUser = async (
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
) => {
  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", tokenIdentifier),
    )
    .first();

  if (!user) {
    throw new ConvexError("user expected to be defined");
  }

  return user;
};

export const createUser = internalMutation({
  args: { tokenIdentifier: v.string() },
  async handler(ctx, args) {
    await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      orgIds: [],
    });
  },
});

export const addOrgIdToUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    orgId: v.string(),
    role: roles,
  },
  async handler(ctx, args) {
    const user = await getUser(ctx, args.tokenIdentifier);

    await ctx.db.patch(user._id, {
      orgIds: [...user.orgIds, { orgId: args.orgId, role: args.role }],
    });
  },
});

export const updateRoleInUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    orgId: v.string(),
    role: roles,
  },
  async handler(ctx, args) {
    const user = await getUser(ctx, args.tokenIdentifier);

    const orgIndex = user.orgIds.findIndex((org) => org.orgId === args.orgId);
    if (orgIndex === -1) {
      throw new ConvexError(
        "Expected an organization on the user but was not found while updating.",
      );
    }

    user.orgIds[orgIndex] = { orgId: args.orgId, role: args.role };

    await ctx.db.patch(user._id, {
      orgIds: user.orgIds,
    });
  },
});
