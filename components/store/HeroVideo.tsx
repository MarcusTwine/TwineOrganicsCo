'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function HeroVideo() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const video = videoRef.current
    const wrapper = wrapperRef.current
    const overlay = overlayRef.current
    if (!video || !wrapper || !overlay) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      overlay.style.opacity = '1'
      video.autoplay = true
      video.loop = true
      video.play()
      return
    }

    const init = () => {
      const duration = video.duration

      tlRef.current = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => {
            if (overlay) {
              const fadeStart = 0.6
              const fadeEnd = 0.8
              const overlayProgress = Math.max(0, Math.min((self.progress - fadeStart) / (fadeEnd - fadeStart), 1))
              overlay.style.opacity = String(overlayProgress)
            }
          },
        },
      })

      tlRef.current.fromTo(video, { currentTime: 0 }, { currentTime: duration, ease: 'none' })
    }

    const handleMetadata = () => init()

    if (video.readyState >= 1) {
      init()
    } else {
      video.addEventListener('loadedmetadata', handleMetadata, { once: true })
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata)
      tlRef.current?.scrollTrigger?.kill()
      tlRef.current?.kill()
      tlRef.current = null
    }
  }, [])

  return (
    <div ref={wrapperRef} style={{ height: '300vh', position: 'relative' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          src="/hero.mp4"
          muted
          playsInline
          preload="auto"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          ref={overlayRef}
          data-testid="hero-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
            opacity: 0,
            color: 'white',
          }}
        >
          <h1 className="text-5xl font-bold tracking-tight">Twine Organics</h1>
          <p className="mt-4 text-xl">Premium organic products, delivered to your door.</p>
        </div>
      </div>
    </div>
  )
}
