import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { clusters, gapSites, height } from '../survey/terrain'
import { papers } from '../../lib/sample'

// 48×30 tiles of 16px, drawn once; fog is redrawn on a second canvas as `reveal` changes.
export const TW = 48
export const TH = 30
const T = 16
export const worldToTile = (x: number, z: number) => ({ i: ((x + 8) / 16) * TW, j: ((z + 7) / 14) * TH })
const tileToWorld = (i: number, j: number) => ({ x: -8 + (16 * (i + 0.5)) / TW, z: -7 + (14 * (j + 0.5)) / TH })
export const pct = (i: number, j: number) => ({ left: `${(i / TW) * 100}%`, top: `${(j / TH) * 100}%` })

const offsets = [[0.7, 0.6], [-0.8, 0.5], [0.3, -0.9], [1.0, -0.2]]
export const towns = papers.map((p) => {
  const c = clusters.find((c) => c.key === p.cluster)!
  const nth = papers.filter((q) => q.cluster === p.cluster).indexOf(p)
  const o = offsets[nth % offsets.length]
  const t = worldToTile(c.x + o[0], c.z + o[1])
  return { paper: p, i: Math.round(t.i), j: Math.round(t.j) }
})
export const gapTiles = gapSites.map((g) => {
  const t = worldToTile(g.x, g.z)
  return { ...g, i: t.i, j: t.j }
})

function hash(i: number, j: number) {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function drawBase(ctx: CanvasRenderingContext2D) {
  const px = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c
    ctx.fillRect(x, y, w, h)
  }
  for (let j = 0; j < TH; j++) {
    for (let i = 0; i < TW; i++) {
      const { x, z } = tileToWorld(i, j)
      const X = i * T
      const Y = j * T
      const n = hash(i, j)
      const e = (x / 7.4) ** 2 + (z / 6.2) ** 2 + (n - 0.5) * 0.12
      if (e > 1) {
        px(X, Y, T, T, '#9fd3df')
        if (n > 0.7) px(X + 4, Y + 6 + ((i + j) % 3), 6, 2, '#c9ecf2')
        continue
      }
      if (e > 0.88) {
        px(X, Y, T, T, '#e8d49a')
        if (n > 0.6) px(X + 3, Y + 9, 2, 2, '#d4bd7c')
        continue
      }
      const h = height(x, z)
      if (h > 2.05) {
        px(X, Y, T, T, '#8b93a8')
        px(X + 3, Y + 3, 10, 10, '#a3abbf')
        px(X + 6, Y + 2, 4, 3, '#f3f1ea')
      } else if (h > 1.25) {
        px(X, Y, T, T, '#4f9a57')
        px(X + 2, Y + 8, 12, 6, '#5ca864')
        px(X + 5, Y + 5, 6, 4, '#6cb874')
      } else {
        px(X, Y, T, T, (i + j) % 2 ? '#7cc47e' : '#74bd77')
        if (n > 0.82 && h < 0.7) {
          // tree
          px(X + 7, Y + 10, 2, 4, '#6b4a2e')
          px(X + 3, Y + 3, 10, 8, '#3f8a49')
          px(X + 5, Y + 2, 6, 2, '#4f9a57')
        } else if (n > 0.55) {
          px(X + 4 + Math.floor(n * 6), Y + 6, 1, 3, '#63ad66')
        }
      }
    }
  }
  // paths between towns of the same cluster, then from each cluster toward the centre
  const road = (a: { i: number; j: number }, b: { i: number; j: number }) => {
    let { i, j } = a
    while (i !== b.i || j !== b.j) {
      if (Math.abs(b.i - i) > Math.abs(b.j - j)) i += Math.sign(b.i - i)
      else j += Math.sign(b.j - j)
      px(i * T + 5, j * T + 5, 6, 6, '#e8d49a')
    }
  }
  clusters.forEach((c) => {
    const ts = towns.filter((t) => t.paper.cluster === c.key)
    for (let k = 1; k < ts.length; k++) road(ts[k - 1], ts[k])
  })
  for (let k = 1; k < clusters.length; k++) {
    const a = towns.find((t) => t.paper.cluster === clusters[k - 1].key)
    const b = towns.find((t) => t.paper.cluster === clusters[k].key)
    if (a && b) road(a, b)
  }
  // towns
  towns.forEach(({ i, j }) => {
    const X = i * T
    const Y = j * T
    px(X - 4, Y + 2, 24, 14, '#1f2440')
    px(X - 2, Y + 4, 20, 10, '#f3ecdd')
    px(X - 6, Y - 4, 28, 8, '#f2605c')
    px(X - 4, Y - 6, 24, 2, '#f2605c')
    px(X + 5, Y + 8, 6, 6, '#1f2440')
    px(X, Y + 6, 3, 3, '#74ddea')
    px(X + 13, Y + 6, 3, 3, '#74ddea')
  })
}

