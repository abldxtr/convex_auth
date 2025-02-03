import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const chatList = query({
  args: {
    id: v.optional(v.id("users")),
    // chatId: v.optional(v.id("chats")),
  },
  handler: async (ctx, args) => {
    // دریافت چت‌ها به‌عنوان آغازکننده یا شرکت‌کننده
    if (!args.id) {
      return [];
    }

    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      //   throw new Error("Client is not authenticated!");
      return null;
    }

    let query_1 = await ctx.db
      .query("chats")
      .withIndex("by_user_initiator", (q) => q.eq("initiatorId", args.id!))
      .order("desc")
      .collect();

    let query_2 = await ctx.db
      .query("chats")
      .withIndex("by_user_participant", (q) => q.eq("participantId", args.id!))
      .order("desc")
      .collect();

    // const chat = await ctx.db.get(args.chatId!);

    const chats = [...query_1, ...query_2];

    // پردازش برای هر چت
    const result = await Promise.all(
      chats.map(async (chat) => {
        // تعداد پیام‌های خوانده‌نشده
        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
          .filter((q) =>
            q.and(
              q.eq(q.field("receiverId"), args.id),
              q.eq(q.field("status"), "SENT")
            )
          )
          .collect();

        const unreadMessagesCount = unreadMessages.length;

        // آخرین پیام هر چت
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
          .order("desc")
          .first();

        const other_id =
          lastMessage?.senderId === args.id
            ? lastMessage?.senderId
            : lastMessage?.senderId;

        // const name = other_id && (await ctx.db.get(other_id));
        const name1 = await ctx.db.get(chat._id);
        const name =
          name1?.initiatorId === args.id
            ? await ctx.db.get(name1?.participantId as Id<"users">)
            : await ctx.db.get(name1?.initiatorId as Id<"users">);

        return {
          ...chat,
          unreadMessagesCount,
          lastMessage,
          name,
        };
      })
    );

    return result;
  },
});

export const getChat = query({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      //   throw new Error("Client is not authenticated!");
      return null;
    }
    let chatChannel = await ctx.db.get(args.id);

    const Ispart =
      chatChannel?.initiatorId === userId ||
      chatChannel?.participantId === userId;

    if (!Ispart) {
      return null;
    }

    return chatChannel;
  },
});

export const createChat = mutation({
  args: {
    first: v.id("users"),
    second: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { first, second } = args;

    const res = await ctx.db.insert("chats", {
      initiatorId: first,
      participantId: second,
    });
    if (res) {
      return "success";
    } else {
      return "fail";
    }
  },
});

export const unreadCountChat = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      //   throw new Error("Client is not authenticated!");
      return null;
    }

    const unreadMessagesCount = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId!))
      .filter((q) =>
        q.and(
          q.eq(q.field("receiverId"), userId),
          q.eq(q.field("status"), "SENT")
        )
      )
      .collect();

    return unreadMessagesCount.length;
  },
});
