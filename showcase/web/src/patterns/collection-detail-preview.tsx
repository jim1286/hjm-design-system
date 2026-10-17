import { useState } from "react";
import { CollectionRail } from "@hjmds/react/collection-rail";
import { HjmProvider } from "@hjmds/react/provider";
import { hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { Button } from "@hjmds/react/actions";
import { Card } from "@hjmds/react/display";
import { Dialog } from "@hjmds/react/overlays";
import { TextField } from "@hjmds/react/forms";
import { Container, Section, Stack, Text } from "@hjmds/react/layout";
import { PreviewTools, PreviewToolButton } from "./preview-tools.js";
import { profileCopy, profileOptions } from "../../../shared/design-profile";
import { collectionRecords, collectionCopy as copy, type CollectionDetailProps } from "../../../shared/collection-detail";

function RecordCard({ label, description }: { label: string; description: string }) {
  const [draft, setDraft] = useState<string>(copy.initial);
  const [detailDraft, setDetailDraft] = useState<string>(copy.initial);
  // Keep the Dialog's canonical trigger inside Card.actions. Modal/background
  // isolation and return focus remain HJM-owned rather than a whole-card click.
  return <Card title={label} description={description} actions={<Dialog title={label} closeLabel={copy.close}
    trigger={<Button tone="secondary">{label} {copy.open}</Button>}>
    <TextField label={`${label} ${copy.detailNote}`} value={detailDraft} onChange={event => setDetailDraft(event.target.value)} />
  </Dialog>}>
    {/* TextField owns unique label IDs when multiple collections appear on one page. */}
    <TextField label={`${label} ${copy.note}`} value={draft} onChange={event => setDraft(event.target.value)} />
  </Card>;
}

export function CollectionDetailPreview({ empty = false }: CollectionDetailProps) {
  const [themeIndex, setThemeIndex] = useState(0);
  const profile = profileOptions[themeIndex]!;
  const nextTheme = () => setThemeIndex(current => (current + 1) % profileOptions.length);
  return <HjmProvider designProfile={hjmDesignPresets[profile.id]}><Container gutter="compact"><Section title={copy.title} description={copy.description}>
    <Stack gap="md">
      <CollectionRail label={copy.list} items={empty ? [] : collectionRecords}
        labels={{ previous: copy.previous, next: copy.next, navigation: copy.navigation }} emptyContent={<Text>{copy.empty}</Text>}
        renderItem={item => <RecordCard {...collectionRecords.find(record => record.id === item.id)!} />} />
      <Text tone="muted">{copy.fixture}</Text>
      {/* Theme cycling is a demo tool, not part of the composition (2026-10-17 composition review). */}
      <PreviewTools><PreviewToolButton onClick={nextTheme}>{`${profileCopy.nextTheme} (${profile.label})`}</PreviewToolButton></PreviewTools>
    </Stack>
  </Section></Container></HjmProvider>;
}
