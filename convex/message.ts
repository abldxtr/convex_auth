import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// نمونه استفاده در یک تابع mutation
export const createMessage = mutation({
  args: {
    content: v.string(),
    chatId: v.id("chats"),
    images: v.array(v.string()),
    senderId: v.string(),
    recieverId: v.string(),
    // status:v.string(),
    opupId: v.string(),

    // سایر پارامترها
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      image: args.images,
      type: args.images.length > 0 ? "IMAGE" : "TEXT",
      chatId: args.chatId,
      senderId: args.senderId as Id<"users">,
      receiverId: args.recieverId as Id<"users">,
      status: "SENT",
      opupId: args.opupId,
    });

    const chat = await ctx.db.get(args.chatId);

    if (!chat) {
      throw new Error(`Chat with id ${args.chatId} not found.`);
    }

    // const AmInit = chat.initiatorId === args.senderId;
    // if (AmInit) {
    //   await ctx.db.patch(args.chatId, {
    //     unreadMessagesCountParticipant: chat.unreadMessagesCountParticipant + 1,
    //   });
    // } else {
    //   await ctx.db.patch(args.chatId, {
    //     unreadMessagesCountInitiator: chat.unreadMessagesCountInitiator + 1,
    //   });
    // }

    return messageId;
  },
});

export const messages = query({
  args: {
    chatId: v.string(),
    limit: v.optional(v.number()), // تعداد پیام‌ها (اختیاری)
    cursor: v.optional(v.id("messages")), // برای Pagination
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId));
    // .order("asc"); // مرتب‌سازی بر اساس جدیدترین پیام

    // استفاده از Cursor برای Pagination
    // if (args.cursor) {
    //   query = query.gt("_id", args.cursor); // پیام‌ها بعد از این Cursor
    // }

    // محدود کردن تعداد پیام‌ها
    const limit = args.limit || 300; // پیش‌فرض 30 پیام
    const res = await query.take(limit);

    return res;
  },
});
export const seenMessage = mutation({
  args: {
    id: v.id("messages"), // شناسه پیام
    // class : v.array()

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

    // const AmInit = chat.initiatorId === userId;
    // if (AmInit) {
    //   await ctx.db.patch(chatId, {
    //     unreadMessagesCountParticipant:
    //       chat.unreadMessagesCountParticipant > 0
    //         ? chat.unreadMessagesCountParticipant - 1
    //         : 0,
    //   });
    // } else {
    //   await ctx.db.patch(chatId, {
    //     unreadMessagesCountInitiator:
    //       chat.unreadMessagesCountInitiator > 0
    //         ? chat.unreadMessagesCountInitiator - 1
    //         : 0,
    //   });
    // }

    // await ctx.db.patch(chatId, {
    //   unreadMessagesCountParticipant: chat.unreadMessagesCountParticipant - 1,
    // });

    // بررسی موفقیت‌آمیز بودن آپدیت
    // if (!updatedMessage) {
    //   throw new Error(
    //     `Message with id ${id} not found or could not be updated.`
    //   );
    // }

    // return updatedMessage;
  },
});
