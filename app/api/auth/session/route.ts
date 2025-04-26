import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import type { Session } from "@/lib/types"

export async function GET() {
  try {
    const sessionCookie = cookies().get("session")

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false })
    }

    try {
      const session = JSON.parse(sessionCookie.value) as Session
      return NextResponse.json({
        authenticated: true,
        user: {
          id: session.userId,
          email: session.email,
          name: session.name,
        },
      })
    } catch (e) {
      cookies().delete("session")
      return NextResponse.json({ authenticated: false })
    }
  } catch (error) {
    console.error("Error checking session:", error)
    return NextResponse.json({ authenticated: false })
  }
}
