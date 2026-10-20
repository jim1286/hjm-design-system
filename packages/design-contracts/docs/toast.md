# Toast contract

Native의 선택형 `liquid` presentation은 같은 descriptor/store를 사용합니다.
[사용 및 호환성](../../react-native/docs/liquid-toast.md),
[설계·검증 경계](../../../docs/plans/liquid-toast.md)를 따릅니다.
Web 또는 adapter 없는 Native는 같은 알림을 standard surface로 표시합니다.
`presentation`·`occlusion`은 renderer가 소유하는 독립 pause reason입니다.

Toast는 사용자가 응답해야만 진행되는 modal UI가 아니라, 무시해도 안전한 짧은 알림입니다.
필수 선택·삭제 확인·시간 안에 응답해야 하는 작업은 `AlertDialog`를 사용합니다.

HJM은 Radix Primitives에서 provider/viewport anatomy, visible timer pause, focus·Escape·swipe
수명주기를 참고하고 React Aria/Spectrum에서 bounded queue, stable id close handle과 actionable persistent 기본값을 참고했습니다. 외부 component나 prop 이름은 공개하지
않고 다음 세 계층으로 번역했습니다.

```text
ToastDescriptor  제품이 만든 현지화 copy·stable id·action
      ↓
ToastSession     queued → visible → closing → closed 순수 상태
      ↓
ToastStore       bounded FIFO·dedupe update·visible slot·provider teardown
```

## Descriptor

```ts
const result = store.publish({
  id: "profile-save",
  title: "저장했어요",
  description: "프로필 변경 사항을 반영했습니다.",
  tone: "success",
  priority: "normal",
  closeLabel: "알림 닫기",
});
```

- `id`는 제품이 소유하는 trim된 stable string입니다. 같은 id를 다시 publish하면 기본적으로
  기존 위치를 유지한 채 copy·tone·action을 갱신합니다.
- `description`과 icon-only close의 현지화된 `closeLabel`은 필수입니다.
- `tone`은 시각 의미이고 `priority`는 announcement 순서입니다. 위험 색이라고 자동으로
  높은 priority가 되지 않습니다.
- 기본 announcement는 `title. description`이며 화면 copy보다 추가 문맥이 필요할 때만
  `announcement`를 제공합니다.
- action은 무시해도 안전해야 합니다. label 자체로 동작이 명확하지 않으면
  `accessibilityLabel`에 완전한 이름을 제공합니다.
- 기본 알림과 리퀴드 알림은 모두 표시 후 3초에 자동 닫힘을 시작합니다. 리퀴드는 진입 연출 동안 타이머를 멈춥니다.
  2026-10-02 사용자 요청으로 기존 5초 기본값·최솟값을 3초로 변경했습니다.
- action 또는 press가 있는 Toast는 기본 persistent입니다. 제품이 명시한 `durationMs`도 3000ms보다
  짧아질 수 없으며, `null`은 명시적 persistent입니다.

`publish` 결과에는 stable id와 `visible | queued` 위치가 포함됩니다. 호출자는 반환된 함수
대신 `store.close(id)`를 사용해 더 이상 유효하지 않은 알림을 programmatic reason으로 닫습니다.

## Queue와 update

HJM의 “조용한 화면 위에 중요한 순간만 선명하게” 원칙에 따라 기본 store는 visible 1개와
pending 20개로 제한됩니다. visible slot은 exit가 완료될 때까지
유지하며, 비워진 slot에는 pending의 첫 항목을 FIFO로 올립니다. pending capacity가 가득 차면
기본 `discard-oldest`가 가장 오래 기다린 항목을 `queue-overflow`로 정산하고 최신 정보를
받습니다. 감사·거래처럼 오래된 알림 보존이 필요하면 renderer가 `discard-newest`를 선택합니다.

stable id 중복 정책은 다음 두 축을 분리합니다.

- `duplicatePolicy: update | ignore`: 같은 id의 내용을 갱신할지 무시할지
- `timerUpdatePolicy: preserve | restart`: 이미 visible인 수명을 유지할지 새로 시작할지

