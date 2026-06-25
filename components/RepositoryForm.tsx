'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Loader2 } from 'lucide-react'

interface RepositoryFormProps {
  onAnalyze: (gitUrl?: string, files?: File[]) => Promise<void>
  loading: boolean
  error?: string | null
}

export function RepositoryForm({ onAnalyze, loading, error }: RepositoryFormProps) {
  const [gitUrl, setGitUrl] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [method, setMethod] = useState<'github' | 'upload'>('github')

  const handleGithubSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gitUrl.trim()) return
    await onAnalyze(gitUrl)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles(files)
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (uploadedFiles.length === 0) return
    await onAnalyze(undefined, uploadedFiles)
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setMethod('github')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            method === 'github'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          GitHub URL
        </button>
        <button
          onClick={() => setMethod('upload')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            method === 'upload'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Upload Files
        </button>
      </div>

      {/* GitHub Method */}
      {method === 'github' && (
        <form onSubmit={handleGithubSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">GitHub Repository URL</label>
            <Input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={gitUrl}
              onChange={(e) => setGitUrl(e.target.value)}
              disabled={loading}
              className="bg-card border-border"
            />
            <p className="text-xs text-muted-foreground">
              Enter a public GitHub repository URL. We&apos;ll clone and analyze it.
            </p>
          </div>

          <Button
            type="submit"
            disabled={!gitUrl.trim() || loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Repository
              </>
            )}
          </Button>
        </form>
      )}

      {/* Upload Method */}
      {method === 'upload' && (
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Repository Files</label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
              <input
                type="file"
                multiple
                disabled={loading}
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-center space-y-4">
                  <div className="text-4xl">📁</div>
                  <div>
                    <p className="font-medium">Drop files here or click to select</p>
                    <p className="text-sm text-muted-foreground">You can upload multiple files or directories</p>
                  </div>
                </div>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Selected files: {uploadedFiles.length}</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {uploadedFiles.map((file) => (
                    <p key={file.name} className="text-xs text-muted-foreground truncate">
                      • {file.name}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={uploadedFiles.length === 0 || loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Uploaded Files
              </>
            )}
          </Button>
        </form>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="font-medium text-destructive">Analysis Error</p>
            <p className="text-sm text-destructive/90">{error}</p>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold">How it works:</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>✓ We analyze your repository structure and dependencies</li>
          <li>✓ Generate an interactive architecture diagram</li>
          <li>✓ Extract key modules and entry points</li>
          <li>✓ Prepare your codebase for AI-powered questions</li>
        </ul>
      </div>
    </div>
  )
}
