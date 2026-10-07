import { useEffect, useId, useRef, useState } from "react";
import { HjmProvider } from "@hjmds/react/provider";
import { hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { profileOptions, profileCopy } from "../../../shared/design-profile";
import { Tabs, TabPanel } from "@hjmds/react/navigation";
import { SegmentedControl } from "@hjmds/react/selection";
import { CodeBlock } from "@hjmds/react/code-block";
import { ClipboardButton } from "@hjmds/react/clipboard";
import { Button } from "@hjmds/react/actions";
import { Container, Section, Stack, Text } from "@hjmds/react/layout";
import { Notice } from "@hjmds/react/feedback";
import { Collapsible } from "@hjmds/react/collapsible";
import { commandRecords, commandCopy as copy, type CommandRecordsProps } from "../../../shared/command-records";

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
  const refreshRef = useRef<HTMLButtonElement>(null), previousBusy = useRef(busy);
  const copyRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // The fixture response action disables itself; restore the refresh action
    // after its response rather than leaving focus on the document body.
    if (previousBusy.current && !busy) refreshRef.current?.focus();
    previousBusy.current = busy;
  }, [busy]);
  return <HjmProvider designProfile={hjmDesignPresets[profile.id]}><Container gutter="compact"><Section title={copy.title} description={copy.description}><Stack gap="md">
    <Text>{profileCopy.choose}: {profile.label}</Text><Button tone="secondary" onClick={() => setThemeIndex(value => (value + 1) % profileOptions.length)}>{profileCopy.nextTheme}</Button>
    <SegmentedControl label={copy.display} presentation="pills" value={display} onValueChange={setDisplay} items={[{ value: "wrap", label: copy.wrap }, { value: "scroll", label: copy.scroll }]} />
    <Tabs id={id} label={copy.panels} items={commandRecords} value={selected} onValueChange={value => { setSelected(value); setCopyError(false); }} renderPanels={false} panelMode="dynamic" activationMode="manual" />
    {/* Keep the source/copy action mounted across tab changes: a transition key
        would replace the OS-write owner while its request is still pending. */}
    <TabPanel tabsId={id} activeValue={selected} mode="dynamic"><CodeBlock label={current.label} language={current.language} code={current.code} wrap={display === "wrap"}
      copyAction={<ClipboardButton ref={copyRef} value={current.code} tone="secondary" size="small" labels={{ idle: copy.copy, copied: copy.copied }} onCopy={() => setCopyError(false)} onCopyError={() => setCopyError(true)} />} /></TabPanel>
    {copyError ? <Stack gap="sm"><Notice tone="danger" title={copy.copyError} /><Button tone="ghost" onClick={() => { setCopyError(false); copyRef.current?.focus(); }}>{copy.dismiss}</Button></Stack> : null}
    {busy ? <Text role="status">{copy.pending}</Text> : null}
    {phase === "failed" ? <Notice tone="danger" title={copy.failed} /> : null}
    <Button ref={refreshRef} loading={busy} disabled={busy} onClick={() => setPhase("pending")}>{phase === "failed" ? copy.retry : copy.refresh}</Button>
    <Text tone="muted">{copy.fixture}</Text>
    <Collapsible trigger={copy.tools} defaultOpen><Stack gap="sm">
      <Button tone="secondary" disabled={!busy} onClick={() => { setPhase(failNext ? "failed" : "idle"); setFailNext(false); }}>{copy.respond}</Button>
      <Button tone="ghost" disabled={busy} onClick={() => setFailNext(true)}>{failNext ? copy.armed : copy.fail}</Button>
    </Stack></Collapsible>
  </Stack></Section></Container></HjmProvider>;
}
