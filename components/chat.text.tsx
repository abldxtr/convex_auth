"use client";

import ChatHeader from "./chat-header";
import InputChat from "./chat.input";
import Messages from "./message";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Message_list, { type Chat, type User } from "./message.list";
import { useQuery } from "convex-helpers/react/cache/hooks";
import type { Preloaded } from "convex/react";
import { useGlobalContext } from "@/context/globalContext";
import { useMediaQuery } from "usehooks-ts";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  type PanInfo,
  motion,
  useAnimation,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useDeleteItem } from "@/context/delete-items-context";

export default function Chat_text(props: {
  param: string;
  user?: User;
  preloadedChatList: Preloaded<typeof api.chat.chatList>;
  chat?: Chat;
}) {
  const chat = useQuery(api.chat.getChat, { id: props.param as Id<"chats"> });
  const unreadMessagesCount = useQuery(api.chat.unreadCountChat, {
    chatId: props.param as Id<"chats">,
  });
  const { mobileMenue, setMobileMenue, chatIdActive, setChatIdActive } =
    useGlobalContext();
  const { setIsDragging } = useDeleteItem();
  const param = useParams<{ conversationId: string }>();

  const matches = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const handleLayoutChange = async () => {
      if (!!param.conversationId && matches) {
        await controls.start({
          x: -SIDEBAR_WIDTH,
          transition: { duration: 0.3, ease: "easeInOut" },
        });
        setMobileMenue(false);
      } else if (!matches && !!param.conversationId) {
        await controls.start({
          x: 0,
          transition: { duration: 0.3, ease: "easeInOut" },
        });
        setMobileMenue(true);
      }
      setChatIdActive(param.conversationId);
    };

    handleLayoutChange();
  }, [param.conversationId, matches]);

  const other =
    chat?.initiatorId === props.user?._id
      ? chat?.participantId
      : chat?.initiatorId;

  const otherUser = useQuery(api.user.getUserById, {
    id: other as Id<"users">,
  });

  const SIDEBAR_WIDTH = matches ? 400 : window.innerWidth;
  const controls = useAnimation();
  const x = useMotionValue(mobileMenue ? -SIDEBAR_WIDTH : 0);

  // Use spring for smoother motion
  const springConfig = {
    stiffness: 300,
    damping: 30,
    bounce: 0,
    duration: 0.3,
  };
  const springX = useSpring(x, springConfig);

  const [isOpen, setIsOpen] = useState(!mobileMenue);

  // Transform spring value instead of raw x
  const sidebarX = useTransform(
    springX,
    [-SIDEBAR_WIDTH, 0],
    [-SIDEBAR_WIDTH, 0]
  );

  // Update x and isOpen when mobileMenue changes
  useEffect(() => {
    const targetX = mobileMenue ? -SIDEBAR_WIDTH : 0;
    controls.start({
      x: targetX,
      opacity: mobileMenue ? 0 : 1, // Added opacity control
      transition: {
        type: "spring",
        bounce: 0,
      },
    });
    x.set(targetX);
    setIsOpen(!mobileMenue);
  }, [mobileMenue, SIDEBAR_WIDTH, controls, x]);

  const handleDragStart = () => {
    setIsDragging(true);
    controls.stop();
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Calculate the target position based on velocity and current position
    const currentX = x.get();
    const projectedEndpoint = currentX + velocity * 0.2;

    // Determine direction based on velocity and offset
    const shouldOpen =
      (Math.abs(velocity) > 300 && velocity > 0) ||
      (Math.abs(velocity) <= 300 && offset > SIDEBAR_WIDTH * 0.4);

    if (shouldOpen) {
      openSidebar(velocity);
      setMobileMenue(false);
    } else {
      closeSidebar(velocity);
      setMobileMenue(true);
    }
  };

  const handleDrag = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const currentX = x.get();
    const newX = currentX + info.delta.x;

    // Add resistance at edges
    if (newX > 0) {
      x.set(newX * 0.4); // More resistance when pulling beyond open position
    } else if (newX < -SIDEBAR_WIDTH) {
      const overflowX = newX + SIDEBAR_WIDTH;
      x.set(-SIDEBAR_WIDTH + overflowX * 0.4); // Resistance when pulling beyond closed position
    } else {
      x.set(newX);
    }
  };

  const openSidebar = React.useCallback(
    (velocity = 0) => {
      setIsOpen(true);
      const transition = {
        type: "spring",
        bounce: 0,
      };

      controls.start({
        x: 0,
        transition,
      });
      x.set(0);
    },
    [controls, x]
  );

  const closeSidebar = React.useCallback(
    (velocity = 0) => {
      setIsOpen(false);
      const transition = {
        type: "spring",
        bounce: 0,
      };

      controls.start({
        x: -SIDEBAR_WIDTH,
        transition,
      });
      x.set(-SIDEBAR_WIDTH);
    },
    [controls, SIDEBAR_WIDTH, x]
  );

  return (
    <>
      <div className="w-full max-w-[2400px] isolate mx-auto flex h-dvh  overflow-hidden">
        <motion.div
          {...(!matches && {
            // Only enable drag functionality on mobile
            drag: "x",
            dragDirectionLock: true,
            onDragStart: handleDragStart,
            onDrag: handleDrag,
            onDragEnd: handleDragEnd,
            dragConstraints: { left: 0, right: 0 },
            dragElastic: 0,
          })}
          className=" overflow-auto flex flex-1 h-full md:pl-[400px] z-[9] w-full relative"
        >
          {/* <div className=" overflow-auto flex flex-1 h-full md:pl-[400px] z-[9] w-full relative"> */}
          <section className="w-full flex min-w-0 isolate h-dvh realtive overflow-hidden  border-r-[1px] border-[#eff3f4] border-l-[1px] lg:border-l-0  bg-[rgb(223,_225,_230)]  ">
            <div className="  flex-1 h-full w-full flex flex-col relative before:absolute before:inset-0 before:bg-[url('/new-pattern-6.png')] before:opacity-5 before:[background-size:_300px]">
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
        <motion.div
          style={{ x: sidebarX }}
          initial={false}
          className={cn(
            " overflow-y-auto overflow-x-hidden z-[1000] bg-[#fcfdfd]  scrl fixed top-0 left-0 h-dvh md:w-[400px] w-full  ",
            mobileMenue ? "  -translate-x-full    " : " translate-x-0  "
          )}
          transition={{
            type: "spring",
            bounce: 0,
            duration: 0.3,
          }}
        >
          <Message_list
            user={props.user}
            preloadedChatList={props.preloadedChatList}
          />
        </motion.div>
      </div>
    </>
  );
}
