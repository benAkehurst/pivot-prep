import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")
  const isAuthenticated = !!session?.value

  // Paths that require authentication
  const authRequiredPaths = ["/add-question", "/analytics"]

  // Check if the current path requires authentication
  const requiresAuth = authRequiredPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // If the path requires auth and the user is not authenticated, redirect to login
  if (requiresAuth && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If the user is authenticated and trying to access login/signup, redirect to home
  if (
    isAuthenticated &&
    (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup"))
  ) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/add-question/:path*", "/analytics/:path*", "/login", "/signup"],
}
