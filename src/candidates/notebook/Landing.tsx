import { lazy, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, reducedMotion, useLenis } from '../../lib/smooth'
import { byId, gaps, members, papers, room } from '../../lib/sample'
import { poses } from '../../lib/Sprite'
import { Circled, graph, Hi, Sticker, Tally } from './parts'

const PaperStack = lazy(() => import('./PaperStack'))

function Hero() {
  const root = useRef<HTMLElement>(null)
  const progress = useRef(0)
  useGSAP(
    () => {
      if (reducedMotion()) return
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=1300', pin: true, scrub: true, onUpdate: (s) => (progress.current = s.progress) },
      })
      tl.to('.nb-intro', { opacity: 0, y: -30, duration: 0.25 }, 0.05)
        .fromTo('.nb-fan', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.2 }, 0.6)
        .fromTo('.nb-note', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.15, stagger: 0.05 }, 0.7)
    },
    { scope: root },
  )
  const notes = [
    { by: 'ana', text: 'use PIER for eval!', cls: 'left-[8%] top-[22%] -rotate-6' },
    { by: 'marcus', text: 'boundary token — cheap to try', cls: 'right-[10%] top-[20%] rotate-3' },
    { by: 'priya', text: 'table 2 = best map of what exists', cls: 'left-[14%] bottom-[16%] rotate-2' },
  ]
  return (
    <section ref={root} className="relative h-[100svh] min-h-[640px] overflow-hidden" style={graph}>
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <PaperStack progress={progress} />
        </Suspense>
      </div>
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-5 sm:px-10">
        <Link to="/g" className="font-schib text-xl font-extrabold tracking-tight text-nb-ink">cognitio</Link>
        <Link to="/g/room" className="rounded-md border-2 border-nb-ink bg-white px-4 py-2 font-schib text-sm font-bold text-nb-ink shadow-[3px_3px_0_var(--color-nb-ink)]">
          Open a notebook
        </Link>
      </header>
      <div className="pointer-events-none relative z-20 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-10">
        <div className="nb-intro max-w-xl">
          <Sticker id={poses.nib.think} size={84} tilt={-8} />
          <h1 className="mt-4 font-schib text-[clamp(2.4rem,5.4vw,4.6rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-nb-ink">
            Take notes on a whole field at once.
          </h1>
          <p className="mt-6 max-w-md font-schib text-lg leading-relaxed text-nb-ink/80">
            Name a research area and Cognitio fills a shared notebook with the papers that matter, two lines each. Your
            lab writes in the margins, and the AI <Hi>marks what nobody has studied yet</Hi>.
          </p>
          <Link to="/g/room" className="pointer-events-auto mt-8 inline-block rounded-md bg-nb-pen px-5 py-3 font-schib font-bold text-white shadow-[3px_3px_0_var(--color-nb-ink)]">
            Start a notebook
          </Link>
        </div>
      </div>
      <p className="nb-fan pointer-events-none absolute inset-x-0 bottom-10 z-20 text-center font-schib text-lg font-semibold text-nb-ink opacity-0">
        {room.searched.kept} papers on {room.name.toLowerCase()}, each with notes from the people who read it.
      </p>
      {notes.map((n) => {
        const m = byId(members, n.by)
        return (
          <p key={n.text} className={`nb-note pointer-events-none absolute z-20 hidden font-hand text-[26px] leading-none opacity-0 md:block ${n.cls}`} style={{ color: m.id === 'marcus' ? '#b7791f' : m.id === 'priya' ? '#c2417a' : 'var(--color-nb-pen)' }}>
            {n.text}
            <span className="ml-2 font-schib text-xs font-semibold text-nb-ink/60">{m.name.split(' ')[0]}</span>
          </p>
        )
      })}
    </section>
  )
}

function Gaps() {
  const sorted = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  return (
    <section className="py-24" style={graph}>
      <div className="mx-auto max-w-5xl px-4 sm:px-10">
        <div className="flex items-end gap-4">
          <h2 className="font-schib text-4xl font-extrabold tracking-tight text-nb-ink sm:text-5xl">What nobody has studied</h2>
          <Sticker id={poses.tuft.idea} size={76} tilt={7} className="-mb-2 hidden sm:block" />
        </div>
        <p className="mt-3 max-w-xl font-schib text-lg text-nb-ink/75">
          Gaps the papers name themselves are circled in red. Gaps the AI inferred are circled in pencil so you know to
          check them. Each tick is one vote.
        </p>
        <ol className="mt-12 divide-y-2 divide-dashed divide-nb-grid border-y-2 border-nb-ink bg-white/70">
          {sorted.map((g) => (
            <li key={g.id} className="grid gap-4 px-5 py-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h3 className="font-schib text-xl font-bold text-nb-ink">
                  <Circled color={g.stated ? 'var(--color-nb-red)' : '#8a94a8'}>{g.title}</Circled>
                </h3>
                <p className="mt-2 max-w-[60ch] font-schib leading-relaxed text-nb-ink/75">{g.detail}</p>
              </div>
              <Tally n={g.votes.length} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Margins() {
  const p = papers[2]
  return (
    <section className="bg-nb-ink py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-10 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div>
          <h2 className="font-schib text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Everyone writes in the same margin</h2>
          <p className="mt-4 max-w-md font-schib text-lg leading-relaxed text-white/75">
            Each person writes in their own ink color. Open the notebook and you can see who is reading which page
            right now.
          </p>
          <div className="mt-8 flex gap-3">
            {members.slice(0, 4).map((m, i) => (
              <Sticker key={m.id} id={m.sprite} size={60} tilt={[-8, 5, -3, 9][i]} />
            ))}
          </div>
        </div>
        <article className="relative rotate-1 rounded-sm p-8 shadow-[0_20px_40px_rgb(0_0_0/0.35)]" style={graph}>
          <p className="font-schib text-sm text-nb-ink/60">{p.authors} · {p.venue} {p.year}</p>
          <h3 className="mt-1 font-schib text-2xl font-bold leading-tight text-nb-ink">{p.title}</h3>
          <p className="mt-3 font-schib leading-relaxed text-nb-ink/85">{p.summary}</p>
          <ul className="mt-6 space-y-3 border-l-2 border-nb-red/60 pl-4">
            {p.annotations.map((a, i) => (
              <li key={i} className="font-hand text-2xl leading-tight" style={{ color: ['var(--color-nb-pen)', '#2f855a', 'var(--color-nb-pen)'][i] }}>
                {a.text} <span className="font-schib text-xs font-semibold text-nb-ink/55">{byId(members, a.by).name.split(' ')[0]}</span>
              </li>
            ))}
          </ul>
          <Sticker id={poses.nib.sparkle} size={70} tilt={12} className="absolute -right-5 -top-6" />
        </article>
      </div>
    </section>
  )
}

export default function NotebookLanding() {
  useLenis()
  return (
    <div className="bg-nb-paper">
      <Hero />
      <Gaps />
      <Margins />
    </div>
  )
}
