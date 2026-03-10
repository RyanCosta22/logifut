import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    const isAuthPage = pathname === "/entrar" || pathname === "/registrar";
    const isPublicPath = pathname.startsWith("/api/auth") || pathname === "/";
    console.log("Middleware executado para:", pathname, "Token presente:", !!token);

    if (isAuthPage) {
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    if (isPublicPath) {
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL("/entrar", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/entrar",
    "/registrar",
  ],
};
