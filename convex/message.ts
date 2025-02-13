import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const createMessage = mutation({
  args: {
    content: v.string(),
    chatId: v.id("chats"),
    url: v.optional(v.string()),
    images: v.optional(v.any()),
    audioStorageId: v.optional(v.id("_storage")),
    replyId: v.optional(v.id("messages")),
    replyMess: v.optional(v.any()),
    senderId: v.id("users"),
    recieverId: v.id("users"),
    opupId: v.string(),
    img: v.optional(v.bytes()),
    audio: v.optional(v.bytes()),
    duration: v.optional(v.number()),
    type: v.union(
      v.literal("TEXT"),
      v.literal("IMAGE"),
      v.literal("VIDEO"),
      v.literal("AUDIO"),
      v.literal("FILE")
    ),
  },
  handler: async (ctx, args) => {
    if (args.type === "AUDIO") {
      if (!!!args.audioStorageId) {
        return null;
      }

      let messageId = await ctx.db.insert("messages", {
        content: args.content,
        type: args.type,
        chatId: args.chatId,
        senderId: args.senderId,
        receiverId: args.recieverId,
        status: "SENT",
        opupId: args.opupId,
        img: args.img,
        // audioUrl: args.audio,
        audioStorageId: args.audioStorageId,
        replyMessage: args.replyId,
        duration: args.duration,
      });

      return messageId;
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
      replyMessage: args.replyId,
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

    const ress = await Promise.all(
      res.map(async (message) => ({
        ...message,
        // If the message is an "image" its `body` is an `Id<"_storage">`
        ...(message.type === "AUDIO" && message.audioStorageId
          ? { url: await ctx.storage.getUrl(message.audioStorageId) }
          : {}),
        ...(message.replyMessage
          ? { replyMess: await ctx.db.get(message.replyMessage) }
          : {}),
        // ...(message.senderId
        //   ? { sender: await ctx.db.get(message.senderId) }
        //   : {}),
        // ...(message.receiverId
        //   ? { receiver: await ctx.db.get(message.receiverId) }
        //   : {}),
      }))
    );

    // console.log({ ress });

    return ress;
  },
});

// export const list = query({
//   args: {},
//   handler: async (ctx) => {
//     const messages = await ctx.db.query("messages").collect();
//     return Promise.all(
//       messages.map(async (message) => ({
//         ...message,
//         // If the message is an "image" its `body` is an `Id<"_storage">`
//         ...(message.format === "image"
//           ? { url: await ctx.storage.getUrl(message.body) }
//           : {}),
//       })),
//     );
//   },
// });
export const seenMessage = mutation({
  args: {
    id: v.id("messages"),

    chatId: v.id("chats"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, chatId, userId } = args;
    const userIdAuth = await getAuthUserId(ctx);
    if (userIdAuth === null) {
      //   throw new Error("Client is not authenticated!");
      return null;
    }

    const message = await ctx.db.get(id);
    if (message !== null && message.receiverId === userIdAuth) {
      await ctx.db.patch(id, {
        status: "READ",
      });

      return;
    }
    return null;
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

export const deleteMessageById = mutation({
  args: {
    messageIds: v.array(v.id("messages")),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { messageIds, userId } = args;

    const userIdAuth = await getAuthUserId(ctx);
    if (userIdAuth === null || messageIds.length === 0) {
      //   throw new Error("Client is not authenticated!");
      return null;
    }

    // const deletemItem = messageIds.map((item,index)=>{
    //   if()
    // })
    // اجرای عملیات حذف پیام‌ها
    await Promise.all(
      messageIds.map(async (messageId) => {
        const message = await ctx.db.get(messageId); // گرفتن پیام از دیتابیس
        if (message?.senderId !== userIdAuth) {
          return null; // اگر پیام متعلق به کاربر نباشد، حذف نمی‌شود
        } else {
          await ctx.db.delete(messageId); // حذف پیام از دیتابیس
        }
      })
    );

    return { success: true }; // موفقیت‌آمیز بودن عملیات حذف پیام‌ها
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

export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    const { messageId, icon } = args;

    // Get authenticated user
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get the message
    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Initialize reactions array if it doesn't exist
    const currentReactions = message.reaction || [];

    // Check if user already reacted
    const existingReactionIndex = currentReactions.findIndex(
      (reaction) => reaction.userId === userId
    );

    let updatedReactions;

    if (existingReactionIndex !== -1) {
      // Update existing reaction
      if (currentReactions[existingReactionIndex].icon === icon) {
        // Remove reaction if same icon is clicked
        updatedReactions = currentReactions.filter(
          (reaction) => reaction.userId !== userId
        );
      } else {
        // Update to new icon
        updatedReactions = [...currentReactions];
        updatedReactions[existingReactionIndex] = {
          userId,
          icon,
        };
      }
    } else {
      // Add new reaction
      updatedReactions = [
        ...currentReactions,
        {
          userId,
          icon,
        },
      ];
    }

    // Update the message with new reactions
    const updatedMessage = await ctx.db.patch(messageId, {
      reaction: updatedReactions,
    });

    return updatedMessage;
  },
});