기본 `update + preserve`는 진행 상태를 같은 자리에서 바꾸되 반복 publish로 알림이 화면에
무한히 남지 않게 합니다. queued 항목은 아직 시간이 흐르지 않았으므로 update 후에도 전체
duration을 갖습니다. `closing` id는 exit가 끝날 때까지 새 publish를 무시해 한 visual instance와
두 lifecycle이 겹치지 않게 합니다.

## 순수 timer와 pause

코어에는 `setTimeout`, `Date`, DOM, React 또는 React Native dependency가 없습니다. renderer가
자기 monotonic clock으로 `advanceTime(elapsedMs)`를 호출합니다.

```text
queued(waiting, 3000) ─ show ─→ visible(running, 3000)
                                  ├─ pointer/focus/window/gesture → paused
                                  └─ elapsed=3000 → closing(timeout)
                                                        └─ exit complete → closed
```

- pending queue에서 기다린 시간은 duration에 포함하지 않습니다.
- pointer hover, keyboard focus, 앱/window 비활성화, swipe gesture pause reason은 Set으로
  누적합니다. 모든 reason이 resume된 뒤에만 timer가 다시 흐릅니다.
- `pauseAll("window")` 상태에서 새 항목이 visible로 승격돼도 paused 상태를 상속합니다.
- renderer는 Reduce Motion으로 exit를 즉시 처리해도 반드시 `completeExit(id)`를 한 번 호출합니다.

## exact-once와 dismiss reason

`invokeAction`은 한 revision에서 한 번만 callback을 실행합니다. 기본 action은 Toast를
`action` reason으로 닫으며, `dismissOnAction: false`면 알림은 남지만 같은 action은 다시
실행되지 않습니다. stable id update는 새 revision이므로 새 action을 한 번 실행할 수 있습니다.

`timeout | action | press | close-action | escape | swipe | programmatic | queue-overflow | interrupted`
reason 중 하나만 최종 `onDismiss`로 전달됩니다. visible Toast는 exit 완료 시 callback을
정산하고 queued overflow와 provider teardown은 visual exit 없이 즉시 정산합니다. 중복 action,
close, exit complete와 두 번째 provider dispose는 아무 상태도 바꾸지 않습니다.

## 카드 전체 활성화 — 2026-10-13 (미게시)

댓글·답장 알림에서 카드 본문을 눌러 관련 화면으로 이동하도록 `press`를 추가했다.
기존 `action`은 보이는 실행 버튼, `press`는 카드의 본문·미디어·여백을 누르는 동작이다.
별도 알림 컴포넌트를 만들지 않고 동일 Toast descriptor/session/store에 연결한다.

```ts
store.publish({
  id: "reply:42",
  title: t("reply.receivedTitle"),
  description: t("reply.receivedBody"),
  closeLabel: t("common.closeNotification"),
  press: { accessibilityLabel: t("reply.open"), onPress: openReply },
});
```

