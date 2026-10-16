import { useMemo, useState } from "react";
import { Avatar } from "@hjmds/react/display";
import { createBlobatarFallback } from "@hjmds/react/avatar-blobatar";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Switch } from "@hjmds/react/selection";
import { Heading } from "@hjmds/react/heading";
import { Grid, Stack, Surface, Text } from "@hjmds/react/layout";
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
  // 2026-10-16 composition review: the intro, preview card, form sections and action row use Stack/Surface/Grid
  // instead of page CSS; only the outer page width/padding stays in profile-studio.css. Face choice stays an avatar
  // button group because HJM has no image-choice component yet.
  return <main className="hjm-profile-studio">
    <Stack gap="xxxl">
      <Stack gap="sm"><Text tone="brand" variant="label">{copy.eyebrow}</Text>
        <Heading level="level1">{copy.title}</Heading><Text tone="muted">{copy.intro}</Text></Stack>
      <Grid columns={{ compact: 1, expanded: 2 }} gap={{ compact: "xxl" }}>
        <Surface as="section" aria-label={copy.preview} bordered padding="xxl" radius="xl"><Stack gap="md" align="center">
          <Text tone="brand" variant="label">{copy.badge}</Text>
          <Avatar name={draft.name.trim() || copy.profile} size="xlarge" renderFallback={face} />
          <Heading level="level2">{draft.name.trim() || copy.profile}</Heading><Text tone="muted">{copy.member}</Text>
          <Stack axis="inline" gap="xs" aria-hidden="true">{profileFaces.map(item => <Avatar key={item.seed} name={item.label} alt="" size="small" renderFallback={createBlobatarFallback({ seed: item.seed })} />)}</Stack>
        </Stack></Surface>
        <form onSubmit={event => { event.preventDefault(); if (draft.name.trim()) { setSaved(draft); setApplied(true); } }}><Stack gap="xl">
          <Stack gap="md"><Text variant="title" role="heading" aria-level={2}>{copy.appearance}</Text><Text tone="muted">{copy.appearanceHint}</Text>
            <Stack axis="inline" wrap gap="sm" role="group" aria-label={copy.appearance}>{profileFaces.map(item =>
              <Button type="button" key={item.seed} tone="ghost" selected={draft.seed === item.seed} onClick={() => change({ seed: item.seed })} aria-label={item.label}>
                <Avatar name={item.label} alt="" size="medium" renderFallback={createBlobatarFallback({ seed: item.seed })} />
              </Button>)}</Stack>
            <TextField label={copy.name} description={copy.nameHint} value={draft.name} {...(!draft.name.trim() ? { error: copy.empty } : {})} onChange={event => change({ name: event.target.value })} required />
          </Stack>
          <Stack gap="md"><Text variant="title" role="heading" aria-level={2}>{copy.preferences}</Text><Switch label={copy.notification} description={copy.notificationHint} checked={draft.notifications} onCheckedChange={notifications => change({ notifications })} /></Stack>
          <Stack gap="md"><Text as="p" role="status" tone="muted">{applied ? copy.saved : copy.draft}</Text>
            <Stack axis="inline" wrap gap="sm" justify="end">
              <Button type="button" tone="secondary" disabled={!dirty} onClick={() => { setDraft(saved); setApplied(false); }}>{copy.reset}</Button>
              <Button type="submit" disabled={!dirty || !draft.name.trim()}>{copy.save}</Button>
            </Stack></Stack>
        </Stack></form>
      </Grid>
    </Stack>
  </main>;
}
