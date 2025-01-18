import { replyMess, useGlobalContext } from "@/context/globalContext";
import { User } from "./message.list";
import { X, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export type replyType = {
  message: replyMess;
  chatId: string;
  currentUser?: User | undefined;
  otherUser?: User | undefined;
};

export default function ReplyMessageComp({
  message,
  chatId,
  currentUser,
  otherUser,
}: replyType) {
  const {
    setReplyMessageId,
    replyMessageIdScroll,
    setReplyMessageIdScroll,
    functionName,
  } = useGlobalContext();

  if (message.chatId !== chatId) {
    // setReplyMessageId(null)

    return null;
  }
  if (functionName === "chatroom") {
    return null;
  }

  const name =
    message.senderId === currentUser?._id ? currentUser.name : otherUser?.name;

  const text =
    message.content.length > 40
      ? message.content.substring(0, 40) + "..."
      : message.content;

  const ii = message.img
    ? btoa(String.fromCharCode(...new Uint8Array(message.img)))
    : null;
  return (
    <div
      className="flex item-center justify-between  mx-[12px] p-2 "
      onClick={() => setReplyMessageIdScroll(true)}
    >
      <div className="  flex  flex-col pl-2 border-l-2 border-blue-400 rounded-sm  ">
        <div className=" text-blue-300 text-sm text-left ">{name}</div>
        {ii !== null && (
          <img
            src={`data:image/jpeg;base64,${ii}`}
            alt={`uploaded-img`}
            className={cn("size-[20px] rounded-sm shrink-0 object-cover")}
          />
        )}
        {message.type === "AUDIO" && (
          <div className="flex items-center text-[#6A7485] gap-x-[6px] text-[13px] font-normal ">
            <Mic size={16} color="#6A7485" />
            پیام صوتی
          </div>
        )}
        <div className=" text-[#6A7485] text-[13px] font-normal ">{text}</div>
      </div>

      <div
        className="p-2 size-[42px] aspect-square group cursor-pointer rounded-full bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center  "
        onClick={(e) => {
          e.stopPropagation();

          setReplyMessageId(null);
        }}
      >
        <X className=" opacity-70 group-hover:opacity-100  " />
      </div>
    </div>
  );
}
