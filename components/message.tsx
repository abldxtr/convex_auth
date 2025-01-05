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
import { useMutation, usePaginatedQuery } from "convex/react";
import { InView, useInView } from "react-intersection-observer";
import { Id } from "@/convex/_generated/dataModel";
import {
  useMutation as TanStackMutation,
  useQuery,
} from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";

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
  const [goDown, setGoDown] = useState(false);
  const currentUser = user?._id ?? user?._id;
  const firstUnreadRef = useRef<string | null>(null); // ذخیره ID پیام خوانده‌نشده اول

  // console.log({ unreadMessagesCount });

  const paramValue = chatId ?? chatId;

  const [data, others, updatePresence] = usePresence(
    paramValue!,
    currentUser!,
    {
      text: "",

      typing: false as boolean,
    }
  );
  const presentOthers = (others ?? []).filter((p) => p.present)[0];
  const { mutate, isPending: seenMessageAllLoading } = TanStackMutation({
    mutationFn: useConvexMutation(api.message.seenMessageAll),
  });

  useEffect(() => {
    const chatContainer = chatRef?.current;
    const handleScroll = () => {
      if (chatContainer) {
        // console.log("scrollll");
        const distanceFromBottom =
          chatContainer.scrollHeight -
          chatContainer.scrollTop -
          chatContainer.clientHeight;
        const distanceFromTop = chatContainer.scrollTop;

        setGoDown(distanceFromBottom > 50);
      }
    };

    chatContainer?.addEventListener("scroll", handleScroll);
    window.addEventListener("scroll", handleScroll);

    return () => {
      chatContainer?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
    // }, [shouldLoadMore, loadMore, chatRef, setGoDown]);
  }, [chatRef, setGoDown]);

  const chatIdd = chatId ?? chatId;
  const cc = chatIdd!;

  const { data: messages, isPending } = useQuery(
    convexQuery(api.message.messages, { chatId: cc })
  );
  // const [hasScrolledToUnread, setHasScrolledToUnread] = useState(false);
  // const chatRef = chatRef.current;

  useLayoutEffect(() => {
    const storedScrollPosition = sessionStorage.getItem(`scrollPos-${chatId}`);

    if (!firstUnreadRef.current && messages) {
      const firstUnreadMessage = messages.find(
        (message) =>
          message.status !== "READ" && message.senderId !== currentUser
      );

      if (firstUnreadMessage) {
        firstUnreadRef.current = firstUnreadMessage._id; // ذخیره ID پیام
      }
    }

    if (firstUnreadRef.current) {
      const unreadElement = document.getElementById(
        `message-${firstUnreadRef.current}`
      );

      if (unreadElement) {
        unreadElement.scrollIntoView({
          behavior: "instant",
          block: "end",
        });
        // scrolledToUnread.current = true; // جلوگیری از اسکرول مجدد
      }
    } else if (storedScrollPosition && chatRef.current) {
      chatRef.current.scrollTop = parseInt(storedScrollPosition, 10);
    } else {
      bottomRef.current?.scrollIntoView({
        behavior: "instant",
      });
    }

    // ذخیره مقدار اولیه chatRef.current

    return () => {
      if (chatRef.current) {
        sessionStorage.setItem(
          `scrollPos-${chatId}`,
          chatRef.current.scrollTop.toString()
        );
      }
    };
  }, []);

  const isloadingData = status === "LoadingMore";

  const { ref, inView, entry } = useInView({
    threshold: 0,
  });

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

  if (isPending) {
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
        chatId={paramValue!}
        userId={currentUser!}
        unreadMessagesCount={unreadMessagesCount}
        mutate={mutate}
      />
      <div
        className={cn(
          "w-full  p-2  overflow-y-auto flex  flex-col h-full  [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-md"
        )}
        ref={chatRef}
      >
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
            {msgs.map((message) => {
              const isFirstUnread = message._id === firstUnreadRef.current; // فقط یک بار
              return (
                <div key={message._id} id={`message-${message._id}`}>
                  {isFirstUnread && (
                    <div className="bg-yellow-100 text-yellow-800 text-center py-2 rounded-md mb-2">
                      پیام‌های خوانده‌نشده
                    </div>
                  )}
                  <ChatMessage
                    key={message._id}
                    message={message}
                    isCurrentUser={message.senderId === currentUser}
                  />
                </div>
              );
            })}
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
