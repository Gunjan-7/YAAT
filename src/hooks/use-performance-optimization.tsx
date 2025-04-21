'use client'

import { useEffect, useState } from 'react'
import { createPerformanceMonitor, reportPerformanceIssues } from '@/lib/performance-monitor'
import { isLowEndDevice } from '@/lib/performance-utils'

interface PerformanceSettings {
  enableAnimations: boolean
  reducedMotion: boolean
  particleCount: number
  optimizeImages: boolean
  disableParallax: boolean
}

/**
 * Custom hook for performance optimization
 * Automatically adjusts application settings based on device capability and performance
 */
export function usePerformanceOptimization(): PerformanceSettings {
  const [settings, setSettings] = useState<PerformanceSettings>({
    enableAnimations: true,
    reducedMotion: false,
    particleCount: 100,
    optimizeImages: false,
    disableParallax: false
  })

  useEffect(() => {
    // Skip in SSR
    if (typeof window === 'undefined') return

    // Check for low-end device
    const isLowEnd = isLowEndDevice()
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    // Initialize with appropriate settings based on device capability
    setSettings({
      enableAnimations: !prefersReducedMotion,
      reducedMotion: prefersReducedMotion,
      particleCount: isLowEnd ? 30 : 100,
      optimizeImages: isLowEnd,
      disableParallax: isLowEnd || prefersReducedMotion
    })
    
    // Create performance monitor
    const monitor = createPerformanceMonitor({
      enableFPSMonitoring: true,
      enableMemoryMonitoring: true,
      sampleInterval: 2000, // Check every 2 seconds
      logToConsole: process.env.NODE_ENV !== 'production'
    })
    
    // Adjust settings based on performance metrics
    monitor.onMetrics((metrics) => {
      // Report issues in development
      if (process.env.NODE_ENV !== 'production') {
        reportPerformanceIssues(metrics)
      }
      
      // If FPS drops below threshold, reduce visual effects
      if (metrics.fps < 30) {
        setSettings(prev => ({
          ...prev,
          particleCount: Math.max(prev.particleCount - 10, 20),
          disableParallax: true
        }))
      }
      
      // If memory usage is high, reduce particle count further
      if (metrics.memory && 
          (metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit) > 0.7) {
        setSettings(prev => ({
          ...prev,
          particleCount: Math.max(prev.particleCount - 20, 10),
          optimizeImages: true
        }))
      }
    })
    
    // Handle reduced motion preference changes
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({
        ...prev,
        reducedMotion: e.matches,
        enableAnimations: !e.matches,
        disableParallax: e.matches || isLowEnd
      }))
    }
    
    motionMediaQuery.addEventListener('change', handleMotionPreferenceChange)
    
    // Clean up
    return () => {
      monitor.stop()
      motionMediaQuery.removeEventListener('change', handleMotionPreferenceChange)
    }
  }, [])
  
  return settings
}

/**
 * Hook to optimize image loading
 * @param priority Whether the image should be loaded with priority
 */
export function useOptimizedImageLoading(priority: boolean = false) {
  const { optimizeImages } = usePerformanceOptimization()
  
  return {
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quality: optimizeImages ? 80 : 90
  }
}

/**
 * Hook to optimize animations
 */
export function useOptimizedAnimations() {
  const { enableAnimations, reducedMotion, disableParallax } = usePerformanceOptimization()
  
  return {
    enableAnimations,
    reducedMotion,
    disableParallax,
    // Provide optimized animation settings
    getAnimationProps: (type: 'fade' | 'slide' | 'scale' = 'fade') => {
      if (!enableAnimations) {
        return { initial: {}, animate: {}, transition: {} }
      }
      
      // Base duration and easing
      const duration = reducedMotion ? 0.3 : 0.5
      const ease = [0.25, 0.1, 0.25, 1] // Custom easing curve
      
      // Animation presets
      switch (type) {
        case 'fade':
          return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration, ease }
          }
        case 'slide':
          return {
            initial: { opacity: 0, y: reducedMotion ? 10 : 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration, ease }
          }
        case 'scale':
          return {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration, ease }
          }
        default:
          return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration, ease }
          }
      }
    }
  }
}
