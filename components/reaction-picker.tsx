"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

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
  messageId: Id<"messages">;
};

export default function ReactionPicker({
  isVisible,
  setIsVisible,
  position,
  setPosition,
  messageId,
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

  const addReaction = useMutation(api.message.addReaction);

  const handleReaction = async (icon: string, messageId: Id<"messages">) => {
    try {
      await addReaction({
        messageId,
        icon,
      });
      setIsVisible(false);
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

  return (
    <>
      {isVisible && (
        <div
          ref={containerRef}
          className="fixed bg-white rounded-full shadow-lg select-none reaction-container z-[1000] w-[290px] h-[40px] "
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
            // onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            // style={{
            //   cursor: isDragging ? "grabbing" : "grab",
            // }}
          >
            <div className="flex px-2 space-x-2 min-w-max">
              {reactions.map((reaction) => (
                <div
                  key={reaction.id}
                  className={`relative w-8 h-8 flex items-center justify-center transition-transform cursor-pointer hover:scale-125 ${
                    selectedReaction?.id === reaction.id ? "scale-125" : ""
                  }`}
                  onClick={() => handleReaction(reaction.alt, messageId)}
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
