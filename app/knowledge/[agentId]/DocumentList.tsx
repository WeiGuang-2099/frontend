'use client'

import { useRef } from 'react'
import type { KnowledgeDocument } from '../../types/knowledge'

interface Props {
  documents: KnowledgeDocument[]
  onUpload: (file: File) => void
  onDelete: (doc: KnowledgeDocument) => void
  isUploading: boolean
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  processing: { label: 'Processing', color: 'text-warning' },
  completed: { label: 'Completed', color: 'text-success' },
  failed: { label: 'Failed', color: 'text-error' },
}

export function DocumentList({ documents, onUpload, onDelete, isUploading }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="w-80 border-r border-default bg-bg-secondary/50 flex flex-col h-full">
      <div className="p-4 border-b border-default">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full py-2.5 rounded-lg bg-accent-gradient text-white text-sm font-medium cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : '+ Upload Document'}
        </button>
        <p className="text-xs text-text-muted mt-2">Supports .txt and .md files (max 5MB)</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {documents.length === 0 ? (
          <p className="text-text-muted text-sm text-center mt-8">No documents yet</p>
        ) : (
          documents.map((doc) => {
            const status = STATUS_MAP[doc.status] || STATUS_MAP.failed
            return (
              <div key={doc.id} className="px-4 py-3 border-b border-default group">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary truncate flex-1">{doc.filename}</span>
                  <button
                    onClick={() => onDelete(doc)}
                    className="text-text-muted hover:text-error text-xs opacity-50 group-hover:opacity-100 md:opacity-0 transition-opacity cursor-pointer ml-2"
                  >
                    x
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs ${status.color}`}>{status.label}</span>
                  {doc.status === 'completed' && (
                    <span className="text-xs text-text-muted">{doc.entity_count} entities</span>
                  )}
                  <span className="text-xs text-text-muted">
                    {(doc.file_size / 1024).toFixed(1)}KB
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
