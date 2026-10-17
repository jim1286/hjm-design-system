import { useId, useRef, useState } from "react";
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
import { PreviewToolButton, PreviewTools } from "./preview-tools";
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
  const refreshRef = useRef<HTMLButtonElement>(null);
  const copyRef = useRef<HTMLButtonElement>(null);
  return <HjmProvider designProfile={hjmDesignPresets[profile.id]}><Container size="reading" gutter="compact"><Section title={copy.title} description={copy.description}><Stack gap="md">
    <SegmentedControl label={copy.display} presentation="pills" value={display} onValueChange={setDisplay} items={[{ value: "wrap", label: copy.wrap }, { value: "scroll", label: copy.scroll }]} />
    <Tabs id={id} label={copy.panels} items={commandRecords} value={selected} onValueChange={value => { setSelected(value); setCopyError(false); }} renderPanels={false} panelMode="dynamic" activationMode="manual" />
    {/* Keep the source/copy action mounted across tab changes: a transition key
        would replace the OS-write owner while its request is still pending. */}
    <TabPanel tabsId={id} activeValue={selected} mode="dynamic"><CodeBlock label={current.label} language={current.language} code={current.code} wrap={display === "wrap"}
      copyAction={<ClipboardButton ref={copyRef} value={current.code} tone="secondary" size="small" labels={{ idle: copy.copy, copied: copy.copied }} onCopy={() => setCopyError(false)} onCopyError={() => setCopyError(true)} />} /></TabPanel>
    {copyError ? <Stack gap="sm"><Notice tone="danger" title={copy.copyError} /><Button tone="ghost" onClick={() => { setCopyError(false); copyRef.current?.focus(); }}>{copy.dismiss}</Button></Stack> : null}
    {busy ? <Text role="status">{copy.pending}</Text> : null}
    {phase === "failed" ? <Notice tone="danger" title={copy.failed} /> : null}
    <Button ref={refreshRef} loading={busy} onClick={() => setPhase("pending")}>{phase === "failed" ? copy.retry : copy.refresh}</Button>
    <Text tone="muted">{copy.fixture}</Text>
    <PreviewTools>
      <SegmentedControl label={profileCopy.choose} presentation="pills" size="small" value={profile.id} onValueChange={value => setThemeIndex(profileOptions.findIndex(option => option.id === value))}
        items={profileOptions.map(option => ({ value: option.id, label: option.label }))} />
      <PreviewToolButton disabled={!busy} onClick={event => {
        // Move only focus owned by the response button, before disabling it.
        // loading already guards refresh activation while keeping that target focusable.
        if (event && document.activeElement === event.currentTarget) refreshRef.current?.focus();
        setPhase(failNext ? "failed" : "idle"); setFailNext(false);
      }}>{copy.respond}</PreviewToolButton>
      <PreviewToolButton disabled={busy} onClick={() => setFailNext(true)}>{failNext ? copy.armed : copy.fail}</PreviewToolButton>
    </PreviewTools>
  </Stack></Section></Container></HjmProvider>;
}
