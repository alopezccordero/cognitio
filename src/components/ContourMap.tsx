import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { isoLines } from '../lib/contours'
import { gaps, papers, room } from '../lib/sample'
import { clusters, gapSites, height } from '../lib/terrain'

// world (-8..8, -7..7) → svg (0..W, 0..H)
const W = 1000
const H = 875
const sx = (x: number) => ((x + 8) / 16) * W
const sz = (z: number) => ((z + 7) / 14) * H
const levels = [0.25, 0.5, 0.8, 1.1, 1.45, 1.8, 2.2, 2.6]
const offsets = [[-0.6, -0.3], [0.7, 0.2], [0.1, 0.8], [-0.4, 0.9], [0.9, -0.7]]

const tone = (lv: number) => (lv > 1.9 ? '#f1ebdf' : lv > 1.1 ? '#74ddea' : lv > 0.45 ? '#3fa7b4' : '#2a4a55')

/** The research area as contour terrain: papers raise the ground, gaps are the flat yellow basins. */
export function ContourMap({ highlight, paper, labels = true, className = '' }: { highlight?: string; paper?: string; labels?: boolean; className?: string }) {
  const lines = useMemo(() => isoLines(height, { W, H, levels }), [])
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`block h-auto w-full ${className}`} role="img" aria-label={`Map of ${room.name}: ${clusters.length} clusters and ${gaps.length} gaps`}>
      <defs>
        <pattern id="ds-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#f2da4b" strokeWidth="2" opacity="0.45" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="#0e121d" />
      {lines.map((l) => (
        <path key={l.level} d={l.d} fill="none" stroke={tone(l.level)} strokeWidth={l.level > 1.9 ? 2 : 1.4} opacity={0.85} />
      ))}
      {gapSites.map((g) => {
        const on = !highlight || highlight === g.id
        return (
          <Link key={g.id} to={`/rooms/${room.id}/gaps/${g.id}`} aria-label={`Gap: ${g.label}`}>
            <g opacity={on ? 1 : 0.35}>
              <ellipse cx={sx(g.x)} cy={sz(g.z)} rx={(g.r / 16) * W * 0.9} ry={(g.r / 14) * H * 0.9} fill="url(#ds-hatch)" stroke="#f2da4b" strokeWidth={highlight === g.id ? 3 : 1.5} strokeDasharray="6 5" />
              {labels && (
                <text x={sx(g.x)} y={sz(g.z) + 6} textAnchor="middle" fontFamily="Atkinson Hyperlegible Next, system-ui" fontSize="19" fontWeight="700" fill="#f2da4b" paintOrder="stroke" stroke="#0e121d" strokeWidth="6">
                  {g.label}
                </text>
              )}
            </g>
          </Link>
        )
      })}
      {papers.map((p) => {
        const c = clusters.find((c) => c.key === p.cluster)!
        const nth = papers.filter((q) => q.cluster === p.cluster).indexOf(p)
        const o = offsets[nth % offsets.length]
        const big = paper === p.id
        const sz2 = big ? 26 : 14
        return (
          <Link key={p.id} to={`/rooms/${room.id}/papers/${p.id}`} aria-label={p.title}>
            <rect x={sx(c.x + o[0]) - sz2 / 2} y={sz(c.z + o[1]) - sz2 / 2} width={sz2} height={sz2} fill={big ? '#f1ebdf' : '#74ddea'} stroke="#0e121d" strokeWidth="3" opacity={paper && !big ? 0.45 : 1} />
          </Link>
        )
      })}
      {labels &&
        clusters.map((c) => (
          <text key={c.key} x={sx(c.x)} y={sz(c.z) - 48} textAnchor="middle" fontFamily="Bricolage Grotesque, system-ui" fontSize="22" fontWeight="700" fill="#f1ebdf" paintOrder="stroke" stroke="#0e121d" strokeWidth="7">
            {c.label}
          </text>
        ))}
    </svg>
  )
}

export function MapLegend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 font-hyper text-sm text-ds-wool/65">
      <li className="flex items-center gap-2"><span className="h-3 w-3 bg-ds-nib" /> Paper</li>
      <li className="flex items-center gap-2"><span className="h-px w-5 bg-ds-contour" /> More papers, higher ground</li>
      <li className="flex items-center gap-2"><span className="ds-hatch h-3 w-5 border border-dashed border-ds-mark" /> Gap</li>
    </ul>
  )
}
