import { useEffect } from "react";
import { useSocket } from "@/provider/socket-provider";

type ChatSocketProps = {
  addKey: string;
};

export const useChatTyping = ({ addKey }: ChatSocketProps) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on(addKey, (userId: string) => {});

    return () => {
      socket.off(addKey);
    };
  }, [addKey, socket]);
};
