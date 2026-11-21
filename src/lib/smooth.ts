import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled || reducedMotion()) return
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [enabled])
}

export { gsap, ScrollTrigger }
