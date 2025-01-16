"use client";

import { Id } from "@/convex/_generated/dataModel";
import React, { createContext, useContext, useEffect, useState } from "react";

interface DeleteItmesContextType {
  deleteItems: boolean;
  setDeleteItems: React.Dispatch<React.SetStateAction<boolean>>;
  items: Id<"messages">[] | null;
  setItems: React.Dispatch<React.SetStateAction<Id<"messages">[] | null>>;
  DisableDeleteItmes: () => void;
}

const DeleteItems = createContext<DeleteItmesContextType | undefined>(
  undefined
);

export const DeleteItemsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [deleteItems, setDeleteItems] = useState<boolean>(false);
  const [items, setItems] = useState<Id<"messages">[] | null>(null);

  const handleDeleteItems = ({ item }: { item: Id<"messages"> }) => {};

  const DisableDeleteItmes = () => {
    setDeleteItems(false);
    setItems(null);
  };

  return (
    <DeleteItems.Provider
      value={{
        deleteItems,
        setDeleteItems,
        items,
        setItems,
        DisableDeleteItmes,
      }}
    >
      {children}
    </DeleteItems.Provider>
  );
};

export const useDeleteItem = () => {
  const GlobalState = useContext(DeleteItems);
  if (GlobalState === undefined) {
    throw new Error("useGlobalContext must be used within a CounterProvider");
  }

  return GlobalState;
};
