import FlashcardCarousel from "@/components/flashcard-carousel"
import Header from "@/components/header"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlayCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "PivotPrep",
  description: "Prepare for interviews and tests with interactive flashcards and AI feedback",
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-4xl">
        <Header />
        <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
          Prepare for interviews and tests with interactive flashcards
        </p>

        <div className="flex justify-center mb-8">
          <Link href="/demo">
            <Button variant="outline" className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Try the Demo
            </Button>
          </Link>
        </div>

        <FlashcardCarousel />
      </div>
    </main>
  )
}
