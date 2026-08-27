# UploadItem contract

**문제.** 사용자가 고른 파일 하나가 지금 어디쯤 있는지 보여준다 — 대기 중인지,
전송 중이며 얼마나 갔는지, 끝났는지, 실패해서 무엇을 할 수 있는지. 어떤 파일을
고를지는 [[file-picker]]의 몫이고, 업로드 요청·재시도 로직·서버 응답은 제품의
몫이다. UploadItem은 그 상태를 화면에 어떻게 표현할지만 소유한다. antd `Upload`는
[[file-picker]]와 이 컴포넌트로 decompose된다(`src/component-references.ts`).

**일반화한 계약.**

- 상태는 `pending | uploading | success | error` 네 값의 discriminated union이다.
  `progress`(0..1 또는 불확정이면 `null`)는 `uploading`에만 있고, `message`는
  `error`에만 있다 — 타입이 허용하지 않으니 "success인데 progress가 있다" 같은
  조합이 애초에 만들어지지 않는다.
- 취소/재시도 가능 여부를 별도 boolean으로 저장하지 않는다.
  `getUploadItemAvailableAction(state)`가 `status`에서 매번 다시 계산해
  `uploading`일 때만 `"cancel"`, `error`일 때만 `"retry"`를 돌려준다. 저장된 값이
  상태와 따로 놀 수 있는 여지 자체를 없앤다 — `SheetOpenState`가 controlled/
  uncontrolled 축을 섞지 않는 것, `LoadMoreState`가 `complete`에 `requestKey`를
  아예 두지 않는 것과 같은 이유다.
- `resolveUploadItemAnnouncement`가 `{ label, description }`을 돌려준다. `label`은
  파일명으로 상태와 무관하게 고정하고([[statistic]]이 label/value/hint/trend를
  독립된 접근성 이름으로 유지하는 것과 같은 원칙), `description`이 상태 문장을
  맡는다 — 진행률 채움 막대 색만으로 상태를 말하지 않는다.
- `progress`가 색으로만 말해지지 않도록 항상 낭독 가능한 문장을 만든다.
  우선순위는 제품이 준 `progressLabel` → (숫자 진행률이면) 반올림 퍼센트 →
  `labels.uploading` 정적 문구다. 퍼센트 자동 계산은 이 모듈에서 유일하게
  "제품이 포맷한 문자열을 받는다"는 [[statistic]] 원칙과 다르게 판단한 자리다 —
  Statistic의 값은 통화·단위처럼 로케일에 따라 표기가 갈리지만, `Math.round(x*100)
  + "%"`는 로케일 중립적인 숫자와 기호뿐이라 Slider의 raw-value fallback과 같은
  근거로 예외를 둔다. 그래도 제품이 `progressLabel`을 주면 항상 그것을 우선한다.
- `validateUploadItemList`가 한 목록 안에서 stable id 중복을 거부한다 —
  [[statistic]]의 `validateStatisticGroup`과 같은 이유로, 목록 재조정 시 행이
  잘못된 항목과 뒤바뀌는 사고를 막는다.
- 진행 표시는 이미 beta인 `progressRecipe`(`component-recipes.ts`)를 그대로
  재사용한다 — `uploadItemRecipe.progress`는 새 막대를 만들지 않고
  `progressRecipe.defaults.size`/`.tone`을 그대로 참조한다. 실패 상태의 막대
  색만 `progressRecipe.tones.danger`로 바꾼다.
- 넣지 않은 것: 자동 업로드 시작, 이미지 미리보기 썸네일, 순서 재배치(drag
  reorder), 여러 파일의 배치 재시도 정책. 이 모듈은 한 파일 한 행의 표현만
  안다 — 목록 레이아웃과 배치 동작은 제품이 [[file-picker]]의 선택 결과 위에
  조합한다.

**HJM 기본값.** 행 높이는 `layout.rowHeight.twoLine`(파일명 + 상태/진행 두 줄
정보 밀도)이고, 취소/재시도 target은 `control.minTouchTarget`(44) 이상을
유지한다. 상태별 강조 색은 `pending=content.secondary`,
`uploading=content.brand`, `success=feedback.success.foreground`,
`error=content.danger`이며, 어떤 상태도 색만으로 구분되지 않고 `statusText`
슬롯의 문장이 항상 함께 있다.

**플랫폼 번역.**

- Web: 행을 `role="group"`으로 묶고 진행 막대는 `role="progressbar"`, 취소/재시도는
  `role="button"`이다. 진행률 변경은 진행 중인 값이 잦게 바뀌므로 매 tick을
  발표하지 않고(LoadMore의 loading status와 같은 절제) 상태 전이(시작/완료/실패)
  시점에만 announce한다 — tick마다 알리는 정책은 이 계약에 넣지 않는다.
- Native: `accessibilityState.busy`가 `uploading`에 대응하고, `cancel`/`retry`
  action이 각각 uploading/error에서만 노출된다. `NativeAccessibilityState`
  enum에는 error/success 전용 상태가 없어 `busy` 하나로만 표현하고, 나머지
  구분은 `statusText`의 문장이 맡는다.
- `stateAxes.content`는 공통 축 `idle | loading | loadingMore | empty | error |
  complete` 중 `idle`(pending), `loading`(uploading), `complete`(success),
  `error`만 쓴다. `loadingMore`와 `empty`는 목록 페이지네이션 개념이라 한 파일의
  상태에는 적용되지 않는다.

**검증 화면.** first-party Web·Native renderer와 cancel/retry 상태 테스트는 연결되어
surface는 `beta`다. 실제 전송 lifecycle을 쓰는 제품 vertical slice는 아직 없으므로
`stable` 승격 gate는 닫혀 있다.
