import { Page } from '../components/Shell'
import { Avatar, Button, Mascot, Panel, Tag, Textarea } from '../components/ui'
import { noSubmit } from '../lib/form'
import { byId, chat, members, papers } from '../lib/sample'
import { poses, Sprite } from '../lib/Sprite'

const suggestions = ['Which gaps are stated outright?', 'Compare the two model papers', 'Find datasets for border-region speech', 'Draft a related-work paragraph']

export default function Assistant() {
  return (
    <Page wide>
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <section className="flex min-h-[70vh] min-w-0 flex-col border border-ds-line bg-ds-panel">
          <header className="flex items-center gap-3 border-b border-ds-line px-5 py-3">
            <Sprite id={poses.tuft.sparkle} size={36} />
            <div>
              <h2 className="font-hyper font-bold">Ask Cognitio</h2>
              <p className="font-hyper text-sm text-ds-wool/50">Answers from the papers in this room. Everyone in the room sees this thread.</p>
            </div>
          </header>

          <ol className="flex-1 space-y-6 p-5">
            {chat.map((c, i) => {
              if (c.from === 'ai')
                return (
                  <li key={i} className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center bg-ds-raise"><Sprite id={poses.tuft.content} size={32} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="font-hyper text-sm font-bold text-ds-nib">Cognitio</p>
                      {c.tool && (
                        <p className="mt-1 inline-block max-w-full truncate border border-ds-line bg-ds-night px-2 py-1 font-mono text-xs text-ds-contour">{c.tool}</p>
                      )}
                      <p className="mt-2 font-hyper leading-relaxed text-ds-wool/90">{c.text}</p>
                    </div>
                  </li>
                )
              const m = byId(members, c.from)
              return (
                <li key={i} className="flex gap-3">
                  <Avatar sprite={m.sprite} color={m.color} size={36} />
                  <div>
                    <p className="font-hyper text-sm font-bold">{m.name}</p>
                    <p className="mt-1 font-hyper text-ds-wool/90">{c.text}</p>
                  </div>
                </li>
              )
            })}
            <li className="flex items-center gap-3 font-hyper text-sm text-ds-wool/50">
              <Mascot id={poses.tuft.think} size={36} />
              Cognitio is reading 3 papers<span className="ds-caret">▍</span>
            </li>
          </ol>

          <form onSubmit={noSubmit} className="border-t border-ds-line p-4">
            <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
              {suggestions.map((s) => (
                <button key={s} type="button" className="shrink-0 border border-ds-line px-3 py-1.5 font-hyper text-sm text-ds-wool/75 hover:border-ds-nib hover:text-ds-nib">{s}</button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <Textarea rows={2} placeholder="Ask about the papers, the gaps, or what to read next" aria-label="Message" className="flex-1" />
              <Button type="submit" className="py-3">Send</Button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <Panel title="Context">
            <p className="font-hyper text-sm text-ds-wool/60">Cognitio can read:</p>
            <ul className="mt-3 space-y-2">
              {papers.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <label className="flex items-start gap-2 font-hyper text-sm text-ds-wool/80">
                    <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 shrink-0 accent-[#74ddea]" /> {p.title}
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-hyper text-sm text-ds-wool/45">+ {papers.length - 5} more</p>
          </Panel>
          <Panel title="Model">
            <div className="flex flex-wrap gap-2">
              <Tag tone="nib">Groq</Tag>
              <Tag>Fast</Tag>
            </div>
            <p className="mt-3 font-hyper text-sm text-ds-wool/55">Every answer cites the paper it came from. Inferred claims are marked.</p>
          </Panel>
        </aside>
      </div>
    </Page>
  )
}
