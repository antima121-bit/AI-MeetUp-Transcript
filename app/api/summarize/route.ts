import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: NextRequest) {
  try {
    const { transcript, prompt } = await request.json()

    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 })
    }

    const systemPrompt =
      prompt ||
      "Please summarize this meeting transcript, highlighting key decisions, action items, and important discussion points."

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Please summarize the following meeting transcript:\n\n${transcript}`,
        },
      ],
      maxTokens: 1000,
    })

    return NextResponse.json({ summary: text })
  } catch (error) {
    console.error("Error generating summary:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
