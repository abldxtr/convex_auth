export default function MessageRequest() {
  return (
    <div className="flex  ">
      <div className=" flex-1 ">
        {/* <!-- search bar --> */}
        <div className="min-h-[40px] p-[12px]">
          <div className="flex h-full min-h-[40px] items-center justify-between rounded-full border border-[#cfd9de]">
            {/* <!-- icone --> */}
            <div className="flex h-full items-center justify-center pl-[12px]">
              <svg viewBox="0 0 24 24" className="size-[16px] fill-[#536471]">
                <g>
                  <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path>
                </g>
              </svg>
            </div>

            {/* <!-- input --> */}
            <div className="flex h-full flex-1">
              <input
                type="text"
                className="h-full bg-transparent pb-[1px] pl-[4px] pr-[16px] text-[14px] outline-0 w-full "
                placeholder="Search Direct Message"
              />
            </div>
          </div>
        </div>
        {/* jjjj */}
        {/* <!-- message request --> */}
        <div className="min-h-[40px] w-full flex-1 cursor-pointer p-[12px] transition-all hover:bg-[#f7f9f9]">
          <div className="flex h-full min-h-[40px] items-center justify-between">
            {/* <!-- icone --> */}
            <div className="mr-[16px] flex size-[48px] cursor-pointer items-center justify-center rounded-full border border-[#e5eaec] bg-[#ffffff] transition-all duration-300">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-[24px]"
              >
                <g>
                  <path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5V13h-2v-2.537l-8 3.635-8-3.635V18.5c0 .276.224.5.5.5H11v2H4.498c-1.381 0-2.5-1.119-2.5-2.5v-13zm2 2.766l8 3.635 8-3.635V5.5c0-.276-.224-.5-.5-.5h-15c-.276 0-.5.224-.5.5v2.766zM19.429 16l-2 2H23v2h-5.571l2 2-1.414 1.414L13.601 19l4.414-4.414L19.429 16z"></path>
                </g>
              </svg>
            </div>

            {/* <!-- text --> */}
            <div className="flex h-full flex-1 flex-col">
              <div className="text-[15px] font-semibold leading-[20px] text-[#0f1419]">
                <span>Message requests</span>
              </div>
              <div className="text-[13px] font-normal leading-[20px] text-[#536471]">
                <span>1 new request</span>
              </div>
            </div>
            {/* <!-- online sign --> */}
            <div className="size-[10px] rounded-full bg-[#1d9bf0]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
