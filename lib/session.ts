import { cookies } from "next/headers"
import type { Session } from "./types"

export function getSession(): Session | null {
  const sessionCookie = cookies().get("session")

  if (!sessionCookie) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value) as Session
  } catch (e) {
    return null
  }
}
