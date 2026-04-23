'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useCallback } from 'react'
import { agentService } from '../services/agentService'
import type { AgentCreate } from '../types/agent'

// 类型映射
const typeMap: Record<string, string> = {
  assistant: '通用助手',
  teacher: '教学导师',
  consultant: '专业顾问',
  companion: '陪伴伙伴',
  other: '其他',
}

const styleMap: Record<string, string> = {
  professional: '专业严谨',
  friendly: '友好亲切',
  humorous: '幽默风趣',
  formal: '正式礼貌',
  casual: '轻松随意',
}

// 预设技能列表
const presetSkills = ['编程', '写作', '翻译', '数据分析', '设计', '咨询', '教学', '创意策划']

export default function CreateAgentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    agent_type: '',
    description: '',
    skills: [] as string[],
    customSkillInput: '',
    conversation_style: '',
    personality: '',
    temperature: 0.7,
    max_tokens: 2000,
    system_prompt: '',
  })

  // 更新表单字段
  const updateField = (field: string, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // 切换技能选择
  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }))
  }

  // 添加自定义技能
  const addCustomSkill = () => {
    const skill = formData.customSkillInput.trim()
    if (!skill) {
      alert('请输入技能名称')
      return
    }
    if (formData.skills.includes(skill)) {
      alert('该技能已添加')
      return
    }
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
      customSkillInput: '',
    }))
  }

  // 移除技能
  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  // 切换步骤
  const goToStep = useCallback(
    (step: number) => {
      // 步骤1到2时验证名称
      if (step === 2 && currentStep === 1) {
        if (!formData.name.trim()) {
          alert('请输入数字人名称')
          return
        }
      }

      // 步骤5时不需要验证
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step)
      }
    },
    [currentStep, formData.name]
  )

  // 创建数字人
  const handleCreate = async () => {
    setError('')
    setIsSubmitting(true)

    try {
      const createData: AgentCreate = {
        name: formData.name,
        short_description: formData.short_description || null,
        description: formData.description || null,
        agent_type: formData.agent_type || null,
        skills: formData.skills.length > 0 ? formData.skills : null,
        conversation_style: formData.conversation_style || null,
        personality: formData.personality || null,
        temperature: formData.temperature,
        max_tokens: formData.max_tokens,
        system_prompt: formData.system_prompt || null,
      }
      await agentService.createAgent(createData)
      alert('数字人创建成功！')
      router.push('/')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建失败，请稍后重试'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 计算进度条宽度
  const progressWidth = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="min-h-screen">
      {/* 网格背景 */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(0,217,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.03)_1px,transparent_1px)] bg-[length:50px_50px]"></div>

      {/* 模态框遮罩 */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[999]"></div>

      {/* 模态框容器 */}
      <div className="fixed inset-0 z-[1000] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-[896px] bg-bg-tertiary rounded-3xl shadow-[0_20px_25px_rgba(0,217,255,0.2)] border border-white/10">
            {/* 关闭按钮区域 */}
            <div className="sticky top-0 z-20 flex justify-end p-6 pb-0 bg-bg-tertiary">
              <Link
                href="/"
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Link>
            </div>

            {/* 模态框内容 */}
            <div className="px-8 pb-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
              {/* 标题 */}
              <div className="text-center mb-8">
                <h1 className="text-[1.875rem] font-bold mb-2 gradient-text">创建数字人</h1>
                <p className="text-text-secondary">打造属于你的 AI 智能助手</p>
              </div>

              {/* 步骤指示器 */}
              <div className="mb-8">
                <div className="flex justify-between relative mb-4">
                  {/* 进度线背景 */}
                  <div className="absolute top-5 left-0 right-0 h-[2px] bg-white/10 z-0"></div>
                  {/* 进度线 */}
                  <div
                    className="absolute top-5 left-0 h-[2px] bg-gradient-to-r from-accent-primary to-accent-secondary z-1 transition-all duration-300"
                    style={{ width: `${progressWidth}%` }}
                  ></div>

                  {/* 步骤圆点 */}
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all ${
                          step < currentStep
                            ? 'bg-accent-primary border-accent-primary text-white'
                            : step === currentStep
                            ? 'bg-gradient-to-br from-accent-primary to-accent-secondary border-accent-primary text-white shadow-[0_0_10px_rgba(0,217,255,0.3)]'
                            : 'bg-bg-secondary border-white/10 text-text-muted'
                        }`}
                      >
                        {step < 5 ? step : '✓'}
                      </div>
                      <span
                        className={`text-xs transition-colors ${
                          step <= currentStep ? 'text-text-primary' : 'text-text-muted'
                        }`}
                      >
                        {step === 1 && '基础信息'}
                        {step === 2 && '技能设置'}
                        {step === 3 && '性格风格'}
                        {step === 4 && '高级设置'}
                        {step === 5 && '完成'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 步骤内容 */}
              {/* Step 1: 基础信息 */}
              <div className={`step-content ${currentStep === 1 ? 'block animate-slideIn' : 'hidden'}`}>
                <h3 className="text-2xl font-semibold mb-2">基础信息</h3>
                <p className="text-text-secondary text-sm mb-6">请填写数字人的基本信息，让我们认识一下它</p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    数字人名称 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      maxLength={100}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-bg-secondary text-text-primary outline-none transition-all border border-white/10 placeholder:text-text-muted focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1),0_0_10px_rgba(0,217,255,0.3)]"
                      placeholder="给你的数字人起个名字"
                    />
                    <button className="absolute right-2 top-2 p-2 rounded-lg bg-bg-secondary text-accent-primary border border-white/10 hover:border-accent-primary hover:shadow-[0_4px_6px_rgba(0,217,255,0.1)] transition-all" title="AI 助手">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-secondary mb-2">简短描述</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.short_description}
                      onChange={(e) => updateField('short_description', e.target.value)}
                      maxLength={200}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-bg-secondary text-text-primary outline-none transition-all border border-white/10 placeholder:text-text-muted focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1),0_0_10px_rgba(0,217,255,0.3)]"
                      placeholder="一句话介绍这个数字人（例如：专业的编程助手）"
                    />
                    <button className="absolute right-2 top-2 p-2 rounded-lg bg-bg-secondary text-accent-primary border border-white/10 hover:border-accent-primary hover:shadow-[0_4px_6px_rgba(0,217,255,0.1)] transition-all" title="AI 助手">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-secondary mb-2">类型</label>
                  <select
                    value={formData.agent_type}
                    onChange={(e) => updateField('agent_type', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-bg-secondary text-text-primary outline-none transition-all border border-white/10 cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2020%2020%27%3E%3cpath%20stroke%3D%27%236C7293%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%271.5%27%20d%3D%27M6%208l4%204%204-4%27%2F%3E%3c%2Fsvg%3E')] bg-[position:right_0.75rem_center] bg-[length:1.5rem_1.5rem] bg-no-repeat pr-12 focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1),0_0_10px_rgba(0,217,255,0.3)]"
                  >
                    <option value="">选择数字人类型</option>
                    <option value="assistant">通用助手</option>
                    <option value="teacher">教学导师</option>
                    <option value="consultant">专业顾问</option>
                    <option value="companion">陪伴伙伴</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-secondary mb-2">详细描述</label>
                  <div className="relative">
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-bg-secondary text-text-primary outline-none transition-all resize-none border border-white/10 placeholder:text-text-muted focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1),0_0_10px_rgba(0,217,255,0.3)]"
                      placeholder="详细描述这个数字人的特点、能力和使用场景..."
                    />
                    <button className="absolute right-2 top-2 p-2 rounded-lg bg-bg-secondary text-accent-primary border border-white/10 hover:border-accent-primary hover:shadow-[0_4px_6px_rgba(0,217,255,0.1)] transition-all" title="AI 助手">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => goToStep(2)}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold text-white btn-gradient"
                  >
                    下一步
                  </button>
                </div>
              </div>

              {/* Step 2: 技能设置 */}
              <div className={`step-content ${currentStep === 2 ? 'block animate-slideIn' : 'hidden'}`}>
                <h3 className="text-2xl font-semibold mb-2">技能设置</h3>
                <p className="text-text-secondary text-sm mb-6">选择或自定义数字人擅长的技能领域</p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-secondary mb-2">选择技能</label>
                  <div className="flex flex-wrap gap-2">
                    {presetSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 rounded-full text-sm border transition-all ${
                          formData.skills.includes(skill)
                            ? 'bg-gradient-to-br from-accent-primary to-accent-secondary border-accent-primary text-white'
                            : 'border-white/10 bg-bg-secondary text-text-secondary hover:border-accent-primary hover:text-accent-primary'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-secondary mb-2">自定义技能</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.customSkillInput}
                      onChange={(e) => updateField('customSkillInput', e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                      className="flex-1 px-4 py-3 rounded-xl bg-bg-secondary text-text-primary outline-none transition-all border border-white/10 placeholder:text-text-muted focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1),0_0_10px_rgba(0,217,255,0.3)]"
                      placeholder="输入自定义技能"
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      className="px-6 py-3 rounded-xl font-semibold text-white btn-gradient"
                    >
                      添加
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-secondary mb-2">已选技能</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.length === 0 ? (
                      <div className="text-text-muted text-sm">暂未选择技能</div>
                    ) : (
                      formData.skills.map((skill) => (
                        <div
                          key={skill}
                          className="px-4 py-2 rounded-full text-sm bg-gradient-to-br from-accent-primary to-accent-secondary border border-accent-primary text-white flex items-center gap-2"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="font-bold hover:scale-110 transition-transform"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => goToStep(1)}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold bg-bg-secondary text-text-primary border border-white/10 hover:border-white/20 hover:bg-bg-secondary/80 transition-all"
                  >
                    上一步
                  </button>
                  <button
                    onClick={() => goToStep(3)}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold text-white btn-gradient"
                  >
                    下一步
                  </button>
                </div>
              </div>

              {/* Step 3: 性格与风格 */}
              <div className={`step-content ${currentStep === 3 ? 'block animate-slideIn' : 'hidden'}`}>
                <h3 className="text-2xl font-semibold mb-2">性格与风格</h3>
                <p className="text-text-secondary text-sm mb-6">定义数字人的对话风格和性格特征</p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-secondary mb-2">对话风格</label>
                  <select
                    value={formData.conversation_style}
                    onChange={(e) => updateField('conversation_style', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-bg-secondary text-text-primary outline-none transition-all border border-white/10 cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2020%2020%27%3E%3cpath%20stroke%3D%27%236C7293%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%271.5%27%20d%3D%27M6%208l4%204%204-4%27%2F%3E%3c%2Fsvg%3E')] bg-[position:right_0.75rem_center] bg-[length:1.5rem_1.5rem] bg-no-repeat pr-12 focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1),0_0_10px_rgba(0,217,255,0.3)]"
                  >
                    <option value="">选择对话风格</option>
                    <option value="professional">专业严谨</option>
                    <option value="friendly">友好亲切</option>
                    <option value="humorous">幽默风趣</option>
                    <option value="formal">正式礼貌</option>
                    <option value="casual">轻松随意</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-secondary mb-2">性格特征</label>
                  <div className="relative">
                    <textarea
                      value={formData.personality}
                      onChange={(e) => updateField('personality', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-bg-secondary text-text-primary outline-none transition-all resize-none border border-white/10 placeholder:text-text-muted focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1),0_0_10px_rgba(0,217,255,0.3)]"
                      placeholder="描述数字人的性格特征，例如：耐心、细心、积极、有创造力..."
                    />
                    <button className="absolute right-2 top-2 p-2 rounded-lg bg-bg-secondary text-accent-primary border border-white/10 hover:border-accent-primary hover:shadow-[0_4px_6px_rgba(0,217,255,0.1)] transition-all" title="AI 助手">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => goToStep(2)}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold bg-bg-secondary text-text-primary border border-white/10 hover:border-white/20 hover:bg-bg-secondary/80 transition-all"
                  >
                    上一步
                  </button>
                  <button
                    onClick={() => goToStep(4)}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold text-white btn-gradient"
                  >
                    下一步
                  </button>
                </div>
              </div>

              {/* Step 4: 高级设置 */}
              <div className={`step-content ${currentStep === 4 ? 'block animate-slideIn' : 'hidden'}`}>
                <h3 className="text-2xl font-semibold mb-2">高级设置</h3>
                <p className="text-text-secondary text-sm mb-6">调整 AI 模型参数以优化对话效果</p>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-text-secondary">创造性（Temperature）</label>
                    <span className="text-accent-primary font-semibold">{formData.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => updateField('temperature', parseFloat(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none bg-bg-secondary cursor-pointer range-slider"
                  />
                  <p className="text-xs text-text-muted mt-2">较低值使回答更确定和集中，较高值使回答更多样和创造性</p>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-text-secondary">最大回复长度（Max Tokens）</label>
                    <span className="text-accent-primary font-semibold">{formData.max_tokens}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="4000"
                    step="100"
                    value={formData.max_tokens}
                    onChange={(e) => updateField('max_tokens', parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none bg-bg-secondary cursor-pointer range-slider"
                  />
                  <p className="text-xs text-text-muted mt-2">控制每次回复的最大长度，较大值允许更详细的回答</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-secondary mb-2">系统提示词（可选）</label>
                  <textarea
                    value={formData.system_prompt}
                    onChange={(e) => updateField('system_prompt', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-bg-secondary text-text-primary outline-none transition-all resize-none border border-white/10 placeholder:text-text-muted focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1),0_0_10px_rgba(0,217,255,0.3)]"
                    placeholder="输入系统提示词来定义数字人的行为准则..."
                  />
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => goToStep(3)}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold bg-bg-secondary text-text-primary border border-white/10 hover:border-white/20 hover:bg-bg-secondary/80 transition-all"
                  >
                    上一步
                  </button>
                  <button
                    onClick={() => goToStep(5)}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold text-white btn-gradient"
                  >
                    下一步
                  </button>
                </div>
              </div>

              {/* Step 5: 预览与确认 */}
              <div className={`step-content ${currentStep === 5 ? 'block animate-slideIn' : 'hidden'}`}>
                <h3 className="text-2xl font-semibold mb-2">预览与确认</h3>
                <p className="text-text-secondary text-sm mb-6">确认数字人信息无误后即可创建</p>

                {error && (
                  <div className="mb-6 p-4 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-400">
                    {error}
                  </div>
                )}

                <div className="bg-bg-secondary rounded-2xl border border-white/10 overflow-hidden">
                  <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                    <span className="text-text-secondary text-sm">名称</span>
                    <span className="text-text-primary font-medium text-sm">{formData.name || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                    <span className="text-text-secondary text-sm">类型</span>
                    <span className="text-text-primary font-medium text-sm">{typeMap[formData.agent_type] || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                    <span className="text-text-secondary text-sm">简短描述</span>
                    <span className="text-text-primary font-medium text-sm text-right max-w-[60%]">{formData.short_description || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                    <span className="text-text-secondary text-sm">技能</span>
                    <span className="text-text-primary font-medium text-sm text-right max-w-[60%]">{formData.skills.length > 0 ? formData.skills.join('、') : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                    <span className="text-text-secondary text-sm">对话风格</span>
                    <span className="text-text-primary font-medium text-sm">{styleMap[formData.conversation_style] || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                    <span className="text-text-secondary text-sm">创造性</span>
                    <span className="text-text-primary font-medium text-sm">{formData.temperature}</span>
                  </div>
                  <div className="flex justify-between items-center px-6 py-4">
                    <span className="text-text-secondary text-sm">最大回复长度</span>
                    <span className="text-text-primary font-medium text-sm">{formData.max_tokens}</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => goToStep(4)}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold bg-bg-secondary text-text-primary border border-white/10 hover:border-white/20 hover:bg-bg-secondary/80 transition-all"
                  >
                    上一步
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold text-white btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '创建中...' : '创建数字人'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .gradient-text {
          background: linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .btn-gradient {
          background: linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%);
          position: relative;
          overflow: hidden;
        }

        .btn-gradient::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .btn-gradient:hover::before {
          left: 100%;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 217, 255, 0.3);
        }

        .range-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 217, 255, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        @media (max-width: 640px) {
          .step-label-mobile-hide {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
