"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, Wand2, Mail, FileText, Sparkles } from "lucide-react"

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
      <div className="h-32 bg-muted rounded"></div>
    </div>
  )
}

export default function MeetingNotesSummarizer() {
  const [transcript, setTranscript] = useState("")
  const [customPrompt, setCustomPrompt] = useState(
    "Please summarize this meeting transcript, highlighting key decisions, action items, and important discussion points.",
  )
  const [summary, setSummary] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/plain") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setTranscript(content)
      }
      reader.readAsText(file)
    }
  }

  const generateSummary = async () => {
    if (!transcript.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          prompt: customPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate summary")
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (error) {
      console.error("Error generating summary:", error)
      alert("Failed to generate summary. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const sendEmail = async () => {
    if (!email.trim() || !summary.trim()) return

    setIsSending(true)
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          summary,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      alert("Summary sent successfully!")
      setEmail("")
    } catch (error) {
      console.error("Error sending email:", error)
      alert("Failed to send email. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-accent-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">AI Meeting Notes</h1>
              <p className="text-sm text-muted-foreground">Powered by AI</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold text-foreground leading-tight">
            Transform Meeting Transcripts into
            <span className="text-accent block">Actionable Summaries</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload your meeting transcript and let AI create professional summaries highlighting key decisions, action
            items, and important discussion points.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary">
                  <Upload className="h-4 w-4" />
                </div>
                Upload & Configure
              </CardTitle>
              <CardDescription className="text-base">
                Upload a text file or paste your meeting transcript below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="text-sm font-medium">
                  Upload Text File
                </Label>
                <div className="relative">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-foreground hover:file:bg-accent/90"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transcript" className="text-sm font-medium">
                  Meeting Transcript
                </Label>
                <Textarea
                  id="transcript"
                  placeholder="Paste your meeting transcript here..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-[180px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-prompt" className="text-sm font-medium">
                  Custom Instructions
                </Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="Enter custom instructions for the AI..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <Button
                onClick={generateSummary}
                disabled={!transcript.trim() || isGenerating}
                className="w-full h-12 text-base font-medium bg-accent hover:bg-accent/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate AI Summary
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary/10 text-secondary">
                  <FileText className="h-4 w-4" />
                </div>
                Generated Summary
              </CardTitle>
              <CardDescription className="text-base">
                {summary ? "Review and edit the summary before sharing" : "Your AI-generated summary will appear here"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Suspense fallback={<LoadingSkeleton />}>
                {summary ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="summary" className="text-sm font-medium">
                        Summary Content
                      </Label>
                      <Textarea
                        id="summary"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="min-h-[280px] resize-none"
                      />
                    </div>

                    <div className="space-y-4 pt-2 border-t border-border">
                      <Label className="text-sm font-medium">Share Summary</Label>
                      <div className="flex gap-3">
                        <Input
                          type="email"
                          placeholder="Enter email address..."
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={sendEmail}
                          disabled={!email.trim() || !summary.trim() || isSending}
                          className="px-6 bg-secondary hover:bg-secondary/90"
                        >
                          {isSending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Send
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/50">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-muted-foreground">No summary generated yet</p>
                      <p className="text-sm text-muted-foreground/70">
                        Upload a transcript and click "Generate AI Summary" to get started
                      </p>
                    </div>
                  </div>
                )}
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
