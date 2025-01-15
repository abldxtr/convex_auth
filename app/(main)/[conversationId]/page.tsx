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
  const token = await convexAuthNextjsToken();

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
      <Main param={param} />
    </>
  );
};

export default ConversationId;