function drawFog(ctx: CanvasRenderingContext2D, reveal: number) {
  ctx.clearRect(0, 0, TW * T, TH * T)
  const R = reveal * 5.2
  for (let j = 0; j < TH; j++) {
    for (let i = 0; i < TW; i++) {
      const { x, z } = tileToWorld(i, j)
      let d = Infinity
      for (const c of clusters) d = Math.min(d, Math.hypot(x - c.x, z - c.z))
      let clear = R - d // >0 = revealed
      for (const g of gapSites) {
        const gd = Math.hypot(x - g.x, z - g.z) / g.r
        if (gd < 1) clear = Math.min(clear, gd < 0.8 ? -1 : 0.2)
      }
      const X = i * T
      const Y = j * T
      if (clear > 0.7) continue
      // the sea is always charted; fog only hides land
      if ((x / 7.4) ** 2 + (z / 6.2) ** 2 + (hash(i, j) - 0.5) * 0.12 > 1) continue
      ctx.fillStyle = '#3a4170'
      if (clear > 0) {
        // dithered edge: checkerboard of 4px fog cells
        for (let a = 0; a < 4; a++)
          for (let b = 0; b < 4; b++) if ((a + b + i + j) % 2 === 0) ctx.fillRect(X + a * 4, Y + b * 4, 4, 4)
      } else {
        ctx.fillRect(X, Y, T, T)
        if (hash(i + 3, j) > 0.7) {
          ctx.fillStyle = '#4a5286'
          ctx.fillRect(X + 2, Y + 5, 10, 3)
          ctx.fillStyle = '#3a4170'
        }
      }
    }
  }
}

export function Overworld({ reveal, children, className = '' }: { reveal: number; children?: ReactNode; className?: string }) {
  const base = useRef<HTMLCanvasElement>(null)
  const fog = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    drawBase(base.current!.getContext('2d')!)
  }, [])
  useEffect(() => {
    drawFog(fog.current!.getContext('2d')!, reveal)
  }, [reveal])
  const style = useMemo(() => ({ imageRendering: 'pixelated' as const }), [])
  return (
    <div className={`relative aspect-[48/30] ${className}`}>
      <canvas ref={base} width={TW * T} height={TH * T} className="absolute inset-0 h-full w-full" style={style} />
      <canvas ref={fog} width={TW * T} height={TH * T} className="absolute inset-0 h-full w-full" style={style} aria-hidden />
      {children}
    </div>
  )
}

/** A pixel "?" sign floating over each fogged gap. */
export function GapMarkers({ visible = 1, labels = false }: { visible?: number; labels?: boolean }) {
  return (
    <>
      {gapTiles.map((g) => (
        <div key={g.id} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ ...pct(g.i, g.j), opacity: visible }}>
          <span className="inline-grid h-7 w-7 place-items-center border-2 border-fw-ink bg-fw-path font-pixel text-lg leading-none text-fw-ink">?</span>
          {labels && (
            <span className="mt-1 block whitespace-nowrap bg-fw-ink/85 px-1.5 py-0.5 font-pixel text-xs text-fw-path">{g.label}</span>
          )}
        </div>
      ))}
    </>
  )
}
