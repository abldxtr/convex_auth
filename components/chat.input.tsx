"use client";

import { useEmojiState } from "@/context/EmojiContext";
import { useEffect, useState, useRef, FormEvent, useMemo } from "react";
import { useOnClickOutside } from "usehooks-ts";
import ImgInput from "./img.input";
import { EmojiPicker } from "./EmojiPicker";
import { InputWithRef } from "./InputWithRef";
import GifInput from "./Gif-input";
import TempImg from "./temp-img";
import { useQueryClient } from "@tanstack/react-query";
import { FileState, useGlobalContext } from "@/context/globalContext";
import DragContainer from "./drag-container";
import {
  PaginatedQueryReference,
  optimisticallyUpdateValueInPaginatedQuery,
  useMutation,
} from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
// import { useSession } from "next-auth/react";
import usePresence from "@/hooks/usePresence";
import useTypingIndicator from "@/hooks/useTypingIndicator";
import useSingleFlight from "@/hooks/useSingleFlight";
import { User } from "./message.list";

export default function InputChat({
  param,
  chatId,
  other,
  user,
}: {
  param: string;
  chatId: Id<"chats">;
  other?: Id<"users">;
  user?: User;
}) {
  const { setOpenEmoji } = useEmojiState();
  const { imgTemp, setImgTemp, isShowImgTemp, setIsShowImgTemp } =
    useGlobalContext();
  // const usr = useSession();
  const currentUser = user?._id ?? user?._id;
  // const [userId] = useState(() => Math.floor(Math.random() * 10000));
  const updatePresenceForStop = useSingleFlight(
    useMutation(api.presence.update)
  );

  const [data, others, updatePresence] = usePresence(param, currentUser!, {
    text: "",
    // // emoji: Emojis[userId % Emojis.length],
    // x: 0,
    // y: 0,
    typing: false as boolean,
  });

  useTypingIndicator(data.text, updatePresence);

  const presentOthers = (others ?? []).filter((p) => p.present);

  const [inputValue, setInputValue] = useState("");
  const textRef = useRef<HTMLInputElement | null>(null);
  const EmojiRef = useRef(null);

  // const createMessage = useMutation(
  //   api.message.createMessage
  // ).withOptimisticUpdate((localStore, mutationArg) => {
  //   // const { content, chatId, images, opupId, recieverId, senderId } = args;
  //   optimisticallyUpdateValueInPaginatedQuery(
  //     localStore,
  //     api.message.messages,

  //     { chatId },
  //     (currentValue) => {

  //       const aa = localStore.getAllQueries(api.message.messages);
  //       console.log({ localStore });
  //       return currentValue;
  //       // return null
  //     }
  //   );

  // });

  const createMessage = useMutation(
    api.message.createMessage
  ).withOptimisticUpdate((localStore, mutationArg) => {
    const { content, chatId, images, senderId, recieverId, opupId } =
      mutationArg;

    // ایجاد پیام موقت
    const optimisticMessage = {
      _id: `optimistic-${opupId}` as Id<"messages">, // تبدیل به نوع مناسب
      _creationTime: Date.now() as number,
      type: "TEXT" as const,
      content,
      senderId: senderId as Id<"users">,
      receiverId: recieverId as Id<"users">,
      chatId: chatId as Id<"chats">,
      status: "DELIVERED" as const,
      opupId,
      image: [""],
    };

    // _id: Id<"messages">;
    // _creationTime: number;
    // type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
    // content: string;
    // senderId: Id<"users">;
    // receiverId: Id<"users">;
    // chatId: string;
    // status: "SENT" | "DELIVERED" | "READ";
    // opupId: string;
    // image: string[];

    const res = localStore.getQuery(api.message.messages, {
      chatId,
      // paginationOpts,
    });
    if (res) {
      const aaa = localStore.setQuery(api.message.messages, { chatId }, [
        ...res,
        optimisticMessage,
      ]);
      // localStore.setQuery(api.messages.list, { channel }, [
      //   ...existingMessages,
      //   newMessage,
      // ]);
    }
  });

  const handleClickOutside = () => {
    setOpenEmoji(false);
  };

  useOnClickOutside([EmojiRef, textRef], handleClickOutside);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // console.log("handleSubmit");
    if (imgTemp.length > 0) {
      if (currentUser && other && chatId) {
        const newMessage = {
          content: inputValue.trim(),
          senderId: currentUser,
          receiverId: other,
          id: chatId,
          createdAt: new Date().toISOString() as unknown as Date,
          updatedAt: new Date().toISOString() as unknown as Date,
          chatId,
          type: "IMAGE" as const,
          status: "SENT" as const,
          opupId: crypto.randomUUID(),
          images: imgTemp,
        };

        // }
      }
    } else {
      if (inputValue.trim()) {
        if (currentUser && other && chatId) {
          const newMessage = {
            content: inputValue.trim(),
            senderId: currentUser,
            receiverId: other,
            id: chatId,
            createdAt: new Date().toISOString() as unknown as Date,
            updatedAt: new Date().toISOString() as unknown as Date,
            chatId,

            type: "TEXT" as const,
            status: "SENT" as const,
            opupId: crypto.randomUUID(),
          };

          const newMessage1 = {
            content: inputValue.trim(),
            senderId: currentUser,
            recieverId: other,
            chatId: chatId as Id<"chats">,
            opupId: crypto.randomUUID(),
            images: [""],
            // messageId: crypto.randomUUID() as Id<"messages">,
          };

          console.log("newMessage", newMessage1);
          // sendMessage(newMessage);
          const a = {
            typing: false,
            present: false,
            latestJoin: Date.now(),
          };
          updatePresenceForStop({ user: currentUser, room: chatId, data: a });

          createMessage(newMessage1);
          // sendMessage(newMessage);
        }
      }
    }

    setInputValue("");
    setIsShowImgTemp(false);
  };

  const handleEmoji = (emoji: any) => {
    setInputValue(inputValue + emoji.native);
  };

  return (
    <DragContainer className=" bg-[#fcfdfd] border-t border-[#eff3f4] px-[12px]    py-1 isolate ">
      {/* <div
        className={classNames(
          " bg-[#fcfdfd] border-t border-[#eff3f4] px-[12px]    py-1 isolate "
        )}
      > */}
      <div className="  flex flex-col w-full h-full bg-[#eff3f4] rounded-[16px] ">
        {isShowImgTemp && <TempImg />}
        <div className=" my-[4px] mx-[12px] p-[4px] flex items-center justify-between bg-[#eff3f4] rounded-[16px] gap-1    ">
          <div className=" flex items-center  ">
            <ImgInput
              value={imgTemp}
              dropzoneOptions={{
                maxFiles: 6,
                maxSize: 1024 * 1024 * 3, // 3 MB
              }}
              onChange={setImgTemp}
              onFilesAdded={async (addedFiles) => {
                setImgTemp((prev) => [...(prev || []), ...addedFiles]);
              }}
            />
            <GifInput />
            <EmojiPicker ref={EmojiRef} handleEmoji={handleEmoji} />
          </div>
          <InputWithRef
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              updatePresence({ text: e.target.value });
            }}
            onSubmit={handleSubmit}
            ref={textRef}
          />
        </div>
      </div>
      {/* </div> */}
    </DragContainer>
  );
}
