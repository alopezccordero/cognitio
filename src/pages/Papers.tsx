import { Link, useParams } from 'react-router-dom'
import { ContourMap } from '../components/ContourMap'
import { Page } from '../components/Shell'
import { Avatar, Button, ButtonLink, EmptyState, Input, MascotSays, Panel, Select, Tag, Textarea } from '../components/ui'
import { byId, gaps, members, papers } from '../lib/sample'
import { poses } from '../lib/Sprite'
import { clusters } from '../lib/terrain'

const clusterLabel = (k: string) => clusters.find((c) => c.key === k)?.label ?? k

export function PaperList() {
  return (
    <Page wide>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-brico text-3xl font-bold tracking-tight">Papers</h2>
          <p className="mt-1 font-hyper text-ds-wool/60">{papers.length} pinned of 214 found. Sorted by how central each paper is to the area.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost">Search Semantic Scholar again</Button>
          <Button>+ Add a paper</Button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <Input type="search" placeholder="Filter papers" aria-label="Filter papers" />
          <div>
            <p className="font-hyper text-sm font-bold text-ds-wool/60">Cluster</p>
            <ul className="mt-3 space-y-2">
              {clusters.map((c) => (
                <li key={c.key}>
                  <label className="flex items-center gap-3 font-hyper text-ds-wool/80">
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#74ddea]" />
                    {c.label}
                    <span className="ml-auto text-sm text-ds-wool/40">{papers.filter((p) => p.cluster === c.key).length}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-hyper text-sm font-bold text-ds-wool/60">Show</p>
            <ul className="mt-3 space-y-2 font-hyper text-ds-wool/80">
              <li><label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 accent-[#74ddea]" /> Reports a gap</label></li>
              <li><label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 accent-[#74ddea]" /> Open access</label></li>
              <li><label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 accent-[#74ddea]" /> Has notes</label></li>
            </ul>
          </div>
          <div className="hidden border border-ds-line lg:block">
            <ContourMap labels={false} />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="font-hyper text-sm text-ds-wool/50">Showing {papers.length}</span>
            <Select defaultValue="central" className="w-auto py-2" aria-label="Sort papers">
              <option value="central">Most central</option>
              <option value="cited">Most cited</option>
              <option value="new">Newest</option>
            </Select>
          </div>
          <ul className="space-y-3">
            {papers.map((p) => (
              <li key={p.id}>
                <Link to={p.id} className="block border border-ds-line bg-ds-panel p-5 hover:border-ds-nib">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag tone="contour">{clusterLabel(p.cluster)}</Tag>
                    {p.openAccess && <Tag tone="nib">Open access</Tag>}
                    {p.limitations.length > 0 && <Tag tone="mark">Reports {p.limitations.length} gap{p.limitations.length > 1 ? 's' : ''}</Tag>}
                  </div>
                  <h3 className="mt-3 font-brico text-xl font-bold leading-snug">{p.title}</h3>
                  <p className="mt-1 font-hyper text-sm text-ds-wool/55">{p.authors} · {p.venue} {p.year} · {p.citations} citations</p>
                  <p className="mt-3 font-hyper leading-relaxed text-ds-wool/80">{p.summary}</p>
                  {p.annotations.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 font-hyper text-sm text-ds-wool/50">
                      <div className="flex -space-x-1">
                        {[...new Set(p.annotations.map((a) => a.by))].map((id) => {
                          const m = byId(members, id)
                          return <Avatar key={id} sprite={m.sprite} color={m.color} size={24} />
                        })}
                      </div>
                      {p.annotations.length} note{p.annotations.length > 1 ? 's' : ''}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Page>
  )
}

export function PaperDetail() {
  const { paperId } = useParams()
  const p = papers.find((x) => x.id === paperId)
  if (!p)
    return (
      <Page>
        <EmptyState mascot={poses.nib.question} title="Paper not found" action={<ButtonLink to=".." relative="path">Back to papers</ButtonLink>}>
          It may have been removed from this room.
        </EmptyState>
      </Page>
    )
  const related = gaps.filter((g) => g.sources.includes(p.id))
  return (
    <Page wide>
      <Link to=".." relative="path" className="font-hyper text-sm font-bold text-ds-wool/55 hover:text-ds-nib">← Papers</Link>
      <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_340px]">
        <article>
          <div className="flex flex-wrap gap-2">
            <Tag tone="contour">{clusterLabel(p.cluster)}</Tag>
            {p.fields.map((f) => <Tag key={f}>{f}</Tag>)}
            {p.openAccess && <Tag tone="nib">Open access</Tag>}
          </div>
          <h2 className="mt-4 font-brico text-4xl font-bold leading-[1.08] tracking-tight">{p.title}</h2>
          <p className="mt-3 font-hyper text-lg text-ds-wool/65">{p.authors}</p>
          <p className="font-hyper text-ds-wool/50">{p.venue} {p.year} · {p.citations} citations</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {p.openAccess && <Button>Open PDF</Button>}
            <Button variant="ghost">View on Semantic Scholar</Button>
            <Button variant="quiet">Unpin</Button>
          </div>

          <section className="mt-10">
            <h3 className="font-hyper text-sm font-bold text-ds-wool/60">In two lines</h3>
            <div className="mt-3">
              <MascotSays id={poses.tuft.content} size={56}>{p.summary}</MascotSays>
            </div>
          </section>

          <section className="mt-10">
            <h3 className="font-hyper text-sm font-bold text-ds-wool/60">Gaps this paper reports</h3>
            {p.limitations.length ? (
              <ul className="mt-3 space-y-3">
                {p.limitations.map((l) => (
                  <li key={l} className="ds-hatch border border-dashed border-ds-mark/60 p-4 font-hyper text-ds-wool">
                    “{l}”
                    <span className="mt-1 block text-sm text-ds-mark">From the limitations section</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 font-hyper text-ds-wool/55">The paper doesn’t state any limitations.</p>
            )}
          </section>

          <section className="mt-10">
            <h3 className="font-hyper text-sm font-bold text-ds-wool/60">Notes from the room</h3>
            <ul className="mt-4 space-y-4">
              {p.annotations.map((a, i) => {
                const m = byId(members, a.by)
                return (
                  <li key={i} className="flex gap-3">
                    <Avatar sprite={m.sprite} color={m.color} size={36} />
                    <div className="flex-1 border border-ds-line bg-ds-panel px-4 py-3">
                      <p className="font-hyper text-sm font-bold">{m.name}</p>
                      <p className="mt-1 font-hyper text-ds-wool/85">{a.text}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 flex gap-3">
              <Avatar sprite={byId(members, 'you').sprite} color={byId(members, 'you').color} size={36} />
              <div className="flex-1 space-y-2">
                <Textarea rows={2} placeholder="Add a note for the room" aria-label="Add a note" />
                <Button className="py-2">Post note</Button>
              </div>
            </div>
          </section>
        </article>

        <aside className="space-y-6">
          <Panel title="Where it sits" pad={false}>
            <ContourMap labels={false} paper={p.id} />
          </Panel>
          <Panel title="Linked gaps">
            {related.length ? (
              <ul className="space-y-3">
                {related.map((g) => (
                  <li key={g.id}>
                    <Link to={`../../gaps/${g.id}`} relative="path" className="block font-hyper font-bold leading-snug hover:text-ds-mark">
                      <span className="mr-2 inline-block h-2.5 w-2.5 bg-ds-mark" />
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-hyper text-sm text-ds-wool/55">Not linked to a gap yet.</p>
            )}
          </Panel>
          <Panel title="Reading now">
            <ul className="space-y-3">
              {members.filter((m) => m.where === p.id).map((m) => (
                <li key={m.id} className="flex items-center gap-3 font-hyper text-sm">
                  <Avatar sprite={m.sprite} color={m.color} size={32} /> {m.name}
                </li>
              ))}
              {!members.some((m) => m.where === p.id) && <li className="font-hyper text-sm text-ds-wool/55">Nobody right now.</li>}
            </ul>
          </Panel>
        </aside>
      </div>
    </Page>
  )
}
