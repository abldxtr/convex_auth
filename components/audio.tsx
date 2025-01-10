"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Play, Download, Pause, Trash2 } from "lucide-react";
import { useWavesurfer } from "@wavesurfer/react";

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const reff = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  const {
    wavesurfer,
    isPlaying: isWaveSurferPlaying,
    currentTime,
  } = useWavesurfer({
    container: reff,
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

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  // Handle file download
  const handleDownload = () => {
    if (audioURL) {
      const a = document.createElement("a");
      a.href = audioURL;
      a.download = "recording.wav";
      a.click();
    }
  };

  // Handle delete
  const handleDelete = () => {
    setAudioURL(null);
    setIsPlaying(false);
    if (wavesurfer) {
      wavesurfer.empty();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-[320px]">
        <CardContent className="space-y-6 p-6 relative ">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full ${isRecording ? "animate-pulse bg-red-500/20" : "bg-muted"}`}
              />
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="icon"
                className="w-20 h-20 rounded-full relative"
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <Square className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              {isRecording ? "در حال ضبط..." : "برای شروع ضبط کلیک کنید"}
            </p>
          </div>

          {audioURL && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-background">
                <div id="waveform" ref={reff} className="w-full h-full" />
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="outline" size="icon" onClick={handlePlayPause}>
                  {isPlaying || isWaveSurferPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <Button variant="outline" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
