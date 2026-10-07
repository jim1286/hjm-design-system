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
import { profileOptions } from "../../shared/design-profile";
import { transitionOptions, transitionSections, transitionCopy as copy, type TransitionChoice, type ContentTransitionComparisonProps } from "../../shared/content-transition-comparison";
import { ScrollView, View } from "react-native";

export function ContentTransitionComparison({ mode = "tabs" }: ContentTransitionComparisonProps) {
  const id = useId();
  const [themeIndex, setThemeIndex] = useState(0);
  const [choice, setChoice] = useState<TransitionChoice>("profile");
  const [selected, setSelected] = useState<string>("plan");
  const [index, setIndex] = useState(0);
  // Controlled product data stays above transition bodies and the provider;
  // remounting a whole screen to animate would erase drafts and completion state.
  const [draft, setDraft] = useState<string>(copy.initial);
  const [failNext, setFailNext] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);
  const profile = profileOptions[themeIndex]!;
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
    setFailed(false); setDone(true);
  }
  // A bounded preview viewport lets ScreenLayout own body scrolling and its footer;
  // product hosts provide available screen height instead of copying this fixture size.
  const flow = <OnboardingScreen
    steps={transitionSections.map(item => ({ ...item, content: <Stack gap="md">{body(item)}
      {item.id === "review" ? <Stack gap="sm">
        <Button tone="secondary" onPress={() => setFailNext(true)}>{failNext ? copy.failArmed : copy.fail}</Button>
        {failed ? <Notice tone="danger" announcement="assertive" title={copy.failed} /> : null}
      </Stack> : null}
    </Stack> }))}
    index={index} onIndexChange={setIndex} nextLabel={copy.next} backLabel={copy.back}
    complete={{ label: copy.complete, onAction: complete }}
    progressLabel={(current, total) => `${current} / ${total}`} />;
  // A bounded route plus comparison controls exceeds the canvas. Match the
  // profile study's outer scroll so the route's existing footer stays reachable.
  return <HjmNativeProvider designProfile={hjmDesignPresets[profile.id]}><ScrollView keyboardShouldPersistTaps="handled"><Stack gap="lg">
    <Heading level="level4">{copy.title}</Heading><Text>{copy.intro}</Text>
    <Stack gap="sm"><Text>{copy.theme}: {profile.label}</Text>
      <Button tone="secondary" onPress={() => setThemeIndex(current => (current + 1) % profileOptions.length)}>{copy.nextTheme}</Button>
    </Stack>
    <SegmentedControl label={copy.appearance} presentation="pills" items={transitionOptions}
      value={choice} onValueChange={next => { if (transitionOptions.some(option => option.value === next)) setChoice(next as TransitionChoice); }} />
    {mode === "tabs" ? <Stack gap="md">
      <Tabs id={id} label={copy.tabs} items={transitionSections} value={selected} onValueChange={setSelected}
        panelMode="dynamic" renderPanels={false} activationMode="manual" />
      <TabPanel tabsId={id} activeValue={selected} mode="dynamic" label={section.label}>{body(section)}</TabPanel>
    </Stack> : done ? <Stack gap="md"><Notice tone="success" title={copy.done} /><Text>{draft}</Text>
      <Button onPress={() => { setDone(false); setIndex(0); }}>{copy.restart}</Button>
    </Stack> : <View style={{ height: 720 }}>{flow}</View>}
  </Stack></ScrollView></HjmNativeProvider>;
}
