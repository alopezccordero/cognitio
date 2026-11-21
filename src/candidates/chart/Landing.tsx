import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, reducedMotion, useLenis } from '../../lib/smooth'
import { isoLines } from '../../lib/contours'
import { byId, gaps, members, papers, room } from '../../lib/sample'
import { poses, Sprite, spriteUrl } from '../../lib/Sprite'
import { clusters, gapSites, height } from '../survey/terrain'

const W = 1000
const H = 875
const sx = (x: number) => ((x + 8) / 16) * W
const sz = (z: number) => ((z + 7) / 14) * H

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

/** Water tint by depth: shallow (well-studied) is blue, deep (unstudied) stays white. */
function useTint(ref: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const c = ref.current!
    const g = c.getContext('2d')!
    const img = g.createImageData(c.width, c.height)
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const h = height(-8 + (16 * x) / c.width, -7 + (14 * y) / c.height)
        const col = h > 2.15 ? [233, 220, 174] : h > 1.3 ? [159, 207, 226] : h > 0.6 ? [196, 226, 238] : [251, 253, 253]
        const k = (y * c.width + x) * 4
        img.data.set([...col, 255], k)
      }
    }
    g.putImageData(img, 0, 0)
  }, [ref])
}

function Chart({ sweep, reveal }: { sweep: number; reveal: number }) {
  const tint = useRef<HTMLCanvasElement>(null)
  useTint(tint)
  const lines = useMemo(() => isoLines(height, { W, H, levels: [0.3, 0.6, 0.95, 1.3, 1.7, 2.15] }), [])
  const soundings = useMemo(() => {
    const r = rng(11)
    const pts: { x: number; y: number; n: string; paper?: boolean }[] = []
    for (let k = 0; k < 140; k++) {
      const x = -7.5 + r() * 15
      const z = -6.5 + r() * 13
      const h = height(x, z)
      if (h > 2.15) continue
      pts.push({ x: sx(x), y: sz(z), n: String(Math.max(1, Math.round((2.3 - h) * 9))) })
    }
    const o = [[0.7, 0.6], [-0.8, 0.5], [0.3, -0.9], [1.0, -0.2]]
    papers.forEach((p, k) => {
      const c = clusters.find((c) => c.key === p.cluster)!
      pts.push({ x: sx(c.x + o[k % 4][0]), y: sz(c.z + o[k % 4][1]), n: String(p.citations), paper: true })
    })
    return pts
  }, [])

  return (
    <div className="absolute inset-0">
      <canvas ref={tint} width={560} height={490} className="absolute inset-0 h-full w-full object-cover" />
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="nc-sweep" x1="0" x2="1">
            <stop offset="0" stopColor="#b0307a" stopOpacity="0" />
            <stop offset="1" stopColor="#b0307a" stopOpacity="0.22" />
          </linearGradient>
          <clipPath id="nc-seen"><rect x="0" y="0" width={sweep * W} height={H} /></clipPath>
        </defs>
        {/* graticule */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 125} x2={i * 125} y1="0" y2={H} stroke="#17324d" strokeOpacity="0.12" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} y1={i * 125} y2={i * 125} x1="0" x2={W} stroke="#17324d" strokeOpacity="0.12" />
        ))}
        {lines.map((l) => (
          <path key={l.level} d={l.d} fill="none" stroke="#17324d" strokeOpacity={l.level > 2 ? 0.9 : 0.45} strokeWidth={l.level > 2 ? 1.4 : 0.8} strokeDasharray={l.level < 0.5 ? '2 3' : undefined} />
        ))}
        <g clipPath="url(#nc-seen)">
          {soundings.map((s, i) => (
            <text key={i} x={s.x} y={s.y} textAnchor="middle" fontFamily="Spectral" fontStyle="italic" fontSize={s.paper ? 17 : 12} fontWeight={s.paper ? 500 : 400} fill={s.paper ? '#17324d' : '#17324d'} fillOpacity={s.paper ? 1 : 0.7}>
              {s.n}
            </text>
          ))}
        </g>
        {gapSites.map((g, i) => {
          const r = (g.r / 16) * W
          const c = 2 * Math.PI * r
          return (
            <g key={g.id} style={{ opacity: Math.min(1, Math.max(0, reveal * 4 - i * 0.6)) }}>
              <circle cx={sx(g.x)} cy={sz(g.z)} r={r} fill="#b0307a" fillOpacity="0.05" stroke="#b0307a" strokeWidth="2" strokeDasharray="10 6" style={{ strokeDashoffset: c * (1 - Math.min(1, reveal * 1.4)) }} />
              <text x={sx(g.x)} y={sz(g.z) - 4} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight="600" fontSize="15" letterSpacing="1" fill="#b0307a">UNSURVEYED</text>
              <text x={sx(g.x)} y={sz(g.z) + 16} textAnchor="middle" fontFamily="Spectral" fontStyle="italic" fontSize="14" fill="#b0307a">{g.label}</text>
            </g>
          )
        })}
        {sweep > 0 && sweep < 1 && <rect x={sweep * W - 160} y="0" width="160" height={H} fill="url(#nc-sweep)" />}
        {sweep > 0 && sweep < 1 && <line x1={sweep * W} x2={sweep * W} y1="0" y2={H} stroke="#b0307a" strokeWidth="2" />}
        <g transform={`translate(${sx(gapSites[0].x) + 40} ${sz(gapSites[0].z) - 120})`} style={{ opacity: reveal > 0.3 ? 1 : 0, transition: 'opacity .5s' }}>
          <image href={spriteUrl(poses.tuft.hover)} width="84" height="84" className="[animation:bob_3s_ease-in-out_infinite]" />
        </g>
        {/* compass rose */}
        <g transform="translate(880 760)" stroke="#b0307a" fill="none">
          <circle r="62" strokeWidth="1.2" />
          <circle r="50" strokeWidth="0.8" strokeDasharray="2 4" />
          <path d="M0 -70 L8 0 L0 70 L-8 0 Z M-70 0 L0 -8 L70 0 L0 8 Z" fill="#b0307a" fillOpacity="0.15" strokeWidth="1.2" />
          <text y="-76" textAnchor="middle" fontFamily="Barlow Condensed" fontWeight="600" fontSize="16" fill="#b0307a" stroke="none">N</text>
        </g>
      </svg>
    </div>
  )
}

