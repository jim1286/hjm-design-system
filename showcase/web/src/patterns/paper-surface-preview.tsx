import { useState } from "react";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmProvider } from "@hjmds/react/provider";
import { Stack, Text } from "@hjmds/react/layout";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { SegmentedControl } from "@hjmds/react/selection";
import { Dialog } from "@hjmds/react/overlays";
import { OverviewScreen } from "@hjmds/react/design-profile";
import { paperSurfaceCopy as copy, paperSurfaceModes, type PaperSurfaceMode } from "../../../shared/paper-surface";
import { profileOptions } from "../../../shared/design-profile";
import { PreviewTools } from "./preview-tools";
export function PaperSurfacePreview() {
  const [profileId, setProfileId] = useState<string>(profileOptions[1].id), [mode, setMode] = useState<PaperSurfaceMode>("theme");
  const [interval, setInterval] = useState("24"), [draft, setDraft] = useState<string>(copy.initial), [saved, setSaved] = useState("");
  const preset = profileOptions.find(option => option.id === profileId) ?? profileOptions[1];
  const profile = defineHjmDesignProfile({ extends: preset.id, id: `paper-surface-${preset.id}-${mode}`,
    // Explicit study overrides compare the same ruling in each palette; theme mode
    // keeps the actual preset, so the app can distinguish inheritance from override.
    ...(mode === "theme" ? {} : { material: { canvas: { layers: mode === "ruled" ? ["grain", "ruled"] : ["grain"], ruledSpacing: Number(interval), intensity: 0.12, active: false, seed: "paper-study" } } }),
  });
  // SegmentedControl names its group only for assistive technology; the visible
  // name sits above it (segmented-control usage). The theme picker is a preview
  // tool so it does not compete with the screen's own primary action.
  return <HjmProvider designProfile={profile}><Stack gap="lg"><Stack gap="xs"><Text>{copy.intro}</Text><Text variant="caption" tone="muted">{copy.scope}</Text></Stack>
    <Stack gap="xs"><Text variant="label">{copy.mode}</Text>
      <SegmentedControl label={copy.mode} items={paperSurfaceModes} value={mode} onValueChange={value => { if (value === "theme" || value === "plain" || value === "ruled") setMode(value); }} /></Stack>
    <Stack gap="xs"><Text variant="label">{copy.interval}</Text>
      <SegmentedControl label={copy.interval} items={[{ value: "24", label: copy.compact }, { value: "40", label: copy.relaxed }]} value={interval} onValueChange={setInterval} disabled={mode !== "ruled"} /></Stack>
    <PreviewTools><SegmentedControl label={copy.profile} presentation="pills" items={profileOptions.map(option => ({ value: option.id, label: option.label }))} value={preset.id} onValueChange={setProfileId} /></PreviewTools>
    <OverviewScreen title={copy.screen} description={copy.description} toolbarLabel={copy.toolbar}
      toolbar={<TextField label={copy.draft} value={draft} onValueChange={setDraft} />} notice={<Text role="status">{saved}</Text>}
      items={copy.entries.map(item => ({ id: item.id, children: <Stack gap="sm"><Text variant="title">{item.title}</Text><Text>{item.body}</Text></Stack> }))}
      footer={<Stack gap="xs"><Button onClick={() => setSaved(`${copy.saved}: ${draft}`)}>{copy.save}</Button><Dialog title={copy.screen} closeLabel={copy.close} trigger={<Button tone="secondary">{copy.detail}</Button>}><Text>{draft}</Text></Dialog></Stack>} />
  </Stack></HjmProvider>;
}
