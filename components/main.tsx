import Chat_text from "./chat.text";
import { api } from "@/convex/_generated/api";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import ChatHeader from "./chat-header";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

export default async function Main({ param }: { param: string }) {
  const token = await convexAuthNextjsToken();
  const user = await fetchQuery(api.user.getUser, {}, { token });

  // const preloadedChatList = await preloadQuery(
  //   api.chat.chatList,
  //   { id: user?._id },
  //   { token }
  // );

  if (param) {
    return (
      <div
        className=" overflow-auto flex flex-1 h-full 
      md:pl-[400px] z-[9] w-full relative
      
      "
      >
        <Chat_text
          param={param}
          user={user}
          // preloadedChatList={preloadedChatList}
        />
      </div>
    );
  } else {
    return (
      <div
        className=" overflow-auto flex flex-1 h-full 
      md:pl-[400px] z-[9] w-full relative
      
      "
      >
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
      </div>
    );
  }
}
