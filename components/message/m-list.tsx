"use client";

import { useGlobalContext } from "@/context/globalContext";
import { cn, formatMessageDate, formatPersianDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "usehooks-ts";
import { Skeleton } from "../ui/skeleton";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Copy, Check } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { User } from "../message.list";
import { AnimatePresence, motion } from "framer-motion";
import usePresence from "@/hooks/usePresence";
import { TypingLeft } from "../scroll-down";

export type userList = {
  name: string | null;
  id: string;
  img?: string;
  href: string;
  active: boolean | null;
  // username: string | null;
  // date: Date;
  lastMessage: {
    _id: Id<"messages">;
    _creationTime: number;
    image?: string[] | undefined;
    img?: ArrayBuffer | undefined;
    type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
    content: string;
    senderId: Id<"users">;
    receiverId: Id<"users">;
    chatId: Id<"chats">;
    status: "SENT" | "DELIVERED" | "READ";
    opupId: string;
  } | null;
  date: number | undefined;
  unReadMess: number;
  channelName: string;
  currentUser: Id<"users"> | undefined;
};

export default function UserList({ user }: { user: userList }) {
  const { setMobileMenue, chatIdActive, setChatIdActive } = useGlobalContext();
  const matches = useMediaQuery("(min-width: 768px)");
  const [data, others, updatePresence] = usePresence(
    user.href,
    user.currentUser!,
    {
      text: "",

      typing: false as boolean,
    }
  );
  const presentOthers = (others ?? []).filter((p) => p.present)[0];

  const renderStatusIcon = () => {
    if (user.lastMessage?.status === "SENT") {
      return (
        <svg
          width="12"
          height="7"
          viewBox="0 0 12 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0)">
            <path
              d="M11.6381 0.371138C11.4351 0.166704 11.1044 0.16702 10.9018 0.371841L5.84865 5.48024C5.82537 5.50377 5.78736 5.50379 5.76406 5.48028L4.01688 3.71737C3.81421 3.51288 3.48365 3.513 3.28113 3.71765C3.08155 3.91933 3.08148 4.24408 3.28098 4.44585L5.31611 6.50414C5.58571 6.7768 6.02606 6.77681 6.29568 6.50417L11.6389 1.10086C11.8389 0.89861 11.8386 0.572974 11.6381 0.371138Z"
              fill="#04CC83"
            ></path>
          </g>
          <defs>
            <clipPath id="clip0">
              <rect width="12" height="7" fill="#04CC83"></rect>
            </clipPath>
          </defs>
        </svg>
      );
    } else if (user.lastMessage?.status === "READ") {
      return (
        <svg
          width="12"
          height="7"
          viewBox="0 0 12 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.71917 1.09935C8.91838 0.897802 8.91834 0.573492 8.71908 0.371997C8.51658 0.167235 8.18585 0.167266 7.9834 0.372067L5.43861 2.94637C5.23928 3.14801 5.23936 3.47253 5.4388 3.67407C5.64138 3.87878 5.97212 3.87868 6.17458 3.67384L8.71917 1.09935ZM11.6381 0.371138C11.4351 0.166704 11.1043 0.16702 10.9017 0.371841L5.84858 5.48024C5.8253 5.50377 5.7873 5.50379 5.76399 5.48028L4.01681 3.71737C3.81414 3.51288 3.48358 3.513 3.28106 3.71765C3.08148 3.91933 3.08141 4.24408 3.28091 4.44585L5.31604 6.50414C5.58564 6.7768 6.026 6.77681 6.29561 6.50417L11.6388 1.10086C11.8388 0.89861 11.8385 0.572974 11.6381 0.371138ZM0.363426 3.71718C0.162252 3.91923 0.161685 4.24572 0.362155 4.44847L2.51702 6.62785C2.71959 6.83272 3.05044 6.83279 3.2531 6.62801C3.45252 6.42649 3.45275 6.10204 3.2536 5.90025L1.10082 3.71881C0.898174 3.51347 0.566978 3.51274 0.363426 3.71718Z"
            fill="#04CC83"
          ></path>
        </svg>
      );
    }
    return null;
  };

  return (
    <Link
      className="min-h-[40px] w-full  "
      href={`/${user.href}`}
      prefetch={true}
      onClick={() => {
        if (!matches) {
          setMobileMenue(true);
        }
        setChatIdActive(user.id);
      }}
    >
      <div
        className={cn(
          "flex  min-h-[74px]  items-center cursor-pointer p-[12px] relative justify-between group transition-all  ",
          chatIdActive === user.id
            ? "bg-[rgba(0,184,147,0.15)] "
            : "hover:bg-[#f4f5f7]",
          // user.active ? "bg-[rgba(0,184,147,0.15)]" : "hover:bg-[#f4f5f7]"
          // chatIdActive?.active ? "bg-[#f7f9f9] border-r-2 border-blue-300 " : ""
          chatIdActive === user.id && "border-r-2 border-green-300"
        )}
      >
        <div
          className={cn(
            " absolute bottom-2 flex items-center justify-center right-4 size-6 rounded-full bg-green-400 text-white font-semibold  ",
            user.unReadMess === 0 && "hidden "
          )}
        >
          {user.unReadMess > 0 && user.unReadMess}
        </div>
        <div className="mr-[16px] flex relative size-[50px] cursor-pointer items-center justify-center rounded-full border border-[#e5eaec] bg-[#ffffff] transition-all duration-300  ">
          {user.img && (
            <Image
              alt="alt img"
              src={user.img}
              className="size-full rounded-full shrink-0 "
              fill
            />
          )}
          <div
            className={cn(
              " size-3 rounded-full absolute top-[30px] right-0   "
              // Active && "bg-green-400"
            )}
          />
        </div>

        <div className="flex h-full grow flex-1 flex-col gap-2 ">
          <div className="text-[15px] font-semibold leading-[20px] text-[#0f1419] whitespace-nowrap ">
            <div className=" flex items-center justify-between ">
              <div className="text-[16px] font-medium text-[#091e42]">
                {/* {user.name} */}
                {user.channelName}
              </div>
              <div className="text-[12px] font-normal text-[#7a869a] rtlDir   ">
                {user.date &&
                  formatMessageDate(new Date(user.date as unknown as Date))}
              </div>
            </div>
          </div>
          <div className="text-sm font-normal leading-[20px] text-[#7a869a] flex items-center justify-between">
            <p>
              {presentOthers && presentOthers.data.typing ? (
                <span className=" animate-pulse ">typing...</span>
              ) : user.lastMessage ? (
                user.lastMessage?.content.length > 20 ? (
                  user.lastMessage.content.substring(0, 40) + "..."
                ) : (
                  user.lastMessage?.content
                )
              ) : (
                "هنوز گفت و گویی شروع نکرده اید."
              )}
            </p>
            <div className={cn("", user.unReadMess > 0 ? "hidden" : "flex")}>
              {renderStatusIcon()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function UserListLoading() {
  const { setMobileMenue } = useGlobalContext();
  const matches = useMediaQuery("(min-width: 768px)");

  return (
    <div
      className="min-h-[40px] w-full  "
      onClick={() => {
        if (!matches) {
          setMobileMenue(false);
        }
        // setChatIdActive(user);
      }}
    >
      <div
        className={cn(
          "flex gap-3    min-h-[40px] items-center cursor-pointer p-[12px] relative justify-between  "
        )}
      >
        <Skeleton className="size-[48px] shrink-0 aspect-square rounded-full " />

        <div className="flex  w-full  flex-col  gap-3">
          <div className=" flex items-center justify-between ">
            <Skeleton className="h-2 w-[40px] " />
            <Skeleton className="h-2 w-5" />
          </div>
          <div className="">
            <Skeleton className="h-2 w-[80px] " />
          </div>
        </div>
      </div>
    </div>
  );
}

export type usr =
  | {
      _id: Id<"users">;
      _creationTime: number;
      name?: string | undefined;
      email?: string | undefined;
      phone?: string | undefined;
      image?: string | undefined;
      emailVerificationTime?: number | undefined;
      phoneVerificationTime?: number | undefined;
      isAnonymous?: boolean | undefined;
    }
  | null
  | undefined;

export function Account({ user }: { user?: User }) {
  const me = user?.name;
  const img =
    "https://pbs.twimg.com/profile_images/1564361710554734593/jgWXrher_normal.jpg";

  // const { isConnected } = useSocket();
  const { isCopied, copyToClipboard } = useCopyToClipboard({});

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-[40px] w-full sticky top-0 group  "
      onClick={() => copyToClipboard(user._id)}
    >
      <div
        className={cn(
          "flex  min-h-[40px] items-center cursor-pointer  border-y  p-[12px] justify-between group transition-all hover:bg-[#f7f9f9] "
        )}
      >
        <div className="mr-[16px] flex relative size-[48px] cursor-pointer items-center justify-center rounded-full border-y border-[#e5eaec]  transition-all duration-300  ">
          <Image
            alt="Aerospace"
            src={user.image ?? img}
            className="size-full rounded-full shrink-0 "
            fill
          />
          <div
            className={cn(
              " size-3 rounded-full absolute top-[30px] right-0   "
            )}
          />
        </div>

        <div className="flex h-full grow flex-1 flex-col">
          <div className="text-[15px] font-semibold leading-[20px] text-[#0f1419] whitespace-nowrap ">
            <div className=" flex items-center justify-between ">
              <div className="text-[15px] font-normal text-[#536471]">
                {user.name}
              </div>
              <div className="text-[12px] font-normal text-[#536471] rtlDir   ">
                {/* {formatMessageDate(new Date(user.date))} */}
              </div>
            </div>
          </div>
          <div className="text-[13px] font-normal leading-[20px] text-[#536471]">
            {/* <span>{user.lastMessage.substring(0, 30)}</span> */}
          </div>
        </div>
        <div
          className={cn(
            "   transition-[opacity] duration-300 mr-4 ",
            isCopied
              ? "text-green-400 group-hover:text-green-400 "
              : "text-gray-900/50 group-hover:text-gray-900"
          )}
        >
          <AnimatePresence>
            {isCopied ? (
              <motion.div
                // className="absolute -left-[24px] top-0.3"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: isCopied ? 1 : 0, scale: isCopied ? 1 : 0 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <Check />
              </motion.div>
            ) : (
              <motion.div
                // className="absolute -left-4 top-0.3"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: isCopied ? 0 : 1, scale: isCopied ? 0 : 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <Copy />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
