'use client'

import { useState } from 'react'
import { RepositoryForm } from '@/components/RepositoryForm'
import { AnalysisWorkspace } from '@/components/AnalysisWorkspace'
import { AnalysisResult } from '@/lib/types'

export default function AnalyzePage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (gitUrl?: string, files?: File[]) => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      if (gitUrl) {
        formData.append('gitUrl', gitUrl)
      }
      if (files) {
        for (const file of files) {
          formData.append('files', file)
        }
      }

      console.log('[v0] Sending analysis request')
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Analysis failed')
      }

      const data = await response.json()
      console.log('[v0] Analysis complete:', data)
      setAnalysis(data.data)
    } catch (err: any) {
      console.error('[v0] Analysis error:', err)
      setError(err.message || 'Failed to analyze repository')
    } finally {
      setLoading(false)
    }
  }

  if (analysis) {
    return <AnalysisWorkspace analysis={analysis} onReset={() => setAnalysis(null)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      {/* Header */}
      <div className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">RP</span>
            </div>
            <span className="font-semibold text-foreground">RepoPilot</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold">Analyze Your Repository</h1>
            <p className="text-lg text-muted-foreground">
              Choose a GitHub repository or upload code files to get started
            </p>
          </div>

          <RepositoryForm onAnalyze={handleAnalyze} loading={loading} error={error} />
        </div>
      </div>
    </div>
  )
}
