'use server'
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import admin from "@/server/firebaseAdmin"; // we'll define this below

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Protect only certain paths
  if (!url.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Get the Firebase token from cookies (or Authorization header)
  const token = req.cookies.get("token")?.value ||
                req.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Optional: restrict only certain emails or claims
    // if (!decodedToken.admin && decodedToken.email !== "you@example.com") {
    //   url.pathname = "/unauthorized";
    //   return NextResponse.redirect(url);
    // }

    // ✅ Continue request
    return NextResponse.next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
  runtime: "nodejs", // 👈 forces Node runtime (not edge)
};
