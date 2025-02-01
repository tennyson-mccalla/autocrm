import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, type = 'single', defaultValue, value, onValueChange, collapsible = false, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string | string[]>(
      value || defaultValue || (type === 'single' ? '' : [])
    )

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value)
      }
    }, [value])

    const handleValueChange = (itemValue: string) => {
      let newValue: string | string[]
      if (type === 'single') {
        newValue = itemValue === internalValue ? (collapsible ? '' : itemValue) : itemValue
      } else {
        const currentValues = Array.isArray(internalValue) ? internalValue : []
        newValue = currentValues.includes(itemValue)
          ? currentValues.filter((v) => v !== itemValue)
          : [...currentValues, itemValue]
      }
      setInternalValue(newValue)
      onValueChange?.(newValue)
    }

    return (
      <div ref={ref} className={cn('space-y-1', className)} {...props} />
    )
  }
)
Accordion.displayName = 'Accordion'

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, children, value, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('border-b', className)}
      data-value={value}
      {...props}
    >
      {children}
    </div>
  )
)
AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex w-full items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0 transition-transform duration-200"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  )
)
AccordionTrigger.displayName = 'AccordionTrigger'

const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        className
      )}
      {...props}
    />
  )
)
AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
