// STEA Code 후보 검토(docs/plans/stea-code-adoption-2026-10-02.md)에서 흡수하기로 한 P1 구성의
// 공유 상태와 문구다. 원본(Uiverse.io 작품을 STEA가 재포장)은 고정 HTML이거나 무작위 실패
// (`errorRate: 0.15`)로 성공을 흉내 내므로 코드를 복사하지 않고, 기존 HJM 계약 위에
// "요청 → 확정 → 실패·복구" 순서만 다시 구현한다. 웹·앱이 같은 규칙을 쓰도록 순수 함수로 둔다.
// 실패는 무작위가 아니라 사용자가 고른 스위치로 재현한다. 무작위 실패는 검토자가
// 복구 흐름을 일부러 확인할 수 없기 때문이다.

// shared/의 다른 모듈처럼 패키지를 import하지 않는다(Web·Native 어느 쪽에서도 해석되도록).
// 아래 타입은 HJM 계약의 구조적 부분집합이며, 미리보기에서 컴포넌트에 넘길 때 실제 계약으로 검사된다.
type StepsStatusLabels = Readonly<{ pending: string; current: string; complete: string; error: string }>;
type TimelineItemDescriptor = Readonly<{ id: string; label: string; timestamp?: string; description?: string; tone?: "neutral" | "info" | "success" | "attention" }>;
type StatisticDescriptor = Readonly<{
  id: string; label: string; value: string; prefix?: string; suffix?: string; hint?: string;
  trend?: Readonly<{ direction: "up" | "down" | "flat"; tone?: "neutral" | "success" | "warning" | "danger"; label: string }>;
}>;

/** 실제 서버 응답 대신 쓰는 지연. 너무 짧으면 진행 상태를 볼 수 없고 길면 검토가 늘어진다. */
export const steaSimulatedLatencyMs = 900;

export const steaStepName = ({ position, total, label }: { position: number; total: number; label: string }) =>
  `${total}단계 중 ${position}, ${label}`;
// 기록은 단계가 아니라 사건 목록이라 "5단계 중"으로 읽히면 단계 수와 혼동된다.
export const steaTimelineName = ({ position, total, label }: { position: number; total: number; label: string }) =>
  `기록 ${total}개 중 ${position}번째, ${label}`;

// --- 처리 단계와 재시도 -------------------------------------------------------

export const orderCopy = {
  title: "주문 처리 단계",
  description: "다음 단계는 서버가 확정한 뒤에만 완료로 바뀌어요.",
  // 커서는 "서버 확정을 기다리는 단계"다. 그래야 실패 표시가 거절된 단계에 붙는다.
  // 마지막 단계까지 확정되면 Steps의 currentStepStatus "complete"(2026-10-02 추가)로 전체 완료를 표시한다.
  steps: [
    { id: "received", label: "접수" },
    { id: "paid", label: "결제 확인" },
    { id: "packed", label: "상품 준비" },
    { id: "shipped", label: "발송" },
    { id: "arrived", label: "도착" },
  ],
  statusLabels: { pending: "대기", current: "진행 중", complete: "완료", error: "확인 필요" } satisfies StepsStatusLabels,
  request: "다음 단계 요청",
  retry: "다시 요청",
  restart: "처음부터 다시",
  failNext: "다음 요청을 실패로 응답",
  requesting: "서버 확인을 기다리는 중이에요.",
  failed: "서버가 이 단계를 확정하지 못했어요. 상태는 그대로이니 다시 요청해 주세요.",
  done: "모든 단계가 확정됐어요.",
  logLabel: "처리 기록",
} as const;

export type OrderStepId = (typeof orderCopy.steps)[number]["id"];
export type OrderPhase = "idle" | "requesting" | "failed";
export type OrderState = Readonly<{
  cursor: number;
  done: boolean;
  phase: OrderPhase;
  failNext: boolean;
  log: readonly TimelineItemDescriptor[];
  sequence: number;
}>;
export type OrderAction =
  | { type: "request" }
  | { type: "respond" }
  | { type: "toggleFailNext" }
  | { type: "restart" };

export const initialOrderState: OrderState = {
  cursor: 1,
  done: false,
  phase: "idle",
  failNext: false,
  log: [{ id: "log-0", label: "접수", description: "주문을 받았어요.", tone: "success" }],
  sequence: 1,
};

export const isOrderDone = (state: OrderState) => state.done;

