"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Play, Download, Pause, Trash2 } from "lucide-react";
import { useWavesurfer } from "@wavesurfer/react";
import { formatTime } from "@/lib/utils";
// import { formatTime } from "./utils/format-time";

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const reff = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    wavesurfer,
    isPlaying: isWaveSurferPlaying,
    currentTime: wavesurferTime,
  } = useWavesurfer({
    container: reff,
    height: 24,
    waveColor: "#3b82f680",
    progressColor: "#3390ec",
    cursorColor: "#fff",
    barWidth: 2,
    barGap: 1,
    normalize: true,
    url: audioURL || "",
  });

  // Update current time when playing
  useEffect(() => {
    if (wavesurfer) {
      wavesurfer.on("timeupdate", (currentTime) => {
        setCurrentTime(currentTime);
      });

      wavesurfer.on("ready", () => {
        setAudioDuration(wavesurfer.getDuration());
      });
    }
  }, [wavesurfer]);

  // Recording timer
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

  const handlePlayPause = () => {
    if (wavesurfer) {
      wavesurfer.playPause();
      setIsPlaying(!isPlaying);
    }
  };

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

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
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
    setAudioURL(null);
    setIsPlaying(false);
    setAudioDuration(0);
    setCurrentTime(0);
    if (wavesurfer) {
      wavesurfer.empty();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-[320px]">
        <CardContent className="space-y-6 p-6 relative">
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

            <div className="flex flex-col items-center gap-1">
              <p className="text-sm text-muted-foreground">
                {isRecording ? "در حال ضبط..." : "برای شروع ضبط کلیک کنید"}
              </p>
              {isRecording && (
                <p className="text-sm font-medium text-red-500">
                  {formatTime(recordingDuration)}
                </p>
              )}
            </div>
          </div>

          {audioURL && (
            <div className="space-y-4">
              <div className="flex items-center ">
                <div
                  className="bg-blue-400 size-[65.5px] rounded-full flex items-center justify-center shrink-0 "
                  onClick={handlePlayPause}
                >
                  {isPlaying || isWaveSurferPlaying ? (
                    <Pause className="size-8 fill-white " color="white" />
                  ) : (
                    <Play className="size-8 fill-white " color="white" />
                  )}
                </div>

                <div className="rounded-lg  p-4 bg-background w-full h-full ">
                  <div id="waveform" ref={reff} className="w-full h-[24px]" />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(audioDuration)}</span>
                  </div>
                </div>
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

export const useUrl = () => {
  const aaaaa =
    "GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwH/////////FUmpZpkq17GDD0JATYCGQ2hyb21lV0GGQ2hyb21lFlSua7+uvdeBAXPFh1KiTN5lS5GDgQKGhkFfT1BVU2Oik09wdXNIZWFkAQEAAIC7AAAAAADhjbWERzuAAJ+BAWJkgSAfQ7Z1Af/////////ngQCjQZSBAACA+4PHY39pyWEBdvE7/oPgWJRw0Mdxv7KXQrFlQw7XhB6MWH+9ZXN46qjrUSPJLBCnaihwBRXt7319FHzgGH9/BHrSJYmbf4i7GS56nzC5N/a6mhiFP3o8NfbgDd27GBhtdlmQdleUJ6EG5WE7or76NxrdT08QVYT85ZoTH6u1EbxnSHDP1F1YAafpj8itNfVu6tub9O/IAWtU0KsdVheruOcEDMJ5JEd33fAKs3T91FF3VMxFOVl8sQN3BY4ql9PdRJX+q4X7KYC0jEFReQtxAco+ol5f/wvOiifocYio0GrD/64xY82AxQuAuCTYMYYVuGCvcdogOtC7jJDTepKVNIzrsuWVBxB8nhPxQLpwQKuTqAK0Sxr1a7KfuxRIUiQyvYIz+47nyGMG1HLCrTZP/+EtqGQcFtRqv+kLYjb+iFLJUHoSWrFJh2K5IBIgI8z6szdZI9U6eQ1EmhaUop2tyd2oIjl3IqpBN9/75VdzzmuwCgPWYVI+c/wOe/rrnAoq747+Y5yEAIp0Po1Gbr0Ih6NBeIEAO4D7g3J/CA0p9oqf1TkQMEZcYq3gqIJ510hLAV083t4DEIjmeIr76Hl/DLERJGsqfawhVBOryk+re+MU+IbsZnDCI3Ipy7ChxOYg+q7VQI8YEzXhHVOTszY20yiPKFwQCEhacYoY3Ug+QS/o0LJQIv+kxt40tvV9haBiw4fXt6bB5sEehRqY1DeRmW7Jzw160XkpcoMU9vyrIDryHJme+SI4jBcVTgBi4bZZM5k+EjO6fKP3/TLf+CLvVVstabR3yrYmE99TkCFZXIqAS3bjXp6q4e5OtWKxb/hv2tufd6hyR7WNLH1gBi60nJqhK1O9V0EB0v+6slMW7d5/sxlNgzj3Sosx9vIzFBcL/ocuo0ieO7F8TKwI3oStjc4G7keI+PjKkpcIjWoJB6ssUlMeugUHs0AzVHkWEPddX8hHdMCk/i5JHzG03hnRWg6q4V7+BJCqI3oflXDlu2W9uo4gsQk+Qjcc4KFcfQQDbGmfNFSDZFKzyNujQYOBAHeA+wNZU8mm6Q5aKpg3dx771vzBmpNvmIJKeSo7WAwYnK0irpKBcGSRUzFwiTTV3MmBB8PnueeGou9EIHR25vRx2uZBQt/1fi/hZ0/XhXeO9JeORnitxYqTdpn7XbUGY8FYEVvhjreKyD0uzU7I8nvC4dej38gNhUSjeIdHejT0QsHuP7JcDjixG4loz2ZfVjPwKfIEpWEtrGJ3XtadosTYryYqgY0a3LfSU9eKZMfPANrTdt4U3k0EYG2/h60kzRYsHLCZqQY71wX2zv8+Z+WCw3i67QN3TDO5HtNGYKoucJ7BRzA8GUBZGS8JJd8bgNj4bgPGgpzTwz9RANOX6TWDKj9YMa8K1u1fKkPPlVCnytbU4BS1MMR73luXVF1p8diOXqsW+BG/8vkIyin7SLJ32NUlED5F1aFi6Aiqx9dI+CsYPUtdWy+m3KOJabPRP7lICkB8QYFwq7Q/pYAq18Sta1lxEEFMe8w98m310PBVdxxSdv+0aUDOYAUNnpLAuYmjQYOBALOA+wNQbHxE6jY0Zfozvl9tR9bHSYNIoVR7aSFhEl/RCS6Tk/41/yJD/nFOBNOtrQboSEUCS4YFATRIawfLsjzTSP1caIOOnfx/GlGDqD9aTo2m8Z2suCaF66++4dT/3MoAgvL7VB6+JA5IX4mTOJyBOo98axMiYooM00LyLd7ll17BUYLBVp4Im6G4oHwZWw6o1xTsv+gEn7EoEIT6ch+CUbHpvuMc1NrPnS8DqQDtFW1ibWWV9F2hfRrRKSMEqza/A1Dy04Qj7QBdXreFfcuBfapXIGWI8WZtpB29eekDJozJRXfdoQJvQPYUjPCPZHMl0TgXY82el5e5r657YAnP8VPdZiR6F3tzT17yzuLjAhfCNtDe/0yNn7k3YjWjUxpsYYm2KoBq3djVjPtBHTUkIHIsGE04isHrtw28CwT0UfgKHRw3KFjTuIEV0zHzjbJo0gs+wTn0qhUw2QzcfScwMclbMki8DRaJHa1MQ/4tTMTuzwvUR4A7wlhZTVYk3qujQYOBAO+A+wNQFXUYfsayTEaAtqXTx5kWFN9/z77q/iHk13NAtuhsGiQQ1XkCsbKk324iBGwxFUnjqnbMeUxYb1CLQr+VAEYd3JAkYzM34ft8ea5BDXhCOdQzBkWbGtcv1I5L3LafdjLdIDL1dQu/B6FobBcBWckSKqqGpecWh0bOUTLZbxtKP6hFqTLFfq22xpeBjrZNlqsjo+uZIq8LFygorI+7H3+KrgjenqAntrtOALl0gIxv3fz4HQ6odKGlaWGJPzUjowa+GSrldllspxzbM5exKmh3w+9ftp+wgbp6HrOsQF0wQoRvgcaRKlb1hzoQdJjwhgDg44cnSbsDys120gMtAVL9VbPkNwiJNY4qg+BSU2P1aMlyiuYCyrigdn59lg9eysPKM8Fq5kqX6YyPACXOKInJkF7Hei7i40wmg9oPqJvvcC6jVWVUzQFfti557ufmjEe+jVF9o4orQb5UonapLMv9+/hOUtlemJxTy04mlR1aGsA0hYt0WszOFlAXUBejQYOBASuA+wNTl1R1GPvz3u9q/0cx5THs86igGiIzqWGgtGM+hoCCsdw/9CgBDJM4+OTh996uEwzDmm1oQhG5vfapL3BaEaFbTdLtwSdXrBIJp+WXAARizKTIpkRWCFra8b+Rb00QPxhRQ+5lBnj6dkAYX72YzIX/cxQJg1NIAzzfpu9RM2/dUYFai/7qbXv3fON/FmFX85Yzo4e5RWY9eZh2st4S4pDl0Udmkc7/oaSfNxx8E/vMCu0QsBuqnrrZf6XzqW6dkatsLo9+f+rjglCjUX4J3zRx3+rJyEj9dFaEBLUOWHjBJKxiJcvl2fYitooxhe6izTXJ44uU7s35y6I4IJMOT0/95gTvvPWrKqZaT+euOxJCq7y6HYzRASHQdZLbUA9j7nAqOHC8GwigeszFaAWP6QUfyBpmvEIz7zl1oJT+ed2I7+oC9haSgXK/9zyXzOMbTkXjcgLYdLDZ0/iFVNVWN9uolSxvbMk4V3fwyoyp9Dxy2F/FUY/EKXmlduVPZHKjQYOBAWeA+wNEO/eHyu1v7sl8KubwYD2I8l+JY1Q99iNUkm0zvGbFVAhOyeE0T/KgRqYdDTsTjvFmpVtjEySSx8ClXd7ADWlHVDZrj1mRV3SY4XVxaHrZr0JvXM2Tm1Z6NUcyYE4MjHlDaiKhahbAwYcBjwP8euoU6GrUCXGTK+EsbWsPaSE6UHSL4jEgiSaQ4bL78EN301nBi36biMNdnO5U8wD/M3Y5o/MWFYUXxTOY0L9iwVY7Rq5Sz0BGd6VgToNlepkbO6CGXunSDil/33esInc/LShEwHtc0VPuJiquUp3dlXfl9wGKBdaL+J7NRMGZsq2QMpQ9VL3DbFhEt6oIM+8s3VGHGfnRpZ8HO3I68o90aMpI/qMwJR/rAYtNGkFvrU+k0/TgbdxtkikULiKzLXQgxXqJHpVOLcsIt7+r4Spy218xRGpvfa2ln8vn+aopEv/hkGnQsi52FJtgqZ6EoBAv/GdyrRaKZ8ZgjIWQaOltt+fiQDm+yF6To4eCs4SKj5qjQYCBAaOAe4OnaxU9z4v4MNnQdyaZCUTAjW4B9byMC2Jm4QwxmJIye+tChrO5KM+gMHcAq0UJ3WHTHH35iThUkIUNTMAjztndrnWhyf027qPTnttXcmUhEjAYRmDickBxVglbKfYxVlqN0Mih4UpdnTPTQ0cKpGFsTU4HDoTxsg8aZBM5UE8aKdVT61rRP3QNfQMLzz9z6gMDRPZmCvx1eYD9g1jfbHiBOHRvVYn3rYonAapZ0GzR2A3knSaZFmAqGePPgDRZfFjXAda6IiU+W/E0nMCl3emSJKvzi9Xio7F/SF1n7I52jv7VWqwTEyX9HvKSkFzEW+CMsirT+c7obgyxNmNE5oM8hT/ctekn3RkOszX9gXZdzpLfRfoVPdKZehyJ1xKBBSWUe0/pOlwbq+1QiLBuYLc6tt9BokIa/GkaYOKnS3BmH1Shf+FdiYtpKYk2kxuiuWoBorROdyw158+k7n6xeehHu9CkqdLz9FkImsftbw2rdQkXFdUFbnCMzPCjQTiBAd+Ae4NlZBU73y6QT/Q2ahfSoJOYNBlTUu9kDqWyBKVff8aUcimxD82uURVH3vVQUEPws2N7Xd1CLfn0HzCLGrITnDNFR4J52UTLDjEPv1P0snrKEI40pAL6fCN/xFPyebIBY0jQ+hw7yjWqFNSpYCOvuxuIdOFI6Mozq4sWogi9l7NPTCCByJFBNpbERVfsowAssQAjvXVMWyACbihsaheT/MCVA9czGGqGqXQ1EXvYFzFD6twm+AJo38gD7Yz7FnBTOnU4LlsqqKWF1mItYhIZ8DXjTUdl577rg7xj3pOPdKgUY7QYmenAo6j6cshyuo5r2DHC076zuO5t6uI+8iLRXg7MNogw5T8h75+bBNQu0DPL7DHm6FNU//3yX4wpsl5aBh+WINZ2ILj9DLYzVmL1q0BlDW6jQUWBAhuAe4NobRIYw2WqqmBKXmJa8ulUH1W0r8YXhDobmuqTY4lY4/ir8ffjBQBLOPtkFjKIy3fgCdf3ayMcs+zyx+/ayEvxld4UyZtMCyofm+e+8bVceyc/1U/vKRIytAg2HrJJ+OyneUkw2cU+t8bxEhitBTkGfH4Krq5qdXWzhftFqu8Rvbmv+zvXeKDFTVFfQ9e3A3ufiux8pz94aRcRqlTZbCEm286WcGwzzgcFHK8jXEXXNYCIWwSR5OT+MW/DnugrSwX9qe/e3UpNlEOvsIEZ4smp1DOXEIvkXhUPvxcqW6xNfUj3gu3T5hSKkcloBsM/X5zkTP5I0t9rEDt5e+TUNDNxZFnImGzL0TD7CPUkzEyMLq1nl3arsvALazjZIkCl/sWxuT5rkdwA+7m+nStF5I1lzFn83reAOefVbq3EXR35o0FJgQJXgHuDbGgSDzkBwiWtOXQdCiFJJ7nMuisGGtwYYiglI0cfDvICnTU/BV1KJzGIRJBRQAfw1uYoaOvuJsE8ewIAzwLG0JTRvffVR+UfEqQsO62k25usKucuA8Qt018XnPhHSAdJ7n8n1gwSqTSyLI4qxKoSGL2GZ3qQc/QHVjWYWdKSb5IgfraS83vWAjEys4oewqtywG6gQ/moC4UjqIDXszfqnDHeMDjZb4e6N/thqlAhdLdfjxEIXlQbEK9fxcuUZJR9NEl6xqJUH6C+QHM96NoC+HsewnUGXhIaqBQXBmle4GnoEo2FELpmkwDbo0a1Fz1EqU59CDV07bDpgWTQ8axoEE0k7BAQp++x31lLIrCJERaLyYBCE/NSaGs1iZFpvNaW5rvhxOKlSiBT3Gfxhrc9WWKpWyryr5hwa26V2zOWJsFVheijQT+BApOAe4NlYxIaqBHEenIzRc0U+UcU9xoyVujuDmRb3CMwNzLmlAwENMxjdS5oh5QfBlNnpqxq5nSP2SX35+FsGuw9kofo+mSONWvy3Ef+u5XC5kMr8pnPZISBkTPFF5unSKuor0awMsd/qJ26EhhdbuDzMTiVGkCe+3FgGGjwBFk2PAjUtHkW/btdFebCrtMHIhs8JHi1oCVIOeFnvcFIin/41LUw6pf8vhWdSlfabK3ymgRVdXBjE/ZPsj7szpgFi1fOaKPqdu50NQPX1gRPhmEcREhzdj3sMN0War5Of+Cw2aLt/9IDIlWdJWmTmCm3fdbgVN4m+GrHaaEkWBX1wiDIEIPO6wtoAijWeHGtO3btPPEoBLRYvKMAPFT6wbqroBe0SiMOYN59W1Czxz4NH1NJFA0TLDf1FrFGiX5xo0FIgQLPgHuDc2WANqYVtwR+WIhWWOOqybjurlCeovbwnBAq1OZ1cxDZPxLWnYWdENFy5QZ3UQOydwWPXUpznRMbAumOOv5I7hIO1ScpFbSiBH7Zhu4TLEudfR/enb6Wf/HRtFzyd8Lw9VGKEK8hfywv0Zu3lAEgj3cMuEWxFT4yuCirNXx87QbJoNLUZz8iNt/YelCOifT4KD05Vc4YE1lHyjethezRtzyZEUSNrzDpXrWRmFAJeFhEFHkVHlaT5YoI7QxJYe+Im2B5BKb9a6GTzr9EA4b/5vsAnzoPcDL/zlwVPgCnQDx+ruiVaiB/GmoVlLalnCHeUnCaHo9hsMUtAzIprMoQLbBw+PEEWOvPbsAPyw57CuvdeMg/7mBos9haTiCfMCvXeq/huy8SgnwxE09SCCQSEyJgQ/qokOhfqp2VfVPBzfz+H6NBOoEDC4B7g2RlFT34fzUj2Mq8UlHEApFlcNkmOmTyYWtvDhX+i3v6E+WzlI7VjrnjUnzguDOQhnLbbMMHOCDCJkU+ClGu6/HDaQewYE8Sff6xoeztwxeTmfTZA+mnKaspO+QHeY3J56MKx/2dqhIYVzZbqbxNWVFR+vBOKbDeaqbtblulTV9EZdrF0D59bnA/EdJ5EnvqDssA6G6rNVhGFeifr2C+b4IwI2SA/wl5pIJyJoc0wgg2yhmt6QW5buL7t5s2qsvf7boZm4Ozp72vke2xEhipjQ7+2XWQyFewI2TxePmV0Qx4KVxihCaFWJLSlV30XDESoWi6rcBzU2uUZN9tkazWzZA5b7uJ+JJAkGxA7ShmBlJmy2sRLTlMhkuqEUSVgap+UOXiQJPvpDa+VxGvKtWMYAShkkWoo0EqgQNHgHuDYWESNfWIRVKhOgdbnIv0YQGWWg3e2yWIKoOR3Kf7CRDqOEQ/Cg4izh4VF2B/ttqXWQ59Jr0hKqSIz8OR8g7J0TlfonTQ1SsJDF3p9CI1Rdhw4llycthHzmW/LJwooOras+3wEhjiJGwpRzwjzK7J/lpahPnuVdl6yAiSCoK5anxrJJ5Hu+TgC/FgvAlSC9L2z7G7OsBOn6aLMknlbXp6Mc2M3cM3YAp65LBBOR9MPNWpIpRq1O61rFT2dHpsecInIR1szxIYw+DIiL5SKPId9mPTWVwYnIX40e0/DgMy1+noTmygpyJQnsnoiyavpNytX6Qlcc7ofeHbNIWhOwydfgjt0/ksqO/AI7b31XOHxa3Flhtus1sICWiQ8cRznGsBt+a0qaNBQ4EDg4B7g2llEhjTOmi3Wvy98oHZqagszYOsDOR5omdzLntH3rgIA9L/G2NKsJlCW0Jk/bpzZC7WsZr8hcatW6Vui9XGlAOVzX3OBKfAF49sR8gHfKVl9O9KJz/YfM93dWPvQHPuzOc8t/KYHi2TkOXhEhqn4HTOJ3lxDN/V0bxi/key2BfoWVAwfgjP/UsfmCyPH+4X5ugHMrAsvhtTM9ZarwseWo4VFgZcSG/v9QYAUX6Kpk0KI6wyUW83e42K45fWwVAoHLpeEG1MVEGdP1PIEwowHi+GW7Rs9qp6+VXD55E17s+LHa89tKV5vGmdvPn4Uhdi9IhtYecvhBmsAINVktinuJ2Kp/O6estu7dwuvyUnVp5B+h1h6pufg+nJ32ieOGUTpy0MIs5yH6Vq8WPO855lhfTneXeNMQkxP+WnOK3qo0FUgQO/gHuDc22GW8l56AtCoJIUR39RKauIjRfr5TlFQFmFVXdBUy5gmcb5/HyJm03m/cZIWgHLCZvDrmnbSscsDT4zWMpdaj7D/8fcUezf3UM7kn5iC5mTXIl252YC7+c3XvM76GpL7XJ1gHxn0Jlyyp0O+l1HzXAmkJWqhmnrrQfCq5mUT8uuYJsrI6y3QO/oXYzvR6m1A9NsLdPaQVyT1RWy6f9956R9oyTmKRFCbd5o8WsdR3rZTTkSMDso1R72mVjZSIyBsP61XPXA20r/B+nYSox/93/xDfMtNz6MS+Di03Ub5rHeuoaBB5zEWCkxxKc/kcr3mNIIYZ9YN1yqjM/ZVjxmqLhqeAe3uRyB5Lc0s6tnQPUVwPbLR5fFgfywKPUIs6nwNBx2sWtVa/B5gzl4lbRQk1AbIJTRznn+0F0grzR8wUXwD2MTdMpWpL0k5+H1nqNBPYED+4B7g2ppEhAtU7ZjS500ftqYtbWqU+Hz9MMXQwBq0dlVvBCMGcZ8Y9sWGyqT754jlIvshaG4xdAb6feVfniBvUBVEufbS7m78xgWBPizMkl71jCr1k6M/cM2QiBw99Hr5rGlFMAfp8CNQtaBkDktoxIalYgieLCxyya7uBoUYVM5QwV88SY29Wi1LzyZ335LzqrWkqowazmevCh7Lh3FGBWCfa7j+eR05/EKgYsnQcsrQiRi25Cbs5b+bL4ME7QrySu4hwJboevFkGsLbcTUG46dUMMMlzZd8RIY5ah12PXyeuWoQ5Fu4g+qeKe+z3JLmA3d9H+DV9w5+xF+mHbtH+ieAwR5Ga0G/njBdV7Xzr7rY6wED6fej8ebwVkdu1uylgNVt+r9m+6AzuAluAK+kqIim5Qou548ZeYeo0FNgQQ3gHuDbWwSGUZdofMfTF1fbAUqMgKmuID68do6HasuREaFxHgplDmxEKkdihT0naJgtFWadV8pvdF3qzYqcVGG5oTrWOMF78XSurbqp4crgy9v4jV9NNznkI95MTmuco59dDFX2+EaFRfiiDuXYqLekpX5EkDC0b5nXrU9JzG+0lhhXMkOsvTkFo1/+MEMlyI8IlPG9RdDsgAHPay9TSQj0d5xVcpmckFKN9cqzcW+SeYRUaYuajyQa6JWqk01kMDIW2FIxO7rfy6FWw13jCC8/b3YZp4Ey8V5O1oGi26ohlvPb/1vH7MayN+8NRtm8of3WlpbdjHYNg9SgiLTAWJWqWCSskiXvuW8X414kNcOTS/qvcnPMh2haBK7d80CcIPMbns57J4E7UTSrjqH5RiKMtlTReQ3t11bd+QQRmbLAKh19pghPXYoq5Wfo0FIgQRzgHuDaW0SFwxKjZvu92I3TaWZ8+aj/DgJP1LPiD8NwoXXKjqCTNIXQkDigVURjI/NBbrZQV3hHnUtzleqiFPCZ6cU+uiftEWWiYSe22Shh3fV/yktRbMWfGcqlRIH9vCgAHh19g90Q0+bkSD57TASVfHfilRWCt1Mv8QZuWky9efU0WK9Y1ZOumsTXmZhxeoPjRAC5pFiINghI2AgWaq6LkAyVW/JGeZ5XrR0zy0DuUBZuJOLzLxLqsGRD0nvc1WrAhGK/MW6MIS1DYbTkProGEJm+c7yj3jl501fEhq6ZfnjGJUM+Ilj10Tc3jFM6pGqBiavPczPqkT4LZNqw0LakWR67PRNeTJCLC8an2nUnPjY8lxIw6r3IcTmHCZcbZxmKjgG/0GxvsiIAN2PkTFqVhACkGgRA0sSQatnF6RIWCnVY6kF8qNBSoEEr4B7g2dsEhjAlJWBjMKlfqTRxEV+fNcy0ikpG21xpniJu2WrgqK3r998lRsSoc6mUTcV8fqfGkE3TyxrFjITn2c2Nkbs9GWY1XRkaD+rYH8MilB/OBFCtaXb89/9+hgP3fD1j8jme+AHqdafXRIPNr/hC1SM8wE52xS9RsJQlFBHi8Dw8ZumMHHmlbbE42VIKrTufnkoWgm0/YYXfYASUrHTv27rsTG2rB9tcmR5ipZ4cJ4nCm7SX0qo397OMb20fpGmPRY1OTYiRCQS5JfLqFn+NFG74NWduxIY0WbjN36li/0ptBvNMhMW+4M8Z9oStGTnPvd5lEmw+B/hoAI8q0UKxm28l5xciMRFHbk1Zlbd5lp8KoDRnsokNl6eD1JAtTu3VfS5iMQP14a/0432XRvax3SMAb/EqLwyCR38L+dchT7xPPOmaKNBSIEE64B7g2htEkDDvNL0mz5JpnNzP6vuYmwJKIaKKl0INFn1d/3BLUyC2BNhRzLnBPpzBTu0TS+9bJLnj6G69F9w2gardLDPNLAHW6dpB4aJfvugkbr4eFlzm2NFUyYNK8dhJBbpzJZ8ECUGSa3nLjISGM+PUeWUMc1Udrrno3kOM3p220mWt769CqZwc4/A6CTY4NXxziri+rkp3ETEZtVreea4mc29ryrW4H+XPUkm716TomoUqGZppqe1OqPsoQd0DjZU8xKgRseag8KItnrc8VgfimXtKzl1z63pEhh52mv4VaB0DpTXxSU6TP802WFod3IwhdZA/3Lt5U3g0mQXtFD3Unfm61LlboDHyo/SFpzAP9c3KDNAln67L73lrWFvI04Ff7SjmQYfmbSrNchzafYaNNQ1vUOK1rsGwMmEvQGQMbvDlaejQUyBBSeAe4NsaxIar6CcStxISO0EmPxzW62+emVT8qdePYo8Bek6EE++dZOaHtrCr7rTpTODYTyMMc4unrnnQMeWfulON+r/iR8No6nVms5qvM3cmatvPCVHazWK+HFA69yDvtweYCm1xaE1/6CjmbzfQCKFGRIY0znmviD1xM7EdqX9+URcEPVAzygat1oNPlRZgnsVpUz+cDFXS8S56WIgvVPYFb9/8I/l4j08NO7Cu0KunXjF93fs06V0JqavWDTUohdnxSYJBkRhQbPspjQk4+IniyXWvrTvhdEffo4qEhqS27IELxAUUiUo6LJaC0IPmKxQUHCNO2kptU2zPUBn8sdrSiHPhjvDY81e8UOhY1772q8ls3Q3mdQRfZSinZ8kQw1kdUECFgXR4CIIEnUMKIBQ+Gjp88Cs95yYycPZ87QLCPjSBfItDMUWYqNBUIEFY4B7g3FpAU/N7ujZPDlHBCw0Cejtz5I1313u2A15wKsMKM4sNuRr39gv7oBKszK9O8bzw46em9OsSvUp/OJ0lS2tWjr+9Gcm4Yi7DElS1gOWTjMwtqwWClqs6VShYp0x0X7L+T/1aPfya2iOCmqtGO9NFIsShR8SGMP/EvilIdqaD1hfvr0pMPJvFbfo2LGrubtpGPwmyceibLRDmZLOahV4XR8yl3AeRiMKGzEAIauLdxOdhRoD6yoI5Otmda9Ioy6KeBHnyq1jlVbuJO37EjqFZUJX2XU38fPxpMePzgQBT2o64iiU58QVlh/G/q04azYwUZSyhWSLVeFLDrIR6snEshFoG8X6o9VPiH+B1sIOpWhcqOGVhuSO5gbA0QzZExUxyN5RAffh7Xt0v7Si7phUMnTDOP3EVGU5ooXoNqpTO2EcxjL5uGgJVpUOJqNBT4EFn4B7g3VshmQQcoYA0N0ZmEkzrj1t8xJeKOwhtxJ5W7cFEy8+aKAIuMiij7re8H95Br4aQU2I2eKBpVeoTu+jIq/u5P1ZdrG2aTPXWb3IqJMmy/rHTbOMmDmFimur3whdTDEG9xRnXL2F2uhPhS86W/uVLgjakm9eVQf1hoNbT5Yl/OlbIZNl0n7EQlch2al+cn/lxKkLg1aqRh5HTiZENNxZlEyVMp/XhpTBL9jVkJHB//G1hv3WZq8XhpzweA89uZTCiS48yMgmLVruYQN7+Obr4TkS1A+xTfm+qHIR0juIBm6HEHbzAarY9P/uV2Ns7L12eF0NnPz0NzNJoBF3pj2bIqO4JI1cQ2NE1WG6ThzL5HWE1RSehkwScq58dtumhJ+R/iO5yWPTVIgOsCe9OR5SwPzbF/iWY5mdiO17Lqk+9d3ahKSLEQXHDiZxo0E7gQXbgHuDZWQVPdCapdJex+mlosYk1led7hcHmDC/aMb1RRFWZwhufWm6XpvnttNw3A0gmuO42y1FA+jWsHmm69bVcvqG7A4ECMJyCP+V59VuM9rc6eDQMOJcWtF5Pf/vMSAHVFJ4mrZggE9mKxU/xMZTvTeASXWkP3XKQNC2TrJwnIRcrYEmv/R6d15CiWxPf+kbcU3klXhdlr0OYDEia9zLU0Q/5C4xJzeQFhPnK6dZrOC62JY89qEmzIWsJ5j6nDCqc2v4ce7WwKZA+cD+BjAVPdNJF8WaWStKZDH8VUiQ3wOkXtFsrMHIiuglWsI0D5VhUCgqca5vEy9X10hXJFL4KJQYkb05lsOTNkk99YGxTHZofA09ozsyPCxU5mzpbqSfVU60bEBPazlQ9EYHteSXc377zmZC5y7qo0FDgQYXgHuDamoVNDp2GodbqraaaXa+uRfLbdmygpWpg5o4p5UHtXIeArS3qcXQc58t3vsYT7/eoo12nVLNzHrilfyJSNqwO0LZsCbOnMKm6rhz8wo5CkwqaVNoiHmdUpUc23mXZ4oqKYf3rdOtR+8jj31pFTQ6yAVPY71uToV60sNYn/3ydZ/W42OhkP4vTo1/3arCJtJ/0v2xfxnvUsOYkl+yKt2odDGEeav+MD+xJaSQNm7/amJKvg/hVZYgztViLrcaURocJcjkmbvbzVREBKh626g5J3d0MVb+chTShNn5F75oE/Bo07BEmEHdd+cf9kUZ30AY1/QThZapZI6lPHq0yO0u20h1YnNW2rnCDKfVQz+7OYqvYjVByNVBQ1n36/e8Tu3420u/OCaJFcd0RPpev7oRJiVsScOjptAVHyvtLXKjQT6BBlOAe4NpahIap/G/UheMCiSww2YZSV3UVhzo9kjQBmx7Ai008S7AwwTSOkpZ3Oq5WJxJKVVM7JGYkdzI1eYKbNJXoKkq6rgBGLCgvYObc1qi0zjsFe74ti0biNH4Pz2S8l50BmRjiWmZoU0d1WW9aRVFa5krAWiChj0ZWWiIA1rFMraawD5zNG/m/Y/GCUELQse04vTPTby/2WEj0b8MFmSZK+wunl3psgK5V87C1Qg21NwltruY28XE3JlD6P9nnvrzpoma0+JEfIxlt7+d+qIeQ07Fkncp7fgU1X2be0IIBhYd2TcDWzcbnOHEhewvGH3dQzl4UFpV5HpyyvNU2V1wSLKrLWUx8a6ObBExOL5kNqVzX8ZALORn1NAD8jBceL7uUFBmjUE1GIGni9a97uFCDMOaAPUssO/5RaujQTqBBo+Ae4NmYRIaqhfyhzqHYc1oB1n56/FyzNEd8x5o8yNTWS8j53fQB09VQb0OhsnNV0zgvI7PJtPpesh4xrWw3D/O9xc400VguNdbt9W2hV5z5Afaq56QKNW3G9NVPlmAEsFeAFPzIsBd4TQmqhIaqO6PM2pzjP1K8/xxNuPVaaTp2SDBfyMp2Bs1L77Q5+FAopu+W7rJrTMqiAEdyDGLjI68Ifn+TFUNC8WcSGeGSRHmy2OIxFpNVvB3PF8XlT/a1JCyYoCOl4ARrPBYtaoScZjAdWzQfWfDffxZunPPlkI38T2AmCODVnaaC/WsatjIlqSJffeGgqnRu01QCr/piKYyEnkCL5MpYO1zx+awOGKSl5f2yamXy8w7X+LeW2WoMAwEsUv6WatG/MESJIToa161Oao+WIpmMqNBToEGy4B7g3Fshqx3saeDJM4EEXTS2Ij/66vU0hx6MzpVDszu/Gyol9MTXz+kYfSSDO3zTMkZfDud/BdgYsjRs1VGsrF0wpAKIBf+1QP7IuM9P4X/+H/YXqYAD20mClV/vuizSkqzyTI4BvPTwkIVSY7O4YCi4BBz/rmGqx64asUI88awORtKyQwdz4s4BoKvaQ+yzG0BO1e4JrACGbFs0TK6+3gdX9X3UQ5ReZqI5+BWTsd5OO/jacuuFvmE89QOA2D/1UDMcX7JbsbJEaSrcP5IOnXGJRK0wV7aBZ9vlh9idylZ1roVZlMK6C4uK0Nf9DSKavtKNtSYUDddpCBbe7jUoxUHeEErgK1auu5DVvbTp1rCF0z7ksp29+CnZcB1v/OHgnlDH4Wz3ySyCCFnHe34/N5V3ZD7sRHMLvF7+v2InYeKkn7fLFmUUDBVdjujQUKBBweAe4NnaBU/myimsGlRwB6/fHk1ZWlDz8WDgpJ+Eg/zO0j9xm+QbzNGaUHpGA6I2mg9aMrAgIfUkX9tGvf3I/fiLckSXm5eY9aDOv2U/w+1c/ipKwTWc8m1ppiyfn8n2wc9TnsHo0ir8tq/jmkU1eBKVbLwo16gr9SoHllAn/qK1CRnEVw8UJU7ikqYlK6SfdJpxcgJWLX/U1Y/OaIP+lJfNTJ/hjMwTyC3TvfuDzDsCMCxDV94Jp0uBKlF2qJi4b2e/TydcbbBTa6VhB04BlmN2F92cxIQKGvUkOigsD49Veg2nX9acedks4mPW3NCuFhHo5fDLNDGIBtM8BRZCuve+ictVtuwJTj1y3luL6Hib1uNo5Ss5IY0T0JdXYpFZv8kpzT9XYz4Es13/clueth2h2+I/9v5Dnato/+ejd2ho0FOgQdDgHuDbm4SGo0TdmHYvccBfZ/8I3YLXTq21wt8zBe58z8xT2aEE2Ajtk7YB6V5UIGiDn6bLld63ix0k7QxM4O2heEZFtQvJ1uQWP1pNM5FG2JWISvi8B8OITFGQvJGk/AbQrgXygK9IGt8adyfNBHl9+imshIPKcZGaUghEf3JuLpNfcnjYQgLPDNPASI/7JQ6VCTeSHMs6P48JgOrXN+IDT8jyKmxbqOWRCtpa6hKUBbHIy51lnm3lIXWfp3aEoppZmyp6k8H/JJwiOlZ+LGIdGwGU05KuIsvIiq0ojfhyv5xEhjBjgVIuykmtAZFLvnHhExRwvxAVLdSgAsdip7AAmMIv8BrMdHEEJTzQL++UsWiqtw/gIA5i9mjwZhx+xRMBXNePVEPaibLgbYQ9WymiQ7Aqg1QGjUY833aw6GJ0j2UV4bGq3GZvsVs6qNBPYEHf4B7g2pgEhqTENCLw+d5K1iPTCKkzqBnZAvFlfk/tuiBi2QsR2JcCxWY1w13DcoXWutSLZ5nOzpZUQKRwVeHuH35NXTDhs1ghcaITr0VW4TVFjI+vTCd+IZQfmNSjsC2+jwHhHFAguYRPygYPv1mAxIakgNH2C15Ttb3LcjPkgfTx8U5uWWi1KK4lq6Hm/XMURN+NDP2cyy/M9vEvE2w0ooHjvIsNsaQUCGMxtGFORqlOPvEHO7m29weomA1tQ2de2j3/b0lNcrQ1D2Fg/qXMxIPMcm6gT5lt6BVk8yf/mYH9xz4lSkekcKwHWTpQUGPyr+5z41p/0ZgjbFP1lD9it2F+liMoeNNkAknuRZR+6FT8iyaOaEaOQKa7SWtjeE1un0ysrH7lzA7CWU05Kq/JAVBvJ+pNjm6cD3oo0FMgQe7gHuDanESGL+lv4nryYULAs1FQ2kf6xIkaTJMLwTGsIocSHu7Q18UmBIgQ/Ne5mMvklw8ZrRUTf41JG3YOGDwydO7Lxqpq5Hd86DGQKb5YjEIPQDdAmvTS+wpGmbcLThhS/LDVO2lOBYaZF9BYbVrEzG2q8C111DEqjnyIj4L6GXU7sgy9R7Y/15ze+Z+31hdD5FdocidqYRJup55s1FatITvXlmQgx0VLswEO5/E7JA5r25z0AOFprwxODOToKSnFmymQzEHuOKSRfrmYfCvFu5a4BN2V6QgVS0oSx+orjMYNFQzn/VepUf15gI9Y/oRTUPeu9Hb5O5zTQJjpU8GITt/krchbasIqRkI/M0s9pDqoOLSpnKvHEVvTRc0vLzJcLB7UvknOV8ybGCqaGVm0uGWwmjJdsXP6TEM6H+2GVgzFsYj6XmhxnyjQUCBB/eAe4NpaxUxpBg1jrXAa7/spwbARMKqtzgy4loEAM75QUOr0RlS8Wlvhz/tiUCWaSrWw8teZ92rfDTx25RzKK4XSCus+msAk/YxR/mSZK4aX9g2QjO0HgMx3+Ny4oz/ERu0J07OsqmIUllrxiPlYRVyaoNakB3eSVN7fnBdEjRcEipzyEwLOlJ0p/zK+6fpjn72cavIvzHSI2j7Zmx+i1/b+YRUwwgaiaDGhyBfIepu4AxnwElIIQAFPJ+o+rmcGmTiteny/EyJSycmMDkGFqN5qFVkEUDmWhd5FRuEZlj75i2vVZbeo5heVBqy25DXqqV0phnDeD65S1zxji7hceFK87TuGNbL73Q7PlN+W2m3C9g2iex9u2arrjPkTa/MCeJh+aZWkEyn+3nkY2ZTi0fpI67KKoI/wyZ87Z51sqNBU4EIM4B7g2twEhaGcu3bBMfhY11aSFxX8U89o4XREsmhiUhHNrxaFCQpRLniThgwIWC4tCDHCln1G2osuq2pUSmxmekmx0zrdCmy7wjZ7bb7U0fAlyPpCB3OOuX0EEMC3S159HDUswcYhogFH0+LbFh87ikSDZNLAGJ8yqeWniWz6hnVzY3hwdKBgysafEgBk1V3SNoSNIK6v8PjKWZJnqOEBHAOo10BYZv+TDdRvG5PPjvb0bdBjEYTSEiTVq+KyrNEoh63UCxQVr3eLCw5blCa9p4okMHqaZqY8mXVbFmNRmdpEhjCzV//fxl8/Av0MF7PZk17UnxG/y2BzIXl6Ea2Mi5ac3XYsntnR/G60ZXcjjKQ8QuTLPC9LOQablaCXImgpxAlVH1n2WJ6ifsYtJ516mnVd7Saw9hxRBDvi97HuIY4/pMl93QfPvUAsvk1KAP0Xg==";

  const [audioURL, setAudioURL] = useState<string | null>(null);

  const audioBlob = new Blob([aaaaa], { type: "audio/wav" });
  const url = URL.createObjectURL(audioBlob);
  setAudioURL(url);

  return audioURL;
};
