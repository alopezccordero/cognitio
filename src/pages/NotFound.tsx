import { ButtonLink, Logo, Mascot } from '../components/ui'
import { poses } from '../lib/Sprite'

export default function NotFound() {
  return (
    <div className="ds-grid flex min-h-screen flex-col bg-ds-night px-4 py-6 text-ds-wool sm:px-10">
      <Logo />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Mascot id={poses.nib.tumble} size={180} />
        <p className="mt-8 font-hyper text-sm font-bold text-ds-mark">404 · unmapped ground</p>
        <h1 className="mt-2 font-brico text-5xl font-bold tracking-tight">Nib wandered off the map</h1>
        <p className="mt-3 max-w-md font-hyper text-lg text-ds-wool/65">This page doesn’t exist, or it moved. Nothing has been written about it either.</p>
        <div className="mt-8 flex gap-2">
          <ButtonLink to="/rooms">Go to my rooms</ButtonLink>
          <ButtonLink to="/" variant="ghost">Home</ButtonLink>
        </div>
      </div>
    </div>
  )
}
