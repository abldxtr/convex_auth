// import { NextRequest, NextResponse } from "next/server";
// import { parseHTML } from "linkedom";
// import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
// import { fetchQuery } from "convex/nextjs";
// import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";

// export const dynamic = "force-static";

// function getHostname() {
//   if (process.env.NODE_ENV === "development") {
//     return "localhost:3000";
//   }
//   if (process.env.VERCEL_ENV === "production") {
//     return process.env.VERCEL_PROJECT_PRODUCTION_URL;
//   }
//   return process.env.VERCEL_BRANCH_URL;
// }

// export async function GET(
//   _: NextRequest,
//   { params }: { params: { rest: string[] } }
// ) {
//   const schema = process.env.NODE_ENV === "development" ? "http" : "https";
//   const host = getHostname();
//   // const host = "fksxn3-3000.csb.app";

//   console.log("host", host);
//   if (!host) {
//     return new Response("Failed to get hostname from env", { status: 500 });
//   }
//   // const href = (await params).rest.join("/");
//   const href = params.rest.join("/");

//   console.log("href", href);

//   if (!href) {
//     return new Response("Missing url parameter", { status: 400 });
//   }

//   const url = `${schema}://${host}/${href}`;
//   console.log("url", url);

//   // for disable prefetch

//   // if (url) {
//   //   return;
//   // }
//   const token = await convexAuthNextjsToken();
//   const response = await fetchQuery(api.chat.getChat, {
//     id: href as Id<"chats">,
//   });
//   // const chat = useQuery(api.chat.getChat, { id: props.param as Id<"chats"> });

//   // const response = await fetch(url);
//   if (!response) {
//     return new Response("Failed to fetch");
//   }
//   const body = await response.text();
//   const { document } = parseHTML(body);
//   const images = Array.from(document.querySelectorAll("main img"))
//     .map((img) => ({
//       srcset: img.getAttribute("srcset") || img.getAttribute("srcSet"), // Linkedom is case-sensitive
//       sizes: img.getAttribute("sizes"),
//       src: img.getAttribute("src"),
//       alt: img.getAttribute("alt"),
//       loading: img.getAttribute("loading"),
//     }))
//     .filter((img) => img.src);
//   return NextResponse.json(
//     { images },
//     {
//       headers: {
//         "Cache-Control": "public, max-age=3600",
//       },
//     }
//   );
// }
