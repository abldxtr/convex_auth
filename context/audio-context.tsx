"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { useWavesurfer } from "@wavesurfer/react";
import { base64ToArrayBuffer, blobToBase64 } from "@/components/chat.input";
import { useAudioCache } from "./audio-cache-context";

interface VoiceRecorderContextType {
  isRecording: boolean;
  audioURL: string | null;
  isPlaying: boolean;
  recordingDuration: number;
  audioDuration: number;
  currentTime: number;
  wavesurfer: any;
  audioArrayBuffer: ArrayBuffer | null;
  isWaveSurferPlaying: boolean;
  reff: React.RefObject<HTMLDivElement>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  handlePlayPause: () => void;
  handleDownload: () => void;
  handleDelete: () => void;
  getArrayBuffer: () => Promise<ArrayBuffer | null>;
  audioBlob: Blob | null;
  setAudioBlob: Dispatch<SetStateAction<Blob | null>>;
  messageIdAudio: string | null;
  setMessageIdAudio: Dispatch<SetStateAction<string | null>>;
}

const VoiceRecorderContext = createContext<VoiceRecorderContextType | null>(
  null
);

export function VoiceRecorderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioArrayBuffer, setAudioArrayBuffer] = useState<ArrayBuffer | null>(
    null
  );
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const reff = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [messageIdAudio, setMessageIdAudio] = useState<string | null>(null);
  const { getAudio, setAudio } = useAudioCache();

  const { wavesurfer, isPlaying: isWaveSurferPlaying } = useWavesurfer({
    container: reff,
    height: "auto",
    waveColor: "#8dcefa",
    progressColor: "#3390ec",
    cursorColor: "#fff",
    barWidth: 2,
    barGap: 1,
    normalize: true,
    url: audioURL || "",
    dragToSeek: true,
  });

  useEffect(() => {
    if (wavesurfer) {
      wavesurfer.on("timeupdate", (currentTime: number) => {
        setCurrentTime(currentTime);
      });

      wavesurfer.on("ready", () => {
        setAudioDuration(wavesurfer.getDuration());
      });
    }
  }, [wavesurfer]);

  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

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
        setAudioBlob(audioBlob);

        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Convert to ArrayBuffer
        const buffer = await audioBlob.arrayBuffer();
        // setAudioArrayBuffer(buffer);
        const messageId = crypto.randomUUID();
        setMessageIdAudio(messageId);
        // await setAudio(messageId, buffer);

        const AudioArrayBufferr = await blobToBase64(audioBlob).then((res) => {
          const ddd = base64ToArrayBuffer(res as string);
          const arrayBuffer = new Response(ddd).arrayBuffer();
          return arrayBuffer;
        });
        await setAudio(messageId, AudioArrayBufferr);

        // setAudioArrayBuffer(AudioArrayBufferr);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const handlePlayPause = () => {
    // console.log(wavesurfer?.playPause(), isPlaying);

    if (wavesurfer) {
      wavesurfer.playPause();
      // setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (audioURL) {
      const a = document.createElement("a");
      a.href = audioURL;
      a.download = "recording.wav";
      a.click();
    }
  };

  const handleDelete = () => {
    stopRecording();
    setAudioURL(null);
    setIsPlaying(false);
    setAudioDuration(0);
    setCurrentTime(0);
    if (wavesurfer) {
      wavesurfer.empty();
    }
    // setIsRecording(false);
  };

  const getArrayBuffer = async (): Promise<ArrayBuffer | null> => {
    if (!audioArrayBuffer && audioURL) {
      try {
        const response = await fetch(audioURL);
        const buffer = await response.arrayBuffer();
        setAudioArrayBuffer(buffer);
        return buffer;
      } catch (error) {
        console.error("Error converting to ArrayBuffer:", error);
        return null;
      }
    }
    return audioArrayBuffer;
  };

  const value = {
    isRecording,
    audioURL,
    isPlaying,
    recordingDuration,
    audioDuration,
    currentTime,
    wavesurfer,
    isWaveSurferPlaying,
    reff,
    startRecording,
    stopRecording,
    handlePlayPause,
    handleDownload,
    handleDelete,
    audioArrayBuffer,
    getArrayBuffer,
    audioBlob,
    setAudioBlob,
    messageIdAudio,
    setMessageIdAudio,
  };

  return (
    <VoiceRecorderContext.Provider value={value}>
      {children}
    </VoiceRecorderContext.Provider>
  );
}

export function useVoiceRecorder() {
  const context = useContext(VoiceRecorderContext);
  if (!context) {
    throw new Error(
      "useVoiceRecorder must be used within a VoiceRecorderProvider"
    );
  }
  return context;
}
