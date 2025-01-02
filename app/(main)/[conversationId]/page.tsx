import Main from "@/components/main";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

const ConversationId = async (props: {
  params: Promise<{
    conversationId: string;
  }>;
}) => {
  const param = (await props.params).conversationId;
  // if (!!param) {
  //   redirect("/");
  // }

  const token = await convexAuthNextjsToken();
  // const user = await fetchQuery(api.user.getUser, {}, { token });

  const Ispart = await fetchQuery(
    api.chat.getChat,
    { id: param as Id<"chats"> },
    { token }
  );

  if (Ispart === null) {
    redirect("/");
  }

  return (
    <>
      <div className="w-full h-full">
        <Main param={param} />
      </div>
    </>
  );
};

export default ConversationId;
