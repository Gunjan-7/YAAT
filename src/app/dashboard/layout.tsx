'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  LayoutGrid, 
  Settings, 
  CreditCard, 
  Link2, 
  Menu, 
  X 
} from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface SidebarLink {
  href: string
  label: string
  icon: React.ReactNode
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const sidebarLinks: SidebarLink[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      href: '/dashboard/workflows',
      label: 'Workflows',
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      href: '/dashboard/connections',
      label: 'Connections',
      icon: <Link2 className="w-5 h-5" />,
    },
    {
      href: '/dashboard/billing',
      label: 'Billing',
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ]

  return (
    <div className="flex h-screen bg-neutral-950 text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-neutral-800 p-4">
        <div className="flex items-center mb-8 pl-2">
          <Link href="/" className="flex items-center gap-[2px]">
            <p className="text-2xl font-bold">Fu</p>
            <Image
              src="/fuzzieLogo.png"
              width={12}
              height={12}
              alt="fuzzie logo"
              className="shadow-sm"
            />
            <p className="text-2xl font-bold">zie</p>
          </Link>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-2">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href
              
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-neutral-800 text-white' 
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        <div className="border-t border-neutral-800 pt-4 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm text-neutral-400">Account</span>
          </div>
        </div>
      </aside>
      
      {/* Mobile Header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800">
          <Link href="/" className="flex items-center gap-[2px]">
            <p className="text-xl font-bold">Fu</p>
            <Image
              src="/fuzzieLogo.png"
              width={10}
              height={10}
              alt="fuzzie logo"
              className="shadow-sm"
            />
            <p className="text-xl font-bold">zie</p>
          </Link>
          
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full hover:bg-neutral-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-neutral-800"
            >
              <nav className="p-4">
                <ul className="space-y-2">
                  {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href
                    
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            isActive 
                              ? 'bg-neutral-800 text-white' 
                              : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.icon}
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
