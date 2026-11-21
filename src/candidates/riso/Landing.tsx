import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, reducedMotion, useLenis } from '../../lib/smooth'
import { byId, gaps, members, papers, room } from '../../lib/sample'
import { HalftoneTuft } from './HalftoneTuft'

// Misregistered two-drum print: pink plate, teal plate slightly off.
const overprint = { textShadow: '0.045em 0.035em 0 #00838a', mixBlendMode: 'multiply' as const }
const wide = { fontVariationSettings: '"wdth" 125' }
const narrow = { fontVariationSettings: '"wdth" 70' }

function Hero() {
  const root = useRef<HTMLElement>(null)
  const progress = useRef(0)
  useGSAP(
    () => {
      if (reducedMotion()) {
        progress.current = 1
        return
      }
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=1600', pin: true, scrub: true, onUpdate: (s) => (progress.current = s.progress) } })
        .to('.rs-a', { opacity: 0, duration: 0.15 }, 0.2)
        .fromTo('.rs-b', { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.78)
    },
    { scope: root },
  )
  return (
    <section ref={root} className="relative h-[100svh] min-h-[660px] overflow-hidden bg-rs-paper">
      {/* paper grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply [background-image:radial-gradient(rgb(0_0_0/.08)_1px,transparent_1px)] [background-size:3px_3px]" />
      <HalftoneTuft progress={progress} />
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-5 sm:px-8">
        <Link to="/j" className="font-archivo text-2xl font-black uppercase text-rs-pink" style={{ ...overprint, ...wide }}>Cognitio</Link>
        <div className="flex items-center gap-4 font-archivo text-sm font-semibold text-rs-ink">
          <span className="hidden sm:inline">Issue 01 · {room.name}</span>
          <Link to="/b/room" className="bg-rs-ink px-4 py-2 text-rs-paper hover:bg-rs-teal">Open a room</Link>
        </div>
      </header>
      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-8">
        <div className="rs-a max-w-2xl">
          <h1 className="font-archivo text-[clamp(3rem,8.5vw,7.5rem)] font-black uppercase leading-[0.86] text-rs-pink" style={{ ...overprint, ...wide }}>
            A map of your field, holes included
          </h1>
          <p className="mt-6 max-w-sm font-archivo text-lg leading-snug text-rs-ink">
            Cognitio reads the papers in your research area, prints the map, and shows your lab where nobody has looked.
          </p>
        </div>
        <div className="rs-b absolute bottom-16 left-4 max-w-xs opacity-0 sm:left-8">
          <p className="font-archivo text-4xl font-black uppercase leading-none text-rs-ink" style={narrow}>
            Teal is studied ground. Pink is a gap.
          </p>
          <p className="mt-3 font-archivo text-rs-ink/80">{gaps.length} gaps found in {room.searched.kept} papers.</p>
        </div>
      </div>
    </section>
  )
}

function GapBlocks() {
  const sorted = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  const plates = ['#ff48b0', '#ffe800', '#00838a', '#ff48b0']
  return (
    <section className="bg-rs-paper py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <h2 className="font-archivo text-6xl font-black uppercase leading-none text-rs-ink sm:text-8xl" style={narrow}>The gaps, by vote</h2>
        <div className="mt-12 grid gap-0 md:grid-cols-2">
          {sorted.map((g, i) => (
            <article key={g.id} className="relative -mr-px -mt-px border-2 border-rs-ink p-7" style={{ background: `${plates[i]}${i === 1 ? '' : '26'}` }}>
              <p className="font-archivo text-[7rem] font-black leading-[0.8] text-rs-pink" style={{ ...overprint, ...narrow }}>{g.votes.length}</p>
              <h3 className="mt-4 font-archivo text-2xl font-extrabold leading-tight text-rs-ink" style={narrow}>{g.title}</h3>
              <p className="mt-2 max-w-md font-archivo leading-relaxed text-rs-ink/85">{g.detail}</p>
              <p className="mt-4 font-archivo text-sm font-semibold text-rs-ink">
                {g.stated ? 'Named in the papers' : 'Inferred by the AI'} · voted by {g.votes.map((v) => byId(members, v).name.split(' ')[0]).join(', ')}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Reading() {
  return (
    <section className="bg-rs-teal py-24 text-rs-paper">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <h2 className="font-archivo text-6xl font-black uppercase leading-none sm:text-8xl" style={narrow}>Reading list</h2>
        <p className="mt-4 max-w-md font-archivo text-lg">Two lines per paper, written by the AI. Your lab adds the notes.</p>
        <div className="mt-12 columns-1 gap-10 md:columns-2">
          {papers.map((p) => (
            <article key={p.id} className="mb-10 break-inside-avoid">
              <p className="font-archivo text-sm font-bold text-rs-yellow">{p.venue} {p.year} · {p.citations} citations</p>
              <h3 className="mt-1 font-archivo text-2xl font-extrabold leading-tight" style={narrow}>{p.title}</h3>
              <p className="mt-2 font-archivo leading-relaxed text-rs-paper/90">{p.summary}</p>
              {p.annotations[0] && (
                <p className="mt-2 font-archivo text-sm italic text-rs-paper/75">
                  {byId(members, p.annotations[0].by).name.split(' ')[0]}: {p.annotations[0].text}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function RisoLanding() {
  useLenis()
  return (
    <div className="bg-rs-paper">
      <Hero />
      <GapBlocks />
      <Reading />
      <footer className="bg-rs-paper px-4 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between font-archivo text-sm font-semibold text-rs-ink">
          <span className="text-xl font-black uppercase text-rs-pink" style={{ ...overprint, ...wide }}>Cognitio</span>
          <span>Printed from OpenAlex records</span>
        </div>
      </footer>
    </div>
  )
}
