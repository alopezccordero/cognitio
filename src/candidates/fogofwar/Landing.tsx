import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, reducedMotion, useLenis } from '../../lib/smooth'
import { byId, gaps, members, room } from '../../lib/sample'
import { poses, sequences, Sprite } from '../../lib/Sprite'
import { GapMarkers, Overworld, pct, towns } from './Overworld'

const lines = [
  { who: 'Nib', sprite: poses.nib.wave, text: `I’m heading out to explore “${room.name.toLowerCase()}”. Scroll to come along.` },
  { who: 'Nib', sprite: poses.nib.sparkle, text: `Found ${towns.length} towns so far. Each one is a paper, and I wrote two lines about every one.` },
  { who: 'Tuft', sprite: poses.tuft.idea, text: 'Four regions are still under fog. Nobody has studied them yet. Those are your gaps.' },
]

function at(path: { i: number; j: number }[], t: number) {
  const f = Math.min(path.length - 1.001, Math.max(0, t * (path.length - 1)))
  const a = path[Math.floor(f)]
  const b = path[Math.ceil(f)]
  const k = f - Math.floor(f)
  return { i: a.i + (b.i - a.i) * k, j: a.j + (b.j - a.j) * k, dir: b.i >= a.i ? 1 : -1 }
}

function Dialog({ step }: { step: number }) {
  const l = lines[step]
  return (
    <div className="pointer-events-auto w-full max-w-2xl border-4 border-fw-ink bg-[#f8f3e4] p-1 shadow-[6px_6px_0_#1f2440]">
      <div className="flex gap-4 border-2 border-fw-ink/30 p-4">
        <div className="grid h-20 w-20 shrink-0 place-items-center border-2 border-fw-ink bg-fw-water">
          <Sprite id={l.sprite} size={68} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-pixel text-lg text-fw-flag">{l.who}</p>
          <p key={step} className="font-hyper text-[17px] leading-snug text-fw-ink" aria-live="polite">{l.text}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/d/room" className="border-2 border-fw-ink bg-fw-flag px-3 py-1.5 font-pixel text-white shadow-[3px_3px_0_#1f2440] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
              Start a room
            </Link>
            {step < 2 && <span className="self-center font-pixel text-sm text-fw-ink/60">▼ scroll</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  const root = useRef<HTMLElement>(null)
  const [p, setP] = useState(0)
  useGSAP(
    () => {
      if (reducedMotion()) return setP(1)
      gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=1800', pin: true, scrub: true, onUpdate: (s) => setP(s.progress) },
      })
    },
    { scope: root },
  )
  const route = [...towns].sort((a, b) => a.i - b.i)
  const nib = at(route, p)
  const tuft = at(route, Math.max(0, p - 0.12))
  const frame = p >= 0.99 ? poses.nib.cheer : sequences.nibRun[Math.floor(p * 60) % sequences.nibRun.length]
  const tFrame = p >= 0.99 ? poses.tuft.idea : sequences.tuftRun[Math.floor(p * 60 + 2) % sequences.tuftRun.length]
  const step = p < 0.3 ? 0 : p < 0.75 ? 1 : 2

  return (
    <section ref={root} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-fw-water">
      <div className="absolute left-1/2 top-1/2 w-[max(100vw,170svh)] -translate-x-1/2 -translate-y-1/2">
        <Overworld reveal={0.18 + p * 0.95}>
          {towns.map((t) => (
            <span
              key={t.paper.id}
              className="absolute -translate-x-1/4 translate-y-5 whitespace-nowrap bg-fw-ink/85 px-1.5 py-0.5 font-pixel text-[11px] text-fw-path transition-opacity"
              style={{ ...pct(t.i, t.j + 1), opacity: p > 0.25 ? 1 : 0 }}
            >
              {t.paper.authors.split(',')[0]} {t.paper.year}
            </span>
          ))}
          <GapMarkers visible={p > 0.7 ? 1 : 0} labels />
          <Sprite id={tFrame} size={56} flip={tuft.dir < 0} className="absolute -translate-x-1/2 -translate-y-full" style={pct(tuft.i, tuft.j + 0.8)} />
          <Sprite id={frame} size={64} flip={nib.dir < 0} className="absolute -translate-x-1/2 -translate-y-full" style={pct(nib.i + 1.5, nib.j + 0.8)} />
        </Overworld>
      </div>
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-8">
        <Link to="/d" className="border-4 border-fw-ink bg-[#f8f3e4] px-3 py-1 font-pixel text-2xl text-fw-ink shadow-[4px_4px_0_#1f2440]">cognitio</Link>
        <nav className="flex gap-2 font-pixel">
          <a href="#quests" className="hidden border-4 border-fw-ink bg-[#f8f3e4] px-3 py-1 text-fw-ink shadow-[4px_4px_0_#1f2440] sm:block">Quest log</a>
          <Link to="/d/room" className="border-4 border-fw-ink bg-fw-flag px-3 py-1 text-white shadow-[4px_4px_0_#1f2440]">Open a room</Link>
        </nav>
      </header>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-6 sm:px-8 sm:pb-8">
        <h1 className="sr-only">Cognitio: explore a research area with your lab and find the gaps nobody has studied</h1>
        <Dialog step={step} />
      </div>
    </section>
  )
}

function QuestLog() {
  const sorted = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  return (
    <section id="quests" className="bg-fw-fog py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <h2 className="font-pixel text-4xl text-fw-path sm:text-5xl">The quest log</h2>
        <p className="mt-3 max-w-xl font-hyper text-lg leading-relaxed text-white/80">
          Each fogged region becomes a quest. Your party votes on which one to take on first.
        </p>
        <ol className="mt-10 space-y-4">
          {sorted.map((g, i) => (
            <li key={g.id} className="flex flex-col gap-4 border-4 border-fw-ink bg-[#f8f3e4] p-5 shadow-[6px_6px_0_#1f2440] sm:flex-row sm:items-center">
              <span className="font-pixel text-3xl text-fw-flag">{i === 0 ? '★' : i + 1}</span>
              <div className="flex-1">
                <h3 className="font-hyper text-lg font-bold leading-snug text-fw-ink">{g.title}</h3>
                <p className="mt-1 font-hyper text-fw-ink/70">{g.detail}</p>
              </div>
              <div className="flex shrink-0 -space-x-3">
                {g.votes.map((v) => (
                  <span key={v} className="grid h-11 w-11 place-items-center border-2 border-fw-ink" style={{ background: byId(members, v).color }} title={byId(members, v).name}>
                    <Sprite id={byId(members, v).sprite} size={34} />
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

function Party() {
  return (
    <section className="bg-fw-grass py-24">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 sm:px-8 md:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="font-pixel text-4xl text-fw-ink sm:text-5xl">Bring a party</h2>
          <p className="mt-3 font-hyper text-lg leading-relaxed text-fw-ink/80">
            Share the room link. Everyone shows up on the map where they’re reading, so you can tell who has the
            survey paper open and who is still voting.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {members.map((m) => (
            <li key={m.id} className="border-4 border-fw-ink bg-[#f8f3e4] p-3 text-center shadow-[4px_4px_0_#1f2440]" style={{ opacity: m.status === 'idle' ? 0.55 : 1 }}>
              <Sprite id={m.status === 'idle' ? poses.nib.sleep : m.sprite} size={64} className="mx-auto" />
              <p className="mt-1 font-pixel" style={{ color: '#1f2440' }}>{m.name.split(' ')[0]}</p>
              <p className="font-hyper text-xs text-fw-ink/65">{m.status === 'idle' ? 'resting' : m.status}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function FogLanding() {
  useLenis()
  return (
    <div className="bg-fw-water">
      <Hero />
      <QuestLog />
      <Party />
      <footer className="bg-fw-ink px-4 py-10 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between font-pixel text-fw-path">
          <span className="text-xl">cognitio</span>
          <span className="font-hyper text-sm text-fw-path/70">Maps drawn from OpenAlex and Semantic Scholar</span>
        </div>
      </footer>
    </div>
  )
}
