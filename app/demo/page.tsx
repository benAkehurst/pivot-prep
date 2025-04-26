import DemoFlashcardCarousel from "@/components/demo-flashcard-carousel"
import DemoHeader from "@/components/demo-header"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PivotPrep Demo",
  description: "Try out PivotPrep with this interactive demo",
}

export default function DemoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-4xl">
        <DemoHeader />
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-md p-4 mb-8">
          <p className="text-yellow-800 dark:text-yellow-200 text-center text-sm">
            This is a demo version. Your data will be stored locally in your browser and will not persist across
            devices.
          </p>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          Prepare for interviews and tests with interactive flashcards
        </p>
        <DemoFlashcardCarousel />
      </div>
    </main>
  )
}
