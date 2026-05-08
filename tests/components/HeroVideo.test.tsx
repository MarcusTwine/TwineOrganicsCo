import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'

// Mock GSAP before importing the component
vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    timeline: vi.fn(() => ({
      fromTo: vi.fn().mockReturnThis(),
      to: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      play: vi.fn().mockReturnThis(),
      pause: vi.fn().mockReturnThis(),
      kill: vi.fn().mockReturnThis(),
    })),
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    getAll: vi.fn(() => [{ kill: vi.fn() }]),
    kill: vi.fn(),
    refresh: vi.fn(),
  },
}))

import HeroVideo from '@/components/store/HeroVideo'

describe('HeroVideo', () => {
  beforeEach(() => {
    // Default: no reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('renders a video element with the correct src', async () => {
    await act(async () => {
      render(<HeroVideo />)
    })
    const video = document.querySelector('video')
    expect(video).not.toBeNull()
    expect(video?.getAttribute('src')).toBe('/hero.mp4')
  })

  it('renders the brand headline', async () => {
    await act(async () => {
      render(<HeroVideo />)
    })
    expect(screen.getByRole('heading', { name: /twine organics/i })).toBeInTheDocument()
  })

  it('renders the tagline', async () => {
    await act(async () => {
      render(<HeroVideo />)
    })
    expect(screen.getByText(/premium organic products, delivered to your door/i)).toBeInTheDocument()
  })

  it('overlay starts hidden in normal mode', async () => {
    await act(async () => {
      render(<HeroVideo />)
    })
    const overlay = document.querySelector('[data-testid="hero-overlay"]')
    expect(overlay).not.toBeNull()
    expect((overlay as HTMLElement).style.opacity).toBe('0')
  })

  it('shows overlay and sets autoPlay when prefers-reduced-motion is active', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    await act(async () => {
      render(<HeroVideo />)
    })
    const overlay = document.querySelector('[data-testid="hero-overlay"]') as HTMLElement
    const video = document.querySelector('video') as HTMLVideoElement

    expect(overlay.style.opacity).toBe('1')
    expect(video.autoplay).toBe(true)
  })
})
