"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2 } from "lucide-react";
import { cn, formatMessageDate } from "@/lib/utils";
import ChatMessage, { ScrollDown, TypingLeft } from "./scroll-down";
import { api } from "@/convex/_generated/api";
import usePresence from "@/hooks/usePresence";
import { User } from "./message.list";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { usePaginatedQuery } from "convex/react";
import { InView, useInView } from "react-intersection-observer";
import { Id } from "@/convex/_generated/dataModel";

export default function Messages({
  chatId,
  other,
  user,
  unreadMessagesCount,
}: {
  chatId: Id<"chats"> | undefined;
  other?: string | undefined;
  user?: User;
  unreadMessagesCount: number | null | undefined;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const unReadDiv = useRef<HTMLDivElement | null>(null);
  const [goDown, setGoDown] = useState(true);
  const currentUser = user?._id ? user._id : "";

  console.log({ unreadMessagesCount });

  const paramValue = chatId ? chatId : "";

  const [data, others, updatePresence] = usePresence(paramValue, currentUser, {
    text: "",

    typing: false as boolean,
  });
  const presentOthers = (others ?? []).filter((p) => p.present)[0];

  const scrol = useChatScroll({
    bottomRef,
    chatRef,
    setGoDown,
  });

  const queryKey = useMemo(() => `chat:${paramValue}`, [paramValue]);

  const chatIdd = chatId ?? chatId;
  const cc = chatIdd!;

  // const { data: messages, isPending } = useQuery(
  //   convexQuery(api.message.messages, { chatId: cc })
  // );

  const {
    results: messages,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.message.messages,
    { chatId: cc },
    { initialNumItems: 10 }
  );

  const isloadingData = status === "LoadingMore";

  const { ref, inView, entry } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && status === "CanLoadMore") {
      // console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
      loadMore(10);
    }
  }, [InView]);

  // console.log({ messages, inView, status });

  const groupedMessages = useMemo(() => {
    if (!messages) return {};
    return messages.reduce(
      (acc, message) => {
        const dateKey = formatMessageDate(new Date(message._creationTime));
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(message);
        return acc;
      },
      {} as Record<string, typeof messages>
    );
  }, [messages]);

  const HandleScrollDown = useCallback(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  // if (status === "pending") {
  // if (!messages) {
  if (isLoading) {
    return (
      <div className=" w-full h-full flex justify-center my-2 ">
        <Loader2 className="size-8 text-zinc-500 animate-spin " />
      </div>
    );
  }

  return (
    <div className=" flex-1 overflow-hidden relative isolate ">
      <ScrollDown
        goDown={goDown}
        func={HandleScrollDown}
        chatId={paramValue}
        queryKey={queryKey}
        unreadMessagesCount={unreadMessagesCount}
      />
      <div
        className={cn(
          "w-full  p-2  overflow-y-auto flex  flex-col h-full  [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-md"
        )}
        ref={chatRef}
      >
        <div
          className="h-1"
          ref={(el) => {
            if (el) {
              const observer = new IntersectionObserver(
                ([entry]) => {
                  if (entry.isIntersecting && status === "CanLoadMore") {
                    loadMore(10);
                  }
                },
                {
                  threshold: 1.0,
                }
              );
              observer.observe(el);
              return () => observer.disconnect();
            }
          }}
        ></div>
        {isloadingData && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="mb-4 isolate">
            <div className="text-center text-sm text-gray-500 my-2 sticky top-0 rtlDir z-[200] w-full flex items-center justify-center">
              <div className="px-2 py-1 bg-gray-100 rounded-full">{date}</div>
            </div>
            {msgs.map((message) => (
              <ChatMessage
                key={message._id}
                message={message}
                isCurrentUser={message.senderId === currentUser}
              />
            ))}
          </div>
        ))}
        <div ref={bottomRef} />

        {presentOthers && presentOthers.data.typing && (
          <TypingLeft message="typing..." />
        )}
      </div>
    </div>
  );
}

// useLayoutEffect(() => {
//   // const storedScrollPosition = sessionStorage.getItem(`scrollPos-${chatId}`);

//   const chatElement = chatRef.current;
//   const unReadElement = chatRef.current;

//   if (!storedScrollPosition) {
//     bottomRef.current?.scrollIntoView({
//       behavior: "instant",
//     });
//   }

//   if (storedScrollPosition && chatElement) {
//     chatElement.scrollTop = parseInt(storedScrollPosition, 10);
//   } else if (storedScrollPosition && unReadElement) {
//   }

//   return () => {
//     if (chatElement) {
//       sessionStorage.setItem(
//         `scrollPos-${chatId}`,
//         chatElement.scrollTop.toString()
//       );
//     }
//   };
// }, [chatId]);
