'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useScroll, useTransform, motion, useAnimation } from 'framer-motion'
import Image from 'next/image'
import { debounce, isLowEndDevice } from '@/lib/performance-utils'

export const ContainerScroll = ({
  titleComponent,
}: {
  titleComponent: string | React.ReactNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const isLowEnd = isLowEndDevice()
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    
    // Debounce resize event for better performance
    const handleResize = debounce(checkMobile, 100)
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Optimize scroll handling for better performance
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
    layoutEffect: false // Avoid layout thrashing
  })

  const rotate = useTransform(
    scrollYProgress, 
    [0, 1], 
    [isLowEnd ? 10 : 20, 0],
    { clamp: true }
  )
  
  const scale = useTransform(
    scrollYProgress, 
    [0, 1], 
    isMobile ? [0.7, 0.9] : [1.05, 1],
    { clamp: true }
  )
  
  const translate = useTransform(
    scrollYProgress, 
    [0, 1], 
    [0, isLowEnd ? -50 : -100],
    { clamp: true }
  )

  // Handle resize events with debounce
  useEffect(() => {
    const handleResize = debounce(() => {
      // Force refresh of animation values on significant size changes
      if (containerRef.current) {
        controls.set({ y: 0 })
        setTimeout(() => controls.start({ y: 0 }), 50)
      }
    }, 200)
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [controls])

  return (
    <div
      className="h-[80rem] flex items-center justify-center relative p-20"
      ref={containerRef}
    >
      <div
        className="py-40 w-full relative"
        style={{
          perspective: '1000px',
        }}
      >
        <Header
          translate={translate}
          titleComponent={titleComponent}
          controls={controls}
        />
        <Card
          rotate={rotate}
          translate={translate}
          scale={scale}
          controls={controls}
        />
      </div>
    </div>
  )
}

export const Header = ({ translate, titleComponent, controls }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
        willChange: 'transform' // Optimize for GPU acceleration
      }}
      className="div max-w-5xl mx-auto text-center"
      animate={controls}
    >
      {titleComponent}
    </motion.div>
  )
}

export const Card = ({
  rotate,
  scale,
  translate,
  controls
}: {
  rotate: any
  scale: any
  translate: any
  controls: any
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
      animate={controls}
      // Add hardware acceleration for better performance
      transition={{ 
        type: 'tween',
        ease: [0.25, 0.1, 0.25, 1], // Custom easing curve for smoother animation
        duration: 0.5 
      }}
      className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full p-6 bg-[#222222] rounded-[30px] shadow-2xl"
    >
      <div className="bg-gray-100 h-full w-full rounded-2xl gap-4 overflow-hidden p-4 transition-all">
        <Image
          src="/temp-banner.png"
          fill
          alt="bannerImage"
          className="object-cover border-8 rounded-2xl"
          priority
          loading="eager"
          sizes="(max-width: 768px) 100vw, 1200px"
          decoding="async"
        />
      </div>
    </motion.div>
  )
}
