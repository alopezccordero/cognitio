import { Page } from '../components/Shell'
import { Avatar, Button, Field, Input, MascotSays, Panel, Select, Tag } from '../components/ui'
import { byId, gaps, members, papers, room } from '../lib/sample'
import { poses } from '../lib/Sprite'

const status = (m: (typeof members)[number]) =>
  m.status === 'idle'
    ? 'Away'
    : m.where?.startsWith('p')
      ? `Reading ${byId(papers, m.where).title}`
      : m.where
        ? `Voting on ${byId(gaps, m.where).title.toLowerCase()}`
        : 'Looking around'

export default function Members() {
  return (
    <Page wide>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <Panel title={`${members.length} members`} pad={false}>
          <ul className="divide-y divide-ds-line">
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <Avatar sprite={m.status === 'idle' ? poses.nib.sleep : m.sprite} color={m.color} size={48} dim={m.status === 'idle'} />
                <div className="min-w-0 flex-1">
                  <p className="font-hyper font-bold">
                    {m.name} {m.id === room.owner && <Tag tone="nib">Owner</Tag>}
                  </p>
                  <p className="truncate font-hyper text-sm text-ds-wool/55">{status(m)}</p>
                </div>
                <Select defaultValue={m.id === room.owner ? 'owner' : 'editor'} disabled={m.id === room.owner} className="w-auto py-2" aria-label={`Role for ${m.name}`}>
                  <option value="owner">Owner</option>
                  <option value="editor">Can edit</option>
                  <option value="viewer">Can view</option>
                </Select>
                {m.id !== room.owner && <Button variant="quiet" className="px-2 py-2">Remove</Button>}
              </li>
            ))}
          </ul>
          <div className="border-t border-ds-line px-5 py-4">
            <p className="font-hyper text-sm font-bold text-ds-wool/60">Pending</p>
            <div className="mt-3 flex items-center justify-between gap-3 font-hyper text-sm">
              <span className="text-ds-wool/80">lucia@lab.edu</span>
              <span className="flex gap-2">
                <Button variant="quiet" className="px-2 py-1">Resend</Button>
                <Button variant="quiet" className="px-2 py-1">Cancel</Button>
              </span>
            </div>
          </div>
        </Panel>

        <aside className="space-y-6">
          <Panel title="Invite people">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <Field label="Email addresses">
                <Input type="email" placeholder="name@lab.edu" />
              </Field>
              <Field label="Role">
                <Select defaultValue="editor">
                  <option value="editor">Can edit</option>
                  <option value="viewer">Can view</option>
                </Select>
              </Field>
              <Button type="submit" variant="mark" className="w-full">Send invite</Button>
            </form>
          </Panel>
          <Panel title="Or share a code">
            <div className="flex items-center gap-2">
              <code className="flex-1 border border-dashed border-ds-nib/50 bg-ds-night px-3 py-2.5 text-center font-mono text-lg tracking-widest text-ds-nib">{room.invite}</code>
              <Button variant="ghost">Copy</Button>
            </div>
            <Button variant="quiet" className="mt-3 px-0">Reset code</Button>
          </Panel>
          <MascotSays id={poses.nib.love} size={52}>The more people vote, the clearer the ranking gets.</MascotSays>
        </aside>
      </div>
    </Page>
  )
}
