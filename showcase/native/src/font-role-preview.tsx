import { useRef, useState } from "react";
import { Platform, ScrollView, type View } from "react-native";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Heading } from "@hjmds/react-native/heading";
import { Text, Stack, Container } from "@hjmds/react-native/primitives";
import { Card } from "@hjmds/react-native/data-display";
import { TextField } from "@hjmds/react-native/inputs";
import { Button } from "@hjmds/react-native/actions";
import { SegmentedControl } from "@hjmds/react-native/inputs";
import { Dialog } from "@hjmds/react-native/overlays";
import { CodeBlock } from "@hjmds/react-native/code-block";
import { profileOptions } from "../../shared/design-profile";
import { fontRoleCopy as copy, fontRoleModes, fontRolePreviewInput, type FontRoleMode, type FontRolePreviewProps } from "../../shared/font-role-preview";

// Apple lists these system families; other hosts use generic serif. This fixture
// does not load a brand font or establish OS glyph coverage (docs/font-roles.md).
const families = Platform.OS === "ios" ? { display: ["Georgia"], reading: ["Palatino"] }
  : { display: ["serif"], reading: ["serif"] };
export function FontRolePreview({ initialMode = "separated" }: FontRolePreviewProps) {
  const [mode, setMode] = useState<FontRoleMode>(initialMode), [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<string>(copy.initial), [open, setOpen] = useState(false);
  const trigger = useRef<View>(null);
  const design = defineHjmDesignProfile(fontRolePreviewInput(profileOptions[index]!.id, mode, families));
  const nextTheme = () => setIndex(current => (current + 1) % profileOptions.length);
  return <HjmNativeProvider designProfile={design}><ScrollView keyboardShouldPersistTaps="handled"><Container size="reading" gutter="compact"><Stack gap="lg">
    <Heading level="level3">{copy.title}</Heading><Text>{copy.intro}</Text>
    <SegmentedControl label={copy.choose} items={fontRoleModes} value={mode} onValueChange={value => { if (value === "inherited" || value === "separated") setMode(value); }} />
    <Text variant="caption">{profileOptions[index]!.label}</Text><Button tone="secondary" onPress={nextTheme}>{copy.nextTheme}</Button>
    <Heading level="level2" semanticLevel={3}>{copy.heading}</Heading><Text variant="bodyLarge">{copy.body}</Text>
    <Text variant="caption">{copy.caption}</Text><Text fontRole="ui">{copy.ui}</Text><Text fontRole="code">{copy.code}</Text>
    <Card title={copy.card} description={copy.body} actions={<Button ref={trigger} onPress={() => setOpen(true)}>{copy.detail}</Button>}>
      <TextField label={copy.draft} value={draft} onValueChange={setDraft} />
      <Dialog open={open} onOpenChange={setOpen} title={copy.card} closeLabel={copy.close} returnFocusRef={trigger}>
        <Stack gap="md"><Text>{copy.body}</Text><TextField label={copy.draft} value={draft} onValueChange={setDraft} /><Button onPress={nextTheme}>{copy.nextTheme}</Button></Stack>
      </Dialog>
    </Card><CodeBlock label={copy.choose} code={JSON.stringify(design.tokens.fontFamily, null, 2)} wrap /><Text tone="muted" variant="caption">{copy.scope}</Text>
  </Stack></Container></ScrollView></HjmNativeProvider>;
}
