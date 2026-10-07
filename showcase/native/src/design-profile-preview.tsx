import { Tabs, type TabsAppearance } from "@hjmds/react-native/navigation";
import { CodeBlock } from "@hjmds/react-native/code-block";
import { useMemo, useRef, useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, View } from "react-native";
import { FloatingActionButton, useFloatingActionButtonScroll } from "@hjmds/react-native/floating-action-button";
import { Asset } from "@hjmds/react-native/asset";
import { assetRecipe } from "@hjmds/design-contracts/components/asset";
import { requireOptionalNativeModule } from "expo";
import { HjmNativeProvider, useHjmNativeTheme } from "@hjmds/react-native/provider";
import { BottomCTA, Button } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { TextField } from "@hjmds/react-native/inputs";
import { SegmentedControl } from "@hjmds/react-native/inputs";
import { OverviewScreen } from "@hjmds/react-native/design-profile";
import { ContentTransition } from "@hjmds/react-native/content-transition";
import { Collapsible } from "@hjmds/react-native/collapsible";
import { Dialog, Sheet } from "@hjmds/react-native/overlays";
import { Notice, Skeleton, Toast } from "@hjmds/react-native/feedback";
import { spacing } from "@hjmds/design-contracts/foundations";
import { Card } from "@hjmds/react-native/data-display";
import { Heading } from "@hjmds/react-native/heading";
import { defineHjmDesignProfile, hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { profileCopy as copy, profileOptions, profileHeadingSamples } from "../../shared/design-profile";
import { productDesignOptions, createPreviewProductResolver, type PreviewProductDesign, type ReferenceDesignPreset } from "../../shared/product-design";
import { ToastPreview } from "./toast-preview";

// Resolve immutable app configurations once; profile changes never key or replace
// the record, input, tab, overlay or pending-action owners.
const resolvePreviewProductDesign = createPreviewProductResolver(preset => hjmDesignPresets[preset], defineHjmDesignProfile);

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
    notice={<ContentTransition stateKey={status}><Text accessibilityLiveRegion="polite">{copy[status]}</Text></ContentTransition>}
    footer={<BottomCTA accessibilityLabel={copy.saveActions} primaryAction={{ label: status === "failed" ? copy.retry : copy.save, onPress: () => void save(), loading: status === "pending", loadingLabel: copy.pending }} secondaryAction={{ label: copy.fail, tone: "ghost", disabled: status === "pending", onPress: () => { failNext.current = true; void save(); } }} />}
    items={items.map(item => ({ id: item.id, children: <Stack gap="sm"><Text variant="heading">{item.title}</Text><Text>{item.body}</Text></Stack> }))} />;
}
// Same public overlay instances stay mounted while the parent profile changes;
// the shared controlled draft is fixture data, with no storage/network mutation.
function ProfileChromeSample({ onNextTheme }: { onNextTheme: () => void }) {
  const [open, setOpen] = useState<"dialog" | "sheet" | null>(null);
  const [draft, setDraft] = useState<string>(copy.initial);
  const fields = <Stack gap="md"><TextField label={copy.overlayDraft} value={draft} onValueChange={setDraft} /><Button onPress={onNextTheme}>{copy.nextTheme}</Button></Stack>;
  return <Collapsible trigger={copy.chrome} defaultOpen><Stack gap="md">
    <Notice title={copy.chromeNotice} /><Skeleton animated={false} />
    <Toast descriptor={{ id: "profile-saved", description: copy.toastCopy, closeLabel: copy.close, durationMs: null }} />
    <Stack axis="inline" gap="sm" wrap><Button onPress={() => setOpen("dialog")}>{copy.dialog}</Button><Button onPress={() => setOpen("sheet")}>{copy.sheet}</Button></Stack>
    <Dialog open={open === "dialog"} onOpenChange={next => { if (!next) setOpen(null); }} title={copy.overlayTitle} closeLabel={copy.close}>{fields}</Dialog>
    <Sheet open={open === "sheet"} onOpenChange={next => { if (!next) setOpen(null); }} title={copy.overlayTitle} closeLabel={copy.close} scrollable>{fields}</Sheet>
  </Stack></Collapsible>;
}

