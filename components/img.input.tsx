"use client";

import { FileState, useGlobalContext } from "@/context/globalContext";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { toast } from "sonner";
import { useUploadImages } from "@/hooks/useUploadImages";
import { useVoiceRecorder } from "@/context/audio-context";
import { cn } from "@/lib/utils";

type InputProps = {
  className?: string;
  value?: FileState[];
  onChange?: (files: FileState[]) => void | Promise<void>;
  onFilesAdded?: (addedFiles: FileState[]) => void | Promise<void>;
  disabled?: boolean;
  dropzoneOptions?: Omit<DropzoneOptions, "disabled">;
  // ref?: React.RefObject<HTMLInputElement>;
};
export default function ImgInput({
  dropzoneOptions,
  value,
  className,
  disabled,
  onChange,
  onFilesAdded,
  // ref,
}: InputProps) {
  const imagesRef = useRef<HTMLInputElement | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { imgTemp, setImgTemp } = useGlobalContext();
  const { uploadImage } = useUploadImages();
  const { isRecording } = useVoiceRecorder();

  // Setup dropzone
  const isFileDuplicate = (file: File) => {
    return imgTemp.some((existingFile) => {
      if (typeof existingFile.file === "string") return false;

      return (
        existingFile.file.name === file.name &&
        existingFile.file.size === file.size &&
        existingFile.file.lastModified === file.lastModified
      );
    });
  };

  const handleFiles = async (files: File[]) => {
    // فیلتر کردن فایل‌های تکراری
    const duplicates: string[] = [];
    const newFiles = files.filter((file) => {
      const isDuplicate = isFileDuplicate(file);
      if (isDuplicate) {
        duplicates.push(file.name);
      }
      return !isDuplicate;
    });

    // نمایش پیام برای فایل‌های تکراری
    if (duplicates.length > 0) {
      toast.error(`فایل‌های تکراری: ${duplicates.join(", ")}`);
    }

    // بررسی محدودیت تعداد فایل‌ها
    if (
      dropzoneOptions?.maxFiles &&
      (imgTemp?.length ?? 0) + newFiles.length > dropzoneOptions.maxFiles
    ) {
      toast.error(`حداکثر تعداد فایل مجاز ${dropzoneOptions.maxFiles} است.`);
      return;
    }

    // اضافه کردن فایل‌های جدید
    if (newFiles.length > 0) {
      const addedFiles = newFiles.map<FileState>((file) => ({
        file,
        key: crypto.randomUUID(),
        progress: "PENDING",
      }));
      // اضافه کردن فایل‌های جدید به state با وضعیت اولیه
      const newFileStates = newFiles.map<FileState>((file) => ({
        file,
        key: crypto.randomUUID(),
        progress: 0,
      }));
      console.log({ newFileStates });
      // آپلود هر فایل به صورت جداگانه

      try {
      } catch (error) {
        console.error("Error handling files:", error);
        toast.error("خطا در آپلود فایل‌ها");
      }

      setImgTemp((prev) => [...prev, ...addedFiles]);
      void onFilesAdded?.(addedFiles);
      void onChange?.([...(value ?? []), ...addedFiles]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    disabled,
    onDrop: handleFiles,

    ...dropzoneOptions,
  });

  return (
    <div
      {...getRootProps()}
      className={cn("cursor-pointer", isRecording && " pointer-events-none ")}
    >
      <input {...getInputProps()} disabled={isRecording} />

      <button className="size-[34px] hover:bg-[#1d9bf01a] flex items-center justify-center transition-all duration-300 rounded-full">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-[20px] shrink-0 fill-[#1d9bf0]"
        >
          <g>
            <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path>
          </g>
        </svg>
      </button>
    </div>
  );
}
