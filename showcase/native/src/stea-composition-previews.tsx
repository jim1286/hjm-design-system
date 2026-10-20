import type { ComponentRef } from "react";
import { Container } from "@hjmds/react-native/primitives";
// STEA Code P1 후보를 기존 HJM API만으로 조합한 실험 구성이다. 새 공개 API는 만들지 않는다.
// 상태 규칙은 shared/stea-compositions.ts가 소유하고 이 파일은 Native 표현만 맡는다.
import { useEffect, useReducer, useRef, useState } from "react";
import { AccessibilityInfo, AppState, Platform, ScrollView, type TextInput } from "react-native";
import { Check } from "lucide-react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { Button } from "@hjmds/react-native/actions";
import { ContentTransition } from "@hjmds/react-native/content-transition";
import { Card, List, ListRow, Statistic, Timeline } from "@hjmds/react-native/data-display";
import { Notice, Progress, Result } from "@hjmds/react-native/feedback";
import { OtpField, SegmentedControl } from "@hjmds/react-native/inputs";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { Steps } from "@hjmds/react-native/steps";
import { StatusText } from "@hjmds/react-native/status-text";
import { PreviewToolButton, PreviewTools } from "./preview-tools";
// Metro resolves the shared TypeScript source by extension; a literal .js path has no file.
import {
  canSubmitOtp, initialOrderState, initialOtpState, isOrderDone, orderCopy, orderReducer, orderStepsDescriptor,
  otpCopy, otpErrorMessage, otpLength, otpReducer, scheduleCopy, scheduleDayLabel, scheduleDays, scheduleForDay,
  statCopy, statPeriods, statsByPeriod, steaSimulatedLatencyMs, steaStepName, steaTimelineName, type StatPeriod,
} from "../../shared/stea-compositions";

export function OrderProgressRetry() {
  const [state, dispatch] = useReducer(orderReducer, initialOrderState);
  useEffect(() => {
    if (state.phase !== "requesting") return;
    const timer = setTimeout(() => dispatch({ type: "respond" }), steaSimulatedLatencyMs);
    return () => clearTimeout(timer);
  }, [state.phase]);
  const done = isOrderDone(state);
  return <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }} keyboardShouldPersistTaps="handled"><Container><Stack gap="lg"><Card title={orderCopy.title} description={orderCopy.description}>
    <Stack gap="lg">
      <Steps descriptor={orderStepsDescriptor(state)} statusLabels={orderCopy.statusLabels} composeAccessibleName={steaStepName} />
      {/* iOS는 accessibilityLiveRegion을 무시하므로 빈 문구로 자리를 잡아 둘 이유가 없다. 빈 Text가 큰 틈을 남겼다(2026-10-02 시뮬레이터 확인). */}
      {state.phase === "requesting" || done ? <StatusText announceOnMount>{done ? orderCopy.done : orderCopy.requesting}</StatusText> : null}
      {state.phase === "failed" ? <Notice tone="danger" announcement="assertive" title={orderCopy.failed} /> : null}
      {done
        ? <Button tone="secondary" onPress={() => dispatch({ type: "restart" })}>{orderCopy.restart}</Button>
        : <Button loading={state.phase === "requesting"} onPress={() => dispatch({ type: "request" })}>
            {state.phase === "failed" ? orderCopy.retry : orderCopy.request}
          </Button>}
      <Text variant="label" tone="muted">{orderCopy.logLabel}</Text>
      <Timeline items={state.log} composeAccessibleName={steaTimelineName} />
    </Stack>
  </Card>
  {done ? null : <PreviewTools><PreviewToolButton selected={state.failNext} disabled={state.phase === "requesting"} onPress={() => dispatch({ type: "toggleFailNext" })}>{orderCopy.failNext}</PreviewToolButton></PreviewTools>}
  </Stack></Container></ScrollView>;
}

