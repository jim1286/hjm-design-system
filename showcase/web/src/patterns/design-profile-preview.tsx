import { FloatingActionButton } from "@hjmds/react/floating-action-button";
import { Tabs, type TabsAppearance } from "@hjmds/react/navigation";
import { CodeBlock } from "@hjmds/react/code-block";
import { useEffect, useRef, useState } from "react";
import { HjmProvider } from "@hjmds/react/provider";
import { Button } from "@hjmds/react/actions";
import { BottomCTA } from "@hjmds/react/bottom-cta";
import { Popover } from "@hjmds/react/popover";
import { Stack, Text } from "@hjmds/react/layout";
import { TextField } from "@hjmds/react/forms";
import { SegmentedControl } from "@hjmds/react/selection";
import { OverviewScreen } from "@hjmds/react/design-profile";
import { ContentTransition } from "@hjmds/react/content-transition";
import { Collapsible } from "@hjmds/react/collapsible";
import { Dialog, Sheet } from "@hjmds/react/overlays";
import { Notice, Skeleton } from "@hjmds/react/feedback";
import { Toast } from "@hjmds/react/toast";
import { Card, Icon } from "@hjmds/react/display";
import { Heading } from "@hjmds/react/heading";
import { Asset } from "@hjmds/react/asset";
import { defineHjmDesignProfile, hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { profileCopy as copy, profileOptions, profileHeadingSamples } from "../../../shared/design-profile";
import { productDesignOptions, createPreviewProductResolver, type PreviewProductDesign, type ReferenceDesignPreset } from "../../../shared/product-design";

import { useDemoAction } from "./action-recovery-previews";
import { PreviewTools } from "./preview-tools";

// Resolve immutable app configurations once; profile changes never key or replace
// the record, input, tab, overlay or pending-action owners.
const resolvePreviewProductDesign = createPreviewProductResolver(preset => hjmDesignPresets[preset], defineHjmDesignProfile);

export function RecordSample() {
  const [name, setName] = useState<string>(copy.initial);
  const [period, setPeriod] = useState("day");
  const { session, state, request, toggleFailure } = useDemoAction<{ name: string; period: string } | null>(null);
  useEffect(() => () => session.reset(null), [session]);
  const status = state.status === "success" ? "saved" : state.status === "error" ? "failed" : state.status;
  // A theme changes presentation only. Saving confirms the submitted name/period,
  // while edits made during that request remain available and explicitly unsaved.
  const statusText = status === "saved" && (state.value?.name !== name || state.value?.period !== period)
    ? copy.unsaved : copy[status];
  function save(fails = false) {
    // The session snapshot also protects callbacks queued before the next render.
    if (session.getSnapshot().status === "pending") return;
    if (fails) toggleFailure();
    const submitted = { name, period };
    void session.run(() => request(submitted));
  }
  const items = [{ id: "walk", title: copy.walk, body: copy.walkBody }, { id: "read", title: copy.read, body: copy.readBody }, { id: "rest", title: copy.rest, body: copy.restBody }];
  const unsaved = statusText === copy.unsaved;
  const tone = status === "failed" ? "danger" : status === "pending" ? "info" : unsaved ? "warning" : "success";
  // The failure trigger is a preview control, so it sits under "미리보기 도구" outside the product screen, not among
  // its inputs or next to the footer's primary action (2026-10-17 review); aria-disabled keeps it focusable while
  // the request it started is pending. The idle state shows no notice.
  return <Stack gap="md"><OverviewScreen title={copy.screen} description={copy.description} toolbarLabel={copy.tools}
    toolbar={<Stack gap="md"><TextField label={copy.name} value={name} onValueChange={setName} /><SegmentedControl label={copy.filter} items={[{ value: "day", label: copy.day }, { value: "week", label: copy.week }]} value={period} onValueChange={setPeriod} /></Stack>}
    notice={<ContentTransition stateKey={status}>{status === "idle" ? null : <Notice tone={tone} title={statusText} />}</ContentTransition>}
    footer={<BottomCTA accessibilityLabel={copy.saveActions} primaryAction={{ label: status === "failed" ? copy.retry : copy.save, onClick: () => void save(), loading: status === "pending", loadingLabel: copy.pending }} />}
    items={items.map(item => ({ id: item.id, children: <Stack gap="sm"><Text variant="heading">{item.title}</Text><Text>{item.body}</Text></Stack> }))} />
    <PreviewTools><Button size="small" tone="ghost" aria-disabled={status === "pending"} onClick={() => save(true)}>{copy.fail}</Button></PreviewTools></Stack>;
}
// Same public overlay instances stay mounted while the parent profile changes;
// the shared controlled draft is fixture data, with no storage/network mutation.
function ProfileChromeSample({ onNextTheme }: { onNextTheme: () => void }) {
  const [open, setOpen] = useState<"dialog" | "sheet" | "popover" | null>(null);
  const [draft, setDraft] = useState<string>(copy.initial);
  const dialogTrigger = useRef<HTMLButtonElement>(null);
  const sheetTrigger = useRef<HTMLButtonElement>(null);
  const toastTrigger = useRef<HTMLButtonElement>(null);
  const [toastOpen, setToastOpen] = useState(true);
  const fields = <Stack gap="md"><TextField label={copy.overlayDraft} value={draft} onValueChange={setDraft} /><Button onClick={onNextTheme}>{copy.nextTheme}</Button></Stack>;
  return <Collapsible trigger={copy.chrome} defaultOpen><Stack gap="md">
    <Notice title={copy.chromeNotice} /><Skeleton animated={false} />
    {toastOpen && <Toast descriptor={{ id: "profile-saved", description: copy.toastCopy, closeLabel: copy.close }} onDismissRequest={() => { setToastOpen(false); toastTrigger.current?.focus(); }} />}
    <Button ref={toastTrigger} tone="secondary" onClick={() => setToastOpen(true)}>{copy.showToast}</Button>
    <Stack axis="inline" gap="xs" wrap><Button ref={dialogTrigger} onClick={() => setOpen("dialog")}>{copy.dialog}</Button><Button ref={sheetTrigger} onClick={() => setOpen("sheet")}>{copy.sheet}</Button><Popover open={open === "popover"} onOpenChange={next => setOpen(next ? "popover" : null)} title={copy.overlayTitle} closeLabel={copy.close} trigger={<Button>{copy.popover}</Button>}>{fields}</Popover></Stack>
    <Dialog returnFocusRef={dialogTrigger} open={open === "dialog"} onOpenChange={next => { if (!next) setOpen(null); }} title={copy.overlayTitle} closeLabel={copy.close}>{fields}</Dialog>
    <Sheet returnFocusRef={sheetTrigger} open={open === "sheet"} onOpenChange={next => { if (!next) setOpen(null); }} title={copy.overlayTitle} closeLabel={copy.close}>{fields}</Sheet>
  </Stack></Collapsible>;
}

function ProfileMaterialSample({ onNextTheme }: { onNextTheme: () => void }) {
  const [draft, setDraft] = useState<string>(copy.initial);
  return <Collapsible trigger={copy.material} defaultOpen><div className="hjm-profile-material-sample">
    <div className="hjm-profile-material-sample__backdrop" aria-hidden="true" />
    <div className="hjm-profile-material-sample__content"><Card title={copy.materialTitle} description={copy.materialBody} tone="raised"><Stack gap="md">
      <TextField label={copy.materialDraft} value={draft} onValueChange={setDraft} /><Button onClick={onNextTheme}>{copy.nextTheme}</Button>
    </Stack></Card></div>
  </div></Collapsible>;
}

function ProfileTabsSample({ onNextTheme }: { onNextTheme: () => void }) {
  const [value, setValue] = useState("entry");
  const [draft, setDraft] = useState<string>(copy.initial);
  const [appearance, setAppearance] = useState<TabsAppearance | "profile">("profile");
  return <Collapsible trigger={copy.tabs} defaultOpen><Stack gap="md">
    <SegmentedControl label={copy.tabsAppearance} items={[
      { value: "profile", label: copy.tabsInherit }, { value: "standard", label: copy.tabsStandard },
      { value: "slide", label: copy.tabsSlide }, { value: "gooey", label: copy.tabsGooey },
    ]} value={appearance} onValueChange={next => {
      if (next === "profile" || next === "standard" || next === "slide" || next === "gooey") setAppearance(next);
    }} />
    <Tabs label={copy.tabsLabel} value={value} onValueChange={setValue} mountPolicy="visited"
      {...(appearance === "profile" ? {} : { appearance })} items={[
        { id: "entry", label: copy.tabsEntry, panel: <TextField label={copy.tabsDraft} value={draft} onValueChange={setDraft} /> },
        { id: "history", label: copy.tabsHistory, panel: <Text>{copy.tabsHistoryBody}</Text> },
      ]} />
    <Button onClick={onNextTheme}>{copy.nextTheme}</Button><Text tone="muted">{copy.tabsNote}</Text>
  </Stack></Collapsible>;
}

function ProfileAssetSample({ onNextTheme }: { onNextTheme: () => void }) {
  // Reuse the already attributed CC0 fixture; theme selection changes the frame,
  // not the product-owned illustration or its meaning (shared/assets/reference-icons/README.md).
  const image = new URL("../../../shared/assets/reference-icons/tick.png", import.meta.url).href;
  return <Collapsible trigger={copy.assets}><Stack gap="md">
    <Stack axis="inline" gap="md" wrap>{([
      ["rounded", copy.assetRounded], ["square", copy.assetSquare], ["circle", copy.assetCircle],
    ] as const).map(([shape, label]) => <Stack key={shape} gap="sm"><Text>{label}</Text>
      <Asset descriptor={{ kind: "image", size: "xlarge", shape, decorative: true }}><img src={image} alt="" /></Asset>
    </Stack>)}</Stack><Text tone="muted">{copy.assetNote}</Text><Button onClick={onNextTheme}>{copy.nextTheme}</Button>
  </Stack></Collapsible>;
}

export function DesignProfileComparison({ initialProduct = "reference" }: { initialProduct?: PreviewProductDesign }) {
  const [preset, setPreset] = useState<ReferenceDesignPreset>("retro");
  const [product, setProduct] = useState<PreviewProductDesign>(initialProduct);
  const design = resolvePreviewProductDesign(preset, product);
  // SegmentedControl's label is the accessibility name only; each choice gets a visible name above it.
  return <Stack gap="xl"><Heading level="level3" semanticLevel={2}>{copy.title}</Heading><Text>{copy.intro}</Text>
    <Stack gap="xs"><Text variant="label">{copy.product}</Text>
      <SegmentedControl label={copy.product} presentation="pills" items={productDesignOptions.map(option => ({ value: option.id, label: option.label }))} value={product} onValueChange={value => { const option = productDesignOptions.find(option => option.id === value); if (option) setProduct(option.id); }} />
      <Text tone="muted">{copy.productNote}</Text></Stack>
    <Stack gap="xs"><Text variant="label">{copy.choose}</Text>
      <SegmentedControl label={copy.choose} presentation="pills" items={profileOptions.map(option => ({ value: option.id, label: option.label }))} value={preset} onValueChange={value => { const option = profileOptions.find(option => option.id === value); if (option) setPreset(option.id); }} /></Stack>
    <HjmProvider designProfile={design}><Stack gap="xl"><RecordSample />
      <Collapsible trigger={copy.headingScale} defaultOpen><Stack gap="sm">{profileHeadingSamples.map(sample => <Heading key={sample.level} level={sample.level} semanticLevel={3}>{sample.label}</Heading>)}</Stack></Collapsible>
    </Stack></HjmProvider>
    <HjmProvider designProfile={design}><ProfileMaterialSample onNextTheme={() => setPreset(profileOptions[(profileOptions.findIndex(option => option.id === preset) + 1) % profileOptions.length]!.id)} /></HjmProvider>
    <HjmProvider designProfile={design}><ProfileTabsSample onNextTheme={() => setPreset(profileOptions[(profileOptions.findIndex(option => option.id === preset) + 1) % profileOptions.length]!.id)} /></HjmProvider>
    <HjmProvider designProfile={design}><ProfileAssetSample onNextTheme={() => setPreset(profileOptions[(profileOptions.findIndex(option => option.id === preset) + 1) % profileOptions.length]!.id)} /></HjmProvider>
    <HjmProvider designProfile={design}><CodeBlock label={copy.codeTitle} code={copy.codeSource} wrap /></HjmProvider>
    <HjmProvider designProfile={design}><ProfileChromeSample onNextTheme={() => setPreset(profileOptions[(profileOptions.findIndex(option => option.id === preset) + 1) % profileOptions.length]!.id)} /></HjmProvider>
    <Text tone="muted">{copy.limitation}</Text>
    <Collapsible trigger={copy.compare} defaultOpen>{profileOptions.map(option => <HjmProvider key={option.id} designProfile={resolvePreviewProductDesign(option.id, product)}><Stack gap="md"><Heading level="level4" semanticLevel={3}>{option.label}</Heading><RecordSample /></Stack></HjmProvider>)}</Collapsible>
  </Stack>;
}

export function OverviewPreview() {
  return <HjmProvider designProfile={hjmDesignPresets.forest}><RecordSample /></HjmProvider>;
}


// One route-level FAB is studied separately so comparison tiles cannot add
// multiple viewport-fixed actions or hide another sample's input/CTA.
export function DesignProfileFloatingActionComparison() {
  const [preset, setPreset] = useState<ReferenceDesignPreset>("retro");
  const [count, setCount] = useState(0);
  const [clearance, setClearance] = useState(0);
  return <HjmProvider designProfile={hjmDesignPresets[preset]}><div style={{ minHeight: "100dvh", paddingBottom: clearance }}><Stack gap="md">
    <Heading level="level4">{copy.floatingAction}</Heading>
    <SegmentedControl label={copy.choose} presentation="pills" items={profileOptions.map(option => ({ value: option.id, label: option.label }))}
      value={preset} onValueChange={value => { const option = profileOptions.find(option => option.id === value); if (option) setPreset(option.id); }} />
    <Text role="status">{copy.floatingActivated}: {count}</Text>
    <Button onClick={() => setPreset(profileOptions[(profileOptions.findIndex(option => option.id === preset) + 1) % profileOptions.length]!.id)}>{copy.nextTheme}</Button>
    <Text>{copy.limitation}</Text>
  </Stack></div>
    <FloatingActionButton descriptor={{ label: copy.floatingCreate, icon: { name: "add" } }} renderIcon={() => <Icon name="add" />}
      onContentClearanceChange={setClearance} onClick={() => setCount(current => current + 1)} />
  </HjmProvider>;
}
