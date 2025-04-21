'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'

type ScrollAnimationProps = {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
  delay?: number
  className?: string
  threshold?: number
  once?: boolean
}

export const ScrollAnimation = ({
  children,
  direction = 'up',
  duration = 0.5,
  delay = 0,
  className = '',
  threshold = 0.2,
  once = true,
}: ScrollAnimationProps) => {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    amount: threshold,
    once
  })
  
  // Calculate initial and animate values based on direction
  const getDirectionValues = () => {
    switch (direction) {
      case 'up':
        return { initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      case 'down':
        return { initial: { y: -40, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      case 'left':
        return { initial: { x: 40, opacity: 0 }, animate: { x: 0, opacity: 1 } }
      case 'right':
        return { initial: { x: -40, opacity: 0 }, animate: { x: 0, opacity: 1 } }
      default:
        return { initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 } }
    }
  }

  const { initial, animate } = getDirectionValues()

  useEffect(() => {
    if (isInView) {
      controls.start(animate)
    } else if (!once) {
      controls.start(initial)
    }
  }, [isInView, controls, animate, initial, once])

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={controls}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // Custom easing curve for smoother animation
        type: 'tween', // Use tween for hardware acceleration
      }}
      className={className}
      style={{ willChange: 'transform, opacity' }} // Optimize for GPU acceleration
    >
      {children}
    </motion.div>
  )
}

// For wrapping multiple items with staggered animations
export const ScrollAnimationGroup = ({
  children,
  direction = 'up',
  staggerDelay = 0.1,
  duration = 0.5,
  initialDelay = 0,
  className = '',
  threshold = 0.1,
  once = true,
}: ScrollAnimationProps & { staggerDelay?: number }) => {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    amount: threshold,
    once
  })
  
  // Calculate initial and animate values based on direction
  const getDirectionValues = () => {
    switch (direction) {
      case 'up':
        return { initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      case 'down':
        return { initial: { y: -40, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      case 'left':
        return { initial: { x: 40, opacity: 0 }, animate: { x: 0, opacity: 1 } }
      case 'right':
        return { initial: { x: -40, opacity: 0 }, animate: { x: 0, opacity: 1 } }
      default:
        return { initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 } }
    }
  }

  const { initial, animate } = getDirectionValues()

  useEffect(() => {
    if (isInView) {
      controls.start(i => ({
        ...animate,
        transition: {
          duration,
          delay: initialDelay + i * staggerDelay,
          ease: [0.25, 0.1, 0.25, 1],
          type: 'tween',
        }
      }))
    } else if (!once) {
      controls.start(initial)
    }
  }, [isInView, controls, animate, initial, staggerDelay, duration, initialDelay, once])

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, i) => (
        <motion.div
          custom={i}
          initial={initial}
          animate={controls}
          style={{ willChange: 'transform, opacity' }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
