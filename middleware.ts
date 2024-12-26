import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isPublicPage = createRouteMatcher(["/auth"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuth = await convexAuth.isAuthenticated();
  console.log({ isAuth });
  if (!isPublicPage(request) && !isAuth) {
    return nextjsMiddlewareRedirect(request, "/auth");
  }
  if (isPublicPage(request) && isAuth) {
    return nextjsMiddlewareRedirect(request, "/");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
