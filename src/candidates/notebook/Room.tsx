import { useState } from 'react'
import { Link } from 'react-router-dom'
import { byId, chat, gaps as allGaps, members, papers, room } from '../../lib/sample'
import { poses } from '../../lib/Sprite'
import { Circled, graph, Hi, inkOf, Sticker, Tally } from './parts'

type Tab = 'papers' | 'gaps' | 'ask'

export default function NotebookRoom() {
  const [sel, setSel] = useState('p3')
  const [tab, setTab] = useState<Tab>('papers')
  const [gaps, setGaps] = useState(allGaps)
  const paper = byId(papers, sel)
  const readers = members.filter((m) => m.where === sel)
  const toggle = (id: string) =>
    setGaps((gs) => gs.map((g) => (g.id !== id ? g : { ...g, votes: g.votes.includes('you') ? g.votes.filter((v) => v !== 'you') : [...g.votes, 'you'] })))
  const sorted = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  const tabs: { k: Tab; label: string; color: string }[] = [
    { k: 'papers', label: 'Papers', color: '#cfe0ff' },
    { k: 'gaps', label: 'Gaps', color: '#ecfab0' },
    { k: 'ask', label: 'Ask Nib', color: '#ffd9e6' },
  ]

  return (
    <div className="min-h-screen bg-[#d9e2ee] p-3 font-schib text-nb-ink sm:p-6 lg:h-screen lg:overflow-hidden">
      <header className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 pb-3">
        <Link to="/g" className="text-xl font-extrabold tracking-tight">cognitio</Link>
        <h1 className="min-w-0 truncate text-lg font-bold">{room.name}</h1>
        <div className="ml-auto flex items-center gap-1">
          <span className="mr-2 text-sm text-nb-ink/65">Open now:</span>
          {members.map((m, i) => (
            <span key={m.id} title={`${m.name}${m.status === 'idle' ? ' (away)' : ''}`} style={{ opacity: m.status === 'idle' ? 0.4 : 1 }}>
              <Sticker id={m.status === 'idle' ? poses.nib.sleep : m.sprite} size={38} tilt={[-6, 4, -2, 7, -4][i]} />
            </span>
          ))}
          <button className="ml-3 rounded-md border-2 border-nb-ink bg-white px-3 py-1.5 text-sm font-bold shadow-[2px_2px_0_var(--color-nb-ink)]">Invite</button>
        </div>
      </header>

      <div className="relative mx-auto grid h-[calc(100%-3.5rem)] max-w-[1400px] gap-0 lg:grid-cols-2">
        {/* index tabs on the right edge */}
        <div role="tablist" aria-label="Notebook sections" className="absolute -right-1 top-8 z-10 hidden flex-col gap-2 lg:flex">
          {tabs.map((t) => (
            <button
              key={t.k}
              role="tab"
              aria-selected={tab === t.k}
              onClick={() => setTab(t.k)}
              className={`translate-x-full rounded-r-md border-2 border-l-0 border-nb-ink px-2 py-3 text-sm font-bold [writing-mode:vertical-rl] ${tab === t.k ? 'translate-x-[calc(100%-2px)]' : ''}`}
              style={{ background: t.color }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* left page: the open paper */}
        <section aria-label="Open paper" className="relative overflow-y-auto rounded-l-md border-2 border-nb-ink p-6 shadow-[inset_-18px_0_24px_-18px_rgb(27_42_74/.35)] sm:p-10 lg:border-r-0" style={graph}>
          <p className="text-sm text-nb-ink/60">{paper.authors} · {paper.venue} {paper.year} · {paper.citations} citations</p>
          <h2 className="mt-1 max-w-[30ch] text-3xl font-extrabold leading-tight tracking-tight">{paper.title}</h2>
          <div className="mt-5 flex gap-3">
            <Sticker id={poses.nib.sparkle} size={52} tilt={-8} className="shrink-0" />
            <p className="max-w-[58ch] text-[17px] leading-relaxed text-nb-ink/90">{paper.summary}</p>
          </div>
          <h3 className="mt-8 text-sm font-bold text-nb-ink/60">Margin</h3>
          <ul className="mt-2 space-y-3 border-l-2 border-nb-red/60 pl-4">
            {paper.annotations.map((a, i) => (
              <li key={i} className="font-hand text-[26px] leading-tight" style={{ color: inkOf[a.by] }}>
                {a.text} <span className="font-schib text-xs font-semibold text-nb-ink/55">{byId(members, a.by).name.split(' ')[0]}</span>
              </li>
            ))}
            <li>
              <label className="sr-only" htmlFor="nb-note">Write in the margin</label>
              <input id="nb-note" placeholder="write in the margin…" className="w-full border-b border-dashed border-nb-ink/40 bg-transparent font-hand text-[26px] placeholder:text-nb-ink/35 focus:border-nb-pen focus:outline-none" style={{ color: inkOf.you }} />
            </li>
          </ul>
          {readers.length > 0 && (
            <p className="mt-8 text-sm text-nb-ink/65">
              On this page now: {readers.map((r) => r.name.split(' ')[0]).join(', ')}
            </p>
          )}
        </section>

        {/* right page: the active tab */}
        <section aria-label={tabs.find((t) => t.k === tab)!.label} className="overflow-y-auto rounded-r-md border-2 border-nb-ink p-6 shadow-[inset_18px_0_24px_-18px_rgb(27_42_74/.35)] sm:p-10" style={graph}>
          <div className="mb-6 flex gap-2 lg:hidden">
            {tabs.map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)} aria-pressed={tab === t.k} className="rounded-md border-2 border-nb-ink px-3 py-1 text-sm font-bold" style={{ background: tab === t.k ? t.color : 'white' }}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'papers' && (
            <>
              <h2 className="text-2xl font-extrabold tracking-tight">Contents</h2>
              <p className="text-sm text-nb-ink/60">{room.searched.kept} of {room.searched.hits} papers from {room.searched.source}</p>
              <ol className="mt-6 space-y-1">
                {papers.map((p, i) => (
                  <li key={p.id}>
                    <button onClick={() => setSel(p.id)} aria-current={sel === p.id} className={`flex w-full items-baseline gap-2 rounded px-2 py-2 text-left ${sel === p.id ? 'bg-nb-hi/60' : 'hover:bg-white/70'}`}>
                      <span className="font-bold">{p.title}</span>
                      <span className="min-w-4 flex-1 translate-y-[-4px] border-b-2 border-dotted border-nb-ink/30" />
                      <span className="text-sm tabular-nums text-nb-ink/60">p. {i + 1}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}

          {tab === 'gaps' && (
            <>
              <h2 className="text-2xl font-extrabold tracking-tight">Gaps</h2>
              <p className="text-sm text-nb-ink/60">Red circle: named in the papers. Pencil: inferred by the AI.</p>
              <ol className="mt-6 space-y-6">
                {sorted.map((g) => {
                  const mine = g.votes.includes('you')
                  return (
                    <li key={g.id}>
                      <h3 className="text-lg font-bold"><Circled color={g.stated ? 'var(--color-nb-red)' : '#8a94a8'}>{g.title}</Circled></h3>
                      <p className="mt-2 max-w-[56ch] leading-relaxed text-nb-ink/80">{g.detail}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <Tally n={g.votes.length} />
                        <button onClick={() => toggle(g.id)} aria-pressed={mine} className={`rounded-md border-2 border-nb-ink px-2.5 py-1 text-sm font-bold ${mine ? 'bg-nb-ink text-white' : 'bg-white'}`}>
                          {mine ? 'Ticked' : 'Add my tick'}
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </>
          )}

          {tab === 'ask' && (
            <>
              <div className="flex items-center gap-3">
                <Sticker id={poses.nib.happy} size={56} tilt={6} />
                <h2 className="text-2xl font-extrabold tracking-tight">Ask Nib</h2>
              </div>
              <ul className="mt-6 space-y-5">
                {chat.map((c, i) =>
                  c.from === 'ai' ? (
                    <li key={i} className="max-w-[60ch] rounded-md border-2 border-nb-ink bg-white p-4 shadow-[3px_3px_0_var(--color-nb-ink)]">
                      {c.tool && <p className="mb-2 text-xs font-semibold text-nb-pen">Looked up: {c.tool}</p>}
                      <p className="leading-relaxed">{c.text}</p>
                    </li>
                  ) : (
                    <li key={i} className="font-hand text-[26px] leading-tight" style={{ color: inkOf[c.from] }}>
                      {c.text} <span className="font-schib text-xs font-semibold text-nb-ink/55">{byId(members, c.from).name.split(' ')[0]}</span>
                    </li>
                  ),
                )}
              </ul>
              <form className="mt-6 flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input aria-label="Ask Nib" placeholder="Ask about the papers or the gaps" className="min-w-0 flex-1 rounded-md border-2 border-nb-ink bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-nb-pen" />
                <button className="rounded-md bg-nb-pen px-4 font-bold text-white">Ask</button>
              </form>
              <p className="mt-3 text-sm text-nb-ink/55">Nib reads the papers in this notebook. <Hi>It says when a gap is its own guess.</Hi></p>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
