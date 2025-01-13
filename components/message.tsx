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
import { InView, useInView } from "react-intersection-observer";
import { Id } from "@/convex/_generated/dataModel";
import {
  useMutation as TanStackMutation,
  useQuery,
} from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useGlobalContext } from "@/context/globalContext";

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
  const [goDown, setGoDown] = useState(false);
  const currentUser = user?._id ?? user?._id;
  const firstUnreadRef = useRef<string | null>(null);
  const [isScroll, setInScroll] = useState(false);

  const paramValue = chatId ?? chatId;
  const chatIdd = chatId ?? chatId;
  const cc = chatIdd!;

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
  const { scrollPos, setScrollPos, toScroll, setToScroll, setScrollBound } =
    useGlobalContext();
  const { data: messages, isPending } = useQuery(
    convexQuery(api.message.messages, { chatId: cc })
  );

  useEffect(() => {
    const chatContainer = chatRef?.current;
    const handleScroll = () => {
      if (chatContainer) {
        const distanceFromBottom =
          chatContainer.scrollHeight -
          chatContainer.scrollTop -
          chatContainer.clientHeight;
        const distanceFromTop = chatContainer.scrollTop;

        const scrollBound = chatContainer.scrollHeight / 3;

        setGoDown(distanceFromBottom > 50);
        setScrollPos(distanceFromBottom);
        setScrollBound(scrollBound);
      }
      setInScroll(true);
    };
    if (chatContainer && !goDown) {
      const distanceFromBottom =
        chatContainer.scrollHeight -
        chatContainer.scrollTop -
        chatContainer.clientHeight;
      // const distanceFromTop = chatContainer.scrollTop;

      setGoDown(distanceFromBottom > 50);
    }

    chatContainer?.addEventListener("scroll", handleScroll);
    // window.addEventListener("scroll", handleScroll);

    return () => {
      chatContainer?.removeEventListener("scroll", handleScroll);
    };
    // }, [shouldLoadMore, loadMore, chatRef, setGoDown]);
  }, [setGoDown, chatId, chatRef.current]);

  useEffect(() => {
    if (toScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        // block: "center",
      });

      setToScroll(false);
    }
  }, [toScroll, setToScroll, bottomRef.current]);

  useLayoutEffect(() => {
    const storedScrollPosition = sessionStorage.getItem(`scrollPos-${chatId}`);
    console.log("useLayoutEffect");
    console.log(bottomRef.current);

    if (!firstUnreadRef.current && messages) {
      console.log("firstUnreadMessage && message");

      const firstUnreadMessage = messages.find(
        (message) =>
          message.status !== "READ" && message.senderId !== currentUser
      );

      if (firstUnreadMessage) {
        firstUnreadRef.current = firstUnreadMessage._id; // ذخیره ID پیام
        const unreadElement = document.getElementById(
          `message-${firstUnreadRef.current}`
        );
        console.log("firstUnreadMessage");

        if (unreadElement) {
          unreadElement.scrollIntoView({
            behavior: "instant",
            block: "center",
          });
        }

        // if (storedScrollPosition && chatRef.current) {
        //   chatRef.current.scrollTop = parseInt(storedScrollPosition, 10);
        //   console.log("storedScrollPosition");
        // }
      } else if (storedScrollPosition && chatRef.current) {
        console.log("storedScrollPosition");

        chatRef.current.scrollTop = parseInt(storedScrollPosition, 10);
      } else if (bottomRef.current) {
        console.log("bottomRef.current");
        bottomRef.current.scrollIntoView({
          behavior: "instant",
          block: "center",
        });
        console.log("bottomref");
      }
    }

    return () => {
      if (chatRef.current && isScroll) {
        sessionStorage.setItem(
          `scrollPos-${chatId}`,
          chatRef.current.scrollTop.toString()
        );
      }
    };
  }, [
    chatId,
    firstUnreadRef.current,
    bottomRef.current,
    chatRef.current,
    isScroll,
  ]);

  // const isloadingData = status === "LoadingMore";

  // const { ref, inView, entry } = useInView({
  //   threshold: 0,
  // });

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
          "w-full  md:p-2 !md:pr-0  overflow-y-auto flex  flex-col h-full  [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-md"
        )}
        ref={chatRef}
      >
        {/* {isloadingData && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
          </div>
        )} */}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="mb-4 isolate">
            <div className="text-center text-sm text-gray-500 my-2 sticky top-0 rtlDir z-[200] w-full flex items-center justify-center">
              <div className="px-2 py-1 bg-gray-100 rounded-full mt-2 md:mt-0 ">
                {date}
              </div>
            </div>
            {msgs.map((message) => {
              // if (message.type === "AUDIO") {
              //   console.log(message.url);
              //   // return;
              // }
              const isFirstUnread = message._id === firstUnreadRef.current; // فقط یک بار
              return (
                <div key={message._id} id={`message-${message._id}`}>
                  {isFirstUnread && (
                    <div className="bg-yellow-100 text-yellow-800 text-center py-1 rounded-md ">
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

// }

// if (firstUnreadRef.current) {
//   const unreadElement = document.getElementById(
//     `message-${firstUnreadRef.current}`
//   );

//   if (unreadElement) {
//     unreadElement.scrollIntoView({
//       behavior: "instant",
//       block: "end",
//     });
//   }
//   console.log("firstUnreadMessage");
// } else if (storedScrollPosition && chatRef.current) {
//   chatRef.current.scrollTop = parseInt(storedScrollPosition, 10);
//   console.log("storedScrollPosition");
// } else if (bottomRef.current) {
//   bottomRef.current.scrollIntoView({
//     behavior: "instant",
//   });
//   console.log("bottomref");
// }
