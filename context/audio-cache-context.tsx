"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AudioCacheService } from "@/services/audio-cache";

interface AudioCache {
  getAudio: (id: string) => Promise<ArrayBuffer | null>;
  setAudio: (id: string, data: ArrayBuffer) => Promise<void>;
  isReady: boolean;
}

export const AudioCacheContext = createContext<AudioCache | null>(null);

export function AudioCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cacheService = useRef(new AudioCacheService());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    cacheService.current.init().then(() => setIsReady(true));
  }, []);

  const value = {
    getAudio: (id: string) => cacheService.current.get(id),
    setAudio: (id: string, data: ArrayBuffer) =>
      cacheService.current.set(id, data),
    isReady,
  };

  return (
    <AudioCacheContext.Provider value={value}>
      {children}
    </AudioCacheContext.Provider>
  );
}

export function useAudioCache() {
  const context = useContext(AudioCacheContext);
  if (!context) {
    throw new Error("useAudioCache must be used within an AudioCacheProvider");
  }
  return context;
}