// This Expo host stays in Showcase/product setup, never in the renderer peer
// graph. Android <31 keeps opaque fill rather than claiming a tint is blur.
function loadSurfaceBlur(): typeof import("expo-blur") | null {
  if (!requireOptionalNativeModule("ExpoBlur")) return null;
  // A saved development client can expose the module but lack newer view hosts.
  // Optional decoration failure must not prevent the rest of the gallery loading.
  try { return require("expo-blur") as typeof import("expo-blur"); } catch { return null; }
}
const materialBlur = loadSurfaceBlur();
function ProfileMaterialSample({ onNextTheme }: { onNextTheme: () => void }) {
  const [draft, setDraft] = useState<string>(copy.initial);
  const { colors } = useHjmNativeTheme();
  const target = useRef<View>(null);
  const Target = materialBlur?.BlurTargetView ?? View;
  const surfaceEffects = useMemo(() => ({
    insetShadows: Platform.OS === "ios" || (Platform.OS === "android" && Number(Platform.Version) >= 29), // Expo 57 uses New Architecture; other products must confirm their own host.
    renderBackdrop: ({ strength, theme }: { strength: number; theme: "light" | "dark" }) => materialBlur && (Platform.OS === "ios" || (Platform.OS === "android" && Number(Platform.Version) >= 31))
      ? <materialBlur.BlurView style={StyleSheet.absoluteFill} blurTarget={target} intensity={strength * 100} tint={theme} blurMethod="dimezisBlurViewSdk31Plus" /> : null,
  }), []);
  return <Collapsible trigger={copy.material} defaultOpen><View style={{ position: "relative", padding: spacing.xl }}>
    <Target ref={target} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[StyleSheet.absoluteFill, { flexDirection: "row", flexWrap: "wrap" }]}>
      {Array.from({ length: 8 }, (_, index) => <View key={index} style={{ width: "25%", height: "50%", backgroundColor: index % 2 ? colors.surfaceAccent : colors.primary }} />)}
    </Target>
    <HjmNativeProvider surfaceEffects={surfaceEffects}><Card title={copy.materialTitle} description={copy.materialBody} tone="raised"><Stack gap="md">
      <TextField label={copy.materialDraft} value={draft} onValueChange={setDraft} /><Button onPress={onNextTheme}>{copy.nextTheme}</Button>
    </Stack></Card></HjmNativeProvider>
  </View></Collapsible>;
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
    <Button onPress={onNextTheme}>{copy.nextTheme}</Button><Text tone="muted">{copy.tabsNote}</Text>
  </Stack></Collapsible>;
}

function ProfileAssetSample({ onNextTheme }: { onNextTheme: () => void }) {
  // The existing attributed fixture is unchanged; Asset owns the frame and
  // the product's image host supplies decode/contain (shared/assets/reference-icons/README.md).
  const image = require("../../shared/assets/reference-icons/tick.png");
  return <Collapsible trigger={copy.assets}><Stack gap="md">
    <Stack axis="inline" gap="md" wrap>{([
      ["rounded", copy.assetRounded], ["square", copy.assetSquare], ["circle", copy.assetCircle],
    ] as const).map(([shape, label]) => <Stack key={shape} gap="sm"><Text>{label}</Text>
      <Asset descriptor={{ kind: "image", size: "xlarge", shape, decorative: true }}>
        <Image source={image} accessible={false} resizeMode="contain" style={{ width: assetRecipe.sizes.xlarge, height: assetRecipe.sizes.xlarge }} />
      </Asset>
    </Stack>)}</Stack><Text tone="muted">{copy.assetNote}</Text><Button onPress={onNextTheme}>{copy.nextTheme}</Button>
  </Stack></Collapsible>;
}

