"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import { useQuery } from "@tanstack/react-query";
import queryString from "query-string";
import { usr } from "@/lib/data";

const apiUrl = "/api/user";

type UnreadCount = { id: string; count: number };

type State = {
  unreadCounts: UnreadCount[];
};

type Action =
  | { type: "SET_UNREAD_COUNTS"; payload: UnreadCount[] }
  | { type: "UPDATE_UNREAD_COUNT"; payload: UnreadCount };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_UNREAD_COUNTS":
      return { ...state, unreadCounts: action.payload };
    case "UPDATE_UNREAD_COUNT":
      const index = state.unreadCounts.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        const newUnreadCounts = [...state.unreadCounts];
        newUnreadCounts[index] = action.payload;
        return { ...state, unreadCounts: newUnreadCounts };
      }
      return {
        ...state,
        unreadCounts: [...state.unreadCounts, action.payload],
      };
    default:
      return state;
  }
};

type MessageContextType = {
  unreadCounts: UnreadCount[];
  updateUnreadCount: (id: string, count: number) => void;
  fetchMessages: (userId: string) => Promise<usr[]>;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, { unreadCounts: [] });

  const fetchMessages = useCallback(async (userId: string) => {
    const url = queryString.stringifyUrl(
      {
        url: apiUrl,
        query: {
          userId,
        },
      },
      { skipNull: true }
    );

    const res = await fetch(url);
    return res.json();
  }, []);

  const updateUnreadCount = useCallback((id: string, count: number) => {
    dispatch({ type: "UPDATE_UNREAD_COUNT", payload: { id, count } });
  }, []);

  const value = useMemo(
    () => ({
      unreadCounts: state.unreadCounts,
      updateUnreadCount,
      fetchMessages,
    }),
    [state.unreadCounts, updateUnreadCount, fetchMessages]
  );

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};
