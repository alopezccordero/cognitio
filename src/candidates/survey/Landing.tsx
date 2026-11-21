import { lazy, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, reducedMotion, useLenis } from '../../lib/smooth'
import { byId, gaps, members, papers, room } from '../../lib/sample'
import { poses, Sprite } from '../../lib/Sprite'
import { modeFor, SurveyMode, useSurvey } from './theme'

const SurveyScene = lazy(() => import('./SurveyScene'))

function Wordmark() {
  const { base } = useSurvey()
  return (
    <Link to={base} className="flex items-center gap-2 font-brico text-xl font-bold tracking-tight text-sv-ink">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <circle cx="11" cy="11" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="11" cy="11" r="2.5" fill="#f2da4b" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      cognitio
    </Link>
  )
}

function TitleBlock() {
  const rows = [
    ['Area', room.area],
    ['Crew', `${members.length} people, ${members.filter((m) => m.status !== 'idle').length} here now`],
    ['Records', `${room.searched.kept} papers from ${room.searched.source}`],
    ['Uncharted', `${gaps.length} gaps marked`],
  ]
  return (
    <div className="pointer-events-auto w-full max-w-md border-2 border-sv-ink bg-sv-sheet/95 font-brico text-sv-ink shadow-[6px_6px_0_rgb(0_0_0/0.14)]">
      <dl>
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[6.5rem_1fr] border-b border-sv-ink/70">
            <dt className="border-r border-sv-ink/70 px-3 py-2 text-sm text-sv-ink/70">{k}</dt>
            <dd className="px-3 py-2 text-sm font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center gap-3 p-3">
        <Sprite id={poses.tuft.wave} size={44} />
        <Link to={`${useSurvey().base}/room`} className="flex-1 bg-sv-ink px-4 py-3 text-center font-semibold text-sv-sheet hover:bg-sv-contour">
          Open this survey
        </Link>
      </div>
    </div>
  )
}

function Hero() {
  const root = useRef<HTMLElement>(null)
  const progress = useRef(0)
  useGSAP(
    () => {
      if (reducedMotion()) {
        progress.current = 1
        return
      }
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=1100',
          pin: true,
          scrub: true,
          onUpdate: (s) => (progress.current = s.progress),
        },
      })
      tl.to('.sv-cap-a', { opacity: 0, y: -16, duration: 0.3 }, 0.25).fromTo(
        '.sv-cap-b',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.3 },
        0.4,
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative h-[100svh] min-h-[680px] overflow-hidden bg-sv-vellum">
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <SurveyScene progress={progress} pal={useSurvey().pal} />
        </Suspense>
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_18%_22%,color-mix(in_srgb,var(--color-sv-vellum)_92%,transparent),color-mix(in_srgb,var(--color-sv-vellum)_60%,transparent)_30%,transparent_55%)]" />
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-4 sm:px-8">
        <Wordmark />
        <nav className="flex items-center gap-5 font-brico text-sm font-medium text-sv-ink">
          <a href="#log" className="hidden hover:underline sm:inline">Field log</a>
          <a href="#crew" className="hidden hover:underline sm:inline">Crew</a>
          <Link to={`${useSurvey().base}/room`} className="border-2 border-sv-ink px-3 py-1.5 hover:bg-sv-ink hover:text-sv-sheet">Start a survey</Link>
        </nav>
      </header>
      <div className="pointer-events-none relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-between px-4 pb-8 pt-24 sm:px-8">
        <div>
          <h1
            className="max-w-3xl font-brico text-[clamp(2.6rem,7vw,5.75rem)] font-extrabold leading-[0.92] tracking-[-0.03em] text-sv-ink"
            style={{ fontVariationSettings: '"wdth" 78' }}
          >
            Survey a field of research. Mark the ground nobody has covered.
          </h1>
          <div className="relative mt-6 h-16 max-w-md font-news text-xl leading-snug text-sv-ink/85">
            <p className="sv-cap-a absolute inset-0">Seen flat, the papers in your area read like a list.</p>
            <p className="sv-cap-b absolute inset-0 opacity-0">
              Raised, they show where the work piles up, and where it stops.
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse items-start justify-between gap-6 md:flex-row md:items-end">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 font-brico text-sm text-sv-ink" aria-label="Map legend">
            <li className="flex items-center gap-2"><span className="h-0.5 w-6 bg-sv-contour" /> More papers, higher ground</li>
            <li className="flex items-center gap-2"><span className="hatch h-4 w-6 border border-sv-ink/40 bg-sv-mark/70" /> A gap</li>
          </ul>
          <TitleBlock />
        </div>
      </div>
    </section>
  )
}

