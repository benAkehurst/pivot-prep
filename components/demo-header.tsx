"use client"

import Link from "next/link"
import { BarChart3, Plus, LogIn, UserPlus } from "lucide-react"
import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"

export default function DemoHeader() {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <Logo size="lg" />
        <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-medium">DEMO</span>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/demo/add-question">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Add Question</span>
            <span className="md:hidden">Add</span>
          </Button>
        </Link>

        <Link href="/demo/analytics">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden md:inline">Analytics</span>
          </Button>
        </Link>

        <div className="border-l border-gray-300 dark:border-gray-700 h-6 mx-1"></div>

        <Link href="/login">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <LogIn className="h-4 w-4" />
            <span className="hidden md:inline">Login</span>
          </Button>
        </Link>

        <Link href="/signup">
          <Button variant="default" size="sm" className="flex items-center gap-1.5 hidden sm:flex">
            <UserPlus className="h-4 w-4" />
            <span>Sign Up</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
