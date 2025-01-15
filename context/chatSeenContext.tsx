import { createContext, useContext, useRef, ReactNode } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

interface ChatSeenContextType {
  handleMessageSeen: (message: Message) => void;
  setMessageRef: (node: HTMLDivElement | null, message: Message) => void;
  replyMessageId: string | null;
  replyMessageIdScroll: string | null;
  setReplyMessageId: (id: string | null) => void;
}

interface Message {
  _id: string;
  status: string;
  receiverId: string;
  senderId: string;
  chatId: Id<"chats">;
}

const ChatSeenContext = createContext<ChatSeenContextType | undefined>(
  undefined
);

export function ChatSeenProvider({ children }: { children: ReactNode }) {
  const replyMessageId = useRef<string | null>(null);
  const replyMessageIdScroll = useRef<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSeenMessages = useRef(new Set<string>());

  const seenMutation = useMutation(
    api.message.seenMessage
  ).withOptimisticUpdate((localStore, mutationArg) => {
    const { chatId, userId, id } = mutationArg;

    const res = localStore.getQuery(api.message.messages, {
      chatId,
    });
    if (res) {
      const updatedMessages = res.map((item) => {
        if (
          item.receiverId === userId &&
          item.status === "SENT" &&
          item._id === id
        ) {
          return {
            ...item,
            status: "READ" as const,
          };
        }
        return item;
      });

      localStore.setQuery(api.message.messages, { chatId }, updatedMessages);
    }
  });

  const messageRefs = useRef(new Map());

  const handleMessageSeen = (message: Message) => {
    // Add message to pending set
    pendingSeenMessages.current.add(message._id);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      // Get all pending messages for this chat
      const messagesToUpdate = Array.from(pendingSeenMessages.current);

      // Clear pending set
      pendingSeenMessages.current.clear();

      // Only make the API call if we have messages to update
      if (messagesToUpdate.length > 0) {
        messagesToUpdate.forEach((messageId) => {
          seenMutation({
            id: messageId as Id<"messages">,
            chatId: message.chatId,
            userId: message.receiverId,
          });
        });
      }
    }, 3000); // 500ms debounce delay
  };

  const setMessageRef = (node: HTMLDivElement | null, message: Message) => {
    if (node) {
      messageRefs.current.set(message._id, node);
    } else {
      messageRefs.current.delete(message._id);
    }
  };

  const setReplyMessageId = (id: string | null) => {
    replyMessageId.current = id;
    replyMessageIdScroll.current = id;
  };

  const value = {
    handleMessageSeen,
    setMessageRef,
    replyMessageId: replyMessageId.current,
    replyMessageIdScroll: replyMessageIdScroll.current,
    setReplyMessageId,
  };

  return (
    <ChatSeenContext.Provider value={value}>
      {children}
    </ChatSeenContext.Provider>
  );
}

export function useMessageSeen() {
  const context = useContext(ChatSeenContext);
  if (context === undefined) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
}
