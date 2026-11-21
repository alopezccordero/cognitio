import { useState } from 'react'
import { Link } from 'react-router-dom'
import { byId, chat, gaps as allGaps, members, papers, room } from '../../lib/sample'
import { poses, Sprite } from '../../lib/Sprite'
import { GapMarkers, gapTiles, Overworld, pct, towns } from './Overworld'

const box = 'border-4 border-fw-ink bg-[#f8f3e4] shadow-[4px_4px_0_#1f2440]'

function spot(where?: string) {
  if (!where) return null
  const t = towns.find((t) => t.paper.id === where)
  if (t) return { i: t.i + 1.6, j: t.j + 0.6 }
  const g = gapTiles.find((g) => g.id === where)
  return g ? { i: g.i + 1.4, j: g.j + 1.2 } : null
}

export default function FogRoom() {
  const [sel, setSel] = useState('p3')
  const [gaps, setGaps] = useState(allGaps)
  const paper = byId(papers, sel)
  const toggle = (id: string) =>
    setGaps((gs) => gs.map((g) => (g.id !== id ? g : { ...g, votes: g.votes.includes('you') ? g.votes.filter((v) => v !== 'you') : [...g.votes, 'you'] })))
  const sorted = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  const last = chat[chat.length - 1]

  return (
    <div className="min-h-screen bg-fw-water p-3 sm:p-4 lg:h-screen lg:overflow-hidden">
      <div className="grid h-full gap-3 lg:grid-cols-[1fr_380px] lg:grid-rows-[auto_1fr]">
        <header className={`${box} flex flex-wrap items-center gap-3 px-4 py-2 lg:col-span-2`}>
          <Link to="/d" className="font-pixel text-xl text-fw-ink">cognitio</Link>
          <span className="h-6 w-1 bg-fw-ink/20" />
          <h1 className="min-w-0 truncate font-pixel text-lg text-fw-ink sm:text-xl">{room.name}</h1>
          <div className="ml-auto flex items-center gap-1.5">
            {members.map((m) => (
              <span key={m.id} title={`${m.name}${m.status === 'idle' ? ' (resting)' : ''}`} className="grid h-9 w-9 place-items-center border-2 border-fw-ink" style={{ background: m.color, opacity: m.status === 'idle' ? 0.45 : 1 }}>
                <Sprite id={m.status === 'idle' ? poses.nib.sleep : m.sprite} size={28} />
              </span>
            ))}
            <button className="ml-2 border-2 border-fw-ink bg-fw-flag px-3 py-1 font-pixel text-white">Invite</button>
          </div>
        </header>

        <main className="relative min-h-0 overflow-hidden border-4 border-fw-ink bg-fw-water">
          <div className="absolute left-1/2 top-1/2 w-full min-w-[900px] -translate-x-1/2 -translate-y-1/2">
            <Overworld reveal={1.15}>
              {towns.map((t) => (
                <button
                  key={t.paper.id}
                  onClick={() => setSel(t.paper.id)}
                  aria-pressed={sel === t.paper.id}
                  className={`absolute -translate-x-1/4 translate-y-5 whitespace-nowrap px-1.5 py-0.5 font-pixel text-xs ${sel === t.paper.id ? 'bg-fw-flag text-white' : 'bg-fw-ink/85 text-fw-path hover:bg-fw-ink'}`}
                  style={pct(t.i, t.j + 1)}
                >
                  {t.paper.authors.split(',')[0]} {t.paper.year}
                </button>
              ))}
              <GapMarkers labels />
              {members.map((m) => {
                const s = spot(m.where)
                if (!s || m.status === 'idle') return null
                return (
                  <div key={m.id} className="absolute -translate-x-1/2 -translate-y-full text-center" style={pct(s.i, s.j)}>
                    <Sprite id={m.sprite} size={44} />
                    <span className="block whitespace-nowrap border-2 border-fw-ink px-1 font-pixel text-[11px] text-fw-ink" style={{ background: m.color }}>
                      {m.name.split(' ')[0]}
                    </span>
                  </div>
                )
              })}
            </Overworld>
          </div>
          <div className={`${box} absolute bottom-3 left-3 right-3 max-w-xl p-3`}>
            <div className="flex gap-3">
              <Sprite id={poses.nib.happy} size={48} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-pixel text-fw-flag">Nib</p>
                <p className="font-hyper text-sm leading-snug text-fw-ink">{last.text}</p>
                <form className="mt-2 flex gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input aria-label="Ask Nib" placeholder="Ask Nib about the map" className="min-w-0 flex-1 border-2 border-fw-ink bg-white px-2 py-1 font-hyper text-sm text-fw-ink focus:outline-none focus:ring-2 focus:ring-fw-flag" />
                  <button className="border-2 border-fw-ink bg-fw-grass px-3 font-pixel text-sm text-fw-ink">Ask</button>
                </form>
              </div>
            </div>
          </div>
        </main>

        <aside className="flex min-h-0 flex-col gap-3">
          <section className={`${box} p-4`} aria-labelledby="fw-town">
            <p className="font-pixel text-sm text-fw-flag">Town · {paper.venue} {paper.year}</p>
            <h2 id="fw-town" className="mt-1 font-hyper text-lg font-bold leading-snug text-fw-ink">{paper.title}</h2>
            <p className="mt-2 font-hyper text-sm leading-relaxed text-fw-ink/80">{paper.summary}</p>
            <ul className="mt-3 space-y-1.5 border-t-2 border-dashed border-fw-ink/25 pt-3">
              {paper.annotations.map((a, i) => (
                <li key={i} className="font-hyper text-sm text-fw-ink/85">
                  <span className="mr-1 inline-block h-2.5 w-2.5" style={{ background: byId(members, a.by).color }} />
                  <b>{byId(members, a.by).name.split(' ')[0]}</b> {a.text}
                </li>
              ))}
              {paper.annotations.length === 0 && <li className="font-hyper text-sm text-fw-ink/50">No notes yet. Be the first.</li>}
            </ul>
          </section>
          <section className={`${box} min-h-0 flex-1 overflow-y-auto p-4`} aria-labelledby="fw-quests">
            <h2 id="fw-quests" className="font-pixel text-xl text-fw-ink">Quest log</h2>
            <ol className="mt-3 space-y-3">
              {sorted.map((g) => {
                const mine = g.votes.includes('you')
                return (
                  <li key={g.id} className="border-2 border-fw-ink/30 bg-white/60 p-3">
                    <p className="font-hyper font-bold leading-snug text-fw-ink">{g.title}</p>
                    <p className="font-hyper text-xs text-fw-ink/60">{g.stated ? 'Named in the papers' : 'Inferred by the AI'}</p>
                    <div className="mt-2 flex items-center gap-1">
                      {g.votes.map((v) => (
                        <span key={v} className="h-4 w-4 border border-fw-ink" style={{ background: byId(members, v).color }} title={byId(members, v).name} />
                      ))}
                      <button onClick={() => toggle(g.id)} aria-pressed={mine} className={`ml-auto border-2 border-fw-ink px-2 py-0.5 font-pixel text-sm ${mine ? 'bg-fw-ink text-fw-path' : 'bg-fw-path text-fw-ink'}`}>
                        {mine ? 'Joined' : 'Join quest'}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  )
}
