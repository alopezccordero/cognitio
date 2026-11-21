import { useState } from 'react'
import { Link } from 'react-router-dom'
import { byId, chat, gaps as allGaps, members, papers, room } from '../../lib/sample'
import { poses, Sprite } from '../../lib/Sprite'

const statusText: Record<string, string> = {
  reading: 'reading',
  annotating: 'writing a note',
  voting: 'voting',
  idle: 'away',
}

function where(id?: string) {
  if (!id) return ''
  if (id.startsWith('p')) return byId(papers, id).title.split(':')[0]
  return byId(allGaps, id).title
}

function FieldStrip() {
  return (
    <section aria-label="Who is in the room" className="relative overflow-hidden border-b-4 border-pa-night bg-pa-dusk">
      <div className="flex items-end gap-6 overflow-x-auto px-4 pt-4 sm:gap-10 sm:px-6">
        {members.map((m, i) => (
          <div key={m.id} className="flex shrink-0 flex-col items-center" style={{ opacity: m.status === 'idle' ? 0.45 : 1 }}>
            <div
              className="max-w-[11rem] truncate border-2 px-2 py-1 font-hyper text-xs text-pa-wool"
              style={{ borderColor: m.color, background: '#10131f' }}
              title={where(m.where)}
            >
              {statusText[m.status]}
              {m.where ? `: ${where(m.where)}` : ''}
            </div>
            <Sprite
              id={m.status === 'idle' ? (m.sprite.startsWith('nib') ? poses.nib.sleep : poses.tuft.sleep) : m.sprite}
              size={64}
              flip={i % 2 === 1}
              className="mt-1"
            />
            <span className="mb-1 font-pixel text-sm" style={{ color: m.color }}>
              {m.name}
            </span>
          </div>
        ))}
      </div>
      {/* pixel turf */}
      <div className="h-3 bg-pa-moss" style={{ boxShadow: 'inset 0 3px 0 #33604f' }} />
    </section>
  )
}

