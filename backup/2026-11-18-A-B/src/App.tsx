import { lazy, Suspense, useEffect } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Sprite } from './lib/Sprite'
import { ScrollTrigger } from './lib/smooth'

const PastureLanding = lazy(() => import('./candidates/pasture/Landing'))
const PastureRoom = lazy(() => import('./candidates/pasture/Room'))
const SurveyLanding = lazy(() => import('./candidates/survey/Landing'))
const SurveyRoom = lazy(() => import('./candidates/survey/Room'))
const OrbitLanding = lazy(() => import('./candidates/orbit/Landing'))
const OrbitRoom = lazy(() => import('./candidates/orbit/Room'))

const candidates = [
  {
    key: 'a',
    name: 'Pasture',
    pitch: 'Pixel-game night field. The mascots are the interface; every person in a room is a sheep in the flock.',
    swatch: ['#10131f', '#24433a', '#74ddea', '#f6c445', '#f3ecdd'],
    type: 'Pixelify Sans + Atkinson Hyperlegible',
    three: 'Voxel hillside with the mascots grazing',
    sprite: 'nib-r2c2',
  },
  {
    key: 'b',
    name: 'Survey',
    pitch: 'A field survey sheet. Papers raise the terrain; gaps are the flat, hatched ground nobody has mapped.',
    swatch: ['#e7f0f1', '#14283c', '#2f8f9d', '#b9d3d6', '#f2da4b'],
    type: 'Bricolage Grotesque + Newsreader',
    three: 'Contour-line terrain built from paper density',
    sprite: 'tuft-r2c4',
  },
  {
    key: 'c',
    name: 'Orbit',
    pitch: 'Papers as a 3D constellation grouped by topic. Gaps glow as lamps in the empty space between clusters.',
    swatch: ['#161b4d', '#0f1338', '#8fe7f5', '#ffc94d', '#a9a4ff'],
    type: 'Unbounded + Figtree',
    three: 'Citation constellation the camera flies through on scroll',
    sprite: 'tuft-r4c7',
  },
]

function Gallery() {
  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-12 text-[#1c1f2a] sm:px-10" style={{ fontFamily: 'Figtree, system-ui' }}>
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3">
          <Sprite id="nib-r1c0" size={44} />
          <Sprite id="tuft-r1c1" size={44} />
          <h1 className="text-2xl font-semibold">Cognitio — three GUI directions</h1>
        </div>
        <p className="mt-2 max-w-2xl text-[#4a5060]">
          Each direction has a landing page and a research room. Same content, same mascots, different point of view. Use
          the switcher in the bottom-left corner to flip between them.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {candidates.map((c) => (
            <article key={c.key} className="flex flex-col rounded-xl border border-[#dfe2e8] bg-white p-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold">
                  {c.key.toUpperCase()}. {c.name}
                </h2>
                <Sprite id={c.sprite} size={56} />
              </div>
              <div className="mt-4 flex h-10 overflow-hidden rounded-md">
                {c.swatch.map((s) => (
                  <span key={s} className="flex-1" style={{ background: s }} />
                ))}
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-[#3a4050]">{c.pitch}</p>
              <dl className="mt-4 space-y-1 text-sm text-[#5a6070]">
                <div><dt className="inline font-medium text-[#1c1f2a]">Type: </dt><dd className="inline">{c.type}</dd></div>
                <div><dt className="inline font-medium text-[#1c1f2a]">3D: </dt><dd className="inline">{c.three}</dd></div>
              </dl>
              <div className="mt-auto flex gap-2 pt-6">
                <Link to={`/${c.key}`} className="rounded-md bg-[#1c1f2a] px-4 py-2 text-sm font-medium text-white">
                  Landing page
                </Link>
                <Link to={`/${c.key}/room`} className="rounded-md border border-[#cfd3db] px-4 py-2 text-sm font-medium">
                  Research room
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

/** Review-only control for flipping between candidates. Not part of any design. */
function Switcher() {
  const { pathname } = useLocation()
  if (pathname === '/') return null
  const isRoom = pathname.endsWith('/room')
  return (
    <nav
      aria-label="Design candidates"
      className="fixed bottom-4 left-4 z-[100] flex items-center gap-1 rounded-full border border-white/20 bg-black/75 p-1 text-xs text-white backdrop-blur"
      style={{ fontFamily: 'Figtree, system-ui' }}
    >
      <Link to="/" className="rounded-full px-3 py-1.5 hover:bg-white/15">All</Link>
      {candidates.map((c) => (
        <NavLink
          key={c.key}
          to={`/${c.key}${isRoom ? '/room' : ''}`}
          className={({ isActive }) => `rounded-full px-3 py-1.5 ${isActive ? 'bg-white text-black' : 'hover:bg-white/15'}`}
        >
          {c.key.toUpperCase()} {c.name}
        </NavLink>
      ))}
      <span className="mx-1 h-4 w-px bg-white/25" />
      <Link to={pathname.replace(/\/room$/, '') + (isRoom ? '' : '/room')} className="rounded-full px-3 py-1.5 hover:bg-white/15">
        {isRoom ? 'Landing' : 'Room'}
      </Link>
    </nav>
  )
}

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [pathname])
  return (
    <>
      <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/a" element={<PastureLanding />} />
          <Route path="/a/room" element={<PastureRoom />} />
          <Route path="/b" element={<SurveyLanding />} />
          <Route path="/b/room" element={<SurveyRoom />} />
          <Route path="/c" element={<OrbitLanding />} />
          <Route path="/c/room" element={<OrbitRoom />} />
        </Routes>
      </Suspense>
      <Switcher />
    </>
  )
}
