import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { AnalyticsData } from "@/lib/types"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = getSession()

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Query for user's flashcards and default cards
    const flashcardQuery = {
      $or: [{ userId: session.userId }, { userId: { $exists: false } }, { userId: null }],
    }

    // Get total cards
    const totalCards = await db.collection("flashcards").countDocuments(flashcardQuery)

    // Get completed cards (only count user's completion status)
    const completedCards = await db.collection("flashcards").countDocuments({
      ...flashcardQuery,
      completed: true,
    })

    // Get evaluations and calculate average score
    const evaluations = await db.collection("evaluations").find({ userId: session.userId }).toArray()

    const totalEvaluations = evaluations.length

    let totalScore = 0
    evaluations.forEach((evaluation) => {
      totalScore += evaluation.evaluation.grade
    })

    const averageScore = totalEvaluations > 0 ? totalScore / totalEvaluations : 0

    // Get category counts
    const categories = await db
      .collection("flashcards")
      .aggregate([{ $match: flashcardQuery }, { $group: { _id: "$category", count: { $sum: 1 } } }])
      .toArray()

    const categoryCounts: Record<string, number> = {}
    categories.forEach((cat) => {
      categoryCounts[cat._id] = cat.count
    })

    const analyticsData: AnalyticsData = {
      totalCards,
      completedCards,
      averageScore,
      totalEvaluations,
      categoryCounts,
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
