import type { ComponentProps, CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Sprite } from '../lib/Sprite'

/* ---------- brand ---------- */

export function Logo({ to = '/', size = 'md' }: { to?: string; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
  return (
    <Link to={to} className={`flex items-center gap-2 font-brico font-bold tracking-tight text-ds-wool ${size === 'lg' ? 'text-2xl' : 'text-xl'}`}>
      <span className={`grid ${box} grid-cols-3 gap-px`} aria-hidden>
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className={i % 4 === 0 ? 'bg-ds-nib' : i === 5 ? 'bg-ds-mark' : 'bg-ds-wool/25'} />
        ))}
      </span>
      cognitio
    </Link>
  )
}

/* ---------- buttons ---------- */

type Variant = 'primary' | 'mark' | 'ghost' | 'quiet' | 'danger'
const variants: Record<Variant, string> = {
  primary: 'bg-ds-wool text-ds-night hover:bg-ds-nib',
  mark: 'bg-ds-mark text-ds-night hover:bg-ds-wool',
  ghost: 'border border-ds-wool/25 text-ds-wool hover:border-ds-nib hover:text-ds-nib',
  quiet: 'text-ds-wool/70 hover:text-ds-wool hover:bg-ds-raise',
  danger: 'border border-ds-alert/50 text-ds-alert hover:bg-ds-alert hover:text-ds-night',
}
const btnBase = 'inline-flex items-center justify-center gap-2 px-4 py-2.5 font-hyper text-sm font-bold transition-colors disabled:opacity-40'

export function Button({ variant = 'primary', className = '', ...rest }: ComponentProps<'button'> & { variant?: Variant }) {
  return <button type="button" className={`${btnBase} ${variants[variant]} ${className}`} {...rest} />
}

export function ButtonLink({ variant = 'primary', className = '', ...rest }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${btnBase} ${variants[variant]} ${className}`} {...rest} />
}

/* ---------- form ---------- */

const control =
  'w-full border border-ds-line bg-ds-night px-3 py-2.5 font-hyper text-ds-wool placeholder:text-ds-wool/35 focus:border-ds-nib focus:outline-none'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block font-hyper text-sm font-bold text-ds-wool">{label}</span>
      {hint && <span className="mt-0.5 block font-hyper text-sm text-ds-wool/55">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  )
}

export function Input(props: ComponentProps<'input'>) {
  return <input {...props} className={`${control} ${props.className ?? ''}`} />
}

export function Textarea(props: ComponentProps<'textarea'>) {
  return <textarea rows={3} {...props} className={`${control} resize-y ${props.className ?? ''}`} />
}

export function Select({ children, ...props }: ComponentProps<'select'>) {
  return (
    <select {...props} className={`${control} ${props.className ?? ''}`}>
      {children}
    </select>
  )
}

export function Toggle({ label, on = false, hint }: { label: string; on?: boolean; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div>
        <p className="font-hyper font-bold text-ds-wool">{label}</p>
        {hint && <p className="font-hyper text-sm text-ds-wool/55">{hint}</p>}
      </div>
      <span role="switch" aria-checked={on} aria-label={label} tabIndex={0} className={`mt-1 flex h-6 w-11 shrink-0 items-center p-0.5 ${on ? 'bg-ds-nib' : 'bg-ds-line'}`}>
        <span className={`h-5 w-5 bg-ds-night transition-transform ${on ? 'translate-x-5' : ''}`} />
      </span>
    </div>
  )
}

/* ---------- surfaces ---------- */

export function Panel({ title, action, children, className = '', pad = true }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`border border-ds-line bg-ds-panel ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-ds-line px-5 py-3">
          <h2 className="font-hyper text-sm font-bold text-ds-wool/70">{title}</h2>
          {action}
        </header>
      )}
      <div className={pad ? 'p-5' : ''}>{children}</div>
    </section>
  )
}

export function Tag({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'nib' | 'mark' | 'contour' }) {
  const t = {
    default: 'border-ds-wool/20 text-ds-wool/70',
    nib: 'border-ds-nib/50 text-ds-nib',
    mark: 'border-ds-mark/60 text-ds-mark',
    contour: 'border-ds-contour/60 text-ds-contour',
  }[tone]
  return <span className={`inline-flex items-center gap-1 border px-2 py-0.5 font-hyper text-xs font-bold ${t}`}>{children}</span>
}

