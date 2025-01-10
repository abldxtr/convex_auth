"use client";

import { cn } from "@/lib/utils";
import { useRef, useState, useTransition } from "react";
import { useGlobalContext } from "@/context/globalContext";
import { CirclePlus } from "lucide-react";
import { useOnClickOutside } from "usehooks-ts";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateChat({ id }: { id: User }) {
  const { openChatCreate, setOpenChatCreate } = useGlobalContext();

  const [userId, setUserId] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);
  const createChat = useMutation(api.chat.createChat);

  const handleClickOutside = () => {
    setOpenChatCreate(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  const [pending, startTransition] = useTransition();

  async function handleSubmit() {
    startTransition(async () => {
      await createChat({
        first: id?._id!,
        second: userId as Id<"users">,
      }).catch(() => console.log("error to create Chat!!!"));

      setOpenChatCreate(false);
    });
  }
  if (!openChatCreate) {
    return null;
  }

  return (
    <Dialog open={openChatCreate} onOpenChange={setOpenChatCreate}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create chat channel</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoFocus
            placeholder="userId"
            required
            maxLength={20}
            className=" focus:outline-none outline-none focus:ring-0 focus    "
            disabled={pending}
          />
          <div className="flex w-full items-center justify-center ">
            <Button className="w-full bg-green-500 hover:bg-green-400">
              {pending ? <BeatLoader size={5} color="#ffffff" /> : "create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateChatIcon() {
  const { openChatCreate, setOpenChatCreate } = useGlobalContext();
  return (
    <div
      className=" absolute bottom-4 z-[100] right-4 size-[56px] rounded-full bg-green-500 hover:bg-green-400 transition-colors   flex items-center justify-center cursor-pointer "
      onClick={() => {
        setOpenChatCreate(true);
      }}
    >
      <CirclePlus className="  " color="white" />
    </div>
  );
}

{
  /* <div className=" fixed inset-0 flex items-center justify-center z-[100] ">
  <div
    className=" w-[380px] max-w-[380px] rounded-sm border border-gray-100/80 bg-gray-300 p-8   "
    ref={ref}
  >
    <input
      type="text"
      value={userId}
      onChange={(e) => setUserId(e.target.value)}
      className=" w-full p-2 mb-2 "
      placeholder="userId"
    />
    <button
      type="submit"
      onClick={handleSubmit}
      className={cn(
        "w-full py-4 px-6 bg-green-500 hover:bg-green-400 text-white text-xl font-semibold "
      )}
      disabled={pending}
    >
      {pending ? <BeatLoader size={5} color="#ffffff" /> : "create"}
    </button>
  </div>
</div> */
}
