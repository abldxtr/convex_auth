import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { formatPersianDate, cn, formatTime } from "@/lib/utils";
import { useInView, IntersectionOptions } from "react-intersection-observer";
import { Loader2, Mic, Pause, Play, X } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UseMutateFunction } from "@tanstack/react-query";
import { useWavesurfer } from "@wavesurfer/react";
import { replyMess, useGlobalContext } from "@/context/globalContext";
import { User } from "./message.list";
import { NumberCount } from "./framer-number";
import { useLongPress } from "use-long-press";
import { Checkbox } from "./ui/checkbox";
import { useDeleteItem } from "@/context/delete-items-context";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioCache } from "@/context/audio-cache-context";
import ReactionPicker, { reactionsIcon } from "./reaction-picker";
import { useMediaQuery } from "usehooks-ts";

export interface messageItem {
  replyMess?:
    | {
        _id: Id<"messages">;
        _creationTime: number;
        img?: ArrayBuffer | undefined;
        image?: string[] | undefined;
        replyMessage?: Id<"messages"> | undefined;
        audioUrl?: ArrayBuffer | undefined;
        audioStorageId?: Id<"_storage"> | undefined;
        duration?: number | undefined;
        reaction?:
          | {
              userId: Id<"users">;
              icon: string;
            }[]
          | undefined;
        content: string;
        type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
        senderId: Id<"users">;
        receiverId: Id<"users">;
        chatId: Id<"chats">;
        status: "SENT" | "DELIVERED" | "READ";
        opupId: string;
      }
    | null
    | undefined;
  url?: string | null | undefined;
  _id: Id<"messages">;
  _creationTime: number;
  img?: ArrayBuffer | undefined;
  image?: string[] | undefined;
  replyMessage?: Id<"messages"> | undefined;
  audioUrl?: ArrayBuffer | undefined;
  audioStorageId?: Id<"_storage"> | undefined;
  duration?: number | undefined;
  reaction?:
    | {
        userId: Id<"users">;
        icon: string;
      }[]
    | undefined;
  content: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
  senderId: Id<"users">;
  receiverId: Id<"users">;
  chatId: Id<"chats">;
  status: "SENT" | "DELIVERED" | "READ";
  opupId: string;
}

