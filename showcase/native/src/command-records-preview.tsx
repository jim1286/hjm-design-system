import { useId, useState } from "react";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { profileOptions, profileCopy } from "../../shared/design-profile";
import { Tabs, TabPanel } from "@hjmds/react-native/navigation";
import { SegmentedControl } from "@hjmds/react-native/inputs";
import { CodeBlock } from "@hjmds/react-native/code-block";
import { ScrollView } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { PatternStatus } from "./pattern-status";
import { Button } from "@hjmds/react-native/actions";
import { Container, Section, Stack, Text } from "@hjmds/react-native/primitives";
import { Notice } from "@hjmds/react-native/feedback";
import { Collapsible } from "@hjmds/react-native/collapsible";
import { commandRecords, commandCopy as copy, type CommandRecordsProps } from "../../shared/command-records";

export function CommandRecordsPreview(props: CommandRecordsProps) {
  const id = useId();
  const [themeIndex, setThemeIndex] = useState(0);
  const [selected, setSelected] = useState<string>("command");
  const [display, setDisplay] = useState<string>("wrap");
  const [phase, setPhase] = useState(props.initialStatus ?? "idle");
  const [failNext, setFailNext] = useState(false);
  const [copyError, setCopyError] = useState(!!props.copyFailed);
  const profile = profileOptions[themeIndex]!, current = commandRecords.find(item => item.id === selected)!;
  const busy = phase === "pending";
  return <HjmNativeProvider designProfile={hjmDesignPresets[profile.id]}><ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}><Container gutter="compact"><Section title={copy.title} description={copy.description}><Stack gap="md">
    <Text>{profileCopy.choose}: {profile.label}</Text><Button tone="secondary" onPress={() => setThemeIndex(value => (value + 1) % profileOptions.length)}>{profileCopy.nextTheme}</Button>
    <SegmentedControl label={copy.display} presentation="pills" value={display} onValueChange={setDisplay} items={[{ value: "wrap", label: copy.wrap }, { value: "scroll", label: copy.scroll }]} />
    <Tabs id={id} label={copy.panels} items={commandRecords} value={selected} onValueChange={value => { setSelected(value); setCopyError(false); }} renderPanels={false} panelMode="dynamic" activationMode="manual" />
    <Text tone="muted">{copy.select}</Text>
    <TabPanel tabsId={id} activeValue={selected} mode="dynamic" label={current.label}><CodeBlock label={current.label} language={current.language} code={current.code} wrap={display === "wrap"} /></TabPanel>
    {copyError ? <Stack gap="sm"><Notice tone="danger" title={copy.copyError} /><Button tone="ghost" onPress={() => setCopyError(false)}>{copy.dismiss}</Button></Stack> : null}
    {busy ? <PatternStatus>{copy.pending}</PatternStatus> : null}
    {phase === "failed" ? <Notice tone="danger" title={copy.failed} /> : null}
    <Button loading={busy} disabled={busy} onPress={() => setPhase("pending")}>{phase === "failed" ? copy.retry : copy.refresh}</Button>
    <Text tone="muted">{copy.fixture}</Text>
    <Collapsible trigger={copy.tools} defaultOpen><Stack gap="sm">
      <Button tone="secondary" disabled={!busy} onPress={() => { setPhase(failNext ? "failed" : "idle"); setFailNext(false); }}>{copy.respond}</Button>
      <Button tone="ghost" disabled={busy} onPress={() => setFailNext(true)}>{failNext ? copy.armed : copy.fail}</Button>
    </Stack></Collapsible>
  </Stack></Section></Container></ScrollView></HjmNativeProvider>;
}
