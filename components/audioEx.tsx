"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Download } from "lucide-react";
import { useWavesurfer } from "@wavesurfer/react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { arrayBufferToAudioUrl, arrayToArrayBuffer } from "@/lib/utils";

interface AudioPlayerProps {
  audioId: Id<"messages">;
  mimeType?: string;
}

export default function AudioPlayer({
  audioId,
  mimeType = "audio/wav",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch audio data from Convex
  const audio = useQuery(api.message.getMessageById, { Id: audioId });

  // Convert array to URL when data is loaded
  useEffect(() => {
    if (audio?.audioData) {
      try {
        const arrayBuffer = arrayToArrayBuffer(audio.audioData);
        const url = arrayBufferToAudioUrl(arrayBuffer, mimeType);
        setAudioURL(url);
        setError(null);

        // Cleanup URL on unmount
        return () => {
          if (url) URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error("Error converting audio:", error);
        setError("خطا در تبدیل فایل صوتی");
      }
    }
  }, [audio?.audioData, mimeType]);

  const { wavesurfer, isPlaying: isWaveSurferPlaying } = useWavesurfer({
    container: containerRef,
    height: 100,
    waveColor: "#385F71",
    progressColor: "#F86F03",
    cursorColor: "#FFA41B",
    barWidth: 2,
    barGap: 1,
    normalize: true,
    url: audioURL || "",
  });

  // Handle play/pause
  const handlePlayPause = () => {
    if (wavesurfer) {
      wavesurfer.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (audioURL) {
      const a = document.createElement("a");
      a.href = audioURL;
      a.download = audio?._id || "audio.wav";
      a.click();
    }
  };

  if (!audio) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-destructive text-center">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{audio._id}</h3>
          <span className="text-sm text-muted-foreground">
            {new Date(audio._creationTime).toLocaleString("fa-IR")}
          </span>
        </div>

        <div className="rounded-lg border p-4 bg-background">
          <div ref={containerRef} className="w-full" />
        </div>

        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePlayPause}
            disabled={!audioURL}
          >
            {isPlaying || isWaveSurferPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            disabled={!audioURL}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
