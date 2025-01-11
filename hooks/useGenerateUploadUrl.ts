import { api } from "@/convex/_generated/api";
import { useMutation as useReactQueryMutation } from "@tanstack/react-query";
import { useMutation as useConvexMutation } from "convex/react";

export const useGenerateUploadUrl = () => {
  const mutation = useConvexMutation(api.upload.generateUploadUrl);

  const generateUploadUrl = useReactQueryMutation({
    mutationFn: mutation,
  });

  return generateUploadUrl;
};