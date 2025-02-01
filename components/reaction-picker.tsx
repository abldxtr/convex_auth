"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { messageItem } from "./scroll-down";
import { useDeleteItem } from "@/context/delete-items-context";
import { User } from "./message.list";

interface Position {
  x: number;
  y: number;
}

interface Reaction {
  id: number;
  url: string;
  alt: string;
  selected?: boolean;
}

export type reaction = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  position: Position;
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
  message: messageItem | null;
  currentUserId: User | undefined;
};

export default function ReactionPicker({
  isVisible,
  setIsVisible,
  position,
  setPosition,
  message,
  currentUserId,
}: reaction) {
  // const [isVisible, setIsVisible] = useState(false);
  // const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(
    null
  );
  const reactions = reactionsIcon;

  const addReaction = useMutation(api.message.addReaction).withOptimisticUpdate(
    (localStore, mutationArg) => {
      const { icon, messageId } = mutationArg;
      if (message == null) {
        return;
      }
      const chatId = message.chatId;

      const res = localStore.getQuery(api.message.messages, {
        chatId,
      });
      if (res) {
        const newMessage = res.find((m) => m._id === messageId);
        const UsId = currentUserId?._id as Id<"users">;

        // Initialize reactions array if it doesn't exist
        const currentReactions = newMessage?.reaction || [];

        // Check if user already reacted
        const existingReactionIndex = currentReactions.findIndex(
          (reaction) => reaction.userId === UsId
        );
        let updatedReactions;

        if (existingReactionIndex !== -1) {
          // Update existing reaction
          if (currentReactions[existingReactionIndex].icon === icon) {
            // Remove reaction if same icon is clicked
            updatedReactions = currentReactions.filter(
              (reaction) => reaction.userId !== UsId
            );
          } else {
            // Update to new icon
            updatedReactions = [...currentReactions];
            updatedReactions[existingReactionIndex] = {
              userId: UsId,
              icon,
            };
          }
        } else {
          // Add new reaction
          updatedReactions = [
            ...currentReactions,
            {
              userId: UsId,
              icon,
            },
          ];
        }

        if (!newMessage) return;
        const optimisticMessage = {
          ...newMessage,
          reaction: updatedReactions,
        };
        const opt = res.map((m) => {
          if (m._id === messageId) {
            return optimisticMessage;
          }
          return m;
        });

        localStore.setQuery(api.message.messages, { chatId }, [...opt]);
      }
    }
  );

  const handleReaction = async (
    icon: string,
    messageId: Id<"messages"> | null
  ) => {
    if (messageId === null) {
      return;
    }
    try {
      setIsVisible(false);
      await addReaction({
        messageId,
        icon,
      });
    } catch (error) {
      toast.error("Failed to add reaction");
      setIsVisible(false);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // آیکون‌های واکنش - 10 عدد با تناوب دو آیکون

  // const handleContextMenu = (e: React.MouseEvent) => {
  //   e.preventDefault(); // جلوگیری از نمایش منوی راست کلیک مرورگر
  //   setIsVisible(true);
  //   setPosition({
  //     x: e.clientX,
  //     y: e.clientY,
  //   });
  // };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    // e.isPropagationStopped();

    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    // e.isPropagationStopped();

    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReactionSelect = (reaction: Reaction) => {
    setSelectedReaction(reaction);
    setIsVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { setReplyMessageId, setFunctionName } = useGlobalContext();

  const { setDeleteItems } = useDeleteItem();

  return (
    <>
      {isVisible && (
        <div
          ref={containerRef}
          className="fixed 
          bg-[#ffffffd9] backdrop-blur-[50px]  flex items-center justify-center  rounded-full shadow-lg select-none reaction-container z-[2000] w-[290px] h-[40px] "
          style={{
            left: position.x,
            top: position.y,
            transform: "translate(-50%, 10px)",
          }}
        >
          <div
            ref={scrollContainerRef}
            className="absolute inset-0 flex items-center overflow-x-auto hide-scrollbar"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="flex px-2 space-x-2 min-w-max">
              {reactions.map((reaction) => (
                <div
                  key={reaction.id}
                  className={`relative w-8 h-8 flex items-center justify-center transition-transform cursor-pointer hover:scale-125 ${
                    selectedReaction?.id === reaction.id ? "scale-125" : ""
                  }`}
                  onClick={() =>
                    handleReaction(reaction.alt, message && message._id)
                  }
                >
                  <Image
                    src={reaction.url || "/placeholder.svg"}
                    alt={reaction.alt}
                    width={24}
                    height={24}
                    className="object-contain emoji-hover"
                    style={{
                      filter:
                        selectedReaction?.id === reaction.id
                          ? "brightness(1.2)"
                          : "none",
                      transition: "all 0.2s ease",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* mnue item */}
          <div className=" w-[194px] h-[70px] z-[100] py-[0.3125rem] rounded-[10px] flex flex-col absolute top-[3rem] bg-[#ffffffd9] backdrop-blur-[50px] justify-center items-center ">
            <div
              className=" flex items-center  h-[32px] py-[4px] mx-[5px] px-[12px] hover:bg-[#70757914] cursor-pointer w-[184px] rounded-[0.3125rem]   "
              onClick={() => {
                setFunctionName("");
                setReplyMessageId(message);
                setIsVisible(false);
              }}
            >
              <div className=" size-[20px] mr-[1.25rem] ">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.33973 8.89844L9.87426 3.09021C9.9291 3.04361 9.99607 3.01358 10.0673 3.00363C10.1386 2.99369 10.2113 3.00425 10.2768 3.03406C10.3423 3.06388 10.3979 3.11173 10.4372 3.17202C10.4765 3.2323 10.4979 3.30253 10.4987 3.37449L10.4997 6.68555H11.5C16.5876 6.68555 21 9.60312 21 13.8721C20.9019 15.3604 20.4163 16.7971 19.5913 18.0397C18.7663 19.2823 17.6306 20.2875 16.2971 20.9555C16.2438 20.9844 16.1843 20.9997 16.1237 21H16.1151C16.0153 20.9978 15.9201 20.9572 15.8495 20.8866C15.7789 20.816 15.7383 20.7208 15.7361 20.621C15.7359 20.561 15.7503 20.5019 15.7778 20.4486C15.8053 20.3953 15.8453 20.3494 15.8943 20.3149C16.6549 19.4579 17.1293 18.3849 17.2513 17.2456C17.2513 14.4283 14.0096 12.7444 10.8749 12.7444C10.7858 12.7444 10.6968 12.7444 10.6096 12.7388H10.4997V15.3722C10.4988 15.4441 10.4775 15.5143 10.4382 15.5746C10.3989 15.6349 10.3432 15.6828 10.2777 15.7126C10.2122 15.7424 10.1396 15.753 10.0683 15.743C9.99702 15.7331 9.93005 15.703 9.87521 15.6564L3.12358 9.65524C3.08464 9.61972 3.05354 9.57647 3.03227 9.52826C3.01099 9.48004 3 9.42792 3 9.37522C3 9.32252 3.01099 9.2704 3.03227 9.22218C3.05354 9.17397 3.3008 8.93396 3.33973 8.89844Z"
                    stroke="#42526E"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </div>
              <div className=" text-[14px] font-semibold text-black  ">
                Reply
              </div>
            </div>
            <div
              className=" flex items-center  h-[32px] py-[4px] mx-[5px] px-[12px] hover:bg-[#df3f4014] cursor-pointer w-[184px] rounded-[0.3125rem]  "
              onClick={() => {
                setDeleteItems(true);
                setIsVisible(false);
              }}
            >
              <div className=" size-[20px] mr-[1.25rem] text-[#df3f40] ">
                <Trash size={20} />
              </div>
              <div className=" text-[14px] font-semibold text-[#df3f40]  ">
                Delete
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const reactionsIcon = [
  {
    id: 1,
    url: "/reaction/thumbUp.png",

    alt: "thumbUp",
  },
  {
    id: 2,
    url: "/reaction/thumbDown.png",

    alt: "thumbDown",
  },
  {
    id: 3,
    url: "/reaction/heart1.png",
    alt: "heart1",
    // url: "/reaction/cry.png",
    // alt: "cry",
  },
  {
    id: 4,
    url: "/reaction/sour.png",
    alt: "sour",
  },
  {
    id: 5,
    url: "/reaction/fire.png",
    alt: "fire",
  },
  {
    id: 6,
    url: "/reaction/heartEay.png",
    alt: "heartEays",
  },
  {
    id: 7,
    url: "/reaction/100.png",

    alt: "100",
  },
  // {
  //   id: 8,
  //   url: "/reaction/heart1.png",
  //   alt: "heart1",
  // },
];
