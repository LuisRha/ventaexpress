import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  className?: string
}

const variantStyles: Record<AlertVariant, string> = {
  info: 'bg-primary-50 border-primary-200 text-primary-800',
  success: 'bg-success-50 border-success-500/20 text-success-700',
  warning: 'bg-warning-50 border-warning-500/20 text-warning-700',
  error: 'bg-danger-50 border-danger-500/20 text-danger-700',
}

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      {title && <p className="font-medium mb-1">{title}</p>}
      <div className="text-sm">{children}</div>
    </div>
  )
}
