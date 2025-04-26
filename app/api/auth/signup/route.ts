import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { cookies } from "next/headers"
import crypto from "crypto"

// Simple password hashing function
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db()
    const { email, password, name } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Create new user
    const userId = crypto.randomUUID()
    const hashedPassword = hashPassword(password)

    const user = {
      id: userId,
      email,
      password: hashedPassword,
      name: name || email.split("@")[0],
      createdAt: new Date(),
    }

    await db.collection("users").insertOne(user)

    // Create session
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
    }

    // Set session cookie
    cookies().set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
