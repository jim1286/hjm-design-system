import { useMemo, useState } from "react";
import { Avatar } from "@hjmds/react/display";
import { createBlobatarFallback } from "@hjmds/react/avatar-blobatar";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Switch } from "@hjmds/react/selection";
import { Heading } from "@hjmds/react/heading";
import { Text } from "@hjmds/react/layout";
import { profileCopy as copy, profileFaces, initialProfile } from "../../../shared/profile-studio";
import "./profile-studio.css";

// 2026-10-06: the deployed profile moved onto ProfileScreen/EditorScreen (ProfileStudio.stories.tsx). This directly
// assembled editor stays only for its unique state, choosing a default Blobatar face (story AvatarFallback).
export function AvatarFacePreview() {
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
        <div className="hjm-profile-studio__portrait"><Avatar name={draft.name.trim() || copy.profile} size="xlarge" renderFallback={face} /></div>
        <Heading level="level2">{draft.name.trim() || copy.profile}</Heading><Text tone="muted">{copy.member}</Text>
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
