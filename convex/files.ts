import { ConvexError, v } from "convex/values";
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { getUser } from "./users";
import { fileTypes } from "./schema";
import { Doc, Id } from "./_generated/dataModel";

async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  orgId: string,
) {
  const user = await getUser(ctx, tokenIdentifier);
  const hasAccess =
    user.orgIds.some((org) => org.orgId === orgId) ||
    user.tokenIdentifier.includes(orgId);

  if (!hasAccess) {
    return null;
  }
  return { user };
}

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const createFile = mutation({
  args: {
    name: v.string(),
    orgId: v.string(),
    fileId: v.id("_storage"),
    type: fileTypes,
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Please sign in to upload a file.");
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId,
    );

    if (!hasAccess) {
      throw new ConvexError("You don't have access to this organization.");
    }

    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
      type: args.type,
      userId: hasAccess.user._id,
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
    query: v.optional(v.string()),
    isFavorite: v.optional(v.boolean()),
    markAsDelete: v.optional(v.boolean()),
    type: v.optional(fileTypes),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId,
    );

    if (!hasAccess) {
      return [];
    }
    const query = args.query;
    let files = await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    if (query) {
      files = files.filter((file) =>
        file.name.toLowerCase().includes(query?.toLowerCase()),
      );
    }

    if (args.isFavorite) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_tokenIdentifier", (q) =>
          q.eq("tokenIdentifier", identity.tokenIdentifier),
        )
        .first();
      if (!user) {
        return files;
      }

      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_userId_orgId_fileId", (q) =>
          q.eq("userId", user._id).eq("orgId", args.orgId),
        )
        .collect();

      files = files.filter((file) =>
        favorites.some((f) => f.fileId === file._id),
      );
    }

    if (args.markAsDelete) {
      files = files.filter((file) => file.shouldDelete);
    } else {
      files = files.filter((file) => !file.shouldDelete);
    }

    if (args.type) {
      files = files.filter((file) => file.type === args.type);
    }

    return files;
  },
});

export const deleteAllFiles = internalMutation({
  args: {},
  async handler(ctx, args) {
    const files = await ctx.db
      .query("files")
      .withIndex("by_shouldDelete", (q) => q.eq("shouldDelete", true))
      .collect();

    await Promise.all(
      files.map(async (file) => {
        await ctx.storage.delete(file.fileId);
        return await ctx.db.delete(file._id);
      }),
    );
  },
});

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const accessToFile = await hasAccessToFile(ctx, args.fileId);

    if (!accessToFile) {
      throw new ConvexError("No access to a file.");
    }

    const { file, user } = accessToFile;

    assertCanDeleteFile(user, file);

    await ctx.db.patch(args.fileId, { shouldDelete: true });
  },
});

export const restoreFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const accessToFile = await hasAccessToFile(ctx, args.fileId);

    if (!accessToFile) {
      throw new ConvexError("No access to a file.");
    }

    const { file, user } = accessToFile;

    assertCanDeleteFile(user, file);

    await ctx.db.patch(args.fileId, { shouldDelete: false });
  },
});

export const getAllFavorites = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .first();

    if (!user) {
      return [];
    }

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", user._id).eq("orgId", args.orgId),
      )
      .collect();
    return favorites;
  },
});

export const toggleFavorite = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const accessToFile = await hasAccessToFile(ctx, args.fileId);

    if (!accessToFile) {
      throw new ConvexError("No access to file.");
    }

    const { file, user } = accessToFile;

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", user._id).eq("orgId", file.orgId).eq("fileId", file._id),
      )
      .first();

    if (!favorite) {
      await ctx.db.insert("favorites", {
        fileId: file._id,
        userId: user._id,
        orgId: file.orgId,
      });
    } else {
      await ctx.db.delete(favorite._id);
    }
  },
});

async function hasAccessToFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<"files">,
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const file = await ctx.db.get(fileId);

  if (!file) {
    return null;
  }

  const hasAccess = await hasAccessToOrg(
    ctx,
    identity.tokenIdentifier,
    file.orgId,
  );

  if (!hasAccess) {
    return null;
  }

  return { file, user: hasAccess.user };
}

function assertCanDeleteFile(user: Doc<"users">, file: Doc<"files">) {
  const canDelete =
    file.userId === user._id ||
    user.orgIds.find((org) => org.orgId === file.orgId)?.role === "admin";
  if (!canDelete) {
    throw new ConvexError("You have no access to delete a file.");
  }
}
