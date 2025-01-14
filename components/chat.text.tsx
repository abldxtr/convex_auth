"use client";

import ChatHeader from "./chat-header";
import InputChat from "./chat.input";
import Messages from "./message";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { User } from "./message.list";
import { useRouter } from "next/navigation";
import { useQuery } from "convex-helpers/react/cache/hooks";

export default function Chat_text(props: {
  param: string;
  user?: User;
  // preloadedChatList: Preloaded<typeof api.chat.chatList>;
}) {
  const router = useRouter();
  const chat = useQuery(api.chat.getChat, { id: props.param as Id<"chats"> });
  const unreadMessagesCount = useQuery(api.chat.unreadCountChat, {
    chatId: props.param as Id<"chats">,
  });

  const other =
    chat?.initiatorId === props.user?._id
      ? chat?.participantId
      : chat?.initiatorId;

  const otherUser = useQuery(api.user.getUserById, {
    id: other as Id<"users">,
  });

  if (props.param) {
    // console.log("props.param", props.param);

    return (
      <section
        className="w-full flex min-w-0 isolate h-dvh realtive
        overflow-hidden  border-r-[1px] border-[#eff3f4] border-l-[1px] lg:border-l-0 
        bg-[rgb(223,_225,_230)] 
        
  
        "
      >
        <div
          className="  flex-1 h-full w-full flex flex-col relative
        
      before:absolute before:inset-0 before:bg-[url('/new-pattern-6.png')] before:opacity-5 before:[background-size:_300px]
        
        "
        >
          <ChatHeader other={otherUser} />
          <Messages
            chatId={props.param as Id<"chats">}
            other={other}
            user={props.user}
            unreadMessagesCount={unreadMessagesCount}
            otherUser={otherUser}
          />

          <InputChat
            param={props.param}
            other={other! as Id<"users">}
            chatId={props.param as Id<"chats">}
            user={props.user}
            otherUser={otherUser}
          />
        </div>
      </section>
    );
  } else {
    return (
      <section
        className="w-full flex min-w-0 isolate h-dvh realtive
        overflow-hidden max-w-[920px]  border-r-[1px] border-[#eff3f4] border-l-[1px] lg:border-l-0 
        bg-[rgb(223,_225,_230)] 
        "
      >
        <div
          className="  flex-1 h-full w-full flex flex-col relative
      before:absolute before:inset-0 before:bg-[url('/new-pattern-6.png')] before:opacity-5 before:[background-size:_300px]
        "
        >
          <ChatHeader className=" bg-transparent " />
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-900 font-bold rtlDir ">
            <div className=" mb-[36px] ">
              <img src="/landing.svg" alt="landing" />
            </div>
            <div className=" text-[#091e42] text-[17px] leading-[26px]  ">
              برای شروع یکی از گفتگوها را انتخاب کنید
            </div>
          </div>
        </div>
      </section>
    );
  }
}
