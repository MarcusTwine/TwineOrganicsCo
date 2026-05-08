# Hero Video Scroll-Scrub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Apple-style pinned scroll-scrub video hero to the home page, with brand headline and tagline fading in at 60% scrub progress.

**Architecture:** A `HeroVideo` client component owns all GSAP logic. A 300vh wrapper provides scroll distance; a CSS sticky inner container keeps the video pinned while GSAP's ScrollTrigger maps scroll progress to `video.currentTime`. The video file is served as a static asset from `public/`.

**Tech Stack:** Next.js 16, React 19, GSAP 3 + ScrollTrigger, Tailwind v4, Vitest + jsdom

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `public/hero.mp4` | Create | Static video asset served by Next.js |
| `components/store/HeroVideo.tsx` | Create | Client component — GSAP scroll-scrub, video, overlay |
| `app/(store)/page.tsx` | Modify | Render `HeroVideo` above existing content |
| `tests/components/HeroVideo.test.tsx` | Create | Render tests + reduced-motion branch |

---

## Task 1: Install GSAP and copy video asset

**Files:**
- Modify: `package.json` (via npm install)
- Create: `public/hero.mp4`

- [ ] **Step 1: Install GSAP**

```bash
cd "/Users/marcus/my_documents/work/personal work/TwineOrganicsCo"
npm install gsap
```

Expected: GSAP appears in `dependencies` in `package.json`.

- [ ] **Step 2: Copy the video to public/**

```bash
cp "/Users/marcus/Downloads/Scene_starts_with_an_empty_jar_Kling_30__43092.mp4" \
   "/Users/marcus/my_documents/work/personal work/TwineOrganicsCo/public/hero.mp4"
```

Expected: `public/hero.mp4` exists.

- [ ] **Step 3: Verify the file is there**

```bash
ls -lh "/Users/marcus/my_documents/work/personal work/TwineOrganicsCo/public/hero.mp4"
```

Expected: file listed with a non-zero size.

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcus/my_documents/work/personal work/TwineOrganicsCo"
git add package.json package-lock.json public/hero.mp4
git commit -m "feat: install gsap and add hero video asset"
```

---

## Task 2: Write the failing HeroVideo component test

**Files:**
- Create: `tests/components/HeroVideo.test.tsx`

The component uses `useEffect` and the browser APIs (`matchMedia`, GSAP). We mock GSAP entirely so the unit test stays fast and deterministic. Two branches are tested: normal mode (overlay hidden initially) and reduced-motion mode (overlay visible immediately, video set to autoplay).

- [ ] **Step 1: Create the test file**

```tsx
// tests/components/HeroVideo.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock GSAP before importing the component
vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    timeline: vi.fn(() => ({
      fromTo: vi.fn().mockReturnThis(),
    })),
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    getAll: vi.fn(() => []),
  },
}))

// Import after mocks are registered
const { default: HeroVideo } = await import('@/components/store/HeroVideo')

describe('HeroVideo', () => {
  beforeEach(() => {
    // Default: no reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    })
  })

  it('renders a video element with the correct src', () => {
    render(<HeroVideo />)
    const video = document.querySelector('video')
    expect(video).toBeTruthy()
    expect(video?.getAttribute('src')).toBe('/hero.mp4')
  })

  it('renders the brand headline', () => {
    render(<HeroVideo />)
    expect(screen.getByRole('heading', { name: /twine organics/i })).toBeTruthy()
  })

  it('renders the tagline', () => {
    render(<HeroVideo />)
    expect(screen.getByText(/premium organic products, delivered to your door/i)).toBeTruthy()
  })

  it('overlay starts hidden in normal mode', () => {
    render(<HeroVideo />)
    const overlay = document.querySelector('[data-testid="hero-overlay"]')
    expect(overlay).toBeTruthy()
    expect((overlay as HTMLElement).style.opacity).toBe('0')
  })

  it('shows overlay and sets autoPlay when prefers-reduced-motion is active', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    })

    render(<HeroVideo />)
    const overlay = document.querySelector('[data-testid="hero-overlay"]') as HTMLElement
    const video = document.querySelector('video') as HTMLVideoElement

    expect(overlay.style.opacity).toBe('1')
    expect(video.autoplay).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails (component doesn't exist yet)**

```bash
cd "/Users/marcus/my_documents/work/personal work/TwineOrganicsCo"
npx vitest run tests/components/HeroVideo.test.tsx 2>&1 | tail -20
```

Expected: error like `Cannot find module '@/components/store/HeroVideo'`.

---

## Task 3: Implement the HeroVideo component

**Files:**
- Create: `components/store/HeroVideo.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/store/HeroVideo.tsx
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HeroVideo() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })

      tl.fromTo(video, { currentTime: 0 }, { currentTime: duration, ease: 'none' })
      tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.2 }, 0.6)
    }

    if (video.readyState >= 1) {
      init()
    } else {
      video.addEventListener('loadedmetadata', init, { once: true })
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
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
```

- [ ] **Step 2: Run the tests**

```bash
cd "/Users/marcus/my_documents/work/personal work/TwineOrganicsCo"
npx vitest run tests/components/HeroVideo.test.tsx 2>&1 | tail -30
```

Expected: all 5 tests pass.

- [ ] **Step 3: Commit**

```bash
cd "/Users/marcus/my_documents/work/personal work/TwineOrganicsCo"
git add components/store/HeroVideo.tsx tests/components/HeroVideo.test.tsx
git commit -m "feat: add HeroVideo scroll-scrub component"
```

---

## Task 4: Wire HeroVideo into the home page

**Files:**
- Modify: `app/(store)/page.tsx`

- [ ] **Step 1: Update the home page**

Replace the entire contents of `app/(store)/page.tsx` with:

```tsx
import type { Metadata } from 'next'
import HeroVideo from '@/components/store/HeroVideo'

export const metadata: Metadata = { title: 'Home' }

export default function HomePage() {
  return (
    <main>
      <HeroVideo />
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-green-900">Welcome to Twine Organics</h2>
        <p className="mt-4 text-lg text-gray-600">
          Premium organic products, delivered to your door.
        </p>
      </section>
    </main>
  )
}
```

Note: The existing `<h1>` becomes `<h2>` because `HeroVideo` now renders the page's `<h1>`.

- [ ] **Step 2: Run the full test suite to confirm no regressions**

```bash
cd "/Users/marcus/my_documents/work/personal work/TwineOrganicsCo"
npx vitest run 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 3: Start the dev server and visually verify**

```bash
cd "/Users/marcus/my_documents/work/personal work/TwineOrganicsCo"
npm run dev
```

Open `http://localhost:3000` in a browser. Verify:
- The video fills the viewport on load (first frame visible, no autoplay)
- Scrolling down scrubs the video forward frame-by-frame
- Headline and tagline fade in as you scroll past the 60% point
- After scrolling through the full 300vh, the page continues to the "Welcome" section below
- Nav bar remains visible above the video

- [ ] **Step 4: Commit**

```bash
cd "/Users/marcus/my_documents/work/personal work/TwineOrganicsCo"
git add app/\(store\)/page.tsx
git commit -m "feat: render HeroVideo on home page"
```
