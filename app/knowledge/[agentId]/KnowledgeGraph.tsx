'use client'

import { useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { GraphData, GraphNode } from '../../types/knowledge'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface Props {
  graphData: GraphData
  onNodeClick: (node: GraphNode) => void
  searchQuery: string
}

const TYPE_COLORS: Record<string, string> = {
  Person: '#3B82F6',
  Organization: '#F97316',
  Technology: '#22C55E',
  Concept: '#A855F7',
  Event: '#EF4444',
  Location: '#06B6D4',
}

export function KnowledgeGraph({ graphData, onNodeClick, searchQuery }: Props) {
  const fgRef = useRef<any>(null)

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      fgRef.current.zoomToFit(400, 50)
    }
  }, [graphData])

  const nodePaint = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name
    const fontSize = Math.max(12 / globalScale, 4)
    ctx.font = `${fontSize}px Sans-Serif`
    const textWidth = ctx.measureText(label).width
    const bgWidth = textWidth + fontSize
    const bgHeight = fontSize * 1.5

    // Highlight matching nodes
    const isMatch = searchQuery && label.toLowerCase().includes(searchQuery.toLowerCase())
    const color = TYPE_COLORS[node.type] || '#6B7280'

    // Draw circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, bgHeight * 0.6, 0, 2 * Math.PI)
    ctx.fillStyle = isMatch ? '#FDE047' : color
    ctx.globalAlpha = isMatch ? 1 : 0.7
    ctx.fill()
    ctx.globalAlpha = 1

    // Draw label
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = isMatch ? '#000' : '#F5F5F5'
    ctx.fillText(label.length > 12 ? label.slice(0, 12) + '...' : label, node.x, node.y + bgHeight * 0.8)
  }, [searchQuery])

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <p className="text-text-muted text-sm">No knowledge graph yet</p>
          <p className="text-text-muted text-xs mt-2">Upload a document to start building the graph</p>
        </div>
      </div>
    )
  }

  // Transform data for react-force-graph-2d
  const fgData = {
    nodes: graphData.nodes.map(n => ({ ...n, val: 5 })),
    links: graphData.edges.map(e => ({ source: e.source, target: e.target, label: e.relation })),
  }

  return (
    <div className="flex-1 bg-bg-primary">
      <ForceGraph2D
        ref={fgRef}
        graphData={fgData}
        nodeCanvasObject={nodePaint}
        onNodeClick={(node: any) => {
          if (node) onNodeClick({ id: node.id, name: node.name, type: node.type, description: node.description })
        }}
        linkColor={() => 'rgba(255,255,255,0.15)'}
        linkDirectionalArrowLength={3}
        backgroundColor="#0A1628"
        cooldownTicks={100}
      />
    </div>
  )
}
