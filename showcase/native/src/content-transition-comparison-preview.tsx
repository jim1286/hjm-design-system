import { useId, useState } from "react";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Heading } from "@hjmds/react-native/heading";
import { Button } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { TextField } from "@hjmds/react-native/inputs";
import { SegmentedControl } from "@hjmds/react-native/inputs";
import { Tabs, TabPanel } from "@hjmds/react-native/navigation";
import { ContentTransition } from "@hjmds/react-native/content-transition";
import { OnboardingScreen } from "@hjmds/react-native/screen-flows";
import { Notice } from "@hjmds/react-native/feedback";
import { hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { PreviewTools, PreviewToolButton } from "./preview-tools";
import { profileOptions } from "../../shared/design-profile";
import { transitionOptions, transitionSections, transitionCopy as copy, type TransitionChoice, type ContentTransitionComparisonProps } from "../../shared/content-transition-comparison";
import { ScrollView, View } from "react-native";

export function ContentTransitionComparison({ mode = "tabs" }: ContentTransitionComparisonProps) {
  const id = useId();
  const [profileId, setProfileId] = useState<string>(profileOptions[0].id);
  const [choice, setChoice] = useState<TransitionChoice>("profile");
  const [selected, setSelected] = useState<string>("plan");
  const [index, setIndex] = useState(0);
  // Controlled product data stays above transition bodies and the provider;
  // remounting a whole screen to animate would erase drafts and completion state.
  const [draft, setDraft] = useState<string>(copy.initial);
  const [failNext, setFailNext] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);
  // Confirmation is a snapshot; switching to tabs may still edit the current draft.
  const [confirmed, setConfirmed] = useState("");
  const profile = profileOptions.find(option => option.id === profileId) ?? profileOptions[0];
  const transitionProps = choice === "none" ? { motion: "none" as const }
    : choice === "profile" ? {} : { preset: choice };
  const field = <TextField label={copy.draft} value={draft} onValueChange={setDraft} />;
  const section = transitionSections.find(item => item.id === selected)!;
  const body = (item: typeof transitionSections[number]) => <ContentTransition stateKey={item.id} animateHeight {...transitionProps}>
    <Stack gap="md"><Text emphasis="strong">{item.title}</Text><Text>{item.body}</Text>{field}</Stack>
  </ContentTransition>;
  function complete() {
    // Deterministic local failure, without fake network latency or persistence claims.
    if (failNext) { setFailNext(false); setFailed(true); return; }
    setFailed(false); setConfirmed(draft); setDone(true);
  }
  // A bounded preview viewport lets ScreenLayout own body scrolling and its footer;
  // product hosts provide available screen height instead of copying this fixture size.
  const flow = <OnboardingScreen
    steps={transitionSections.map(item => ({ ...item, content: <Stack gap="md">{body(item)}
      {item.id === "review" && failed ? <Notice tone="danger" announcement="assertive" title={copy.failed} /> : null}
    </Stack> }))}
    index={index} onIndexChange={setIndex} nextLabel={copy.next} backLabel={copy.back}
    complete={{ label: copy.complete, onAction: complete }}
    progressLabel={(current, total) => `${current} / ${total}`} />;
  // A bounded route plus comparison controls exceeds the canvas. Match the
  // profile study's outer scroll so the route's existing footer stays reachable.
  return <HjmNativeProvider designProfile={hjmDesignPresets[profile.id]}><ScrollView keyboardShouldPersistTaps="handled"><Stack gap="lg">
    <Heading level="level4">{copy.title}</Heading><Text>{copy.intro}</Text>
    {/* 2026-10-17 composition review: the theme and failure toggles are comparison tools, not
        product actions; one theme out of ten is a single choice, not a "next" button. */}
    <PreviewTools>
      <SegmentedControl label={copy.theme} presentation="pills" items={profileOptions.map(option => ({ value: option.id, label: option.label }))} value={profile.id} onValueChange={setProfileId} />
      {mode === "steps" && !done ? <PreviewToolButton selected={failNext} onPress={() => setFailNext(current => !current)}>{failNext ? copy.failArmed : copy.fail}</PreviewToolButton> : null}
    </PreviewTools>
    <Stack gap="xs"><Text variant="label">{copy.appearance}</Text>
      <SegmentedControl label={copy.appearance} presentation="pills" items={transitionOptions}
        value={choice} onValueChange={next => { if (transitionOptions.some(option => option.value === next)) setChoice(next as TransitionChoice); }} /></Stack>
    {mode === "tabs" ? <Stack gap="md">
      <Tabs id={id} label={copy.tabs} items={transitionSections} value={selected} onValueChange={setSelected}
        panelMode="dynamic" renderPanels={false} activationMode="manual" />
      <TabPanel tabsId={id} activeValue={selected} mode="dynamic" label={section.label}>{body(section)}</TabPanel>
    </Stack> : done ? <Stack gap="md"><Notice tone="success" title={copy.done} /><Text>{confirmed}</Text>
      <Button onPress={() => { setDone(false); setIndex(0); }}>{copy.restart}</Button>
    </Stack> : <View style={{ height: 720 }}>{flow}</View>}
  </Stack></ScrollView></HjmNativeProvider>;
}
