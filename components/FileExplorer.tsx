'use client'

import { useState } from 'react'
import { FileNode } from '@/lib/types'
import { ChevronRight, File, Folder } from 'lucide-react'

interface FileExplorerProps {
  fileTree: FileNode[]
  selectedFile: string | null
  onSelectFile: (path: string) => void
}

export function FileExplorer({ fileTree, selectedFile, onSelectFile }: FileExplorerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expanded)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpanded(newExpanded)
  }

  const renderTree = (nodes: FileNode[], depth: number = 0) => {
    return (
      <div className="select-none">
        {nodes.map((node) => (
          <div key={node.path}>
            {node.type === 'file' ? (
              <button
                onClick={() => onSelectFile(node.path)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 rounded hover:bg-card transition-colors truncate ${
                  selectedFile === node.path
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{ paddingLeft: `${depth * 16 + 12}px` }}
              >
                <File className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{node.name}</span>
                {node.language && (
                  <span className="text-xs bg-primary/20 px-2 py-0.5 rounded flex-shrink-0">
                    {node.language}
                  </span>
                )}
              </button>
            ) : (
              <div>
                <button
                  onClick={() => toggleExpanded(node.path)}
                  className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 rounded hover:bg-card transition-colors truncate text-foreground font-medium"
                  style={{ paddingLeft: `${depth * 16 + 12}px` }}
                >
                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${
                      expanded.has(node.path) ? 'rotate-90' : ''
                    }`}
                  />
                  <Folder className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{node.name}</span>
                </button>
                {expanded.has(node.path) && node.children && (
                  <div>
                    {renderTree(node.children, depth + 1)}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return <div className="space-y-1">{renderTree(fileTree)}</div>
}
