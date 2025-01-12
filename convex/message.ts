import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const createMessage = mutation({
  args: {
    content: v.string(),
    chatId: v.id("chats"),
    // images: v.optional(v.array(v.id("_storage"))),
    images: v.optional(v.any()),

    senderId: v.id("users"),
    recieverId: v.id("users"),
    opupId: v.string(),
    img: v.optional(v.bytes()),
    audio: v.optional(v.bytes()),
    type: v.union(
      v.literal("TEXT"),
      v.literal("IMAGE"),
      v.literal("VIDEO"),
      v.literal("AUDIO"),
      v.literal("FILE")
    ),
  },
  handler: async (ctx, args) => {
    if (!!args.audio) {
      let messageId = await ctx.db.insert("messages", {
        content: args.content,
        // image: args.images!,
        // image: imageUrls,
        type: args.type,
        chatId: args.chatId,
        senderId: args.senderId,
        receiverId: args.recieverId,
        status: "SENT",
        opupId: args.opupId,
        img: args.img,
        audioUrl: args.audio,
      });
    }

    let messageId = await ctx.db.insert("messages", {
      content: args.content,
      // image: args.images!,
      // image: imageUrls,
      type: args.type,
      chatId: args.chatId,
      senderId: args.senderId,
      receiverId: args.recieverId,
      status: "SENT",
      opupId: args.opupId,
      img: args.img,
      audioUrl: args.audio,
    });

    return messageId;
  },
});

export const messages = query({
  args: {
    chatId: v.id("chats"),
    // paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let res = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();
    // .paginate(args.paginationOpts);

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

export const seenMessageAll = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { chatId, userId } = args;

    const userIdAuth = await getAuthUserId(ctx);
    if (userIdAuth === null) {
      //   throw new Error("Client is not authenticated!");
      return null;
    }

    const chat = await ctx.db.get(chatId);

    const isPart =
      chat?.initiatorId === userIdAuth || chat?.participantId === userIdAuth;

    if (!isPart) {
      return null;
    }

    const user = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .filter((q) =>
        q.and(
          q.eq(q.field("receiverId"), userId),
          q.eq(q.field("status"), "SENT")
        )
      )
      .collect();

    Promise.all(
      user.map((item) => {
        const id = item._id;
        ctx.db.patch(id, { status: "READ" });
      })
    );
  },
});

export const MessageWithImg = action({
  args: {
    file: v.any(),
  },
  handler: async (ctx, args) => {
    // Call out to payment provider (e.g. Stripe) to charge customer
    const uploadUrl = await ctx.runMutation(
      internal.upload.generateUploadUrlInternal
    );
    if (!uploadUrl) {
      throw new Error("Failed to generate upload URL");
    }

    // 2. آپلود فایل به URL دریافت شده
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": args.file.type,
      },
      body: args.file.file,
    });

    if (!result.ok) {
      throw new Error("Failed to upload file");
    }

    // 3. دریافت storageId از پاسخ
    const { storageId } = await result.json();

    console.log({ storageId });
  },
});

export const getMessageById = query({
  args: {
    Id: v.id("messages"),
    // paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let res = await ctx.db.get(args.Id);
    // .paginate(args.paginationOpts);

    if (!res) return null;
    if (res.audioUrl === undefined) return null;

    return {
      ...res,
      // Convert Uint8Array to regular array for serialization
      audioData: Array.from(new Uint8Array(res.audioUrl)),
    };
  },
});
