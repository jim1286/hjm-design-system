import { useRef, useState } from "react";
import { ScrollView, type View } from "react-native";
import { CollectionRail } from "@hjmds/react-native/collection-rail";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { Button } from "@hjmds/react-native/actions";
import { Card } from "@hjmds/react-native/data-display";
import { Dialog } from "@hjmds/react-native/overlays";
import { TextField } from "@hjmds/react-native/inputs";
import { Container, Section, Stack, Text } from "@hjmds/react-native/primitives";
import { profileCopy, profileOptions } from "../../shared/design-profile";
import { collectionRecords, collectionCopy as copy, type CollectionDetailProps } from "../../shared/collection-detail";

function RecordCard({ label, description, onNextTheme }: { label: string; description: string; onNextTheme: () => void }) {
  const [draft, setDraft] = useState<string>(copy.initial), [detailDraft, setDetailDraft] = useState<string>(copy.initial);
  const [open, setOpen] = useState(false);
  const trigger = useRef<View>(null);
  // An explicit canonical return target preserves the invoking card action,
  // including after theme changes; no separate Native focus engine is added.
  return <Card title={label} description={description} actions={<Button ref={trigger} tone="secondary" onPress={() => setOpen(true)}>{label} {copy.open}</Button>}>
    <TextField label={`${label} ${copy.note}`} value={draft} onValueChange={setDraft} />
    <Dialog open={open} onOpenChange={setOpen} title={label} closeLabel={copy.close} returnFocusRef={trigger}>
      <Stack gap="md"><TextField label={`${label} ${copy.detailNote}`} value={detailDraft} onValueChange={setDetailDraft} />
        <Button tone="secondary" onPress={onNextTheme}>{profileCopy.nextTheme}</Button></Stack>
    </Dialog>
  </Card>;
}

export function CollectionDetailPreview({ empty = false }: CollectionDetailProps) {
  const [themeIndex, setThemeIndex] = useState(0);
  const profile = profileOptions[themeIndex]!;
  const nextTheme = () => setThemeIndex(current => (current + 1) % profileOptions.length);
  return <HjmNativeProvider designProfile={hjmDesignPresets[profile.id]}><ScrollView keyboardShouldPersistTaps="handled"><Container gutter="compact"><Section title={copy.title} description={copy.description}>
    <Stack gap="md"><Text>{profileCopy.choose}: {profile.label}</Text><Button tone="secondary" onPress={nextTheme}>{profileCopy.nextTheme}</Button>
      <CollectionRail label={copy.list} items={empty ? [] : collectionRecords}
        labels={{ previous: copy.previous, next: copy.next, navigation: copy.navigation }} emptyContent={<Text>{copy.empty}</Text>}
        renderItem={item => <RecordCard {...collectionRecords.find(record => record.id === item.id)!} onNextTheme={nextTheme} />} />
      <Text tone="muted">{copy.fixture}</Text>
    </Stack>
  </Section></Container></ScrollView></HjmNativeProvider>;
}