function FieldLog() {
  return (
    <section id="log" className="border-t-2 border-sv-ink bg-sv-sheet py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="grid gap-6 md:grid-cols-[1fr_16rem]">
          <div>
            <h2 className="font-brico text-4xl font-bold tracking-tight text-sv-ink sm:text-5xl" style={{ fontVariationSettings: '"wdth" 82' }}>
              The field log
            </h2>
            <p className="mt-3 max-w-xl font-news text-lg leading-relaxed text-sv-ink/80">
              Every paper gets a two-sentence summary from the AI. Your crew writes in the margin.
            </p>
          </div>
        </div>
        <ul className="mt-12 border-t border-sv-ink">
          {papers.slice(0, 4).map((p) => (
            <li key={p.id} className="grid gap-4 border-b border-sv-ink/30 py-7 md:grid-cols-[1fr_16rem] md:gap-10">
              <div>
                <p className="font-brico text-sm text-sv-contour">
                  {p.authors} · {p.venue} {p.year}
                </p>
                <h3 className="mt-1 font-brico text-2xl font-semibold leading-tight tracking-tight text-sv-ink">{p.title}</h3>
                <p className="mt-3 max-w-[62ch] font-news text-[17px] leading-[1.65] text-sv-ink/85">{p.summary}</p>
              </div>
              <aside aria-label="Margin notes" className="space-y-3 md:border-l md:border-dashed md:border-sv-ink/40 md:pl-5">
                {p.annotations.length === 0 && <p className="font-news italic text-sv-ink/45">No notes yet</p>}
                {p.annotations.map((a, i) => {
                  const m = byId(members, a.by)
                  return (
                    <p key={i} className="font-news text-[15px] italic leading-snug text-sv-ink/85">
                      <span className="not-italic font-brico text-xs font-semibold" style={{ borderBottom: `3px solid ${m.color}` }}>
                        {m.name.split(' ')[0]}
                      </span>{' '}
                      {a.text}
                    </p>
                  )
                })}
              </aside>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Uncharted() {
  const sorted = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  return (
    <section className="bg-sv-vellum py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <h2 className="font-brico text-4xl font-bold tracking-tight text-sv-ink sm:text-5xl" style={{ fontVariationSettings: '"wdth" 82' }}>
          Uncharted ground
        </h2>
        <p className="mt-3 max-w-xl font-news text-lg leading-relaxed text-sv-ink/80">
          The AI marks what the papers leave untested. Solid marks are gaps the authors name themselves; dashed marks
          are inferred. The crew votes on which to explore.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {sorted.map((g) => (
            <article
              key={g.id}
              className={`relative bg-sv-sheet p-6 ${g.stated ? 'border-2 border-sv-ink' : 'border-2 border-dashed border-sv-ink/70'}`}
            >
              <div className="hatch absolute inset-y-0 left-0 w-2 bg-sv-mark" aria-hidden />
              <div className="flex items-start justify-between gap-4 pl-3">
                <h3 className="font-brico text-xl font-semibold leading-snug text-sv-ink">{g.title}</h3>
                <span className="shrink-0 font-brico text-3xl font-bold text-sv-ink">{g.votes.length}</span>
              </div>
              <p className="mt-2 pl-3 font-news text-[16px] leading-relaxed text-sv-ink/80">{g.detail}</p>
              <p className="mt-4 pl-3 font-brico text-xs text-sv-ink/60">{g.stated ? 'Named in the papers' : 'Inferred by the AI'}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Crew() {
  return (
    <section id="crew" className="border-t-2 border-sv-ink bg-sv-sheet py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-8 md:grid-cols-2">
        <div>
          <h2 className="font-brico text-4xl font-bold tracking-tight text-sv-ink sm:text-5xl" style={{ fontVariationSettings: '"wdth" 82' }}>
            Survey with a crew
          </h2>
          <p className="mt-3 max-w-md font-news text-lg leading-relaxed text-sv-ink/80">
            Share a room link with your lab. You can see who is reading which paper, who is writing a note, and who
            is still deciding how to vote.
          </p>
          <Link to={`${useSurvey().base}/room`} className="mt-8 inline-block bg-sv-ink px-5 py-3 font-brico font-semibold text-sv-sheet hover:bg-sv-contour">
            Start a survey
          </Link>
        </div>
        <ul className="space-y-3">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-4 border-b border-sv-ink/20 pb-3">
              <span className="grid h-11 w-11 place-items-center rounded-full border-2 font-brico text-sm font-bold text-sv-ink" style={{ borderColor: m.color, background: `${m.color}33` }}>
                {m.initials}
              </span>
              <span className="flex-1">
                <span className="block font-brico font-semibold text-sv-ink">{m.name}</span>
                <span className="block font-news text-sm italic text-sv-ink/65">
                  {m.status === 'idle' ? 'away' : `${m.status} ${m.where ? (m.where.startsWith('p') ? byId(papers, m.where).authors.split(',')[0] + ' et al.' : 'a gap') : ''}`}
                </span>
              </span>
              <Sprite id={m.status === 'idle' ? (m.sprite.startsWith('nib') ? poses.nib.sleep : poses.tuft.sleep) : m.sprite} size={44} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function SurveyLanding({ night = false }: { night?: boolean }) {
  useLenis()
  return (
    <SurveyMode.Provider value={modeFor(night)}>
    <div className={`bg-sv-vellum ${night ? 'sv-night' : ''}`}>
      <Hero />
      <FieldLog />
      <Uncharted />
      <Crew />
      <footer className="border-t-2 border-sv-ink bg-sv-vellum px-4 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between font-brico text-sm text-sv-ink/70">
          <Wordmark />
          <span>Records from OpenAlex and Semantic Scholar</span>
        </div>
      </footer>
    </div>
    </SurveyMode.Provider>
  )
}
