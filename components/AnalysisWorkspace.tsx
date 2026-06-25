'use client'

import { useState } from 'react'
import { AnalysisResult } from '@/lib/types'
import { FileExplorer } from './FileExplorer'
import { ArchitectureDiagram } from './ArchitectureDiagram'
import { CodePreview } from './CodePreview'
import { ChatInterface } from './ChatInterface'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Menu, X } from 'lucide-react'

interface AnalysisWorkspaceProps {
  analysis: AnalysisResult
  onReset: () => void
}

export function AnalysisWorkspace({ analysis, onReset }: AnalysisWorkspaceProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activePanel, setActivePanel] = useState<'overview' | 'diagram' | 'tree' | 'code' | 'chat'>('overview')

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 backdrop-blur-sm bg-card/40">
        <div className="max-w-full px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Button
              onClick={onReset}
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">RP</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold text-sm">{analysis.name}</p>
                <p className="text-xs text-muted-foreground">
                  {analysis.summary.totalFiles} files • {analysis.summary.complexity} complexity
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Actions */}
          <Button
            onClick={onReset}
            variant="outline"
            className="hidden lg:flex gap-2 border-border"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 gap-0">
        {/* Left Panel - File Tree (Hidden on mobile, shown on desktop) */}
        <div className="hidden lg:flex lg:col-span-1 border-r border-border/50 bg-card/30 overflow-auto">
          <div className="w-full">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold text-sm">Files</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {analysis.summary.totalFiles} total
              </p>
            </div>
            <FileExplorer
              fileTree={analysis.fileTree}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
            />
          </div>
        </div>

        {/* Center/Right Panel - Tabbed View */}
        <div className="col-span-1 lg:col-span-3 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="border-b border-border/50 bg-card/20 flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'diagram', label: 'Architecture' },
              { id: 'tree', label: 'Files' },
              { id: 'code', label: 'Code' },
              { id: 'chat', label: 'AI Chat' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActivePanel(tab.id as typeof activePanel)
                  setShowMobileMenu(false)
                }}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activePanel === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            {/* Overview */}
            {activePanel === 'overview' && (
              <div className="p-6 max-w-4xl space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Repository Overview</h3>
                  <p className="text-muted-foreground">
                    A summary of the extracted structures and key metrics.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <h4 className="font-semibold mb-3">Key Modules</h4>
                    {analysis.summary.mainModules && analysis.summary.mainModules.length > 0 ? (
                      <ul className="space-y-2">
                        {analysis.summary.mainModules.map((mod, i) => (
                          <li key={i} className="text-sm bg-secondary/50 px-3 py-1.5 rounded border border-border">
                            {mod}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No prominent modules identified.</p>
                    )}
                  </div>

                  <div className="p-4 bg-card border border-border rounded-lg">
                    <h4 className="font-semibold mb-3">Entry Points</h4>
                    {analysis.summary.entryPoints && analysis.summary.entryPoints.length > 0 ? (
                      <ul className="space-y-2">
                        {analysis.summary.entryPoints.map((ep, i) => (
                          <li key={i} className="text-sm bg-secondary/50 px-3 py-1.5 rounded border border-border">
                            {ep}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No clear entry points found.</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-card border border-border rounded-lg">
                  <h4 className="font-semibold mb-3">Languages & Complexity</h4>
                  <div className="flex gap-4 items-center">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Complexity:</span>{' '}
                      <span className="font-medium capitalize">{analysis.summary.complexity}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Total Files:</span>{' '}
                      <span className="font-medium">{analysis.summary.totalFiles}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.entries(analysis.summary.languages).map(([lang, count]) => (
                      <span key={lang} className="text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                        {lang} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Architecture Diagram */}
            {activePanel === 'diagram' && (
              <ArchitectureDiagram diagram={analysis.architectureGraph} />
            )}

            {/* File Tree */}
            {activePanel === 'tree' && (
              <div className="p-4">
                <h3 className="font-semibold mb-4">Repository Structure</h3>
                <FileExplorer
                  fileTree={analysis.fileTree}
                  selectedFile={selectedFile}
                  onSelectFile={(file) => {
                    setSelectedFile(file)
                    setActivePanel('code')
                  }}
                />
              </div>
            )}

            {/* Code Preview */}
            {activePanel === 'code' && (
              <CodePreview
                selectedFile={selectedFile}
                fileTree={analysis.fileTree}
                repoPath={analysis.repoPath}
              />
            )}

            {/* Chat Interface */}
            {activePanel === 'chat' && (
              <ChatInterface
                analysis={analysis}
                selectedFile={selectedFile}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
