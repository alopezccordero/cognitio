import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Billboard, Html, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { clusters, gapSites, height } from '../survey/terrain'
import { papers } from '../../lib/sample'
import { spriteUrl } from '../../lib/Sprite'

const S = 0.5 // voxel size
const NX = 34
const NZ = 30

type Col = { x: number; z: number; top: number; bottom: number; kind: 'grass' | 'hill' | 'stone' | 'pit'; gap?: string }

function buildColumns() {
  const cols: Col[] = []
  for (let i = 0; i < NX; i++) {
    for (let j = 0; j < NZ; j++) {
      const wx = -8 + (16 * (i + 0.5)) / NX
      const wz = -7 + (14 * (j + 0.5)) / NZ
      const e = (wx / 7.6) ** 2 + (wz / 6.6) ** 2
      if (e > 1) continue
      const x = (i - NX / 2) * S
      const z = (j - NZ / 2) * S
      const h = height(wx, wz)
      const top = Math.round(h * 2.2) * S + S * 2
      const bottom = -S * Math.round(2 + (1 - e) * 9 + Math.sin(i * 1.7 + j) * 1.5)
      const g = gapSites.find((g) => Math.hypot(wx - g.x, wz - g.z) < g.r * 0.9)
      if (g) cols.push({ x, z, top: top - S * 5, bottom, kind: 'pit', gap: g.id })
      else cols.push({ x, z, top, bottom, kind: h > 2.05 ? 'stone' : h > 1.25 ? 'hill' : 'grass' })
    }
  }
  return cols
}

const worldPos = (wx: number, wz: number) => {
  const i = ((wx + 8) / 16) * NX - 0.5
  const j = ((wz + 7) / 14) * NZ - 0.5
  return { x: (i - NX / 2) * S, z: (j - NZ / 2) * S, top: Math.round(height(wx, wz) * 2.2) * S + S * 2 }
}

function Island() {
  const cols = useMemo(buildColumns, [])
  const soil = useRef<THREE.InstancedMesh>(null!)
  const cap = useRef<THREE.InstancedMesh>(null!)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    cols.forEach((col, k) => {
      const h = col.top - S * 0.5 - col.bottom
      m.makeScale(S, h, S)
      m.setPosition(col.x, col.bottom + h / 2, col.z)
      soil.current.setMatrixAt(k, m)
      c.set(col.kind === 'pit' ? '#1a1d33' : (k % 3 === 0 ? '#7a4d3a' : '#8a5a44'))
      soil.current.setColorAt(k, c)
      m.makeScale(S, S * 0.5, S)
      m.setPosition(col.x, col.top - S * 0.25, col.z)
      cap.current.setMatrixAt(k, m)
      const tint = { grass: k % 2 ? '#6fbf73' : '#67b56b', hill: '#4f9a57', stone: '#c9ccd6', pit: '#22264a' }[col.kind]
      c.set(tint)
      cap.current.setColorAt(k, c)
    })
    for (const mesh of [soil.current, cap.current]) {
      mesh.instanceMatrix.needsUpdate = true
      mesh.instanceColor!.needsUpdate = true
    }
  }, [cols])
  return (
    <group>
      <instancedMesh ref={soil} args={[undefined, undefined, cols.length]}>
        <boxGeometry />
        <meshStandardMaterial roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={cap} args={[undefined, undefined, cols.length]}>
        <boxGeometry />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
    </group>
  )
}

function PitLamps() {
  return (
    <>
      {gapSites.map((g) => {
        const p = worldPos(g.x, g.z)
        const y = p.top - S * 4.5
        return (
          <group key={g.id} position={[p.x, y, p.z]}>
            <mesh>
              <boxGeometry args={[S * 0.8, S * 0.8, S * 0.8]} />
              <meshBasicMaterial color="#f6c445" toneMapped={false} />
            </mesh>
            <pointLight color="#f6c445" intensity={6} distance={3.5} />
            <Html position={[0, S * 7, 0]} center zIndexRange={[4, 0]} style={{ pointerEvents: 'none' }}>
              <span className="block whitespace-nowrap rounded-full bg-fi-ink px-2.5 py-1 font-hyper text-[12px] font-bold text-fi-lamp">{g.label}</span>
            </Html>
          </group>
        )
      })}
    </>
  )
}