export function DesignProfileComparison({ initialProduct = "reference" }: { initialProduct?: PreviewProductDesign }) {
  const [preset, setPreset] = useState<ReferenceDesignPreset>("retro");
  const [product, setProduct] = useState<PreviewProductDesign>(initialProduct);
  const design = resolvePreviewProductDesign(preset, product);
  return <ScrollView keyboardShouldPersistTaps="handled"><Stack gap="xl"><Text variant="heading">{copy.title}</Text><Text>{copy.intro}</Text>
    <SegmentedControl label={copy.product} presentation="pills" items={productDesignOptions.map(option => ({ value: option.id, label: option.label }))} value={product} onValueChange={value => { const option = productDesignOptions.find(option => option.id === value); if (option) setProduct(option.id); }} />
    <Text tone="muted">{copy.productNote}</Text>
    <SegmentedControl label={copy.choose} presentation="pills" items={profileOptions.map(option => ({ value: option.id, label: option.label }))} value={preset} onValueChange={value => { const option = profileOptions.find(option => option.id === value); if (option) setPreset(option.id); }} />
    <View style={{ height: 640 }}>{/* A comparison tile supplies a bounded route viewport; ScreenLayout owns its inner scrolling. */}<HjmNativeProvider designProfile={design}><RecordSample /></HjmNativeProvider></View>
    <HjmNativeProvider designProfile={design}><Collapsible trigger={copy.headingScale} defaultOpen><Stack gap="sm">{profileHeadingSamples.map(sample => <Heading key={sample.level} level={sample.level} semanticLevel={3}>{sample.label}</Heading>)}</Stack></Collapsible></HjmNativeProvider>
    <HjmNativeProvider designProfile={design}><ProfileMaterialSample onNextTheme={() => setPreset(profileOptions[(profileOptions.findIndex(option => option.id === preset) + 1) % profileOptions.length]!.id)} /></HjmNativeProvider>
    <HjmNativeProvider designProfile={design}><ProfileTabsSample onNextTheme={() => setPreset(profileOptions[(profileOptions.findIndex(option => option.id === preset) + 1) % profileOptions.length]!.id)} /></HjmNativeProvider>
    <HjmNativeProvider designProfile={design}><ProfileAssetSample onNextTheme={() => setPreset(profileOptions[(profileOptions.findIndex(option => option.id === preset) + 1) % profileOptions.length]!.id)} /></HjmNativeProvider>
    <HjmNativeProvider designProfile={design}><CodeBlock label={copy.codeTitle} code={copy.codeSource} wrap /></HjmNativeProvider>
    <HjmNativeProvider designProfile={design}><ProfileChromeSample onNextTheme={() => setPreset(profileOptions[(profileOptions.findIndex(option => option.id === preset) + 1) % profileOptions.length]!.id)} /></HjmNativeProvider>
    <HjmNativeProvider designProfile={design}><Collapsible trigger={copy.liquidToast}><View style={{ height: 520 }}>{/* A bounded region keeps the optional canvas out of other comparison sections. */}<ToastPreview enhanced onNextTheme={() => setPreset(profileOptions[(profileOptions.findIndex(option => option.id === preset) + 1) % profileOptions.length]!.id)} /></View></Collapsible></HjmNativeProvider>
    <Text tone="muted">{copy.limitation}</Text>
    <Collapsible trigger={copy.compare} defaultOpen>{profileOptions.map(option => <HjmNativeProvider key={option.id} designProfile={resolvePreviewProductDesign(option.id, product)}><Stack gap="md"><Text variant="title">{option.label}</Text><View style={{ height: 640 }}><RecordSample /></View></Stack></HjmNativeProvider>)}</Collapsible>
  </Stack></ScrollView>;
}

export function OverviewPreview() {
  return <HjmNativeProvider designProfile={hjmDesignPresets.forest}><RecordSample /></HjmNativeProvider>;
}


// A separate study keeps one floating action in a bounded route, rather than
// pinning additional FABs over every tile in the full profile comparison.
export function DesignProfileFloatingActionComparison() {
  const [preset, setPreset] = useState<ReferenceDesignPreset>("retro");
  const [count, setCount] = useState(0);
  const [clearance, setClearance] = useState(0);
  const { layoutMode, onScroll } = useFloatingActionButtonScroll();
  return <HjmNativeProvider designProfile={hjmDesignPresets[preset]}><View style={{ height: 640 }}>
    <ScrollView onScroll={onScroll} scrollEventThrottle={16 /* Match frame cadence so the existing scroll-direction action responds promptly. */} contentContainerStyle={{ paddingBottom: clearance }}><Stack gap="md">
      <Heading level="level4">{copy.floatingAction}</Heading>
      <SegmentedControl label={copy.choose} presentation="pills" items={profileOptions.map(option => ({ value: option.id, label: option.label }))}
        value={preset} onValueChange={value => { const option = profileOptions.find(option => option.id === value); if (option) setPreset(option.id); }} />
      <Text accessibilityLiveRegion="polite">{copy.floatingActivated}: {count}</Text>
      <Button onPress={() => setPreset(profileOptions[(profileOptions.findIndex(option => option.id === preset) + 1) % profileOptions.length]!.id)}>{copy.nextTheme}</Button>
      <Text>{copy.limitation}</Text>
    </Stack></ScrollView>
    <FloatingActionButton descriptor={{ label: copy.floatingCreate, icon: { name: "add" }, layoutMode }}
      renderIcon={({ color }) => <Text style={{ color }}>＋</Text>}
      onContentClearanceChange={setClearance} onPress={() => setCount(current => current + 1)} />
  </View></HjmNativeProvider>;
}
