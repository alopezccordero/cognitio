import { useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Billboard, Html, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { clusters, gapSites, GLSL_HEIGHT, height } from './terrain'
import { spriteUrl } from '../../lib/Sprite'

const vert = /* glsl */ `
  uniform float uLift;
  varying float vH;
  varying vec2 vP;
  ${GLSL_HEIGHT}
  void main() {
    vec2 p = vec2(position.x, -position.y);
    float h = heightAt(p);
    vH = h;
    vP = p;
    vec3 pos = position + vec3(0.0, 0.0, h * uLift);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const frag = /* glsl */ `
  varying float vH;
  varying vec2 vP;
  ${GLSL_HEIGHT}
  void main() {
    vec3 sheet = vec3(0.961, 0.976, 0.976);
    vec3 ink = vec3(0.184, 0.561, 0.616);
    vec3 dark = vec3(0.078, 0.157, 0.235);
    vec3 mark = vec3(0.949, 0.855, 0.294);

    float k = vH * 7.0;
    float f = abs(fract(k - 0.5) - 0.5) / fwidth(k);
    float line = 1.0 - min(f, 1.0);
    float idx = floor(k + 0.5);
    float major = step(4.5, mod(idx, 5.0) + 0.5) * step(0.5, idx);
    vec3 col = sheet;

    float gm = gapMask(vP);
    float hatch = step(0.82, fract((vP.x + vP.y) * 4.2));
    col = mix(col, mix(sheet, mark, 0.75), gm * 0.85);
    col = mix(col, dark, gm * hatch * 0.35);

    col = mix(col, major > 0.5 ? dark : ink, line * (major > 0.5 ? 0.9 : 0.6));

    // survey grid
    vec2 g = abs(fract(vP) - 0.5) / fwidth(vP);
    float grid = 1.0 - min(min(g.x, g.y), 1.0);
    col = mix(col, ink, grid * 0.12);

    // fade edges into the vellum
    float edge = smoothstep(7.5, 5.0, length(vP * vec2(0.85, 1.0)));
    col = mix(vec3(0.906, 0.941, 0.945), col, edge);
    gl_FragColor = vec4(col, 1.0);
  }
`

function Terrain({ lift }: { lift: MutableRefObject<number> }) {
  const mat = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ uLift: { value: 0 } }), [])
  useFrame(() => {
    mat.current.uniforms.uLift.value += (lift.current - mat.current.uniforms.uLift.value) * 0.08
  })
  return (
    <mesh rotation-x={-Math.PI / 2}>
      <planeGeometry args={[16, 14, 260, 230]} />
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} />
    </mesh>
  )
}

function Labels({ lift }: { lift: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null!)
  useFrame(() => {
    group.current.children.forEach((c) => {
      const base = c.userData.h as number
      c.position.y += (base * lift.current + 0.15 - c.position.y) * 0.08
    })
  })
  return (
    <group ref={group}>
      {clusters.map((c) => (
        <group key={c.key} position={[c.x, 0, c.z]} userData={{ h: height(c.x, c.z) }}>
          <Html center distanceFactor={9} zIndexRange={[4, 0]}>
            <span className="whitespace-nowrap rounded-sm bg-sv-sheet/90 px-1.5 py-0.5 font-brico text-[13px] font-semibold text-sv-ink">
              {c.label}
            </span>
          </Html>
        </group>
      ))}
      {gapSites.map((g) => (
        <group key={g.id} position={[g.x, 0, g.z]} userData={{ h: height(g.x, g.z) }}>
          <Html center distanceFactor={9} zIndexRange={[4, 0]}>
            <span className="whitespace-nowrap font-news text-[14px] italic text-sv-ink">Uncharted: {g.label.toLowerCase()}</span>
          </Html>
        </group>
      ))}
    </group>
  )
}

function Surveyor({ lift }: { lift: MutableRefObject<number> }) {
  const tex = useTexture(spriteUrl('tuft-r2c4'))
  tex.colorSpace = THREE.SRGBColorSpace
  const ref = useRef<THREE.Group>(null!)
  const c = clusters[1]
  const h = height(c.x + 0.4, c.z + 0.3)
  useFrame(() => {
    ref.current.position.y += (h * lift.current + 0.55 - ref.current.position.y) * 0.08
  })
  return (
    <group ref={ref} position={[c.x + 0.4, 0.5, c.z + 0.3]}>
      <Billboard>
        <mesh>
          <planeGeometry args={[1.1, 1.1]} />
          <meshBasicMaterial map={tex} transparent alphaTest={0.2} toneMapped={false} />
        </mesh>
      </Billboard>
    </group>
  )
}

function Rig({ tilt }: { tilt: MutableRefObject<number> }) {
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, pointer }) => {
    const t = tilt.current // 0 = plan view, 1 = oblique
    const angle = THREE.MathUtils.lerp(0.02, 0.95, t)
    const dist = THREE.MathUtils.lerp(15, 12.5, t)
    v.set(pointer.x * 0.6 + 1.2, Math.cos(angle) * dist, Math.sin(angle) * dist)
    camera.position.lerp(v, 0.06)
    camera.lookAt(1.2, 0, 0)
  })
  return null
}

export default function SurveyScene({ progress }: { progress: MutableRefObject<number> }) {
  const lift = useRef(0)
  const tilt = useRef(0)
  return (
    <Canvas camera={{ position: [1.2, 15, 0.3], fov: 38 }} dpr={[1, 2]}>
      <color attach="background" args={['#e7f0f1']} />
      <Driver progress={progress} lift={lift} tilt={tilt} />
      <Terrain lift={lift} />
      <Labels lift={lift} />
      <Surveyor lift={lift} />
      <Rig tilt={tilt} />
    </Canvas>
  )
}

function Driver({
  progress,
  lift,
  tilt,
}: {
  progress: MutableRefObject<number>
  lift: MutableRefObject<number>
  tilt: MutableRefObject<number>
}) {
  useFrame(() => {
    const p = progress.current
    tilt.current = Math.min(1, p * 1.4)
    lift.current = 0.05 + Math.min(1, Math.max(0, p * 1.6 - 0.1)) * 0.95
  })
  return null
}
