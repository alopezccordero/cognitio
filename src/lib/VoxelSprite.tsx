import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { spriteUrl } from './Sprite'

export type VoxelTarget = { pos: [number, number, number]; color?: string }

type Props = {
  id: string
  /** 0 = whole mascot, 1 = fully dispersed (or settled on targets) */
  progress: MutableRefObject<number>
  height?: number
  step?: number
  position?: [number, number, number]
  /** where each voxel lands; without it voxels blow away like dust */
  target?: (i: number, n: number) => VoxelTarget
  spread?: number
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * Rebuilds a sprite as voxels, one per `step`×`step` block of opaque pixels,
 * then disperses them from right to left as progress goes 0 → 1.
 */
export function VoxelSprite({ id, progress, height = 6, step = 4, position = [0, 0, 0], target, spread = 6 }: Props) {
  const tex = useTexture(spriteUrl(id))
  const mesh = useRef<THREE.InstancedMesh>(null!)

  const voxels = useMemo(() => {
    const img = tex.image as HTMLImageElement
    const cv = document.createElement('canvas')
    cv.width = img.width
    cv.height = img.height
    const ctx = cv.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(img, 0, 0)
    const data = ctx.getImageData(0, 0, img.width, img.height).data
    const unit = height / img.height
    const out: { home: THREE.Vector3; color: THREE.Color; dir: THREE.Vector3; delay: number; spin: THREE.Vector3; nx: number }[] = []
    for (let y = 0; y < img.height; y += step) {
      for (let x = 0; x < img.width; x += step) {
        const k = ((y + (step >> 1)) * img.width + (x + (step >> 1))) * 4
        if (data[k + 3] < 140) continue
        const nx = x / img.width
        const home = new THREE.Vector3((x - img.width / 2) * unit, (img.height / 2 - y) * unit, 0)
        const color = new THREE.Color(`rgb(${data[k]},${data[k + 1]},${data[k + 2]})`)
        const r = () => Math.random() * 2 - 1
        const dir = new THREE.Vector3(-0.6 - Math.random() * 0.8, 0.35 + r() * 0.7, r() * 0.9).normalize()
        out.push({ home, color, dir, delay: (1 - nx) * 0.55 + Math.random() * 0.12, spin: new THREE.Vector3(r(), r(), r()), nx })
      }
    }
    return { list: out, unit: unit * step }
  }, [tex, height, step])

  const targets = useMemo(
    () =>
      target
        ? voxels.list.map((_, i) => {
            const t = target(i, voxels.list.length)
            return { pos: t.pos, color: t.color ? new THREE.Color(t.color) : null }
          })
        : null,
    [target, voxels],
  )

  useLayoutEffect(() => {
    voxels.list.forEach((v, i) => mesh.current.setColorAt(i, v.color))
    mesh.current.instanceColor!.needsUpdate = true
  }, [voxels])

  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const e = useMemo(() => new THREE.Euler(), [])
  const p = useMemo(() => new THREE.Vector3(), [])
  const mid = useMemo(() => new THREE.Vector3(), [])
  const sc = useMemo(() => new THREE.Vector3(), [])
  const tgt = useMemo(() => new THREE.Vector3(), [])
  const col = useMemo(() => new THREE.Color(), [])
  const smooth = useRef(0)

  useFrame(({ clock }) => {
    smooth.current += (progress.current - smooth.current) * 0.1
    const P = smooth.current
    const time = clock.elapsedTime
    const s = voxels.unit * 0.92
    voxels.list.forEach((v, i) => {
      const t = clamp01((P - v.delay * 0.6) / 0.45)
      if (!targets) {
        const k = ease(t)
        p.copy(v.dir).multiplyScalar(k * spread * (1 + v.spin.x * 0.3)).add(v.home)
        p.y += Math.sin(time * 0.8 + v.nx * 10) * 0.25 * k
        e.set(v.spin.x * k * 6, v.spin.y * k * 6, v.spin.z * k * 6)
        sc.setScalar(s * (1 - k * 0.85))
      } else {
        const T = targets[i]
        tgt.set(...T.pos)
        mid.copy(v.dir).multiplyScalar(spread).add(v.home)
        if (t < 0.5) {
          const k = ease(t * 2)
          p.lerpVectors(v.home, mid, k)
          e.set(v.spin.x * k * 5, v.spin.y * k * 5, v.spin.z * k * 5)
        } else {
          const k = ease((t - 0.5) * 2)
          p.lerpVectors(mid, tgt, k)
          e.set(v.spin.x * (1 - k) * 5, v.spin.y * (1 - k) * 5, v.spin.z * (1 - k) * 5)
        }
        if (T.color) {
          col.copy(v.color).lerp(T.color, clamp01((t - 0.4) * 2))
          mesh.current.setColorAt(i, col)
        }
        sc.setScalar(s)
      }
      q.setFromEuler(e)
      m.compose(p, q, sc)
      mesh.current.setMatrixAt(i, m)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (targets && mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  })

  return (
    <group position={position}>
      <instancedMesh ref={mesh} args={[undefined, undefined, voxels.list.length]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial roughness={0.75} />
      </instancedMesh>
    </group>
  )
}
