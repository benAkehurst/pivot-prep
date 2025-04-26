import flashcardData from "@/data/flashcards.json"
import type { EvaluationResult } from "./types"

export interface DemoFlashcard {
  id: string
  question: string
  answer: string
  category: string
  icon: string
  completed?: boolean
  difficultyScore?: number
  isCustom?: boolean
}

export interface DemoEvaluation {
  id: string
  flashcardId: string
  transcript: string
  evaluation: EvaluationResult
  createdAt: string
}

// Generate a random ID for new flashcards
export function generateDemoId(): string {
  return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8)
}

// Get flashcards from localStorage and default data
export async function fetchDemoFlashcards(): Promise<DemoFlashcard[]> {
  // Get default flashcards
  const defaultCards = flashcardData as DemoFlashcard[]

  // Get custom flashcards from localStorage
  const customCards = getDemoFlashcards()

  // Get completed status
  const completedStatus = getDemoCompletedStatus()

  // Apply completed status to all cards
  const allCards = [...defaultCards, ...customCards].map((card) => ({
    ...card,
    completed: completedStatus[card.id] || false,
  }))

  // Get evaluations to calculate difficulty scores
  const evaluations = getDemoEvaluations()

  // Calculate difficulty scores
  const scoreMap: Record<string, { total: number; count: number }> = {}

  evaluations.forEach((evaluation) => {
    const id = evaluation.flashcardId
    if (!scoreMap[id]) {
      scoreMap[id] = { total: 0, count: 0 }
    }
    scoreMap[id].total += evaluation.evaluation.grade
    scoreMap[id].count += 1
  })

  // Apply difficulty scores
  const cardsWithDifficulty = allCards.map((card) => {
    const scores = scoreMap[card.id]
    let difficultyScore = 5 // Default middle difficulty

    if (scores && scores.count > 0) {
      const avgScore = scores.total / scores.count
      difficultyScore = 10 - avgScore // Invert score (lower score = higher difficulty)
    }

    return {
      ...card,
      difficultyScore,
    }
  })

  return cardsWithDifficulty
}

// Get custom flashcards from localStorage
export function getDemoFlashcards(): DemoFlashcard[] {
  if (typeof window === "undefined") return []

  try {
    const cards = localStorage.getItem("demoFlashcards")
    return cards ? JSON.parse(cards) : []
  } catch (error) {
    console.error("Error reading flashcards from localStorage:", error)
    return []
  }
}

// Save a custom flashcard to localStorage
export async function addDemoFlashcard(card: Omit<DemoFlashcard, "id">): Promise<DemoFlashcard> {
  const newCard: DemoFlashcard = {
    ...card,
    id: generateDemoId(),
    isCustom: true,
  }

  const cards = getDemoFlashcards()
  cards.push(newCard)

  localStorage.setItem("demoFlashcards", JSON.stringify(cards))
  return newCard
}

// Get completed status from localStorage
export function getDemoCompletedStatus(): Record<string, boolean> {
  if (typeof window === "undefined") return {}

  try {
    const status = localStorage.getItem("demoCompletedFlashcards")
    return status ? JSON.parse(status) : {}
  } catch (error) {
    console.error("Error reading completed status from localStorage:", error)
    return {}
  }
}

// Toggle completed status for a flashcard
export async function toggleDemoCompleted(id: string): Promise<boolean> {
  const status = getDemoCompletedStatus()
  const newStatus = !status[id]

  status[id] = newStatus
  localStorage.setItem("demoCompletedFlashcards", JSON.stringify(status))

  return newStatus
}

// Get evaluations from localStorage
export function getDemoEvaluations(): DemoEvaluation[] {
  if (typeof window === "undefined") return []

  try {
    const evaluations = localStorage.getItem("demoEvaluations")
    return evaluations ? JSON.parse(evaluations) : []
  } catch (error) {
    console.error("Error reading evaluations from localStorage:", error)
    return []
  }
}

// Save an evaluation to localStorage
export async function saveDemoEvaluation(
  flashcardId: string,
  transcript: string,
  evaluation: EvaluationResult,
): Promise<boolean> {
  const evaluations = getDemoEvaluations()

  const newEvaluation: DemoEvaluation = {
    id: generateDemoId(),
    flashcardId,
    transcript,
    evaluation,
    createdAt: new Date().toISOString(),
  }

  evaluations.push(newEvaluation)
  localStorage.setItem("demoEvaluations", JSON.stringify(evaluations))

  return true
}

// Get analytics data
export async function fetchDemoAnalytics() {
  // Get all flashcards
  const flashcards = await fetchDemoFlashcards()

  // Get evaluations
  const evaluations = getDemoEvaluations()

  // Calculate analytics
  const totalCards = flashcards.length
  const completedCards = flashcards.filter((card) => card.completed).length
  const totalEvaluations = evaluations.length

  // Calculate average score
  let totalScore = 0
  evaluations.forEach((evaluation) => {
    totalScore += evaluation.evaluation.grade
  })
  const averageScore = totalEvaluations > 0 ? totalScore / totalEvaluations : 0

  // Calculate category counts
  const categoryCounts: Record<string, number> = {}
  flashcards.forEach((card) => {
    if (!categoryCounts[card.category]) {
      categoryCounts[card.category] = 0
    }
    categoryCounts[card.category]++
  })

  return {
    totalCards,
    completedCards,
    averageScore,
    totalEvaluations,
    categoryCounts,
  }
}
