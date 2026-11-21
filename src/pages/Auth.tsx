import { lazy, Suspense, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SceneBoundary } from '../components/SceneBoundary'
import { AuthShell } from '../components/Shell'
import { Button, ButtonLink, Field, Input, Mascot, MascotSays } from '../components/ui'
import { noSubmit } from '../lib/form'
import { byId, me, members, room } from '../lib/sample'
import { reducedMotion } from '../lib/smooth'
import { poses, Sprite } from '../lib/Sprite'

const ReassembleCanvas = lazy(() => import('../scenes/DissolveScene').then((m) => ({ default: m.ReassembleCanvas })))

/** Tuft pulls itself back together once when the page opens. */
function AssembleAside({ caption }: { caption: string }) {
  const progress = useRef(0)
  useEffect(() => {
    if (reducedMotion()) {
      progress.current = 1
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      progress.current = Math.min(1, (t - start) / 2600)
      if (progress.current < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="flex h-full flex-col items-center justify-center p-10">
      <div className="h-[420px] w-full max-w-md">
        <SceneBoundary fallback={<Mascot id={poses.tuft.cheer} size={260} className="mx-auto block" />}>
          <Suspense fallback={<Mascot id={poses.tuft.cheer} size={260} className="mx-auto block" />}>
            <ReassembleCanvas progress={progress} />
          </Suspense>
        </SceneBoundary>
      </div>
      <p className="mt-4 max-w-sm text-center font-brico text-2xl font-bold leading-snug text-ds-wool">{caption}</p>
    </div>
  )
}

export function Login() {
  const nav = useNavigate()
  return (
    <AuthShell aside={<AssembleAside caption="Tuft has the map ready. Sign in to open your rooms." />}>
      <Mascot id={poses.nib.wave} size={80} className="lg:hidden" />
      <h1 className="mt-4 font-brico text-4xl font-bold tracking-tight">Sign in to Cognitio</h1>
      <p className="mt-3 font-hyper text-lg text-ds-wool/70">Enter your email and we’ll send you a sign-in link. New here? The same link creates your account.</p>
      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          noSubmit(e)
          nav('/login/check')
        }}
      >
        <Field label="Email">
          <Input type="email" name="email" placeholder="you@university.edu" autoComplete="email" />
        </Field>
        <Button type="submit" className="w-full py-3">Email me a sign-in link</Button>
      </form>
      <div className="my-8 flex items-center gap-3 font-hyper text-sm text-ds-wool/40">
        <span className="h-px flex-1 bg-ds-line" /> or <span className="h-px flex-1 bg-ds-line" />
      </div>
      <ButtonLink to="/join/NIB-4K7Q" variant="ghost" className="w-full py-3">I have an invite code</ButtonLink>
      <p className="mt-8 font-hyper text-sm text-ds-wool/50">
        By continuing you agree to the <a href="#terms" className="underline hover:text-ds-nib">terms</a> and <a href="#privacy" className="underline hover:text-ds-nib">privacy policy</a>.
      </p>
    </AuthShell>
  )
}

export function CheckEmail() {
  return (
    <AuthShell aside={<AssembleAside caption="While you check your inbox, Tuft is warming up." />}>
      <Mascot id={poses.nib.idea} size={120} />
      <h1 className="mt-6 font-brico text-4xl font-bold tracking-tight">Check your email</h1>
      <p className="mt-3 font-hyper text-lg text-ds-wool/70">
        We sent a sign-in link to <span className="font-bold text-ds-wool">{me.email}</span>. It works once and expires in 15 minutes.
      </p>
      <div className="mt-8 border border-ds-line bg-ds-panel p-5 font-hyper text-ds-wool/70">
        <p className="font-bold text-ds-wool">Didn’t get it?</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
          <li>Look in your spam or promotions folder</li>
          <li>Make sure the address is spelled right</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="ghost">Resend link</Button>
          <ButtonLink to="/login" variant="quiet">Use a different email</ButtonLink>
        </div>
      </div>
      <p className="mt-6 font-hyper text-sm text-ds-wool/45">
        Preview only: <Link to="/welcome" className="underline hover:text-ds-nib">continue as if you clicked the link</Link>
      </p>
    </AuthShell>
  )
}

export function Welcome() {
  const nav = useNavigate()
  return (
    <AuthShell aside={<AssembleAside caption="Pick who reads with you. You can change it later." />}>
      <p className="font-hyper text-sm font-bold text-ds-nib">Step 1 of 1</p>
      <h1 className="mt-1 font-brico text-4xl font-bold tracking-tight">Welcome aboard</h1>
      <p className="mt-3 font-hyper text-lg text-ds-wool/70">Tell your labmates who you are. This is how you appear in rooms.</p>
      <form
        className="mt-8 space-y-6"
        onSubmit={(e) => {
          noSubmit(e)
          nav('/rooms')
        }}
      >
        <Field label="Your name">
          <Input defaultValue={me.name} autoComplete="name" />
        </Field>
        <Field label="Role" hint="Optional. Shown next to your name in rooms.">
          <Input placeholder="PhD student, Speech lab" />
        </Field>
        <fieldset>
          <legend className="font-hyper text-sm font-bold">Your mascot</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {[
              { id: 'nib', name: 'Nib', note: 'Flat cyan robot sheep', sprite: poses.nib.happy },
              { id: 'tuft', name: 'Tuft', note: 'Voxel robotic lamb', sprite: poses.tuft.happy },
            ].map((m) => (
              <label key={m.id} className="cursor-pointer border border-ds-line bg-ds-panel p-4 has-[:checked]:border-ds-nib has-[:checked]:bg-ds-raise">
                <input type="radio" name="mascot" value={m.id} defaultChecked={m.id === me.mascot} className="sr-only" />
                <Sprite id={m.sprite} size={72} />
                <p className="mt-2 font-hyper font-bold">{m.name}</p>
                <p className="font-hyper text-sm text-ds-wool/55">{m.note}</p>
              </label>
            ))}
          </div>
        </fieldset>
        <Button type="submit" className="w-full py-3">Go to my rooms</Button>
      </form>
    </AuthShell>
  )
}

export function Join() {
  const owner = byId(members, room.owner)
  return (
    <AuthShell aside={<AssembleAside caption={`${members.length} people are already mapping this area.`} />}>
      <Mascot id={poses.nib.excited} size={110} />
      <p className="mt-6 font-hyper text-sm font-bold text-ds-nib">You’re invited</p>
      <h1 className="mt-1 font-brico text-4xl font-bold tracking-tight">{room.name}</h1>
      <p className="mt-3 font-hyper text-lg text-ds-wool/70">{room.area}</p>
      <div className="mt-6 grid grid-cols-3 gap-px border border-ds-line bg-ds-line">
        {[
          [room.searched.kept, 'papers'],
          [4, 'gaps'],
          [members.length, 'members'],
        ].map(([v, l]) => (
          <div key={l} className="bg-ds-panel p-4">
            <p className="font-brico text-3xl font-bold">{v}</p>
            <p className="font-hyper text-sm text-ds-wool/55">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <MascotSays id={owner.sprite} size={48}>
          <span className="font-bold text-ds-wool">{owner.name}</span> invited you to read and vote on gaps together.
        </MascotSays>
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        <ButtonLink to={`/rooms/${room.id}`}>Join room</ButtonLink>
        <ButtonLink to="/rooms" variant="quiet">Not now</ButtonLink>
      </div>
      <p className="mt-6 font-hyper text-sm text-ds-wool/45">Invite code {room.invite}</p>
    </AuthShell>
  )
}
