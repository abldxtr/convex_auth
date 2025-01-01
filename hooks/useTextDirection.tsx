import { franc } from "franc-min";

export function detectLanguageDirection(text: string): "rtl" | "ltr" {
  const language = franc(text);

  // لیست زبان‌هایی که راست به چپ هستند
  const rtlLanguages = ["fas"];

  return rtlLanguages.includes(language) ? "rtl" : "ltr";
}
