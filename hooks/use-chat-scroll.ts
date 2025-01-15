import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  setGoDown: Dispatch<SetStateAction<boolean>>;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  setGoDown,
}: ChatScrollProps) => {
  useEffect(() => {
    const topDiv = chatRef?.current;
    const handleScroll = () => {
      if (topDiv) {
        const distanceFromBottom =
          topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;
        const distanceFromTop = topDiv.scrollTop;
        setGoDown(distanceFromBottom > 50);
      }
    };

    topDiv?.addEventListener("scroll", handleScroll);

    return () => {
      topDiv?.removeEventListener("scroll", handleScroll);
    };
  }, [chatRef, setGoDown]);
};
