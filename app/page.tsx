import CurrentUser from "@/components/current-user";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

export default async function Home() {
  const token = await convexAuthNextjsToken();
  // console.log({ token });
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <CurrentUser />
    </main>
  );
}
