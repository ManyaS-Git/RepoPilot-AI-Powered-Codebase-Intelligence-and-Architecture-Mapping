'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface ArchitectureDiagramProps {
  diagram: string
}

export function ArchitectureDiagram({ diagram }: ArchitectureDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const renderDiagram = async () => {
      try {
        // Initialize mermaid
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          flowchart: { useMaxWidth: true, htmlLabels: true },
        })

        const id = `mermaid-diagram-${Math.random().toString(36).substr(2, 9)}`
        const { svg } = await mermaid.render(id, diagram)
        
        containerRef.current!.innerHTML = svg
      } catch (error) {
        console.error('[v0] Error rendering diagram:', error)
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-8 text-center">
              <p class="text-muted-foreground mb-4">Unable to render architecture diagram</p>
              <pre class="bg-card p-4 rounded text-left text-sm overflow-auto text-muted-foreground">
${diagram}
              </pre>
            </div>
          `
        }
      }
    }

    renderDiagram()
  }, [diagram])

  return (
    <div ref={containerRef} className="w-full h-full p-8 overflow-auto">
      <style>{`
        .mermaid {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100%;
        }
        
        .mermaid svg {
          max-width: 100%;
          height: auto;
        }

        .mermaid text {
          fill: #e4e4e8;
          font-family: inherit;
        }

        .mermaid .node {
          stroke: #6366f1 !important;
          fill: #6366f1 !important;
        }

        .mermaid .nodeLabel {
          color: #ffffff !important;
        }

        .mermaid .edgePath path {
          stroke: #404063 !important;
        }

        .mermaid .arrowheadPath {
          fill: #404063 !important;
        }
      `}</style>
    </div>
  )
}
