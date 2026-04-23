'use client'

import { useEffect } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'warning',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          iconBg: 'bg-error/20',
          iconBorder: 'border-error/40',
          iconColor: 'text-error'
        }
      case 'warning':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          iconBg: 'bg-warning/20',
          iconBorder: 'border-warning/40',
          iconColor: 'text-warning'
        }
      case 'info':
      default:
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: 'bg-info/20',
          iconBorder: 'border-info/40',
          iconColor: 'text-info'
        }
    }
  }

  const { icon, iconBg, iconBorder, iconColor } = getIconAndColors()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 transition-opacity"
        style={{
          backgroundColor: 'rgba(10, 22, 40, 0.92)',
          backdropFilter: 'blur(12px)'
        }}
        onClick={onCancel}
      ></div>

      {/* 对话框容器 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md transform overflow-hidden rounded-[20px] backdrop-blur-xl shadow-custom-xl transition-all bg-bg-tertiary border border-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 渐变边框效果 */}
          <div className="absolute -inset-[2px] rounded-[20px] pointer-events-none opacity-50 bg-accent-gradient [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] p-[2px]" />

          <div className="p-8 relative">
            {/* 图标 */}
            <div className="flex items-center justify-center">
              <div className={`flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full border-2 ${iconBg} ${iconBorder} ${iconColor}`}>
                {icon}
              </div>
            </div>

            {/* 内容 */}
            <div className="mt-6 text-center">
              <h3 className="text-xl font-semibold leading-6 text-text-primary mb-3">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-base text-text-secondary leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* 按钮 */}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                className="flex-1 justify-center rounded-[10px] px-4 py-3 text-base font-medium transition-all bg-bg-secondary text-text-primary border border-default hover:-translate-y-0.5 hover:border-hover"
                onClick={onCancel}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className="flex-1 justify-center rounded-[10px] px-4 py-3 text-base font-semibold transition-all btn-gradient hover:-translate-y-0.5 hover:shadow-glow-md"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
