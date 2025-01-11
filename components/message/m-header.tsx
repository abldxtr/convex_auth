// import { signOut } from "next-auth/react";

import { useAuthActions } from "@convex-dev/auth/react";

export default function MessageHeader() {
  const { signOut } = useAuthActions();

  return (
    <div className=" flex w-full sticky top-0 ">
      <div className=" h-[53px] w-full bg-[#fcfdfd] backdrop-blur-md">
        <div className="flex h-full w-full flex-1 items-center justify-between px-[16px]">
          {/* <!-- 1 --> */}
          <div className="w-full flex-1">
            <h2 className="py-[2px] text-[20px] font-bold leading-[24px] text-[#0f1419]">
              Messages
            </h2>
          </div>

          {/* <!-- 2 --> */}
          <div className="flex items-center">
            {/* <!-- 1svg --> */}
            {/* <div className="flex size-[36px] cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:bg-[#0f14191a]">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-[20px]"
              >
                <g>
                  <path d="M10.54 1.75h2.92l1.57 2.36c.11.17.32.25.53.21l2.53-.59 2.17 2.17-.58 2.54c-.05.2.04.41.21.53l2.36 1.57v2.92l-2.36 1.57c-.17.12-.26.33-.21.53l.58 2.54-2.17 2.17-2.53-.59c-.21-.04-.42.04-.53.21l-1.57 2.36h-2.92l-1.58-2.36c-.11-.17-.32-.25-.52-.21l-2.54.59-2.17-2.17.58-2.54c.05-.2-.03-.41-.21-.53l-2.35-1.57v-2.92L4.1 8.97c.18-.12.26-.33.21-.53L3.73 5.9 5.9 3.73l2.54.59c.2.04.41-.04.52-.21l1.58-2.36zm1.07 2l-.98 1.47C10.05 6.08 9 6.5 7.99 6.27l-1.46-.34-.6.6.33 1.46c.24 1.01-.18 2.07-1.05 2.64l-1.46.98v.78l1.46.98c.87.57 1.29 1.63 1.05 2.64l-.33 1.46.6.6 1.46-.34c1.01-.23 2.06.19 2.64 1.05l.98 1.47h.78l.97-1.47c.58-.86 1.63-1.28 2.65-1.05l1.45.34.61-.6-.34-1.46c-.23-1.01.18-2.07 1.05-2.64l1.47-.98v-.78l-1.47-.98c-.87-.57-1.28-1.63-1.05-2.64l.34-1.46-.61-.6-1.45.34c-1.02.23-2.07-.19-2.65-1.05l-.97-1.47h-.78zM12 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5c.82 0 1.5-.67 1.5-1.5s-.68-1.5-1.5-1.5zM8.5 12c0-1.93 1.56-3.5 3.5-3.5 1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5c-1.94 0-3.5-1.57-3.5-3.5z"></path>
                </g>
              </svg>
            </div> */}

            {/* <!-- 2svg --> */}
            <div
              className="flex size-[36px] cursor-pointer items-center hover:fill-red-500 justify-center rounded-full
               transition-all duration-300 hover:bg-[#0f14191a]"
              // onClick={() => signOut({ redirectTo: "/login" })}
              onClick={() => signOut()}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                data-testid="icon"
                className="size-[20px]  "
              >
                <g>
                  <path d="M4 4.5C4 3.12 5.12 2 6.5 2h11C18.88 2 20 3.12 20 4.5v15c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 22 4 20.88 4 19.5V16h2v3.5c0 .28.22.5.5.5h11c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-11c-.28 0-.5.22-.5.5V8H4V4.5zm6.95 3.04L15.42 12l-4.47 4.46-1.41-1.42L11.58 13H2v-2h9.58L9.54 8.96l1.41-1.42z"></path>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
