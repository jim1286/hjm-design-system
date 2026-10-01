import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "@hjmds/react/display";
import { createBlobatarFallback } from "@hjmds/react/avatar-blobatar";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Switch } from "@hjmds/react/selection";
import { Heading } from "@hjmds/react/heading";
import { Text } from "@hjmds/react/layout";
import { profileCopy as copy, profileFaces, initialProfile } from "../../../shared/profile-studio";
import "./profile-studio.css";

export function ProfileStudio() {
  const [draft, setDraft] = useState(initialProfile);
  const [saved, setSaved] = useState(initialProfile);
  const [applied, setApplied] = useState(false);
  const face = useMemo(() => createBlobatarFallback({ seed: draft.seed }), [draft.seed]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const change = (next: Partial<typeof draft>) => { setDraft({ ...draft, ...next }); setApplied(false); };
  return <main className="hjm-profile-studio">
    <header className="hjm-profile-studio__intro"><Text tone="brand" variant="label">{copy.eyebrow}</Text>
      <Heading level="level1">{copy.title}</Heading><Text tone="muted">{copy.intro}</Text></header>
    <div className="hjm-profile-studio__layout">
      <aside className="hjm-profile-studio__preview" aria-label={copy.preview}>
        <span className="hjm-profile-studio__badge">{copy.badge}</span>
        <div className="hjm-profile-studio__portrait"><Avatar name={draft.name.trim() || copy.profile} size="large" renderFallback={face} /></div>
        <h2>{draft.name.trim() || copy.profile}</h2><Text tone="muted">{copy.member}</Text>
        <div className="hjm-profile-studio__miniatures" aria-hidden="true">{profileFaces.map(item => <Avatar key={item.seed} name={item.label} alt="" size="small" renderFallback={createBlobatarFallback({ seed: item.seed })} />)}</div>
      </aside>
      <form className="hjm-profile-studio__form" onSubmit={event => { event.preventDefault(); if (draft.name.trim()) { setSaved(draft); setApplied(true); } }}>
        <section><Text variant="title" role="heading" aria-level={2}>{copy.appearance}</Text><Text tone="muted">{copy.appearanceHint}</Text>
          <div className="hjm-profile-studio__choices" role="group" aria-label={copy.appearance}>{profileFaces.map(item =>
            <Button type="button" key={item.seed} tone="ghost" selected={draft.seed === item.seed} onClick={() => change({ seed: item.seed })} aria-label={item.label}>
              <Avatar name={item.label} alt="" size="medium" renderFallback={createBlobatarFallback({ seed: item.seed })} />
            </Button>)}</div>
          <TextField label={copy.name} description={copy.nameHint} value={draft.name} {...(!draft.name.trim() ? { error: copy.empty } : {})} onChange={event => change({ name: event.target.value })} required />
        </section>
        <section><Text variant="title" role="heading" aria-level={2}>{copy.preferences}</Text><Switch label={copy.notification} description={copy.notificationHint} checked={draft.notifications} onCheckedChange={notifications => change({ notifications })} /></section>
        <footer><p role="status"><Text tone="muted">{applied ? copy.saved : copy.draft}</Text></p><div className="hjm-profile-studio__actions">
          <Button type="button" tone="ghost" disabled={!dirty} onClick={() => { setDraft(saved); setApplied(false); }}>{copy.reset}</Button>
          <Button type="submit" disabled={!dirty || !draft.name.trim()}>{copy.save}</Button>
        </div></footer>
      </form>
    </div>
  </main>;
}
const meta = { includeStories: ["Default","Dark","LargeText"], id: "patterns-profile-studio", title: "배포/화면/프로필 편집", component: ProfileStudio, parameters: { layout: "fullscreen" } } satisfies Meta<typeof ProfileStudio>;
export default meta;

// The duplicate Playground entry was removed on user request; Default owns this example.
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
