'use client'

import { FileNode } from '@/lib/types'
import { File, Loader2, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodePreviewProps {
  selectedFile: string | null
  fileTree: FileNode[]
  repoPath?: string
}

export function CodePreview({ selectedFile, fileTree, repoPath }: CodePreviewProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedFile || !repoPath) {
      setContent(null)
      return
    }

    const fetchContent = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = `/api/file?repoPath=${encodeURIComponent(repoPath)}&filePath=${encodeURIComponent(selectedFile)}`
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error('Failed to load file content')
        }
        const data = await res.json()
        if (data.success) {
          setContent(data.data.content)
        } else {
          throw new Error(data.error || 'Failed to load file content')
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [selectedFile, repoPath])

  if (!selectedFile) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
        <File className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No file selected</h3>
        <p className="text-muted-foreground">Select a file from the file tree to view its contents</p>
      </div>
    )
  }

  // Find the file in the tree to get language
  const findFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.path === selectedFile) return node
      if (node.children) {
        const found = findFile(node.children)
        if (found) return found
      }
    }
    return null
  }

  const file = findFile(fileTree)
  const language = file?.language || 'typescript'

  return (
    <div className="w-full h-full flex flex-col bg-card/30">
      {/* File Header */}
      <div className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <File className="w-5 h-5 text-accent" />
          <div>
            <p className="font-semibold">{file?.name}</p>
            <p className="text-xs text-muted-foreground">{selectedFile}</p>
          </div>
        </div>
        {file?.language && (
          <span className="text-xs bg-primary/20 px-3 py-1 rounded">
            {file.language}
          </span>
        )}
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto bg-[#1e1e1e]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-destructive p-6 text-center">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p>{error}</p>
          </div>
        ) : content ? (
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent' }}
            showLineNumbers
          >
            {content}
          </SyntaxHighlighter>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No content to display.</p>
          </div>
        )}
      </div>
    </div>
  )
}
