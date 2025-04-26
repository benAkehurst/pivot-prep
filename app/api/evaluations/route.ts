import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { FlashcardEvaluation } from "@/lib/types"
import { getSession } from "@/lib/session"

// GET all evaluations
export async function GET() {
  try {
    const session = getSession()

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const evaluations = await db.collection("evaluations").find({ userId: session.userId }).toArray()

    return NextResponse.json(evaluations)
  } catch (error) {
    console.error("Error fetching evaluations:", error)
    return NextResponse.json({ error: "Failed to fetch evaluations" }, { status: 500 })
  }
}

// POST a new evaluation
export async function POST(request: Request) {
  try {
    const session = getSession()

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const data = await request.json()

    const evaluation: FlashcardEvaluation = {
      ...data,
      createdAt: new Date(),
      userId: session.userId,
    }

    const result = await db.collection("evaluations").insertOne(evaluation)

    return NextResponse.json({
      success: true,
      evaluation: { ...evaluation, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error saving evaluation:", error)
    return NextResponse.json({ error: "Failed to save evaluation" }, { status: 500 })
  }
}
