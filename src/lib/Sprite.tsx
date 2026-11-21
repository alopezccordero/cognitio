import { useEffect, useState, type CSSProperties } from 'react'

// Sprites are sliced from the two sheets into public/mascots/{nib|tuft}-r{row}c{col}.png
// nib  = flat cyan robot sheep   tuft = voxel robotic lamb
export const poses = {
  nib: {
    idle: 'nib-r0c0', happy: 'nib-r1c0', excited: 'nib-r1c1', love: 'nib-r1c2', sparkle: 'nib-r1c3',
    alert: 'nib-r1c4', question: 'nib-r1c5', flat: 'nib-r1c6', sleep: 'nib-r1c7',
    cheer: 'nib-r2c0', smile: 'nib-r2c1', wave: 'nib-r2c2', think: 'nib-r2c3', idea: 'nib-r2c4',
    shy: 'nib-r2c5', blush: 'nib-r2c6', sad: 'nib-r2c7',
    jump: 'nib-r3c3', jumpHappy: 'nib-r3c4', land: 'nib-r3c5', dash: 'nib-r3c7',
    lying: 'nib-r4c3', armsUp: 'nib-r4c5', celebrate: 'nib-r4c6', tumble: 'nib-r4c7',
  },
  tuft: {
    idle: 'tuft-r1c0', happy: 'tuft-r1c1', excited: 'tuft-r1c2', love: 'tuft-r1c3', sparkle: 'tuft-r1c4',
    flat: 'tuft-r1c5', content: 'tuft-r1c6', wink: 'tuft-r1c7',
    cheer: 'tuft-r2c0', smile: 'tuft-r2c1', wave: 'tuft-r2c2', think: 'tuft-r2c3', idea: 'tuft-r2c4',
    question: 'tuft-r2c5', blush: 'tuft-r2c6',
    jump: 'tuft-r3c3', jumpHappy: 'tuft-r3c4', land: 'tuft-r3c5', sleep: 'tuft-r3c7',
    lying: 'tuft-r4c2', armsUp: 'tuft-r4c3', celebrate: 'tuft-r4c4', hover: 'tuft-r4c7',
  },
} as const

export const sequences = {
  nibTurn: ['nib-r0c0', 'nib-r0c1', 'nib-r0c2', 'nib-r0c3', 'nib-r0c4', 'nib-r0c5', 'nib-r0c6', 'nib-r0c7'],
  tuftTurn: ['tuft-r0c0', 'tuft-r0c1', 'tuft-r0c2', 'tuft-r0c3', 'tuft-r0c4', 'tuft-r0c5', 'tuft-r0c6', 'tuft-r0c7'],
  nibRun: ['nib-r3c0', 'nib-r3c1', 'nib-r3c2', 'nib-r3c1'],
  tuftRun: ['tuft-r3c0', 'tuft-r3c1', 'tuft-r3c2', 'tuft-r3c1'],
}

export const spriteUrl = (id: string) => `/mascots/${id}.png`

type Props = { id: string; size?: number; className?: string; style?: CSSProperties; alt?: string; flip?: boolean }

export function Sprite({ id, size = 64, className = '', style, alt = '', flip }: Props) {
  return (
    <img
      src={spriteUrl(id)}
      alt={alt}
      draggable={false}
      className={`select-none object-contain ${className}`}
      style={{ width: size, height: size, transform: flip ? 'scaleX(-1)' : undefined, ...style }}
    />
  )
}

/** Loops a frame sequence. Respects reduced motion by showing the first frame. */
export function SpriteLoop({ frames, fps = 8, ...rest }: Omit<Props, 'id'> & { frames: readonly string[]; fps?: number }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((n) => (n + 1) % frames.length), 1000 / fps)
    return () => clearInterval(t)
  }, [frames, fps])
  return <Sprite id={frames[i]} {...rest} />
}

/** Preload every frame so scroll-scrubbed sequences never flash. */
export function preload(ids: readonly string[]) {
  ids.forEach((id) => {
    const img = new Image()
    img.src = spriteUrl(id)
  })
}
