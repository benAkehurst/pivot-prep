"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import DemoFlashcard from "@/components/demo-flashcard"
import { ChevronLeft, ChevronRight, Code, Server, Briefcase, Component, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchDemoFlashcards, type DemoFlashcard as FlashcardType } from "@/lib/demo-utils"
import Link from "next/link"

// Map of icon names to Lucide components
const iconMap: Record<string, React.ReactNode> = {
  code: <Code className="h-5 w-5" />,
  server: <Server className="h-5 w-5" />,
  briefcase: <Briefcase className="h-5 w-5" />,
  component: <Component className="h-5 w-5" />,
}

export default function DemoFlashcardCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cards, setCards] = useState<FlashcardType[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [filteredCards, setFilteredCards] = useState<FlashcardType[]>([])
  const [showCompleted, setShowCompleted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Load cards on initial load
  useEffect(() => {
    const loadFlashcards = async () => {
      setIsLoading(true)
      try {
        // Fetch all flashcards with evaluations for spaced repetition
        const allCards = await fetchDemoFlashcards()

        // Sort cards by difficulty score (higher difficulty first)
        // For cards without evaluations, add some randomness
        const sortedCards = [...allCards].sort((a, b) => {
          // If both cards have difficulty scores, sort by difficulty
          if (a.difficultyScore && b.difficultyScore) {
            return b.difficultyScore - a.difficultyScore
          }

          // If only one card has a difficulty score, prioritize it
          if (a.difficultyScore) return -1
          if (b.difficultyScore) return 1

          // For cards without scores, randomize
          return Math.random() - 0.5
        })

        setCards(sortedCards)
      } catch (error) {
        console.error("Error loading flashcards:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFlashcards()
  }, [])

  // Filter cards when category or showCompleted changes
  useEffect(() => {
    let filtered = cards

    if (!showCompleted) {
      filtered = filtered.filter((card) => !card.completed)
    }

    if (activeCategory) {
      filtered = filtered.filter((card) => card.category === activeCategory)
    }

    setFilteredCards(filtered)
    // Ensure currentIndex is valid
    setCurrentIndex((prev) => (filtered.length > 0 ? Math.min(prev, filtered.length - 1) : 0))
  }, [activeCategory, cards, showCompleted])

  const goToNext = useCallback(() => {
    if (filteredCards.length === 0) return
    setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredCards.length)
  }, [filteredCards.length])

  const goToPrevious = useCallback(() => {
    if (filteredCards.length === 0) return
    setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredCards.length) % filteredCards.length)
  }, [filteredCards.length])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        goToNext()
      } else if (e.key === "ArrowLeft") {
        goToPrevious()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [goToNext, goToPrevious])

  // Get unique categories
  const categories = Array.from(new Set(cards.map((card) => card.category)))

  // Handle marking a card as completed
  const handleToggleCompleted = (id: string, completed: boolean) => {
    const updatedCards = cards.map((card) => (card.id === id ? { ...card, completed } : card))
    setCards(updatedCards)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <h3 className="text-xl font-medium">Loading flashcards...</h3>
      </div>
    )
  }

  if (filteredCards.length === 0) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <h3 className="text-xl font-medium mb-4">No flashcards found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {cards.length > 0
            ? "Try changing your filters or adding new flashcards."
            : "Start by adding some flashcards."}
        </p>
        <Link href="/demo/add-question">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Flashcard
          </Button>
        </Link>
      </div>
    )
  }

  // Add this safety check before accessing currentCard
  if (currentIndex >= filteredCards.length || filteredCards.length === 0) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <h3 className="text-xl font-medium mb-4">Loading flashcards...</h3>
      </div>
    )
  }

  const currentCard = filteredCards[currentIndex]

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 justify-center items-center mb-4">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
            className="rounded-full"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className="rounded-full flex items-center gap-1"
            >
              {iconMap[cards.find((card) => card.category === category)?.icon || "code"]}
              {category}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
            className="rounded-full text-xs ml-2"
          >
            {showCompleted ? "Hide Completed" : "Show Completed"}
          </Button>
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        <div className="w-full max-w-2xl aspect-[3/2] mb-8">
          <DemoFlashcard
            key={currentCard.id}
            id={currentCard.id}
            question={currentCard.question}
            answer={currentCard.answer}
            category={currentCard.category}
            icon={currentCard.icon}
            completed={currentCard.completed}
            onToggleCompleted={handleToggleCompleted}
          />
        </div>

        <div className="flex items-center justify-between w-full max-w-md mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            className="rounded-full"
            aria-label="Previous card"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Card {currentIndex + 1} of {filteredCards.length}
          </div>

          <Button variant="outline" size="icon" onClick={goToNext} className="rounded-full" aria-label="Next card">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
