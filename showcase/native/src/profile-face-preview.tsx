import { Heading } from "@hjmds/react-native/heading";
import { PatternStatus } from "./pattern-status";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { Avatar } from "@hjmds/react-native/data-display";
import { createBlobatarFallback } from "@hjmds/react-native/avatar-blobatar";
import { Button } from "@hjmds/react-native/actions";
import { TextField, Switch } from "@hjmds/react-native/inputs";
import { ImageChoiceGroup } from "@hjmds/react-native/image-choice";
import { imageChoiceRecipe } from "@hjmds/design-contracts/components/image-choice";
import { Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { spacing } from "@hjmds/design-contracts/foundations";
import { profileCopy as copy, profileFaces, initialProfile } from "../../shared/profile-studio";

// 2026-10-06: moved out of ProfileStudio.stories.tsx when 프로필 편집 merged into 화면/계정/프로필. The ProfileScreen
// preview covers editing; this keeps the one state it lacks, choosing a Blobatar face when there is no photo.
// It lives here because CSF registered the exported function in the story file as an unnamed menu entry.
export function ProfileFacePreview() {
  const [draft, setDraft] = useState(initialProfile);
  const [saved, setSaved] = useState(initialProfile);
  const [applied, setApplied] = useState(false);
  const face = useMemo(() => createBlobatarFallback({ seed: draft.seed }), [draft.seed]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const change = (next: Partial<typeof draft>) => { setDraft({ ...draft, ...next }); setApplied(false); };
  // 2026-10-16 composition review: sections and the preview card use Stack/Surface spacing instead of raw View gaps
  // and a hand-drawn border card. Faces render at the tile size so the Blobatar fills the ImageChoiceGroup tile; the
  // tile carries the face name, so the artwork itself stays decorative.
  return <ScrollView automaticallyAdjustKeyboardInsets keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.xl }}>
    <Stack gap="xl">
      <Stack gap="sm"><Text variant="label" tone="brand">{copy.eyebrow}</Text><Heading level="level3">{copy.title}</Heading><Text tone="muted">{copy.intro}</Text></Stack>
      <Surface bordered padding="xxl" radius="xl"><Stack gap="md" align="center">
        <Text tone="brand" variant="label">{copy.badge}</Text>
        <Avatar name={draft.name.trim() || copy.profile} accessibilityLabel={draft.name.trim() || copy.profile} size={64} renderFallback={face} />
        <Heading level="level3">{draft.name.trim() || copy.profile}</Heading><Text tone="muted">{copy.member}</Text>
      </Stack></Surface>
      <Stack gap="md"><Text variant="title" accessibilityRole="header">{copy.appearance}</Text><Text tone="muted">{copy.appearanceHint}</Text>
        <ImageChoiceGroup label={copy.appearance} selectionMode="single" value={draft.seed} onValueChange={seed => change({ seed })}
          items={profileFaces.map(item => ({ id: item.seed, label: item.label, image: createBlobatarFallback({ seed: item.seed })({ size: imageChoiceRecipe.tileSize, decorative: true }) }))} />
        <TextField label={copy.name} description={copy.nameHint} value={draft.name} {...(!draft.name.trim() ? { error: copy.empty } : {})} onValueChange={name => change({ name })} />
      </Stack>
      <Stack gap="md"><Text variant="title" accessibilityRole="header">{copy.preferences}</Text><Switch label={copy.notification} description={copy.notificationHint} checked={draft.notifications} onCheckedChange={notifications => change({ notifications })} /></Stack>
      <PatternStatus tone="muted">{applied ? copy.saved : copy.draft}</PatternStatus>
      <Stack gap="sm">
        <Button disabled={!dirty || !draft.name.trim()} onPress={() => { setSaved(draft); setApplied(true); }}>{copy.save}</Button>
        <Button tone="secondary" disabled={!dirty} onPress={() => { setDraft(saved); setApplied(false); }}>{copy.reset}</Button>
      </Stack>
    </Stack>
  </ScrollView>;
}
