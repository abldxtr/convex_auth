import Chat_text from "./chat.text";
import { api } from "@/convex/_generated/api";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import ChatHeader from "./chat-header";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import Message_list from "./message.list";
import { cn } from "@/lib/utils";

export default async function Main({ param }: { param: string }) {
  const token = await convexAuthNextjsToken();
  const user = await fetchQuery(api.user.getUser, {}, { token });

  // const preloadedChatList = await preloadQuery(
  //   api.chat.chatList,
  //   { id: user?._id },
  //   { token }
  // );

  // const chatList = await fetchQuery(
  //   api.chat.chatList,
  //   { id: user?._id! },
  //   { token }
  // );

  const preloadedChatList = await preloadQuery(
    api.chat.chatList,
    { id: user?._id },
    { token }
  );

  if (param) {
    return (
      <>
        <Chat_text
          param={param}
          user={user}
          preloadedChatList={preloadedChatList}
        />
        {/* <Message_list user={user} preloadedChatList={preloadedChatList} /> */}
      </>
    );
  } else {
    return (
      <>
        <div className="w-full max-w-[2400px] isolate mx-auto flex h-dvh  overflow-hidden">
          <div
            className={cn(
              " overflow-y-auto overflow-x-hidden z-[10] bg-[#fcfdfd]  scrl fixed top-0 left-0 h-dvh md:w-[400px] w-full  "
              // mobileMenue
              //   ? "  -translate-x-full pointer-events-none   "
              //   : " translate-x-0 transition-all duration-300 "
            )}
          >
            <Message_list user={user} preloadedChatList={preloadedChatList} />
          </div>

          <div className=" overflow-auto flex flex-1 h-full md:pl-[400px] z-[9] w-full relative">
            <section className="w-full flex min-w-0 isolate h-dvh realtive overflow-hidden  border-r-[1px] border-[#eff3f4] border-l-[1px] lg:border-l-0 bg-[rgb(223,_225,_230)] ">
              <div className="  flex-1 h-full w-full flex flex-col relative before:absolute before:inset-0 before:bg-[url('/new-pattern-6.png')] before:opacity-5 before:[background-size:_300px]">
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
        </div>
      </>
    );
  }
}
