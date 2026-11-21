import { Link, useParams } from 'react-router-dom'
import { ContourMap } from '../components/ContourMap'
import { Page } from '../components/Shell'
import { Avatar, Button, ButtonLink, EmptyState, MascotSays, Panel, Tag, Textarea } from '../components/ui'
import { byId, gaps, members, papers } from '../lib/sample'
import { poses, Sprite } from '../lib/Sprite'

export function GapBoard() {
  const ranked = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  return (
    <Page wide>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-brico text-3xl font-bold tracking-tight">Gaps</h2>
          <p className="mt-1 max-w-2xl font-hyper text-ds-wool/60">
            What the papers say is missing, plus what Cognitio inferred from what nobody tested. Vote on the ones worth chasing.
          </p>
        </div>
        <div className="flex flex-wrap gap-1 font-hyper text-sm font-bold">
          {['All', 'Stated in papers', 'Inferred'].map((f, i) => (
            <button key={f} type="button" className={`px-3 py-2 ${i === 0 ? 'bg-ds-raise text-ds-wool' : 'text-ds-wool/55 hover:text-ds-wool'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <ol className="space-y-4">
          {ranked.map((g, i) => (
            <li key={g.id} className="grid grid-cols-[48px_1fr] gap-4 border border-ds-line bg-ds-panel p-5 sm:grid-cols-[64px_1fr_auto]">
              <span className="font-brico text-4xl font-bold text-ds-mark">{i + 1}</span>
              <div className="min-w-0">
                <Tag tone={g.stated ? 'mark' : 'contour'}>{g.stated ? 'Stated in papers' : 'Inferred by Cognitio'}</Tag>
                <Link to={g.id} className="mt-2 block font-brico text-xl font-bold leading-snug hover:text-ds-mark">{g.title}</Link>
                <p className="mt-2 font-hyper leading-relaxed text-ds-wool/70">{g.detail}</p>
                <p className="mt-3 font-hyper text-sm text-ds-wool/50">
                  From {g.sources.map((s) => byId(papers, s).authors.split(',')[0]).join(', ')}
                </p>
              </div>
              <div className="col-span-2 flex items-center gap-3 sm:col-span-1 sm:flex-col sm:items-end">
                <Button variant={g.votes.includes('you') ? 'mark' : 'ghost'} className="py-2" aria-pressed={g.votes.includes('you')}>
                  ▲ {g.votes.length}
                </Button>
                <div className="flex -space-x-1">
                  {g.votes.map((v) => {
                    const m = byId(members, v)
                    return <Avatar key={v} sprite={m.sprite} color={m.color} size={26} label={m.name} />
                  })}
                </div>
              </div>
            </li>
          ))}
        </ol>
        <aside className="space-y-6">
          <Panel title="On the map" pad={false}>
            <ContourMap />
          </Panel>
          <MascotSays id={poses.nib.alert} tone="mark">
            I re-read the limitations sections an hour ago. Nothing new since.
          </MascotSays>
          <Button variant="ghost" className="w-full">Scan papers for new gaps</Button>
        </aside>
      </div>
    </Page>
  )
}

export function GapDetail() {
  const { gapId } = useParams()
  const g = gaps.find((x) => x.id === gapId)
  if (!g)
    return (
      <Page>
        <EmptyState mascot={poses.tuft.question} title="Gap not found" action={<ButtonLink to=".." relative="path">Back to gaps</ButtonLink>}>
          Someone may have merged it into another gap.
        </EmptyState>
      </Page>
    )
  const rank = [...gaps].sort((a, b) => b.votes.length - a.votes.length).indexOf(g) + 1
  return (
    <Page wide>
      <Link to=".." relative="path" className="font-hyper text-sm font-bold text-ds-wool/55 hover:text-ds-nib">← Gaps</Link>
      <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_420px]">
        <article>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-brico text-2xl font-bold text-ds-mark">#{rank}</span>
            <Tag tone={g.stated ? 'mark' : 'contour'}>{g.stated ? 'Stated in papers' : 'Inferred by Cognitio'}</Tag>
          </div>
          <h2 className="mt-3 font-brico text-4xl font-bold leading-[1.08] tracking-tight">{g.title}</h2>
          <p className="mt-4 max-w-2xl font-hyper text-lg leading-relaxed text-ds-wool/75">{g.detail}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button variant={g.votes.includes('you') ? 'mark' : 'primary'}>▲ {g.votes.includes('you') ? 'Voted' : 'Vote'} · {g.votes.length}</Button>
            <Button variant="ghost">Ask Cognitio about this gap</Button>
          </div>

          <section className="mt-10">
            <h3 className="font-hyper text-sm font-bold text-ds-wool/60">Evidence</h3>
            <ul className="mt-3 space-y-3">
              {g.sources.map((s) => {
                const p = byId(papers, s)
                return (
                  <li key={s} className="border border-ds-line bg-ds-panel p-5">
                    <Link to={`../../papers/${p.id}`} relative="path" className="font-brico text-lg font-bold leading-snug hover:text-ds-nib">{p.title}</Link>
                    <p className="mt-1 font-hyper text-sm text-ds-wool/50">{p.authors} · {p.venue} {p.year}</p>
                    {p.limitations[0] && <p className="ds-hatch mt-3 border-l-2 border-ds-mark px-3 py-2 font-hyper text-ds-wool/85">“{p.limitations[0]}”</p>}
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="mt-10">
            <h3 className="font-hyper text-sm font-bold text-ds-wool/60">Discussion</h3>
            <div className="mt-4 flex gap-3">
              <Avatar sprite={byId(members, 'priya').sprite} color={byId(members, 'priya').color} size={36} />
              <div className="flex-1 border border-ds-line bg-ds-panel px-4 py-3">
                <p className="font-hyper text-sm font-bold">Priya Shah</p>
                <p className="mt-1 font-hyper text-ds-wool/85">Our lab has 40 hours of Valley recordings that were never transcribed. Could seed this.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Textarea rows={2} placeholder="Reply to the room" aria-label="Reply" />
              <Button className="py-2">Post</Button>
            </div>
          </section>
        </article>
        <aside className="space-y-6">
          <Panel title="Where the ground is empty" pad={false}>
            <ContourMap highlight={g.id} />
          </Panel>
          <Panel title={`Voted by ${g.votes.length}`}>
            <ul className="space-y-3">
              {g.votes.map((v) => {
                const m = byId(members, v)
                return (
                  <li key={v} className="flex items-center gap-3 font-hyper text-sm">
                    <Avatar sprite={m.sprite} color={m.color} size={32} /> {m.name}
                  </li>
                )
              })}
            </ul>
          </Panel>
          <div className="flex items-center gap-3 font-hyper text-sm text-ds-wool/50">
            <Sprite id={poses.tuft.wink} size={36} /> Gaps with three or more votes get a weekly digest.
          </div>
        </aside>
      </div>
    </Page>
  )
}
