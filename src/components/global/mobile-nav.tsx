'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ScrollAnimation } from '@/components/ui/scroll-animation'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/workflows', label: 'Workflows' },
    { href: '/dashboard/connections', label: 'Connections' },
    { href: '/dashboard/billing', label: 'Billing' },
    { href: '/dashboard/settings', label: 'Settings' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[200] flex flex-col"
        >
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center flex-1 gap-8">
            {navLinks.map((link, index) => (
              <ScrollAnimation
                key={link.href}
                direction="up"
                delay={0.1 * index}
                duration={0.4}
                className="w-full text-center"
              >
                <Link
                  href={link.href}
                  className="text-2xl font-medium text-white hover:text-primary transition-colors py-2 block"
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              </ScrollAnimation>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MobileNav
