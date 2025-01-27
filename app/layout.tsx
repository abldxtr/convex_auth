import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "./ConvexClientProvider";

import { GlobalProvider } from "@/context/globalContext";
import { EmojiProvider } from "@/context/EmojiContext";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import { VoiceRecorderProvider } from "@/context/audio-context";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata, Viewport } from "next";

const APP_NAME = "Kchat";
const APP_DEFAULT_TITLE = "Kchat";
const APP_TITLE_TEMPLATE = "%s - Kchat";
const APP_DESCRIPTION = "Best Kchat in the world!";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="">
          <ConvexClientProvider>
            <GlobalProvider>
              <EmojiProvider>
                <VoiceRecorderProvider>
                  <ConvexQueryCacheProvider>
                    {/* <div className="w-full max-w-[2400px] isolate mx-auto flex h-dvh  overflow-hidden"> */}
                    {children}
                    <Toaster position="top-center" />
                    {/* </div> */}
                  </ConvexQueryCacheProvider>
                </VoiceRecorderProvider>
              </EmojiProvider>
            </GlobalProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
