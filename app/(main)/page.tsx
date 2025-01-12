import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";

import Main from "@/components/main";
import { redirect } from "next/navigation";

export default async function Home() {
  // const isAuth = await isAuthenticatedNextjs();
  // console.log({ isAuth });

  // if (!isAuth) {
  //   redirect("/register");
  // }

  return (
    <>
      <div className="w-full isolate mx-auto flex h-dvh  overflow-hidden">
        <Main param="" />
      </div>
    </>
  );
}
