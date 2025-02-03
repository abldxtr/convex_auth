"use client";

import { Drawer } from "vaul";
import type { Dispatch, ReactNode, SetStateAction } from "react";

interface DrawerProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  trigger?: ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function VaulDrawer({
  children,
  title = "Create chat channel",
  description = "This is a description of the drawer content.",
  trigger = "Open Drawer",
  open,
  setOpen,
}: DrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex  flex-col rounded-t-[10px] bg-white">
          <div className="flex-1 rounded-t-[10px] p-4">
            <div className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-zinc-200" />
            <div className="mx-auto max-w-md">
              <Drawer.Title className="mb-4 font-medium text-zinc-900">
                {title}
              </Drawer.Title>
              {/* <div className="mb-4 text-zinc-600">{description}</div> */}
              {children}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
