import { Link } from 'react-router-dom'
import { ContourMap, MapLegend } from '../components/ContourMap'
import { Page } from '../components/Shell'
import { Avatar, ButtonLink, MascotSays, Panel, Stat, Tag } from '../components/ui'
import { activity, byId, gaps, members, papers, room } from '../lib/sample'
import { poses, Sprite } from '../lib/Sprite'

export default function RoomOverview() {
  const ranked = [...gaps].sort((a, b) => b.votes.length - a.votes.length)
  return (
    <Page wide>
      <div className="grid gap-px border border-ds-line bg-ds-line sm:grid-cols-4">
        <Stat value={room.searched.hits} label="papers found on Semantic Scholar" />
        <Stat value={room.searched.kept} label="kept in the room" tone="nib" />
        <Stat value={gaps.length} label="gaps found" tone="mark" />
        <Stat value={gaps.filter((g) => g.stated).length} label="stated by the papers" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_1fr]">
        <Panel title="Research area map" action={<ButtonLink to="papers" variant="quiet" className="px-2 py-1">All papers →</ButtonLink>} pad={false}>
          <ContourMap />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ds-line px-5 py-3">
            <MapLegend />
            <span className="font-hyper text-sm text-ds-wool/45">Click a square or a gap</span>
          </div>
        </Panel>

        <div className="space-y-8">
          <Panel title="Top gaps" action={<ButtonLink to="gaps" variant="quiet" className="px-2 py-1">Vote →</ButtonLink>}>
            <ol className="space-y-5">
              {ranked.slice(0, 3).map((g, i) => (
                <li key={g.id}>
                  <Link to={`gaps/${g.id}`} className="group flex gap-4">
                    <span className="w-6 shrink-0 font-brico text-2xl font-bold text-ds-mark">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-hyper font-bold leading-snug group-hover:text-ds-mark">{g.title}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex gap-1" aria-label={`${g.votes.length} votes`}>
                          {g.votes.map((v) => (
                            <span key={v} className="h-3 w-3" style={{ background: byId(members, v).color }} />
                          ))}
                        </div>
                        <Tag tone={g.stated ? 'mark' : 'contour'}>{g.stated ? 'Stated in papers' : 'Inferred'}</Tag>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </Panel>

          <MascotSays id={poses.tuft.idea} tone="mark">
            Two papers name the border-region corpus gap outright. Want me to look for datasets that might fill it?{' '}
            <Link to="assistant" className="font-bold text-ds-mark underline">Ask Cognitio</Link>
          </MascotSays>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <Panel title="Recently added papers" className="lg:col-span-2" pad={false}>
          <ul className="divide-y divide-ds-line">
            {papers.slice(0, 4).map((p) => (
              <li key={p.id}>
                <Link to={`papers/${p.id}`} className="flex items-start gap-4 px-5 py-4 hover:bg-ds-raise">
                  <span className="mt-1.5 h-3 w-3 shrink-0 bg-ds-nib" />
                  <div className="min-w-0 flex-1">
                    <p className="font-hyper font-bold leading-snug">{p.title}</p>
                    <p className="mt-1 font-hyper text-sm text-ds-wool/55">{p.authors} · {p.venue} {p.year} · {p.citations} citations</p>
                  </div>
                  {p.limitations.length > 0 && <Tag tone="mark">{p.limitations.length} gap{p.limitations.length > 1 ? 's' : ''}</Tag>}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Activity">
          <ul className="space-y-4">
            {activity.map((a, i) => {
              const m = a.who === 'ai' ? null : byId(members, a.who)
              return (
                <li key={i} className="flex items-start gap-3">
                  {m ? <Avatar sprite={m.sprite} color={m.color} size={32} /> : <span className="grid h-8 w-8 shrink-0 place-items-center bg-ds-raise"><Sprite id={poses.tuft.sparkle} size={28} /></span>}
                  <p className="font-hyper text-sm leading-snug text-ds-wool/65">
                    <span className="font-bold text-ds-wool">{m ? m.name : 'Cognitio'}</span> {a.what} {a.target && <span className="text-ds-wool">{a.target}</span>}
                    <span className="block text-ds-wool/40">{a.when}</span>
                  </p>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>
    </Page>
  )
}