export function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case "request":
      // 응답을 기다리는 중의 중복 요청은 무시한다. 버튼 loading만으로는 키보드 반복 입력을 막지 못한다.
      if (state.phase === "requesting" || isOrderDone(state)) return state;
      return { ...state, phase: "requesting" };
    case "respond": {
      if (state.phase !== "requesting") return state;
      const target = orderCopy.steps[state.cursor]!;
      const id = `log-${state.sequence}`;
      if (state.failNext) {
        return {
          ...state,
          phase: "failed",
          failNext: false,
          sequence: state.sequence + 1,
          log: [...state.log, { id, label: `${target.label} 실패`, description: "단계는 바뀌지 않았어요.", tone: "attention" }],
        };
      }
      return {
        ...state,
        cursor: Math.min(state.cursor + 1, orderCopy.steps.length - 1),
        done: state.cursor === orderCopy.steps.length - 1,
        phase: "idle",
        sequence: state.sequence + 1,
        log: [...state.log, { id, label: target.label, description: "서버가 확정했어요.", tone: "success" }],
      };
    }
    case "toggleFailNext":
      return { ...state, failNext: !state.failNext };
    case "restart":
      return initialOrderState;
  }
}

export const orderStepsDescriptor = (state: OrderState) => ({
  steps: orderCopy.steps,
  currentStepId: orderCopy.steps[state.cursor]!.id,
  // 실패는 커서를 옮기지 않고 거절된 단계에 오류 표시만 한다. 완료 표시를 먼저 그리면
  // 서버가 거절한 단계를 사용자가 끝난 것으로 오해한다.
  currentStepStatus: state.done ? ("complete" as const) : state.phase === "failed" ? ("error" as const) : ("current" as const),
});

// --- 인증번호 확인과 다시 입력 -------------------------------------------------

export const otpCopy = {
  title: "인증번호 확인",
  description: "문자로 받은 6자리 숫자를 입력해 주세요.",
  field: "인증번호",
  hint: "예제의 올바른 번호는 246810이에요.",
  submit: "확인",
  resend: "인증번호 다시 받기",
  resendWait: (seconds: number) => `${seconds}초 후 다시 받을 수 있어요`,
  resent: "새 인증번호를 보냈어요. 이전 번호는 더 이상 쓸 수 없어요.",
  wrong: (left: number) => `인증번호가 맞지 않아요. ${left}번 더 시도할 수 있어요.`,
  locked: "시도 횟수를 모두 썼어요. 인증번호를 다시 받아 주세요.",
  successTitle: "인증을 마쳤어요",
  successBody: "서버가 번호를 확인한 뒤에만 이 화면으로 바뀌어요.",
  again: "다른 번호로 다시 해 보기",
} as const;

export const otpLength = 6;
export const otpExpectedCode = "246810";
export const otpMaxAttempts = 3;
/** 실서비스는 보통 30~60초다. 예제는 검토 시간을 줄이려고 짧게 둔다. */
export const otpResendCooldownSeconds = 10;

export type OtpPhase = "editing" | "verifying" | "failed" | "locked" | "verified";
export type OtpState = Readonly<{
  value: string;
  phase: OtpPhase;
  attemptsLeft: number;
  resendIn: number;
  resent: boolean;
}>;
export type OtpAction =
  | { type: "change"; value: string }
  | { type: "submit" }
  | { type: "respond" }
  | { type: "tick" }
  | { type: "resend" }
  | { type: "reset" };

export const initialOtpState: OtpState = {
  value: "",
  phase: "editing",
  attemptsLeft: otpMaxAttempts,
  resendIn: otpResendCooldownSeconds,
  resent: false,
};

export const canSubmitOtp = (state: OtpState) =>
  state.value.length === otpLength && (state.phase === "editing" || state.phase === "failed");

export function otpReducer(state: OtpState, action: OtpAction): OtpState {
  switch (action.type) {
    case "change":
      // 확인 중·잠김·완료 상태에서는 값이 바뀌지 않는다. 응답과 다른 번호가 화면에 남는 것을 막는다.
      if (state.phase === "verifying" || state.phase === "locked" || state.phase === "verified") return state;
      // 실패 뒤 고치기 시작하면 오류를 내린다. 슬롯 위치는 그대로라 입력 중 화면이 흔들리지 않는다.
      return { ...state, value: action.value, phase: "editing" };
    case "submit":
      return canSubmitOtp(state) ? { ...state, phase: "verifying" } : state;
    case "respond": {
      if (state.phase !== "verifying") return state;
      if (state.value === otpExpectedCode) return { ...state, phase: "verified" };
      const attemptsLeft = state.attemptsLeft - 1;
      return { ...state, attemptsLeft, phase: attemptsLeft === 0 ? "locked" : "failed" };
    }
    case "tick":
      return state.resendIn > 0 ? { ...state, resendIn: state.resendIn - 1 } : state;
    case "resend":
      if (state.resendIn > 0 || state.phase === "verifying" || state.phase === "verified") return state;
      return { ...initialOtpState, resent: true };
    case "reset":
      return initialOtpState;
  }
}

