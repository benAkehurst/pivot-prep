import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { transcript, correctAnswer } = await request.json()

    if (!transcript || !correctAnswer) {
      return NextResponse.json({ error: "Transcript and correct answer are required" }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert evaluator for interview and test answers. " +
            "Compare the user's answer (transcript) with the correct answer. " +
            "Grade the answer on a scale of 1-10. " +
            "Provide constructive feedback and tips for improvement. " +
            "Format your response as JSON with the following structure: " +
            '{ "grade": number, "feedback": string, "tips": string[] }',
        },
        {
          role: "user",
          content: `User's answer: ${transcript}\n\nCorrect answer: ${correctAnswer}`,
        },
      ],
      response_format: { type: "json_object" },
    })

    const result = JSON.parse(completion.choices[0].message.content)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error evaluating answer:", error)
    return NextResponse.json({ error: "Failed to evaluate answer" }, { status: 500 })
  }
}
