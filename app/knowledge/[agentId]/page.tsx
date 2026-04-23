'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { knowledgeService } from '../../services/knowledgeService'
import { agentService } from '../../services/agentService'
import { authService } from '../../services/authService'
import type { AgentResponse } from '../../types/agent'
import type { KnowledgeDocument, GraphData, GraphNode } from '../../types/knowledge'
import { DocumentList } from './DocumentList'
import { KnowledgeGraph } from './KnowledgeGraph'
import { NodeDetail } from './NodeDetail'
import { ConfirmDialog } from '../../components/ConfirmDialog'

export default function KnowledgePage() {
  const router = useRouter()
  const params = useParams()
  const agentId = Number(params.agentId)

  const [agent, setAgent] = useState<AgentResponse | null>(null)
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [deleteDoc, setDeleteDoc] = useState<KnowledgeDocument | null>(null)

  // Auth check + load agent
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      if (!token) { router.replace('/login'); return }
      try { await authService.getMe() } catch { router.replace('/login'); return }
      try {
        const data = await agentService.getAgent(agentId)
        setAgent(data)
      } catch {
        alert('Agent not found')
        router.replace('/')
      }
    }
    init()
  }, [agentId, router])

  // Load documents and graph
  const loadData = useCallback(async () => {
    try {
      const [docs, graph] = await Promise.all([
        knowledgeService.getDocuments(agentId),
        knowledgeService.getGraph(agentId),
      ])
      setDocuments(docs)
      setGraphData(graph)
    } catch (err) {
      console.error('Failed to load knowledge data:', err)
    }
  }, [agentId])

  useEffect(() => {
    if (agent) loadData()
  }, [agent, loadData])

  // Upload document
  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      await knowledgeService.uploadDocument(agentId, file)
      await loadData()
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  // Delete document
  const handleDelete = async () => {
    if (!deleteDoc) return
    try {
      await knowledgeService.deleteDocument(deleteDoc.id)
      setDeleteDoc(null)
      await loadData()
    } catch {
      alert('Failed to delete document')
    }
  }

  if (!agent) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary text-text-secondary">
        <div>Loading...</div>
      </div>
    )
  }

  const totalEntities = graphData.nodes.length
  const totalRelations = graphData.edges.length

  return (
    <div className="h-screen flex flex-col">
      {/* Top nav */}
      <nav className="sticky top-0 z-[100] backdrop-blur-xl bg-bg-secondary/80 border-b border-default">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-semibold gradient-text no-underline">Cosmray</Link>
            <span className="text-text-muted">/</span>
            <span className="text-text-secondary text-sm">{agent.name}</span>
            <span className="text-text-muted">/</span>
            <span className="text-text-primary text-sm">Knowledge Graph</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entities..."
              className="bg-bg-tertiary border border-default rounded-lg px-3 py-1.5 text-text-primary text-sm w-48 focus:outline-none focus:border-accent-primary"
            />
            {/* Stats */}
            <span className="text-xs text-text-muted">{totalEntities} entities</span>
            <span className="text-xs text-text-muted">{totalRelations} relations</span>
            <Link href={`/chat/${agentId}`} className="text-sm text-accent-primary no-underline hover:underline">
              Chat
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <DocumentList
          documents={documents}
          onUpload={handleUpload}
          onDelete={(doc) => setDeleteDoc(doc)}
          isUploading={isUploading}
        />
        <KnowledgeGraph
          graphData={graphData}
          onNodeClick={setSelectedNode}
          searchQuery={searchQuery}
        />
        <NodeDetail
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>

      {/* Delete confirmation */}
      {deleteDoc && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Document"
          message={`Delete "${deleteDoc.filename}" and all its extracted entities?`}
          type="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteDoc(null)}
        />
      )}
    </div>
  )
}
