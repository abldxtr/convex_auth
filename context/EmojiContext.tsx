"use client";

import React, {
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

type EmojiContextType = {
  openEmoji: boolean;
  setOpenEmoji: Dispatch<SetStateAction<boolean>>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  openfile: boolean;
  setOpenfile: Dispatch<SetStateAction<boolean>>;
};

const EmojiContext = React.createContext<EmojiContextType | undefined>(
  undefined,
);

export function EmojiProvider({ children }: { children: ReactNode }) {
  const [openEmoji, setOpenEmoji] = useState(false);
  const [open, setOpen] = useState(false);
  const [openfile, setOpenfile] = useState(false);

  return (
    <EmojiContext.Provider
      value={{ openEmoji, setOpenEmoji, open, setOpen, openfile, setOpenfile }}
    >
      {children}
    </EmojiContext.Provider>
  );
}

export function useEmojiState() {
  const EmojiState = React.useContext(EmojiContext);
  if (EmojiState === undefined) {
    throw new Error("useCounter must be used within a CounterProvider");
  }
  return EmojiState;
}
