import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";
import { forwardRef, useMemo } from "react";

export const InputWithRef = forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
  }
>(({ value, onChange, onSubmit }, ref) => {
  const { imgTemp } = useGlobalContext();
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
            placeholder="پیام خود را وارد کنید"
            className="bg-transparent focus:ring-0 w-full h-full ring-0 focus-within:outline-none focus:border-0 text-[#0F1419] text-[15px] placeholder-[#536471]"
          />
          <button
            type="submit"
            disabled={isButtonDisabled}
            className={cn(
              "shrink-0 size-[34px] hover:bg-[#1d9bf01a] flex items-center fill-[#1d9bf0] justify-center transition-all duration-300 rounded-full",
              "disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none"
            )}
          >
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
