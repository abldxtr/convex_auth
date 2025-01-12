import { useVoiceRecorder } from "@/context/audio-context";
import { useGlobalContext } from "@/context/globalContext";
import { cn, formatTime } from "@/lib/utils";
import { Mic, Play, Trash2 } from "lucide-react";
import { forwardRef, useMemo } from "react";

export const InputWithRef = forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
  }
>(({ value, onChange, onSubmit }, ref) => {
  const { imgTemp, changeIcon, setChangeIcon } = useGlobalContext();
  const {
    handleDelete,
    recordingDuration,
    currentTime,
    isRecording,
    startRecording,
    stopRecording,
    audioDuration,
  } = useVoiceRecorder();
  // console.log({ changeIcon });
  const isButtonDisabled = useMemo(() => {
    // return !value.trim() && !imgTemp.length;
    return !value.trim() && !imgTemp;
  }, [value, imgTemp]);

  return (
    <div className="grow shrink w-full h-full">
      <div className="w-full grow shrink h-full">
        <form onSubmit={onSubmit} className="flex items-center">
          <input
            type="text"
            ref={ref}
            value={value}
            onChange={onChange}
            disabled={changeIcon.state && changeIcon.type === "voice"}
            placeholder="پیام خود را وارد کنید"
            className="bg-transparent focus:ring-0 w-full h-full ring-0 focus-within:outline-none focus:border-0 text-[#0F1419] text-[15px] placeholder-[#536471] disabled:placeholder-[#53647173] "
          />
          {/* {changeIcon.type === "voice" && changeIcon.state && (
            <div className="flex items-center gap-x-1 mr-2">
              {isRecording ? (
                <span>{formatTime(recordingDuration)}</span>
              ) : (
                <span>{formatTime(audioDuration)}</span>
              )}
              <div className=" size-2 bg-red-500 animate-pulse rounded-full  " />
            </div>
          )} */}
          {/* {changeIcon.type === "voice" && changeIcon.state && (
            <button
              // type="submit"
              // disabled={isButtonDisabled}
              className={cn(
                "shrink-0 size-[34px] hover:bg-[#1d9bf01a] flex items-center  justify-center transition-all duration-300 rounded-full",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none"
              )}
              onClick={() => {
                setChangeIcon({ type: "voice", state: false });
                handleDelete();
              }}
            >
              <Trash2 className="size-[18px] shrink-0" color="red" />
            </button>
          )} */}

          {/* {changeIcon.type === "voice" && changeIcon.state && (
            <button
              className={cn(
                "shrink-0 size-[34px] hover:bg-[#1d9bf01a] flex items-center  justify-center transition-all duration-300 rounded-full",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none"
              )}
              onClick={() => {
                setChangeIcon({ type: "voice", state: true });
                // handleDelete();
                stopRecording();
              }}
            >
              <Trash2 className="size-[18px] shrink-0" color="green" />
            </button>
          )} */}
          <button
            // type={
            //   changeIcon.type === "voice" && changeIcon.state
            //     ? "button"
            //     : "submit"
            // }
            type="submit"
            disabled={isButtonDisabled}
            className={cn(
              "shrink-0 size-[34px] hover:bg-[#1d9bf01a] flex items-center fill-[#1d9bf0] justify-center transition-all duration-300 rounded-full",
              "disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none"
            )}
            // onClick={() => {
            //   if (changeIcon.type === "voice") {
            //     // think
            //     setChangeIcon({ type: "voice", state: true });
            //     startRecording();
            //   } else if (changeIcon.type === "text") {
            //     setChangeIcon({ type: "voice", state: false });
            //   }
            // }}
          >
            {/* {changeIcon.type === "text" ? (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-[20px] shrink-0"
              >
                <g>
                  <path d="M2.504 21.866l.526-2.108C3.04 19.719 4 15.823 4 12s-.96-7.719-.97-7.757l-.527-2.109L22.236 12 2.504 21.866zM5.981 13c-.072 1.962-.34 3.833-.583 5.183L17.764 12 5.398 5.818c.242 1.349.51 3.221.583 5.183H10v2H5.981z"></path>
                </g>
              </svg>
            ) : changeIcon.type === "voice" && changeIcon.state ? (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-[20px] shrink-0"
              >
                <g>
                  <path d="M2.504 21.866l.526-2.108C3.04 19.719 4 15.823 4 12s-.96-7.719-.97-7.757l-.527-2.109L22.236 12 2.504 21.866zM5.981 13c-.072 1.962-.34 3.833-.583 5.183L17.764 12 5.398 5.818c.242 1.349.51 3.221.583 5.183H10v2H5.981z"></path>
                </g>
              </svg>
            ) : (
              <Mic className="size-[20px] shrink-0" color="#1d9bf0" />
            )} */}

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-[20px] shrink-0"
            >
              <g>
                <path d="M2.504 21.866l.526-2.108C3.04 19.719 4 15.823 4 12s-.96-7.719-.97-7.757l-.527-2.109L22.236 12 2.504 21.866zM5.981 13c-.072 1.962-.34 3.833-.583 5.183L17.764 12 5.398 5.818c.242 1.349.51 3.221.583 5.183H10v2H5.981z"></path>
              </g>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
});

InputWithRef.displayName = "InputWithRef";
