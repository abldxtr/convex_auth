"use client";

import React from "react";
import {
  SvgIcon1,
  SvgIcon2,
  SvgIcon3,
  SvgIcon4,
  SvgIcon5,
  SvgIcon6,
  SvgIcon7,
  SvgIcon8,
  SvgIcon9,
  SvgIcon10,
} from "./SvgIcon";
// import { useSocket } from "@/provider/socket-provider";
import { cn } from "@/lib/utils";

export default function Header() {
  // const { isConnected } = useSocket();
  const icons = [
    SvgIcon2,
    SvgIcon3,
    SvgIcon4,
    SvgIcon5,
    SvgIcon6,
    SvgIcon7,
    SvgIcon8,
    SvgIcon9,
    // <SvgIcon10 />,
  ];
  return (
    <header className=" flex-col items-end justify-between px-[4px] hidden sm:flex ">
      <div className="flex w-[88px] grow flex-col items-end lg:w-[68px]">
        {/* <!-- 1 svg --> */}
        <div className="flex size-[52px] cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:bg-[#0f14191a]">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[24px]">
            <g>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </g>
          </svg>
        </div>
        {/* <!-- 2 and nav section --> */}
        <div className="mb-[4px] mt-[2px] flex w-full items-center">
          <nav className="flex w-full flex-col items-end">
            {icons.map((Item, index) => {
              return (
                <div
                  key={index}
                  className="flex size-[52px] cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:bg-[#0f14191a]"
                >
                  {<Item />}
                </div>
              );
            })}
          </nav>
        </div>

        {/* <!-- twite icone --> */}
        <div className="flex size-[52px] cursor-pointer items-center justify-center rounded-full bg-[#1d9bf0] fill-white transition-all duration-300 hover:bg-[#1a8cd8]">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[24px]">
            <g>
              <path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79 10.147 23.17 6.359 23 3zm-7 8h-1.5v2H16c.63-.016 1.2-.08 1.72-.188C16.95 15.24 14.68 17 12 17H8.55c.57-2.512 1.57-4.851 3-6.78 2.16-2.912 5.29-4.911 9.45-5.187C20.95 8.079 19.9 11 16 11zM4 9V6H1V4h3V1h2v3h3v2H6v3H4z"></path>
            </g>
          </svg>
        </div>
      </div>

      {/* <!-- profile pic --> */}

      <div className="my-[12px] flex flex-col items-center">
        <div className="flex relative size-[52px] cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:bg-[#0f14191a]">
          <img
            alt="abol.dexter"
            draggable="true"
            src="https://pbs.twimg.com/profile_images/1564361710554734593/jgWXrher_normal.jpg"
            className="size-[24px] rounded-full"
          />
          <div
            className={cn(
              " size-2 rounded-full absolute top-[12px] right-3   "
              // isConnected ? "bg-green-400" : "bg-red-400"
            )}
          />
        </div>
      </div>
    </header>
  );
}
