# Hero Video Scroll-Scrub — Design Spec

**Date:** 2026-05-08
**Status:** Approved

## Overview

Add an Apple-style pinned scroll-scrub hero to the home page. The video advances frame-by-frame as the user scrolls, locked in place until the full scrub completes, then releases to reveal the rest of the page. Brand headline and tagline fade in at 60% scrub progress.

## Files Changed

| File | Action |
|------|--------|
| `public/hero.mp4` | Add — copy of `Scene_starts_with_an_empty_jar_Kling_30__43092.mp4` |
| `components/store/HeroVideo.tsx` | Create — client component, owns GSAP logic |
| `app/(store)/page.tsx` | Update — import and render `HeroVideo` above existing content |
| `package.json` | Update — add `gsap` dependency |

## Component: `HeroVideo`

`'use client'` component. Uses `useRef` to hold refs to the scroll wrapper, sticky container, video element, and overlay text. Registers a GSAP ScrollTrigger on mount, cleans up on unmount.

### Scroll mechanics

- Outer wrapper: `position: relative; height: 300vh` — provides the scroll distance that drives the scrub.
- Inner container: `position: sticky; top: 0; height: 100vh; overflow: hidden` — pins the video in the viewport.
- GSAP `ScrollTrigger` with `scrub: true` on the wrapper maps scroll progress (0→1) to `video.currentTime` (0→video.duration).
- On scrub complete (progress = 1), the pin releases naturally as the wrapper scrolls out of view.

### Overlay

- Full-bleed dark gradient: `background: linear-gradient(to top, rgba(0,0,0,0.6), transparent)` — always visible for legibility.
- Headline `"Twine Organics"` and tagline `"Premium organic products, delivered to your door."` centered over the video.
- Both elements start at `opacity: 0`. GSAP `ScrollTrigger` updates their opacity: transition starts at 60% scrub progress, completes at 80%.

### Video element

- `src="/hero.mp4"`
- `autoPlay={false}`, `muted`, `playsInline`, `preload="auto"`
- `object-fit: cover`, `width: 100%`, `height: 100%`
- `currentTime` driven entirely by scroll — video never self-plays.

## Accessibility

Check `window.matchMedia('(prefers-reduced-motion: reduce)')` on mount. If true, skip GSAP entirely: let the video autoplay looped at normal speed, show overlay text immediately at full opacity, and do not pin the section.

## Constraints

- GSAP free tier covers this use case (no commercial ScrollTrigger Club license required for basic scrubbing).
- Video must be placed in `public/` — no dynamic import or server-side streaming needed.
- No changes to `Header.tsx` — the nav sits above the hero as normal.
