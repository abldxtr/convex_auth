"use client";

import { cn } from "@/lib/utils";
import { useRef, useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/globalContext";
import { CirclePlus } from "lucide-react";
import { useOnClickOutside } from "usehooks-ts";
import { BeatLoader } from "react-spinners";
// import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { User } from "./message.list";

export function CreateChat({ id }: { id: User }) {
  const { openChatCreate, setOpenChatCreate } = useGlobalContext();

  const [userId, setUserId] = useState("");
  const router = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);
  // const queryClient = useQueryClient();
  const createChat = useMutation(api.chat.createChat);

  const handleClickOutside = () => {
    // Your custom logic here
    setOpenChatCreate(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  const [pending, startTransition] = useTransition();
  // const usr = useSession();

  async function handleSubmit() {
    // const id = usr.data?.user.id ? usr.data?.user.id : "";
    startTransition(async () => {
      // const { success, message } = await createChatFromId({ userId });
      // if (id) {
      await createChat({
        first: id?._id!,
        second: userId as Id<"users">,
      }).catch(() => console.log("error to create Chat!!!"));
      // }
      // if (success) {
      //   queryClient.invalidateQueries({ queryKey: ["userList"] });
      //   setOpenChatCreate(false);
      //   router.push(message);
      // } else {
      //   console.log("there is a problem");
      // }
    });
  }
  if (!openChatCreate) {
    return null;
  }

  return (
    <div className=" fixed inset-0 flex items-center justify-center z-[100] ">
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
            "w-full py-4 px-6 bg-blue-400 text-white text-xl font-semibold "
          )}
          disabled={pending}
        >
          {pending ? <BeatLoader size={5} color="#ffffff" /> : "create"}
        </button>
      </div>
    </div>
  );
}

export function CreateChatIcon() {
  const { openChatCreate, setOpenChatCreate } = useGlobalContext();
  return (
    <div
      className=" absolute bottom-4 z-[100] right-4 size-[56px] rounded-full bg-blue-400  flex items-center justify-center cursor-pointer "
      onClick={() => {
        setOpenChatCreate(true);
      }}
    >
      <CirclePlus className="  " color="white" />
    </div>
  );
}