function Flags() {
  return (
    <>
      {papers.map((p, k) => {
        const c = clusters.find((c) => c.key === p.cluster)!
        const o = [[0.7, 0.6], [-0.8, 0.5], [0.3, -0.9], [1.0, -0.2]][k % 4]
        const w = worldPos(c.x + o[0], c.z + o[1])
        return (
          <group key={p.id} position={[w.x, w.top, w.z]}>
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[0.05, 1, 0.05]} />
              <meshStandardMaterial color="#1c2140" />
            </mesh>
            <mesh position={[0.18, 0.85, 0]}>
              <boxGeometry args={[0.32, 0.2, 0.03]} />
              <meshStandardMaterial color="#f3ecdd" />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

function Walker({ id, wx, wz, size = 1.1, phase = 0 }: { id: string; wx: number; wz: number; size?: number; phase?: number }) {
  const tex = useTexture(spriteUrl(id))
  tex.colorSpace = THREE.SRGBColorSpace
  const g = useRef<THREE.Group>(null!)
  const w = worldPos(wx, wz)
  useFrame(({ clock }) => {
    g.current.position.y = w.top + size / 2 + Math.abs(Math.sin(clock.elapsedTime * 2.2 + phase)) * 0.08
  })
  return (
    <group ref={g} position={[w.x, w.top + size / 2, w.z]}>
      <Billboard>
        <mesh>
          <planeGeometry args={[size, size]} />
          <meshBasicMaterial map={tex} transparent alphaTest={0.2} toneMapped={false} />
        </mesh>
      </Billboard>
    </group>
  )
}

function Clouds() {
  const g = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    g.current.children.forEach((c, i) => {
      c.position.x += dt * (0.15 + i * 0.05)
      if (c.position.x > 14) c.position.x = -14
    })
  })
  return (
    <group ref={g}>
      {[[-9, 3, -6], [4, 4.5, -8], [10, 1.5, 4], [-4, -3, 5]].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh><boxGeometry args={[2.2, 0.6, 1.2]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh position={[0.5, 0.4, 0]}><boxGeometry args={[1.2, 0.5, 0.9]} /><meshStandardMaterial color="#ffffff" /></mesh>
        </group>
      ))}
    </group>
  )
}

function Rig({ progress }: { progress: MutableRefObject<number> }) {
  const p = useRef(0)
  const island = useRef<THREE.Group>(null!)
  const look = useMemo(() => new THREE.Vector3(), [])
  const pit = useMemo(() => {
    const g = gapSites[0]
    const w = worldPos(g.x, g.z)
    return new THREE.Vector3(w.x, w.top - S * 4, w.z)
  }, [])
  const far = useMemo(() => new THREE.Vector3(14, 11, 14), [])
  const near = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, clock }) => {
    p.current += (progress.current - p.current) * 0.07
    const k = THREE.MathUtils.smoothstep(p.current, 0.15, 1)
    // rotate the island a quarter turn, then lean in over the first pit
    island.current.rotation.y = -k * Math.PI * 0.5 + Math.sin(clock.elapsedTime * 0.2) * 0.03 * (1 - k)
    const pw = pit.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), island.current.rotation.y)
    near.set(pw.x + 1.2, pw.y + 6.5, pw.z + 3.2)
    camera.position.lerpVectors(far, near, THREE.MathUtils.smoothstep(p.current, 0.45, 1))
    // start aimed left of the island so it sits right of the headline
    look.set(-3.2, 0.5, 3.2).lerp(pw, THREE.MathUtils.smoothstep(p.current, 0.35, 1))
    camera.lookAt(look)
  })
  return (
    <group ref={island}>
      <Island />
      <PitLamps />
      <Flags />
      <Walker id="nib-r2c2" wx={-2.6} wz={-0.6} />
      <Walker id="tuft-r2c3" wx={2.2} wz={-1.4} phase={1} />
      <Walker id="nib-r2c4" wx={0.9} wz={0.9} size={0.9} phase={2} />
      <Walker id="tuft-r1c1" wx={3.4} wz={2.1} size={0.9} phase={0.5} />
    </group>
  )
}

export default function IslandScene({ progress }: { progress: MutableRefObject<number> }) {
  return (
    <Canvas camera={{ position: [14, 11, 14], fov: 35 }} dpr={[1, 2]} gl={{ alpha: true }}>
      <ambientLight intensity={1.0} color="#dfe6ff" />
      <directionalLight position={[8, 14, 6]} intensity={1.8} color="#fff6e5" />
      <hemisphereLight args={['#e4e9fb', '#8a5a44', 0.4]} />
      <Clouds />
      <Rig progress={progress} />
    </Canvas>
  )
}
