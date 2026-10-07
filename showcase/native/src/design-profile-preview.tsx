import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Button } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { TextField } from "@hjmds/react-native/inputs";
import { SegmentedControl } from "@hjmds/react-native/inputs";
import { OverviewScreen } from "@hjmds/react-native/design-profile";
import { ContentTransition } from "@hjmds/react-native/content-transition";
import { Collapsible } from "@hjmds/react-native/collapsible";
import { hjmDesignPresets, type HjmDesignPreset } from "@hjmds/design-contracts/design-profile";
import { profileCopy as copy, profileOptions } from "../../shared/design-profile";

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
    footer={<Stack gap="sm"><Button onPress={() => void save()} loading={status === "pending"} loadingLabel={copy.pending}>{status === "failed" ? copy.retry : copy.save}</Button><Button tone="ghost" disabled={status === "pending"} onPress={() => { failNext.current = true; void save(); }}>{copy.fail}</Button></Stack>}
    items={items.map(item => ({ id: item.id, children: <Stack gap="sm"><Text variant="heading">{item.title}</Text><Text>{item.body}</Text></Stack> }))} />;
}
export function DesignProfileComparison() {
  const [preset, setPreset] = useState<HjmDesignPreset>("retro");
  return <ScrollView keyboardShouldPersistTaps="handled"><Stack gap="xl"><Text variant="heading">{copy.title}</Text><Text>{copy.intro}</Text>
    <SegmentedControl label={copy.choose} presentation="pills" items={profileOptions.map(option => ({ value: option.id, label: option.label }))} value={preset} onValueChange={value => { const option = profileOptions.find(option => option.id === value); if (option) setPreset(option.id); }} />
    <View style={{ height: 640 }}>{/* A comparison tile supplies a bounded route viewport; ScreenLayout owns its inner scrolling. */}<HjmNativeProvider designProfile={hjmDesignPresets[preset]}><RecordSample /></HjmNativeProvider></View>
    <Text tone="muted">{copy.limitation}</Text>
    <Collapsible trigger={copy.compare} defaultOpen>{profileOptions.map(option => <HjmNativeProvider key={option.id} designProfile={hjmDesignPresets[option.id]}><Stack gap="md"><Text variant="title">{option.label}</Text><View style={{ height: 640 }}><RecordSample /></View></Stack></HjmNativeProvider>)}</Collapsible>
  </Stack></ScrollView>;
}

export function OverviewPreview() {
  return <HjmNativeProvider designProfile={hjmDesignPresets.forest}><RecordSample /></HjmNativeProvider>;
}
