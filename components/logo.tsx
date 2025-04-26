import { RotateCw } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
}

export default function Logo({ size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  }

  return (
    <div className={`font-bold flex items-center ${sizeClasses[size]}`}>
      <span className="text-gray-900 dark:text-white">Pivot</span>
      <RotateCw className={`mx-0.5 ${size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6"}`} />
      <span className="text-gray-900 dark:text-white">Prep</span>
    </div>
  )
}
