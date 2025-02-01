import * as React from 'react'
import { cn } from '@/lib/utils'

export interface DialogProps extends React.DialogHTMLAttributes<HTMLDialogElement> {
  open?: boolean
  onClose?: () => void
  onOpenChange?: (open: boolean) => void
}

const Dialog = React.forwardRef<HTMLDialogElement, DialogProps>(
  ({ className, children, open, onClose, onOpenChange, ...props }, ref) => {
    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose?.()
        onOpenChange?.(false)
      }
    }

    return (
      <dialog
        ref={ref}
        open={open}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
          className
        )}
        onClick={handleBackdropClick}
        {...props}
      >
        {children}
      </dialog>
    )
  }
)
Dialog.displayName = 'Dialog'

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DialogTrigger.displayName = 'DialogTrigger'

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative grid w-full max-w-lg gap-4 bg-background p-6 shadow-lg sm:rounded-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
DialogContent.displayName = 'DialogContent'

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    />
  )
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
      {...props}
    />
  )
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
)
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
)
DialogDescription.displayName = 'DialogDescription'

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription }
