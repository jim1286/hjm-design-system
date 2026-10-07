import { useEffect, useId, useRef, useState } from "react";
import { HjmProvider } from "@hjmds/react/provider";
import { Heading } from "@hjmds/react/heading";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { TextField } from "@hjmds/react/forms";
import { SegmentedControl } from "@hjmds/react/selection";
import { Tabs, TabPanel } from "@hjmds/react/navigation";
import { ContentTransition } from "@hjmds/react/content-transition";
import { OnboardingScreen } from "@hjmds/react/screen-flows";
import { Notice } from "@hjmds/react/feedback";
import { hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { profileOptions } from "../../../shared/design-profile";
import { transitionOptions, transitionSections, transitionCopy as copy, type TransitionChoice, type ContentTransitionComparisonProps } from "../../../shared/content-transition-comparison";

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
  const restartRef = useRef<HTMLButtonElement>(null);
  // Completion removes its footer action, so move Web focus to the next available action.
  useEffect(() => { if (done) restartRef.current?.focus(); }, [done]);
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
  const flow = <OnboardingScreen
    steps={transitionSections.map(item => ({ ...item, content: <Stack gap="md">{body(item)}
      {item.id === "review" ? <Stack gap="sm">
        <Button tone="secondary" onClick={() => setFailNext(true)}>{failNext ? copy.failArmed : copy.fail}</Button>
        {failed ? <Notice tone="danger" title={copy.failed} /> : null}
      </Stack> : null}
    </Stack> }))}
    index={index} onIndexChange={setIndex} nextLabel={copy.next} backLabel={copy.back}
    complete={{ label: copy.complete, onAction: complete }}
    progressLabel={(current, total) => `${current} / ${total}`} />;
  return <HjmProvider designProfile={hjmDesignPresets[profile.id]}><Stack gap="lg">
    <Heading level="level4" semanticLevel={2}>{copy.title}</Heading><Text>{copy.intro}</Text>
    <Stack gap="sm"><Text>{copy.theme}: {profile.label}</Text>
      <Button tone="secondary" onClick={() => setThemeIndex(current => (current + 1) % profileOptions.length)}>{copy.nextTheme}</Button>
    </Stack>
    <SegmentedControl label={copy.appearance} presentation="pills" items={transitionOptions}
      value={choice} onValueChange={next => { if (transitionOptions.some(option => option.value === next)) setChoice(next as TransitionChoice); }} />
    {mode === "tabs" ? <Stack gap="md">
      <Tabs id={id} label={copy.tabs} items={transitionSections} value={selected} onValueChange={setSelected}
        panelMode="dynamic" renderPanels={false} activationMode="manual" />
      <TabPanel tabsId={id} activeValue={selected} mode="dynamic">{body(section)}</TabPanel>
    </Stack> : done ? <Stack gap="md"><Notice tone="success" title={copy.done} /><Text>{draft}</Text>
      <Button ref={restartRef} onClick={() => { setDone(false); setIndex(0); }}>{copy.restart}</Button>
    </Stack> : <div style={{ height: "70dvh", minHeight: 360 }}>{flow}</div>}
  </Stack></HjmProvider>;
}
