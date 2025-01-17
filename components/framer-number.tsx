import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export function NumberCount({
  num,
  classname,
  condition,
}: {
  num: number;
  classname: string;
  condition: boolean;
}) {
  return (
    <span className={cn(classname, condition && "hidden ")}>
      <span className="tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          {num
            .toString()
            .split("")
            .map((value) => (
              <motion.span
                key={value}
                initial={{ y: -15 }}
                animate={{ y: 0 }}
                exit={{ y: 15 }}
                transition={{ duration: 0.2, type: "tween" }}
                className="inline-block"
              >
                {value}
              </motion.span>
            ))}
        </AnimatePresence>
      </span>
    </span>
  );
}
