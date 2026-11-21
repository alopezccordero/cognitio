import { lazy, Suspense, useEffect, type ComponentType } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AppShell, RoomShell } from './components/Shell'
import { Mascot } from './components/ui'
import { ScrollTrigger } from './lib/smooth'
import { poses } from './lib/Sprite'

// Lazy-load each page; `pick` lets a file export several pages by name.
const pick = <M extends Record<string, ComponentType>>(load: () => Promise<M>, name: keyof M) =>
  lazy(() => load().then((m) => ({ default: m[name] })))

const auth = () => import('./pages/Auth')
const roomsPages = () => import('./pages/Rooms')
const paperPages = () => import('./pages/Papers')
const gapPages = () => import('./pages/Gaps')
const settingsPages = () => import('./pages/Settings')

const Landing = lazy(() => import('./pages/Landing'))
const Login = pick(auth, 'Login')
const CheckEmail = pick(auth, 'CheckEmail')
const Welcome = pick(auth, 'Welcome')
const Join = pick(auth, 'Join')
const RoomsDashboard = pick(roomsPages, 'RoomsDashboard')
const NewRoom = pick(roomsPages, 'NewRoom')
const RoomOverview = lazy(() => import('./pages/RoomOverview'))
const PaperList = pick(paperPages, 'PaperList')
const PaperDetail = pick(paperPages, 'PaperDetail')
const GapBoard = pick(gapPages, 'GapBoard')
const GapDetail = pick(gapPages, 'GapDetail')
const Assistant = lazy(() => import('./pages/Assistant'))
const Members = lazy(() => import('./pages/Members'))
const RoomSettings = pick(settingsPages, 'RoomSettings')
const AccountSettings = pick(settingsPages, 'AccountSettings')
const NotFound = lazy(() => import('./pages/NotFound'))

function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center bg-ds-night">
      <Mascot id={poses.tuft.hover} size={96} />
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [pathname])
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/check" element={<CheckEmail />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/join/:code" element={<Join />} />

        <Route element={<AppShell />}>
          <Route path="/rooms" element={<RoomsDashboard />} />
          <Route path="/rooms/new" element={<NewRoom />} />
          <Route path="/settings" element={<AccountSettings />} />
        </Route>

        <Route path="/rooms/:roomId" element={<RoomShell />}>
          <Route index element={<RoomOverview />} />
          <Route path="papers" element={<PaperList />} />
          <Route path="papers/:paperId" element={<PaperDetail />} />
          <Route path="gaps" element={<GapBoard />} />
          <Route path="gaps/:gapId" element={<GapDetail />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="members" element={<Members />} />
          <Route path="settings" element={<RoomSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
