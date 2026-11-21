import { useEffect, useRef, type MutableRefObject } from 'react'
import { spriteUrl } from '../../lib/Sprite'
import { gapSites, height } from '../survey/terrain'

type Dot = { hx: number; hy: number; hr: number; tx: number; ty: number; tr: number; cx: number; cy: number; delay: number; layer: 0 | 1 }

const PINK = '#ff48b0'
const TEAL = '#00838a'
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * Tuft as a two-color halftone. As progress goes 0 → 1 each dot leaves the sprite
 * and lands on a halftone map of the research area (teal terrain, pink gaps).
 */
export function HalftoneTuft({ progress, sprite = 'tuft-r2c2' }: { progress: MutableRefObject<number>; sprite?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvas.current!
    const ctx = cv.getContext('2d')!
    let dots: Dot[] = []
    let raf = 0
    let smooth = 0
    const img = new Image()
    img.src = spriteUrl(sprite)

    const build = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = cv.clientWidth
      const h = cv.clientHeight
      cv.width = w * dpr
      cv.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!img.complete || !img.width) return
      // sample the sprite
      const scale = Math.min(h * 0.72, w * 0.5) / img.height
      const sw = img.width * scale
      const sh = img.height * scale
      const ox = w > 900 ? w * 0.72 - sw / 2 : w / 2 - sw / 2
      const oy = h * 0.52 - sh / 2
      const off = document.createElement('canvas')
      off.width = img.width
      off.height = img.height
      const octx = off.getContext('2d', { willReadFrequently: true })!
      octx.drawImage(img, 0, 0)
      const data = octx.getImageData(0, 0, img.width, img.height).data
      const cell = Math.max(5, Math.round(sw / 34))
      const src: { x: number; y: number; r: number; layer: 0 | 1 }[] = []
      for (let y = 0; y < sh; y += cell) {
        for (let x = 0; x < sw; x += cell) {
          const ix = Math.floor(x / scale)
          const iy = Math.floor(y / scale)
          const k = (iy * img.width + ix) * 4
          if (data[k + 3] < 120) continue
          const lum = (0.3 * data[k] + 0.59 * data[k + 1] + 0.11 * data[k + 2]) / 255
          // teal carries the body, pink carries the darks (screen, eyes, outline)
          src.push({ x: ox + x, y: oy + y, r: cell * 0.5 * (0.35 + (1 - lum) * 0.5 + 0.25), layer: 0 })
          if (lum < 0.55) src.push({ x: ox + x + 3, y: oy + y + 2, r: cell * 0.5 * (1 - lum) * 0.95, layer: 1 })
        }
      }
      // halftone map target, filling the right two-thirds of the hero
      const mx = w > 900 ? w * 0.36 : w * 0.05
      const mw = w > 900 ? w * 0.6 : w * 0.9
      const my = h * 0.16
      const mh = h * 0.74
      const n = src.length
      const cols = Math.ceil(Math.sqrt((n * mw) / mh))
      const rows = Math.ceil(n / cols)
      // map slots; pink-plate dots take the gap slots so pink on the map always means a gap
      const pitch = Math.min(mw / cols, mh / rows)
      const slots = Array.from({ length: cols * rows }, (_, k) => {
        const c = k % cols
        const r = Math.floor(k / cols)
        const wx = -8 + (16 * (c + 0.5)) / cols
        const wz = -7 + (14 * (r + 0.5)) / rows
        const inGap = gapSites.some((g) => Math.hypot(wx - g.x, wz - g.z) < g.r * 0.85)
        return { tx: mx + (mw * (c + 0.5)) / cols, ty: my + (mh * (r + 0.5)) / rows, ht: height(wx, wz), inGap, k }
      })
      const scramble = (k: number) => (k * 7919) % 104729
      const gapSlots = slots.filter((q) => q.inGap).sort((a, b) => scramble(a.k) - scramble(b.k))
      const landSlots = slots.filter((q) => !q.inGap).sort((a, b) => scramble(a.k) - scramble(b.k))
      dots = src.map((s) => {
        const pink = s.layer === 1
        const slot = (pink ? gapSlots.shift() : landSlots.shift()) ?? landSlots.shift() ?? gapSlots.shift()
        if (!slot) return null
        const tr = slot.inGap ? (pink ? pitch * 0.42 : pitch * 0.12) : pink ? 0.3 : pitch * 0.5 * Math.min(0.95, 0.12 + slot.ht * 0.32)
        return {
          hx: s.x, hy: s.y, hr: s.r, tx: slot.tx, ty: slot.ty, tr,
          cx: (s.x + slot.tx) / 2 + (Math.random() - 0.5) * w * 0.25,
          cy: Math.min(s.y, slot.ty) - h * (0.1 + Math.random() * 0.25),
          delay: ((s.x - ox) / sw) * 0.35 + Math.random() * 0.15,
          layer: s.layer,
        }
      }).filter((d): d is Dot => d !== null)
    }

    const draw = () => {
      smooth += (progress.current - smooth) * 0.12
      const w = cv.clientWidth
      const h = cv.clientHeight
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'multiply'
      for (const layer of [0, 1] as const) {
        ctx.fillStyle = layer === 0 ? TEAL : PINK
        ctx.beginPath()
        for (const d of dots) {
          if (d.layer !== layer) continue
          const t = ease(clamp01((smooth - d.delay) / 0.5))
          const u = 1 - t
          const x = u * u * d.hx + 2 * u * t * d.cx + t * t * d.tx
          const y = u * u * d.hy + 2 * u * t * d.cy + t * t * d.ty
          const r = Math.max(0.3, d.hr * u + d.tr * t)
          ctx.moveTo(x + r, y)
          ctx.arc(x, y, r, 0, Math.PI * 2)
        }
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(draw)
    }

    img.onload = build
    const ro = new ResizeObserver(build)
    ro.observe(cv)
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [progress, sprite])

  return <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />
}
