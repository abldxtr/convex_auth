"use client";

import MessageHeader from "./message/m-header";
import UserList, { Account, UserListLoading, userList } from "./message/m-list";
import { useMediaQuery } from "usehooks-ts";
import { useGlobalContext } from "@/context/globalContext";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreateChat, CreateChatIcon } from "./create-chat";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { cn } from "@/lib/utils";
// import Main from "./main";

export type users = {
  id: string;
  initiator: User;
  participant: User;
  messages: {
    createdAt: Date;
    content: string;
  }[];
}[];

export type User = {
  _id: Id<"users">;
  _creationTime: number;
  name?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  image?: string | undefined;
  emailVerificationTime?: number | undefined;
  phoneVerificationTime?: number | undefined;
  isAnonymous?: boolean | undefined;
} | null;

export type chatList = {
  unreadMessagesCount: number;
  lastMessage: {
    _id: Id<"messages">;
    _creationTime: number;
    type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
    content: string;
    senderId: string;
    receiverId: string;
    chatId: string;
    status: "SENT" | "DELIVERED" | "READ";
    opupId: string;
    image: string[];
  } | null;

  unreadMessagesCountInitiator: number;
  unreadMessagesCountParticipant: number;
  initiatorId: string;
  participantId: string;

  _id: Id<"chats">;
  _creationTime: string;
}[];

export type Chat = {
  _id: Id<"chats">;
  _creationTime: number;
  initiatorId: string;
  participantId: string;
  unreadMessagesCountInitiator: number;
  unreadMessagesCountParticipant: number;
} | null;

export default function Message_list({
  user,
  chat,
  preloadedChatList,
}: {
  user?: User;
  preloadedChatList: Preloaded<typeof api.chat.chatList>;
  chat?: Chat;
}) {
  const { mobileMenue, setMobileMenue, chatIdActive, setChatIdActive } =
    useGlobalContext();
  // const param = useParams<{ conversationId: string }>();
  // const matches = useMediaQuery("(min-width: 768px)");

  // useEffect(() => {
  //   if (!!param.conversationId && matches) {
  //     setMobileMenue(false);
  //   } else if (!matches && !!param.conversationId) {
  //     setMobileMenue(true);
  //   }
  //   setChatIdActive(param.conversationId);
  // }, [param.conversationId, matches]);

  const chatlist = usePreloadedQuery(preloadedChatList);

  return (
    <>
      {/* <div
        className={cn(
          " overflow-y-auto overflow-x-hidden z-[10] bg-[#fcfdfd]  scrl fixed top-0 left-0 h-dvh md:w-[400px] w-full  ",
          mobileMenue
            ? "  -translate-x-full pointer-events-none   "
            : " translate-x-0 transition-all duration-300 "
        )}
      > */}
      <section className=" lg:flex  relative  border-x-[1px] border-[#eff3f4] h-full w-full  ">
        <CreateChatIcon />
        <div className="flex  w-full flex-col isolate ">
          <div className=" w-full sticky top-0 z-10 bg-[#fcfdfd] ">
            <MessageHeader />
            <Account user={user} />
          </div>
          <div className=" w-full h-full overflow-y-auto relative bg-[#fcfdfd]  ">
            {!chatlist
              ? [...new Array(6)].map((i, index) => {
                  return <UserListLoading key={index} />;
                })
              : chatlist?.map((item) => {
                  const otherUser =
                    chat?.initiatorId === user?._id
                      ? chat?.participantId
                      : chat?.initiatorId;
                  const lastMessage = item.lastMessage;
                  const date = item.lastMessage?._creationTime;
                  const unReadMess = item.unreadMessagesCount;
                  const active = item._id === chatIdActive ? true : false;
                  const href = `${item._id}`;
                  const channelName = item.name?.name ?? item._id;
                  const img = item.name?.image;

                  const userItem: userList = {
                    id: item._id,
                    active,
                    date,
                    href,
                    lastMessage,
                    name: otherUser!,
                    currentUser: user?._id,
                    channelName,
                    img,
                    unReadMess,
                  };

                  return <UserList key={item._id} user={userItem} />;
                })}
          </div>
        </div>
      </section>
      {/* </div> */}
      <CreateChat id={user!} />
    </>
  );
}
