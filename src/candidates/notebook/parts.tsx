import type { CSSProperties, ReactNode } from 'react'
import { Sprite } from '../../lib/Sprite'

/** Graph-paper background as a style object (5mm grid, darker every 5th line). */
export const graph: CSSProperties = {
  backgroundColor: 'var(--color-nb-page)',
  backgroundImage:
    'linear-gradient(var(--color-nb-grid) 1px, transparent 1px), linear-gradient(90deg, var(--color-nb-grid) 1px, transparent 1px), linear-gradient(rgb(199 215 234 / .45) 1px, transparent 1px), linear-gradient(90deg, rgb(199 215 234 / .45) 1px, transparent 1px)',
  backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
}

/** A mascot as a die-cut vinyl sticker. */
export function Sticker({ id, size = 72, tilt = -6, className = '' }: { id: string; size?: number; tilt?: number; className?: string }) {
  return (
    <Sprite
      id={id}
      size={size}
      className={className}
      style={{
        transform: `rotate(${tilt}deg)`,
        filter:
          'drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff) drop-shadow(0 4px 5px rgb(27 42 74 / .28))',
      }}
    />
  )
}

/** Votes as tally marks: groups of four strokes and a strike. */
export function Tally({ n, color = 'var(--color-nb-pen)' }: { n: number; color?: string }) {
  const groups = Math.ceil(n / 5) || 0
  return (
    <svg width={groups * 34 || 6} height="26" viewBox={`0 0 ${groups * 34 || 6} 26`} role="img" aria-label={`${n} ${n === 1 ? 'vote' : 'votes'}`}>
      {Array.from({ length: groups }).map((_, g) => {
        const k = Math.min(5, n - g * 5)
        return (
          <g key={g} transform={`translate(${g * 34} 0)`} stroke={color} strokeWidth="2.4" strokeLinecap="round" fill="none">
            {Array.from({ length: Math.min(4, k) }).map((_, i) => (
              <path key={i} d={`M${4 + i * 6} ${4 + (i % 2)} q1 9 0 ${18 - (i % 2)}`} />
            ))}
            {k === 5 && <path d="M0 18 L28 6" />}
          </g>
        )
      })}
    </svg>
  )
}

/** A hand-drawn loop around its children, like circling something in pen. */
export function Circled({ children, color = 'var(--color-nb-red)' }: { children: ReactNode; color?: string }) {
  return (
    <span className="relative inline-block px-3 py-1">
      <svg className="pointer-events-none absolute -inset-1 h-[calc(100%+8px)] w-[calc(100%+8px)] overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
        <path d="M8 22 C 6 6, 40 2, 70 4 S 99 14, 96 24 S 60 39, 30 37 S 2 30, 12 12" fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      </svg>
      <span className="relative">{children}</span>
    </span>
  )
}

/** Highlighter stroke behind a run of text. */
export function Hi({ children }: { children: ReactNode }) {
  return <mark className="bg-[linear-gradient(100deg,transparent_2%,var(--color-nb-hi)_4%,var(--color-nb-hi)_96%,transparent_98%)] bg-[length:100%_70%] bg-bottom bg-no-repeat px-0.5 text-inherit">{children}</mark>
}

/** Each person writes in their own ink. */
export const inkOf: Record<string, string> = {
  ana: '#2f5bea',
  marcus: '#b7791f',
  priya: '#c2417a',
  diego: '#2f855a',
  you: '#6b46c1',
}
