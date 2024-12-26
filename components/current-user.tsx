"use client";

import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CurrentUser() {
  const user = useQuery(api.user.getUser);
  const { signIn, signOut } = useAuthActions();
  const router = useRouter();

  console.log("cccccc", { user });

  return (
    <div>
      <Link href="/auth" className=" cursor-pointer hover:text-blue-200">
        auth
      </Link>
      <div
        onClick={() =>
          void signOut().then(() => {
            router.push("/auth");
          })
        }
        className=" cursor-pointer "
      >
        SignOut
      </div>
    </div>
  );
}
