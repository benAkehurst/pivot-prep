import type { EvaluationResult, Flashcard } from "./types"

// Generate a random ID for new flashcards
export function generateId(): string {
  return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8)
}

// Fetch all flashcards from the API
export async function fetchFlashcards(): Promise<Flashcard[]> {
  try {
    const response = await fetch("/api/flashcards")
    if (!response.ok) {
      throw new Error("Failed to fetch flashcards")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching flashcards:", error)
    return []
  }
}

// Fetch flashcards with evaluations for spaced repetition
export async function fetchFlashcardsWithEvaluations(): Promise<Flashcard[]> {
  try {
    const [flashcards, evaluations] = await Promise.all([
      fetch("/api/flashcards").then((res) => res.json()),
      fetch("/api/evaluations").then((res) => res.json()),
    ])

    // Create a map of flashcard IDs to their average evaluation score
    const scoreMap: Record<string, { total: number; count: number }> = {}

    evaluations.forEach((evaluation: any) => {
      const id = evaluation.flashcardId
      if (!scoreMap[id]) {
        scoreMap[id] = { total: 0, count: 0 }
      }
      scoreMap[id].total += evaluation.evaluation.grade
      scoreMap[id].count += 1
    })

    // Calculate difficulty score for each flashcard (10 - average score)
    // Higher difficulty score = more likely to be shown
    const flashcardsWithDifficulty = flashcards.map((card: Flashcard) => {
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

    return flashcardsWithDifficulty
  } catch (error) {
    console.error("Error fetching flashcards with evaluations:", error)
    return []
  }
}

// Add a new flashcard
export async function addFlashcard(card: Omit<Flashcard, "id">): Promise<Flashcard | null> {
  try {
    const newCard = {
      ...card,
      id: generateId(),
    }

    const response = await fetch("/api/flashcards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCard),
    })

    if (!response.ok) {
      throw new Error("Failed to add flashcard")
    }

    const data = await response.json()
    return data.flashcard
  } catch (error) {
    console.error("Error adding flashcard:", error)
    return null
  }
}

// Toggle completed status
export async function toggleCompleted(id: string): Promise<boolean> {
  try {
    // First, get the current flashcard to check its completed status
    const getResponse = await fetch(`/api/flashcards/${id}`)
    if (!getResponse.ok) {
      throw new Error("Failed to fetch flashcard")
    }

    const flashcard = await getResponse.json()
    const newStatus = !flashcard.completed

    // Update the flashcard with the new completed status
    const updateResponse = await fetch(`/api/flashcards/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: newStatus }),
    })

    if (!updateResponse.ok) {
      throw new Error("Failed to update flashcard")
    }

    return newStatus
  } catch (error) {
    console.error("Error toggling completed status:", error)
    return false
  }
}

// Save evaluation
export async function saveEvaluation(
  flashcardId: string,
  transcript: string,
  evaluation: EvaluationResult,
): Promise<boolean> {
  try {
    const response = await fetch("/api/evaluations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flashcardId,
        transcript,
        evaluation,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to save evaluation")
    }

    return true
  } catch (error) {
    console.error("Error saving evaluation:", error)
    return false
  }
}

// Fetch analytics data
export async function fetchAnalytics() {
  try {
    const response = await fetch("/api/analytics")
    if (!response.ok) {
      throw new Error("Failed to fetch analytics")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return null
  }
}

// Check authentication status
export async function checkAuth() {
  try {
    const response = await fetch("/api/auth/session")
    if (!response.ok) {
      throw new Error("Failed to check authentication")
    }
    return await response.json()
  } catch (error) {
    console.error("Error checking authentication:", error)
    return { authenticated: false }
  }
}

// Login user
export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    return await response.json()
  } catch (error) {
    console.error("Error logging in:", error)
    return { error: "Failed to log in" }
  }
}

// Signup user
export async function signupUser(email: string, password: string, name?: string) {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    })

    return await response.json()
  } catch (error) {
    console.error("Error signing up:", error)
    return { error: "Failed to sign up" }
  }
}

// Logout user
export async function logoutUser() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    })

    return await response.json()
  } catch (error) {
    console.error("Error logging out:", error)
    return { error: "Failed to log out" }
  }
}
