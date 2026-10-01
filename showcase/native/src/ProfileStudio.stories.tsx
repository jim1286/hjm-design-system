import { PatternStatus } from "./pattern-status";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { Avatar } from "@hjmds/react-native/data-display";
import { createBlobatarFallback } from "@hjmds/react-native/avatar-blobatar";
import { Button } from "@hjmds/react-native/actions";
import { TextField, Switch } from "@hjmds/react-native/inputs";
import { Text } from "@hjmds/react-native/primitives";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { spacing, radius } from "@hjmds/design-contracts/foundations";
import { profileCopy as copy, profileFaces, initialProfile } from "../../shared/profile-studio";

export function ProfileStudio() {
  const { colors } = useHjmNativeTheme();
  const [draft, setDraft] = useState(initialProfile);
  const [saved, setSaved] = useState(initialProfile);
  const [applied, setApplied] = useState(false);
  const face = useMemo(() => createBlobatarFallback({ seed: draft.seed }), [draft.seed]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const change = (next: Partial<typeof draft>) => { setDraft({ ...draft, ...next }); setApplied(false); };
  return <ScrollView automaticallyAdjustKeyboardInsets keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}>
    <View style={{ gap: spacing.sm }}><Text variant="label" tone="brand">{copy.eyebrow}</Text><Text variant="heading" accessibilityRole="header">{copy.title}</Text><Text tone="muted">{copy.intro}</Text></View>
    <View style={{ padding: spacing.xxl, gap: spacing.md, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, alignItems: "center" }}>
      <Text tone="brand" variant="label">{copy.badge}</Text>
      <Avatar name={draft.name.trim() || copy.profile} accessibilityLabel={draft.name.trim() || copy.profile} size={96} renderFallback={face} />
      <Text variant="heading" accessibilityRole="header">{draft.name.trim() || copy.profile}</Text><Text tone="muted">{copy.member}</Text>
    </View>
    <View style={{ gap: spacing.md }}><Text variant="title" accessibilityRole="header">{copy.appearance}</Text><Text tone="muted">{copy.appearanceHint}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>{profileFaces.map(item => <Button key={item.seed} tone="ghost" selected={draft.seed === item.seed} accessibilityLabel={item.label} onPress={() => change({ seed: item.seed })}>
        <Avatar name={item.label} decorative size={32} renderFallback={createBlobatarFallback({ seed: item.seed })} />
      </Button>)}</View>
      <TextField label={copy.name} description={copy.nameHint} value={draft.name} {...(!draft.name.trim() ? { error: copy.empty } : {})} onValueChange={name => change({ name })} />
    </View>
    <View style={{ gap: spacing.md }}><Text variant="title" accessibilityRole="header">{copy.preferences}</Text><Switch label={copy.notification} description={copy.notificationHint} checked={draft.notifications} onCheckedChange={notifications => change({ notifications })} /></View>
    <PatternStatus tone="muted">{applied ? copy.saved : copy.draft}</PatternStatus>
    <Button disabled={!dirty || !draft.name.trim()} onPress={() => { setSaved(draft); setApplied(true); }}>{copy.save}</Button>
    <Button tone="ghost" disabled={!dirty} onPress={() => { setDraft(saved); setApplied(false); }}>{copy.reset}</Button>
  </ScrollView>;
}
const meta = { title: "배포/화면/프로필 편집", component: ProfileStudio } satisfies Meta<typeof ProfileStudio>;
export default meta;

// Default owns the interactive example; the duplicate Playground was removed.
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