참조 분석: MIT [expo-dynamic-notifications `use-dismiss-gesture.ts` @ 5de059a](https://github.com/rit3zh/expo-dynamic-notifications/blob/5de059a5cbefbe28c14efbe785166665a7c70bc5/src/hooks/use-dismiss-gesture.ts)는
`Gesture.Exclusive(pan, tap)`으로 입력을 나누고 성공한 탭에서 콜백 후 dismiss를 예약한다.
HJM은 그 동작 순서를 독립 구현한다. Native 표준/리퀴드와 Web이 같은 순수 session을 사용하며,
이미 존재하는 큐·타이머를 교체하거나 optional gesture 의존성을 표준 Toast에 추가하지 않는다.

- `press.accessibilityLabel`과 `press.onPress`는 필수. 라우팅과 문구는 제품 소유다.
- 카드·실행·닫기는 형제 조작이다. Web의 실제 button은 Tab·Enter·Space와 포커스 표시를 제공한다.
  Native는 독립 Pressable과 읽을 수 있는 이름/설명을 제공하고, 리퀴드의 상위 swipe responder가 탭을 취소한다.
- `invokePress`는 visible revision당 한 번 실행하고 콜백 뒤 `press` 사유로 닫는다.
  action/press의 재진입과 이미 닫히는 카드의 입력은 무시한다. 콜백이 같은 id를 새 revision으로 갱신하면
  새 내용을 닫지 않으며, provider가 제거되면 기존 `interrupted` 정산을 보존한다.
- 동기 콜백이 throw해도 닫힘을 시작하고 오류를 호출자에게 전달한다. 비동기 라우팅/요청 완료는 기다리지 않는다.
- press가 있으면 기본 persistent, 명시적 duration은 기존 3초 하한을 적용한다. press가 없으면 기존 동작 그대로다.
- 검증 파일: `test/toast-press.test.ts`(contracts), `packages/react/test/toast-press.browser.test.tsx`,
  `packages/react-native/test/toast-press.test.tsx`, `packages/react-native/test/toast-liquid.test.tsx`.
  Native host 테스트는 실제 기기 hit-test·스크린리더 검증이나 소비 앱 적용 증거가 아니다.

검증: 계약 41개, Web Chromium 11개, Native host 20개의 관련 테스트 통과.
세 패키지와 두 Showcase 타입 검사, 세 패키지 빌드 및 Web light/dark 기본 글자 화면을 확인했다.
전체 회귀·실기기·npm 게시·소비 앱 적용은 미실행. `usage:sync`는 기존 다른 작업의
`components/carousel.md`·`components/chat-message.md` 절 형식 2건으로 실패했으며 해당 변경은 보존했다.
공개 API 이름 대응표는 변경 없이 검사 통과했다.

## Renderer acceptance

### Compact Web layout — 2026-09-15

BurnTok `apps/web/src/app/globals.css:301` records a product workaround for a
close-only second row. The first-party browser regression reproduced it at
320, 390, and 480px: the old fixed subtraction in `flex-basis` did not account
for the actual control and gap layout. The Web renderer now gives icon, copy,
and close explicit columns and places an optional action below the copy.
This keeps a 44px close target and allows long text to wrap without a guessed
remaining width. Native layout and the shared Toast lifecycle are unchanged.
The same card grid applies on desktop: ToastProvider caps cards at 420px,
so a window-width breakpoint left doubled text and action labels compressed
even in a wide window. A 1280px window/420px card regression covers that case.

Proof: `packages/react/test/toast-layout.browser.test.tsx`; review fixture:
Storybook `패턴/토스트 배치`. The fixture covers long Korean/English copy,
doubled text, dark theme and RTL. Automated browser checks are separate from
real assistive-technology and consumer-release evidence; Toast remains beta.

### Visual refresh — 2026-09-30 (1.10.0)

BurnTok 사용자 피드백("알림 ui 구려")을 실제 화면으로 확인했더니 세 가지가 원인이었습니다. neutral
Toast의 `●` 글리프가 뜻 없는 회색 점으로 보였고, 글자 글리프(`i`·`!`)는 폰트 metric에 따라 오타처럼
보였고, action이 밑줄 없는 텍스트라 컨트롤로 읽히지 않았습니다. 1.10.0은 다음으로 바꿉니다.

- tone은 32-unit 원형 tinted badge 안의 stroke SVG 아이콘이 전달합니다(neutral = 종). 2px 가장자리
  띠(`toneMark`)는 badge와 역할이 겹쳐 너비 0으로 은퇴했습니다 — slot은 가산 계약을 위해 남깁니다.

### 띠 계약 — 2026-10-18 (1.32.0)

Toast에는 가장자리 상태색 띠가 **없습니다**. tone은 badge(또는 제품 `media`)와 문구가 전달하며, 띠를 켜거나 끄는
옵션을 두지 않습니다. 번뚝이 1.10.0 이후에도 띠를 숨기려고 Web `.hjm-toast__tone-mark`를 `display: none`으로 덮고
Native 토스트 영역의 `statusAccents`·`danger`를 바탕색으로 바꿔 두었는데, 덮을 띠가 없었고 Native 덮어쓰기는 tone
아이콘 색 입력만 지웠습니다. 원인은 은퇴한 slot이 Web DOM에 늘 숨겨진 빈 요소로, Native에 도달하지 않는 분기로 남아
"띠가 있다"고 읽힌 것입니다. 1.32.0은 두 renderer에서 그 요소·분기를 지우고, `toastRecipe.toneMark`(너비 0)는 게시된
recipe 모양 호환을 위해서만 `@deprecated`로 남깁니다(다음 major에서 제거). 띠를 다시 그리려면 badge와의 역할 중복을 새로
검토하는 별도 계약 변경이 필요합니다.
- action은 끝 정렬 tinted pill(`action.background` = `surface.brand`, 44-unit target)입니다. 라벨과
  fill 대비 4.5:1을 contract test가 지킵니다.
- 카드 radius md → lg, description은 secondary 색으로 제목과 위계를 나눕니다. 테두리는
  `border.strong`을 유지합니다 — subtle hairline은 3:1 경계 대비(WCAG 1.4.11) test를 통과하지 못했습니다.
- 여러 줄·큰 글자에서도 badge는 제목 옆 위쪽에 붙고, 한국어는 `word-break: keep-all`로 단어 중간에서
  끊지 않습니다(Web).

Review fixture: Storybook `패턴/토스트 배치` → `Tone gallery`(light/dark).

Web renderer:

- viewport를 문서 root 근처에 하나만 두고 recipe placement와 logical start/end를 사용합니다.
- 기본은 화면 아래 중앙 `bottom`이며, 위 중앙 알림 배너는 `top`을 사용합니다. 모서리 배치는
  `top-start | top-end | bottom-start | bottom-end`처럼 logical 방향으로만 지정합니다.
- `normal`은 polite status, `high`는 assertive alert 의미로 번역하되 visible root와 announcer가
  같은 문장을 중복 발표하지 않게 합니다.
- `F8`은 현지화된 이름을 가진 viewport로 focus를 옮기며, 제품 도움말에서 이 hotkey를
  발견할 수 있게 합니다. 마지막 Toast가 닫히면 이전 focus를 복원합니다. focus가 Toast
  action/close에 들어오면 timer를 pause합니다.
- Escape는 현재 focus가 있는 Toast id만 닫습니다. 페이지의 다른 Toast를 함께 닫지 않습니다.
- hover, focus, document visibility, swipe 동안 대응 pause reason을 연결합니다.

Native renderer:

- safe-area inset을 recipe inset에 additive로 적용하고 visual root 전체를 하나의 접근성
  요소로 병합하지 않습니다. announcement node와 action/close를 각각 독립 접근성 노드로
  유지하고, 비상호작용 copy만 필요할 때 묶습니다.
- visible promotion 시 한 번만 announcement를 요청합니다. update announcement는 copy가
  실제로 바뀌었을 때만 요청해 screen reader queue를 범람시키지 않습니다.
- swipe capability가 없는 플랫폼에서는 gesture를 노출하지 않습니다.
- app background/foreground와 accessibility focus를 `window`/`focus` pause reason에 연결합니다.

두 renderer 모두 tone icon을 tinted badge(`toastRecipe.icon.badgeDiameter`, `tones.*.badge`) 안에
렌더링해 색 없이 neutral/info/success/warning/danger를 구분하고(1.10.0부터 `toneMark` 가장자리 띠는
너비 0으로 은퇴), action·close는 44-unit target과 visible focus를 유지합니다. 실제 제품 fixture에서는
normal/high announcement, keyboard/screen reader, 200% zoom, Reduce Motion, 앱 background 복귀,
overflow와 update를 검증합니다.

공식 참고:

- [Radix Toast](https://www.radix-ui.com/primitives/docs/components/toast)
- [React Spectrum Toast](https://react-spectrum.adobe.com/Toast)

## 패널 Toast — 미게시(1.17.2 이후)

2026-10-10 사용자 요청("칩이랑 패널 디자인시스템에 넣고 … 패널은 디자인 시스템에 있는 토스트를 대체하고 리퀴드
토스트의 토스트도 대체해 — 패널이 토스트가 되는거지")으로 BurnTok이 검수 상태용으로 만든 패널을 Toast 자체의
모양으로 삼습니다. 별도 `Panel` API를 만들지 않은 이유: 같은 id 갱신·지속·닫기·낭독·큐를 Toast store가 이미
소유하고, 두 번째 떠 있는 층을 만들면 큐와 낭독이 둘이 됩니다.

- 모양: 모든 Toast의 모서리는 `xl`(24)입니다. Native 리퀴드 카드도 같은 패널 열(미디어/배지 · 문구 · 닫기)을
  그리고, 프로필이 없을 때의 리퀴드 모서리도 12 → 24로 바뀝니다. 리퀴드의 투명 chrome·물방울 연출은 유지합니다.
- `media?: unknown`: 제품 마스코트·아바타 같은 장식 시각물입니다. core는 검사하지 않고 그대로 넘기며
  (`ResolvedToastDescriptor.media`, 없으면 `null`), renderer는 ReactNode로 그려 tone badge 자리(44, `toastRecipe.media.size`)를
  대신하고 보조기술에서 숨깁니다. tone은 `data-tone`과 문구가 계속 전달합니다. renderer 전용 prop을 버린 이유는
  store가 descriptor를 해석·보관하므로 그 밖의 값은 갱신 때 사라지기 때문입니다.
- `progress?: { steps: readonly string[]; current: number }`: 실행 중인 작업 단계입니다. 단계는 2~5개의 비어 있지 않은
  현지화 문자열이고(320 폭에서 한 줄 유지가 목표, 넘치면 줄바꿈) `current`는 0부터 시작하는 실행 단계 index입니다.
  앞 단계는 완료로 그립니다. 기본 announcement는 `title. description. <현재 단계>`입니다.
  점은 장식이고 단계 이름이 옆에 있어 색만으로 상태를 전달하지 않습니다(Web은 `ol`과 `aria-current="step"`).
- action은 둘째 줄 끝이 아니라 **문구 아래 시작 쪽**(`toastRecipe.action.align = "start"`)입니다. 눈이 이미 있는 자리에
  둔다는 BurnTok 패널 배치를 따랐습니다. pill 모양·44 target·대비는 1.10.0 그대로입니다.
- 작업 상태 패널은 `id` 고정 + `durationMs: null`로 열고, 단계·결과가 바뀔 때 같은 id로 다시 publish해 제자리에서
  갱신합니다. 여닫는 트리거는 [`ActivityChip`](activity-chip.md), 흐름은
  [백그라운드 작업 상태 구성](usage/compositions/activity-status.md)입니다.

## 프로필 행간 소비 — 미게시

2026-10-07 소비 감사에서 Web 제목/설명의 1.35/1.45 고정 행간이 `typography.body.lineHeight`를
우회하는 것을 확인했다. 두 slot은 기존 body 역할이므로 선택된 프로필의 `--hjm-type-body-line-height`를
기존 Provider/portal 토큰 경로로 읽는다. 프로필 없는 Provider와 독립 사용은 기존 1.35/1.45를 유지한다.
일괄 기본 행간 변경은 기존 알림 레이아웃까지 바꾸므로 채택하지 않았다. Native 본문 행간은 이미 body
토큰을 소비하며, 이번 Native 변경은 action 라벨의 ui 서체 역할만 명시한다. 알림 문구·큐·시간·닫기·
행동·초점 계약은 바꾸지 않는다.

## 2026-10-20 저장 알림 시안 반영 (개발 소스)

사용자가 카드형 저장 피드백(이전 3번)을 제거하고 한 줄·요약 토스트의 라이트·다크 시안을 선택했다.
일반 토스트의 최신 표면 정본은 `toastRecipe.material`이다. 이전 절의 tinted badge·강한 경계·프로필 모서리는 일반 표면의 현재 규격이 아니다.
배지 색 면을 없애고 요약형의 장식 아이콘은 생략한다. 한 줄 본문과 제목은 primary, 제목 아래 설명은 secondary다.
24 모서리·얇은 경계·floating 그림자를 공유하고, 내용 구성·타이머·큐·press/action/닫기 계약은 유지한다.
웹은 지원 환경에서 실제 backdrop blur, 투명도 감소에서는 불투명이다. Native 기본 renderer는 같은 색의 불투명 표면이다.
선택형 liquid 어댑터의 host·움직임 계약은 유지한다. 자세한 선택은 [저장 결과](usage/compositions/save-feedback.md)를 따른다.
