import { Image, Music, MessageSquare, Video, File } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

type Message = {
  _id: Id<"messages">;
  _creationTime: number;
  image?: string[] | undefined;
  img?: ArrayBuffer | undefined;
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
  content: string;
  senderId: Id<"users">;
  receiverId: Id<"users">;
  chatId: Id<"chats">;
  status: "SENT" | "DELIVERED" | "READ";
  opupId: string;
} | null;

export const getMessagePreview = (message: Message) => {
  if (!message) return "هنوز گفت و گویی شروع نکرده‌اید.";

  switch (message.type) {
    case "IMAGE":
      return (
        <span className="flex items-center gap-1 text-[#7a869a]">
          <Image className="h-4 w-4" />
          تصویر
        </span>
      );
    case "AUDIO":
      return (
        <span className="flex items-center gap-1 text-[#7a869a]">
          <Music className="h-4 w-4" />
          صوت
        </span>
      );
    case "VIDEO":
      return (
        <span className="flex items-center gap-1 text-[#7a869a]">
          <Video className="h-4 w-4" />
          ویدیو
        </span>
      );
    case "FILE":
      return (
        <span className="flex items-center gap-1 text-[#7a869a]">
          <File className="h-4 w-4" />
          فایل
        </span>
      );
    case "TEXT":
    default:
      return (
        <span className="flex items-center gap-1 text-[#7a869a]">
          <MessageSquare className="h-4 w-4" />
          {message.content.length > 40
            ? `${message.content.substring(0, 40)}...`
            : message.content}
        </span>
      );
  }
};
