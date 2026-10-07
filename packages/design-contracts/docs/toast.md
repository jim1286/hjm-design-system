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
- action이 있는 Toast는 기본 persistent입니다. 제품이 명시한 `durationMs`도 3000ms보다
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

`timeout | action | close-action | escape | swipe | programmatic | queue-overflow | interrupted`
reason 중 하나만 최종 `onDismiss`로 전달됩니다. visible Toast는 exit 완료 시 callback을
정산하고 queued overflow와 provider teardown은 visual exit 없이 즉시 정산합니다. 중복 action,
close, exit complete와 두 번째 provider dispose는 아무 상태도 바꾸지 않습니다.

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

## 프로필 행간 소비 — 미게시

2026-10-07 소비 감사에서 Web 제목/설명의 1.35/1.45 고정 행간이 `typography.body.lineHeight`를
우회하는 것을 확인했다. 두 slot은 기존 body 역할이므로 선택된 프로필의 `--hjm-type-body-line-height`를
기존 Provider/portal 토큰 경로로 읽는다. 프로필 없는 Provider와 독립 사용은 기존 1.35/1.45를 유지한다.
일괄 기본 행간 변경은 기존 알림 레이아웃까지 바꾸므로 채택하지 않았다. Native 본문 행간은 이미 body
토큰을 소비하며, 이번 Native 변경은 action 라벨의 ui 서체 역할만 명시한다. 알림 문구·큐·시간·닫기·
행동·초점 계약은 바꾸지 않는다.
