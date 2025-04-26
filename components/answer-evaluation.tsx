"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface EvaluationResult {
  grade: number
  feedback: string
  tips: string[]
}

interface AnswerEvaluationProps {
  transcript: string
  evaluation: EvaluationResult | null
  isLoading: boolean
}

export default function AnswerEvaluation({ transcript, evaluation, isLoading }: AnswerEvaluationProps) {
  const [showTranscript, setShowTranscript] = useState(false)

  if (!transcript && !evaluation && !isLoading) {
    return null
  }

  return (
    <div className="w-full mt-6 space-y-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Your Answer</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowTranscript(!showTranscript)} className="h-8 px-2">
            {showTranscript ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {showTranscript && (
          <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">{transcript}</p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
            <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
            <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
          </div>
        </div>
      )}

      {evaluation && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Evaluation</h3>
            <div className="ml-auto flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Grade:</span>
              <span
                className={`ml-1 font-bold text-lg ${
                  evaluation.grade >= 8
                    ? "text-green-600 dark:text-green-500"
                    : evaluation.grade >= 5
                      ? "text-yellow-600 dark:text-yellow-500"
                      : "text-red-600 dark:text-red-500"
                }`}
              >
                {evaluation.grade}/10
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{evaluation.feedback}</p>

            {evaluation.tips.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Tips for improvement:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {evaluation.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
