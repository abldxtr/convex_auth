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
import { Id } from "@/convex/_generated/dataModel";
import {
  useMutation as TanStackMutation,
  useQuery as TanStackQuery,
  QueryClient,
} from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { AnimatePresence, motion } from "framer-motion";

import { useGlobalContext } from "@/context/globalContext";
import { useMessageScroll } from "@/hooks/use-message-scroll";
import { otherUser } from "./chat.input";
import { useMutation } from "convex/react";
import { useDeleteItem } from "@/context/delete-items-context";
import ReactionPicker from "./reaction-picker";

export default function Messages({
  chatId,
  other,
  user,
  unreadMessagesCount,
  otherUser,
}: {
  chatId: Id<"chats"> | undefined;
  other?: string | undefined;
  user?: User;
  unreadMessagesCount: number | null | undefined;
  otherUser?: otherUser;
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

  useLayoutEffect(() => {
    const storedScrollPosition = sessionStorage.getItem(`scrollPos-${chatId}`);

    if (!firstUnreadRef.current && messages) {
      const firstUnreadMessage = messages.find(
        (message) =>
          message.status !== "READ" && message.senderId !== currentUser
      );

      if (firstUnreadMessage) {
        firstUnreadRef.current = firstUnreadMessage._id;
        const unreadElement = document.getElementById(
          `message-${firstUnreadRef.current}`
        );

        if (unreadElement) {
          unreadElement.scrollIntoView({
            behavior: "instant",
            block: "center",
          });
        }
      } else if (storedScrollPosition && chatRef.current) {
        chatRef.current.scrollTop = parseInt(storedScrollPosition, 10);
      } else if (bottomRef.current) {
        bottomRef.current.scrollIntoView({
          behavior: "instant",
          block: "center",
        });
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

  const [data, others, updatePresence] = usePresence(
    paramValue!,
    currentUser!,
    {
      text: "",

      typing: false as boolean,
    }
  );
  const presentOthers = (others ?? []).filter((p) => p.present)[0];
  // const { mutate, isPending: seenMessageAllLoading } = TanStackMutation({
  //   mutationFn: useConvexMutation(api.message.seenMessageAll),
  // });

  const makeAllMessageSeen = useMutation(
    api.message.seenMessageAll
  ).withOptimisticUpdate((localStore, mutationArg) => {
    const { chatId, userId } = mutationArg;

    const res = localStore.getQuery(api.message.messages, {
      chatId,
    });
    if (res) {
      // Map through messages and update status if conditions match
      const updatedMessages = res.map((item) => {
        if (item.receiverId === userId && item.status === "SENT") {
          return {
            ...item,
            status: "READ" as const,
          };
        }
        return item;
      });

      // Set the updated messages array
      localStore.setQuery(api.message.messages, { chatId }, updatedMessages);
    }
  });
  const {
    setScrollPos,
    toScroll,
    setToScroll,
    setScrollBound,
    setIsVisible,
    messageReaction,
    isVisibleReaction,
    setIsVisibleReaction,
    position,
    setPosition,
    scrollPos,
    scrollBound,
  } = useGlobalContext();
  const {
    deleteItems,
    setDeleteItems,
    items,
    setItems,
    DisableDeleteItmes,
    isDragging,
    setIsDragging,
  } = useDeleteItem();
  useEffect(() => {
    setDeleteItems(false);
    setItems(null);
  }, [chatId]);

  // const { data: messages, isPending } = TanStackQuery(
  //   convexQuery(api.message.messages, { chatId: cc })
  // );
  const messages = useQuery(api.message.messages, { chatId: cc });
  useEffect(() => {
    if (scrollPos < scrollBound) {
      setToScroll(true);
    }
  }, [messages]);

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
      setIsVisible(false);
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

  useMessageScroll({
    resetDelay: 1000,
    scrollOptions: {
      behavior: "instant",
      block: "center",
    },
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

  // if (isPending) {
  if (messages === undefined) {
    return (
      <div className=" w-full h-full flex justify-center my-2 ">
        <Loader2 className="size-8 text-zinc-500 animate-spin " />
      </div>
    );
  }

  return (
    <>
      <ReactionPicker
        isVisible={isVisibleReaction}
        position={position}
        setIsVisible={setIsVisibleReaction}
        setPosition={setPosition}
        message={messageReaction}
        currentUserId={user}
      />

      <div className=" flex-1 overflow-hidden relative isolate ">
        <ScrollDown
          goDown={goDown}
          func={HandleScrollDown}
          chatId={paramValue!}
          userId={currentUser!}
          unreadMessagesCount={unreadMessagesCount}
          mutate={makeAllMessageSeen}
        />
        <motion.div
          className={cn(
            "w-full    overflow-y-auto flex  flex-col h-full  ",
            "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-md"
            // "  messages-parent "
          )}
          ref={chatRef}
        >
          {/* <AnimatePresence initial={false}> */}
          {Object.entries(groupedMessages).map(([date, msgs], index) => (
            <div key={`${index}-${date}`} className="mb-4 isolate z-[1]  ">
              <div className="text-center text-sm text-gray-500 my-2 sticky z-[100] top-0 rtlDir  w-full flex items-center justify-center">
                <div className="px-2 py-1 bg-gray-100 rounded-full mt-2  ">
                  {date}
                </div>
              </div>
              {msgs.map((message, index) => {
                const isFirstUnread = message._id === firstUnreadRef.current;
                return (
                  <motion.div
                    key={message._id}
                    id={`message-${message._id}`}
                    className=" hover:bg-[rgba(66,82,110,0.03)] transition-all group  rounded-md z-[1]"
                  >
                    {isFirstUnread && (
                      <div className="bg-yellow-100 text-yellow-800 text-center py-1 rounded-md ">
                        پیام‌های خوانده‌نشده
                      </div>
                    )}
                    <ChatMessage
                      key={message._id}
                      message={message}
                      isCurrentUser={message.senderId === currentUser}
                      current_user={user}
                      other_user={otherUser}
                    />
                  </motion.div>
                );
              })}
            </div>
          ))}
          <div ref={bottomRef} />

          {presentOthers && presentOthers.data.typing && (
            <TypingLeft message="typing..." />
          )}
          {/* </AnimatePresence> */}
        </motion.div>
      </div>
    </>
  );
}
