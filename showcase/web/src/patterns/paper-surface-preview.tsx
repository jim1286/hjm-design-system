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
export function PaperSurfacePreview() {
  const [index, setIndex] = useState(1), [mode, setMode] = useState<PaperSurfaceMode>("theme");
  const [interval, setInterval] = useState("24"), [draft, setDraft] = useState<string>(copy.initial), [saved, setSaved] = useState("");
  const profile = defineHjmDesignProfile({ extends: profileOptions[index]!.id, id: `paper-surface-${profileOptions[index]!.id}-${mode}`,
    // Explicit study overrides compare the same ruling in each palette; theme mode
    // keeps the actual preset, so the app can distinguish inheritance from override.
    ...(mode === "theme" ? {} : { material: { canvas: { layers: mode === "ruled" ? ["grain", "ruled"] : ["grain"], ruledSpacing: Number(interval), intensity: 0.12, active: false, seed: "paper-study" } } }),
  });
  return <HjmProvider designProfile={profile}><Stack gap="lg"><Text>{copy.intro}</Text>
    <SegmentedControl label={copy.mode} items={paperSurfaceModes} value={mode} onValueChange={value => { if (value === "theme" || value === "plain" || value === "ruled") setMode(value); }} />
    <SegmentedControl label={copy.interval} items={[{ value: "24", label: copy.compact }, { value: "40", label: copy.relaxed }]} value={interval} onValueChange={setInterval} disabled={mode !== "ruled"} />
    <Text variant="caption">{profileOptions[index]!.label}</Text><Button onClick={() => setIndex(current => (current + 1) % profileOptions.length)}>{copy.next}</Button>
    <OverviewScreen title={copy.screen} description={copy.description} toolbarLabel={copy.draft}
      toolbar={<TextField label={copy.draft} value={draft} onValueChange={setDraft} />} notice={<Text role="status">{saved}</Text>}
      items={copy.entries.map(item => ({ id: item.id, children: <Stack gap="sm"><Text variant="title">{item.title}</Text><Text>{item.body}</Text></Stack> }))}
      footer={<Stack gap="sm"><Button onClick={() => setSaved(`${copy.saved}: ${draft}`)}>{copy.save}</Button><Dialog title={copy.screen} closeLabel={copy.close} trigger={<Button tone="secondary">{copy.detail}</Button>}><Text>{draft}</Text></Dialog></Stack>} />
    <Text variant="caption">{copy.scope}</Text>
  </Stack></HjmProvider>;
}
