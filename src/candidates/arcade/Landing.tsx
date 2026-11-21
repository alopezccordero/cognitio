import { lazy, Suspense, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, reducedMotion, useLenis } from '../../lib/smooth'
import { gaps, members, room } from '../../lib/sample'
import { poses, Sprite, SpriteLoop } from '../../lib/Sprite'

const PastureScene = lazy(() => import('../pasture/PastureScene'))

const glow = (c: string) => ({ textShadow: `0 0 6px ${c}, 0 0 18px ${c}` })

function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-ar-screen shadow-[inset_0_0_60px_rgb(0_0_0/.9),0_0_0_10px_#0c0820,0_0_0_14px_#3a2c6e] ${className}`}>
      {children}
      {/* scanlines + vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,rgb(0_0_0/.28)_0_2px,transparent_2px_4px)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(0_0_0/.65))]" />
    </div>
  )
}

function Cabinet() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      if (reducedMotion()) return
      // the one orchestrated moment: the tube powers on
      gsap
        .timeline({ delay: 0.25 })
        .fromTo('.ar-tube', { scaleY: 0.004, scaleX: 0.6, filter: 'brightness(4)' }, { scaleY: 0.004, scaleX: 1, duration: 0.25, ease: 'power2.out' })
        .to('.ar-tube', { scaleY: 1, duration: 0.35, ease: 'power3.out' })
        .to('.ar-tube', { filter: 'brightness(1)', duration: 0.4 }, '<0.1')
      // scrolling walks you into the screen
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=900', pin: true, scrub: true } })
        .to('.ar-frame', { scale: 2.3, ease: 'power1.in' }, 0)
        .to('.ar-marquee, .ar-panel', { opacity: 0, duration: 0.4 }, 0)
    },
    { scope: root },
  )
  return (
    <section ref={root} className="relative flex h-[100svh] min-h-[680px] items-center justify-center overflow-hidden bg-ar-cab px-4">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:repeating-linear-gradient(115deg,transparent_0_40px,rgb(255_111_174/.08)_40px_44px,transparent_44px_90px,rgb(116_221_234/.08)_90px_94px)]" />
      <div className="ar-frame relative flex w-full max-w-4xl origin-[50%_45%] flex-col items-center">
        <div className="ar-marquee mb-6 w-full rounded-t-3xl border-4 border-[#3a2c6e] bg-ar-cab2 px-6 py-3 text-center">
          <p className="font-pixel text-5xl text-ar-pink sm:text-6xl" style={glow('#ff6fae')}>COGNITIO</p>
        </div>
        <Screen className="ar-tube aspect-[4/3] w-full sm:aspect-[16/10]">
          <div className="absolute inset-0 opacity-80">
            <Suspense fallback={null}>
              <PastureScene />
            </Suspense>
          </div>
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
            <h1 className="font-pixel text-[clamp(1.8rem,4.6vw,3.6rem)] leading-tight text-ar-cyan" style={glow('#74ddea')}>
              Find the gap
              <br />
              in any field
            </h1>
            <p className="mt-4 max-w-md font-vt text-2xl leading-tight text-white/85">
              A research room for your whole lab. Papers explained, gaps named, votes counted.
            </p>
            <form className="mt-6 flex w-full max-w-md items-center gap-2 border-2 border-ar-amber/80 bg-black/50 px-3 py-2" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="ar-area" className="font-vt text-2xl text-ar-amber">AREA&gt;</label>
              <input id="ar-area" defaultValue={room.name.toLowerCase()} className="min-w-0 flex-1 bg-transparent font-vt text-2xl text-white focus:outline-none" />
            </form>
            <Link to="/a/room" className="caret mt-6 font-pixel text-2xl text-ar-amber" style={glow('#ffb547')}>
              PRESS START
            </Link>
          </div>
        </Screen>
        <div className="ar-panel mt-6 flex w-full items-center justify-center gap-8 rounded-b-3xl border-4 border-[#3a2c6e] bg-ar-cab2 py-4">
          <span className="h-10 w-10 rounded-full bg-ar-pink shadow-[0_4px_0_#a8336c]" aria-hidden />
          <span className="h-10 w-10 rounded-full bg-ar-cyan shadow-[0_4px_0_#3a9aa6]" aria-hidden />
          <span className="h-10 w-10 rounded-full bg-ar-amber shadow-[0_4px_0_#b87a1f]" aria-hidden />
          <span className="font-vt text-xl text-white/60">1–5 players</span>
        </div>
      </div>
    </section>
  )
}

function PlayerSelect() {
  const [pick, setPick] = useState<'nib' | 'tuft'>('nib')
  const [engine, setEngine] = useState<'Claude' | 'GPT'>('Claude')
  const chars = [
    { k: 'nib' as const, name: 'NIB', role: 'Reads every paper and writes the two-line summary.', idle: [poses.nib.idle, poses.nib.happy], stats: [['Summaries', 5], ['Gap finding', 3], ['Patience', 4]] },
    { k: 'tuft' as const, name: 'TUFT', role: 'Reads the limitations sections and names the gaps.', idle: [poses.tuft.idle, poses.tuft.idea], stats: [['Summaries', 3], ['Gap finding', 5], ['Patience', 3]] },
  ]
  return (
    <section className="bg-ar-cab py-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-center font-pixel text-4xl text-white sm:text-5xl">Select your helper</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {chars.map((c) => {
            const on = pick === c.k
            return (
              <button
                key={c.k}
                onClick={() => setPick(c.k)}
                aria-pressed={on}
                className={`rounded-2xl border-4 p-6 text-left transition-colors ${on ? 'border-ar-amber bg-ar-cab2' : 'border-[#3a2c6e] bg-ar-cab hover:border-ar-cyan/60'}`}
              >
                <div className="flex items-center gap-5">
                  <SpriteLoop frames={on ? c.idle : [c.idle[0]]} fps={2} size={120} />
                  <div>
                    <p className="font-pixel text-3xl text-ar-cyan" style={on ? glow('#74ddea') : undefined}>{c.name}</p>
                    <p className="mt-1 font-vt text-xl leading-tight text-white/80">{c.role}</p>
                  </div>
                </div>
                <dl className="mt-5 space-y-2">
                  {c.stats.map(([label, v]) => (
                    <div key={label as string} className="flex items-center gap-3">
                      <dt className="w-32 font-vt text-xl text-white/70">{label}</dt>
                      <dd className="flex gap-1" aria-label={`${v} of 5`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`h-4 w-6 ${i < (v as number) ? 'bg-ar-amber' : 'bg-white/10'}`} />
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 font-pixel text-ar-amber">{on ? 'Player 1 ready' : 'Press to choose'}</p>
              </button>
            )
          })}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3" role="radiogroup" aria-label="AI model">
          <span className="font-vt text-2xl text-white/70">Model:</span>
          {(['Claude', 'GPT'] as const).map((m) => (
            <button key={m} role="radio" aria-checked={engine === m} onClick={() => setEngine(m)} className={`border-2 px-4 py-1 font-pixel ${engine === m ? 'border-ar-cyan bg-ar-cyan text-ar-cab' : 'border-white/30 text-white/80'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function HighScores() {
  const sorted = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  return (
    <section className="bg-ar-cab2 py-24">
      <div className="mx-auto max-w-4xl px-4">
        <Screen className="px-6 py-10 sm:px-12">
          <h2 className="relative z-10 text-center font-pixel text-4xl text-ar-amber sm:text-5xl" style={glow('#ffb547')}>High scores</h2>
          <p className="relative z-10 mt-2 text-center font-vt text-2xl text-white/70">The gaps your lab wants to chase, by votes</p>
          <table className="relative z-10 mx-auto mt-8 w-full max-w-2xl font-vt text-2xl">
            <thead>
              <tr className="text-ar-pink">
                <th className="pb-3 text-left font-normal">Rank</th>
                <th className="pb-3 text-left font-normal">Gap</th>
                <th className="pb-3 text-right font-normal">Votes</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((g, i) => (
                <tr key={g.id} className={i === 0 ? 'text-ar-cyan' : 'text-white/85'}>
                  <td className="py-1.5 pr-4 align-top">{['1st', '2nd', '3rd', '4th'][i]}</td>
                  <td className="py-1.5 pr-4 leading-tight">{g.title}</td>
                  <td className="py-1.5 text-right align-top tabular-nums">{String(g.votes.length).padStart(2, '0')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Screen>
      </div>
    </section>
  )
}

function Players() {
  return (
    <section className="bg-ar-cab py-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="font-pixel text-4xl text-white sm:text-5xl">Co-op mode</h2>
        <p className="mt-3 max-w-xl font-vt text-2xl leading-tight text-white/75">
          Everyone who joins a room takes a player slot. You see who is reading, writing a note or voting, live.
        </p>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {members.map((m, i) => (
            <li key={m.id} className="rounded-xl border-4 border-[#3a2c6e] bg-ar-cab2 p-4 text-center">
              <p className="font-pixel text-sm" style={{ color: m.color }}>P{i + 1}</p>
              <Sprite id={m.status === 'idle' ? poses.nib.sleep : m.sprite} size={64} className="mx-auto mt-2" />
              <p className="mt-2 font-pixel text-white">{m.initials}</p>
              <p className="font-vt text-xl" style={{ color: m.status === 'idle' ? '#8a84b0' : m.color }}>
                {m.status === 'idle' ? 'AWAY' : m.status.toUpperCase()}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-16 text-center">
          <p className="font-pixel text-3xl text-ar-amber" style={glow('#ffb547')}>Insert an area of study</p>
          <Link to="/a/room" className="mt-6 inline-block rounded-full bg-ar-pink px-8 py-3 font-pixel text-xl text-ar-cab shadow-[0_5px_0_#a8336c] active:translate-y-1 active:shadow-none">
            Open a room
          </Link>
          <p className="mt-6 font-vt text-xl text-white/50">Free play for labs and study groups. Papers from OpenAlex.</p>
        </div>
      </div>
    </section>
  )
}

export default function ArcadeLanding() {
  useLenis()
  return (
    <div className="bg-ar-cab">
      <Cabinet />
      <PlayerSelect />
      <HighScores />
      <Players />
    </div>
  )
}
