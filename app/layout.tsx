import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "./ConvexClientProvider";

import { GlobalProvider } from "@/context/globalContext";
import { EmojiProvider } from "@/context/EmojiContext";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "chat App bale Like",
  description: "Generated by create next app",
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
            {/* <MessageProvider> */}
            <GlobalProvider>
              <EmojiProvider>
                <ConvexQueryCacheProvider>
                  <div className="w-full max-w-[2400px] isolate mx-auto flex h-dvh  overflow-hidden">
                    <div className=" overflow-auto  h-full scrl flex w-full  ">
                      {children}
                    </div>
                  </div>
                </ConvexQueryCacheProvider>
              </EmojiProvider>
            </GlobalProvider>
            {/* </MessageProvider> */}
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
