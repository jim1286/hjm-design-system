import { useState } from "react";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmProvider } from "@hjmds/react/provider";
import { Heading } from "@hjmds/react/heading";
import { Text, Stack, Container } from "@hjmds/react/layout";
import { Card } from "@hjmds/react/display";
import { TextField } from "@hjmds/react/forms";
import { Button } from "@hjmds/react/actions";
import { SegmentedControl } from "@hjmds/react/selection";
import { Dialog } from "@hjmds/react/overlays";
import { CodeBlock } from "@hjmds/react/code-block";
import { profileOptions } from "../../../shared/design-profile";
import { fontRoleCopy as copy, fontRoleModes, fontRolePreviewInput, type FontRoleMode, type FontRolePreviewProps } from "../../../shared/font-role-preview";

const families = { display: ["Georgia", "serif"], reading: ["Palatino", "serif"] } as const;
export function FontRolePreview({ initialMode = "separated" }: FontRolePreviewProps) {
  const [mode, setMode] = useState<FontRoleMode>(initialMode), [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<string>(copy.initial);
  const design = defineHjmDesignProfile(fontRolePreviewInput(profileOptions[index]!.id, mode, families));
  const nextTheme = () => setIndex(current => (current + 1) % profileOptions.length);
  return <HjmProvider designProfile={design}><Container size="reading" gutter="compact"><Stack gap="lg">
    <Heading level="level3">{copy.title}</Heading><Text>{copy.intro}</Text>
    <SegmentedControl label={copy.choose} items={fontRoleModes} value={mode} onValueChange={value => { if (value === "inherited" || value === "separated") setMode(value); }} />
    <Text variant="caption">{profileOptions[index]!.label}</Text><Button tone="secondary" onClick={nextTheme}>{copy.nextTheme}</Button>
    <Heading level="level2" semanticLevel={3}>{copy.heading}</Heading><Text as="p" variant="bodyLarge">{copy.body}</Text>
    <Text variant="caption">{copy.caption}</Text><Text fontRole="ui">{copy.ui}</Text><Text fontRole="code">{copy.code}</Text>
    <Card title={copy.card} description={copy.body} actions={<Dialog title={copy.card} closeLabel={copy.close} trigger={<Button>{copy.detail}</Button>}>
      <Stack gap="md"><Text>{copy.body}</Text><TextField label={copy.draft} value={draft} onValueChange={setDraft} /><Button onClick={nextTheme}>{copy.nextTheme}</Button></Stack>
    </Dialog>}><TextField label={copy.draft} value={draft} onValueChange={setDraft} /></Card>
    <CodeBlock label={copy.choose} code={JSON.stringify(design.tokens.fontFamily, null, 2)} wrap /><Text tone="muted" variant="caption">{copy.scope}</Text>
  </Stack></Container></HjmProvider>;
}
