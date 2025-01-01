import Main from "@/components/main";
import Message_list from "@/components/message.list";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery, preloadQuery } from "convex/nextjs";

interface IParams {
  conversationId: string;
}
// export const dynamic = "force-dynamic";
const ConversationId = async (props: {
  params: Promise<{
    conversationId: string;
  }>;
}) => {
  const param = (await props.params).conversationId;
  // const current = await auth();
  console.log("param", param);

  // if (!current) {
  //   return redirect("/login");
  // }

  // const userId = current.user!.id!;

  const token = await convexAuthNextjsToken();
  const user = await fetchQuery(api.user.getUser, {}, { token });
  // const chatList = await fetchQuery(
  //   api.chat.chatList,
  //   { id: user?._id!, chatId: param as Id<"chats"> },
  //   { token }
  // );
  if (!user?._id) {
    return null;
  }
  const chat = await fetchQuery(api.chat.getChat, { id: param as Id<"chats"> });
  const preloadedChatList = await preloadQuery(
    api.chat.chatList,
    // { id: user?._id!, chatId: param as Id<"chats"> }
    { id: user?._id }

    // { token }
    // پاس دادن headers به preloadQuery
  );

  // const test = useQuery();

  return (
    <>
      <Message_list
        user={user}
        // chatlist={chatList}
        chat={chat}
        preloadedChatList={preloadedChatList}
      />

      <div className="w-full h-full">
        <Main param={param} />
      </div>
    </>
  );
};

export default ConversationId;
