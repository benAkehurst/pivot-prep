"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2 } from "lucide-react"

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  isProcessing: boolean
  evaluationReady?: boolean
}

export default function AudioRecorder({
  onRecordingComplete,
  isProcessing,
  evaluationReady = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        onRecordingComplete(audioBlob)

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Could not access microphone. Please check your browser permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        {isRecording ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={stopRecording}
              className="flex items-center gap-2"
              disabled={isProcessing}
            >
              <Square className="h-4 w-4" />
              Stop Recording
            </Button>
            <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={startRecording}
            className="flex items-center gap-2"
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
            {isProcessing ? "Processing..." : evaluationReady ? "Record New Answer" : "Record Answer"}
          </Button>
        )}
      </div>
      {isRecording && <p className="text-xs text-red-500 animate-pulse">Recording in progress...</p>}
    </div>
  )
}
