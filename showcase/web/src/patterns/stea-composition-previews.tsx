// STEA Code P1 후보를 기존 HJM API만으로 조합한 실험 구성이다. 새 공개 API는 만들지 않는다.
// 상태 규칙은 shared/stea-compositions.ts가 소유하고 이 파일은 Web 표현만 맡는다.
import { useEffect, useReducer, useRef, useState } from "react";
import { Button } from "@hjmds/react/actions";
import { ContentTransition } from "@hjmds/react/content-transition";
import { Card, List, ListRow, Statistic, Timeline } from "@hjmds/react/display";
import { Notice, Progress, Result } from "@hjmds/react/feedback";
import { OtpField } from "@hjmds/react/forms";
import { Stack, Text } from "@hjmds/react/layout";
import { SegmentedControl, Switch } from "@hjmds/react/selection";
import { Steps } from "@hjmds/react/steps";
import {
  canSubmitOtp, initialOrderState, initialOtpState, isOrderDone, orderCopy, orderReducer, orderStepsDescriptor,
  otpCopy, otpErrorMessage, otpLength, otpReducer, scheduleCopy, scheduleDayLabel, scheduleDays, scheduleForDay,
  statCopy, statPeriods, statsByPeriod, steaSimulatedLatencyMs, steaStepName, steaTimelineName, type StatPeriod,
} from "../../../shared/stea-compositions";

export function OrderProgressRetry() {
  const [state, dispatch] = useReducer(orderReducer, initialOrderState);
  // 요청 중일 때만 응답 타이머를 건다. 화면을 떠나면 cleanup이 응답을 버린다.
  useEffect(() => {
    if (state.phase !== "requesting") return;
    const timer = setTimeout(() => dispatch({ type: "respond" }), steaSimulatedLatencyMs);
    return () => clearTimeout(timer);
  }, [state.phase]);
  const done = isOrderDone(state);
  return <Card title={orderCopy.title} description={orderCopy.description}>
    <Stack gap="lg">
      <Steps descriptor={orderStepsDescriptor(state)} statusLabels={orderCopy.statusLabels} composeAccessibleName={steaStepName} />
      <Text role="status">{state.phase === "requesting" ? orderCopy.requesting : done ? orderCopy.done : ""}</Text>
      {state.phase === "failed" ? <Notice tone="danger" title={orderCopy.failed} /> : null}
      <Stack gap="sm">
        {done
          ? <Button tone="secondary" onClick={() => dispatch({ type: "restart" })}>{orderCopy.restart}</Button>
          : <Button loading={state.phase === "requesting"} onClick={() => dispatch({ type: "request" })}>
              {state.phase === "failed" ? orderCopy.retry : orderCopy.request}
            </Button>}
        {done ? null : <Switch label={orderCopy.failNext} checked={state.failNext} onCheckedChange={() => dispatch({ type: "toggleFailNext" })} />}
      </Stack>
      <Text variant="label" tone="muted">{orderCopy.logLabel}</Text>
      <Timeline items={state.log} composeAccessibleName={steaTimelineName} />
    </Stack>
  </Card>;
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
  useEffect(() => {
    if (state.resendIn === 0 || verified) return;
    const timer = setTimeout(() => dispatch({ type: "tick" }), 1000);
    return () => clearTimeout(timer);
  }, [state.resendIn, verified]);
  const error = otpErrorMessage(state);
  const input = useRef<HTMLInputElement>(null);
  const result = useRef<HTMLDivElement>(null);
  // busy 동안 OtpField는 포커스를 유지한다(2026-10-02 수정). 재전송 버튼을 누른 뒤에는 새 번호를 바로
  // 입력하도록, 성공하면 입력이 사라지므로 결과로 포커스를 옮긴다.
  useEffect(() => {
    if (state.phase === "editing" && state.resent) input.current?.focus();
    if (state.phase === "verified") result.current?.focus();
  }, [state.phase, state.resendCount]);
  // 성공 화면 전환은 서버 확인(respond) 뒤에만 일어난다. 입력 중에는 같은 subtree를 유지해 슬롯이 움직이지 않는다.
  return <Card title={otpCopy.title} description={otpCopy.description}>
    <ContentTransition stateKey={state.phase === "verified" ? "verified" : "form"}>
      {state.phase === "verified"
        ? <Result ref={result} tabIndex={-1} status="success" title={otpCopy.successTitle} description={otpCopy.successBody}
            actions={[{ label: otpCopy.again, onAction: () => dispatch({ type: "reset" }) }]} />
        : <form onSubmit={event => { event.preventDefault(); dispatch({ type: "submit" }); }}>
            <Stack gap="md">
              <OtpField ref={input} label={otpCopy.field} length={otpLength} value={state.value}
                onValueChange={value => dispatch({ type: "change", value })}
                busy={state.phase === "verifying"} disabled={state.phase === "locked"}
                description={otpCopy.hint} {...(error ? { error } : {})} />
              {state.resent ? <Text role="status" tone="muted">{otpCopy.resent}</Text> : null}
              <Button type="submit" loading={state.phase === "verifying"} disabled={!canSubmitOtp(state) && state.phase !== "verifying"}>{otpCopy.submit}</Button>
              <Button type="button" tone="ghost" disabled={state.resendIn > 0 || state.phase === "verifying"} onClick={() => dispatch({ type: "resend" })}>
                {state.resendIn > 0 ? otpCopy.resendWait(state.resendIn) : otpCopy.resend}
              </Button>
            </Stack>
          </form>}
    </ContentTransition>
  </Card>;
}

export function ScheduleDayList() {
  const [day, setDay] = useState(scheduleDays[0]!.value);
  const items = scheduleForDay(day);
  return <Card title={scheduleCopy.title} description={scheduleCopy.description}>
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
  </Card>;
}

export function StatChangeSummary() {
  const [period, setPeriod] = useState<StatPeriod>("week");
  const data = statsByPeriod[period];
  return <Card title={statCopy.title} description={statCopy.description}>
    <Stack gap="lg">
      <SegmentedControl label={statCopy.periodLabel} value={period} onValueChange={value => setPeriod(value as StatPeriod)} items={statPeriods} />
      <Stack gap="md">{data.items.map(item => <Statistic key={item.id} descriptor={item} />)}</Stack>
      <Progress label={statCopy.goalLabel(period)} value={data.goal} valueText={`${data.goal}%`} />
    </Stack>
  </Card>;
}