export const ChatMessage = ({
  message,
  isCurrentUser,
  current_user,
  other_user,
}: {
  message: messageItem;
  isCurrentUser: boolean;
  current_user?: User;
  other_user?: User;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  // const {ref, inView}= useInView(inViewOptions);

  const MessageWrapper = isCurrentUser ? MessRight : MessLeft;
  const ii = message.img
    ? btoa(String.fromCharCode(...new Uint8Array(message.img)))
    : null;

  return (
    <>
      <MessageWrapper message={message} current_user={current_user}>
        {ii !== null && (
          <img
            src={`data:image/jpeg;base64,${ii}`}
            alt={`uploaded-img`}
            width={600}
            height={600}
            className={cn(
              "h-auto max-h-[calc(50dvh)] bg-[#0f141981] shrink-0 object-cover",
              message.status === "DELIVERED" ? "blur-sm " : "blur-0"
            )}
          />
        )}
        {message.replyMess && (
          <ReplyMessage
            message={message.replyMess}
            current_user={current_user}
            other_user={other_user}
          />
        )}
        {message.type === "AUDIO" && <AudioMessage message={message} />}
        {message.content && (
          <span className={cn(" ", ii !== null && "pt-1")} dir="auto">
            {/* <span className={cn("break-all  ", ii !== null && "pt-1")}> */}

            {message.content}
          </span>
        )}
        <MessageFooter
          message={message}
          imageLoaded={imageLoaded}
          isCurrentUser={isCurrentUser}
          current_user={current_user}
          other_user={other_user}
        />
      </MessageWrapper>
    </>
  );
};

// [-webkit-text-stroke-width:_thin]

const MessRight: React.FC<{
  message: messageItem;
  children: React.ReactNode;
  current_user: User | undefined;
}> = ({ message, children, current_user }) => {
  const matches = useMediaQuery("(min-width: 768px)");

  const {
    replyMessageId,
    replyMessageIdScroll,
    setReplyMessageId,
    setFunctionName,
    isVisible,
    setIsVisible,
    setMessageReaction,
    setIsVisibleReaction,
    setPosition,
  } = useGlobalContext();
  const { deleteItems, setDeleteItems, items, setItems, isDragging } =
    useDeleteItem();
  const [backGroundColor, setBackGroundColor] = useState(false);

  // scroll disable reaction isVisible
  useEffect(() => {
    if (!isVisible) {
      setIsVisibleReaction(false);
    }
  }, [isVisible]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMessageReaction(message);
    setIsVisibleReaction(true);
    setPosition({
      x: e.clientX,
      y: e.clientY,
    });
    setIsVisible(true);
  };

  const bind = useLongPress(() => {
    if (!isDragging) {
      // Only activate if not dragging
      if (matches) {
        setDeleteItems(true);
      }
    }
  });

  const handleCheck = () => {
    if (deleteItems) {
      setItems((prev) => {
        if (!prev) return [message._id];
        return prev.includes(message._id)
          ? prev.filter((id) => id !== message._id)
          : [...prev, message._id];
      });
    }
  };

  const other = message.senderId;
  const seenMess = useMutation(api.message.seenMessage);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout>();

  // Create a separate ref for the DOM element
  const messageRef = useRef<HTMLDivElement | null>(null);

  // Use inView with a callback ref
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  // Combine refs using callback ref pattern
  const setRefs = (node: HTMLDivElement | null) => {
    // Set the messageRef
    if (messageRef.current !== node) {
      messageRef.current = node ?? null;
    }
    // Set the inView ref
    inViewRef(node);
  };

  useEffect(() => {
    if (message.status === "SENT" && inView) {
      seenMess({
        id: message._id,
        chatId: message.chatId as Id<"chats">,
        userId: message.receiverId,
      });
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [message.status, inView, message._id, message.chatId]);

  // Handle reply message highlighting
  useEffect(() => {
    const isReplyMessage = replyMessageId?._id === message._id;

    if (
      inView &&
      replyMessageIdScroll &&
      isReplyMessage &&
      messageRef.current
    ) {
      // Clear any existing timeout
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      // Add highlight class after a short delay
      highlightTimeoutRef.current = setTimeout(() => {
        if (messageRef.current) {
          messageRef.current.classList.add("bg-[rgba(66,82,110,0.1)]");

          // Remove highlight after animation
          setTimeout(() => {
            if (messageRef.current) {
              messageRef.current.classList.remove("bg-[rgba(66,82,110,0.1)]");
            }
          }, 500);
        }
      }, 600);
    }

    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [inView, replyMessageIdScroll, replyMessageId, message._id]);
  return (
    <>
      <motion.div
        className={cn(
          "  p-1  w-full group flex items-end gap-2 justify-end z-[9] rounded-md  relative isolate  ",
          backGroundColor && "bg-[rgba(66,82,110,0.1)]"
        )}
        // className="md:p-2 "
        {...bind()}
        ref={setRefs}
        id={message._id}
        onClick={handleCheck}
        exit={{
          height: 0,
          transition: {
            type: "spring",
            bounce: 0,
          },
        }}
        onContextMenu={handleContextMenu}
        // htmlFor={message._id}
      >
        <div
          className={cn(
            " opacity-0 group-hover:opacity-100 ",
            deleteItems ? "hidden pointer-events-none " : ""
          )}
        >
          <div
            className="  size-[32px] bg-gray-100/10 hover:bg-gray-100/80 transition-all flex items-center justify-center rounded-full cursor-pointer  "
            onClick={() => {
              setFunctionName("");
              setReplyMessageId(message);
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.33973 8.89844L9.87426 3.09021C9.9291 3.04361 9.99607 3.01358 10.0673 3.00363C10.1386 2.99369 10.2113 3.00425 10.2768 3.03406C10.3423 3.06388 10.3979 3.11173 10.4372 3.17202C10.4765 3.2323 10.4979 3.30253 10.4987 3.37449L10.4997 6.68555H11.5C16.5876 6.68555 21 9.60312 21 13.8721C20.9019 15.3604 20.4163 16.7971 19.5913 18.0397C18.7663 19.2823 17.6306 20.2875 16.2971 20.9555C16.2438 20.9844 16.1843 20.9997 16.1237 21H16.1151C16.0153 20.9978 15.9201 20.9572 15.8495 20.8866C15.7789 20.816 15.7383 20.7208 15.7361 20.621C15.7359 20.561 15.7503 20.5019 15.7778 20.4486C15.8053 20.3953 15.8453 20.3494 15.8943 20.3149C16.6549 19.4579 17.1293 18.3849 17.2513 17.2456C17.2513 14.4283 14.0096 12.7444 10.8749 12.7444C10.7858 12.7444 10.6968 12.7444 10.6096 12.7388H10.4997V15.3722C10.4988 15.4441 10.4775 15.5143 10.4382 15.5746C10.3989 15.6349 10.3432 15.6828 10.2777 15.7126C10.2122 15.7424 10.1396 15.753 10.0683 15.743C9.99702 15.7331 9.93005 15.703 9.87521 15.6564L3.12358 9.65524C3.08464 9.61972 3.05354 9.57647 3.03227 9.52826C3.01099 9.48004 3 9.42792 3 9.37522C3 9.32252 3.01099 9.2704 3.03227 9.22218C3.05354 9.17397 3.3008 8.93396 3.33973 8.89844Z"
                stroke="#42526E"
                strokeWidth="1.5"
                strokeLinecap="round"
              ></path>
            </svg>
          </div>
        </div>

        <motion.div
          className="flex flex-col items-end max-w-[75%]"
          initial={{ x: 0 }}
          animate={deleteItems ? { x: -5 } : { x: 0 }}
        >
          <motion.div
            className="bg-[#dcfaf5] rounded-tl-2xl rounded-tr-2xl  rounded-bl-2xl p-3 pt-1 pb-1 text-[#091e42] origin-right "
            // dir="auto"
            layout
          >
            {children}
          </motion.div>
        </motion.div>
        {/* checkbox */}
        {deleteItems && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className=" -ml-[5px] "
          >
            {items?.includes(message._id) ? (
              <Checkbox
                id={message._id}
                className="rounded-full data-[state=checked]:border-[#1d9bf0] border-[#1d9bf0] data-[state=checked]:bg-[#1d9bf0]"
                checked={true}
              />
            ) : (
              <Checkbox
                id={message._id}
                className="rounded-full data-[state=checked]:border-[#1d9bf0] border-[#0d344e] data-[state=checked]:bg-[#1d9bf0]"
                checked={false}
              />
            )}
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

const MessLeft: React.FC<{
  message: messageItem;
  children: React.ReactNode;
  current_user: User | undefined;
}> = ({ message, children, current_user }) => {
  const {
    replyMessageId,
    replyMessageIdScroll,
    setReplyMessageId,
    setFunctionName,
    isVisible,
    setIsVisible,
    setIsVisibleReaction,
    setPosition,
    setMessageReaction,
  } = useGlobalContext();
  const { deleteItems } = useDeleteItem();

  // scroll disable reaction isVisible
  useEffect(() => {
    if (!isVisible) {
      setIsVisibleReaction(false);
    }
  }, [isVisible]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMessageReaction(message);

    setIsVisibleReaction(true);
    setPosition({
      x: e.clientX,
      y: e.clientY,
    });
    setIsVisible(true);
  };

  const other = message.senderId;
  const seenMess = useMutation(api.message.seenMessage).withOptimisticUpdate(
    (localStore, mutationArg) => {
      const { chatId, userId, id } = mutationArg;

      const res = localStore.getQuery(api.message.messages, {
        chatId,
      });
      if (res) {
        const updatedMessages = res.map((item) => {
          if (item._id === id) {
            return {
              ...item,
              status: "READ" as const,
            };
          }
          return item;
        });

        localStore.setQuery(api.message.messages, { chatId }, updatedMessages);
      }
    }
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout>();

  // Create a separate ref for the DOM element
  const messageRef = useRef<HTMLDivElement | null>(null);

  // Use inView with a callback ref
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  // Combine refs using callback ref pattern
  const setRefs = (node: HTMLDivElement | null) => {
    // Set the messageRef
    if (messageRef.current !== node) {
      messageRef.current = node ?? null;
    }
    console.log(node);
    // Set the inView ref
    inViewRef(node);
  };
  if (message.status === "SENT" && message.receiverId === current_user?._id) {
    // console.log(message.content);
    // console.log(inView);
  }
  useEffect(() => {
    if (
      message.status === "SENT" &&
      inView &&
      message.receiverId === current_user?._id
    ) {
      seenMess({
        id: message._id,
        chatId: message.chatId as Id<"chats">,
        userId: message.receiverId,
      });
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [message.status, inView, message._id, message.chatId, current_user]);

  useEffect(() => {
    const isReplyMessage = replyMessageId?._id === message._id;

    if (
      inView &&
      replyMessageIdScroll &&
      isReplyMessage &&
      messageRef.current
    ) {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      highlightTimeoutRef.current = setTimeout(() => {
        if (messageRef.current) {
          messageRef.current.classList.add("bg-[rgba(66,82,110,0.1)]");

          setTimeout(() => {
            if (messageRef.current) {
              messageRef.current.classList.remove("bg-[rgba(66,82,110,0.1)]");
            }
          }, 500);
        }
      }, 800);
    }

    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [inView, replyMessageIdScroll, replyMessageId, message._id]);

  return (
    <>
      {/* <AnimatePresence mode="popLayout" initial={false}> */}
      <div
        className={cn(
          " p-1 w-full group flex items-end gap-2 z-[9] transition-all duration-200 rounded-md  isolate "
        )}
        ref={setRefs}
        onContextMenu={handleContextMenu}
      >
        <div className="flex flex-col items-start max-w-[75%]">
          <motion.div
            className="bg-[#f4f5f7] rounded-tr-2xl  rounded-br-2xl rounded-tl-2xl p-3 pt-1 pb-1 text-[#091e42]  origin-left "
            // dir="auto"
            layout
          >
            {children}
          </motion.div>
        </div>
        {!deleteItems && (
          <div className=" opacity-0 group-hover:opacity-100 ">
            <div
              className="  size-[32px] bg-gray-100/10 hover:bg-gray-100/80 transition-all flex items-center justify-center rounded-full cursor-pointer  "
              onClick={() => {
                setFunctionName("");
                setReplyMessageId(message);
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.33973 8.89844L9.87426 3.09021C9.9291 3.04361 9.99607 3.01358 10.0673 3.00363C10.1386 2.99369 10.2113 3.00425 10.2768 3.03406C10.3423 3.06388 10.3979 3.11173 10.4372 3.17202C10.4765 3.2323 10.4979 3.30253 10.4987 3.37449L10.4997 6.68555H11.5C16.5876 6.68555 21 9.60312 21 13.8721C20.9019 15.3604 20.4163 16.7971 19.5913 18.0397C18.7663 19.2823 17.6306 20.2875 16.2971 20.9555C16.2438 20.9844 16.1843 20.9997 16.1237 21H16.1151C16.0153 20.9978 15.9201 20.9572 15.8495 20.8866C15.7789 20.816 15.7383 20.7208 15.7361 20.621C15.7359 20.561 15.7503 20.5019 15.7778 20.4486C15.8053 20.3953 15.8453 20.3494 15.8943 20.3149C16.6549 19.4579 17.1293 18.3849 17.2513 17.2456C17.2513 14.4283 14.0096 12.7444 10.8749 12.7444C10.7858 12.7444 10.6968 12.7444 10.6096 12.7388H10.4997V15.3722C10.4988 15.4441 10.4775 15.5143 10.4382 15.5746C10.3989 15.6349 10.3432 15.6828 10.2777 15.7126C10.2122 15.7424 10.1396 15.753 10.0683 15.743C9.99702 15.7331 9.93005 15.703 9.87521 15.6564L3.12358 9.65524C3.08464 9.61972 3.05354 9.57647 3.03227 9.52826C3.01099 9.48004 3 9.42792 3 9.37522C3 9.32252 3.01099 9.2704 3.03227 9.22218C3.05354 9.17397 3.3008 8.93396 3.33973 8.89844Z"
                  stroke="#42526E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                ></path>
              </svg>
            </div>
          </div>
        )}
      </div>
      {/* </AnimatePresence> */}
    </>
  );
};
const AudioMessage = ({ message }: { message: messageItem }) => {
  const audioRef = useRef<HTMLDivElement>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [shouldLoadAudio, setShouldLoadAudio] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { getAudio, setAudio } = useAudioCache();
  const [audioURL, setAudioURL] = useState("");
  const [isReady, setIsReady] = useState(false); // Add isReady state

  useEffect(() => {
    setIsReady(true); // Set isReady to true when the component mounts
  }, []);
  useEffect(() => {
    const checkCache = async () => {
      if (!isReady) return;
      const audioData = await getAudio(message._id);
      console.log("new id", message._id);
      console.log("audioData", audioData);

      if (audioData === null || audioData === undefined) {
        console.log(message.opupId);

        const response = await getAudio(message.opupId);
        if (response) {
          const audioBlob = new Blob([response], { type: "audio/wav" });
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
          return;
        }

        // setShouldLoadAudio(true);
        return;
      }
      if (audioData) {
        const audioBlob = new Blob([audioData], { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        // setShouldLoadAudio(true);
        return;
      }
      // return
    };

    checkCache();
  }, [isReady, message._id, message.opupId]);
  // console.log(message.opupId);
  // let audioURL;
  const loadAudio = async () => {
    try {
      setIsDownloading(true);

      // Try to get from cache first
      let audioData = await getAudio(message._id);

      if (!audioData) {
        // If not in cache, download it in chunks
        const response = await fetch(message.url!);
        const contentLength = response.headers.get("content-length");

        if (
          contentLength &&
          Number.parseInt(contentLength) > 50 * 1024 * 1024
        ) {
          throw new Error("File size too large (max 50MB)");
        }

        audioData = await response.arrayBuffer();
        const audioBlob = new Blob([audioData], { type: "audio/wav" });
        // setAudioBlob(audioBlob);

        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        try {
          await setAudio(message._id, audioData);
          setShouldLoadAudio(true);
          return;
        } catch (cacheError) {
          console.warn("Failed to cache audio:", cacheError);
          // Continue without caching
        }
      }

      // Load the audio data into WaveSurfer
      // await ws.loadArrayBuffer(audioData);

      // setWavesurfer(ws)
      // setIsLoading(false)
      const audioBlob = new Blob([audioData], { type: "audio/wav" });
      // setAudioBlob(audioBlob);

      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
      setIsDownloading(false);
      setShouldLoadAudio(true);
    } catch (err) {
      // setError(err as Error)
      setIsDownloading(false);
    }
  };

  // let audioData = await getAudio(message._id);
  const { wavesurfer, isPlaying: isWaveSurferPlaying } = useWavesurfer({
    container: audioRef,
    height: "auto",
    waveColor: "#8dcefa",
    progressColor: "#3390ec",
    cursorColor: "#fff",
    barWidth: 2,
    barGap: 1,
    normalize: true,
    dragToSeek: true,
    // url: message.url || "",
    // url: shouldLoadAudio ? message.url! : "",
    // url: shouldLoadAudio ? audioURL : "",
    url: !!audioURL ? audioURL : "",
    cursorWidth: 2,
  });

  // Save position when component unmounts or audio pauses
  useEffect(() => {
    if (!wavesurfer) return;

    // Handler to save current time
    const handleTimeUpdate = () => {
      const currentTime = wavesurfer.getCurrentTime();
      console.log({ currentTime });
      console.log(wavesurfer.getScroll());
      const duration = wavesurfer.getDuration();
      // Calculate progress as a number between 0-1
      const progress = currentTime / duration;
      localStorage.setItem(`audioProgress-${message._id}`, progress.toString());

      // localStorage.setItem(`audioTime-${message._id}`, currentTime.toString());
    };

    // Save time every second during playback
    const interval = setInterval(() => {
      if (isWaveSurferPlaying) {
        handleTimeUpdate();
      }
    }, 1000);

    // Save time when paused
    wavesurfer.on("pause", handleTimeUpdate);

    // Save time before unmounting
    return () => {
      wavesurfer.un("pause", handleTimeUpdate);
      handleTimeUpdate();
      clearInterval(interval);
    };
  }, [wavesurfer, message._id, isWaveSurferPlaying]);

  useEffect(() => {
    if (!wavesurfer) return;
    wavesurfer.on("ready", () => {
      setIsDownloading(false);
      const savedTime = localStorage.getItem(`audioTime-${message._id}`);

      if (savedTime) {
        // wavesurfer.setTime(Number.parseFloat(savedTime));
        // wavesurfer.setScrollTime(Number.parseFloat(savedTime));
        // wavesurfer.seekTo(Number.parseFloat("3"));

        const progress = Number.parseFloat("0.6259246588693957");
        wavesurfer.seekTo(progress);
      }
    });

    wavesurfer.on("loading", (percent) => {
      setIsDownloading(true);
    });

    wavesurfer.on("timeupdate", (currentTime: number) => {
      setCurrentTime(currentTime);
    });

    // wavesurfer.on("ready", () => {
    //   setDuration(wavesurfer.getDuration())
    // })

    return () => {
      wavesurfer.unAll();
    };
  }, [wavesurfer, message._id]);

  const handlePlayPause = async () => {
    if (!shouldLoadAudio && !!!audioURL) {
      // setShouldLoadAudio(true);
      await loadAudio();
      return;
    }
    if (!wavesurfer) return;
    wavesurfer.playPause();
  };
  return (
    <div className="flex items-center md:w-[300px]  w-[220px] gap-x-2 pt-[8px]  ">
      <div
        className={cn(
          "bg-blue-400 size-[40px] rounded-full flex items-center justify-center shrink-0 relative "
          // isDownloading && " before:absolute before:inset-0 before:bg-gray-100 "
        )}
        onClick={handlePlayPause}
      >
        {/* Loading Spinner */}
        {isDownloading && (
          <div
            className="absolute inset-0 rounded-full border-2 border-t-transparent border-blue-200 animate-spin"
            aria-label="Loading audio..."
          />
        )}
        {isWaveSurferPlaying ? (
          <Pause className="size-4 fill-white " color="white" />
        ) : (
          <Play className="size-4 fill-white " color="white" />
        )}
      </div>

      <div className="rounded-lg   w-full h-full ">
        <div id="waveform" ref={audioRef} className="w-full h-[24px]" />
        <div className="flex items-center mt-2 text-xs text-muted-foreground">
          <span>{formatTime(currentTime)} / </span>
          <span> {formatTime(message.duration || audioDuration)}</span>
        </div>
      </div>
    </div>
  );
};

export type replyType = {
  message: replyMess;
  current_user?: User;
  other_user?: User;
};

export function ReplyMessage({ message, current_user, other_user }: replyType) {
  const { setReplyMessageId, setReplyMessageIdScroll, setFunctionName } =
    useGlobalContext();
  const name =
    message.senderId === current_user?._id
      ? current_user.name
      : other_user?.name;
  const text =
    message.content.length > 40
      ? message.content.substring(0, 40) + "..."
      : message.content;

  const ii = message.img
    ? btoa(String.fromCharCode(...new Uint8Array(message.img)))
    : null;
  return (
    <div
      className="flex item-center justify-between  mb-[12px] mt-[5px]   "
      onClick={() => {
        setFunctionName("chatroom");
        setReplyMessageId(message);
        setReplyMessageIdScroll(true);
      }}
    >
      <div className="  flex  flex-col pl-2 border-l-2 border-blue-400 rounded-sm  ">
        <div className=" text-blue-300 text-sm text-left ">{name}</div>
        {ii !== null && (
          <img
            src={`data:image/jpeg;base64,${ii}`}
            alt={`uploaded-img`}
            className={cn("size-[20px] rounded-sm shrink-0 object-cover")}
          />
        )}
        {message.type === "AUDIO" && (
          <div className="flex items-center text-[#6A7485] gap-x-[6px] text-[13px] font-normal ">
            <Mic size={16} color="#6A7485" />
            پیام صوتی
          </div>
        )}
        <div className=" text-[#6A7485] text-[13px] font-normal ">{text}</div>
      </div>
    </div>
  );
}
export function BackMenue({ func }: { func: () => void }) {
  return (
    <div
      className={cn(
        "  flex items-center justify-center size-[36px] rounded-full hover:bg-gray-100 transition-colors duration-300 border-transparent     ",
        "cursor-pointer transiton-all duration-300 md:hidden "
      )}
      onClick={func}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className=" fill-[rgba(53,55,56,0.86)] shrink-0 size-[24px] rotate-90 "
      >
        <g>
          <path d="M13 3v13.59l5.043-5.05 1.414 1.42L12 20.41l-7.457-7.45 1.414-1.42L11 16.59V3h2z"></path>
        </g>
      </svg>
    </div>
  );
}

export function TypingLeft({ message }: { message: string }) {
  return (
    <div
      className={cn(
        " absolute md:bottom-2 md:left-10 bottom-2 left-8 flex items-center z-[10] shrink-0       ",
        "cursor-pointer transiton-all duration-300  "
      )}
    >
      <div className="flex flex-col w-full items-start animate-pulse ">
        <div className="flex items-center flex-row-reverse gap-2 max-w-[calc((100%_/_2)_+_(100%_/_3))]  ">
          <div className=" flex cursor-pointer flex-col text-[#0f1419] bg-gray-300 rounded-bl-sm rounded-2xl py-[12px] px-[16px] text-right leading-[20px] text-[15px] transition-all duration-300    ">
            <span className={cn("  shrink-0  ")}>{message}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ScrollDownProps {
  goDown: boolean;
  func: () => void;
  chatId: Id<"chats">;
  userId: Id<"users">;
  unreadMessagesCount: number | null | undefined;
  mutate: UseMutateFunction<
    null,
    Error,
    {
      chatId: Id<"chats">;
      userId: Id<"users">;
    },
    unknown
  >;
}
export function ScrollDown({
  goDown,
  func,
  chatId,
  userId,
  unreadMessagesCount,
  mutate,
}: ScrollDownProps) {
  return (
    <>
      <div
        className={cn(
          " absolute bottom-6 right-8 flex items-center z-[10] justify-center md:size-[54px] size-[32px] rounded-full bg-white border-transparent  px-[16px] [box-shadow:rgb(101_119_134_/_20%)_0px_0px_8px,_rgb(101_119_134_/_25%)_0px_1px_3px_1px]   ",
          "cursor-pointer transiton-all duration-300  ",
          goDown ? "opacity-100" : "opacity-0 pointer-events-none "
        )}
        onClick={() => {
          if (!!unreadMessagesCount && unreadMessagesCount > 0) {
            mutate({ chatId, userId });
          }
          func();
        }}
      >
        {!!unreadMessagesCount && unreadMessagesCount > 0 && (
          <NumberCount
            num={unreadMessagesCount}
            condition={!!unreadMessagesCount === false}
            classname="absolute -top-5 md:right-3 right-0 flex items-center justify-center bg-[#1d9bf0] text-white font-semibold rounded-full size-8 "
          />
        )}

        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className=" fill-[#707579] shrink-0 md:size-[24px] size-[18px] "
        >
          <g>
            <path d="M13 3v13.59l5.043-5.05 1.414 1.42L12 20.41l-7.457-7.45 1.414-1.42L11 16.59V3h2z"></path>
          </g>
        </svg>
      </div>
    </>
  );
}

export default ChatMessage;

const ImageContent: React.FC<{
  images: string[];
  setImageLoaded: (loaded: boolean) => void;
  uploading: boolean;
  iii?: Blob | null;
}> = ({ images, setImageLoaded, uploading }) => {
  // const mut = useMutation(api.upload.generateUploadUrl);

  return (
    <div
      className={cn(
        "grid gap-1 h-auto max-h-[calc(55dvh)] w-full shrink-0 overflow-hidden relative",
        images.length > 1 ? "grid-cols-2" : "grid-cols-1"
        // images.length > 2 && "grid-cold-2"
      )}
    >
      {images.map((image, index) => (
        <ImageItem
          key={index}
          image={image}
          setImageLoaded={setImageLoaded}
          uploading={uploading}
        />
      ))}
    </div>
  );
};

const ImageItem: React.FC<{
  image: any;
  setImageLoaded: (loaded: boolean) => void;
  uploading: boolean;
}> = ({ image, setImageLoaded, uploading }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative flex items-center justify-center">
      <Image
        // src={image.url || URL.createObjectURL(image.file)}
        src={image}
        // alt={`uploaded-img-${image.id || image.key}`}
        alt={`uploaded-img`}
        width={600}
        height={600}
        className={cn(
          "h-auto max-h-[calc(55dvh)] bg-[#0f141981] shrink-0 object-cover",
          uploading ? "blur-md" : "blur-0"
        )}
        // onLoadingComplete={() => {
        //   setLoading(false);
        //   setImageLoaded(true);
        // }}
      />
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center w-full h-full ">
          <Loader2 className="size-8 text-black animate-spin  " />
        </div>
      )}

      {/* {typeof image.progress === "number" && image.progress < 100 && (
        <CircleProgress progress={image.progress} />
      )} */}
    </div>
  );
};

const MessageFooter: React.FC<{
  message: messageItem;
  imageLoaded: boolean;
  isCurrentUser: boolean;
  current_user?: User;
  other_user?: User;
}> = ({ message, imageLoaded, isCurrentUser, current_user, other_user }) => {
  const reactionIcons = reactionsIcon;
  const renderStatusIcon = () => {
    if (message.status === "DELIVERED") {
      return <Loader2 className="size-[12px] text-[#1d9bf0] animate-spin " />;
    } else if (message.status === "SENT") {
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
              fill="#1d9bf0"
            ></path>
          </g>
          <defs>
            <clipPath id="clip0">
              <rect width="12" height="7" fill="#1d9bf0"></rect>
            </clipPath>
          </defs>
        </svg>
      );
    } else if (message.status === "READ") {
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
            fill="#1d9bf0"
          ></path>
        </svg>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        "text-[#6a7485] text-[0.65rem] leading-4 mt-1 flex  items-center  ",
        isCurrentUser && "justify-end "
      )}
      // dir={isCurrentUser ? "ltr" : "rtl"}
    >
      {message !== undefined &&
        message?.reaction?.length !== undefined &&
        message?.reaction?.length > 0 && (
          <div className=" px-2 flex items-center gap-x-1">
            {message.reaction.map((reaction, index) => {
              const reactionIcon = reactionsIcon.find(
                (icon) => icon.alt === reaction.icon
              );
              // const userPic = reaction.userId === message.

              if (!reactionIcon) return null;

              return (
                <div
                  key={`${reaction.userId}-${index}`}
                  className="relative group flex items-center gap-x-1 bg-[#f8f8ff] rounded-full p-1 border border-gray-200 "
                >
                  <Image
                    src={reactionIcon.url || "/placeholder.svg"}
                    alt={reactionIcon.alt}
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                  {reaction.userId === current_user?._id ? (
                    <div className="size-[16px] rounded-full overflow-hidden relative ">
                      <Image
                        src={current_user.image || "/placeholder.svg"}
                        alt={`${reactionIcon.id}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="size-[16px] rounded-full overflow-hidden relative ">
                      <Image
                        src={other_user?.image || "/placeholder.svg"}
                        alt={`${reactionIcon.id}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      {formatPersianDate(new Date(message._creationTime))}
      <span className="ml-2 ">{renderStatusIcon()}</span>
    </div>
  );
};
