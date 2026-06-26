import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { isProtectedPath } from "@/lib/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  if (isProtectedPath(pathname) && !isLoggedIn) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return Response.redirect(login);
  }
});

export const config = {
  matcher: [
    "/inicio",
    "/modules/:path*",
    "/activities/:path*",
    "/simulations/:path*",
    "/chat/:path*",
    "/documents/:path*",
    "/reports/:path*",
    "/team/:path*",
    "/accessibility/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
    "/dashboard/:path*",
  ],
};
