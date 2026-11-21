import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { byId, me, members, room } from '../lib/sample'
import { Sprite } from '../lib/Sprite'
import { Avatar, ButtonLink, Logo } from './ui'

const topLink = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 font-hyper text-sm font-bold ${isActive ? 'text-ds-wool' : 'text-ds-wool/60 hover:text-ds-wool'}`

/** Signed-in frame: top bar + page body. */
export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ds-night text-ds-wool">
      <header className="sticky top-0 z-40 border-b border-ds-line bg-ds-night/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-8">
          <Logo to="/rooms" />
          <nav className="ml-4 hidden items-center sm:flex" aria-label="Main">
            <NavLink to="/rooms" end className={topLink}>Rooms</NavLink>
            <NavLink to="/rooms/new" className={topLink}>New room</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/settings" className="flex items-center gap-2 px-1 py-1 hover:bg-ds-raise" aria-label="Account settings">
              <span className="grid h-9 w-9 place-items-center bg-ds-raise">
                <Sprite id={me.sprite} size={32} />
              </span>
              <span className="hidden font-hyper text-sm font-bold lg:inline">{me.name}</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children ?? <Outlet />}</main>
      <footer className="border-t border-ds-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 font-hyper text-sm text-ds-wool/45 sm:px-8">
          <span>Papers from Semantic Scholar · summaries and gaps by Groq</span>
          <span className="flex items-center gap-2">
            <Sprite id="tuft-r1c6" size={22} /> Nib and Tuft are reading along
          </span>
        </div>
      </footer>
    </div>
  )
}

export function Page({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <div className={`mx-auto px-4 py-10 sm:px-8 sm:py-14 ${wide ? 'max-w-7xl' : 'max-w-5xl'}`}>{children}</div>
}

const tabs = [
  { to: '', label: 'Overview', end: true },
  { to: 'papers', label: 'Papers' },
  { to: 'gaps', label: 'Gaps' },
  { to: 'assistant', label: 'Ask Cognitio' },
  { to: 'members', label: 'Members' },
  { to: 'settings', label: 'Settings' },
]

/** Room frame: room title, who is here, and the room's tabs. */
export function RoomShell() {
  const { roomId = room.id } = useParams()
  const online = members.filter((m) => m.status !== 'idle')
  return (
    <AppShell>
      <div className="border-b border-ds-line bg-ds-panel">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <Sprite id="nib-r2c3" size={64} className="hidden sm:block" />
              <div className="min-w-0">
                <Link to="/rooms" className="font-hyper text-sm font-bold text-ds-wool/55 hover:text-ds-nib">← Rooms</Link>
                <h1 className="mt-1 font-brico text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{room.name}</h1>
                <p className="mt-1 font-hyper text-ds-wool/65">{room.area}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-1" aria-label={`${online.length} people in the room`}>
                {members.map((m) => (
                  <Avatar key={m.id} sprite={m.sprite} color={m.color} dim={m.status === 'idle'} label={byId(members, m.id).name} size={36} />
                ))}
              </div>
              <ButtonLink to={`/rooms/${roomId}/members`} variant="mark" className="py-2">Invite</ButtonLink>
            </div>
          </div>
          <nav className="no-scrollbar -mb-px mt-6 flex gap-1 overflow-x-auto" aria-label="Room">
            {tabs.map((t) => (
              <NavLink
                key={t.label}
                to={`/rooms/${roomId}${t.to ? `/${t.to}` : ''}`}
                end={t.end}
                className={({ isActive }) =>
                  `shrink-0 border-b-2 px-3 py-3 font-hyper text-sm font-bold ${isActive ? 'border-ds-nib text-ds-wool' : 'border-transparent text-ds-wool/55 hover:text-ds-wool'}`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <Outlet />
    </AppShell>
  )
}

/** Centered frame for sign-in, onboarding and invites. */
export function AuthShell({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-ds-night text-ds-wool lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <p className="font-hyper text-sm text-ds-wool/40">No passwords. We email you a link.</p>
      </div>
      <div className="ds-grid relative hidden overflow-hidden border-l border-ds-line bg-ds-panel lg:block">{aside}</div>
    </div>
  )
}
