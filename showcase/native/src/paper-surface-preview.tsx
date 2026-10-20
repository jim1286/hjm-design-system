import type { ComponentRef } from "react";
import { useState } from "react";
import { ScrollView, View, type View as NativeView } from "react-native";
import { useRef } from "react";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { Button } from "@hjmds/react-native/actions";
import { TextField, SegmentedControl } from "@hjmds/react-native/inputs";
import { Dialog } from "@hjmds/react-native/overlays";
import { OverviewScreen } from "@hjmds/react-native/design-profile";
import { paperSurfaceCopy as copy, paperSurfaceModes, type PaperSurfaceMode } from "../../shared/paper-surface";
import { profileOptions } from "../../shared/design-profile";
import { PatternStatus } from "./pattern-status";
import { PreviewTools } from "./preview-tools";
export function PaperSurfacePreview() {
  const [profileId, setProfileId] = useState<string>(profileOptions[1].id), [mode, setMode] = useState<PaperSurfaceMode>("theme");
  const [interval, setInterval] = useState("24"), [draft, setDraft] = useState<string>(copy.initial), [saved, setSaved] = useState("");
  const [open, setOpen] = useState(false), trigger = useRef<ComponentRef<typeof NativeView>>(null);
  const preset = profileOptions.find(option => option.id === profileId) ?? profileOptions[1];
  const profile = defineHjmDesignProfile({ extends: preset.id, id: `paper-surface-${preset.id}-${mode}`,
    // Same explicit study override as Web; actual preset inheritance remains selectable.
    ...(mode === "theme" ? {} : { material: { canvas: { layers: mode === "ruled" ? ["grain", "ruled"] : ["grain"], ruledSpacing: Number(interval), intensity: 0.12, active: false, seed: "paper-study" } } }),
  });
  // Match the existing profile study's bounded 640-unit route viewport. The
  // outer scroll keeps comparison controls from squeezing the route/input away.
  return <HjmNativeProvider designProfile={profile}><ScrollView keyboardShouldPersistTaps="handled"><Stack gap="lg"><Stack gap="xs"><Text>{copy.intro}</Text><Text variant="caption" tone="muted">{copy.scope}</Text></Stack>
    {/* Visible group names sit above SegmentedControl (its label is the accessibility name only). */}
    <Stack gap="xs"><Text variant="label">{copy.mode}</Text>
      <SegmentedControl label={copy.mode} items={paperSurfaceModes} value={mode} onValueChange={value => { if (value === "theme" || value === "plain" || value === "ruled") setMode(value); }} /></Stack>
    <Stack gap="xs"><Text variant="label">{copy.interval}</Text>
      <SegmentedControl label={copy.interval} items={[{ value: "24", label: copy.compact }, { value: "40", label: copy.relaxed }]} value={interval} onValueChange={setInterval} disabled={mode !== "ruled"} /></Stack>
    <PreviewTools><SegmentedControl label={copy.profile} presentation="pills" items={profileOptions.map(option => ({ value: option.id, label: option.label }))} value={preset.id} onValueChange={setProfileId} /></PreviewTools>
    <View style={{ height: 640 }}><OverviewScreen title={copy.screen} description={copy.description} toolbarLabel={copy.toolbar}
      toolbar={<TextField label={copy.draft} value={draft} onValueChange={setDraft} />} notice={<PatternStatus>{saved}</PatternStatus>}
      items={copy.entries.map(item => ({ id: item.id, children: <Stack gap="sm"><Text variant="title">{item.title}</Text><Text>{item.body}</Text></Stack> }))}
      footer={<Stack gap="xs"><Button onPress={() => setSaved(`${copy.saved}: ${draft}`)}>{copy.save}</Button><View ref={trigger} collapsable={false}><Button tone="secondary" onPress={() => setOpen(true)}>{copy.detail}</Button></View></Stack>} /></View>
    <Dialog open={open} onOpenChange={setOpen} title={copy.screen} closeLabel={copy.close} returnFocusRef={trigger}><Text>{draft}</Text></Dialog>
  </Stack></ScrollView></HjmNativeProvider>;
}
