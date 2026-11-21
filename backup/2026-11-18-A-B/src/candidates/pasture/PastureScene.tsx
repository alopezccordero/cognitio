import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Billboard, Stars, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { spriteUrl } from '../../lib/Sprite'

const COLS = 44
const ROWS = 30
const FRONT = 8 // rows in front of z=0 so the field runs past the camera

function heightAt(x: number, z: number) {
  const h = 2.2 + Math.sin(x * 0.22) * 1.4 + Math.cos(z * 0.35 + x * 0.1) * 1.1 - Math.abs(x) * 0.05 - z * 0.06
  return Math.max(0.5, Math.round(h * 2) / 2)
}

function Hill() {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const count = COLS * ROWS
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    const greens = ['#2f5a4b', '#386a57', '#2a5043', '#427a63']
    let i = 0
    for (let ix = 0; ix < COLS; ix++) {
      for (let iz = 0; iz < ROWS; iz++) {
        const x = ix - COLS / 2
        const z = FRONT - iz
        const h = heightAt(x, iz - FRONT)
        m.makeScale(0.96, h, 0.96)
        m.setPosition(x, h / 2, z)
        ref.current.setMatrixAt(i, m)
        c.set(greens[(ix * 7 + iz * 3 + Math.round(h * 2)) % greens.length])
        ref.current.setColorAt(i, c)
        i++
      }
    }
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor!.needsUpdate = true
  }, [])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry />
      <meshStandardMaterial roughness={0.9} />
    </instancedMesh>
  )
}

function Grazer({ id, x, z, size = 1.6, phase = 0 }: { id: string; x: number; z: number; size?: number; phase?: number }) {
  const tex = useTexture(spriteUrl(id))
  tex.colorSpace = THREE.SRGBColorSpace
  const ref = useRef<THREE.Group>(null!)
  let top = 0
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) top = Math.max(top, heightAt(x + dx, -z + dz))
  const base = top + size / 2 - 0.05
  const aspect = tex.image ? (tex.image as HTMLImageElement).width / (tex.image as HTMLImageElement).height : 1
  useFrame(({ clock }) => {
    ref.current.position.y = base + Math.abs(Math.sin(clock.elapsedTime * 2 + phase)) * 0.12
  })
  return (
    <group ref={ref} position={[x, base, z]}>
      <Billboard lockX lockZ>
        <mesh>
          <planeGeometry args={[size * aspect, size]} />
          <meshBasicMaterial map={tex} transparent alphaTest={0.2} toneMapped={false} />
        </mesh>
      </Billboard>
    </group>
  )
}

function Rig() {
  const target = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, pointer, clock }) => {
    target.set(2 + pointer.x * 1.6 + Math.sin(clock.elapsedTime * 0.1) * 0.8, 11 + pointer.y * 0.6, 15)
    camera.position.lerp(target, 0.03)
    camera.lookAt(3, 2, -6)
  })
  return null
}

export default function PastureScene() {
  return (
    <Canvas camera={{ position: [0, 7, 15], fov: 42 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
      <color attach="background" args={['#10131f']} />
      <fog attach="fog" args={['#10131f', 18, 40]} />
      <ambientLight intensity={0.9} color="#8fa6d6" />
      <directionalLight position={[-6, 12, 6]} intensity={1.4} color="#cfe7ff" />
      <pointLight position={[6, 7, -1]} intensity={30} distance={16} color="#f6c445" />
      <Stars radius={60} depth={20} count={1400} factor={3} saturation={0} fade speed={0.4} />
      <Hill />
      <Grazer id="nib-r2c2" x={4} z={-1} size={2.2} />
      <Grazer id="tuft-r1c1" x={8} z={-3} size={2.1} phase={1.2} />
      <Grazer id="nib-r1c3" x={12} z={-7} size={1.7} phase={2} />
      <Grazer id="tuft-r2c4" x={1} z={-8} size={1.8} phase={0.6} />
      <Grazer id="nib-r1c7" x={14} z={-2} size={1.5} phase={3} />
      <Rig />
    </Canvas>
  )
}
