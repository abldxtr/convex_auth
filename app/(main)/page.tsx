import CurrentUser from "@/components/current-user";
import {
  convexAuthNextjsToken,
  isAuthenticatedNextjs,
} from "@convex-dev/auth/nextjs/server";

import Message_list from "@/components/message.list";
import Main from "@/components/main";
import { redirect } from "next/navigation";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function Home() {
  const token = await convexAuthNextjsToken();
  const isAuth = await isAuthenticatedNextjs();
  // console.log({ token });
  console.log({ isAuth });

  if (!isAuth) {
    redirect("/register");
  }
  // const user = await fetchQuery(api.user.getUser, {}, { token });
  // // const chatList = await fetchQuery(
  // //   api.chat.chatList,
  // //   { id: user?._id! },
  // //   { token }
  // // );

  // const preloadedChatList = await preloadQuery(
  //   api.chat.chatList,
  //   // { id: user?._id!, chatId: param as Id<"chats"> }
  //   { id: user?._id }

  //   // { token }
  //   // پاس دادن headers به preloadQuery
  // );

  return (
    <>
      {/* <Message_list
        user={user}
        // chatlist={chatList}
        preloadedChatList={preloadedChatList}
      /> */}
      <div className="w-full isolate mx-auto flex h-dvh  overflow-hidden">
        <Main param="" />
      </div>
    </>
  );
}
