import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const protectedRoutes = [
  "/dashboard",
  "/specialties",
  "/classes",
  "/calendar",
  "/announcements",
  "/bible",
  "/leader",
  "/parent"
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!req.auth && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/leader") && req.auth?.user?.role !== "LEADER") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/parent") && req.auth?.user?.role !== "PARENT") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/login") && req.auth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/specialties/:path*", "/classes/:path*", "/calendar/:path*", "/announcements/:path*", "/bible/:path*", "/leader/:path*", "/parent/:path*", "/login"]
};
