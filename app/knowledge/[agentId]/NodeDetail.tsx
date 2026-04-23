'use client'

import type { GraphNode } from '../../types/knowledge'

interface Props {
  node: GraphNode | null
  onClose: () => void
}

const TYPE_COLORS: Record<string, string> = {
  Person: 'bg-blue-500/20 text-blue-400',
  Organization: 'bg-orange-500/20 text-orange-400',
  Technology: 'bg-green-500/20 text-green-400',
  Concept: 'bg-purple-500/20 text-purple-400',
  Event: 'bg-red-500/20 text-red-400',
  Location: 'bg-cyan-500/20 text-cyan-400',
}

export function NodeDetail({ node, onClose }: Props) {
  if (!node) return null

  return (
    <div className="w-72 border-l border-default bg-bg-secondary/80 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-text-primary truncate">{node.name}</h3>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary text-sm cursor-pointer">x</button>
      </div>
      <span className={`inline-block px-2 py-1 rounded text-xs ${TYPE_COLORS[node.type] || 'bg-gray-500/20 text-gray-400'}`}>
        {node.type}
      </span>
      {node.description && (
        <p className="mt-3 text-sm text-text-secondary">{node.description}</p>
      )}
      <div className="mt-4 text-xs text-text-muted">
        <p>ID: {node.id}</p>
      </div>
    </div>
  )
}
