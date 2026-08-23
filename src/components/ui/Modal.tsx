import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 animate-fade-in" aria-hidden="true" />

      {/* Content */}
      <div
        className={cn(
          'relative w-full bg-white rounded-xl shadow-xl animate-slide-up',
          'p-5 sm:p-6',
          sizeStyles[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 id="modal-title" className="text-lg font-semibold text-secondary-900">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100 transition-colors"
              aria-label="Cerrar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
