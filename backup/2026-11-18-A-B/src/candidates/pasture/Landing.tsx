import { lazy, Suspense, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, reducedMotion, useLenis } from '../../lib/smooth'
import { poses, preload, sequences, Sprite, spriteUrl } from '../../lib/Sprite'
import { gaps, members } from '../../lib/sample'

const PastureScene = lazy(() => import('./PastureScene'))

const steps = [
  { title: 'Name the area', body: 'Type what you study in plain words. Cognitio turns it into a search over OpenAlex.', sprite: poses.nib.think },
  { title: 'Bring your flock', body: 'Share the room link. Everyone who joins shows up in the field, live.', sprite: poses.nib.wave },
  { title: 'Read the summaries', body: 'Each paper arrives with a two-line summary and room for everyone’s notes.', sprite: poses.nib.sparkle },
  { title: 'Vote on the gaps', body: 'The AI lists what the papers leave unstudied. The flock decides which gap to chase.', sprite: poses.nib.idea },
]

function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 sm:px-8">
      <Link to="/a" className="flex items-center gap-2 font-pixel text-2xl text-pa-wool">
        <Sprite id={poses.nib.idle} size={34} />
        cognitio
      </Link>
      <nav className="flex items-center gap-2 font-hyper text-sm text-pa-wool/80 sm:gap-6">
        <a href="#how" className="hidden hover:text-pa-wool sm:inline">How a room works</a>
        <a href="#gaps" className="hidden hover:text-pa-wool sm:inline">Gap board</a>
        <Link to="/a/room" className="px-shadow px-press bg-pa-nib px-4 py-2 font-pixel text-base text-pa-night">
          Open a room
        </Link>
      </nav>
    </header>
  )
}

function Hero() {
  const [area] = useState('code-switched speech recognition')
  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-pa-night">
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <PastureScene />
        </Suspense>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-pa-night/90 via-pa-night/30 to-transparent" />
      <Nav />
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-16 sm:px-8 sm:pb-20">
        <h1 className="pa-hero-line max-w-4xl font-pixel text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.95] text-pa-wool">
          Bring the flock.
          <br />
          Find the gap.
        </h1>
        <p className="pa-hero-line mt-6 max-w-xl font-hyper text-lg leading-relaxed text-pa-wool/85">
          Cognitio gathers the papers in your research area, sums each one up, and names what they leave unstudied.
          Invite your lab and vote on the gaps worth chasing.
        </p>
        <form
          className="pa-hero-line pointer-events-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="px-shadow flex flex-1 items-center gap-3 border-2 border-pa-wool/90 bg-pa-dusk px-4 py-3">
            <span className="sr-only">Research area</span>
            <span className="font-pixel text-pa-bulb">&gt;</span>
            <span className="font-hyper text-pa-wool">{area}</span>
            <span className="caret -ml-2 h-5 w-2 bg-pa-nib" aria-hidden />
          </label>
          <Link to="/a/room" className="px-shadow px-press bg-pa-bulb px-5 py-3 text-center font-pixel text-lg text-pa-night">
            Start the room
          </Link>
        </form>
      </div>
    </section>
  )
}

function HowItWorks() {
  const root = useRef<HTMLElement>(null)
  const runner = useRef<HTMLImageElement>(null)

  useGSAP(
    () => {
      preload([...sequences.nibRun, ...steps.map((s) => s.sprite)])
      if (reducedMotion()) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        const track = root.current!.querySelector('.pa-track') as HTMLElement
        const cards = gsap.utils.toArray<HTMLElement>('.pa-step')
        gsap.set(cards, { opacity: 0.25 })
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=1600',
            pin: true,
            scrub: 0.6,
            onUpdate: (self) => {
              // Run cycle advances with scroll distance; stop on the last step.
              const p = self.progress
              const frame = p > 0.97 ? poses.nib.celebrate : sequences.nibRun[Math.floor(p * 40) % sequences.nibRun.length]
              if (runner.current && !runner.current.src.endsWith(frame + '.png')) runner.current.src = spriteUrl(frame)
            },
          },
        })
        tl.fromTo(runner.current, { x: 0 }, { x: () => track.clientWidth - 96, ease: 'none', duration: 1 }, 0)
        cards.forEach((c, i) => tl.to(c, { opacity: 1, duration: 0.08 }, i * 0.25 + 0.02))
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="how" ref={root} className="relative flex min-h-[100svh] items-center bg-pa-night py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        <h2 className="font-pixel text-4xl text-pa-wool sm:text-5xl">How a room fills up</h2>
        <div className="pa-track relative mt-14 hidden h-24 border-b-4 border-dashed border-pa-moss md:block">
          <img ref={runner} src={spriteUrl(sequences.nibRun[0])} alt="" className="absolute bottom-0 left-0 h-24 w-24 object-contain" />
        </div>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="pa-step px-shadow border-2 border-pa-wool/20 bg-pa-dusk p-5">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-3xl text-pa-bulb">{i + 1}</span>
                <Sprite id={s.sprite} size={48} />
              </div>
              <h3 className="mt-4 font-pixel text-xl text-pa-wool">{s.title}</h3>
              <p className="mt-2 font-hyper text-[15px] leading-relaxed text-pa-wool/75">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Blocks({ votes }: { votes: string[] }) {
  return (
    <div className="flex gap-1" aria-label={`${votes.length} votes`}>
      {votes.map((v) => (
        <span key={v} className="h-4 w-4" style={{ background: members.find((m) => m.id === v)!.color }} />
      ))}
    </div>
  )
}

