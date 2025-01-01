import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { DragEvent, useState } from "react";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export default function DragContainer({ className, children }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const { imgTemp, setImgTemp, setIsShowImgTemp } = useGlobalContext();

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    setIsShowImgTemp(true);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    const existingFiles = Array.from(imgTemp || []);

    // فیلتر کردن فایل‌های تکراری
    const newFiles = droppedFiles.filter(
      (file) =>
        !existingFiles.some((existingFile) => {
          if (typeof existingFile.file === "string") {
            return false;
          }
          existingFile.file.name === file.name &&
            existingFile.file.size === file.size &&
            existingFile.file.lastModified === file.lastModified;
        })
    );

    if (newFiles.length > 0) {
      const updatedFiles = [
        ...existingFiles,
        ...newFiles.map((file) => ({
          file,
          key: crypto.randomUUID(),
          progress: "PENDING" as const,
        })),
      ];
      setImgTemp(updatedFiles);
    }

    setIsDragging(false);
  };

  return (
    <div
      className={cn("relative", className)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="absolute inset-0 pointer-events-none dark:bg-zinc-900/90 z-10 flex justify-center items-center flex-col gap-1 bg-zinc-100/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>Drag and drop files here</div>
            <div className="text-sm dark:text-zinc-400 text-zinc-500">
              {"(images only)"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}

// returnM: Prisma.Prisma__MessageClient<({
//   images: {
//       chatId: string;
//       id: string;
//       url: string;
//       messageId: string;
//   }[];
// } & {
//   chatId: string;
//   status: $Enums.MessageStatus;
//   id: string;
//   createdAt: Date;
//   updatedAt: Date;
//   ... 4 more ...;
//   opupId: string;
// }) | null, null, DefaultArgs>

// message: {
//   id: string;
//   content: string;
//   status: $Enums.MessageStatus;
//   type: $Enums.MessageType;
//   chatId: string;
//   senderId: string;
//   receiverId: string;
//   createdAt: Date;
//   updatedAt: Date;
//   opupId: string;
// }

// {
//   id: 'cm426rgdy0008e4rslamzyru0',
//   content: 'amazing picture',
//   createdAt: 2024-11-29T03:30:30.454Z,
//   updatedAt: 2024-11-29T03:30:30.454Z,
//   senderId: 'cm3z541yl000010g5hdk746pu',
//   receiverId: 'cm3yj5yjk0000dbzrba4a4m4w',
//   chatId: 'cm3z5gifo000210g5xz9iw5yj',
//   status: 'SENT',
//   type: 'IMAGE',
//   opupId: 'cm426rgdy0009e4rsjm4klaay',
//   receiver: {
//     id: 'cm3yj5yjk0000dbzrba4a4m4w',
//     name: 'vvv@gmail.com',
//     image: null,
//     email: 'vvv@gmail.com',
//     lastSeen: 2024-11-26T14:06:41.760Z
//   },
//   sender: {
//     id: 'cm3z541yl000010g5hdk746pu',
//     name: 'user1',
//     image: null,
//     email: 'user1@gmail.com',
//     lastSeen: 2024-11-29T02:36:03.111Z
//   },
//   images: [ [Object], [Object] ]
// },
