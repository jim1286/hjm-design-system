import { useRef, useState } from "react";
import { HjmProvider } from "@hjmds/react/provider";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { TextField } from "@hjmds/react/forms";
import { SegmentedControl } from "@hjmds/react/selection";
import { OverviewScreen } from "@hjmds/react/design-profile";
import { ContentTransition } from "@hjmds/react/content-transition";
import { Collapsible } from "@hjmds/react/collapsible";
import { Dialog, Sheet } from "@hjmds/react/overlays";
import { Notice, Skeleton } from "@hjmds/react/feedback";
import { Toast } from "@hjmds/react/toast";
import { Heading } from "@hjmds/react/heading";
import { hjmDesignPresets, type HjmDesignPreset } from "@hjmds/design-contracts/design-profile";
import { profileCopy as copy, profileOptions, profileHeadingSamples } from "../../../shared/design-profile";

export function RecordSample() {
  const [name, setName] = useState<string>(copy.initial);
  const [period, setPeriod] = useState("day");
  const [status, setStatus] = useState<"idle" | "pending" | "saved" | "failed">("idle");
  const failNext = useRef(false);
  async function save() {
    if (status === "pending") return;
    setStatus("pending");
    // Fixture-only latency makes real pending/failed/retry transitions inspectable;
    // no network mutation or product record is implied by the preview.
    await new Promise(resolve => setTimeout(resolve, 350));
    setStatus(failNext.current ? "failed" : "saved");
    failNext.current = false;
  }
  const items = [{ id: "walk", title: copy.walk, body: copy.walkBody }, { id: "read", title: copy.read, body: copy.readBody }, { id: "rest", title: copy.rest, body: copy.restBody }];
  return <OverviewScreen title={copy.screen} description={copy.description} toolbarLabel={copy.tools}
    toolbar={<Stack gap="md"><TextField label={copy.name} value={name} onValueChange={setName} /><SegmentedControl label={copy.filter} items={[{ value: "day", label: copy.day }, { value: "week", label: copy.week }]} value={period} onValueChange={setPeriod} /></Stack>}
    notice={<ContentTransition stateKey={status}><Text as="p" role="status">{copy[status]}</Text></ContentTransition>}
    footer={<Stack gap="sm"><Button onClick={() => void save()} loading={status === "pending"} aria-label={status === "pending" ? copy.pending : status === "failed" ? copy.retry : copy.save}>{status === "failed" ? copy.retry : copy.save}</Button><Button tone="ghost" disabled={status === "pending"} onClick={() => { failNext.current = true; void save(); }}>{copy.fail}</Button></Stack>}
    items={items.map(item => ({ id: item.id, children: <Stack gap="sm"><Text variant="heading">{item.title}</Text><Text>{item.body}</Text></Stack> }))} />;
}
// Same public overlay instances stay mounted while the parent profile changes;
// the shared controlled draft is fixture data, with no storage/network mutation.
function ProfileChromeSample({ onNextTheme }: { onNextTheme: () => void }) {
  const [open, setOpen] = useState<"dialog" | "sheet" | null>(null);
  const [draft, setDraft] = useState<string>(copy.initial);
  const fields = <Stack gap="md"><TextField label={copy.overlayDraft} value={draft} onValueChange={setDraft} /><Button onClick={onNextTheme}>{copy.nextTheme}</Button></Stack>;
  return <Collapsible trigger={copy.chrome} defaultOpen><Stack gap="md">
    <Notice title={copy.chromeNotice} /><Skeleton animated={false} />
    <Toast descriptor={{ id: "profile-saved", description: copy.toastCopy, closeLabel: copy.close }} onDismissRequest={() => {}} />
    <Stack axis="inline" gap="sm" wrap><Button onClick={() => setOpen("dialog")}>{copy.dialog}</Button><Button onClick={() => setOpen("sheet")}>{copy.sheet}</Button></Stack>
    <Dialog open={open === "dialog"} onOpenChange={next => { if (!next) setOpen(null); }} title={copy.overlayTitle} closeLabel={copy.close}>{fields}</Dialog>
    <Sheet open={open === "sheet"} onOpenChange={next => { if (!next) setOpen(null); }} title={copy.overlayTitle} closeLabel={copy.close}>{fields}</Sheet>
  </Stack></Collapsible>;
}

export function DesignProfileComparison() {
  const [preset, setPreset] = useState<HjmDesignPreset>("retro");
  return <Stack gap="xl"><Text variant="heading">{copy.title}</Text><Text>{copy.intro}</Text>
    <SegmentedControl label={copy.choose} presentation="pills" items={profileOptions.map(option => ({ value: option.id, label: option.label }))} value={preset} onValueChange={value => { const option = profileOptions.find(option => option.id === value); if (option) setPreset(option.id); }} />
    <HjmProvider designProfile={hjmDesignPresets[preset]}><Stack gap="xl"><RecordSample />
      <Collapsible trigger={copy.headingScale} defaultOpen><Stack gap="sm">{profileHeadingSamples.map(sample => <Heading key={sample.level} level={sample.level} semanticLevel={3}>{sample.label}</Heading>)}</Stack></Collapsible>
    </Stack></HjmProvider>
    <HjmProvider designProfile={hjmDesignPresets[preset]}><ProfileChromeSample onNextTheme={() => setPreset(profileOptions[(profileOptions.findIndex(option => option.id === preset) + 1) % profileOptions.length]!.id)} /></HjmProvider>
    <Text tone="muted">{copy.limitation}</Text>
    <Collapsible trigger={copy.compare} defaultOpen>{profileOptions.map(option => <HjmProvider key={option.id} designProfile={hjmDesignPresets[option.id]}><Stack gap="md"><Text variant="title">{option.label}</Text><RecordSample /></Stack></HjmProvider>)}</Collapsible>
  </Stack>;
}

export function OverviewPreview() {
  return <HjmProvider designProfile={hjmDesignPresets.forest}><RecordSample /></HjmProvider>;
}
