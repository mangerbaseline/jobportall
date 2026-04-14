import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { CheckAuth } from "@/utility/checkAuth";
import {
  isProtectedRoute,
  PROTECTED_ROUTES,
} from "./lib/proxyFunction/protectedroute";

//suppose user doesnt havetoken
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  //console.log("proxy running :  requested path is", pathname)
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  //console.log("token exists ? ", token)
  let user: { id: string; name: string; role: string } | null = null;
  //token check
  if (token) {
    try {
      //console.log("token if running")
      const decoded = (await CheckAuth(token)) as jwt.JwtPayload;
      //console.log("decoded is  : ", decoded.id)
      if (decoded && decoded.id) {
        //console.log("token yes")
        user = {
          id: decoded.id,
          name: decoded.name,
          role: decoded.role,
        };
        //console.log("User set : ", user)
      }
    } catch (error) {
      user = null;
      //console.log("no user found !")
    }
  }
  const protectedRoute = isProtectedRoute(pathname);
  if (protectedRoute && !user) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  const isPublicPage =
    pathname.startsWith("/auth/signin") || pathname.startsWith("/auth/signup");
  //public page check
  if (user && isPublicPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
