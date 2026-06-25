// import {
//   clerkMiddleware,
//   createRouteMatcher,
// } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/sign-in(.*)",
//   "/sign-up(.*)",
//   "/api/webhooks/clerk",
// ]);

// export default clerkMiddleware();
// export default clerkMiddleware((auth, req) => {
//   if (!isPublicRoute(req)) {
//     //  if route is not a public route, it will be protected (auth will be needed)
//     auth().protect();
//   }
// });

export function middleware(request) {
  // Add any custom middleware logic here if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
