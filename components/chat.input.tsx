"use client";

import { useEmojiState } from "@/context/EmojiContext";
import { useEffect, useState, useRef, FormEvent, useMemo } from "react";
import { useOnClickOutside } from "usehooks-ts";
import ImgInput from "./img.input";
import { EmojiPicker } from "./EmojiPicker";
import { InputWithRef } from "./InputWithRef";
import GifInput from "./Gif-input";
import TempImg from "./temp-img";
import { FileState, useGlobalContext } from "@/context/globalContext";
import DragContainer from "./drag-container";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import usePresence from "@/hooks/usePresence";
import useTypingIndicator from "@/hooks/useTypingIndicator";
import useSingleFlight from "@/hooks/useSingleFlight";
import { User } from "./message.list";
import { useVoiceRecorder } from "@/context/audio-context";
import { formatTime } from "@/lib/utils";
import { Pause, Play } from "lucide-react";

interface imageOptions {
  contentType?: string;
  width?: number;
  height?: number;
}

export const blobToBase64 = (blob: any) => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise((resolve) => {
    reader.onloadend = () => {
      resolve(reader.result);
    };
  });
};

export function base64ToArrayBuffer(base64: string, opts?: imageOptions) {
  const base64Data = base64.replace(/^data:.+;base64,/, "");
  const paddedBase64Data = base64Data.padEnd(
    base64Data.length + ((4 - (base64Data.length % 4)) % 4),
    "="
  );

  const binaryString = atob(paddedBase64Data);
  const byteArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }
  const blobProps = {};
  // if (opts?.contentType) blobProps["type"] = opts.contentType;
  return new Blob([byteArray], blobProps);
}

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
  const {
    imgTemp,
    setImgTemp,
    isShowImgTemp,
    setIsShowImgTemp,
    scrollPos,
    setScrollPos,
    setToScroll,
    setChangeIcon,
    scrollBound,
  } = useGlobalContext();
  const { handleDelete, isRecording, audioArrayBuffer, stopRecording } =
    useVoiceRecorder();

  // console.log({ scrollPos });

  const currentUser = user?._id ?? user?._id;
  const updatePresenceForStop = useSingleFlight(
    useMutation(api.presence.update)
  );
  if (imgTemp.length > 0) {
    blobToBase64(imgTemp[0].file).then((res) => {
      const ddd = base64ToArrayBuffer(res as string);
    });
  }

  const [data, others, updatePresence] = usePresence(param, currentUser!, {
    text: "",

    typing: false as boolean,
  });

  useTypingIndicator(data.text, updatePresence);

  const presentOthers = (others ?? []).filter((p) => p.present);

  const [inputValue, setInputValue] = useState("");
  const textRef = useRef<HTMLInputElement | null>(null);
  const EmojiRef = useRef(null);

  const createMessage = useMutation(
    api.message.createMessage
  ).withOptimisticUpdate((localStore, mutationArg) => {
    const { content, chatId, images, senderId, recieverId, opupId, img } =
      mutationArg;

    // ایجاد پیام موقت
    // const typeImg = !!images?.length && "IMAGE";
    // const imgSrc = new Blob([img!]);
    const optimisticMessage = {
      _id: `optimistic-${opupId}` as Id<"messages">, // تبدیل به نوع مناسب
      _creationTime: Date.now() as number,
      // type: "TEXT" as const,
      type: "IMAGE" as const,

      content,
      senderId: senderId as Id<"users">,
      receiverId: recieverId as Id<"users">,
      chatId: chatId as Id<"chats">,
      status: "DELIVERED" as const,
      opupId,
      image: images,
      img: img,
    };

    const res = localStore.getQuery(api.message.messages, {
      chatId,
    });
    if (res) {
      localStore.setQuery(api.message.messages, { chatId }, [
        ...res,
        optimisticMessage,
      ]);
    }
  });

  // const creatUploadMessage = useAction(api.message.MessageWithImg);

  const handleClickOutside = () => {
    setOpenEmoji(false);
  };

  useOnClickOutside([EmojiRef, textRef], handleClickOutside);

  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault();
  //   // console.log("handleSubmit");
  //   if (imgTemp.length > 0) {
  //     if (currentUser && other && chatId) {
  //       const newMessage = {
  //         content: inputValue.trim(),
  //         senderId: currentUser,
  //         receiverId: other,
  //         id: chatId,
  //         createdAt: new Date().toISOString() as unknown as Date,
  //         updatedAt: new Date().toISOString() as unknown as Date,
  //         chatId,
  //         type: "IMAGE" as const,
  //         status: "SENT" as const,
  //         opupId: crypto.randomUUID(),
  //         images: imgTemp,
  //       };
  //       const newMessage1 = {
  //         content: inputValue.trim(),
  //         senderId: currentUser,
  //         recieverId: other,
  //         chatId: chatId as Id<"chats">,
  //         opupId: crypto.randomUUID(),
  //         images: imgTemp.map((item) => item.file as unknown as string),
  //       };
  //       createMessage(newMessage1);

  //       // }
  //     }
  //   } else {
  //     if (inputValue.trim()) {
  //       if (currentUser && other && chatId) {
  //         const newMessage = {
  //           content: inputValue.trim(),
  //           senderId: currentUser,
  //           receiverId: other,
  //           id: chatId,
  //           createdAt: new Date().toISOString() as unknown as Date,
  //           updatedAt: new Date().toISOString() as unknown as Date,
  //           chatId,

  //           type: "TEXT" as const,
  //           status: "SENT" as const,
  //           opupId: crypto.randomUUID(),
  //         };

  //         const newMessage1 = {
  //           content: inputValue.trim(),
  //           senderId: currentUser,
  //           recieverId: other,
  //           chatId: chatId as Id<"chats">,
  //           opupId: crypto.randomUUID(),
  //           images: [""],
  //           // messageId: crypto.randomUUID() as Id<"messages">,
  //         };

  //         // console.log("newMessage", newMessage1);
  //         // sendMessage(newMessage);
  //         const a = {
  //           typing: false,
  //           present: false,
  //           latestJoin: Date.now(),
  //         };
  //         // updatePresenceForStop({ user: currentUser, room: chatId, data: a });

  //         // createMessage(newMessage1);
  //         // sendMessage(newMessage);
  //       }
  //     }
  //   }

  //   setInputValue("");
  //   setIsShowImgTemp(false);
  // };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // stopRecording();
    if (!currentUser || !other || !chatId) return;

    const messageContent = inputValue.trim();
    const messageId = crypto.randomUUID();
    // const AudioArrayBufferr = await blobToBase64(imgTemp[0].file).then(
    //   (res) => {
    //     const ddd = base64ToArrayBuffer(res as string);
    //     const arrayBuffer = new Response(ddd).arrayBuffer();
    //     return arrayBuffer;
    //   }
    // );

    // if (isRecording) {

    // setTimeout(() => {
    //   if (!audioArrayBuffer) {
    //     return;
    //   }
    //   const newMessage = {
    //     content: messageContent,
    //     senderId: currentUser,
    //     recieverId: other,
    //     chatId: chatId as Id<"chats">,
    //     opupId: messageId,
    //     images: imgTemp
    //       .filter((img) => img.storageId)
    //       .map((img) => img.storageId as Id<"_storage">),
    //     type: "AUDIO" as const,
    //     audio: audioArrayBuffer!,
    //   };
    //   console.log({ newMessage });

    //   createMessage(newMessage);
    //   if (scrollPos > 30 && scrollPos < 600) {
    //     setToScroll(true);
    //   }
    //   setImgTemp([]);
    //   setIsShowImgTemp(false);
    //   setChangeIcon({ type: "voice", state: false });
    // }, 5000);

    // }

    if (imgTemp.length > 0) {
      const ImageArrayBuffer = await blobToBase64(imgTemp[0].file).then(
        (res) => {
          const ddd = base64ToArrayBuffer(res as string);
          const arrayBuffer = new Response(ddd).arrayBuffer();
          return arrayBuffer;
        }
      );

      // ایجاد پیام با عکس‌ها
      const newMessage = {
        content: messageContent,
        senderId: currentUser,
        recieverId: other,
        chatId: chatId as Id<"chats">,
        opupId: messageId,
        images: imgTemp
          .filter((img) => img.storageId)
          .map((img) => img.storageId as Id<"_storage">),
        img: ImageArrayBuffer,
        type: "IMAGE" as const,
      };

      createMessage(newMessage);
      if (scrollPos < scrollBound) {
        setToScroll(true);
      }
      setInputValue("");
      setImgTemp([]);
      setIsShowImgTemp(false);
      setChangeIcon({ type: "voice", state: false });
    } else if (messageContent) {
      const newMessage = {
        content: messageContent,
        senderId: currentUser,
        recieverId: other,
        chatId: chatId as Id<"chats">,
        opupId: messageId,
        type: "TEXT" as const,
      };

      const presenceUpdate = {
        typing: false,
        present: false,
        latestJoin: Date.now(),
      };

      updatePresenceForStop({
        user: currentUser,
        room: chatId,
        data: presenceUpdate,
      });
      if (scrollPos < scrollBound) {
        setToScroll(true);
      }
      createMessage(newMessage);
      setInputValue("");
      setImgTemp([]);
      setIsShowImgTemp(false);
      setChangeIcon({ type: "voice", state: false });
    }
  };

  const handleEmoji = (emoji: any) => {
    setInputValue(inputValue + emoji.native);
  };

  return (
    // <DragContainer className=" bg-[#fcfdfd] border-t border-[#eff3f4] px-[12px]    py-1 isolate ">
    <DragContainer className=" bg-transparent px-[12px]    py-1 isolate ">
      <div className="  flex flex-col w-full h-full bg-[#eff3f4] rounded-[16px] ">
        {isShowImgTemp && <TempImg />}
        <div className=" my-[4px] mx-[12px] p-[4px] flex items-center justify-between bg-[#eff3f4] rounded-[16px] gap-1 relative    ">
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
          <AudioContainer />
          <InputWithRef
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              updatePresence({ text: e.target.value });
              // if (e.target.value.trim().length > 0) {
              //   setChangeIcon({ type: "text", state: true });
              // } else {
              //   setChangeIcon({ type: "voice", state: false });
              // }
            }}
            onSubmit={handleSubmit}
            ref={textRef}
          />
        </div>
      </div>
    </DragContainer>
  );
}

