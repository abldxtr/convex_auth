"use client";

import React, {
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { text, user } from "@/lib/definitions";
import type { Account, Chat, Message, User } from "@prisma/client";

// export type Message = {
//   id: number;
//   text: string;
//   timestamp: Date;
//   images?: string[];
// };

// export type TempImg = {
//   id: number;
//   images: string[];
// };

type MessageContextType = {
  messages: text;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  imgtemp: string[];
  setImgTemp: Dispatch<SetStateAction<string[]>>;
};
// { text }: { text: text | undefined }

const MessageContext = React.createContext<MessageContextType | null>(null);

export function MessageProvider2({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<text>([]);
  const [imgtemp, setImgTemp] = useState<string[]>([]);

  return (
    <MessageContext.Provider
      value={{ messages, setMessages, imgtemp, setImgTemp }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage2() {
  const Messages = React.useContext(MessageContext);
  if (Messages === null) {
    throw new Error("useMessage must be used within a CounterProvider");
  }

  return Messages;
}
