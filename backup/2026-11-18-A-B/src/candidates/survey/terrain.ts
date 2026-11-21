// Shared terrain model for the Survey candidate: paper clusters raise the ground,
// gaps are flat basins between them. Used by the 3D hero and the 2D room map.

export const clusters = [
  { key: 'data', label: 'Data & corpora', x: -3.2, z: -1.4, amp: 2.3, s: 1.6 },
  { key: 'models', label: 'Models', x: 2.6, z: -2.1, amp: 2.9, s: 1.4 },
  { key: 'eval', label: 'Evaluation', x: 3.1, z: 2.6, amp: 1.7, s: 1.2 },
  { key: 'speech', label: 'Speech science', x: -3.4, z: 3.0, amp: 1.3, s: 1.1 },
] as const

export const gapSites = [
  { id: 'g1', label: 'Border-region speech', x: -0.4, z: 0.6, r: 1.3 },
  { id: 'g2', label: 'Small models at switches', x: 0.4, z: -4.4, r: 1.0 },
  { id: 'g3', label: 'Prosodic cues', x: -0.2, z: 4.3, r: 1.0 },
  { id: 'g4', label: 'Children & older speakers', x: 5.6, z: 0.2, r: 0.9 },
] as const

export function height(x: number, z: number) {
  let h = 0
  for (const c of clusters) {
    const d2 = (x - c.x) ** 2 + (z - c.z) ** 2
    h += c.amp * Math.exp(-d2 / (2 * c.s * c.s))
  }
  h += 0.18 * Math.sin(x * 1.3) * Math.cos(z * 1.1)
  for (const g of gapSites) {
    const d2 = (x - g.x) ** 2 + (z - g.z) ** 2
    h *= 1 - 0.85 * Math.exp(-d2 / (2 * g.r * g.r * 0.6))
  }
  return h
}

export const GLSL_HEIGHT = /* glsl */ `
  float heightAt(vec2 p) {
    float h = 0.0;
    ${clusters
      .map(
        (c) =>
          `h += ${c.amp.toFixed(3)} * exp(-(pow(p.x - (${c.x.toFixed(3)}), 2.0) + pow(p.y - (${c.z.toFixed(3)}), 2.0)) / ${(2 * c.s * c.s).toFixed(3)});`,
      )
      .join('\n    ')}
    h += 0.18 * sin(p.x * 1.3) * cos(p.y * 1.1);
    ${gapSites
      .map(
        (g) =>
          `h *= 1.0 - 0.85 * exp(-(pow(p.x - (${g.x.toFixed(3)}), 2.0) + pow(p.y - (${g.z.toFixed(3)}), 2.0)) / ${(2 * g.r * g.r * 0.6).toFixed(3)});`,
      )
      .join('\n    ')}
    return h;
  }
  float gapMask(vec2 p) {
    float m = 0.0;
    ${gapSites
      .map((g) => `m = max(m, 1.0 - smoothstep(${(g.r * 0.75).toFixed(3)}, ${g.r.toFixed(3)}, distance(p, vec2(${g.x.toFixed(3)}, ${g.z.toFixed(3)}))));`)
      .join('\n    ')}
    return m;
  }
`
