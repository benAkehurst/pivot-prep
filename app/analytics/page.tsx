"use client"

import { useState, useEffect } from "react"
import { fetchAnalytics } from "@/lib/flashcard-utils"
import type { AnalyticsData } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BarChart3, CheckCircle, CircleX, Star } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/logo"

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true)
      try {
        const data = await fetchAnalytics()
        setAnalytics(data)
      } catch (error) {
        console.error("Error loading analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-4xl">
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your progress and performance with PivotPrep</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analytics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Total Flashcards
                  </CardTitle>
                  <CardDescription>Number of flashcards in your collection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{analytics.totalCards}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Completed Cards
                  </CardTitle>
                  <CardDescription>Cards you've marked as known</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <p className="text-4xl font-bold">{analytics.completedCards}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {analytics.totalCards > 0
                        ? `${Math.round((analytics.completedCards / analytics.totalCards) * 100)}% of total`
                        : "0% of total"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Average Score
                  </CardTitle>
                  <CardDescription>Your average evaluation score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <p className="text-4xl font-bold">
                      {analytics.averageScore ? analytics.averageScore.toFixed(1) : "N/A"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{analytics.totalEvaluations} evaluations</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <CircleX className="h-5 w-5 text-red-500" />
                    Remaining Cards
                  </CardTitle>
                  <CardDescription>Cards you still need to learn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <p className="text-4xl font-bold">{analytics.totalCards - analytics.completedCards}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {analytics.totalCards > 0
                        ? `${Math.round(
                            ((analytics.totalCards - analytics.completedCards) / analytics.totalCards) * 100,
                          )}% of total`
                        : "0% of total"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Number of flashcards by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.categoryCounts).map(([category, count]) => (
                    <div key={category} className="flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{category}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{count} cards</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${(count / analytics.totalCards) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500 dark:text-gray-400">Failed to load analytics data</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
