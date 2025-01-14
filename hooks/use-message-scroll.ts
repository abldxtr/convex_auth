"use client";

import { useGlobalContext } from "@/context/globalContext";
import { useEffect, useCallback } from "react";

interface UseMessageScrollOptions {
  /** Duration to wait before resetting scroll state (in ms) */
  resetDelay?: number;
  /** Scroll behavior options */
  scrollOptions?: ScrollIntoViewOptions;
}

export function useMessageScroll({
  resetDelay = 1000,
  scrollOptions = {
    behavior: "instant",
    block: "center",
  },
}: UseMessageScrollOptions = {}) {
  const { replyMessageId, replyMessageIdScroll, setReplyMessageIdScroll } =
    useGlobalContext();

  const scrollToMessage = useCallback(() => {
    if (!replyMessageId?._id || !replyMessageIdScroll) return;

    try {
      const messageElement = document.getElementById(
        `message-${replyMessageId._id}`
      );

      if (!messageElement) {
        console.warn(
          `Message element with ID message-${replyMessageId._id} not found`
        );
        return;
      }

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        messageElement.scrollIntoView(scrollOptions);

        // Reset scroll state after delay
        const timeoutId = setTimeout(() => {
          setReplyMessageIdScroll(false);
        }, resetDelay);

        // Cleanup timeout if component unmounts
        return () => clearTimeout(timeoutId);
      });
    } catch (error) {
      console.error("Error scrolling to message:", error);
      setReplyMessageIdScroll(false);
    }
  }, [
    replyMessageId?._id,
    replyMessageIdScroll,
    setReplyMessageIdScroll,
    scrollOptions,
    resetDelay,
  ]);

  useEffect(() => {
    scrollToMessage();
  }, [scrollToMessage]);

  // Return scroll function in case manual triggering is needed
  return { scrollToMessage };
}
