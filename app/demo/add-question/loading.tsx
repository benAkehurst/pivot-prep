import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  )
}
