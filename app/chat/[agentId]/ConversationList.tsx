'use client'

import type { Conversation } from '../../types/chat'

interface Props {
  conversations: Conversation[]
  activeId: number | null
  onSelect: (conv: Conversation) => void
  onNew: () => void
  onDelete: (conv: Conversation) => void
}

export function ConversationList({ conversations, activeId, onSelect, onNew, onDelete }: Props) {
  return (
    <div className="w-72 border-r border-default bg-bg-secondary/50 flex flex-col h-full">
      <div className="p-4 border-b border-default">
        <button
          onClick={onNew}
          className="w-full py-2.5 rounded-lg bg-accent-gradient text-white text-sm font-medium cursor-pointer transition-opacity hover:opacity-90"
        >
          + 新对话
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="text-text-muted text-sm text-center mt-8">暂无对话</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`px-4 py-3 cursor-pointer border-b border-default transition-colors group ${
                activeId === conv.id
                  ? 'bg-bg-tertiary border-l-2 border-l-accent-primary'
                  : 'hover:bg-bg-tertiary/50'
              }`}
              onClick={() => onSelect(conv)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary truncate flex-1">
                  {conv.title || '新对话'}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(conv) }}
                  className="text-text-muted hover:text-error text-xs opacity-50 group-hover:opacity-100 md:opacity-0 transition-opacity cursor-pointer ml-2"
                  aria-label="删除对话"
                >
                  x
                </button>
              </div>
              <span className="text-xs text-text-muted">
                {new Date(conv.updated_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
