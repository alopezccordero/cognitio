import type { ReactNode } from 'react'
import { Page } from '../components/Shell'
import { Button, ButtonLink, Field, Input, Mascot, PageHeader, Panel, Select, Tag, Textarea, Toggle } from '../components/ui'
import { noSubmit } from '../lib/form'
import { me, room } from '../lib/sample'
import { poses, Sprite } from '../lib/Sprite'

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-ds-line py-10 md:grid-cols-[260px_1fr]">
      <div>
        <h2 className="font-brico text-xl font-bold">{title}</h2>
        {hint && <p className="mt-1 font-hyper text-sm text-ds-wool/55">{hint}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

export function RoomSettings() {
  return (
    <Page>
      <form onSubmit={noSubmit}>
        <Section title="Research area" hint="Changing the area re-runs the Semantic Scholar search. Pinned papers stay.">
          <Field label="Room name"><Input defaultValue={room.name} /></Field>
          <Field label="Description"><Textarea rows={3} defaultValue={room.area} /></Field>
          <Field label="Key terms"><Input defaultValue={room.keywords.join(', ')} /></Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="From year"><Input type="number" defaultValue={room.years[0]} /></Field>
            <Field label="To year"><Input type="number" defaultValue={room.years[1]} /></Field>
          </div>
          <div className="flex flex-wrap gap-2">{room.fields.map((f) => <Tag key={f} tone="contour">{f} ×</Tag>)}</div>
        </Section>

        <Section title="Updates" hint="How Cognitio keeps the room current.">
          <div className="divide-y divide-ds-line border-y border-ds-line">
            <Toggle label="Check for new papers weekly" hint="New matches land in a review queue, not straight in the room." on />
            <Toggle label="Re-scan limitations for gaps" hint="Runs when a paper is added." on />
            <Toggle label="Let Cognitio infer gaps" hint="Inferred gaps are always labeled as inferred." on />
          </div>
        </Section>

        <Section title="Access">
          <Field label="Who can see this room">
            <Select defaultValue="invite">
              <option value="invite">Only people invited</option>
              <option value="link">Anyone with the link</option>
            </Select>
          </Field>
        </Section>

        <div className="flex justify-end gap-2 border-t border-ds-line pt-6">
          <Button variant="quiet">Discard</Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>

      <section className="mt-14 border border-ds-alert/40 p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Mascot id={poses.nib.sad} size={72} voxels={false} />
          <div className="flex-1">
            <h2 className="font-brico text-xl font-bold text-ds-alert">Danger zone</h2>
            <p className="mt-1 font-hyper text-ds-wool/60">Archiving hides the room for everyone. Deleting removes papers, notes and votes for good.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost">Archive</Button>
            <Button variant="danger">Delete room</Button>
          </div>
        </div>
      </section>
    </Page>
  )
}

export function AccountSettings() {
  return (
    <Page>
      <PageHeader eyebrow="Account" title="Settings" mascot={poses.tuft.wave} />
      <form onSubmit={noSubmit} className="mt-10">
        <Section title="Profile">
          <Field label="Name"><Input defaultValue={me.name} /></Field>
          <Field label="Role" hint="Shown next to your name in rooms."><Input placeholder="PhD student, Speech lab" /></Field>
          <fieldset>
            <legend className="font-hyper text-sm font-bold">Mascot</legend>
            <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {[poses.nib.happy, poses.nib.think, poses.nib.cheer, poses.tuft.happy, poses.tuft.think, poses.tuft.cheer].map((s) => (
                <label key={s} className="grid cursor-pointer place-items-center border border-ds-line bg-ds-panel p-2 has-[:checked]:border-ds-nib has-[:checked]:bg-ds-raise">
                  <input type="radio" name="sprite" value={s} defaultChecked={s === poses.nib.happy} className="sr-only" />
                  <Sprite id={s} size={56} />
                </label>
              ))}
            </div>
          </fieldset>
        </Section>

        <Section title="Sign-in" hint="Cognitio signs you in with an email link. There is no password.">
          <Field label="Email"><Input type="email" defaultValue={me.email} /></Field>
          <Panel title="Active sessions" pad={false}>
            <ul className="divide-y divide-ds-line font-hyper text-sm">
              {[['Firefox on Linux', 'This device'], ['Safari on iPhone', 'Nov 19']].map(([d, w]) => (
                <li key={d} className="flex items-center justify-between px-5 py-3">
                  <span>{d}</span>
                  <span className="text-ds-wool/50">{w}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </Section>

        <Section title="Email notifications">
          <div className="divide-y divide-ds-line border-y border-ds-line">
            <Toggle label="Room invites" on />
            <Toggle label="Weekly digest of new papers and gaps" on />
            <Toggle label="Replies to my notes" />
          </div>
        </Section>

        <div className="flex justify-end gap-2 border-t border-ds-line pt-6">
          <Button type="submit">Save changes</Button>
        </div>
      </form>

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border border-ds-line p-6">
        <div className="flex items-center gap-4">
          <Sprite id={poses.nib.sleep} size={56} />
          <p className="font-hyper text-ds-wool/70">Done for today?</p>
        </div>
        <div className="flex gap-2">
          <ButtonLink to="/" variant="ghost">Sign out</ButtonLink>
          <Button variant="danger">Delete account</Button>
        </div>
      </div>
    </Page>
  )
}
