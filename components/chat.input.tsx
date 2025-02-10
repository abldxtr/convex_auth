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
import { Pause, Play, Trash2, X } from "lucide-react";
import { useUploadImage } from "@/hooks/useUploadImage";
import ReplyMessageComp from "./reply-message";
import { useDeleteItem } from "@/context/delete-items-context";
import { toast } from "sonner";
import DeleteMessage from "./delete-message";

interface imageOptions {
  contentType?: string;
  width?: number;
  height?: number;
}

export type otherUser =
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
  otherUser,
}: {
  param: string;
  chatId: Id<"chats">;
  other?: Id<"users">;
  user?: User;
  otherUser?: otherUser;
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
    replyMessageId,
    setReplyMessageId,
    isPendingForUploadAudio,
    setIspendingForUploadingAudio,
  } = useGlobalContext();
  const {
    handleDelete,
    isRecording,
    audioArrayBuffer,
    stopRecording,
    audioURL,
    audioBlob,
    recordingDuration,
    messageIdAudio,
  } = useVoiceRecorder();
  // console.log({ recordingDuration });
  const uploadImg = useUploadImage();

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
    const {
      content,
      chatId,
      images,
      senderId,
      recieverId,
      opupId,
      img,
      type,
      replyMess,
      url,
      duration,
    } = mutationArg;

    const optimisticMessage = {
      _id: `optimistic-${opupId}` as Id<"messages">,
      _creationTime: Date.now() as number,
      type,
      content,
      senderId: senderId as Id<"users">,
      receiverId: recieverId as Id<"users">,
      chatId: chatId as Id<"chats">,
      status: "DELIVERED" as const,
      opupId,
      image: images,
      img: img,
      replyMess,
      url,
      duration,
    };
    console.log({ optimisticMessage });

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

  const handleClickOutside = () => {
    setOpenEmoji(false);
  };

  useOnClickOutside([EmojiRef, textRef], handleClickOutside);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !other || !chatId) return;

    const messageContent = inputValue.trim();
    const messageId = crypto.randomUUID();
    const replyMessageIdForSend = replyMessageId?.chatId !== chatId;

    // آپلود فایل صوتی
    if (audioURL && audioBlob !== null) {
      setIspendingForUploadingAudio(true);
      const res = await uploadImg(audioBlob);
      const idStorage = res;
      if (!!!idStorage) {
        return;
      }

      const newMessage = {
        content: messageContent,
        senderId: currentUser,
        recieverId: other,
        chatId: chatId as Id<"chats">,
        opupId: messageIdAudio!,

        type: "AUDIO" as const,
        audioStorageId: idStorage,
        replyId: replyMessageIdForSend ? undefined : replyMessageId?._id,
        replyMess: replyMessageIdForSend ? null : replyMessageId,
        url: audioURL,
        duration: recordingDuration,
      };

      await createMessage(newMessage);

      handleDelete();

      setInputValue("");
      setImgTemp([]);
      setIsShowImgTemp(false);
      setChangeIcon({ type: "voice", state: false });
      if (!replyMessageIdForSend) {
        setReplyMessageId(null);
      }
      setIspendingForUploadingAudio(false);
    }

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
        replyId: replyMessageIdForSend ? undefined : replyMessageId?._id,
        replyMess: replyMessageIdForSend ? null : replyMessageId,
      };

      createMessage(newMessage);
      setInputValue("");
      setImgTemp([]);
      setIsShowImgTemp(false);
      setChangeIcon({ type: "voice", state: false });
      if (!replyMessageIdForSend) {
        setReplyMessageId(null);
      }
    } else if (!!messageContent) {
      const newMessage = {
        content: messageContent,
        senderId: currentUser,
        recieverId: other,
        chatId: chatId as Id<"chats">,
        opupId: messageId,
        type: "TEXT" as const,
        replyId: replyMessageIdForSend ? undefined : replyMessageId?._id,
        replyMess: replyMessageIdForSend ? null : replyMessageId,
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

      createMessage(newMessage);
      setInputValue("");
      setImgTemp([]);
      setIsShowImgTemp(false);
      setChangeIcon({ type: "voice", state: false });
      if (!replyMessageIdForSend) {
        setReplyMessageId(null);
      }
    }
    if (scrollPos < scrollBound) {
      setToScroll(true);
    }
  };

  const handleEmoji = (emoji: any) => {
    setInputValue(inputValue + emoji.native);
  };
  const { deleteItems } = useDeleteItem();

  return (
    <DragContainer className=" bg-transparent px-[12px] pb-[12px]    isolate ">
      <div className="  flex flex-col w-full h-full bg-[#eff3f4] rounded-[16px] relative">
        {/* wait for send audio */}
        {isPendingForUploadAudio && (
          <div className=" absolute inset-0 bg-zinc-200/50 z-[10] " />
        )}
        {/* delete messages */}
        {deleteItems && <DeleteMessage chatId={chatId} />}
        {replyMessageId && (
          <ReplyMessageComp
            message={replyMessageId}
            chatId={chatId}
            otherUser={otherUser}
            currentUser={user}
          />
        )}
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
    <div className="flex items-center rounded-lg !w-2/3  p-4 bg-[#eff3f4]  h-full  absolute inset-y-0 left-0 ">
      <div
        className="bg-blue-400 size-[32px] rounded-full flex items-center justify-center shrink-0 "
        onClick={handlePlayPause}
      >
        {isWaveSurferPlaying ? (
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
