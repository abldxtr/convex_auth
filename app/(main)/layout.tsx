import {
  convexAuthNextjsToken,
  isAuthenticatedNextjs,
} from "@convex-dev/auth/nextjs/server";
import Message_list from "@/components/message.list";
import { redirect } from "next/navigation";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await convexAuthNextjsToken();
  // const isAuth = await isAuthenticatedNextjs();

  // if (!isAuth) {
  //   redirect("/register");
  // }
  const user = await fetchQuery(api.user.getUser, {}, { token });
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
  return (
    <>
      {/* <div className="w-full max-w-[2400px] isolate mx-auto flex h-dvh  overflow-hidden"> */}
      {/* <Message_list user={user} preloadedChatList={preloadedChatList} /> */}
      {children}
      {/* </div> */}
    </>
  );
}
