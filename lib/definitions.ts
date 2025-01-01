// import { FileState } from "@/context/globalContext";
// // import type {
// //   $Enums,
// //   Account,
// //   Chat,
// //   Message,
// //   User,
// //   MessageImage,
// // } from "@prisma/client";

// export type ChatListWithmessage = Chat & {
//   initiatorId: User;
//   participantId: User;
//   messages: Message;
// };

// export type ChatList = User[];

// export type text = Message[];

// export type user = User;

// export type MessageData = {
//   id: string;
//   content: string;
//   createdAt: Date;
//   updatedAt: Date;
//   senderId: string;
//   receiverId: string;
//   chatId: string;
//   type: $Enums.MessageType;
//   status: $Enums.MessageStatus;
//   statusOU?: string;
//   opupId: string;
//   images?: FileState[];
// };

// export type MessageDataReceive = {
//   id: string;
//   content: string;
//   createdAt: Date;
//   updatedAt: Date;
//   senderId: string;
//   receiverId: string;
//   chatId: string;
//   type: $Enums.MessageType;
//   status: $Enums.MessageStatus;
//   statusOU?: string;
//   opupId: string;
//   images?: string[];
// };

// // {
// //   images: {
// //       id: string;
// //       url: string;
// //       messageId: string;
// //   }[];
// // } & {
// //   id: string;
// //   content: string;
// //   createdAt: Date;
// //   updatedAt: Date;
// //   senderId: string;
// //   receiverId: string;
// //   chatId: string;
// //   status: $Enums.MessageStatus;
// //   type: $Enums.MessageType;
// //   opupId: string;
// // }
// type image = {
//   id: string;
//   url: string;
//   messageId: string;
// }[];

// export type messR = image & {
//   id: string;
//   content: string;
//   createdAt: Date;
//   updatedAt: Date;
//   senderId: string;
//   receiverId: string;
//   chatId: string;
//   status: $Enums.MessageStatus;
//   type: $Enums.MessageType;
//   opupId: string;
// };
// //type of messR

// export type MessageReturn = MessageData[];
