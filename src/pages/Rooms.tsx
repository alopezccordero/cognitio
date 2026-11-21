import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Page } from '../components/Shell'
import { Avatar, Button, ButtonLink, Field, Input, Mascot, MascotSays, PageHeader, Panel, Select, Tag, Textarea } from '../components/ui'
import { noSubmit } from '../lib/form'
import { byId, invites, me, members, rooms, searchPreview } from '../lib/sample'
import { poses, Sprite } from '../lib/Sprite'

export function RoomsDashboard() {
  return (
    <Page wide>
      <PageHeader eyebrow={`Good evening, ${me.name.split(' ')[0]}`} title="Your rooms" mascot={poses.nib.wave} actions={<ButtonLink to="/rooms/new">+ New room</ButtonLink>}>
        Each room maps one research area: its papers, the gaps they report, and the people reading them.
      </PageHeader>

      {invites.map((i) => (
        <div key={i.room} className="mt-10 flex flex-col gap-4 border border-ds-mark/40 bg-ds-mark/5 p-5 sm:flex-row sm:items-center">
          <Sprite id={i.sprite} size={48} />
          <p className="flex-1 font-hyper text-ds-wool/80">
            <span className="font-bold text-ds-wool">{i.from}</span> invited you to <span className="font-bold text-ds-wool">{i.room}</span>
          </p>
          <div className="flex gap-2">
            <Button variant="mark" className="py-2">Accept</Button>
            <Button variant="quiet" className="py-2">Decline</Button>
          </div>
        </div>
      ))}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 font-hyper text-sm font-bold">
          {['All', 'Owned by me', 'Shared with me'].map((f, i) => (
            <button key={f} type="button" className={`px-3 py-2 ${i === 0 ? 'bg-ds-raise text-ds-wool' : 'text-ds-wool/55 hover:text-ds-wool'}`}>{f}</button>
          ))}
        </div>
        <Input type="search" placeholder="Search rooms" className="max-w-xs py-2" aria-label="Search rooms" />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((r) => (
          <Link key={r.id} to={`/rooms/${r.id}`} className="group flex flex-col border border-ds-line bg-ds-panel p-6 transition-colors hover:border-ds-nib">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Tag tone={r.role === 'owner' ? 'nib' : 'default'}>{r.role === 'owner' ? 'Owner' : 'Member'}</Tag>
                <h2 className="mt-3 font-brico text-2xl font-bold leading-tight group-hover:text-ds-nib">{r.name}</h2>
                <p className="mt-1 font-hyper text-ds-wool/60">{r.area}</p>
              </div>
              <Sprite id={r.sprite} size={56} />
            </div>
            <div className="mt-6 flex gap-6 font-hyper text-sm">
              <span><span className="font-brico text-xl font-bold">{r.papers}</span> <span className="text-ds-wool/55">papers</span></span>
              <span><span className="font-brico text-xl font-bold text-ds-mark">{r.gaps}</span> <span className="text-ds-wool/55">gaps</span></span>
            </div>
            <div className="mt-auto flex items-center justify-between pt-6">
              <div className="flex -space-x-1">
                {r.members.map((id) => {
                  const m = byId(members, id)
                  return <Avatar key={id} sprite={m.sprite} color={m.color} size={30} label={m.name} />
                })}
              </div>
              <span className="font-hyper text-sm text-ds-wool/45">{r.updated}</span>
            </div>
          </Link>
        ))}
        <Link to="/rooms/new" className="ds-grid flex min-h-64 flex-col items-center justify-center border border-dashed border-ds-line p-6 text-center hover:border-ds-nib">
          <Mascot id={poses.tuft.idea} size={84} />
          <p className="mt-4 font-brico text-xl font-bold">Map a new area</p>
          <p className="mt-1 font-hyper text-sm text-ds-wool/55">Describe it in a sentence. Tuft does the reading.</p>
        </Link>
      </div>
    </Page>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-ds-line py-10 md:grid-cols-[220px_1fr]">
      <div>
        <span className="font-brico text-5xl font-bold text-ds-contour">{n}</span>
        <h2 className="mt-2 font-brico text-2xl font-bold">{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

export function NewRoom() {
  const nav = useNavigate()
  return (
    <Page>
      <PageHeader eyebrow="New room" title="Define your research area" mascot={poses.nib.think}>
        Cognitio searches Semantic Scholar for the papers that matter in this area, summarizes them, and lists the gaps they report.
      </PageHeader>
      <form
        className="mt-10"
        onSubmit={(e) => {
          noSubmit(e)
          nav('/rooms/cs-asr')
        }}
      >
        <Step n={1} title="The area">
          <Field label="Room name">
            <Input placeholder="Code-switched speech recognition" />
          </Field>
          <Field label="Describe the area" hint="One or two sentences, the way you’d explain it to a labmate.">
            <Textarea rows={4} placeholder="Automatic speech recognition for speakers who switch between Spanish and English mid-sentence." />
          </Field>
          <Field label="Key terms" hint="Separate with commas. We’ll suggest more.">
            <Input placeholder="code-switching, bilingual ASR, Spanish–English" />
          </Field>
          <div className="flex flex-wrap gap-2">
            {['+ language identification', '+ multilingual speech', '+ low-resource ASR'].map((s) => (
              <button key={s} type="button" className="border border-dashed border-ds-nib/50 px-2.5 py-1 font-hyper text-sm text-ds-nib hover:bg-ds-nib/10">{s}</button>
            ))}
          </div>
        </Step>

        <Step n={2} title="Narrow the search">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="From year"><Input type="number" defaultValue={2018} /></Field>
            <Field label="To year"><Input type="number" defaultValue={2026} /></Field>
            <Field label="Field of study">
              <Select defaultValue="cs">
                <option value="cs">Computer Science</option>
                <option value="ling">Linguistics</option>
                <option value="med">Medicine</option>
                <option value="any">Any field</option>
              </Select>
            </Field>
            <Field label="How many papers to keep">
              <Select defaultValue="25">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </Select>
            </Field>
          </div>
          <label className="flex items-center gap-3 font-hyper text-ds-wool/80">
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#74ddea]" /> Only papers with an open-access PDF
          </label>
          <Panel title="Preview from Semantic Scholar" action={<Tag tone="contour">214 matches</Tag>} pad={false}>
            <ul className="divide-y divide-ds-line">
              {searchPreview.map((p) => (
                <li key={p.title} className="flex items-center justify-between gap-4 px-5 py-3 font-hyper">
                  <span className="text-ds-wool/85">{p.title}</span>
                  <span className="shrink-0 text-sm text-ds-wool/45">{p.year} · {p.citations} cites</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-ds-line px-5 py-3">
              <MascotSays id={poses.tuft.think} size={40}>Most matches are from 2022 on. Widening the years won’t add much.</MascotSays>
            </div>
          </Panel>
        </Step>

        <Step n={3} title="Invite your lab">
          <Field label="Email addresses" hint="They get a link by email. You can also share an invite code later.">
            <Textarea rows={2} placeholder="marcus@lab.edu, priya@lab.edu" />
          </Field>
          <Field label="Who can see this room">
            <Select defaultValue="invite">
              <option value="invite">Only people I invite</option>
              <option value="link">Anyone with the link</option>
            </Select>
          </Field>
        </Step>

        <div className="flex flex-col-reverse gap-3 border-t border-ds-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <ButtonLink to="/rooms" variant="quiet">Cancel</ButtonLink>
          <div className="flex items-center gap-4">
            <span className="hidden font-hyper text-sm text-ds-wool/50 sm:inline">Takes about a minute</span>
            <Button type="submit" variant="mark" className="px-6 py-3">Create room and start reading</Button>
          </div>
        </div>
      </form>
    </Page>
  )
}
