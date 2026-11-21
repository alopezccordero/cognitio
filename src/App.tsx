import { lazy, Suspense, useEffect } from 'react'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Sprite } from './lib/Sprite'
import { ScrollTrigger } from './lib/smooth'

const PastureLanding = lazy(() => import('./candidates/pasture/Landing'))
const PastureRoom = lazy(() => import('./candidates/pasture/Room'))
const SurveyLanding = lazy(() => import('./candidates/survey/Landing'))
const SurveyRoom = lazy(() => import('./candidates/survey/Room'))
const FogLanding = lazy(() => import('./candidates/fogofwar/Landing'))
const FogRoom = lazy(() => import('./candidates/fogofwar/Room'))
const DissolveLanding = lazy(() => import('./candidates/dissolve/Landing'))
const IslandLanding = lazy(() => import('./candidates/island/Landing'))
const NotebookLanding = lazy(() => import('./candidates/notebook/Landing'))
const NotebookRoom = lazy(() => import('./candidates/notebook/Room'))
const ArcadeLanding = lazy(() => import('./candidates/arcade/Landing'))
const ChartLanding = lazy(() => import('./candidates/chart/Landing'))
const RisoLanding = lazy(() => import('./candidates/riso/Landing'))

type Candidate = {
  key: string
  name: string
  from: string
  room: boolean
  pitch: string
  swatch: string[]
  type: string
  motion: string
  sprite: string
}

const kept: Candidate[] = [
  {
    key: 'a', name: 'Pasture', from: 'Kept', room: true,
    pitch: 'Pixel-game night field. Every person in a room is a sheep in the flock.',
    swatch: ['#10131f', '#24433a', '#74ddea', '#f6c445', '#f3ecdd'],
    type: 'Pixelify Sans + Atkinson Hyperlegible', motion: 'Voxel hillside; Nib runs through the steps', sprite: 'nib-r2c2',
  },
  {
    key: 'b', name: 'Survey', from: 'Kept', room: true,
    pitch: 'A field survey sheet. Papers raise the terrain; gaps are the hatched ground nobody has mapped.',
    swatch: ['#e7f0f1', '#14283c', '#2f8f9d', '#b9d3d6', '#f2da4b'],
    type: 'Bricolage Grotesque + Newsreader', motion: 'Flat map tilts into contour terrain', sprite: 'tuft-r2c4',
  },
  {
    key: 'b-night', name: 'Survey Night', from: 'B, dark mode', room: true,
    pitch: 'The same survey sheet read by lamplight. Contours glow teal, gaps glow yellow.',
    swatch: ['#0b1620', '#0f1f2a', '#4fb8c4', '#e4eef0', '#f2da4b'],
    type: 'Bricolage Grotesque + Newsreader', motion: 'Same as B, night palette in WebGL and SVG', sprite: 'tuft-r1c4',
  },
]

const fresh: Candidate[] = [
  {
    key: 'd', name: 'Fog of War', from: 'A × B', room: true,
    pitch: 'A pixel overworld. Scrolling sends the flock exploring; the fog clears over studied ground and stays over the gaps.',
    swatch: ['#9fd3df', '#7cc47e', '#e8d49a', '#3a4170', '#f2605c'],
    type: 'Pixelify Sans + Atkinson Hyperlegible', motion: 'Scroll-driven fog reveal on a tile map', sprite: 'nib-r3c4',
  },
  {
    key: 'e', name: 'Dissolve', from: 'A × B', room: false,
    pitch: 'Nib breaks into voxels as you scroll, and the voxels settle into the contour map of your research area.',
    swatch: ['#0e121d', '#161c2b', '#74ddea', '#3fa7b4', '#f2da4b'],
    type: 'Bricolage Grotesque + Atkinson Hyperlegible', motion: 'Mascot disintegrates into the map (3D voxels)', sprite: 'nib-r1c3',
  },
  {
    key: 'f', name: 'Floating Island', from: 'A × B', room: false,
    pitch: 'A voxel diorama of the research area. Gaps are real holes in the island that you can look down into.',
    swatch: ['#c9d3f5', '#6fbf73', '#8a5a44', '#1a1d33', '#f6c445'],
    type: 'Bricolage Grotesque + Atkinson Hyperlegible', motion: 'Island turns and dives toward a hole', sprite: 'tuft-r3c4',
  },
  {
    key: 'g', name: 'Field Notebook', from: 'B', room: true,
    pitch: 'Graph paper, a blue pen and a highlighter. Mascots are die-cut stickers; votes are tally marks.',
    swatch: ['#eef3f8', '#c7d7ea', '#1b2a4a', '#2f5bea', '#d7f542'],
    type: 'Schibsted Grotesk + Caveat (notes only)', motion: 'Stack of papers fans open on scroll', sprite: 'nib-r2c3',
  },
  {
    key: 'h', name: 'Night Arcade', from: 'A', room: false,
    pitch: 'A cabinet in the dark. Pick your helper on the player-select screen; the gap board is the high-score table.',
    swatch: ['#171033', '#07141f', '#74ddea', '#ffb547', '#ff6fae'],
    type: 'Pixelify Sans + VT323', motion: 'CRT screen powers on; attract-mode hillside', sprite: 'tuft-r2c0',
  },
  {
    key: 'i', name: 'Nautical Chart', from: 'B', room: false,
    pitch: 'A sea chart. Citation counts are depth soundings; gaps are unsurveyed deep water marked in magenta.',
    swatch: ['#fbfdfd', '#c4e2ee', '#e9dcae', '#17324d', '#b0307a'],
    type: 'Barlow Condensed + Spectral', motion: 'Sonar sweep reveals soundings on scroll', sprite: 'tuft-r4c7',
  },
  {
    key: 'j', name: 'Riso Print', from: 'B', room: false,
    pitch: 'A two-color risograph zine. Tuft dissolves into halftone dots that drift into the printed map.',
    swatch: ['#f3f4f1', '#ff48b0', '#00838a', '#ffe800', '#1d1d2b'],
    type: 'Archivo (wide + narrow)', motion: 'Mascot disintegrates into halftone dots (2D)', sprite: 'tuft-r2c2',
  },
]

