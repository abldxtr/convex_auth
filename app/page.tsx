import CurrentUser from "@/components/current-user";
import {
  convexAuthNextjsToken,
  isAuthenticatedNextjs,
} from "@convex-dev/auth/nextjs/server";

export default async function Home() {
  const token = await convexAuthNextjsToken();
  const isAuth = await isAuthenticatedNextjs();
  // console.log({ token });
  console.log({ isAuth });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <CurrentUser />
    </main>
  );
}
