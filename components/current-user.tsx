"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CurrentUser() {
  const { signOut } = useAuthActions();
  const router = useRouter();

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
