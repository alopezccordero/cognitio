import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, reducedMotion } from '../../lib/smooth'
import { byId, chat, gaps as allGaps, members, papers, room, type Paper } from '../../lib/sample'
import { poses, Sprite } from '../../lib/Sprite'
import { clusters, gapSites, height } from './terrain'
import { modeFor, SurveyMode, useSurvey } from './theme'

// map world (-8..8, -7..7) → svg (0..1000, 0..875)
const W = 1000
const H = 875
const sx = (x: number) => ((x + 8) / 16) * W
const sz = (z: number) => ((z + 7) / 14) * H

function contours() {
  const nx = 140
  const nz = 122
  const grid: number[][] = []
  for (let j = 0; j <= nz; j++) {
    const row: number[] = []
    for (let i = 0; i <= nx; i++) row.push(height(-8 + (16 * i) / nx, -7 + (14 * j) / nz))
    grid.push(row)
  }
  const px = (i: number) => (i / nx) * W
  const pz = (j: number) => (j / nz) * H
  const levels: { d: string; major: boolean }[] = []
  for (let L = 1; L <= 20; L++) {
    const lv = L / 7
    let d = ''
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], e = grid[j + 1][i]
        const pts: [number, number][] = []
        const edge = (v1: number, v2: number, x1: number, y1: number, x2: number, y2: number) => {
          if ((v1 < lv) !== (v2 < lv)) {
            const t = (lv - v1) / (v2 - v1)
            pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t])
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
    if (d) levels.push({ d, major: L % 5 === 0 })
  }
  return levels
}

// place each paper near its cluster's summit
const offsets = [[0.6, 0.5], [-0.7, 0.4], [0.2, -0.8], [0.9, -0.3]]
function pinFor(p: Paper) {
  const c = clusters.find((c) => c.key === p.cluster)!
  const nth = papers.filter((q) => q.cluster === p.cluster).indexOf(p)
  const o = offsets[nth % offsets.length]
  return { x: sx(c.x + o[0]), y: sz(c.z + o[1]) }
}

