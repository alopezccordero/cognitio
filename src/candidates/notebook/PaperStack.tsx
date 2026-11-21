import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { papers } from '../../lib/sample'

const W = 3
const H = 3.9

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  const words = text.split(' ')
  let line = ''
  for (const w of words) {
    const t = line ? `${line} ${w}` : w
    if (ctx.measureText(t).width > max && line) {
      ctx.fillText(line, x, y)
      y += lh
      line = w
    } else line = t
  }
  ctx.fillText(line, x, y)
  return y + lh
}

function sheetTexture(i: number) {
  const p = papers[i]
  const c = document.createElement('canvas')
  c.width = 600
  c.height = 780
  const g = c.getContext('2d')!
  g.fillStyle = '#ffffff'
  g.fillRect(0, 0, 600, 780)
  g.fillStyle = '#1b2a4a'
  g.font = '500 20px "Schibsted Grotesk", sans-serif'
  g.fillText(`${p.venue} ${p.year}`, 44, 70)
  g.font = '700 38px "Schibsted Grotesk", sans-serif'
  let y = wrap(g, p.title, 44, 128, 512, 44)
  g.font = '400 20px "Schibsted Grotesk", sans-serif'
  g.fillStyle = '#5a6788'
  y = wrap(g, p.authors, 44, y + 6, 512, 28)
  // fake body text
  g.fillStyle = '#d5dce8'
  for (let k = 0; k < 13; k++) g.fillRect(44, y + 30 + k * 30, k % 4 === 3 ? 300 : 512, 10)
  // a highlighted line where the limitation is
  g.fillStyle = 'rgba(215,245,66,.75)'
  g.fillRect(40, y + 30 + 9 * 30 - 8, 470, 24)
  g.fillStyle = '#9aa6bf'
  g.fillRect(44, y + 30 + 9 * 30, 440, 10)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function Sheets({ progress, ready }: { progress: MutableRefObject<number>; ready: boolean }) {
  const textures = useMemo(() => (ready ? papers.map((_, i) => sheetTexture(i)) : []), [ready])
  const group = useRef<THREE.Group>(null!)
  const p = useRef(0)
  useFrame(({ pointer }) => {
    p.current += (progress.current - p.current) * 0.08
    const k = THREE.MathUtils.smoothstep(p.current, 0, 0.8)
    const n = papers.length
    group.current.children.forEach((m, i) => {
      const c = i - (n - 1) / 2
      // stacked & slightly messy → fanned like a hand of cards
      m.position.set(c * 0.03 * (1 - k) + c * 1.55 * k, -i * 0.012 * (1 - k) - Math.abs(c) * 0.25 * k, i * 0.04 * (1 - k) + k * (2 - Math.abs(c)) * 0.12)
      m.rotation.set(0, 0, (1 - k) * ((i * 37) % 9 - 4) * 0.012 + k * c * -0.09)
    })
    group.current.position.set(2.3 * (1 - k), -0.5 * k, 0)
    group.current.rotation.x = -0.12 + pointer.y * 0.05
    group.current.rotation.y = pointer.x * 0.04
  })
  return (
    <group ref={group}>
      {papers.map((_, i) => (
        <mesh key={i} castShadow>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial map={textures[i] ?? null} color={textures[i] ? '#ffffff' : '#f2f5f9'} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

export default function PaperStack({ progress }: { progress: MutableRefObject<number> }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    document.fonts.ready.then(() => setReady(true))
  }, [])
  return (
    <Canvas camera={{ position: [0, 0, 9.5], fov: 38 }} dpr={[1, 2]} gl={{ alpha: true }}>
      <ambientLight intensity={1.4} />
      <directionalLight position={[2, 3, 6]} intensity={1.4} />
      <Sheets progress={progress} ready={ready} />
    </Canvas>
  )
}
