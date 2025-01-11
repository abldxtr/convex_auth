import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import moment from "moment-jalaali";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatMessageDate = (date: Date) => {
  // const persianDate = moment(date).format("jYYYY/jMM/jDD HH:mm:ss");
  const persianMonths = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];
  const now = moment();
  const persianDate = moment(date);
  const diffDays = now.diff(persianDate, "days");

  let result: string;

  if (diffDays === 0) {
    result = "امروز";
  } else if (diffDays === 1) {
    result = "دیروز";
  } else {
    const day = persianDate.jDate();
    const month = persianDate.jMonth(); // 0-indexed
    result = `${day} ${persianMonths[month]}`;
  }

  // تبدیل اعداد به فارسی
  return result.replace(
    /[0-9]/g,
    (digit) =>
      ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][parseInt(digit)]
  );
};

export const formatPersianDate = (date: Date) => {
  const persianMonths = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];
  const now = moment();
  const persianDate = moment(date);
  const diffDays = now.diff(persianDate, "days");

  const year = persianDate.jYear();
  const month = persianDate.jMonth(); // 0-indexed
  const day = persianDate.jDate();
  const time = persianDate.format("HH:mm");

  let result: string;

  if (diffDays === 0) {
    result = `${time}`;
  } else if (diffDays === 1) {
    result = `${time}`;
  } else if (now.jYear() === year) {
    result = `${time}`;
  } else {
    result = `${year} ${time}`;
  }

  // تبدیل اعداد به فارسی
  return result.replace(
    /[0-9]/g,
    (digit) =>
      ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][parseInt(digit)]
  );
};

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}
// Convert array of numbers back to ArrayBuffer
export function arrayToArrayBuffer(array: number[]): ArrayBuffer {
  return new Uint8Array(array).buffer;
}

// Convert ArrayBuffer to Blob
export function arrayBufferToBlob(
  buffer: ArrayBuffer,
  mimeType: string = "audio/wav"
): Blob {
  return new Blob([buffer], { type: mimeType });
}

// Convert ArrayBuffer to Audio URL
export function arrayBufferToAudioUrl(
  buffer: ArrayBuffer,
  mimeType: string = "audio/wav"
): string {
  const blob = arrayBufferToBlob(buffer, mimeType);
  return URL.createObjectURL(blob);
}

// Convert Base64 to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Convert Base64 to Audio URL
export function base64ToAudioUrl(base64: string): string {
  const arrayBuffer = base64ToArrayBuffer(base64);
  const blob = arrayBufferToBlob(arrayBuffer);
  return URL.createObjectURL(blob);
}

export function combineChunks(chunks: number[][]): ArrayBuffer {
  // Calculate total length
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);

  // Create a new array to hold all data
  const combined = new Uint8Array(totalLength);

  // Copy each chunk into the combined array
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(new Uint8Array(chunk), offset);
    offset += chunk.length;
  }

  return combined.buffer;
}
