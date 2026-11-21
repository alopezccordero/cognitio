import { lazy, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, reducedMotion, useLenis } from '../../lib/smooth'
import { byId, gaps, members, papers } from '../../lib/sample'
import { poses, Sprite } from '../../lib/Sprite'

const IslandScene = lazy(() => import('./IslandScene'))

function Hero() {
  const root = useRef<HTMLElement>(null)
  const progress = useRef(0)
  useGSAP(
    () => {
      if (reducedMotion()) return
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=1600', pin: true, scrub: true, onUpdate: (s) => (progress.current = s.progress) },
      })
      tl.to('.fi-a', { opacity: 0, y: -20, duration: 0.1 }, 0.35).fromTo('.fi-b', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.1 }, 0.7)
    },
    { scope: root },
  )
  return (
    <section ref={root} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[linear-gradient(180deg,#b9c6f2_0%,#e4e9fb_70%,#f4f6fd_100%)]">
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <IslandScene progress={progress} />
        </Suspense>
      </div>
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-5 sm:px-8">
        <Link to="/f" className="flex items-center gap-2 font-brico text-xl font-bold tracking-tight text-fi-ink">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-fi-grass shadow-[inset_0_-6px_0_#8a5a44]"><span className="h-1.5 w-1.5 bg-fi-void" /></span>
          cognitio
        </Link>
        <Link to="/b/room" className="rounded-full bg-fi-ink px-5 py-2.5 font-hyper text-sm font-bold text-white hover:bg-fi-soil">Open a room</Link>
      </header>
      <div className="pointer-events-none relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-between px-4 pb-10 pt-28 sm:px-8">
        <div className="relative max-w-xl">
          <div className="fi-a">
            <h1 className="font-brico text-[clamp(2.4rem,5.5vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-fi-ink">
              Your research area, as a place you can walk around.
            </h1>
            <p className="mt-5 max-w-md font-hyper text-lg leading-relaxed text-fi-ink/80">
              Cognitio builds an island from the papers in your field. Hills are where the work piles up. Flags are papers.
            </p>
          </div>
          <div className="fi-b absolute inset-x-0 top-0 opacity-0">
            <h2 className="font-brico text-[clamp(2.4rem,5.5vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-fi-ink">
              The holes are the gaps.
            </h2>
            <p className="mt-5 max-w-md font-hyper text-lg leading-relaxed text-fi-ink/80">
              Each pit is a question no paper has answered. A lamp at the bottom means the papers say so themselves.
            </p>
          </div>
        </div>
        <Link to="/b/room" className="pointer-events-auto inline-flex w-fit items-center gap-3 rounded-full bg-fi-lamp py-2 pl-2 pr-6 font-hyper font-bold text-fi-ink shadow-[0_6px_0_#c99a22]">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white/50"><Sprite id={poses.nib.jumpHappy} size={36} /></span>
          Build my island
        </Link>
      </div>
    </section>
  )
}

function Pits() {
  const sorted = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  return (
    <section className="bg-[#f4f6fd] py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <h2 className="font-brico text-4xl font-extrabold tracking-tight text-fi-ink sm:text-5xl">Four holes on this island</h2>
        <p className="mt-3 max-w-xl font-hyper text-lg text-fi-ink/75">Your lab votes on which one to dig into first.</p>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {sorted.map((g) => (
            <li key={g.id} className="flex gap-5 rounded-3xl bg-white p-5 shadow-[0_6px_0_#d7ddf3]">
              {/* a little pit, drawn in CSS */}
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-fi-soil">
                <div className="absolute inset-x-0 top-0 h-3 bg-fi-grass" />
                <div className="absolute inset-x-5 bottom-0 top-3 bg-fi-void">
                  {g.stated && <span className="absolute bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 bg-fi-lamp shadow-[0_0_14px_6px_rgb(246_196_69/0.6)]" />}
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="font-brico text-lg font-bold leading-snug text-fi-ink">{g.title}</h3>
                <p className="mt-1 font-hyper text-[15px] leading-relaxed text-fi-ink/70">{g.detail}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="flex -space-x-1.5">
                    {g.votes.map((v) => (
                      <span key={v} className="h-6 w-6 rounded-full border-2 border-white" style={{ background: byId(members, v).color }} title={byId(members, v).name} />
                    ))}
                  </span>
                  <span className="font-hyper text-sm text-fi-ink/60">{g.votes.length} {g.votes.length === 1 ? 'vote' : 'votes'}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Flags() {
  return (
    <section className="bg-fi-ink py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-brico text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Every flag is a paper</h2>
          <Sprite id={poses.tuft.wave} size={96} className="hidden sm:block" />
        </div>
        <ul className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {papers.map((p) => (
            <li key={p.id} className="border-t border-white/15 pt-5">
              <p className="font-hyper text-sm text-fi-lamp">{p.authors} · {p.venue} {p.year}</p>
              <h3 className="mt-1 font-brico text-xl font-bold leading-snug text-white">{p.title}</h3>
              <p className="mt-2 max-w-prose font-hyper leading-relaxed text-white/70">{p.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function IslandLanding() {
  useLenis()
  return (
    <div className="bg-fi-sky">
      <Hero />
      <Pits />
      <Flags />
    </div>
  )
}
