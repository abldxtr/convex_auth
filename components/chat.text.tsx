"use client";

import ChatHeader from "./chat-header";
import InputChat from "./chat.input";
import Messages from "./message";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Message_list, { Chat, User } from "./message.list";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { Preloaded } from "convex/react";
import { useGlobalContext } from "@/context/globalContext";
import { useMediaQuery } from "usehooks-ts";
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  MotionConfig,
  PanInfo,
  motion,
  useAnimation,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";

// Unified animation configuration
const springConfig = {
  stiffness: 300,
  damping: 30,
  mass: 1,
  restDelta: 0.001,
  restSpeed: 0.001,
};

const transitionConfig = {
  type: "spring",
  ...springConfig,
  duration: 0.5,
};

export default function Chat_text(props: {
  param: string;
  user?: User;
  preloadedChatList: Preloaded<typeof api.chat.chatList>;
  chat?: Chat;
}) {
  const router = useRouter();
  const chat = useQuery(api.chat.getChat, { id: props.param as Id<"chats"> });
  const unreadMessagesCount = useQuery(api.chat.unreadCountChat, {
    chatId: props.param as Id<"chats">,
  });
  const { mobileMenue, setMobileMenue, chatIdActive, setChatIdActive } =
    useGlobalContext();
  const param = useParams<{ conversationId: string }>();

  const matches = useMediaQuery("(min-width: 768px)");

  const other =
    chat?.initiatorId === props.user?._id
      ? chat?.participantId
      : chat?.initiatorId;

  const otherUser = useQuery(api.user.getUserById, {
    id: other as Id<"users">,
  });

  const mainControls = useAnimation();
  const x = useMotionValue(0);
  const springX = useSpring(x, {
    damping: 40,
    stiffness: 400,
    mass: 0.1,
  });

  const opacity = useTransform(springX, [0, window.innerWidth], [1, 0.8]);

  useEffect(() => {
    if (mobileMenue && !matches && param.conversationId) {
      mainControls
        .start({
          x: 0,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 40,
            duration: 0.5,
          },
        })
        .then(() => {
          // setChatIdActive(null);
        });
    }
  }, [
    mobileMenue,
    matches,
    param.conversationId,
    mainControls,
    setChatIdActive,
  ]);

  const handleDragStart = () => {
    mainControls.stop();
  };

  const handleDrag = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x < 0) return;
    mainControls.set({
      x: info.offset.x,
      opacity: 1 - info.offset.x / window.innerWidth,
    });
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (offset > window.innerWidth * 0.4 || velocity > 500) {
      // setChatIdActive(null);
      mainControls
        .start({
          x: window.innerWidth,
          opacity: 0.8,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 40,
            duration: 0.5,
          },
        })
        .then(() => {
          // setChatIdActive(null);
        });
    } else {
      mainControls.start({
        x: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 40,
          duration: 0.5,
        },
      });
    }
  };

  useEffect(() => {
    if (param.conversationId && !matches) {
      mainControls.set({ x: window.innerWidth, opacity: 0 });
      mainControls.start({
        x: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 40,
          duration: 0.5,
        },
      });
    }
  }, [param.conversationId, matches, mainControls]);

  return (
    <MotionConfig transition={transitionConfig}>
      <div className="w-full max-w-[2400px] isolate mx-auto flex h-dvh overflow-hidden">
        <AnimatePresence mode="wait">
          {param.conversationId && (
            <motion.div
              key="chat-content"
              {...(!matches && {
                drag: "x",
                dragDirectionLock: true,
                onDragStart: handleDragStart,
                onDrag: handleDrag,
                onDragEnd: handleDragEnd,
                dragConstraints: { left: 0, right: 0 },
                dragElastic: 0,
              })}
              animate={mainControls}
              initial={false}
              // exit={{
              //   x: window.innerWidth,
              //   opacity: 0,
              //   scale: 0.95,
              //   transition: transitionConfig,
              // }}
              style={{ opacity }}
              className={cn(
                // "fixed inset-0 z-20 md:relative md:z-0",
                // "overflow-auto flex flex-1 h-full md:pl-[400px] w-full",
                // "bg-white touch-pan-y will-change-transform",
                " overflow-auto flex flex-1 h-full md:pl-[400px] z-[9] w-full relative"
              )}
            >
              <section className="w-full flex min-w-0 isolate h-dvh relative overflow-hidden border-r-[1px] border-[#eff3f4] border-l-[1px] lg:border-l-0 bg-[rgb(223,_225,_230)]">
                <div className="flex-1 h-full w-full flex flex-col relative before:absolute before:inset-0 before:bg-[url('/new-pattern-6.png')] before:opacity-5 before:[background-size:_300px]">
                  <ChatHeader other={otherUser} />
                  <Messages
                    chatId={props.param as Id<"chats">}
                    other={other}
                    user={props.user}
                    unreadMessagesCount={unreadMessagesCount}
                    otherUser={otherUser}
                  />
                  <InputChat
                    param={props.param}
                    other={other! as Id<"users">}
                    chatId={props.param as Id<"chats">}
                    user={props.user}
                    otherUser={otherUser}
                  />
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          // animate={{
          //   x: matches ? 0 : param.conversationId ? "-100%" : 0,
          // }}
          className={cn(
            // "overflow-y-auto overflow-x-hidden bg-[#fcfdfd] scrl",
            // "fixed ",
            // "h-dvh md:w-[400px] w-full",
            // "z-10 md:z-0",
            !param.conversationId && "z-30",
            // "will-change-transform",
            " overflow-y-auto overflow-x-hidden z-[1000] bg-[#fcfdfd]  scrl fixed top-0 left-0 h-dvh md:w-[400px] w-full  "
          )}
        >
          <Message_list
            user={props.user}
            preloadedChatList={props.preloadedChatList}
          />
        </motion.div>
      </div>
    </MotionConfig>
  );
}
