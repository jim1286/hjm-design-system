import type { ComponentRef } from "react";
import { useRef, useState } from "react";
import type { View } from "react-native";
import { CollectionRail } from "@hjmds/react-native/collection-rail";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { Button } from "@hjmds/react-native/actions";
import { Card } from "@hjmds/react-native/data-display";
import { Dialog } from "@hjmds/react-native/overlays";
import { TextField } from "@hjmds/react-native/inputs";
import { Section, Stack, Text } from "@hjmds/react-native/primitives";
import { ScreenLayout } from "@hjmds/react-native/screens";
import { PreviewTools, PreviewToolButton } from "./preview-tools";
import { profileCopy, profileOptions } from "../../shared/design-profile";
import { collectionRecords, collectionCopy as copy, type CollectionDetailProps } from "../../shared/collection-detail";

function RecordCard({ label, description }: { label: string; description: string }) {
  const [draft, setDraft] = useState<string>(copy.initial), [detailDraft, setDetailDraft] = useState<string>(copy.initial);
  const [open, setOpen] = useState(false);
  const trigger = useRef<ComponentRef<typeof View>>(null);
  // An explicit canonical return target preserves the invoking card action,
  // including after theme changes; no separate Native focus engine is added.
  return <Card title={label} description={description} actions={<Button ref={trigger} tone="secondary" onPress={() => setOpen(true)}>{label} {copy.open}</Button>}>
    <TextField label={`${label} ${copy.note}`} value={draft} onValueChange={setDraft} />
    <Dialog open={open} onOpenChange={setOpen} title={label} closeLabel={copy.close} returnFocusRef={trigger}>
      <TextField label={`${label} ${copy.detailNote}`} value={detailDraft} onValueChange={setDetailDraft} />
    </Dialog>
  </Card>;
}

export function CollectionDetailPreview({ empty = false }: CollectionDetailProps) {
  const [themeIndex, setThemeIndex] = useState(0);
  const profile = profileOptions[themeIndex]!;
  const nextTheme = () => setThemeIndex(current => (current + 1) % profileOptions.length);
  return <HjmNativeProvider designProfile={hjmDesignPresets[profile.id]}>{/* ScreenLayout owns the gutter; the rail bleeds across it to the screen edges (1.28.1 bleed, spint home 2026-10-17). */}
  <ScreenLayout title={copy.title} titleVisibility="hidden"><Section title={copy.title} description={copy.description}>
    <Stack gap="md">
      <CollectionRail bleed label={copy.list} items={empty ? [] : collectionRecords}
        labels={{ previous: copy.previous, next: copy.next, navigation: copy.navigation }} emptyContent={<Text>{copy.empty}</Text>}
        renderItem={item => <RecordCard {...collectionRecords.find(record => record.id === item.id)!} />} />
      <Text tone="muted">{copy.fixture}</Text>
      {/* Theme cycling is a demo tool, not part of the composition (2026-10-17 composition review). */}
      <PreviewTools><PreviewToolButton onPress={nextTheme}>{`${profileCopy.nextTheme} (${profile.label})`}</PreviewToolButton></PreviewTools>
    </Stack>
  </Section></ScreenLayout></HjmNativeProvider>;
}
