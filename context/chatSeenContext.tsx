"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
  useState,
} from "react";
// import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/globalContext";
import { useSocket } from "@/provider/socket-provider";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type ChatSeenContextType = {
  markMessageAsSeen: (messageId: string, chatId: string) => void;
  pendingUpdates: number;
  qkey: string;
  setQKey: React.Dispatch<React.SetStateAction<string>>;
  oth: string;
  setOth: React.Dispatch<React.SetStateAction<string>>;
};

const ChatSeenContext = createContext<ChatSeenContextType | undefined>(
  undefined
);

type ChatSeenProviderProps = {
  children: ReactNode;
  // queryKey: string;
  // other: string;
};

export const ChatSeenProvider: React.FC<ChatSeenProviderProps> = ({
  children,
}) => {
  // const queryClient = useQueryClient();
  const { setFinal } = useGlobalContext();
  const { socket } = useSocket();
  const [qkey, setQKey] = useState("");
  const [oth, setOth] = useState("");

  const [pendingUpdates, setPendingUpdates] = useState(0);
  const seenMessagesRef = useRef(new Set<string>());
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // const updateMessageStatus = useCallback(() => {
  //   // const messageIds = Array.from(seenMessagesRef.current);
  //   // const messageIds = seenMessagesRef.current as Id<"messages">;

  //   // if (messageIds.length > 0) {
  //   //   console.log("Sending batch update for messages:", messageIds);
  //   //   // updateMessageStatusMutation.mutate(messageIds);

  //   // }
  //   // seenMess({ id: messageIds });

  //   seenMessagesRef.current.clear();
  // }, [seenMess]);

  const markMessageAsSeen = (messageId: string) => {
    if (!seenMessagesRef.current.has(messageId)) {
      seenMessagesRef.current.add(messageId);
      setPendingUpdates((prev) => prev + 1);
      console.log("Marking message as seen (not sent yet):", messageId);

      const Id = messageId as Id<"messages">;
    }
  };

  return (
    <ChatSeenContext.Provider
      value={{ markMessageAsSeen, pendingUpdates, qkey, setQKey, oth, setOth }}
    >
      {children}
    </ChatSeenContext.Provider>
  );
};

export const useChatSeen = () => {
  const context = useContext(ChatSeenContext);
  if (context === undefined) {
    throw new Error("useChatSeen must be used within a ChatSeenProvider");
  }
  return context;
};
