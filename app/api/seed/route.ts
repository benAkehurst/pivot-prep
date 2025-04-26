import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import flashcardData from "@/data/flashcards.json"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    // Check if flashcards collection already has data
    const count = await db.collection("flashcards").countDocuments()

    if (count > 0) {
      return NextResponse.json({ message: "Database already seeded" })
    }

    // Add createdAt and updatedAt to each flashcard
    const flashcardsWithTimestamps = flashcardData.map((card) => ({
      ...card,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: false,
    }))

    // Insert all flashcards
    await db.collection("flashcards").insertMany(flashcardsWithTimestamps)

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      count: flashcardsWithTimestamps.length,
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}
