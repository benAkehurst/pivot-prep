import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getSession } from "@/lib/session"

// GET a single flashcard
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()

    const flashcard = await db.collection("flashcards").findOne({ id: params.id })

    if (!flashcard) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 })
    }

    return NextResponse.json(flashcard)
  } catch (error) {
    console.error("Error fetching flashcard:", error)
    return NextResponse.json({ error: "Failed to fetch flashcard" }, { status: 500 })
  }
}

// PATCH to update flashcard (e.g., completion status)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession()
    const client = await clientPromise
    const db = client.db()

    // Get the flashcard first to check ownership
    const flashcard = await db.collection("flashcards").findOne({ id: params.id })

    if (!flashcard) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 })
    }

    // If the flashcard has a userId and it doesn't match the current user, deny access
    // Default cards (without userId) can be updated by anyone
    if (flashcard.userId && session?.userId !== flashcard.userId) {
      return NextResponse.json({ error: "Not authorized to update this flashcard" }, { status: 403 })
    }

    const data = await request.json()

    const result = await db.collection("flashcards").updateOne(
      { id: params.id },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 })
    }

    const updatedFlashcard = await db.collection("flashcards").findOne({ id: params.id })

    return NextResponse.json(updatedFlashcard)
  } catch (error) {
    console.error("Error updating flashcard:", error)
    return NextResponse.json({ error: "Failed to update flashcard" }, { status: 500 })
  }
}

// DELETE a flashcard
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession()

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get the flashcard first to check ownership
    const flashcard = await db.collection("flashcards").findOne({ id: params.id })

    if (!flashcard) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 })
    }

    // Only allow deletion of user's own custom flashcards
    if (!flashcard.userId || flashcard.userId !== session.userId) {
      return NextResponse.json({ error: "Not authorized to delete this flashcard" }, { status: 403 })
    }

    const result = await db.collection("flashcards").deleteOne({ id: params.id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting flashcard:", error)
    return NextResponse.json({ error: "Failed to delete flashcard" }, { status: 500 })
  }
}
