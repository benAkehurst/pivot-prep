"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Logo from "@/components/logo"
import { addFlashcard, fetchFlashcards } from "@/lib/flashcard-utils"
import Link from "next/link"

export default function AddQuestionPage() {
  const router = useRouter()
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [category, setCategory] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [icon, setIcon] = useState("code")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  // Fetch existing categories
  useEffect(() => {
    const loadCategories = async () => {
      const flashcards = await fetchFlashcards()
      const uniqueCategories = Array.from(new Set(flashcards.map((card) => card.category)))
      setCategories(uniqueCategories)
    }

    loadCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const finalCategory = category === "new" ? newCategory : category

      if (!question || !answer || !finalCategory) {
        alert("Please fill in all required fields")
        setIsSubmitting(false)
        return
      }

      const newCard = await addFlashcard({
        question,
        answer,
        category: finalCategory,
        icon: icon || "code",
      })

      if (!newCard) {
        throw new Error("Failed to add flashcard")
      }

      // Redirect back to main page
      router.push("/")
    } catch (error) {
      console.error("Error saving flashcard:", error)
      alert("An error occurred while saving the flashcard. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Flashcards
          </Link>
          <Logo size="md" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">Add New Flashcard</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question here"
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter the answer here"
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">Add new category</SelectItem>
                  </SelectContent>
                </Select>

                {category === "new" && (
                  <div className="mt-2">
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category name"
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                    <SelectItem value="component">Component</SelectItem>
                    <SelectItem value="briefcase">Briefcase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              Save Flashcard
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
