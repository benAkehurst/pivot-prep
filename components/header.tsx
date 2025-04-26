"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, Plus, LogOut, LogIn, UserPlus } from "lucide-react"
import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"
import { checkAuth, logoutUser } from "@/lib/flashcard-utils"

export default function Header() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true)
      try {
        const result = await checkAuth()
        setIsAuthenticated(result.authenticated)
        if (result.authenticated && result.user) {
          setUserName(result.user.name || result.user.email)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
      setIsAuthenticated(false)
      setUserName("")
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <div className="flex justify-between items-center mb-6">
      <Logo size="lg" />

      <div className="flex items-center gap-3">
        {isLoading ? (
          <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ) : isAuthenticated ? (
          <>
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:inline">Hello, {userName}</span>

            <Link href="/add-question">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Add Question</span>
                <span className="md:hidden">Add</span>
              </Button>
            </Link>

            <Link href="/analytics">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Analytics</span>
              </Button>
            </Link>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-1.5">
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>

            <Link href="/signup">
              <Button variant="default" size="sm" className="flex items-center gap-1.5">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