export function Stat({ value, label, tone = 'wool' }: { value: ReactNode; label: string; tone?: 'wool' | 'mark' | 'nib' }) {
  const c = { wool: 'text-ds-wool', mark: 'text-ds-mark', nib: 'text-ds-nib' }[tone]
  return (
    <div className="bg-ds-panel p-5">
      <p className={`font-brico text-4xl font-bold tracking-tight ${c}`}>{value}</p>
      <p className="mt-1 font-hyper text-sm text-ds-wool/60">{label}</p>
    </div>
  )
}

/* ---------- people ---------- */

export function Avatar({ sprite, color, size = 36, dim, label }: { sprite: string; color: string; size?: number; dim?: boolean; label?: string }) {
  return (
    <span className="relative inline-grid shrink-0 place-items-center bg-ds-raise" style={{ width: size, height: size, opacity: dim ? 0.45 : 1 }} title={label}>
      <Sprite id={sprite} size={size - 4} alt={label ?? ''} />
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border-2 border-ds-panel" style={{ background: color }} />
    </span>
  )
}

/* ---------- mascot ---------- */

const drift = [
  { x: 12, y: 18, dx: 70, dy: -40, c: '#74ddea', s: 8 },
  { x: 78, y: 30, dx: 90, dy: 10, c: '#3fa7b4', s: 6 },
  { x: 70, y: 62, dx: 60, dy: 50, c: '#f2da4b', s: 7 },
  { x: 30, y: 74, dx: -50, dy: 40, c: '#74ddea', s: 5 },
  { x: 88, y: 12, dx: 40, dy: -60, c: '#f1ebdf', s: 5 },
  { x: 55, y: 8, dx: 20, dy: -70, c: '#3fa7b4', s: 6 },
]

/** A mascot shedding a few voxels — the 2D echo of the landing page's dissolve. */
export function Mascot({ id, size = 120, voxels = true, className = '', style }: { id: string; size?: number; voxels?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <span className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size, ...style }} aria-hidden>
      <Sprite id={id} size={size} />
      {voxels &&
        drift.map((v, i) => (
          <span
            key={i}
            className="ds-voxel absolute"
            style={
              {
                left: `${v.x}%`,
                top: `${v.y}%`,
                width: (v.s * size) / 120,
                height: (v.s * size) / 120,
                background: v.c,
                '--dx': `${(v.dx * size) / 120}px`,
                '--dy': `${(v.dy * size) / 120}px`,
                '--rot': `${i * 60}deg`,
                '--dur': `${3 + (i % 3)}s`,
                '--delay': `${i * 0.55}s`,
              } as CSSProperties
            }
          />
        ))}
    </span>
  )
}

/** Mascot with a speech bubble. Used for hints, empty states and AI status. */
export function MascotSays({ id, children, size = 64, tone = 'default' }: { id: string; children: ReactNode; size?: number; tone?: 'default' | 'mark' }) {
  return (
    <div className="flex items-end gap-3">
      <Mascot id={id} size={size} voxels={false} />
      <div className={`relative mb-2 max-w-md border px-4 py-3 font-hyper text-[15px] leading-relaxed ${tone === 'mark' ? 'border-ds-mark/50 bg-ds-mark/10 text-ds-wool' : 'border-ds-line bg-ds-raise text-ds-wool/85'}`}>
        {children}
      </div>
    </div>
  )
}

export function PageHeader({ eyebrow, title, children, mascot, actions }: { eyebrow?: string; title: ReactNode; children?: ReactNode; mascot?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-end gap-5">
        {mascot && <Mascot id={mascot} size={88} className="hidden sm:inline-block" />}
        <div>
          {eyebrow && <p className="font-hyper text-sm font-bold text-ds-nib">{eyebrow}</p>}
          <h1 className="mt-1 font-brico text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-ds-wool sm:text-5xl">{title}</h1>
          {children && <div className="mt-3 max-w-2xl font-hyper text-lg leading-relaxed text-ds-wool/70">{children}</div>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({ mascot, title, children, action }: { mascot: string; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="ds-grid flex flex-col items-center border border-dashed border-ds-line px-6 py-14 text-center">
      <Mascot id={mascot} size={112} />
      <h3 className="mt-6 font-brico text-2xl font-bold text-ds-wool">{title}</h3>
      {children && <p className="mt-2 max-w-sm font-hyper text-ds-wool/65">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
