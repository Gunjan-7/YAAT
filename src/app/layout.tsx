import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { ClerkProvider } from '@clerk/nextjs'
import ModalProvider from '@/providers/modal-provider'
import { Toaster } from '@/components/ui/sonner'
import { BillingProvider } from '@/providers/billing-provider'
import { PerformanceMonitorUI } from '@/components/global/performance-monitor-ui'

const font = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fuzzie.',
  description: 'Automate Your Work With Fuzzie.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={font.className} suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <BillingProvider>
              <ModalProvider>
                {children}
                <Toaster />
                {/* Performance monitor - only visible in development with query param ?perf=true */}
                <PerformanceMonitorUI 
                  visible={process.env.NODE_ENV === 'development' && 
                    typeof window !== 'undefined' && 
                    window.location.search.includes('perf=true')} 
                />
              </ModalProvider>
            </BillingProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
