"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useTransition } from "react";
import { useGlobalContext } from "@/context/globalContext";
import {
  CirclePlus,
  ClipboardCheck,
  ClipboardPen,
  PaintbrushVerticalIcon,
  X,
} from "lucide-react";
import { useMediaQuery, useOnClickOutside } from "usehooks-ts";
import { BeatLoader } from "react-spinners";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { User } from "./message.list";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import VaulDrawer from "./vaul-drawer";

export function CreateChat({ id }: { id: User }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { openChatCreate, setOpenChatCreate } = useGlobalContext();

  const [userId, setUserId] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);
  const createChat = useMutation(api.chat.createChat);
  const [copiedText, setCopiedText] = useState("");

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCopiedText(text);
      setUserId(text);
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };

  const handleClickOutside = () => {
    setOpenChatCreate(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  const [pending, startTransition] = useTransition();

  async function handleSubmit() {
    startTransition(async () => {
      const res = await createChat({
        first: id?._id!,
        second: userId as Id<"users">,
      }).catch(() => {
        toast.error("error to create Chat!");
        console.log("error to create Chat!!!");
      });
      if (res === "success") {
        toast.success("channel created!");
      }

      setOpenChatCreate(false);
    });
  }
  const handleOpenChange = (open: boolean) => {
    if (!open && userId) {
      setUserId("");
    }
    setOpenChatCreate(open);
  };
  if (!openChatCreate) {
    return null;
  }

  if (isDesktop) {
    return (
      <Dialog open={openChatCreate} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create chat channel</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className=" relative ">
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                autoFocus
                placeholder="userId"
                required
                maxLength={100}
                className=" focus:outline-none outline-none !focus:ring-0 !focus-within:outline-none !focus-within:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0   "
                disabled={pending}
              />
              {!userId ? (
                <div
                  className=" absolute right-2 inset-y-0 flex items-center justify-center hover:bg-gray-200 transition-colors rounded-md px-1 cursor-pointer my-1  "
                  onClick={handlePaste}
                >
                  <ClipboardCheck className=" size-[20px] shrink-0 opacity-70  " />
                </div>
              ) : (
                <div
                  className=" absolute right-2 inset-y-0 flex items-center justify-center hover:bg-gray-200 transition-colors rounded-md px-1 cursor-pointer my-1  "
                  onClick={() => setUserId("")}
                >
                  <X className=" size-[20px] shrink-0 opacity-70 " />
                </div>
              )}
            </div>
            <div className="flex w-full items-center justify-center ">
              <Button className="w-full bg-[#1d9bf0] hover:bg-[#1d9cf0b9]">
                {pending ? <BeatLoader size={5} color="#ffffff" /> : "create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  } else {
    return (
      <VaulDrawer
        // title="Custom Drawer Title"
        // description="This is a custom drawer component built with Vaul and styled with Tailwind CSS."
        open={openChatCreate}
        setOpen={setOpenChatCreate}
      >
        <form
          className="space-y-4 mx-auto w-full  px-4 !h-[220px] "
          onSubmit={handleSubmit}
        >
          <div className=" relative ">
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              autoFocus
              placeholder="userId"
              required
              maxLength={100}
              className=" focus:outline-none outline-none !focus:ring-0 !focus-within:outline-none !focus-within:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0   "
              disabled={pending}
            />
            {!userId ? (
              <div
                className=" absolute right-2 inset-y-0 flex items-center justify-center hover:bg-gray-200 transition-colors rounded-md px-1 cursor-pointer my-1  "
                onClick={handlePaste}
              >
                <ClipboardCheck className=" size-[20px] shrink-0 opacity-70  " />
              </div>
            ) : (
              <div
                className=" absolute right-2 inset-y-0 flex items-center justify-center hover:bg-gray-200 transition-colors rounded-md px-1 cursor-pointer my-1  "
                onClick={() => setUserId("")}
              >
                <X className=" size-[20px] shrink-0 opacity-70 " />
              </div>
            )}
          </div>
          <div className="flex w-full items-center justify-center ">
            <Button className="w-full bg-[#1d9bf0] hover:bg-[#1d9cf0b9]">
              {pending ? <BeatLoader size={5} color="#ffffff" /> : "create"}
            </Button>
          </div>
        </form>
      </VaulDrawer>
    );
  }
}

export function CreateChatIcon() {
  const { openChatCreate, setOpenChatCreate } = useGlobalContext();
  return (
    <div
      className=" absolute bottom-4 z-[100] right-4 size-[56px] rounded-full bg-[#1d9bf0] hover:bg-[#1d9cf0b9] transition-colors   flex items-center justify-center cursor-pointer "
      onClick={() => {
        setOpenChatCreate(true);
      }}
    >
      <CirclePlus className="  " color="white" />
    </div>
  );
}
