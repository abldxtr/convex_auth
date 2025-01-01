"use client";

// import { user } from "@/lib/definitions";
import ChatHeader from "./chat-header";
import InputChat from "./chat.input";
import Messages from "./message";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Preloaded,
  usePreloadedQuery,
  useMutation,
  useQuery,
} from "convex/react";
import { User } from "./message.list";

export default function Chat_text(props: {
  // preloadedMessages: Preloaded<typeof api.message.messages>;
  // preloadedChat: Preloaded<typeof api.chat.getChat>;

  param: string;
  user?: User;
  chatlist?: any;
}) {
  // const usr = useSession();
  // const currentUser = usr.data?.user.id ? usr.data?.user.id : "";
  // const messages = usePreloadedQuery(props.preloadedMessages);
  // const chat = usePreloadedQuery(props.preloadedChat);
  const chat = useQuery(api.chat.getChat, { id: props.param as Id<"chats"> });

  if (props.param) {
    console.log("props.param", props.param);

    const other =
      chat?.initiatorId === props.user?._id
        ? chat?.participantId
        : chat?.initiatorId;

    const otherUser = useQuery(api.user.getUserById, {
      id: other as Id<"users">,
    });

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
          <ChatHeader other={otherUser} />
          <Messages
            //  text={message}
            chatId={props.param}
            other={other}
            user={props.user}
          />

          <InputChat
            param={props.param}
            other={other! as Id<"users">}
            // message={message}
            chatId={props.param}
            user={props.user}
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

// {props.param ? (
//   <>
//     {/* <ChatHeader other={other} /> */}

//     <Messages
//       //  text={message}
//       chatId={props.param}
//       other={other}
//     />

//     <InputChat
//       param={props.param}
//       other={other}
//       // message={message}
//       chatId={props.param}
//     />
//   </>
// ) : (
//   <>
//
//   </>
// )}
