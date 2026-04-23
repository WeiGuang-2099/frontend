'use client'

import { useState, useEffect } from 'react'
import { agentService } from '../services/agentService'
import type { AgentCreate, AgentUpdate, AgentResponse } from '../types/agent'

interface AgentFormModalProps {
  mode: 'create' | 'edit'
  agent?: AgentResponse
  onClose: () => void
  onSuccess: () => void
}

export function AgentFormModal({ mode, agent, onClose, onSuccess }: AgentFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar_url: '',
    voice_id: '',
    agent_type: '',
    skills: '',
    permission: 'owner',
    is_active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (mode === 'edit' && agent) {
      setFormData({
        name: agent.name,
        description: agent.description || '',
        avatar_url: agent.avatar_url || '',
        voice_id: agent.voice_id || '',
        agent_type: agent.agent_type || '',
        skills: agent.skills || '',
        permission: agent.permission || 'owner',
        is_active: agent.is_active,
      })
    }
  }, [mode, agent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const createData: AgentCreate = {
          name: formData.name,
          description: formData.description || null,
          avatar_url: formData.avatar_url || null,
          voice_id: formData.voice_id || null,
          agent_type: formData.agent_type || null,
          skills: formData.skills || null,
          permission: formData.permission || null,
        }
        await agentService.createAgent(createData)
        alert('创建成功！')
      } else if (mode === 'edit' && agent) {
        const updateData: AgentUpdate = {
          name: formData.name,
          description: formData.description || null,
          avatar_url: formData.avatar_url || null,
          voice_id: formData.voice_id || null,
          agent_type: formData.agent_type || null,
          skills: formData.skills || null,
          permission: formData.permission || null,
          is_active: formData.is_active,
        }
        await agentService.updateAgent(agent.id, updateData)
        alert('更新成功！')
      }
      onSuccess()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '操作失败，请稍后重试'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-tertiary rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border border-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            {mode === 'create' ? '创建数字人' : '编辑数字人'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg text-sm bg-error/10 border border-error/20 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-text-secondary">
              名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-4 py-3 rounded-lg bg-bg-secondary text-text-primary outline-none transition-all border border-default placeholder:text-text-muted focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
              placeholder="请输入数字人名称"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-text-secondary">描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-bg-secondary text-text-primary outline-none transition-all resize-none border border-default placeholder:text-text-muted focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
              placeholder="请输入数字人描述"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-text-secondary">头像URL</label>
            <input
              type="url"
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleChange}
              maxLength={500}
              className="w-full px-4 py-3 rounded-lg bg-bg-secondary text-text-primary outline-none transition-all border border-default placeholder:text-text-muted focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-text-secondary">语音ID</label>
            <input
              type="text"
              name="voice_id"
              value={formData.voice_id}
              onChange={handleChange}
              maxLength={100}
              className="w-full px-4 py-3 rounded-lg bg-bg-secondary text-text-primary outline-none transition-all border border-default placeholder:text-text-muted focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
              placeholder="请输入语音ID"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-text-secondary">类型</label>
            <input
              type="text"
              name="agent_type"
              value={formData.agent_type}
              onChange={handleChange}
              maxLength={50}
              className="w-full px-4 py-3 rounded-lg bg-bg-secondary text-text-primary outline-none transition-all border border-default placeholder:text-text-muted focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
              placeholder="如: research, education, creative..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-text-secondary">技能</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-bg-secondary text-text-primary outline-none transition-all border border-default placeholder:text-text-muted focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
              placeholder="用逗号分隔，如: 文献检索、数据分析"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-text-secondary">权限</label>
            <select
              name="permission"
              value={formData.permission}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-bg-secondary text-text-primary outline-none transition-all border border-default focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
            >
              <option value="owner">我的（完全控制）</option>
              <option value="view_only">仅查看</option>
            </select>
          </div>

          {mode === 'edit' && (
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-5 h-5 rounded accent-accent-primary"
                />
                <span className="text-sm text-text-secondary">激活智能体</span>
              </label>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg font-medium transition-all bg-bg-secondary text-text-primary hover:bg-opacity-80 border border-default"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-lg font-medium transition-all btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '提交中...' : mode === 'create' ? '创建' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