export function otpErrorMessage(state: OtpState): string | undefined {
  if (state.phase === "failed") return otpCopy.wrong(state.attemptsLeft);
  if (state.phase === "locked") return otpCopy.locked;
  return undefined;
}

// --- 날짜 선택과 예정 목록 -----------------------------------------------------

export const scheduleCopy = {
  title: "이번 주 일정",
  description: "날짜를 고르면 같은 카드 안에서 일정이 바뀌어요.",
  dayLabel: "날짜 선택",
  listLabel: (day: string) => `${day} 일정`,
  empty: "이 날은 예정된 일정이 없어요.",
  emptyHint: "다른 날짜를 골라 보세요.",
} as const;

export type ScheduleDay = Readonly<{ value: string; label: string; long: string }>;
export type ScheduleItem = Readonly<{ id: string; day: string; time: string; title: string; place: string }>;

export const scheduleDays: readonly ScheduleDay[] = [
  { value: "2026-10-05", label: "월 5", long: "10월 5일 월요일" },
  { value: "2026-10-06", label: "화 6", long: "10월 6일 화요일" },
  { value: "2026-10-07", label: "수 7", long: "10월 7일 수요일" },
  { value: "2026-10-08", label: "목 8", long: "10월 8일 목요일" },
  { value: "2026-10-09", label: "금 9", long: "10월 9일 금요일" },
];

export const scheduleItems: readonly ScheduleItem[] = [
  { id: "m1", day: "2026-10-05", time: "오전 10:00", title: "주간 계획 맞추기", place: "회의실 A" },
  { id: "m2", day: "2026-10-05", time: "오후 3:30", title: "디자인 검토", place: "화상 회의" },
  { id: "m3", day: "2026-10-07", time: "오전 11:00", title: "고객 인터뷰", place: "성수 카페" },
  { id: "m4", day: "2026-10-08", time: "오후 2:00", title: "출시 점검", place: "회의실 B" },
  { id: "m5", day: "2026-10-08", time: "오후 5:00", title: "한 주 돌아보기", place: "화상 회의" },
];

export const scheduleForDay = (day: string) => scheduleItems.filter(item => item.day === day);
export const scheduleDayLabel = (day: string) => scheduleDays.find(entry => entry.value === day)?.long ?? day;

// --- 수치와 이전 대비 변화 -----------------------------------------------------

export const statCopy = {
  title: "판매 요약",
  description: "올라간 숫자가 늘 좋은 것은 아니에요. 방향과 의미를 따로 표시해요.",
  periodLabel: "비교 기간",
  // 기간을 바꾸면 목표도 같은 기간으로 읽혀야 한다. 고정 "월 목표"는 주간 비교와 섞였다(2026-10-02 화면 확인).
  goalLabel: (period: "week" | "month") => (period === "week" ? "이번 주 목표 달성률" : "이번 달 목표 달성률"),
} as const;

export type StatPeriod = "week" | "month";
export const statPeriods: readonly Readonly<{ value: StatPeriod; label: string }>[] = [
  { value: "week", label: "지난주와 비교" },
  { value: "month", label: "지난달과 비교" },
];

// 원본 Sales Stat Card는 색 하나로 증감을 전했다. HJM Statistic은 trend.label을 필수로 받아
// 색이 없어도 비교 기준과 방향을 읽을 수 있다. 반품처럼 증가가 나쁜 지표는 tone으로 구분한다.
export const statsByPeriod: Readonly<Record<StatPeriod, Readonly<{ items: readonly StatisticDescriptor[]; goal: number }>>> = {
  week: {
    goal: 76,
    items: [
      { id: "revenue", label: "매출", value: "3,950,000", suffix: "원", trend: { direction: "up", tone: "success", label: "지난주보다 20% 늘었어요" } },
      { id: "orders", label: "주문", value: "128", suffix: "건", trend: { direction: "flat", tone: "neutral", label: "지난주와 같아요" } },
      { id: "returns", label: "반품", value: "9", suffix: "건", trend: { direction: "up", tone: "danger", label: "지난주보다 3건 늘었어요" } },
    ],
  },
  month: {
    goal: 41,
    items: [
      { id: "revenue", label: "매출", value: "15,200,000", suffix: "원", trend: { direction: "down", tone: "warning", label: "지난달보다 8% 줄었어요" } },
      { id: "orders", label: "주문", value: "512", suffix: "건", trend: { direction: "up", tone: "success", label: "지난달보다 34건 늘었어요" } },
      { id: "returns", label: "반품", value: "21", suffix: "건", trend: { direction: "down", tone: "success", label: "지난달보다 6건 줄었어요" } },
    ],
  },
};