function GapPreview() {
  const sorted = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  return (
    <section id="gaps" className="bg-pa-dusk py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-8 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <Sprite id={poses.tuft.idea} size={96} />
          <h2 className="mt-6 font-pixel text-4xl leading-tight text-pa-wool sm:text-5xl">The gap board</h2>
          <p className="mt-4 max-w-md font-hyper text-lg leading-relaxed text-pa-wool/80">
            Tuft reads the limitations sections and lists what nobody has tested. Gaps a paper states outright get a
            lamp. Gaps the AI inferred are marked so you can check them.
          </p>
          <p className="mt-4 max-w-md font-hyper text-pa-wool/60">Each colored block is one person’s vote.</p>
        </div>
        <ul className="space-y-3">
          {sorted.map((g) => (
            <li key={g.id} className="px-shadow flex items-start gap-4 border-2 border-pa-wool/15 bg-pa-night p-4">
              <Sprite id={g.stated ? poses.tuft.idea : poses.tuft.question} size={40} />
              <div className="min-w-0 flex-1">
                <p className="font-hyper font-bold text-pa-wool">{g.title}</p>
                <p className="mt-1 font-hyper text-sm text-pa-wool/60">
                  {g.stated ? 'Stated in the papers' : 'Inferred by the AI'} · {g.sources.length} sources
                </p>
              </div>
              <Blocks votes={g.votes} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function MeetThePair() {
  const nibMoods = [poses.nib.happy, poses.nib.think, poses.nib.excited, poses.nib.love, poses.nib.sleep]
  const tuftMoods = [poses.tuft.happy, poses.tuft.think, poses.tuft.idea, poses.tuft.wink, poses.tuft.sleep]
  const [n, setN] = useState(0)
  const [t, setT] = useState(0)
  return (
    <section className="bg-pa-night py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <h2 className="font-pixel text-4xl text-pa-wool sm:text-5xl">Two helpers in every room</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[
            { name: 'Nib', role: 'Reads every paper and writes the two-line summary.', moods: nibMoods, i: n, set: setN, tint: 'rgb(116 221 234 / .14)' },
            { name: 'Tuft', role: 'Hunts for gaps and keeps the vote count honest.', moods: tuftMoods, i: t, set: setT, tint: 'rgb(238 143 168 / .14)' },
          ].map((m) => (
            <button
              key={m.name}
              onClick={() => m.set((m.i + 1) % m.moods.length)}
              className="px-shadow group flex items-center gap-6 border-2 border-pa-wool/20 bg-pa-dusk p-6 text-left"
            >
              <span className="grid h-32 w-32 shrink-0 place-items-center" style={{ background: m.tint }}>
                <Sprite id={m.moods[m.i]} size={112} className="transition-transform group-active:scale-90" />
              </span>
              <span>
                <span className="block font-pixel text-3xl text-pa-wool">{m.name}</span>
                <span className="mt-2 block font-hyper leading-relaxed text-pa-wool/75">{m.role}</span>
                <span className="mt-3 block font-hyper text-sm text-pa-bulb">Tap to change mood</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-pa-moss py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-pixel text-4xl text-pa-wool sm:text-5xl">Your area is waiting.</h2>
          <p className="mt-3 font-hyper text-lg text-pa-wool/80">Free for labs and study groups.</p>
        </div>
        <Link to="/a/room" className="px-shadow px-press bg-pa-bulb px-6 py-4 font-pixel text-xl text-pa-night">
          Open a room
        </Link>
      </div>
      <div className="mx-auto mt-14 flex max-w-6xl items-end gap-3 px-4 sm:px-8">
        {[poses.nib.lying, poses.tuft.lying, poses.nib.sleep, poses.tuft.sleep].map((p) => (
          <Sprite key={p} id={p} size={64} />
        ))}
      </div>
    </footer>
  )
}

export default function PastureLanding() {
  useLenis()
  const root = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.from('.pa-hero-line', { y: 24, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'steps(6)', delay: 0.2 })
    },
    { scope: root },
  )
  return (
    <div ref={root} className="bg-pa-night">
      <Hero />
      <HowItWorks />
      <GapPreview />
      <MeetThePair />
      <Footer />
    </div>
  )
}