function SurveyMap({ selected, onSelect }: { selected: string | null; onSelect: (id: string | null) => void }) {
  const lines = useMemo(contours, [])
  const root = useRef<SVGSVGElement>(null)
  const pins = useMemo(() => papers.map((p) => ({ p, ...pinFor(p) })), [])
  const locate = (id?: string) => {
    if (!id) return { x: sx(6.4), y: sz(5.6) }
    if (id.startsWith('p')) {
      const pin = pins.find((q) => q.p.id === id)!
      return { x: pin.x + 14, y: pin.y + 10 }
    }
    const g = gapSites.find((g) => g.id === id)!
    return { x: sx(g.x) + 30, y: sz(g.z) + 20 }
  }

  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.utils.toArray<SVGGElement>('.sv-cursor').forEach((el, i) => {
        gsap.to(el, { x: `+=${8 + i * 3}`, y: `+=${5 + i * 2}`, duration: 2 + i * 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      })
    },
    { scope: root },
  )

  return (
    <svg ref={root} viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="Map of the research area">
      <defs>
        <pattern id="sv-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="8" height="8" fill="#f2da4b" fillOpacity="var(--sv-hatch-a, 0.7)" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="var(--color-sv-ink)" strokeOpacity="0.35" strokeWidth="1.2" />
        </pattern>
        <pattern id="sv-grid" width="62.5" height="62.5" patternUnits="userSpaceOnUse">
          <path d="M62.5 0H0V62.5" fill="none" stroke="var(--color-sv-contour)" strokeOpacity="0.12" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="var(--color-sv-sheet)" />
      <rect width={W} height={H} fill="url(#sv-grid)" />
      {gapSites.map((g) => {
        const gap = byId(allGaps, g.id)
        return (
          <g key={g.id}>
            <ellipse cx={sx(g.x)} cy={sz(g.z)} rx={(g.r / 16) * W} ry={(g.r / 14) * H} fill="url(#sv-hatch)" stroke="var(--color-sv-ink)" strokeWidth="1.5" strokeDasharray={gap.stated ? undefined : '6 5'} />
            <text x={sx(g.x)} y={sz(g.z) - 6} textAnchor="middle" className="font-news" fontStyle="italic" fontSize="17" fill="var(--color-sv-ink)">
              {g.label}
            </text>
            <text x={sx(g.x)} y={sz(g.z) + 18} textAnchor="middle" className="font-brico" fontWeight="700" fontSize="15" fill="var(--color-sv-ink)">
              {gap.votes.length} {gap.votes.length === 1 ? "vote" : "votes"}
            </text>
          </g>
        )
      })}
      {lines.map((l, i) => (
        <path key={i} d={l.d} fill="none" stroke={l.major ? 'var(--color-sv-ink)' : 'var(--color-sv-contour)'} strokeOpacity={l.major ? 0.85 : 0.55} strokeWidth={l.major ? 1.6 : 1} />
      ))}
      {clusters.map((c) => (
        <text key={c.key} x={sx(c.x)} y={sz(c.z) - 46} textAnchor="middle" className="font-brico" fontSize="20" fontWeight="700" fill="var(--color-sv-ink)" paintOrder="stroke" stroke="var(--color-sv-sheet)" strokeWidth="6">
          {c.label}
        </text>
      ))}
      {pins.map(({ p, x, y }) => {
        const on = selected === p.id
        return (
          <g
            key={p.id}
            role="button"
            tabIndex={0}
            aria-label={`${p.title}, ${p.year}`}
            aria-pressed={on}
            onClick={() => onSelect(on ? null : p.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(on ? null : p.id)}
            className="cursor-pointer focus:outline-none"
          >
            <path d={`M${x} ${y}l-7 -16a9 9 0 1 1 14 0z`} fill={on ? '#f2da4b' : 'var(--color-sv-ink)'} stroke="var(--color-sv-ink)" strokeWidth="1.5" />
            <circle cx={x} cy={y - 20} r="3" fill={on ? 'var(--color-sv-ink)' : 'var(--color-sv-sheet)'} />
            <text x={x + 12} y={y - 14} className="font-brico" fontSize="13" fontWeight="600" fill="var(--color-sv-ink)" paintOrder="stroke" stroke="var(--color-sv-sheet)" strokeWidth="4">
              {p.authors.split(',')[0]} {p.year}
            </text>
          </g>
        )
      })}
      {members
        .filter((m) => m.id !== 'you' && m.status !== 'idle')
        .map((m) => {
          const { x, y } = locate(m.where)
          return (
            <g key={m.id} className="sv-cursor" transform={`translate(${x} ${y})`}>
              <path d="M0 0l0 18l5-5l4 9l3-1.5l-4-8.5l7 0z" fill={m.color} stroke="var(--color-sv-ink)" strokeWidth="1.3" />
              <rect x="14" y="18" width={m.name.length * 8 + 14} height="22" rx="3" fill={m.color} stroke="var(--color-sv-ink)" strokeWidth="1" />
              <text x="21" y="33" className="font-brico" fontSize="13" fontWeight="600" fill="#14283c">{m.name}</text>
            </g>
          )
        })}
    </svg>
  )
}

function GapsPanel() {
  const [gaps, setGaps] = useState(allGaps)
  const sorted = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  const toggle = (id: string) =>
    setGaps((gs) => gs.map((g) => (g.id !== id ? g : { ...g, votes: g.votes.includes('you') ? g.votes.filter((v) => v !== 'you') : [...g.votes, 'you'] })))
  return (
    <ul className="divide-y divide-sv-ink/20">
      {sorted.map((g) => {
        const mine = g.votes.includes('you')
        return (
          <li key={g.id} className="py-5">
            <div className="flex items-start gap-4">
              <button
                onClick={() => toggle(g.id)}
                aria-pressed={mine}
                aria-label={mine ? `Remove vote from ${g.title}` : `Vote for ${g.title}`}
                className={`flex w-14 shrink-0 flex-col items-center border-2 border-sv-ink py-1.5 font-brico ${mine ? 'bg-sv-ink text-sv-sheet' : 'bg-sv-sheet text-sv-ink hover:bg-sv-mark'}`}
              >
                <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden><path d="M6 0l6 8H0z" fill="currentColor" /></svg>
                <span className="text-lg font-bold leading-tight">{g.votes.length}</span>
              </button>
              <div className="min-w-0">
                <h3 className="font-brico text-[17px] font-semibold leading-snug text-sv-ink">{g.title}</h3>
                <p className="mt-1 font-news text-[15px] leading-relaxed text-sv-ink/80">{g.detail}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 font-brico text-xs">
                  <span className={`px-1.5 py-0.5 ${g.stated ? 'border border-sv-ink' : 'border border-dashed border-sv-ink'}`}>
                    {g.stated ? 'Named in the papers' : 'Inferred by the AI'}
                  </span>
                  <span className="flex -space-x-1.5">
                    {g.votes.map((v) => {
                      const m = byId(members, v)
                      return (
                        <span key={v} title={m.name} className="grid h-6 w-6 place-items-center rounded-full border-2 border-sv-sheet text-[9px] font-bold text-sv-ink" style={{ background: m.color }}>
                          {m.initials}
                        </span>
                      )
                    })}
                  </span>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function PapersPanel({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <ul className="divide-y divide-sv-ink/20">
      {papers.map((p) => (
        <li key={p.id}>
          <button onClick={() => onSelect(p.id)} className="block w-full py-4 text-left hover:bg-sv-vellum/60">
            <span className="block font-brico text-xs text-sv-contour">{p.authors} · {p.venue} {p.year}</span>
            <span className="mt-0.5 block font-brico text-[16px] font-semibold leading-snug text-sv-ink">{p.title}</span>
            <span className="mt-1 block font-news text-sm text-sv-ink/65">{p.annotations.length} margin notes · {p.citations} citations</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function AskPanel() {
  return (
    <div className="flex h-full flex-col">
      <ul className="flex-1 space-y-5 py-4">
        {chat.map((c, i) =>
          c.from === 'ai' ? (
            <li key={i} className="flex gap-3">
              <Sprite id={poses.tuft.smile} size={34} className="shrink-0" />
              <div>
                {c.tool && <p className="mb-1.5 border-l-2 border-sv-contour pl-2 font-brico text-xs text-sv-contour">Looked up: {c.tool}</p>}
                <p className="font-news text-[16px] leading-relaxed text-sv-ink">{c.text}</p>
              </div>
            </li>
          ) : (
            <li key={i} className="pl-11">
              <p className="font-brico text-xs font-semibold text-sv-ink/70">{byId(members, c.from).name}</p>
              <p className="font-brico text-[15px] text-sv-ink">{c.text}</p>
            </li>
          ),
        )}
      </ul>
      <form className="sticky bottom-0 flex gap-2 border-t-2 border-sv-ink bg-sv-sheet py-3" onSubmit={(e) => e.preventDefault()}>
        <label className="sr-only" htmlFor="sv-ask">Ask about this area</label>
        <input id="sv-ask" placeholder="Ask about the papers or the gaps" className="min-w-0 flex-1 border-2 border-sv-ink bg-sv-sheet px-3 py-2 font-brico text-sm text-sv-ink placeholder:text-sv-ink/45 focus:outline-none focus:ring-2 focus:ring-sv-mark" />
        <button className="bg-sv-ink px-4 font-brico text-sm font-semibold text-sv-sheet">Ask</button>
      </form>
    </div>
  )
}

export default function SurveyRoom({ night = false }: { night?: boolean }) {
  return (
    <SurveyMode.Provider value={modeFor(night)}>
      <div className={night ? 'sv-night' : ''}>
        <RoomBody />
      </div>
    </SurveyMode.Provider>
  )
}

function RoomBody() {
  const [selected, setSelected] = useState<string | null>('p3')
  const [tab, setTab] = useState<'gaps' | 'papers' | 'ask'>('gaps')
  const paper = selected ? byId(papers, selected) : null
  const here = members.filter((m) => m.status !== 'idle')
  const tabs = [
    { k: 'gaps', label: 'Gaps' },
    { k: 'papers', label: 'Papers' },
    { k: 'ask', label: 'Ask Tuft' },
  ] as const

  return (
    <div className="flex min-h-screen flex-col bg-sv-vellum text-sv-ink lg:h-screen">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b-2 border-sv-ink bg-sv-sheet px-4 py-3 sm:px-6">
        <Link to={useSurvey().base} className="flex items-center gap-2 font-brico text-xl font-bold tracking-tight">
          <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden>
            <circle cx="11" cy="11" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="11" cy="11" r="2.5" fill="#f2da4b" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          cognitio
        </Link>
        <div className="min-w-0">
          <h1 className="truncate font-brico text-lg font-bold leading-tight sm:text-xl">{room.name}</h1>
          <p className="truncate font-news text-sm italic text-sv-ink/65">{room.searched.kept} papers from {room.searched.source}, started {room.created}</p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex -space-x-2" aria-label={`${here.length} people here`}>
            {members.map((m) => (
              <span
                key={m.id}
                title={`${m.name}${m.status === 'idle' ? ' (away)' : ''}`}
                className="grid h-9 w-9 place-items-center rounded-full border-2 border-sv-sheet font-brico text-xs font-bold"
                style={{ background: m.color, opacity: m.status === 'idle' ? 0.35 : 1 }}
              >
                {m.initials}
              </span>
            ))}
          </div>
          <button className="border-2 border-sv-ink px-3 py-1.5 font-brico text-sm font-semibold hover:bg-sv-ink hover:text-sv-sheet">Invite</button>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 lg:grid-cols-[1fr_440px]">
        <section aria-label="Map" className="relative min-h-[60vh] bg-sv-sheet border-b-2 border-sv-ink lg:border-b-0 lg:border-r-2">
          <SurveyMap selected={selected} onSelect={setSelected} />
          {paper && (
            <article className="absolute bottom-4 left-4 right-4 max-w-lg border-2 border-sv-ink bg-sv-sheet p-5 shadow-[6px_6px_0_rgb(0_0_0/0.14)] sm:right-auto">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-brico text-xs text-sv-contour">{paper.authors} · {paper.venue} {paper.year}</p>
                  <h2 className="mt-0.5 font-brico text-lg font-semibold leading-snug">{paper.title}</h2>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close paper" className="-mr-1 -mt-1 p-1 font-brico text-lg leading-none">×</button>
              </div>
              <p className="mt-2 font-news text-[16px] leading-relaxed text-sv-ink/85">{paper.summary}</p>
              <div className="mt-3 space-y-1.5 border-t border-dashed border-sv-ink/40 pt-3">
                {paper.annotations.map((a, i) => {
                  const m = byId(members, a.by)
                  return (
                    <p key={i} className="font-news text-[15px] italic leading-snug">
                      <span className="font-brico text-xs font-semibold not-italic" style={{ borderBottom: `3px solid ${m.color}` }}>{m.name.split(' ')[0]}</span> {a.text}
                    </p>
                  )
                })}
                <input placeholder="Write in the margin…" aria-label="Add a margin note" className="mt-1 w-full border-b border-sv-ink/40 bg-transparent py-1 font-news text-[15px] italic placeholder:text-sv-ink/40 focus:border-sv-ink focus:outline-none" />
              </div>
            </article>
          )}
        </section>

        <aside className="flex min-h-0 flex-col bg-sv-sheet">
          <div role="tablist" aria-label="Room panels" className="flex border-b-2 border-sv-ink">
            {tabs.map((t) => (
              <button
                key={t.k}
                role="tab"
                aria-selected={tab === t.k}
                onClick={() => setTab(t.k)}
                className={`flex-1 py-3 font-brico text-sm font-semibold ${tab === t.k ? 'bg-sv-ink text-sv-sheet' : 'hover:bg-sv-vellum'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto px-5">
            {tab === 'gaps' && <GapsPanel />}
            {tab === 'papers' && <PapersPanel onSelect={setSelected} />}
            {tab === 'ask' && <AskPanel />}
          </div>
        </aside>
      </main>
    </div>
  )
}
