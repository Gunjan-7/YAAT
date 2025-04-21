'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import React, { useEffect, useState, useRef } from 'react'
import { debounce, isLowEndDevice } from '@/lib/performance-utils'

export const InfiniteMovingCards = ({
  items,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
  className,
}: {
  items: {
    href: string
  }[]
  direction?: 'left' | 'right'
  speed?: 'fast' | 'normal' | 'slow'
  pauseOnHover?: boolean
  className?: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLUListElement>(null)
  const isLowEnd = isLowEndDevice()

  useEffect(() => {
    addAnimation()
    
    // Handle resize events with debounce for better performance
    const handleResize = debounce(() => {
      // Reset and re-add animation on significant size changes
      if (containerRef.current && scrollerRef.current) {
        setStart(false)
        // Clear cloned elements before re-adding
        while (scrollerRef.current.childElementCount > items.length) {
          scrollerRef.current.removeChild(scrollerRef.current.lastChild as Node)
        }
        setTimeout(() => addAnimation(), 50)
      }
    }, 200)
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [items.length])
  
  const [start, setStart] = useState(false)
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        const scrollerContent = Array.from(scrollerRef.current!.children)
        
        // Only clone if we haven't already cloned
        if (scrollerContent.length === items.length) {
          scrollerContent.forEach((item) => {
            const duplicatedItem = item.cloneNode(true)
            if (scrollerRef.current) {
              scrollerRef.current.appendChild(duplicatedItem)
            }
          })
        }
        
        getDirection()
        getSpeed()
        setStart(true)
      })
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === 'left') {
        containerRef.current.style.setProperty(
          '--animation-direction',
          'forwards'
        )
      } else {
        containerRef.current.style.setProperty(
          '--animation-direction',
          'reverse'
        )
      }
    }
  }
  const getSpeed = () => {
    if (containerRef.current) {
      // Adjust speed based on device capability
      const speedMultiplier = isLowEnd ? 1.5 : 1
      
      if (speed === 'fast') {
        containerRef.current.style.setProperty('--animation-duration', `${20 * speedMultiplier}s`)
      } else if (speed === 'normal') {
        containerRef.current.style.setProperty('--animation-duration', `${40 * speedMultiplier}s`)
      } else {
        containerRef.current.style.setProperty('--animation-duration', `${80 * speedMultiplier}s`)
      }
    }
  }
  // Remove console.log in production for better performance
  if (process.env.NODE_ENV !== 'production') {
    console.log('Infinite moving cards items:', items.length)
  }
  return (
    <div
      ref={containerRef}
      className={cn(
        'scroller relative z-20  max-w-7xl overflow-hidden  [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]',
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          'flex min-w-full shrink-0 gap-10 py-4 w-max flex-nowrap',
          start && 'animate-scroll',
          pauseOnHover && !isLowEnd && 'hover:[animation-play-state:paused]'
        )}
        style={{ willChange: 'transform' }} // Optimize for GPU acceleration
      >
        {items.map((item, idx) => (
          <Image
            width={170}
            height={1}
            src={item.href}
            alt={item.href}
            className="relative rounded-2xl object-contain opacity-50"
            key={item.href}
            loading="lazy"
            decoding="async"
          />
        ))}
      </ul>
    </div>
  )
}
