'use client'

import React, { useEffect, useState } from 'react'
import { createPerformanceMonitor } from '@/lib/performance-monitor'
import { isLowEndDevice } from '@/lib/performance-utils'

interface PerformanceMetrics {
  fps: number
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
  timing: {
    navigationStart: number
    loadEventEnd: number
    domComplete: number
    firstPaint: number
    firstContentfulPaint: number
  }
}

export function PerformanceMonitorUI({ 
  visible = false 
}: { 
  visible?: boolean 
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLowEnd, setIsLowEnd] = useState(false)

  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') return
    
    setIsLowEnd(isLowEndDevice())
    
    const monitor = createPerformanceMonitor({
      enableFPSMonitoring: true,
      enableMemoryMonitoring: true,
      sampleInterval: 1000,
      logToConsole: false
    })
    
    monitor.onMetrics((newMetrics) => {
      setMetrics(newMetrics)
    })
    
    monitor.start()
    
    return () => {
      monitor.stop()
    }
  }, [])
  
  // Don't render anything in production or if not visible
  if (process.env.NODE_ENV !== 'development' || !visible || !metrics) {
    return null
  }
  
  // Format memory values to MB
  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }
  
  // Calculate memory usage percentage
  const memoryUsagePercent = metrics.memory 
    ? Math.round((metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit) * 100) 
    : 0
  
  // Determine FPS status
  const getFpsStatus = () => {
    if (metrics.fps >= 55) return 'text-green-500'
    if (metrics.fps >= 30) return 'text-yellow-500'
    return 'text-red-500'
  }
  
  // Determine memory status
  const getMemoryStatus = () => {
    if (memoryUsagePercent <= 50) return 'text-green-500'
    if (memoryUsagePercent <= 75) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 bg-black/80 text-white p-2 text-xs font-mono rounded-tr-md">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span>FPS:</span>
          <span className={getFpsStatus()}>{Math.round(metrics.fps)}</span>
        </div>
        
        {metrics.memory && (
          <div className="flex items-center gap-2">
            <span>Memory:</span>
            <span className={getMemoryStatus()}>
              {formatMemory(metrics.memory.usedJSHeapSize)} / {formatMemory(metrics.memory.jsHeapSizeLimit)} 
              ({memoryUsagePercent}%)
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <span>Device:</span>
          <span className={isLowEnd ? 'text-yellow-500' : 'text-green-500'}>
            {isLowEnd ? 'Low-end' : 'High-end'}
          </span>
        </div>
        
        {metrics.timing.firstContentfulPaint > 0 && (
          <div className="flex items-center gap-2">
            <span>FCP:</span>
            <span>{(metrics.timing.firstContentfulPaint / 1000).toFixed(2)}s</span>
          </div>
        )}
      </div>
    </div>
  )
}