const all = [...kept, ...fresh]

function Card({ c }: { c: Candidate }) {
  return (
    <article className="flex flex-col rounded-xl border border-[#dfe2e8] bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">
            {c.key.toUpperCase().replace('-NIGHT', '')}
            {c.key === 'b-night' ? '′' : ''}. {c.name}
          </h3>
          <p className="text-sm text-[#6a7080]">{c.from}</p>
        </div>
        <Sprite id={c.sprite} size={56} />
      </div>
      <div className="mt-4 flex h-9 overflow-hidden rounded-md">
        {c.swatch.map((s) => (
          <span key={s} className="flex-1" style={{ background: s }} />
        ))}
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-[#3a4050]">{c.pitch}</p>
      <dl className="mt-3 space-y-1 text-sm text-[#5a6070]">
        <div><dt className="inline font-medium text-[#1c1f2a]">Type: </dt><dd className="inline">{c.type}</dd></div>
        <div><dt className="inline font-medium text-[#1c1f2a]">Motion: </dt><dd className="inline">{c.motion}</dd></div>
      </dl>
      <div className="mt-auto flex gap-2 pt-6">
        <Link to={`/${c.key}`} className="rounded-md bg-[#1c1f2a] px-4 py-2 text-sm font-medium text-white">Landing page</Link>
        {c.room && (
          <Link to={`/${c.key}/room`} className="rounded-md border border-[#cfd3db] px-4 py-2 text-sm font-medium">Research room</Link>
        )}
      </div>
    </article>
  )
}

function Gallery() {
  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-12 text-[#1c1f2a] sm:px-10" style={{ fontFamily: '"Schibsted Grotesk", system-ui' }}>
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3">
          <Sprite id="nib-r1c0" size={44} />
          <Sprite id="tuft-r1c1" size={44} />
          <h1 className="text-2xl font-semibold">Cognitio GUI directions, round two</h1>
        </div>
        <p className="mt-2 max-w-2xl text-[#4a5060]">
          A and B are kept, and B now has a night mode. D to J are new directions built from A and B. E and J try two
          ways of making the mascot disintegrate on scroll. Use the switcher in the bottom-left corner to step through
          them.
        </p>
        <h2 className="mt-10 text-lg font-semibold">Kept</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">{kept.map((c) => <Card key={c.key} c={c} />)}</div>
        <h2 className="mt-12 text-lg font-semibold">New</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">{fresh.map((c) => <Card key={c.key} c={c} />)}</div>
      </div>
    </main>
  )
}

/** Review-only control for stepping between candidates. Not part of any design. */
function Switcher() {
  const { pathname } = useLocation()
  const nav = useNavigate()
  if (pathname === '/') return null
  const isRoom = pathname.endsWith('/room')
  const key = pathname.replace(/^\//, '').replace(/\/room$/, '')
  const i = all.findIndex((c) => c.key === key)
  const cur = all[i]
  const go = (d: number) => {
    const next = all[(i + d + all.length) % all.length]
    nav(`/${next.key}${isRoom && next.room ? '/room' : ''}`)
  }
  const btn = 'rounded-full px-3 py-1.5 hover:bg-white/15'
  return (
    <nav
      aria-label="Design candidates"
      className="fixed bottom-4 left-4 z-[100] flex items-center gap-1 rounded-full border border-white/20 bg-black/80 p-1 text-xs text-white backdrop-blur"
      style={{ fontFamily: '"Schibsted Grotesk", system-ui' }}
    >
      <Link to="/" className={btn}>All</Link>
      <button onClick={() => go(-1)} className={btn} aria-label="Previous candidate">‹</button>
      <label className="sr-only" htmlFor="cand">Candidate</label>
      <select
        id="cand"
        value={key}
        onChange={(e) => nav(`/${e.target.value}`)}
        className="rounded-full bg-white px-2 py-1.5 font-semibold text-black"
      >
        {all.map((c) => (
          <option key={c.key} value={c.key}>{c.name}</option>
        ))}
      </select>
      <button onClick={() => go(1)} className={btn} aria-label="Next candidate">›</button>
      {cur?.room && (
        <>
          <span className="mx-1 h-4 w-px bg-white/25" />
          <Link to={`/${key}${isRoom ? '' : '/room'}`} className={btn}>{isRoom ? 'Landing' : 'Room'}</Link>
        </>
      )}
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
          <Route path="/b-night" element={<SurveyLanding night />} />
          <Route path="/b-night/room" element={<SurveyRoom night />} />
          <Route path="/d" element={<FogLanding />} />
          <Route path="/d/room" element={<FogRoom />} />
          <Route path="/e" element={<DissolveLanding />} />
          <Route path="/f" element={<IslandLanding />} />
          <Route path="/g" element={<NotebookLanding />} />
          <Route path="/g/room" element={<NotebookRoom />} />
          <Route path="/h" element={<ArcadeLanding />} />
          <Route path="/i" element={<ChartLanding />} />
          <Route path="/j" element={<RisoLanding />} />
        </Routes>
      </Suspense>
      <Switcher />
    </>
  )
}
