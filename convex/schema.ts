import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  presence: defineTable({
    user: v.string(),
    room: v.string(),
    present: v.boolean(),
    latestJoin: v.number(),
    data: v.any(),
  })
    .index("room_present_join", ["room", "present", "latestJoin"])
    .index("room_user", ["room", "user"]),
  presence_heartbeats: defineTable({
    user: v.string(),
    room: v.string(),
    markAsGone: v.id("_scheduled_functions"),
  }).index("by_room_user", ["room", "user"]),
  chats: defineTable({
    initiatorId: v.id("users"),
    participantId: v.id("users"),
  })
    .index("by_initiator_and_participant", ["initiatorId", "participantId"])
    .index("by_participant_and_initiator", ["participantId", "initiatorId"])
    .index("by_user_initiator", ["initiatorId"])
    .index("by_user_participant", ["participantId"]),

  messages: defineTable({
    content: v.string(),
    replyMessage: v.optional(v.id("messages")),

    senderId: v.id("users"),
    receiverId: v.id("users"),
    // chatId: v.id("chats"),
    chatId: v.id("chats"),

    status: v.union(
      v.literal("SENT"),
      v.literal("DELIVERED"),
      v.literal("READ")
    ),
    type: v.union(
      v.literal("TEXT"),
      v.literal("IMAGE"),
      v.literal("VIDEO"),
      v.literal("AUDIO"),
      v.literal("FILE")
    ),
    opupId: v.string(),
    image: v.optional(v.array(v.string())),
    img: v.optional(v.bytes()),
    audioUrl: v.optional(v.bytes()),
    audioStorageId: v.optional(v.id("_storage")),
    duration: v.optional(v.number()),
    reaction: v.optional(
      v.array(v.object({ userId: v.id("users"), icon: v.string() }))
    ),
  })
    .index("by_sender_user", ["senderId"])
    .index("by_receiver_user", ["receiverId"])
    .index("by_chatId", ["chatId"])
    .index("by_audioStorageId", ["audioStorageId"]),
});

export default schema;
