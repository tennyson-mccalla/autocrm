'use client'

import * as React from 'react'
import { ThemeProvider as NextThemeProvider } from 'next-themes'

function ThemeProvider({ children, ...props }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <NextThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        {...props}
      >
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </NextThemeProvider>
    )
  }

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemeProvider>
  )
}

export { ThemeProvider }
