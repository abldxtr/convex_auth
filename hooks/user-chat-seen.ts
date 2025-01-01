import { useGlobalContext } from "@/context/globalContext";
import { useSocket } from "@/provider/socket-provider";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

type ChatSeenProps = {
  queryKey: string;
  other: string;
};

export const useChatSeen = ({ queryKey, other }: ChatSeenProps) => {
  const queryClient = useQueryClient();
  const { setUnreadMessages, setFinal } = useGlobalContext();
  const { socket } = useSocket();

  const seenMessagesRef = useRef(new Set<string>());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateMessageStatusMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const response = await fetch("/api/messages/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to update message status");
      }

      return response.json();
    },
    onSuccess: () => {
      console.log("Batch update successful");
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      socket.emit("update", { queryKey, other });
    },
    onMutate: async (messageIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [queryKey] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData([queryKey]);

      // Optimistically update to the new value
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newPages = oldData.pages.map((page: any) => ({
          ...page,
          items: page.items.map((message: any) =>
            messageIds.includes(message.id)
              ? { ...message, status: "READ" }
              : message
          ),
        }));

        return {
          ...oldData,
          pages: newPages,
        };
      });

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onError: (error) => {
      console.error("Error updating message status:", error);
    },
  });

  const updateMessageStatus = useCallback(() => {
    const messageIds = Array.from(seenMessagesRef.current);
    if (messageIds.length > 0) {
      console.log("Sending batch update for messages:", messageIds);
      updateMessageStatusMutation.mutate(messageIds);
      seenMessagesRef.current.clear();
    }
  }, [updateMessageStatusMutation]);

  const scheduleUpdate = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      updateMessageStatus();
    }, 2000);
  }, [updateMessageStatus]);

  const markMessageAsSeen = useCallback(
    (messageId: string, chatId: string) => {
      if (!seenMessagesRef.current.has(messageId)) {
        seenMessagesRef.current.add(messageId);
        console.log("Marking message as seen (not sent yet):", messageId);

        setFinal((prevFinal) =>
          prevFinal
            .map((chatObj) => {
              if (Object.keys(chatObj)[0] === chatId) {
                const messages = chatObj[chatId].filter(
                  (msg) => msg.id !== messageId
                );
                return { [chatId]: messages };
              }
              return chatObj;
            })
            .filter((chatObj) => Object.values(chatObj)[0].length > 0)
        );
        scheduleUpdate();
      }
    },
    [setFinal, scheduleUpdate]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      updateMessageStatus();
    };
  }, [updateMessageStatus]);

  return { markMessageAsSeen };
};
