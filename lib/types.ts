export interface Flashcard {
  _id?: string
  id: string
  question: string
  answer: string
  category: string
  icon: string
  completed?: boolean
  createdAt?: Date
  updatedAt?: Date
  isCustom?: boolean
  userId?: string
}

export interface EvaluationResult {
  grade: number
  feedback: string
  tips: string[]
}

export interface FlashcardEvaluation {
  _id?: string
  flashcardId: string
  transcript: string
  evaluation: EvaluationResult
  createdAt: Date
  userId: string
}

export interface AnalyticsData {
  totalCards: number
  completedCards: number
  averageScore: number
  totalEvaluations: number
  categoryCounts: Record<string, number>
}

export interface User {
  _id?: string
  id: string
  email: string
  password: string
  name?: string
  createdAt: Date
}

export interface Session {
  userId: string
  email: string
  name?: string
}
