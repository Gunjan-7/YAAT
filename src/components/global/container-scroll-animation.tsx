'use client'
import React, { useRef, useEffect } from 'react'
import { useScroll, useTransform, motion, useAnimation } from 'framer-motion'
import { isLowEndDevice, debounce } from '@/lib/performance-utils'
import Image from 'next/image'

export const ContainerScroll = ({
  titleComponent,
}: {
  titleComponent: string | React.ReactNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const isLowEnd = isLowEndDevice()
  const controls = useAnimation()
  const height = 80 * 16 // Calculate height in pixels

  // Optimize scroll handling for better performance
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
    layoutEffect: false // Avoid layout thrashing
  })

  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    
    // Debounce resize event for better performance
    let resizeTimer: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(checkMobile, 100)
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
    }
  }, [])

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1]
  }

  // Reduce transform calculations on low-end devices
  const translateY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, isLowEnd ? height * 0.3 : height * 0.5],
    { clamp: true } // Clamp values for better performance
  )
  const opacity = useTransform(
    scrollYProgress, 
    [0, 0.5], 
    [1, 0],
    { clamp: true } // Clamp values for better performance
  )
  
  // Handle resize events with debounce
  useEffect(() => {
    const handleResize = debounce(() => {
      // Force refresh of animation values on significant size changes
      controls.set({ y: 0 })
      setTimeout(() => controls.start({ y: 0 }), 50)
    }, 200)
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <motion.div
      ref={containerRef}
      className="relative h-[${height}px] w-full overflow-hidden"
      style={{ willChange: 'transform' }} // Optimize for GPU acceleration
    >
      <div
        className="py-40 w-full relative"
        style={{
          perspective: '1000px',
        }}
      >
        <Header
          translateY={translateY}
          opacity={opacity}
          titleComponent={titleComponent}
        />
        <Card
          translateY={translateY}
          opacity={opacity}
          scaleDimensions={scaleDimensions()}
        />
      </div>
    </motion.div>
  )
}

export const Header = ({ translateY, opacity, titleComponent }: any) => {
  return (
    <motion.div 
      style={{ y: translateY }} 
      className="absolute inset-0"
      animate={controls}
      style={{ willChange: 'transform, opacity' }} // Optimize for GPU acceleration
    >
      <motion.div
        style={{
          opacity: opacity,
        }}
        className="div max-w-5xl mx-auto text-center"
      >
        {titleComponent}
      </motion.div>
    </motion.div>
  )
}

export const Card = ({
  rotate,
  scale,
  translate,
}: {
  rotate: any
  scale: any
  translate: any
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate, // rotate in X-axis
        scale,
        boxShadow:
          '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
        willChange: 'transform', // Optimize for GPU acceleration
      }}
      // Add hardware acceleration for better performance
      transition={{ 
        type: 'tween',
        ease: [0.25, 0.1, 0.25, 1], // Custom easing curve for smoother animation
        duration: 0.5 
      }}
      className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full p-6 bg-[#222222] rounded-[30px] shadow-2xl"
    >
      <div className="bg-gray-100 h-full w-full rounded-2xl  gap-4 overflow-hidden p-4 transition-all ">
        <Image
          src="/temp-banner.png"
          fill
          alt="bannerImage"
          className="object-cover border-8 rounded-2xl"
          priority
          loading="eager"
        />
      </div>
    </motion.div>
  )
}
