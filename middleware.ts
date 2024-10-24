// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("\n=== 미들웨어 실행 ===");
    console.log("📍 요청 경로:", req.nextUrl.pathname);
    console.log("🔑 토큰 존재:", !!req.nextauth.token);
    console.log("👤 사용자 역할:", req.nextauth.token?.role);
    console.log("=====================\n");
    const token = req.nextauth.token;

    if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*"],
};
