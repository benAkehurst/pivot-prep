import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Flashcard } from "@/lib/types"
import { ObjectId } from "mongodb"
import { getSession } from "@/lib/session"

// GET all flashcards
export async function GET() {
  try {
    const session = getSession()
    const client = await clientPromise
    const db = client.db()

    let query = {}

    // If user is logged in, get their flashcards and default cards
    if (session) {
      query = {
        $or: [
          { userId: session.userId },
          { userId: { $exists: false } }, // Default cards
          { userId: null },
        ],
      }
    }

    const flashcards = await db.collection("flashcards").find(query).toArray()

    return NextResponse.json(flashcards)
  } catch (error) {
    console.error("Error fetching flashcards:", error)
    return NextResponse.json({ error: "Failed to fetch flashcards" }, { status: 500 })
  }
}

// POST a new flashcard
export async function POST(request: Request) {
  try {
    const session = getSession()

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const data = await request.json()

    const flashcard: Flashcard = {
      ...data,
      id: data.id || new ObjectId().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: true,
      userId: session.userId,
    }

    const result = await db.collection("flashcards").insertOne(flashcard)

    return NextResponse.json({
      success: true,
      flashcard: { ...flashcard, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error creating flashcard:", error)
    return NextResponse.json({ error: "Failed to create flashcard" }, { status: 500 })
  }
}
