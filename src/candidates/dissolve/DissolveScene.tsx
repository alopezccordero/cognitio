import { useCallback, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { VoxelSprite, type VoxelTarget } from '../../lib/VoxelSprite'
import { gapSites, height } from '../survey/terrain'

const ORIGIN: [number, number, number] = [3.2, 0.6, 0]

function inGap(x: number, z: number) {
  return gapSites.some((g) => Math.hypot(x - g.x, z - g.z) < g.r * 0.85)
}

function bandColor(h: number, gap: boolean) {
  if (gap) return '#f2da4b'
  if (h > 1.9) return '#f1ebdf'
  if (h > 1.1) return '#74ddea'
  if (h > 0.45) return '#3fa7b4'
  return '#2a4a55'
}

function Camera({ progress }: { progress: MutableRefObject<number> }) {
  const p = useRef(0)
  const from = useMemo(() => new THREE.Vector3(0, 1, 12), [])
  const to = useMemo(() => new THREE.Vector3(0.4, 10.5, 9.5), [])
  const lookFrom = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const lookTo = useMemo(() => new THREE.Vector3(0.4, -1.2, -0.6), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const l = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, pointer }) => {
    p.current += (progress.current - p.current) * 0.08
    const k = THREE.MathUtils.smoothstep(p.current, 0.35, 0.95)
    v.lerpVectors(from, to, k)
    v.x += pointer.x * 0.5
    camera.position.copy(v)
    camera.lookAt(l.lerpVectors(lookFrom, lookTo, k))
  })
  return null
}

function GapLabels({ progress }: { progress: MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null!)
  const els = useRef<(HTMLSpanElement | null)[]>([])
  useFrame(() => {
    const o = THREE.MathUtils.smoothstep(progress.current, 0.9, 1)
    els.current.forEach((el) => el && (el.style.opacity = String(o)))
  })
  return (
    <group ref={g}>
      {gapSites.map((s, i) => (
        <Html key={s.id} position={[s.x * 0.9, 0.5, s.z * 0.75 - 1.2]} center zIndexRange={[4, 0]} style={{ pointerEvents: 'none' }}>
          <span
            ref={(el) => {
              els.current[i] = el
            }}
            className="block whitespace-nowrap rounded-sm bg-ds-night/80 px-2 py-0.5 font-hyper text-[13px] font-bold text-ds-mark opacity-0"
          >
            {s.label}
          </span>
        </Html>
      ))}
    </group>
  )
}

export default function DissolveScene({ progress }: { progress: MutableRefObject<number> }) {
  // Lay the voxels out on a grid over the research-area terrain from candidate B.
  const target = useCallback((i: number, n: number): VoxelTarget => {
    const cols = Math.ceil(Math.sqrt(n * 1.45))
    const rows = Math.ceil(n / cols)
    const c = i % cols
    const r = Math.floor(i / cols)
    const x = -7.2 + (14.4 * c) / (cols - 1)
    const z = -6 + (12 * r) / Math.max(1, rows - 1)
    const h = height(x, z)
    const world: [number, number, number] = [x * 0.9, h * 0.75 - 1.2, z * 0.75 - 1.2]
    return { pos: [world[0] - ORIGIN[0], world[1] - ORIGIN[1], world[2] - ORIGIN[2]], color: bandColor(h, inGap(x, z)) }
  }, [])

  return (
    <Canvas camera={{ position: [0, 1, 12], fov: 40 }} dpr={[1, 2]}>
      <color attach="background" args={['#0e121d']} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 8, 6]} intensity={1.6} />
      <VoxelSprite id="nib-r0c0" progress={progress} height={6.4} step={4} position={ORIGIN} target={target} spread={5} />
      <GapLabels progress={progress} />
      <Camera progress={progress} />
    </Canvas>
  )
}

/** Small scene for the footer: Tuft reassembles as the footer scrolls into view. */
export function Reassemble({ progress }: { progress: MutableRefObject<number> }) {
  const inverse = useRef(1)
  useFrame(() => {
    inverse.current = 1 - progress.current
  })
  return <VoxelSprite id="tuft-r2c0" progress={inverse} height={4.2} step={5} spread={4} />
}

export function ReassembleCanvas({ progress }: { progress: MutableRefObject<number> }) {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 40 }} dpr={[1, 2]}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 5, 6]} intensity={1.5} />
      <Reassemble progress={progress} />
    </Canvas>
  )
}
