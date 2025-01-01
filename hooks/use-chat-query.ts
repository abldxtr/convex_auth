import { useCallback, useEffect, useRef } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
  QueryFunction,
} from "@tanstack/react-query";
import qs from "query-string";
import { useSocket } from "@/provider/socket-provider";
import { useGlobalContext } from "@/context/globalContext";
import { useEdgeStore } from "@/lib/edgestore";
import { MessageData } from "@/lib/definitions";
import { FileState } from "@/context/globalContext";

interface ChatQueryProps {
  queryKey: string;
  apiUrl: string;
  paramKey: "chatId";
  paramValue: string;
  currentUser: string;
}

interface MessagesResponse {
  items: MessageData[];
  nextCursor: string | null;
}

export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
  currentUser,
}: ChatQueryProps) => {
  const { isConnected } = useSocket();
  const { setUnreadMessages, setFinal, setImgTemp } = useGlobalContext();
  const queryClient = useQueryClient();
  const { edgestore } = useEdgeStore();
  const uploadProgressRef = useRef<{ [key: string]: number }>({});

  const fetchMessages: QueryFunction<
    MessagesResponse,
    string[],
    string | undefined
  > = useCallback(
    async ({ pageParam }) => {
      const url = qs.stringifyUrl(
        {
          url: apiUrl,
          query: {
            cursor: pageParam,
            [paramKey]: paramValue,
          },
        },
        { skipNull: true }
      );

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }
      return res.json();
    },
    [apiUrl, paramKey, paramValue]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    initialPageParam: undefined,
  });

  const updateFileProgress = useCallback(
    (key: string, progress: number) => {
      uploadProgressRef.current[key] = progress;
      setImgTemp((prevState) =>
        prevState.map((fileState) =>
          fileState.key === key ? { ...fileState, progress } : fileState
        )
      );
    },
    [setImgTemp]
  );

  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: any) => {
      const { chatId, senderId, receiverId, content, type, images } =
        newMessage;
      let urls: string[] = [];

      if (images && images.length > 0) {
        const uploadPromises = images.map((file: FileState) =>
          edgestore.publicFiles.upload({
            file: file.file as File,
            onProgressChange: (progress) => {
              updateFileProgress(file.key, progress);
            },
          })
        );

        const uploadedFiles = await Promise.all(uploadPromises);
        urls = uploadedFiles.map((file) => file.url);
      }

      const sendDataUrl = qs.stringifyUrl(
        {
          url: "/api/socket/messages",
          query: { [paramKey]: paramValue },
        },
        { skipNull: true }
      );

      const res = await fetch(sendDataUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId,
          receiverId,
          content,
          id: chatId,
          type,
          urls,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      return res.json();
    },
    onMutate: (newMessage) => {
      queryClient.setQueryData([queryKey], (oldData: any) => ({
        ...oldData,
        pages: oldData.pages.map((page: any, index: number) =>
          index === 0
            ? {
                ...page,
                items: [{ ...newMessage, statusOU: "SENDING" }, ...page.items],
              }
            : page
        ),
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setImgTemp([]);
    },
    onError: (error, newMessage) => {
      console.error("Error sending message:", error);
      queryClient.setQueryData([queryKey], (oldData: any) => ({
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          items: page.items.filter(
            (message: MessageData) => message.id !== newMessage.id
          ),
        })),
      }));
    },
  });

  useEffect(() => {
    console.log("new data refresh");
    // if (data?.pages[0]?.items) {
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["userList"] });
    }, 1000);

    // const newUnreadMessages = data.pages[0].items.filter(
    //   (message) =>
    //     message.receiverId === currentUser && message.status === "SENT"
    // );
    // setFinal((prevFinal) => {
    //   const chatIndex = prevFinal.findIndex(
    //     (chat) => Object.keys(chat)[0] === paramValue
    //   );
    //   if (chatIndex !== -1) {
    //     const updatedFinal = [...prevFinal];
    //     const chatId = Object.keys(updatedFinal[chatIndex])[0];
    //     const currentMessages = updatedFinal[chatIndex][chatId];
    //     const updatedMessages = newUnreadMessages.reduce(
    //       (acc, message) => {
    //         if (!acc.some((item) => item.id === message.id)) {
    //           acc.push(message);
    //         }
    //         return acc;
    //       },
    //       [...currentMessages]
    //     );
    //     updatedFinal[chatIndex] = { [chatId]: updatedMessages };
    //     return updatedFinal;
    //   } else {
    //     return [...prevFinal, { [paramValue]: newUnreadMessages }];
    //   }
    // });
    // }
  }, [data, currentUser, paramValue]);

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    sendMessage: sendMessageMutation.mutate,
    isLoading: sendMessageMutation.isPending,
  };
};
