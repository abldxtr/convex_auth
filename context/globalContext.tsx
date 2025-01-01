"use client";

import { userList } from "@/components/message/m-list";
import { MessageData } from "@/lib/definitions";
import React, { createContext, useContext, useEffect, useState } from "react";
export type final = {
  [key: string]: MessageData[];
}[];
export type FileState = {
  file: File | string;
  key: string; // used to identify the file in the progress callback
  progress: "PENDING" | "COMPLETE" | "ERROR" | number;
};

interface CounterContextType {
  currentView: string;
  setCurrentView: React.Dispatch<React.SetStateAction<string>>;

  showFriendProfile: boolean;
  setShowFriendProfile: React.Dispatch<React.SetStateAction<boolean>>;
  showProfile: boolean;
  setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
  mobileMenue: boolean;
  setMobileMenue: React.Dispatch<React.SetStateAction<boolean>>;
  chatIdActive: string | null;
  setChatIdActive: React.Dispatch<React.SetStateAction<string | null>>;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  unreadMessages: MessageData[];
  setUnreadMessages: React.Dispatch<React.SetStateAction<MessageData[]>>;
  unreadCountMenue: {
    id: string;
    count: number;
  }[];
  setUnreadCountMenue: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        count: number;
      }[]
    >
  >;
  final: final;
  setFinal: React.Dispatch<React.SetStateAction<final>>;
  files: FileList | null;
  setFiles: React.Dispatch<React.SetStateAction<FileList | null>>;
  imgTemp: FileState[];
  setImgTemp: React.Dispatch<React.SetStateAction<FileState[]>>;
  isShowImgTemp: boolean;
  setIsShowImgTemp: React.Dispatch<React.SetStateAction<boolean>>;
  openChatCreate: boolean;
  setOpenChatCreate: React.Dispatch<React.SetStateAction<boolean>>;
  conversationId: string;
  setConversationId: React.Dispatch<React.SetStateAction<string>>;
}

const GlobalContext = createContext<CounterContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [imgTemp, setImgTemp] = useState<FileState[]>([]);
  const [currentView, setCurrentView] = useState<string>("all-chats");
  const [showFriendProfile, setShowFriendProfile] = useState<boolean>(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [mobileMenue, setMobileMenue] = useState<boolean>(false);
  const [chatIdActive, setChatIdActive] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isShowImgTemp, setIsShowImgTemp] = useState<boolean>(true);
  const [openChatCreate, setOpenChatCreate] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string>("");

  const [unreadCountMenue, setUnreadCountMenue] = useState<
    { id: string; count: number }[]
  >([]);

  const [unreadMessages, setUnreadMessages] = useState<MessageData[]>([]);

  const [final, setFinal] = useState<final>([]);

  return (
    <GlobalContext.Provider
      value={{
        currentView,
        setCurrentView,
        showProfile,
        setShowProfile,
        showFriendProfile,
        setShowFriendProfile,
        mobileMenue,
        setMobileMenue,
        chatIdActive,
        setChatIdActive,
        unreadCount,
        setUnreadCount,
        unreadMessages,
        setUnreadMessages,
        unreadCountMenue,
        setUnreadCountMenue,
        final,
        setFinal,
        files,
        setFiles,
        imgTemp,
        setImgTemp,
        isShowImgTemp,
        setIsShowImgTemp,
        openChatCreate,
        setOpenChatCreate,
        conversationId,
        setConversationId,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const GlobalState = useContext(GlobalContext);
  if (GlobalState === undefined) {
    throw new Error("useGlobalContext must be used within a CounterProvider");
  }

  return GlobalState;
};
