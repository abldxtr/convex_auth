"use client";

import { Id } from "@/convex/_generated/dataModel";
import React, { createContext, useContext, useEffect, useState } from "react";
import { DeleteItemsProvider } from "./delete-items-context";
import { AudioCacheProvider } from "./audio-cache-context";
import { messageItem } from "@/components/scroll-down";

export type FileState = {
  file: File;
  key: string; // used to identify the file in the progress callback
  progress: "PENDING" | "COMPLETE" | "ERROR" | number | string;
  storageId?: string;
};

export type convexFile = {
  file: FileList;
  key: string;
};

export type IconChange = {
  type: "voice" | "text";
  state: boolean;
};

export type replyMess = {
  _id: Id<"messages">;
  _creationTime: number;
  replyMessage?: Id<"messages"> | undefined;
  image?: string[] | undefined;
  img?: ArrayBuffer | undefined;
  audioUrl?: ArrayBuffer | undefined;
  audioStorageId?: Id<"_storage"> | undefined;
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
  content: string;
  senderId: Id<"users">;
  receiverId: Id<"users">;
  chatId: Id<"chats">;
  status: "SENT" | "DELIVERED" | "READ";
  opupId: string;
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
  // unreadMessages: MessageData[];
  // setUnreadMessages: React.Dispatch<React.SetStateAction<MessageData[]>>;
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
  // final: final;
  // setFinal: React.Dispatch<React.SetStateAction<final>>;
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
  convexFile: convexFile | null;
  setConvexFile: React.Dispatch<React.SetStateAction<convexFile | null>>;
  scrollPos: number;
  setScrollPos: React.Dispatch<React.SetStateAction<number>>;
  toScroll: boolean;
  setToScroll: React.Dispatch<React.SetStateAction<boolean>>;
  changeIcon: IconChange;
  setChangeIcon: React.Dispatch<React.SetStateAction<IconChange>>;
  scrollBound: number;
  setScrollBound: React.Dispatch<React.SetStateAction<number>>;
  replyMessageId: replyMess | null;
  setReplyMessageId: React.Dispatch<React.SetStateAction<replyMess | null>>;
  replyMessageIdScroll: boolean;
  setReplyMessageIdScroll: React.Dispatch<React.SetStateAction<boolean>>;
  isPendingForUploadAudio: boolean;
  setIspendingForUploadingAudio: React.Dispatch<React.SetStateAction<boolean>>;
  deleteItems: boolean;
  setDeleteItems: React.Dispatch<React.SetStateAction<boolean>>;
  functionName: string;
  setFunctionName: React.Dispatch<React.SetStateAction<string>>;
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  messageReaction: messageItem | null;
  setMessageReaction: React.Dispatch<React.SetStateAction<messageItem | null>>;
  position: {
    x: number;
    y: number;
  };
  setPosition: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
    }>
  >;
  isVisibleReaction: boolean;
  setIsVisibleReaction: React.Dispatch<React.SetStateAction<boolean>>;
}

const GlobalContext = createContext<CounterContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  // reaction container show
  const [isVisible, setIsVisible] = useState(false);
  const [messageReaction, setMessageReaction] = useState<messageItem | null>(
    null
  );
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisibleReaction, setIsVisibleReaction] = useState(false);

  const [convexFile, setConvexFile] = useState<convexFile | null>(null);
  const [functionName, setFunctionName] = useState("");
  const [replyMessageId, setReplyMessageId] = useState<replyMess | null>(null);
  const [replyMessageIdScroll, setReplyMessageIdScroll] =
    useState<boolean>(false);

  const [isPendingForUploadAudio, setIspendingForUploadingAudio] =
    useState<boolean>(false);
  const [deleteItems, setDeleteItems] = useState<boolean>(false);

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
  const [scrollPos, setScrollPos] = useState<number>(0);
  const [scrollBound, setScrollBound] = useState<number>(0);

  const [toScroll, setToScroll] = useState<boolean>(false);
  const [changeIcon, setChangeIcon] = useState<IconChange>({
    state: false,
    type: "voice",
  });

  const [unreadCountMenue, setUnreadCountMenue] = useState<
    { id: string; count: number }[]
  >([]);

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
        // unreadMessages,
        // setUnreadMessages,
        unreadCountMenue,
        setUnreadCountMenue,
        // final,
        // setFinal,
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
        convexFile,
        setConvexFile,
        scrollPos,
        setScrollPos,
        toScroll,
        setToScroll,
        changeIcon,
        setChangeIcon,
        scrollBound,
        setScrollBound,
        replyMessageId,
        setReplyMessageId,
        replyMessageIdScroll,
        setReplyMessageIdScroll,
        isPendingForUploadAudio,
        setIspendingForUploadingAudio,
        deleteItems,
        setDeleteItems,
        functionName,
        setFunctionName,
        isVisible,
        setIsVisible,
        messageReaction,
        setMessageReaction,
        position,
        setPosition,
        isVisibleReaction,
        setIsVisibleReaction,
      }}
    >
      <DeleteItemsProvider>
        <AudioCacheProvider>{children}</AudioCacheProvider>
      </DeleteItemsProvider>
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
