import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Clear session cookie
    cookies().delete("session")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging out:", error)
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 })
  }
}
