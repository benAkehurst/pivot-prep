"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RotateCw, Code, Server, Briefcase, Component, Check } from "lucide-react"
import AudioRecorder from "./audio-recorder"
import AnswerEvaluation from "./answer-evaluation"
import { toggleCompleted, saveEvaluation } from "@/lib/flashcard-utils"
import type { EvaluationResult } from "@/lib/types"

interface FlashcardProps {
  id: string
  question: string
  answer: string
  category: string
  icon: string
  completed?: boolean
  onToggleCompleted: (id: string, completed: boolean) => void
}

// Map of icon names to Lucide components
const iconMap: Record<string, React.ReactNode> = {
  code: <Code className="h-5 w-5" />,
  server: <Server className="h-5 w-5" />,
  briefcase: <Briefcase className="h-5 w-5" />,
  component: <Component className="h-5 w-5" />,
}

export default function Flashcard({
  id,
  question: questionProp,
  answer,
  category,
  icon,
  completed = false,
  onToggleCompleted,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const question = questionProp.replace(/\\n/g, "\n")

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleToggleCompleted = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const newStatus = await toggleCompleted(id)
      onToggleCompleted(id, newStatus)
    } catch (error) {
      console.error("Error toggling completed status:", error)
    }
  }

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true)
      setTranscript("")
      setEvaluation(null)

      // Step 1: Send audio to transcription API
      const formData = new FormData()
      formData.append("audio", audioBlob)

      const transcriptionResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!transcriptionResponse.ok) {
        throw new Error("Failed to transcribe audio")
      }

      const transcriptionData = await transcriptionResponse.json()
      setTranscript(transcriptionData.text)

      // Step 2: Send transcript and correct answer to evaluation API
      const evaluationResponse = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcriptionData.text,
          correctAnswer: answer,
        }),
      })

      if (!evaluationResponse.ok) {
        throw new Error("Failed to evaluate answer")
      }

      const evaluationData = await evaluationResponse.json()
      setEvaluation(evaluationData)

      // Step 3: Save evaluation to database
      await saveEvaluation(id, transcriptionData.text, evaluationData)
    } catch (error) {
      console.error("Error processing recording:", error)
      alert("An error occurred while processing your recording. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="relative w-full h-full perspective">
      <div className={`w-full h-full card-flip-container ${isFlipped ? "flipped" : ""}`} onClick={handleFlip}>
        {/* Front of card */}
        <div className="card-side card-front bg-white dark:bg-gray-800">
          <div className="p-6 md:p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium">
                {iconMap[icon]}
                {category}
              </div>

              <button
                onClick={handleToggleCompleted}
                className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  completed
                    ? "bg-green-500 border-green-600 text-white"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                }`}
                aria-label={completed ? "Mark as not known" : "Mark as known"}
              >
                {completed && <Check className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <h2 className="text-xl md:text-2xl font-medium text-center">{question}</h2>
            </div>

            <div className="mt-4 flex flex-col items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleFlip()
                }}
                className="text-xs flex items-center gap-1"
              >
                <RotateCw className="h-3 w-3" />
                Reveal Answer
              </Button>

              <div onClick={(e) => e.stopPropagation()} className="mt-2">
                {evaluation && (
                  <div className="mb-3 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium animate-subtle-bounce">
                      <Check className="h-4 w-4" />
                      Evaluation ready! Flip card to see results
                    </div>
                  </div>
                )}
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  isProcessing={isProcessing}
                  evaluationReady={!!evaluation}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="card-side card-back bg-white dark:bg-gray-800">
          <div className="p-6 md:p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium">
                {iconMap[icon]}
                {category}
              </div>

              <button
                onClick={handleToggleCompleted}
                className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  completed
                    ? "bg-green-500 border-green-600 text-white"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                }`}
                aria-label={completed ? "Mark as not known" : "Mark as known"}
              >
                {completed && <Check className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2">Correct Answer:</h3>
              <p className="text-lg md:text-xl">{answer}</p>

              <div onClick={(e) => e.stopPropagation()}>
                <AnswerEvaluation transcript={transcript} evaluation={evaluation} isLoading={isProcessing} />
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleFlip()
                }}
                className="text-xs flex items-center gap-1"
              >
                <RotateCw className="h-3 w-3" />
                Show Question
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
