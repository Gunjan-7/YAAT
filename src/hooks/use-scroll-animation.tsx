'use client'

import { useEffect, useRef, useState } from 'react'
import { throttle } from '@/lib/scroll-utils'

interface ScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

/**
 * Custom hook for triggering animations when elements enter the viewport
 */
export function useScrollAnimation({
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
}: ScrollAnimationOptions = {}) {
  const ref = useRef<HTMLElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const currentRef = ref.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      throttle((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            if (once) {
              observer.unobserve(currentRef)
            }
          } else if (!once) {
            setIsInView(false)
          }
        })
      }, 100),
      { threshold, rootMargin }
    )

    observer.observe(currentRef)

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold, rootMargin, once])

  return { ref, isInView }
}

/**
 * Custom hook for parallax scroll effects
 */
export function useParallaxScroll(speed: number = 0.5) {
  const ref = useRef<HTMLElement | null>(null)
  
  useEffect(() => {
    const currentRef = ref.current
    if (!currentRef) return
    
    const handleScroll = throttle(() => {
      if (!currentRef) return
      
      const scrollY = window.scrollY
      const elementTop = currentRef.getBoundingClientRect().top + scrollY
      const viewportBottom = scrollY + window.innerHeight
      
      // Only apply parallax when element is in or near viewport
      if (elementTop < viewportBottom + 300 && elementTop + currentRef.offsetHeight > scrollY - 300) {
        const offset = (scrollY - (elementTop - window.innerHeight)) * speed
        currentRef.style.transform = `translateY(${offset}px)`
      }
    }, 10)
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial position
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [speed])
  
  return ref
}

/**
 * Custom hook for smooth scroll reveal animations
 */
export function useSmoothReveal(
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  options: ScrollAnimationOptions = {}
) {
  const { ref, isInView } = useScrollAnimation(options)
  
  const getInitialStyles = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, transform: 'translateY(40px)' }
      case 'down':
        return { opacity: 0, transform: 'translateY(-40px)' }
      case 'left':
        return { opacity: 0, transform: 'translateX(40px)' }
      case 'right':
        return { opacity: 0, transform: 'translateX(-40px)' }
    }
  }
  
  const getVisibleStyles = () => {
    return { 
      opacity: 1, 
      transform: 'translate(0, 0)',
      transition: 'opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)'
    }
  }
  
  const style = isInView ? { ...getInitialStyles(), ...getVisibleStyles() } : getInitialStyles()
  
  return { ref, style, isInView }
}
