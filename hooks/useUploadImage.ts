import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMutation as useReactQueryMutation } from "@tanstack/react-query";

export const useUploadImage = () => {
  // دریافت تابع برای گرفتن URL آپلود از Convex
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);

  // تابع اصلی برای آپلود تصویر
  const uploadImage = async (file: File) => {
    try {
      // 1. دریافت URL آپلود از Convex
      const uploadUrl = await generateUploadUrl();

      if (!uploadUrl) {
        throw new Error("Failed to generate upload URL");
      }

      // 2. آپلود فایل به URL دریافت شده
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file");
      }

      // 3. دریافت storageId از پاسخ
      const { storageId } = await result.json();
      return storageId;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  // استفاده از React Query برای مدیریت mutation
  const mutation = useReactQueryMutation({
    mutationFn: uploadImage,
  });

  return mutation;
};
