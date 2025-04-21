'use client'

import React, { useEffect, useState, useRef } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import type { Container, Engine } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
import { cn } from '@/lib/utils'
import { motion, useAnimation } from 'framer-motion'
import { debounce, isLowEndDevice, getOptimizedAnimationSettings } from '@/lib/performance-utils'

type ParticlesProps = {
  id?: string
  className?: string
  background?: string
  minSize?: number
  maxSize?: number
  speed?: number
  particleColor?: string
  particleDensity?: number
}

export const SparklesCore = (props: ParticlesProps) => {
  const {
    id = 'tsparticles',
    className,
    background,
    minSize = 1,
    maxSize = 3,
    speed = 4,
    particleColor = '#ffffff',
    particleDensity = 60,
  } = props
  
  const [init, setInit] = useState(false)
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)
  const animSettings = getOptimizedAnimationSettings()
  
  // Initialize particles engine once
  useEffect(() => {
    let isMounted = true;
    
    const initEngine = async () => {
      try {
        await initParticlesEngine(async (engine: Engine) => {
          await loadSlim(engine)
        })
        if (isMounted) setInit(true)
      } catch (error) {
        console.error('Failed to initialize particles engine:', error)
        // Fallback to no particles if initialization fails
        if (isMounted) setInit(true)
      }
    }
    
    // Use requestIdleCallback for non-critical initialization if available
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(initEngine)
    } else {
      // Fallback to setTimeout with a small delay
      setTimeout(initEngine, 100)
    }
    
    return () => {
      isMounted = false;
    }
  }, [])
  
  // Handle resize events
  useEffect(() => {
    const handleResize = debounce(() => {
      if (containerRef.current) {
        // Only refresh on significant size changes
        const width = containerRef.current.offsetWidth
        const height = containerRef.current.offsetHeight
        
        if (width > 0 && height > 0) {
          // This triggers a refresh without full re-initialization
          setInit(false)
          setTimeout(() => setInit(true), 50)
        }
      }
    }, 200) // 200ms debounce
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  // Callback when particles are loaded
  const particlesLoaded = async (container?: Container) => {
    if (container) {
      // Avoid logging in production
      if (process.env.NODE_ENV !== 'production') {
        console.log('Particles container loaded')
      }
      
      controls.start({
        opacity: 1,
        transition: {
          duration: animSettings.animationDuration * 2,
        },
      })
    }
  }
  
  // Optimize particle options based on device capability
  const options = {
    background: {
      color: {
        value: background || 'transparent',
      },
    },
    fullScreen: {
      enable: false,
      zIndex: 1,
    },
    fpsLimit: isLowEndDevice() ? 30 : 60,
    particles: {
      number: {
        value: isLowEndDevice() ? Math.min(20, particleDensity) : particleDensity,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: particleColor,
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: { min: 0.1, max: 1 },
        animation: {
          enable: true,
          speed: isLowEndDevice() ? speed / 2 : speed,
          sync: false,
        },
      },
      size: {
        value: { 
          min: isLowEndDevice() ? Math.max(0.5, minSize / 2) : minSize, 
          max: isLowEndDevice() ? Math.max(1.5, maxSize / 2) : maxSize 
        },
        animation: {
          enable: true,
          speed: isLowEndDevice() ? 1 : 2,
          sync: false,
        },
      },
      move: {
        enable: true,
        direction: 'none',
        random: true,
        speed: isLowEndDevice() ? 0.5 : 1,
        straight: false,
        outModes: {
          default: 'out',
        },
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: !isLowEndDevice(),
          mode: 'repulse',
        },
        onClick: {
          enable: true,
          mode: 'push',
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 200,
          duration: 0.4,
        },
        push: {
          quantity: isLowEndDevice() ? 2 : 4,
        },
      },
    },
    detectRetina: true,
  }
  
  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'absolute inset-0 z-20 overflow-hidden',
        className
      )}
      initial={{ opacity: 0 }}
      animate={controls}
    >
      {init && (
        <Particles
          id={id}
          className={cn('h-full w-full')}
          particlesLoaded={particlesLoaded}
          options={options}
        />
      )}
    </motion.div>
  )
}
