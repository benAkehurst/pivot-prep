import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert the File to a Blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type })

    // Create a File object that OpenAI can process
    const file = new File([audioBlob], "audio.webm", { type: audioFile.type })

    // Send to OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    })

    return NextResponse.json({ text: transcription.text })
  } catch (error) {
    console.error("Error transcribing audio:", error)
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 })
  }
}