function PaperList({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <section aria-labelledby="pa-papers" className="flex min-h-0 flex-col">
      <div className="flex items-baseline justify-between px-4 py-3">
        <h2 id="pa-papers" className="font-pixel text-xl text-pa-wool">Papers</h2>
        <span className="font-hyper text-xs text-pa-wool/55">
          {room.searched.kept} of {room.searched.hits} from {room.searched.source}
        </span>
      </div>
      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-4">
        {papers.map((p) => {
          const open = p.id === selected
          const here = members.filter((m) => m.where === p.id)
          return (
            <li key={p.id}>
              <button
                onClick={() => onSelect(p.id)}
                aria-expanded={open}
                className={`w-full border-2 p-3 text-left ${open ? 'px-shadow border-pa-nib bg-pa-night' : 'border-transparent bg-pa-night/50 hover:border-pa-wool/20'}`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="font-hyper text-[15px] font-bold leading-snug text-pa-wool">{p.title}</span>
                  <span className="flex shrink-0 gap-1 pt-1">
                    {here.map((m) => (
                      <span key={m.id} title={`${m.name} is here`} className="h-2.5 w-2.5" style={{ background: m.color }} />
                    ))}
                  </span>
                </span>
                <span className="mt-1 block font-hyper text-xs text-pa-wool/55">
                  {p.authors} · {p.venue} {p.year} · {p.citations} cites
                </span>
                {open && (
                  <span className="mt-3 block">
                    <span className="flex gap-2">
                      <Sprite id={poses.nib.sparkle} size={28} />
                      <span className="font-hyper text-sm leading-relaxed text-pa-wool/85">{p.summary}</span>
                    </span>
                    {p.annotations.length > 0 && (
                      <span className="mt-3 block space-y-2 border-t-2 border-dashed border-pa-wool/15 pt-3">
                        {p.annotations.map((a, i) => {
                          const m = byId(members, a.by)
                          return (
                            <span key={i} className="flex gap-2 font-hyper text-sm">
                              <span className="mt-1.5 h-2.5 w-2.5 shrink-0" style={{ background: m.color }} />
                              <span className="text-pa-wool/80">
                                <span className="font-bold" style={{ color: m.color }}>{m.name.split(' ')[0]}</span> {a.text}
                              </span>
                            </span>
                          )
                        })}
                      </span>
                    )}
                    <span className="mt-3 block border-2 border-dashed border-pa-wool/25 px-3 py-2 font-hyper text-sm text-pa-wool/50">
                      Add a note…
                    </span>
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function GapBoard() {
  const [gaps, setGaps] = useState(allGaps)
  const toggle = (id: string) =>
    setGaps((gs) =>
      gs.map((g) =>
        g.id !== id ? g : { ...g, votes: g.votes.includes('you') ? g.votes.filter((v) => v !== 'you') : [...g.votes, 'you'] },
      ),
    )
  const sorted = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  const max = members.length
  return (
    <section aria-labelledby="pa-gaps" className="flex min-h-0 flex-col">
      <div className="flex items-center gap-3 px-4 py-3">
        <Sprite id={poses.tuft.idea} size={36} />
        <h2 id="pa-gaps" className="font-pixel text-xl text-pa-wool">Gap board</h2>
        <span className="ml-auto font-hyper text-xs text-pa-wool/55">Most votes on top</span>
      </div>
      <ol className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        {sorted.map((g, rank) => {
          const mine = g.votes.includes('you')
          return (
            <li key={g.id} className="px-shadow border-2 border-pa-wool/15 bg-pa-night p-4">
              <div className="flex items-start gap-3">
                <span className="font-pixel text-3xl leading-none text-pa-bulb">{rank + 1}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-hyper text-lg font-bold leading-snug text-pa-wool">{g.title}</h3>
                  <p className="mt-1 max-w-prose font-hyper text-sm leading-relaxed text-pa-wool/70">{g.detail}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 font-hyper text-xs">
                    <span className={`px-2 py-0.5 ${g.stated ? 'bg-pa-bulb text-pa-night' : 'border border-pa-wool/40 text-pa-wool/75'}`}>
                      {g.stated ? 'Stated in the papers' : 'Inferred by the AI'}
                    </span>
                    {g.sources.map((s) => (
                      <span key={s} className="bg-pa-dusk px-2 py-0.5 text-pa-wool/70">
                        {byId(papers, s).authors.split(',')[0]} {byId(papers, s).year}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                {/* vote meter: one block per person in the room */}
                <div className="flex gap-1" role="img" aria-label={`${g.votes.length} of ${max} votes`}>
                  {Array.from({ length: max }).map((_, i) => {
                    const v = g.votes[i]
                    return (
                      <span
                        key={i}
                        className="h-5 w-5 border-2"
                        style={{ background: v ? byId(members, v).color : 'transparent', borderColor: v ? byId(members, v).color : '#2a3148' }}
                      />
                    )
                  })}
                </div>
                <button
                  onClick={() => toggle(g.id)}
                  aria-pressed={mine}
                  className={`px-shadow px-press ml-auto px-3 py-1.5 font-pixel text-sm ${mine ? 'bg-pa-wool text-pa-night' : 'bg-pa-nib text-pa-night'}`}
                >
                  {mine ? 'Voted' : 'Vote'}
                </button>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Chat() {
  return (
    <section aria-labelledby="pa-chat" className="flex min-h-0 flex-col">
      <div className="flex items-center gap-3 px-4 py-3">
        <Sprite id={poses.nib.think} size={36} />
        <h2 id="pa-chat" className="font-pixel text-xl text-pa-wool">Ask Nib</h2>
        <select aria-label="Model" className="ml-auto border-2 border-pa-wool/20 bg-pa-night px-2 py-1 font-hyper text-xs text-pa-wool">
          <option>Claude</option>
          <option>GPT</option>
        </select>
      </div>
      <ul className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4">
        {chat.map((c, i) =>
          c.from === 'ai' ? (
            <li key={i} className="flex gap-2">
              <Sprite id={poses.nib.happy} size={32} className="shrink-0" />
              <div className="min-w-0">
                {c.tool && (
                  <p className="mb-1 break-words border-l-4 border-pa-bulb bg-pa-night px-2 py-1 font-hyper text-xs text-pa-bulb/90">
                    Used {c.tool}
                  </p>
                )}
                <p className="font-hyper text-sm leading-relaxed text-pa-wool/90">{c.text}</p>
              </div>
            </li>
          ) : (
            <li key={i} className="ml-8">
              <p className="font-hyper text-xs font-bold" style={{ color: byId(members, c.from).color }}>
                {byId(members, c.from).name}
              </p>
              <p className="mt-0.5 border-2 border-pa-wool/15 bg-pa-night px-3 py-2 font-hyper text-sm text-pa-wool">{c.text}</p>
            </li>
          ),
        )}
      </ul>
      <form className="border-t-4 border-pa-night p-3" onSubmit={(e) => e.preventDefault()}>
        <label className="flex items-center gap-2 border-2 border-pa-wool/30 bg-pa-night px-3 py-2">
          <span className="sr-only">Message</span>
          <input
            className="min-w-0 flex-1 bg-transparent font-hyper text-sm text-pa-wool placeholder:text-pa-wool/40 focus:outline-none"
            placeholder="Ask about the papers or the gaps"
          />
          <button className="px-press bg-pa-bulb px-3 py-1 font-pixel text-sm text-pa-night">Send</button>
        </label>
      </form>
    </section>
  )
}

export default function PastureRoom() {
  const [selected, setSelected] = useState('p3')
  return (
    <div className="flex min-h-screen flex-col bg-pa-night text-pa-wool lg:h-screen">
      <header className="flex flex-wrap items-center gap-3 border-b-4 border-pa-night bg-pa-dusk px-4 py-3 sm:px-6">
        <Link to="/a" className="flex items-center gap-2 font-pixel text-xl">
          <Sprite id={poses.nib.idle} size={28} />
          cognitio
        </Link>
        <span className="hidden h-6 w-0.5 bg-pa-wool/20 sm:block" />
        <div className="min-w-0">
          <h1 className="truncate font-pixel text-lg sm:text-2xl">{room.name}</h1>
          <p className="truncate font-hyper text-xs text-pa-wool/55">{room.area}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-hyper text-sm text-pa-wool/70">
            <span className="text-pa-nib">{members.filter((m) => m.status !== 'idle').length} here</span> of {members.length}
          </span>
          <button className="px-shadow px-press bg-pa-bulb px-3 py-1.5 font-pixel text-sm text-pa-night">Invite</button>
        </div>
      </header>
      <FieldStrip />
      <main className="grid min-h-0 flex-1 gap-1 bg-pa-night lg:grid-cols-[minmax(300px,1fr)_minmax(0,1.5fr)_minmax(300px,1fr)]">
        <div className="flex min-h-0 flex-col bg-pa-dusk/60"><PaperList selected={selected} onSelect={setSelected} /></div>
        <div className="flex min-h-0 flex-col bg-pa-dusk/30"><GapBoard /></div>
        <div className="flex min-h-0 flex-col bg-pa-dusk/60"><Chat /></div>
      </main>
    </div>
  )
}
