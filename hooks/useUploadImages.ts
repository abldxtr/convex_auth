import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FileState } from "@/context/globalContext";

export const useUploadImages = () => {
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);

  const uploadImage = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    try {
      // 1. Get the upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      if (!uploadUrl) {
        throw new Error("Failed to generate upload URL");
      }

      // 2. Upload the file with progress tracking
      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            onProgress?.(progress);
          }
        });

        xhr.addEventListener("load", async () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.storageId);
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });
      });

      xhr.open("POST", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);

      return await uploadPromise;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  return { uploadImage };
};
