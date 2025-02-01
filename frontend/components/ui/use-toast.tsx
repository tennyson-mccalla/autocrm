import * as React from 'react'

export type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  type?: 'default' | 'success' | 'error' | 'warning'
  variant?: 'default' | 'destructive' | 'success'
}

type ToastContextType = {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id'>) => void
  removeToast: (id: string) => void
  toast: (props: Omit<ToastProps, 'id'>) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback(
    (toast: Omit<ToastProps, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9)
      setToasts((prev) => [...prev, { ...toast, id }])

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
    },
    []
  )

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = React.useCallback(
    (props: Omit<ToastProps, 'id'>) => {
      addToast(props)
    },
    [addToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
