import { lazy, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, reducedMotion, ScrollTrigger, useLenis } from '../../lib/smooth'
import { byId, gaps, members, papers, room } from '../../lib/sample'
import { poses, Sprite } from '../../lib/Sprite'

const DissolveScene = lazy(() => import('./DissolveScene'))
const ReassembleCanvas = lazy(() => import('./DissolveScene').then((m) => ({ default: m.ReassembleCanvas })))

const beats = [
  { h: `Nib just read ${room.searched.hits} papers on your research area.`, p: 'Type an area of study. Cognitio pulls the papers from OpenAlex and sums each one up in two lines.' },
  { h: 'Every paper becomes a point.', p: 'Points that cite each other and study the same question pile up together.' },
  { h: 'Put back together, the points show where the field is crowded, and where it’s empty.', p: 'The empty ground is where the gaps are. Yellow marks the ones the AI found.' },
]

function Hero() {
  const root = useRef<HTMLElement>(null)
  const progress = useRef(0)
  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>('.ds-beat')
      if (reducedMotion()) {
        progress.current = 1
        gsap.set(items.slice(0, -1), { display: 'none' })
        return
      }
      gsap.set(items.slice(1), { opacity: 0, y: 24 })
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=2200',
          pin: true,
          scrub: true,
          onUpdate: (s) => (progress.current = s.progress),
        },
      })
      // beat 2 lands mid-dispersal, beat 3 once the map has settled
      tl.to(items[0], { opacity: 0, y: -24, duration: 0.06 }, 0.22)
        .to(items[1], { opacity: 1, y: 0, duration: 0.06 }, 0.3)
        .to(items[1], { opacity: 0, y: -24, duration: 0.06 }, 0.62)
        .to(items[2], { opacity: 1, y: 0, duration: 0.06 }, 0.82)
        .to({}, { duration: 0.12 })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ds-night">
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <DissolveScene progress={progress} />
        </Suspense>
      </div>
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-5 sm:px-8">
        <Link to="/e" className="flex items-center gap-2 font-brico text-xl font-bold tracking-tight text-ds-wool">
          <span className="grid h-6 w-6 grid-cols-3 gap-px" aria-hidden>
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className={i % 4 === 0 ? 'bg-ds-nib' : i === 5 ? 'bg-ds-mark' : 'bg-ds-wool/25'} />
            ))}
          </span>
          cognitio
        </Link>
        <Link to="/b-night/room" className="bg-ds-wool px-4 py-2 font-hyper text-sm font-bold text-ds-night hover:bg-ds-nib">
          Open a room
        </Link>
      </header>
      <div className="pointer-events-none relative z-20 mx-auto flex h-full max-w-7xl items-end px-4 pb-20 sm:px-8 md:items-center md:pb-0">
        <div className="relative h-72 w-full max-w-lg">
          {beats.map((b, i) => (
            <div key={i} className="ds-beat absolute inset-x-0 top-0">
              {i === 0 ? (
                <h1 className="font-brico text-[clamp(2.1rem,4.6vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.025em] text-ds-wool">{b.h}</h1>
              ) : (
                <h2 className="font-brico text-[clamp(2.1rem,4.6vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.025em] text-ds-wool">{b.h}</h2>
              )}
              <p className="mt-5 max-w-md font-hyper text-lg leading-relaxed text-ds-wool/75">{b.p}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 font-hyper text-sm text-ds-wool/50">Keep scrolling</p>
    </section>
  )
}

function RoomPreview() {
  const sorted = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  return (
    <section className="bg-ds-night py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <h2 className="max-w-2xl font-brico text-4xl font-bold leading-tight tracking-tight text-ds-wool sm:text-5xl">
          Then your lab votes on which gap to chase.
        </h2>
        <p className="mt-4 max-w-xl font-hyper text-lg leading-relaxed text-ds-wool/70">
          A room holds the map, the papers with everyone’s notes, and a ranked list of gaps. You can see who else is in
          it and what they’re reading.
        </p>
        <div className="mt-12 grid gap-px overflow-hidden border border-ds-wool/15 bg-ds-wool/15 lg:grid-cols-[1.1fr_1fr]">
          <div className="bg-ds-panel p-6">
            <h3 className="font-hyper text-sm font-bold text-ds-wool/60">Ranked gaps</h3>
            <ol className="mt-4 space-y-4">
              {sorted.map((g, i) => (
                <li key={g.id} className="flex gap-4">
                  <span className="w-6 shrink-0 font-brico text-2xl font-bold text-ds-mark">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-hyper font-bold leading-snug text-ds-wool">{g.title}</p>
                    <div className="mt-2 flex gap-1" aria-label={`${g.votes.length} votes`}>
                      {g.votes.map((v) => (
                        <span key={v} className="h-3 w-3" style={{ background: byId(members, v).color }} title={byId(members, v).name} />
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-ds-panel p-6">
            <h3 className="font-hyper text-sm font-bold text-ds-wool/60">In the room now</h3>
            <ul className="mt-4 space-y-3">
              {members.map((m) => (
                <li key={m.id} className="flex items-center gap-3" style={{ opacity: m.status === 'idle' ? 0.45 : 1 }}>
                  <Sprite id={m.status === 'idle' ? poses.nib.sleep : m.sprite} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="font-hyper font-bold text-ds-wool">{m.name}</p>
                    <p className="truncate font-hyper text-sm text-ds-wool/60">
                      {m.status === 'idle'
                        ? 'Away'
                        : m.where?.startsWith('p')
                          ? `Reading ${byId(papers, m.where).title}`
                          : m.where
                            ? `Voting on ${byId(gaps, m.where).title.toLowerCase()}`
                            : 'Looking around'}
                    </p>
                  </div>
                  <span className="h-2 w-2" style={{ background: m.color }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const root = useRef<HTMLElement>(null)
  const progress = useRef(0)
  useGSAP(
    () => {
      if (reducedMotion()) {
        progress.current = 1
        return
      }
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (s) => (progress.current = s.progress),
      })
    },
    { scope: root },
  )
  return (
    <footer ref={root} className="bg-ds-panel">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-8 md:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-brico text-4xl font-bold tracking-tight text-ds-wool sm:text-5xl">Tuft puts it back together.</h2>
          <p className="mt-3 max-w-md font-hyper text-lg text-ds-wool/70">Open a room, name your area, and invite your lab.</p>
          <Link to="/b-night/room" className="mt-8 inline-block bg-ds-mark px-6 py-3 font-hyper font-bold text-ds-night">
            Open a room
          </Link>
        </div>
        <div className="h-72">
          <Suspense fallback={null}>
            <ReassembleCanvas progress={progress} />
          </Suspense>
        </div>
      </div>
    </footer>
  )
}

export default function DissolveLanding() {
  useLenis()
  return (
    <div className="bg-ds-night">
      <Hero />
      <RoomPreview />
      <Footer />
    </div>
  )
}
