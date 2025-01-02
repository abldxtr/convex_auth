import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

export const createMessage = mutation({
  args: {
    content: v.string(),
    chatId: v.id("chats"),
    images: v.array(v.string()),
    senderId: v.id("users"),
    recieverId: v.id("users"),
    opupId: v.string(),
    // messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      image: args.images,
      type: args.images.length > 0 ? "IMAGE" : "TEXT",
      chatId: args.chatId,
      senderId: args.senderId,
      receiverId: args.recieverId,
      status: "SENT",
      opupId: args.opupId,
    });

    const chat = await ctx.db.get(args.chatId);

    if (!chat) {
      throw new Error(`Chat with id ${args.chatId} not found.`);
    }

    return messageId;
  },
});

export const messages = query({
  args: {
    chatId: v.id("chats"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let res = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .paginate(args.paginationOpts);

    return res;
  },
});
export const seenMessage = mutation({
  args: {
    id: v.id("messages"),

    chatId: v.id("chats"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, chatId, userId } = args;

    await ctx.db.patch(id, {
      status: "READ",
    });

    const chat = await ctx.db.get(chatId);

    if (!chat) {
      throw new Error(`Chat with id ${chatId} not found.`);
    }
  },
});
