'use client'

import { useState, useRef, useEffect } from 'react'
import { AnalysisResult, ChatMessage } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2 } from 'lucide-react'

interface ChatInterfaceProps {
  analysis: AnalysisResult
  selectedFile: string | null
}

export function ChatInterface({ analysis, selectedFile }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)
    setError(null)

    // Add user message
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      },
    ]
    setMessages(newMessages)

    try {
      console.log('[v0] Sending chat message:', userMessage)

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          repositoryAnalysis: analysis,
          selectedFile,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      // Read the streamed response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      let assistantMessage = ''
      const textDecoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Parse the streamed data
        const chunk = textDecoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const json = JSON.parse(data)
              if (json.type === 'text-delta' && json.delta) {
                assistantMessage += json.delta
                // Update the last message (assistant message)
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  {
                    role: 'assistant',
                    content: assistantMessage,
                    timestamp: Date.now(),
                  },
                ])
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      console.log('[v0] Chat response complete')
    } catch (err: any) {
      console.error('[v0] Chat error:', err)
      setError(err.message || 'Failed to get response')
      // Remove the user message if there was an error
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-card/30">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-4 max-w-md">
              <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Ask about your code</h3>
                <p className="text-muted-foreground">
                  Use Claude AI to ask questions about the repository architecture, dependencies, code patterns, and more.
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xl lg:max-w-2xl rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 max-w-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/50 p-4 space-y-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask about the code..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="bg-background border-border"
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Powered by Claude • Analysis tokens are managed efficiently
        </p>
      </div>
    </div>
  )
}
