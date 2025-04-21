'use client'
import type { NextPage } from 'next'
import React from 'react'
import { useEffect, useState, useRef } from 'react'
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
  particleSize?: number
  minSize?: number
  maxSize?: number
  speed?: number
  particleColor?: string
  particleDensity?: number
}

export const SparklesCore = (props: ParticlesProps) => {
  const {
    id,
    className,
    background,
    minSize,
    maxSize,
    speed,
    particleColor,
    particleDensity,
  } = props
  const [init, setInit] = useState(false)
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)
  const animationSettings = getOptimizedAnimationSettings()

  useEffect(() => {
    const initEngine = async () => {
      try {
        await initParticlesEngine(async (engine: Engine) => {
          await loadSlim(engine)
        })
        setInit(true)
      } catch (error) {
        console.error('Failed to initialize particles engine:', error)
        // Fallback to no particles if initialization fails
        setInit(true)
      }
    }

    initEngine()
  }, [])

  // Use requestIdleCallback for non-critical initialization
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      // Lazy load particles only when component is visible
      const loadParticles = () => {
        initParticlesEngine(async (engine) => {
          await loadSlim(engine)
        }).then(() => {
          setInit(true)
        })
      }

      loadParticles()
    })
  } else {
    setTimeout(() => {
      // Lazy load particles only when component is visible
      const loadParticles = () => {
        initParticlesEngine(async (engine) => {
          await loadSlim(engine)
        }).then(() => {
          setInit(true)
        })
      }

      loadParticles()
    }, 100)
  }

  // Use effect for cleanup
  useEffect(() => {
    // Handle resize events with debounce for better performance
    const handleResize = debounce(() => {
      if (containerRef.current) {
        // Force a re-render of particles on significant size changes
        const width = containerRef.current.offsetWidth
        const height = containerRef.current.offsetHeight

        // Update container if needed
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

  const particlesLoaded = async (container?: Container) => {
    if (container) {
      // Avoid logging to console in production for performance
      if (process.env.NODE_ENV !== 'production') {
        console.log('Particles container loaded')
      }

      controls.start({
        opacity: 1,
        transition: {
          duration: animationSettings.animationDuration * 2,
        },
      })
    }
  }

  // Optimize particle options based on device capability
  const options: any = {
    background: {
      color: {
        value: background || '#0d47a1',
      },
    },
    fullScreen: {
      enable: false,
      zIndex: 1,
    },

    particles: {
      number: {
        // Reduce particle count on low-end devices
        value: isLowEndDevice() ? Math.min(30, particleDensity || 60) : particleDensity || 60,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: particleColor || '#ffffff',
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: { min: 0.1, max: 1 },
        animation: {
          enable: true,
          // Slower animation speed on low-end devices
          speed: isLowEndDevice() ? 0.5 : speed || 4,
          sync: false,
        },
      },
      size: {
        // Smaller particles on low-end devices
        value: { min: isLowEndDevice() ? 0.5 : minSize || 1, max: isLowEndDevice() ? 2 : maxSize || 3 },
        animation: {
          enable: true,
          // Slower animation speed on low-end devices
          speed: isLowEndDevice() ? 1 : 2,
          sync: false,
        },
      },
      move: {
        enable: true,
        direction: 'none',
        random: true,
        // Slower movement on low-end devices
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
          // Disable hover effects on low-end devices
          enable: !isLowEndDevice(),
          mode: 'repulse',
        },
        onClick: {
          enable: true,
          mode: 'push',
        },
      },
      modes: {
        grab: {
          distance: 400,
          links: {
            opacity: 1,
          },
        },
        bubble: {
          distance: 400,
          size: 40,
          duration: 2,
          opacity: 0.8,
        },
        repulse: {
          distance: 200,
        },
        push: {
          // Reduce particles added on click for low-end devices
          quantity: isLowEndDevice() ? 2 : 4,
        },
        remove: {
          quantity: 2,
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
          id={id || 'tsparticles'}
          className={cn('h-full w-full')}
          particlesLoaded={particlesLoaded}
          options={options}
        />
      )}
    </motion.div>
  )
}
                  offset: 0,
                  value: 90,
                },
                attract: {
                  distance: 200,
                  enable: false,
                  rotate: {
                    x: 3000,
                    y: 3000,
                  },
                },
                center: {
                  x: 50,
                  y: 50,
                  mode: 'percent',
                  radius: 0,
                },
                decay: 0,
                distance: {},
                direction: 'none',
                drift: 0,
                enable: true,
                gravity: {
                  acceleration: 9.81,
                  enable: false,
                  inverse: false,
                  maxSpeed: 50,
                },
                path: {
                  clamp: true,
                  delay: {
                    value: 0,
                  },
                  enable: false,
                  options: {},
                },
                outModes: {
                  default: 'out',
                },
                random: false,
                size: false,
                speed: {
                  min: 0.1,
                  max: 1,
                },
                spin: {
                  acceleration: 0,
                  enable: false,
                },
                straight: false,
                trail: {
                  enable: false,
                  length: 10,
                  fill: {},
                },
                vibrate: false,
                warp: false,
              },
              number: {
                density: {
                  enable: true,
                  width: 400,
                  height: 400,
                },
                limit: {
                  mode: 'delete',
                  value: 0,
                },
                value: particleDensity || 60, // Reduced particle count for better performance
              },
              opacity: {
                value: {
                  min: 0.1,
                  max: 1,
                },
                animation: {
                  count: 0,
                  enable: true,
                  speed: speed || 4,
                  decay: 0,
                  delay: 2,
                  sync: false,
                  mode: 'auto',
                  startValue: 'random',
                  destroy: 'none',
                },
              },
              reduceDuplicates: false,
              shadow: {
                blur: 0,
                color: {
                  value: '#000',
                },
                enable: false,
                offset: {
                  x: 0,
                  y: 0,
                },
              },
              shape: {
                close: true,
                fill: true,
                options: {},
                type: 'circle',
              },
              size: {
                value: {
                  min: minSize || 1,
                  max: maxSize || 3,
                },
                animation: {
                  count: 0,
                  enable: false,
                  speed: 5,
                  decay: 0,
                  delay: 0,
                  sync: false,
                  mode: 'auto',
                  startValue: 'random',
                  destroy: 'none',
                },
              },
              stroke: {
                width: 0,
              },
              zIndex: {
                value: 0,
                opacityRate: 1,
                sizeRate: 1,
                velocityRate: 1,
              },
              destroy: {
                bounds: {},
                mode: 'none',
                split: {
                  count: 1,
                  factor: {
                    value: 3,
                  },
                  rate: {
                    value: {
                      min: 4,
                      max: 9,
                    },
                  },
                  sizeOffset: true,
                },
              },
              roll: {
                darken: {
                  enable: false,
                  value: 0,
                },
                enable: false,
                enlighten: {
                  enable: false,
                  value: 0,
                },
                mode: 'vertical',
                speed: 25,
              },
              tilt: {
                value: 0,
                animation: {
                  enable: false,
                  speed: 0,
                  decay: 0,
                  sync: false,
                },
                direction: 'clockwise',
                enable: false,
              },
              twinkle: {
                lines: {
                  enable: false,
                  frequency: 0.05,
                  opacity: 1,
                },
                particles: {
                  enable: false,
                  frequency: 0.05,
                  opacity: 1,
                },
              },
              wobble: {
                distance: 5,
                enable: false,
                speed: {
                  angle: 50,
                  move: 10,
                },
              },
              life: {
                count: 0,
                delay: {
                  value: 0,
                  sync: false,
                },
                duration: {
                  value: 0,
                  sync: false,
                },
              },
              rotate: {
                value: 0,
                animation: {
                  enable: false,
                  speed: 0,
                  decay: 0,
                  sync: false,
                },
                direction: 'clockwise',
                path: false,
              },
              orbit: {
                animation: {
                  count: 0,
                  enable: false,
                  speed: 1,
                  decay: 0,
                  delay: 0,
                  sync: false,
                },
                enable: false,
                opacity: 1,
                rotation: {
                  value: 45,
                },
                width: 1,
              },
              links: {
                blink: false,
                color: {
                  value: '#fff',
                },
                consent: false,
                distance: 100,
                enable: false,
                frequency: 1,
                opacity: 1,
                shadow: {
                  blur: 5,
                  color: {
                    value: '#000',
                  },
                  enable: false,
                },
                triangles: {
                  enable: false,
                  frequency: 1,
                },
                width: 1,
                warp: false,
              },
              repulse: {
                value: 0,
                enabled: false,
                distance: 1,
                duration: 1,
                factor: 1,
                speed: 1,
              },
            },
            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  )
}
