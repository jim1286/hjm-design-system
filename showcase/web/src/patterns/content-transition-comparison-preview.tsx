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
import { PreviewTools, PreviewToolButton } from "./preview-tools";
import { profileOptions } from "../../../shared/design-profile";
import { transitionOptions, transitionSections, transitionCopy as copy, type TransitionChoice, type ContentTransitionComparisonProps } from "../../../shared/content-transition-comparison";

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
  const restartRef = useRef<HTMLButtonElement>(null);
  const draftRef = useRef<HTMLInputElement>(null);
  const resumeDraft = useRef(false);
  // Completion and restart both remove the active button. Focus the newly available action/input.
  useEffect(() => {
    if (mode !== "steps") return;
    if (done) restartRef.current?.focus();
    else if (resumeDraft.current) { resumeDraft.current = false; draftRef.current?.focus(); }
  }, [done, mode]);
  const profile = profileOptions.find(option => option.id === profileId) ?? profileOptions[0];
  const transitionProps = choice === "none" ? { motion: "none" as const }
    : choice === "profile" ? {} : { preset: choice };
  const field = <TextField ref={draftRef} label={copy.draft} value={draft} onValueChange={setDraft} />;
  const section = transitionSections.find(item => item.id === selected)!;
  const body = (item: typeof transitionSections[number]) => <ContentTransition stateKey={item.id} animateHeight {...transitionProps}>
    <Stack gap="md"><Text emphasis="strong">{item.title}</Text><Text>{item.body}</Text>{field}</Stack>
  </ContentTransition>;
  function complete() {
    // Deterministic local failure, without fake network latency or persistence claims.
    if (failNext) { setFailNext(false); setFailed(true); return; }
    setFailed(false); setConfirmed(draft); setDone(true);
  }
  // This bounded preview floor keeps body scrolling and the footer observable at short
  // viewport heights. Product layout tokens describe rhythm, not this fixture viewport;
  // consuming hosts provide available height (see the composition usage guidance).
  const flow = <OnboardingScreen
    steps={transitionSections.map(item => ({ ...item, content: <Stack gap="md">{body(item)}
      {item.id === "review" && failed ? <Notice tone="danger" title={copy.failed} /> : null}
    </Stack> }))}
    index={index} onIndexChange={setIndex} nextLabel={copy.next} backLabel={copy.back}
    complete={{ label: copy.complete, onAction: complete }}
    progressLabel={(current, total) => `${current} / ${total}`} />;
  return <HjmProvider designProfile={hjmDesignPresets[profile.id]}><Stack gap="lg">
    <Heading level="level4" semanticLevel={2}>{copy.title}</Heading><Text>{copy.intro}</Text>
    {/* 2026-10-17 composition review: the theme and failure toggles are comparison tools, not
        product actions; one theme out of ten is a single choice, not a "next" button. */}
    <PreviewTools>
      <SegmentedControl label={copy.theme} presentation="pills" items={profileOptions.map(option => ({ value: option.id, label: option.label }))} value={profile.id} onValueChange={setProfileId} />
      {mode === "steps" && !done ? <PreviewToolButton selected={failNext} onClick={() => setFailNext(current => !current)}>{failNext ? copy.failArmed : copy.fail}</PreviewToolButton> : null}
    </PreviewTools>
    <Stack gap="xs"><Text variant="label">{copy.appearance}</Text>
      <SegmentedControl label={copy.appearance} presentation="pills" items={transitionOptions}
        value={choice} onValueChange={next => { if (transitionOptions.some(option => option.value === next)) setChoice(next as TransitionChoice); }} /></Stack>
    {mode === "tabs" ? <Stack gap="md">
      <Tabs id={id} label={copy.tabs} items={transitionSections} value={selected} onValueChange={setSelected}
        panelMode="dynamic" renderPanels={false} activationMode="manual" />
      <TabPanel tabsId={id} activeValue={selected} mode="dynamic">{body(section)}</TabPanel>
    </Stack> : done ? <Stack gap="md"><Notice tone="success" title={copy.done} /><Text>{confirmed}</Text>
      <Button ref={restartRef} onClick={() => { resumeDraft.current = true; setDone(false); setIndex(0); }}>{copy.restart}</Button>
    </Stack> : <div style={{ height: "70dvh", minHeight: 360 }}>{flow}</div>}
  </Stack></HjmProvider>;
}
