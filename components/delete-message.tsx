import { useDeleteItem } from "@/context/delete-items-context";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { NumberCount } from "./framer-number";

export default function DeleteMessage() {
  const { deleteItems, setDeleteItems, items, setItems, DisableDeleteItmes } =
    useDeleteItem();
  const deleteMessages = useMutation(api.message.deleteMessageById);

  return (
    <div className=" absolute inset-0 bg-zinc-200 z-[10] flex items-center justify-center ">
      {/* <div>{items?.length}</div> */}
      <NumberCount
        num={items?.length || 0}
        condition={false}
        classname="size-[50px] p-1 rounded-full flex items-center justify-center cursor-normal text-md font-semibold "
      />
      <div
        className=" size-[50px] p-1 rounded-full hover:bg-red-200 transition-all flex items-center justify-center cursor-pointer   "
        onClick={async () => {
          if (items === null) {
            return;
          }
          const res = await deleteMessages({ messageIds: items });
          if (res?.success) {
            setDeleteItems(false);
            toast.success("succesfull to delete messages");
          } else {
            toast.error("error to delete messages!");
          }
        }}
      >
        <Trash2 className="size-[18px] shrink-0" color="red" />
      </div>

      <div
        className=" size-[50px] p-1 rounded-full hover:bg-[#1d9bf01a] transition-all flex items-center justify-center cursor-pointer   "
        onClick={() => {
          setDeleteItems(false);
          setItems(null);
        }}
      >
        <X className="size-[18px] shrink-0" color="black" />
      </div>
    </div>
  );
}