export const AudioContainer = () => {
  const {
    currentTime,
    reff,
    audioDuration,
    audioURL,
    handlePlayPause,
    isPlaying,
    isWaveSurferPlaying,
  } = useVoiceRecorder();

  if (!!!audioURL || audioURL === null) {
    return null;
  }
  return (
    // <div className="rounded-lg  p-4 bg-[#eff3f4] w-full h-full max-w-[250px] absolute inset-y-0 left-0   ">
    //   <div id="waveform" ref={reff} className="w-full h-[24px]" />
    //   <div className="flex justify-between mt-2 text-xs text-muted-foreground">
    //     <span>{formatTime(currentTime)}</span>
    //     <span>{formatTime(audioDuration)}</span>
    //   </div>
    // </div>
    <div className="flex items-center rounded-lg !w-2/3  p-4 bg-[#eff3f4]  h-full  absolute inset-y-0 left-0 ">
      <div
        className="bg-blue-400 size-[32px] rounded-full flex items-center justify-center shrink-0 "
        onClick={handlePlayPause}
      >
        {isPlaying || isWaveSurferPlaying ? (
          <Pause className="size-4 fill-white " color="white" />
        ) : (
          <Play className="size-4 fill-white " color="white" />
        )}
      </div>

      <div className="rounded-lg  p-4 bg-[#eff3f4] w-full h-full flex items-center gap-x-2">
        <div id="waveform" ref={reff} className="w-full h-[24px]" />
        <div className="flex items-center gap-x-[1px] text-sm text- ">
          <span>{formatTime(currentTime)}/ </span>
          <span>{formatTime(audioDuration)}</span>
        </div>
      </div>
    </div>
  );
};