function Hero() {
  const root = useRef<HTMLElement>(null)
  const [s, setS] = useState({ sweep: 0, reveal: 0 })
  useGSAP(
    () => {
      if (reducedMotion()) return setS({ sweep: 1, reveal: 1 })
      gsap.timeline({
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: '+=1500', pin: true, scrub: true,
          onUpdate: (t) => setS({ sweep: Math.min(1, t.progress / 0.65), reveal: Math.max(0, (t.progress - 0.6) / 0.4) }),
        },
      })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="relative h-[100svh] min-h-[660px] overflow-hidden bg-nc-deep">
      <Chart sweep={s.sweep} reveal={s.reveal} />
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-8">
        <Link to="/i" className="font-barlow text-2xl font-bold uppercase tracking-[0.08em] text-nc-ink">Cognitio</Link>
        <Link to="/b/room" className="border-2 border-nc-ink bg-nc-deep px-4 py-1.5 font-barlow text-lg font-semibold text-nc-ink hover:bg-nc-ink hover:text-nc-deep">Chart an area</Link>
      </header>
      {/* cartouche: the chart's title block */}
      <div className="absolute left-4 top-20 z-10 w-[min(92vw,440px)] border-[3px] border-double border-nc-ink bg-nc-deep/95 p-6 sm:left-8">
        <p className="font-spectral text-sm italic text-nc-ink/70">Chart No. 1 · soundings in citations</p>
        <h1 className="mt-2 font-barlow text-[clamp(2rem,4vw,3.1rem)] font-bold leading-[0.95] text-nc-ink">
          Chart the field. Find the water nobody has sounded.
        </h1>
        <p className="mt-4 font-spectral text-[17px] leading-relaxed text-nc-ink/85">
          Cognitio reads the papers in your research area and draws them as a chart. Busy waters are well studied.
          Deep water marked in magenta is a gap.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <Link to="/b/room" className="bg-nc-magenta px-4 py-2 font-barlow text-lg font-semibold text-white">Chart my area</Link>
          <span className="font-spectral text-sm italic text-nc-ink/60">{s.sweep < 1 ? 'Scroll to run the survey' : `${room.searched.kept} papers sounded`}</span>
        </div>
      </div>
    </section>
  )
}

function Notices() {
  const sorted = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  return (
    <section className="border-t-[3px] border-double border-nc-ink bg-nc-deep py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <h2 className="font-barlow text-5xl font-bold text-nc-ink">Notices to researchers</h2>
        <p className="mt-2 max-w-xl font-spectral text-lg italic text-nc-ink/75">
          Unsurveyed waters, ranked by how many people in the room want to explore them.
        </p>
        <ol className="mt-10 border-t border-nc-ink">
          {sorted.map((g, i) => (
            <li key={g.id} className="grid gap-3 border-b border-nc-ink/40 py-6 md:grid-cols-[4rem_1fr_9rem]">
              <span className="font-barlow text-3xl font-bold text-nc-magenta">No. {i + 1}</span>
              <div>
                <h3 className="font-barlow text-2xl font-semibold leading-tight text-nc-ink">{g.title}</h3>
                <p className="mt-1 max-w-[62ch] font-spectral text-[17px] leading-relaxed text-nc-ink/80">{g.detail}</p>
                <p className="mt-2 font-spectral text-sm italic text-nc-ink/60">
                  {g.stated ? 'Reported in' : 'Inferred from'} {g.sources.map((s) => `${byId(papers, s).authors.split(',')[0]} ${byId(papers, s).year}`).join(' and ')}
                </p>
              </div>
              <div className="flex items-start gap-1 md:justify-end">
                {g.votes.map((v) => (
                  <span key={v} className="grid h-7 w-7 place-items-center rounded-full border border-nc-ink font-barlow text-[11px] font-semibold text-nc-ink" style={{ background: byId(members, v).color }} title={byId(members, v).name}>
                    {byId(members, v).initials}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function PilotNotes() {
  return (
    <section className="bg-nc-shoal py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-barlow text-5xl font-bold text-nc-ink">Pilot’s notes</h2>
          <Sprite id={poses.tuft.wave} size={88} />
        </div>
        <p className="mt-2 max-w-xl font-spectral text-lg italic text-nc-ink/75">Two lines on every paper, so your crew can skim before reading.</p>
        <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {papers.map((p) => (
            <article key={p.id} className="border-t-2 border-nc-ink pt-4">
              <p className="font-barlow text-sm font-semibold uppercase tracking-[0.06em] text-nc-magenta">Sounding {p.citations} · {p.venue} {p.year}</p>
              <h3 className="mt-1 font-barlow text-2xl font-semibold leading-tight text-nc-ink">{p.title}</h3>
              <p className="mt-2 font-spectral text-[17px] leading-relaxed text-nc-ink/85">{p.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function ChartLanding() {
  useLenis()
  return (
    <div className="bg-nc-deep">
      <style>{`@keyframes bob{50%{transform:translateY(-8px)}}`}</style>
      <Hero />
      <Notices />
      <PilotNotes />
    </div>
  )
}
