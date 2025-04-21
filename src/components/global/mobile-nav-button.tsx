'use client'

import React, { useState } from 'react'
import { MenuIcon } from 'lucide-react'
import MobileNav from './mobile-nav'

const MobileNavButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)

  return (
    <>
      <button 
        onClick={handleOpen}
        className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Open menu"
      >
        <MenuIcon className="w-6 h-6" />
      </button>
      <MobileNav isOpen={isOpen} onClose={handleClose} />
    </>
  )
}

export default MobileNavButton