export function OtpVerifyRecover() {
  const [state, dispatch] = useReducer(otpReducer, initialOtpState);
  useEffect(() => {
    if (state.phase !== "verifying") return;
    const timer = setTimeout(() => dispatch({ type: "respond" }), steaSimulatedLatencyMs);
    return () => clearTimeout(timer);
  }, [state.phase]);
  // phase를 의존성에 넣으면 확인 요청마다 1초 타이머가 다시 시작돼 대기 시간이 줄지 않는다(2026-10-02 실측).
  const verified = state.phase === "verified";
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const previousVerified = useRef(verified);
  const previousResend = useRef(state.resendCount);
  useEffect(() => {
    const entering = previousVerified.current && !verified;
    const resending = previousResend.current !== state.resendCount && state.resent;
    // Result keeps its actions individually accessible. Announce success instead
    // of focusing an artificial group around the entire result and its buttons.
    if (verified && !previousVerified.current && Platform.OS === "ios" && AppState.currentState === "active") {
      AccessibilityInfo.announceForAccessibilityWithOptions(`${otpCopy.successTitle}. ${otpCopy.successBody}`, { queue: true });
    }
    previousVerified.current = verified;
    previousResend.current = state.resendCount;
    if (entering || resending) input.current?.focus();
  }, [verified, state.resendCount, state.resent]);
  useEffect(() => {
    if (state.resendIn === 0 || verified) return;
    const timer = setTimeout(() => dispatch({ type: "tick" }), 1000);
    return () => clearTimeout(timer);
  }, [state.resendIn, verified]);
  const error = otpErrorMessage(state);
  return <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }} keyboardShouldPersistTaps="handled"><Container size="reading"><Stack gap="md"><Card title={otpCopy.title} description={otpCopy.description}>
    <ContentTransition stateKey={state.phase === "verified" ? "verified" : "form"}>
      {state.phase === "verified"
        ? <Result accessibilityLiveRegion="polite" status="success" renderIcon={({ color }) => <Check color={color} accessible={false} />} title={otpCopy.successTitle} description={otpCopy.successBody}
            actions={[{ label: otpCopy.again, onAction: () => dispatch({ type: "reset" }) }]} />
        : <Stack gap="md">
            <OtpField ref={input} label={otpCopy.field} length={otpLength} value={state.value}
              onValueChange={value => dispatch({ type: "change", value })}
              onComplete={() => dispatch({ type: "submit" })}
              busy={state.phase === "verifying"} disabled={state.phase === "locked"}
              {...(error ? { error } : {})} />
            {state.resent ? <StatusText announceOnMount tone="muted">{otpCopy.resent}</StatusText> : null}
            <Stack gap="xs">
              <Button loading={state.phase === "verifying"} disabled={!canSubmitOtp(state) && state.phase !== "verifying"} onPress={() => dispatch({ type: "submit" })}>{otpCopy.submit}</Button>
              <Button tone="ghost" disabled={state.resendIn > 0 || state.phase === "verifying"} onPress={() => dispatch({ type: "resend" })}>
                {state.resendIn > 0 ? otpCopy.resendWait(state.resendIn) : otpCopy.resend}
              </Button>
            </Stack>
          </Stack>}
    </ContentTransition>
  </Card><Text variant="caption" tone="muted">{otpCopy.fixtureHint}</Text></Stack></Container></ScrollView>;
}

export function ScheduleDayList() {
  const [day, setDay] = useState(scheduleDays[0]!.value);
  const items = scheduleForDay(day);
  return <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }} keyboardShouldPersistTaps="handled"><Container><Card title={scheduleCopy.title} description={scheduleCopy.description}>
    <Stack gap="md">
      <SegmentedControl label={scheduleCopy.dayLabel} value={day} onValueChange={setDay}
        items={scheduleDays.map(entry => ({ value: entry.value, label: entry.label }))} />
      <ContentTransition stateKey={day}>
        {items.length
          ? <List label={scheduleCopy.listLabel(scheduleDayLabel(day))}>
              {items.map(item => <ListRow key={item.id} title={item.title} description={`${item.time} · ${item.place}`} />)}
            </List>
          : <Stack gap="xs"><Text emphasis="strong">{scheduleCopy.empty}</Text><Text tone="muted">{scheduleCopy.emptyHint}</Text></Stack>}
      </ContentTransition>
    </Stack>
  </Card></Container></ScrollView>;
}

export function StatChangeSummary() {
  const [period, setPeriod] = useState<StatPeriod>("week");
  const data = statsByPeriod[period];
  return <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }} keyboardShouldPersistTaps="handled"><Container><Card title={statCopy.title} description={statCopy.description}>
    <Stack gap="lg">
      <SegmentedControl label={statCopy.periodLabel} value={period} onValueChange={value => setPeriod(value as StatPeriod)} items={statPeriods} />
      <Stack gap="md">{data.items.map(item => <Statistic key={item.id} descriptor={item} />)}</Stack>
      <Progress label={statCopy.goalLabel(period)} value={data.goal} valueText={`${data.goal}%`} />
    </Stack>
  </Card></Container></ScrollView>;
}
