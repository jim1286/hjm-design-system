"use client";
import { useState, type ReactNode } from "react";
import { resolveFollowProposal, resolveAttendanceProposal, type FollowProfileState, type AttendanceChoice, type EventAttendanceState } from "@hjmds/design-contracts/social-compositions";
import { Button } from "./actions.js";
import { AnimatedStatistic } from "./statistic-motion.js";
import { Avatar, Card } from "./data-display.js";
import { Stack, Text } from "./primitives.js";
import { RadioGroup } from "./inputs.js";
import { useCompositionAction } from "./internal/use-composition-action.js";

type Person = Readonly<{ id: string; name: string; avatar?: ReactNode }>;
function Failure({ failed, label }: Readonly<{ failed: boolean; label: string }>) {
  return failed ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" align="center" tone="danger">{label}</Text> : null;
}
export type FollowProfileCardProps = Readonly<{
  /** Changing entities remounts the action scope and detaches old responses. */
  profileId: string; name: string; description?: ReactNode; avatar?: ReactNode;
  state: FollowProfileState; locale: string;
  labels: Readonly<{ follow: string; following: string; pending: string; count: string; error: string }>;
  /** Resolve only after the real mutation; update state with the server's confirmed snapshot. */
  onFollowChange: (following: boolean) => void | Promise<void>; disabled?: boolean;
}>;
export function FollowProfileCard(props: FollowProfileCardProps) {
  if (!props.profileId.trim()) throw new TypeError("Follow profile requires a stable id");
  return <FollowProfileBody key={props.profileId} {...props} />;
}
function FollowProfileBody(props: FollowProfileCardProps) {
  resolveFollowProposal(props.state, props.state.following);
  const action = useCompositionAction<FollowProfileState>(props.disabled);
  // Capture the proposal once; changing server counts during the request must not add the delta twice.
  const displayed: FollowProfileState = action.active ?? props.state;
  return <Card title={props.name} description={props.description} leading={props.avatar ?? <Avatar name={props.name} decorative />}>
    <Stack gap="md"><AnimatedStatistic descriptor={{ id: "social-count", label: props.labels.count }} value={displayed.count} locale={props.locale} />
      <Button selected={displayed.following} loading={action.pending} loadingLabel={props.labels.pending} disabled={props.disabled === true}
        onPress={() => { const proposal = resolveFollowProposal(props.state, !props.state.following); void action.run(proposal, () => props.onFollowChange(proposal.following)); }}>
        {displayed.following ? props.labels.following : props.labels.follow}
      </Button><Failure failed={action.failed} label={props.labels.error} />
    </Stack>
  </Card>;
}

export type EventAttendanceCardProps = Readonly<{
  eventId: string; title: string; description?: ReactNode; dateLabel: string;
  state: EventAttendanceState; choices: readonly AttendanceChoice[]; participants: readonly Person[]; locale: string;
  labels: Readonly<{ response: string; pending: string; count: string; calendar: string; calendarAdded: string; error: string }>;
  onResponseChange: (responseId: string) => void | Promise<void>;
  /** Actual calendar adapter, including platform permissions; rejection stays retryable. */
  onAddToCalendar: () => void | Promise<void>; disabled?: boolean;
}>;
export function EventAttendanceCard(props: EventAttendanceCardProps) {
  if (!props.eventId.trim()) throw new TypeError("Event attendance requires a stable id");
  return <EventAttendanceBody key={props.eventId} {...props} />;
}
function EventAttendanceBody(props: EventAttendanceCardProps) {
  resolveAttendanceProposal(props.state, props.choices, props.state.responseId);
  const action = useCompositionAction<EventAttendanceState | "calendar">(props.disabled), [calendarAdded, setCalendarAdded] = useState(false);
  const displayed: EventAttendanceState = action.active === null || action.active === "calendar" ? props.state : action.active;
  const locked = props.disabled === true || action.pending;
  return <Card title={props.title} description={props.description}><Stack gap="md">
    <Text>{props.dateLabel}</Text>
    <AnimatedStatistic descriptor={{ id: "social-count", label: props.labels.count }} value={displayed.count} locale={props.locale} />
    <Stack axis="inline" gap="xs" wrap>{props.participants.map(person => <Stack key={person.id} axis="inline" gap="xs" align="center">{person.avatar ?? <Avatar name={person.name} decorative />}<Text>{person.name}</Text></Stack>)}</Stack>
    {/* One answer out of several is a radio choice; selected primary Buttons gave the card three primaries.
        RadioGroup (not SegmentedControl) keeps the "no answer yet" state that responseId=null needs; plain keeps
        three short answers on one line inside the card. */}
    <RadioGroup label={props.labels.response} orientation="horizontal" presentation="plain" value={displayed.responseId}
      items={props.choices.map(choice => ({ value: choice.id, label: choice.label, ...(choice.disabled ? { disabled: true } : {}) }))}
      disabled={locked} {...(action.pending && action.active !== "calendar" ? { description: props.labels.pending } : {})}
      onValueChange={id => { const choice = props.choices.find(item => item.id === id); if (!choice || choice.disabled || choice.id === props.state.responseId || locked) return; const proposal = resolveAttendanceProposal(props.state, props.choices, choice.id); void action.run(proposal, () => props.onResponseChange(choice.id)); }} />
    <Button tone="secondary" disabled={locked || calendarAdded} loading={action.active === "calendar"} loadingLabel={props.labels.pending}
      onPress={() => { if (calendarAdded) return; void action.run("calendar", props.onAddToCalendar).then(outcome => { if (outcome.status === "success") setCalendarAdded(true); }); }}>{calendarAdded ? props.labels.calendarAdded : props.labels.calendar}</Button>
    <Failure failed={action.failed} label={props.labels.error} />
  </Stack></Card>;
}
