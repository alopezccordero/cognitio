// Marching-squares iso-lines over a height function, returned as SVG path data.
export function isoLines(
  h: (x: number, z: number) => number,
  { W, H, nx = 140, nz = 122, levels, x0 = -8, x1 = 8, z0 = -7, z1 = 7 }: { W: number; H: number; nx?: number; nz?: number; levels: number[]; x0?: number; x1?: number; z0?: number; z1?: number },
) {
  const grid: number[][] = []
  for (let j = 0; j <= nz; j++) {
    const row: number[] = []
    for (let i = 0; i <= nx; i++) row.push(h(x0 + ((x1 - x0) * i) / nx, z0 + ((z1 - z0) * j) / nz))
    grid.push(row)
  }
  const px = (i: number) => (i / nx) * W
  const pz = (j: number) => (j / nz) * H
  return levels.map((lv) => {
    let d = ''
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], e = grid[j + 1][i]
        const pts: [number, number][] = []
        const edge = (v1: number, v2: number, xa: number, ya: number, xb: number, yb: number) => {
          if ((v1 < lv) !== (v2 < lv)) {
            const t = (lv - v1) / (v2 - v1)
            pts.push([xa + (xb - xa) * t, ya + (yb - ya) * t])
          }
        }
        edge(a, b, px(i), pz(j), px(i + 1), pz(j))
        edge(b, c, px(i + 1), pz(j), px(i + 1), pz(j + 1))
        edge(c, e, px(i + 1), pz(j + 1), px(i), pz(j + 1))
        edge(e, a, px(i), pz(j + 1), px(i), pz(j))
        for (let k = 0; k + 1 < pts.length; k += 2)
          d += `M${pts[k][0].toFixed(1)} ${pts[k][1].toFixed(1)}L${pts[k + 1][0].toFixed(1)} ${pts[k + 1][1].toFixed(1)}`
      }
    }
    return { level: lv, d }
  })
}
