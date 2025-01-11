"use client";

import VoiceRecorder, { useUrl } from "@/components/audio";
import AudioPlayer from "@/components/audioEx";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Id } from "@/convex/_generated/dataModel";
// import AudioPlayer from "react-h5-audio-player";

const AuthPage = () => {
  const idd = "k97erwvnmcghhkgxtvg411ptj5786ezs" as Id<"messages">;
  // const a = useUrl();
  // if (!!a) {
  //   return null;
  // }

  return (
    <>
      <AuthScreen />
      {/* <VoiceRecorder /> */}
      {/* <AudioPlayer
        autoPlay
        src={`${a}`}
        onPlay={(e) => console.log("onPlay")}
        // other props here
      /> */}

      {/* <AudioPlayer audioId={idd} /> */}
    </>
  );
};

export default AuthPage;
