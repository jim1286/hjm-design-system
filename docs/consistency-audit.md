# 교차 중복 감사 (2026-08-19)

병렬 저작 다섯 팀이 만든 `src/*.ts`·`test/*.ts`·`docs/*.md` 전체를 대상으로, 이미
배선된 것까지 포함해 서로 겹치거나 어긋난 자리를 찾았다. **코드는 고치지 않았다** —
이 문서 하나만 새로 만들었다.

## 무엇을 어떻게 대조했는가

1. `git status --short`로 이번 배치의 변경/신규 파일 전체 목록을 뽑았다(`src/*.ts`
   30여 개, `docs/*.md` 30여 개).
2. **오버레이 dismiss 어휘 4벌**을 나란히 읽었다 — `src/sheet.ts`(원본, beta),
   `src/side-panel.ts`, `src/command-palette.ts`, `src/popover.ts`. 각각의
   `XxxDismissReason` union, `XxxOpenChangeDetails`, `XxxDismissPolicy`,
   `canDismissXxx` 시그니처를 필드 단위로 비교했다.
3. **숫자 범위 판정 3벌**을 대조했다 — `src/number-field.ts`(원본),
   `src/slider.ts`, `src/splitter.ts`가 실제로 같은 함수를 import해서 쓰는지,
   아니면 각자 다시 구현했는지 import 목록과 함수 본문을 직접 읽었다.
4. **tri-state 체크박스 집계**를 대조했다 — `src/data-table.ts`,
   `src/tree-select.ts`, `src/tree.ts`, 그리고 그 바탕이 되는
   `behaviors.ts`의 `CheckboxState`/`getCheckboxNextState`.
5. **`behaviorRegistry`에 실제로 배선된 값**(`src/behaviors.ts`)을 각 모듈
   자신의 타입과 대조해, 배선 과정에서 조용히 뜻이 바뀐 자리가 있는지 확인했다.
6. **"만들지 않는다" 판정 문서 7개**(`notification`·`dropdown`·`virtual-list`·
   `context-panel`·`rating`·`time-picker`·`layout-primitives`)를 다시 읽고, 각
   문서가 근거로 든 다른 컴포넌트의 상태(`status`, 존재 여부)가 지금도 사실인지
   `src/catalog.ts` 현재 값과 대조했다.

이 여섯 갈래 밖의 파일(예: Calendar/Carousel/Timeline/Steps/Description List 등)은
이번 감사에서 깊이 읽지 않았다 — 시간 안에 검증 가능한 근거를 남길 수 있는 범위로
좁혔다. 이 문서가 다루지 않은 조합은 "확인 안 함"이지 "문제 없음"이 아니다.

## 발견

### 1. [MEDIUM] Popover만 트리거-오픈 사유를 다른 이름으로 부른다

- 파일·심볼: `src/popover.ts:34` `PopoverOpenChangeReason = "trigger-activation" |
  PopoverDismissReason`
- 무엇이 어긋났나: 같은 개념("트리거 상호작용으로 열렸다")을 `src/sheet.ts:15`,
  `src/side-panel.ts:26`, `src/command-palette.ts:99`는 전부 리터럴 `"trigger"`로
  부른다. Popover만 `"trigger-activation"`이다. `docs/popover.md`도 "Sheet가
  dismiss reason을 추측하지 않고 값으로 보고하는 것과 같은 이유"라고만 적어
  **왜 이 스펠링이 다른지는 설명하지 않는다** — 다른 값들(예:
  `outside-pointer`/`outside-focus` 분리)은 전부 이유가 문서에 있는데 이것만 없다.
- 왜 문제인가: 네 오버레이의 `onOpenChange`를 한 renderer 유틸로 묶어 "reason이
  `"trigger"`면 열림 로그를 남긴다" 같은 공통 처리를 짜면 Popover에서만 조용히
  안 걸린다 — 컴파일 에러 없이 값 비교가 실패하는 조용한 드리프트다(카테고리 2,
  "같은 이름이 다른 뜻"의 변형인 "같은 뜻이 다른 이름").
- 권고: **이름 변경.** `PopoverOpenChangeReason`을 `"trigger" | PopoverDismissReason`으로
  맞춘다. Popover만 다르게 부를 근거(hover-trigger 구분 등)가 있다면 `docs/popover.md`에
  그 이유를 추가하고 남긴다 — 지금 코드에도 문서에도 근거가 없으므로 이름 변경 쪽을
  권한다.
- 적용 시 건드릴 파일: `src/popover.ts`(`PopoverOpenChangeReason` 정의와
  `commandPaletteBehaviorScenarios`처럼 문자열을 참조하는 곳 — 현재 `"trigger-activation"`을
  직접 참조하는 곳은 타입 정의와 scenario 이름 문자열
  `"trigger-activation-while-open-does-not-reopen"` 뿐이라 범위가 좁다),
  `docs/popover.md`(48번째 줄 설명), `test/popover.test.ts`(이 리터럴을 직접
  assert하는 테스트가 있으면 함께).

### 2. [LOW] Slider가 NumberField의 스텝 공식을 다시 짰다(page/first/last를 빼면 결과는 같다)

- 파일·심볼: `src/slider.ts:85-98` `getSliderStepTarget`
- 무엇이 어긋났나: `src/number-field.ts`의 `stepNumericValue(value, config,
  direction)`는 정확히 `snapToStep(value ± step, config)`를 계산한다. Slider의
  `getSliderStepTarget`은 `"increment"`/`"decrement"`(페이지 아닌 단일 스텝) 경우에
  **같은 공식을 다시 써서** `snapToStep(descriptor.value + direction * step, config)`를
  계산한다 — `stepNumericValue`를 호출하지 않는다. (`"increment-page"`/
  `"decrement-page"`/`"first"`/`"last"`는 `stepNumericValue`가애초에 표현할 수 없는
  경우라 다시 쓰는 것이 불가피하다 — 문제는 단일 스텝 두 경우뿐이다.)
- 왜 문제인가: 지금은 두 식이 수학적으로 동일해 렌더러가 틀리게 동작하지 않는다.
  하지만 `stepNumericValue`가 나중에(예: step precision 처리 방식) 바뀌면
  Slider의 사본은 자동으로 따라가지 않는다 — `docs/slider.md`가 이미
  "half-star를 위한 새 수학이 필요 없다"고 Rating 판정에서 근거로 든 바로 그
  재사용 사슬(NumberField → Slider → Rating 판정)의 중간 고리가 사실은 완전
  위임이 아니라 부분 재구현이라는 뜻이다.
- 권고: **통합.** `"increment"`/`"decrement"`일 때는
  `stepNumericValue(descriptor.value, config, intent)`를 직접 호출하고,
  `magnitude` 스케일링이 필요한 page 두 경우만 로컬 계산을 남긴다.
- 적용 시 건드릴 파일: `src/slider.ts`만(공개 함수 시그니처는 그대로, 내부 구현만
  변경 — `test/slider.test.ts`는 값이 같으므로 수정 불필요할 가능성이 높다).

### 3. [INFO] Popover의 `outside-pointer`/`outside-focus` 분리는 근거가 있다 — 다음 저작자를 위한 이정표만 필요

- 파일·심볼: `src/popover.ts:27-32` `PopoverDismissReason`
- 관찰: Sheet/SidePanel/CommandPalette는 전부 바깥 클릭을 `"outside"` 하나로
  부르는데 Popover만 `"outside-pointer"`/`"outside-focus"` 둘로 나눈다.
  `docs/popover.md`가 이유를 명시적으로 적어 뒀다 — Popover만 비모달이라 Tab이
  surface 밖으로 정당하게 나갈 수 있고, 그 키보드 이탈이 포인터 이탈과 다른
  입력 양식이라서다. **이건 어긋난 게 아니라 정당한 분화다.**
- 왜 그래도 기록하나: 다음에 비모달 오버레이(예: 향후 실제 `ContextPanel` 같은
  것)를 저작하는 사람이 이 분리를 보고 "Popover가 왜 유별난가"를 처음부터 다시
  묻지 않도록, 그리고 반대로 "Sheet의 `outside`가 표준이니 Popover를 거기 맞춰
  고쳐야 하나"라는 잘못된 통합 시도를 막기 위해서다.
- 권고: **그대로 둠.** `docs/architecture.md`의 공통 상태 축 표 근처(또는
  `behaviors.ts`의 `dismiss` 필드 주석)에 "모달 오버레이는 `outside` 하나,
  비모달은 `outside-pointer`/`outside-focus`로 분리한다"는 한 줄 규칙을
  추가하면 다음 판정이 더 빨라진다 — 지금 당장 필요한 코드 변경은 없다.
- 적용 시 건드릴 파일: (선택) `docs/architecture.md` 한 줄 추가뿐.

### 4. [INFO] CommandPalette의 `canDismiss` 시그니처가 `busy`를 받지 않는다 — 의도된 축소, 위험 낮음

- 파일·심볼: `src/command-palette.ts:133` `canDismissCommandPalette(reason, policy)`
  vs `src/sheet.ts` `canDismissSheet(reason, busy, policy)`,
  `src/side-panel.ts` `canDismissSidePanel(reason, busy, policy)`.
- 관찰: CommandPalette만 `busy` 인자가 없다. 모듈 자체 주석이 이유를 설명한다 —
  팔레트는 fire-and-forget이라 전역 busy 상태가 성립하지 않는다.
- 왜 심각하지 않은가: 세 함수를 인터페이스 하나로 묶어 다형적으로 호출하는
  코드는 지금 없고, 그런 코드를 짜도 TypeScript가 인자 개수 불일치를 **컴파일
  타임에** 잡는다 — "렌더러가 조용히 틀리는" 카테고리가 아니다.
- 권고: **그대로 둠.** 근거가 이미 모듈 주석에 있다.
- 적용 시 건드릴 파일: 없음.

### 5. [INFO/양호] 공유 `BehaviorContract.dismiss` enum은 일부러 더 거칠다 — 버그 아님

- 파일·심볼: `src/behaviors.ts:1197-1202`(`popover.web.dismiss: ["escape",
  "outside"]`), CommandPalette 배선(리드가 `"activation"`을 기존 `"action"`으로
  연결).
- 관찰: 각 모듈 자신의 `XxxDismissReason`은 세분화돼 있는데(`outside-pointer`/
  `outside-focus`, `activation`), `behaviorRegistry`에 실제로 꽂히는
  `web.dismiss`/`native.dismiss` 값은 더 거친 공용 enum(`escape|outside|
  selection|blur|timeout|action|close-action|swipe|programmatic`)으로
  수렴한다.
- 왜 기록하나: 처음 보면 "배선 과정에서 세부 정보가 유실됐다"는 버그처럼 보일 수
  있다. 그런데 이건 이미 **두 번 같은 방식으로 일어난 의도된 패턴**이다 — 공용
  registry 필드는 "이 컴포넌트가 대략 어떤 이벤트로 닫히는가"를 문서화하는
  요약이고, 정밀한 계약은 각 모듈 자신의 타입(`canDismissXxx`,
  `XxxDismissReason`)이 유일한 source of truth이기 때문이다. 다음 사람이 이걸
  버그로 착각해 세분화된 리터럴을 공용 enum에 억지로 추가하지 않도록 남긴다.
- 권고: **그대로 둠.** 다만 이 요약↔정밀 계약의 관계 자체가 `docs/architecture.md`
  어디에도 명문화돼 있지 않다 — 문서 한 줄이 있으면 다음 감사가 이 항목을 다시
  조사할 필요가 없어진다.
- 적용 시 건드릴 파일: (선택) `docs/architecture.md` 한 줄.

### 6. [확인함, 문제 없음] tri-state 체크박스 집계 — DataTable → TreeSelect 재사용 사슬

- 대상: `src/data-table.ts` `resolveDataTableSelectAllState`, `src/tree-select.ts`
  `coverageToState`/`resolveTreeSelectAncestorStates`류.
- 확인 내용: 둘 다 새 `"none"|"some"|"all"` enum을 만들지 않고 기존
  `CheckboxState`(`boolean | "mixed"`, `src/behaviors.ts`)를 그대로 반환한다.
  TreeSelect는 자기 주석에서 `resolveDataTableSelectAllState`를 명시적으로
  인용하며 "disabled 행 제외" 규칙을 조상 집계로 일반화한다고 밝힌다. 활성화
  방향(mixed→checked 기본값) 컨벤션도 기존 `getCheckboxNextState`를 그대로
  따른다고 주석에 남겨 뒀다.
- 결론: 어긋남 없음. 오히려 이 저장소가 원하는 재사용 방식의 모범 사례다.

### 7. [확인함, 문제 없음] Tree/DataTable의 선택 모델

- 대상: `src/tree.ts` `TreeSelectionModel<Id> = CollectionSelectionModel<Id>`,
  `src/data-table.ts` `DataTableSelection<Key> = CollectionSelectionModel<Key>`.
- 확인 내용: 둘 다 `behaviors.ts`의 `CollectionSelectionModel`을 별칭으로만
  다시 내보낼 뿐 새 선택 타입을 만들지 않는다.
- 결론: 어긋남 없음.

### 8. [확인함, 문제 없음] "만들지 않는다" 판정 7개의 전제 재검증

- 대상: `docs/notification.md`, `docs/dropdown.md`, `docs/virtual-list.md`,
  `docs/context-panel.md`, `docs/rating.md`, `docs/time-picker.md`,
  `docs/layout-primitives.md`.
- 확인 내용: 각 문서가 근거로 인용한 다른 컴포넌트의 상태(`Select`/`Menu`/
  `Statistic`/`Slider`는 beta, `SidePanel`/`Sheet`는 계약 완료, `Popover`는
  `planned`+recipe/behavior 배선됨)를 `src/catalog.ts` 현재 값과 대조했다. 전부
  일치한다 — 예를 들어 `context-panel.md`가 "방금 완성된 SidePanel"을 근거로
  드는데 SidePanel은 실제로 이번 배치에서 완성·배선됐고, `rating.md`가 인용하는
  Slider의 `validateNumericRangeConfig`/`snapToStep` 소수 step 지원도 실제
  `src/number-field.ts` 구현과 일치한다.
- 결론: 이번 감사 시점 기준으로 낡은 전제를 찾지 못했다. (리드가 언급한, 브리핑
  전제가 커밋 하나로 낡았던 사례는 이 일곱 문서 중에는 없었다 — 다른 곳에서
  일어난 것으로 보인다.)

## 감사하지 않은 것 (범위 고백)

- Calendar, Carousel, Timeline, Steps, DescriptionList, DatePicker, OtpField,
  PasswordField, Mentions, Image, DesignSystemProvider, Form, Watermark,
  QRCode, Anchor, Affix — 이번 감사에서 다른 모듈과의 필드 단위 대조를 하지
  않았다. 이름이 겹치는 자리(예: Calendar/DatePicker의 날짜 값 표현이 서로
  같은 문자열 포맷을 쓰는지)는 다음 감사 대상으로 남긴다.
- `catalog.ts`/`behaviors.ts`/`recipes.ts`/`index.ts`의 배선 자체가 각 모듈의
  타입과 100% 일치하는지는 typecheck가 이미 담보한다(현재 0 errors) — 이 문서는
  타입은 맞지만 **의미가 갈리는** 자리만 따로 찾은 것이다.

## 1차 게이트

코드를 고치지 않았으므로 `pnpm typecheck && pnpm test`는 감사 시작 전과 동일한
통과 상태(0 errors / 531 passed)다. 이 문서(`docs/consistency-audit.md`) 한 파일만
추가했다.

---

# 2차 감사 — 1차가 고백한 범위 (2026-08-19)

리드가 1차 MEDIUM(Popover `trigger-activation`)을 적용했고, 적용 과정에서 **1차보다
나쁜 사례**를 확인했다 — `src/tooltip.ts:10`의 `"trigger-activation"`은 **닫는**
사유(트리거를 다시 눌러 이미 열린 tooltip을 닫는다)인데 Popover는 **여는** 사유로
같은 문자열을 썼다. 1차가 오버레이 4벌(Sheet/SidePanel/CommandPalette/Popover)로
대조 범위를 좁혔던 탓에 Tooltip이 빠졌다. 이번엔 그 교훈을 반영해 **의심 문자열은
파일 몇 개가 아니라 `src/` 전체를 grep**했다.

## 방법 (1차와 달라진 점)

1. `git status --short`로 디스크를 다시 확인했다 — 1차 이후 `floating-action-button.ts`,
   `transfer-list.ts`, `tour.ts`가 새로 들어와 있었다(1차 시점엔 없었다).
2. `OpenState|DismissReason|OpenChangeDetail`를 **`src/*.ts` 전체**에서 grep해
   오버레이류 모듈을 다시 전수 조사했다 — 1차가 놓쳤던 `alert-dialog.ts`,
   `tooltip.ts`, `toast.ts`, `date-picker.ts`, `collection.ts`(Select 원본)까지
   포함해 총 11개 모듈의 "여는/닫는 사유" 어휘를 한 표로 모았다.
3. `"ltr"` 리터럴을 **`src/` 전체**에서 grep해 `docs/design-system-provider.md`가
   주장한 6곳(및 이번에 새로 생긴 파일들)과 대조했다.
4. `fontScale`/`textScale`을 전체 grep해 세 번째 갈래가 더 있는지 확인했다.
5. `Compose.*AccessibleName` 타입 선언을 전체 grep해 패턴이 실제로 같은 모양인지
   (info 객체 하나 → string) 시그니처까지 읽어서 확인했다.
6. `date-picker.ts`가 `calendar.ts`의 ISO 날짜 검증기를 실제로 import하는지
   import 목록을 직접 읽었다.
7. `transfer-list.ts`/`mentions.ts`의 실패했던 테스트를 다시 돌려 지금 상태를
   확인했다(감사 중 다른 저작자가 고쳐 지금은 전체 617건 통과).

## 발견

### 9. [해결 확인] Tooltip↔Popover의 `"trigger-activation"` 충돌은 리드의 수정으로 완전히 사라졌다

- 파일·심볼: `src/tooltip.ts:10` `TooltipOpenChangeReason`의 `"trigger-activation"`
  (트리거 재클릭으로 **닫힘**), 수정 전 `src/popover.ts`의 `"trigger-activation"`
  (트리거로 **열림**).
- 확인 내용: 리드가 1차 MEDIUM 권고대로 Popover를 `"trigger"`로 바꾼 뒤,
  `"trigger-activation"` 문자열을 쓰는 곳은 `src/tooltip.ts` **하나만** 남았다 —
  `grep -rn '"trigger-activation"' src/*.ts`로 재확인했다. 즉 1차가 "이름은 같은데
  뜻이 다른" 위험을 지적했고 실제로는 **그 위험이 이미 실현돼 있던 것**이었는데,
  권고한 수정이 부작용 없이 둘 다 해소했다.
- 남은 위험: 없음. Tooltip 자신의 `"trigger-activation"`(닫힘)은 이제 유일한
  용례이고, `docs/tooltip.md`가 이미 이 의미를 문서화하고 있다.
- 권고: 없음(참고용 기록).

### 10. [MEDIUM] Tour만 "트리거로 열렸다"는 사유가 없다 — 열림 사유 어휘의 마지막 예외

- 파일·심볼: `src/tour.ts:64-71` `TourCloseReason`/`TourOpenChangeDetail`.
- 무엇이 어긋났나: `src/` 전체에서 `OpenState`/`OpenChangeDetail`/`DismissReason`을
  선언한 모듈 11개 중, 열림 사유를 보고하는 7개(Sheet, SidePanel, CommandPalette,
  Popover — 수정 후, Select(`collection.ts`), DatePicker, AlertDialog) **전부**
  `"trigger"`를 갖는다. Tour만 `TourOpenChangeDetail = { reason: TourCloseReason }`이고
  `TourCloseReason = "skip"|"escape"|"complete"|"programmatic"|"interrupted"`에는
  "그냥 열렸다"에 해당하는 값이 없다. 타입 이름은 `OpenChangeDetail`(연다/닫는다
  전부를 가리키는 이름)인데 실제 값 목록은 `CloseReason`(닫는 사유만)이라 이름과
  실제 내용이 어긋난다.
- 왜 문제인가: `onOpenChange(open, detail)`이 `open === true`로 바뀌는 순간
  실제로 호출되면 `detail.reason`에 다섯 값 중 뭐가 들어가는지 코드에도 문서
  (`docs/tour.md`)에도 없다. 다른 여섯 모듈처럼 "이 오버레이가 왜 열렸는지"를
  일관되게 로깅/분석하는 공용 renderer 유틸을 짜면 Tour에서만 값이 없거나
  타입이 안 맞아 별도 분기가 필요하다 — Popover/Tooltip처럼 **같은 이름이 다른
  뜻**은 아니지만, "이름이 약속하는 것을 실제로 못 지키는" 자리라 다음 사람이
  또 이 질문을 하게 된다.
- 권고: **이름 변경 또는 문서화, 둘 중 하나.**
  - (a) `TourOpenChangeDetail`에 `"trigger"`를 추가해 나머지 여섯과 맞춘다(Tour가
    일반적으로 "시작" 버튼이나 첫 실행 로직으로 열리므로 자연스러운 값이다), 또는
  - (b) Tour는 열림 이벤트 자체를 보고할 필요가 없다고 판단했다면(예: "제품이
    `open=true`로 설정하는 순간 이미 왜 여는지 알고 있다") 그 판단을 `docs/tour.md`에
    명시하고 타입 이름을 `TourCloseDetail`처럼 실제 내용과 맞게 바꾼다.
  - 이 저작자 권고는 (a)다 — 나머지 여섯 모듈과 한 가지 어휘를 유지하는 비용이
    "Tour는 특별하다"는 예외를 하나 더 만드는 비용보다 낮다.
- 적용 시 건드릴 파일: `src/tour.ts`(`TourCloseReason`/`TourOpenChangeDetail`
  선언과 관련 scenario 문자열), `docs/tour.md`(어느 쪽을 택했는지 근거 한 단락),
  `test/tour.test.ts`(열림 사유를 검증하는 테스트가 없다면 하나 추가하는 편이
  이 축을 다시 놓치지 않게 한다).

### 11. [확인함, 정확함] DesignSystemProvider의 direction 이관 목록 — 6곳 전부 맞고 빠진 곳 없음

- 대상: `docs/design-system-provider.md`가 주장한 `BottomNavigationDirection`,
  `TabsDirection`, `SelectionDirection`, `IconDirection`, `ShowcaseDirection`,
  `calendar.ts` 인라인 파라미터.
- 확인 내용: `grep -rn '"ltr"' src/*.ts`로 전체를 다시 훑었다. 정확히 이 6곳뿐이고
  일곱 번째 자리는 없다. `SidePanelEdge`/`FilePicker`/`Tour`/`Splitter`/`Layout`
  등이 쓰는 `"start"|"end"`는 **다른(보완적인) 축**이라 겹치지 않는다 — 그건
  물리적 좌우가 아니라 논리적 시작/끝이고, `ltr`/`rtl`이 있어야 좌우로 해소되는
  하류 값이다.
- 결론: 이관 대상 목록이 정확하다. 이번 저작자 다섯이 만든 새 파일 중에도
  `"ltr"`/`"rtl"`을 새로 선언한 곳은 없었다(1차 이후 늘어난 `tour.ts`/
  `transfer-list.ts`/`floating-action-button.ts` 포함, 셋 다 방향 축이 없다).

### 12. [확인함, 정확함] textScale/fontScale 두 갈래도 정확히 두 곳뿐

- 대상: `docs/design-system-provider.md`가 주장한 `description-list.ts`의
  `fontScale`(연속값)과 `showcase.ts`의 `ShowcaseTextScale`(닫힌 `1|1.5|2`).
- 확인 내용: `grep -rn "Scale\b|fontScale|textScale" src/*.ts`로 전체를 훑었다.
  세 번째 갈래는 없었다.
- 결론: 정확함.

### 13. [확인함, 문제없음] 오버레이류 11개의 열림/닫힘 사유 전수 비교표

| 모듈 | 열림 사유 | 닫힘/dismiss 사유 |
| --- | --- | --- |
| Sheet | `trigger` | `close-action`·`escape`·`back`·`outside`·`swipe`·`programmatic` |
| SidePanel | `trigger` | `close-action`·`escape`·`outside`·`programmatic` |
| CommandPalette | `trigger` | `close-action`·`outside`·`escape`·`activation`·`programmatic` |
| Popover(수정 후) | `trigger` | `close-action`·`outside-pointer`·`outside-focus`·`escape`·`programmatic` |
| Select | `trigger` | `keyboard`·`selection`·`escape`·`outside`·`blur`·`programmatic` |
| DatePicker | `trigger` | (Select와 같은 계열, `collection.ts` 재사용) |
| AlertDialog | `trigger` | `confirm`·`cancel`류(`AlertDialogCancelReason`) |
| Tooltip | `pointer`·`focus` | `pointer-leave`·`blur`·`escape`·`trigger-activation`(재클릭 닫힘)·`another-tooltip` |
| Toast | 없음(트리거 앵커가 없는 큐 모델) | `ToastDismissReason`(별도 체계, 오버레이 anchor 개념 자체가 없어 비교 대상 아님) |
| Tour | **없음(10번 항목)** | `skip`·`escape`·`complete`·`programmatic`·`interrupted` |
| Menu | (behaviorRegistry 문자열, 자체 파일 없음) | `escape`·`outside`·`selection` |

결론: `programmatic`(controlled owner의 강제 닫힘은 항상 허용)과 `escape`는 전
모듈이 같은 뜻으로 일관되게 쓴다. `close-action`(명시적 닫기 버튼)도 일관된다.
Tooltip/Toast는 애초에 다른 문제(hover 트리거 없음/큐 모델)라 다른 어휘를 쓰는
것이 맞다 — 강제로 맞추면 오히려 `docs/tooltip.md`/`docs/toast.md`가 이미 세운
경계를 허문다.

### 14. [확인함, 문제없음] ComposeXAccessibleName 패턴 — 7개 모듈이 독립적으로 같은 모양에 수렴

- 대상: `Calendar`, `Carousel`, `Pagination`, `PasswordField`, `Timeline`, `Steps`,
  `Tree`의 `Compose*AccessibleName` 타입 7개.
- 확인 내용: 전부 `(info: <X>AccessibleNameInfo) => string` 모양이다 — 인자
  개수·반환 타입까지 정확히 일치한다. 서로 다른 저작자가 각자 만들었는데도
  "제품이 포맷한 문자열을 받는다"는 원칙이 같은 함수 시그니처로 수렴했다.
- 결론: 어긋남 없음 — 오히려 이 저장소의 관례가 잘 전파된 증거.

### 15. [확인함, 문제없음] DatePicker는 Calendar의 ISO 날짜 검증을 재사용한다

- 대상: `src/date-picker.ts`의 import 목록.
- 확인 내용: `assertIsoCalendarDate`, `validateCalendarGridDescriptor`,
  `resolveCalendarGridDescriptor` 등을 `./calendar.js`에서 직접 가져와 쓴다 — 날짜
  문자열 검증을 다시 짜지 않았다.
- 결론: 어긋남 없음.

### 16. [확인함, 문제없음] TransferList의 tri-state/재조정 재사용

- 대상: `src/transfer-list.ts`.
- 확인 내용: `getCheckboxNextState`, `toggleCheckboxSelection`,
  `reconcileCheckboxSelection`(전부 `behaviors.ts` 기존 함수)을 그대로 가져다
  쓰고, `resolveTransferListSelectAllState`는 DataTable의
  `resolveDataTableSelectAllState` 패턴(disabled 제외, `CheckboxState` 반환)을
  주석으로 직접 인용하며 패널 단위로 일반화한다.
- 결론: 어긋남 없음 — 1차의 6번 항목과 같은 계열의 모범 사례.

## 감사하지 않은 것 (2차 범위 고백)

1차가 고백한 16개 중 이번에 **직접 읽은 것**: `Calendar`(날짜 검증만),
`DatePicker`, `DesignSystemProvider`, `Timeline`/`Steps`/`PasswordField`(accessible
name 시그니처만), `TransferList`(전체). **여전히 필드 단위로 못 본 것**:
`Carousel`(accessible name 시그니처만 확인, 나머지 로직 미확인), `OtpField`,
`Mentions`, `Image`, `Form`, `Watermark`, `QRCode`, `Anchor`, `Affix`, `Cascader`
(문서만 존재), `ColorPicker`(문서만 존재). 이번에 새로 생긴
`FloatingActionButton`도 `docs/tour.md`의 "이 담당분의 다른 둘(FloatingActionButton,
ConfirmPopover)과 달리"라는 문구가 FAB를 불필요하다고 판정한 것처럼 읽힐 수도
있어 대조해 봤지만, `floating-action-button.md`가 BottomCTA와의 경계를 별도로
분명히 근거를 들어 계약했고 그 판정이 서로 모순되는지는 문구가 같은 저작 배치를
가리키는 것인지 실제 판정 충돌인지 불확실해 **확정 짓지 못했다** — 이건 발견이
아니라 미해결로 남긴다.

## 2차 게이트

코드는 여전히 고치지 않았다 — `docs/consistency-audit.md`에 이 절만 추가했다.
`pnpm typecheck && pnpm test`는 617 passed / 0 errors로, 감사 시작 전과 동일하다
(감사 중 다른 저작자가 `mentions`/`transfer-list`의 진행 중 실패를 스스로
고쳤다 — 이 문서가 그걸 고친 것은 아니다).

---

# 3차 — 문서가 적어 둔 실사용처가 실물과 다른 문제 (2026-08-19)

리드가 다른 저작자의 승격 실측 과정에서 문서 넷(`steps.md`, `breadcrumb.md`,
`description-list.md`, `image.md`)이 존재하지 않는 실사용처를 근거로 들고 있다는
보고를 받아 전달했다. `/Users/jimin/Desktop/yajalal`과 `/Users/jimin/Desktop/BurnTok`을
직접 읽어 하나씩 검증하고, 어긋난 넷을 고쳤다(`src`/`test`는 여전히 손대지 않았다).

## 검증 결과

- **`steps.md`**: `OnboardingScreen.tsx`를 직접 읽었다 — 지금도 `AppProgress`(연속
  진행바, `value={currentStepIndex + 1}` + `valueText="N / M"`)를 그대로 쓰고
  있다. "AppProgress 대체"라는 문구가 이미 결정된 교체 계획처럼 읽혔지만 그런 계획은
  코드 어디에도 없다 — 화면 모양 자체는 Steps 후보로 여전히 타당하지만(이름 있는
  단계·뒤로 가기 버튼), "대체 예정"이 아니라 "지금은 진행바로 풀려 있다"고 정정했다.
- **`breadcrumb.md`**: Breadcrumb는 `platform: "web"`인데 인용된 "야잘알 구단 상세 →
  선수단 → 선수 상세"는 애초에 Web 화면이 아니다 — 야잘알은 Flutter(`modules/app`)와
  React Native(`modules/app-rn`) 모바일 앱뿐이고 Web 모듈 자체가 없다. BurnTok
  Web(`apps/web/src/app`)의 실제 라우트 트리도 확인했지만 지금은 대부분 2단
  이하(`/c/[id]`, `/ideas/[id]`, `/messages/[peerId]`, `/u/[id]`)라 3단 이상 후보를
  찾지 못했다 — "아직 없음"으로 정정하고 확인한 근거(라우트 목록)를 남겼다.
- **`description-list.md`**: `FaCenterScreen.tsx`(FA 등급)와 `PlayerScreen.tsx`(선수
  프로필) 둘 다 직접 읽었다 — 실제로 `AppList`/`AppListRow`(이미 beta)로 풀려 있고
  `columns: 1|2` grid 모양이 아니다. 두 후보 모두 DescriptionList의 계약과 안 맞아
  "아직 없음"으로 정정했다.
- **`image.md`**: "선수 프로필 사진"과 "FA 등급 차트 이미지"를 코드베이스 전체에서
  검색했지만 존재하지 않는다. 가장 가까운 실사용(`TeamMark.tsx`의 팀 엠블럼)은 이니셜
  폴백이 붙은 Avatar 성격의 조합이라 Image가 계약하는 "네트워크 로드 실패/404 자산"
  문제와 결이 다르다. BurnTok Web의 아이콘도 확인했지만 data URI SVG라 네트워크 로드
  실패 케이스 자체가 없다. "아직 없음"으로 정정했다.

`docs/carousel.md`의 "야잘알 홈의 내 구단 경기 스트립"도 대조군으로 재확인했다 —
`HomeMatchHero.tsx`가 실제로 `CAROUSEL_GAP`/`CAROUSEL_PEEK` 상수와 함께 여러 경기
카드를 가로로 스냅 스크롤하는 코드를 갖고 있어, 이름은 다르지만 내용은 정확했다.
리드가 "올바른 형식"으로 지목한 문서가 실제로도 맞다는 것을 확인했다.

## 왜 이런 일이 생기는가

네 문서 모두 로드맵의 기록 형식(`문제 → 일반화한 계약 → HJM 기본값 → 플랫폼 번역 →
검증 화면`)에서 **"검증 화면"란 자체는 비워 두지 않았다** — `steps.md`/
`breadcrumb.md`/`description-list.md`/`image.md` 넷 다 "아직 없음"이라는 정직한
문장으로 시작했다. 문제는 그 뒤에 붙는 **"유력 후보"** 한 줄이다. `docs/carousel.md`
같은 좋은 선례가 이미 "아직 없음 + 구체적 후보 하나"라는 형식을 보여주고 있어서,
후속 저작자들이 그 형식을 그대로 따라 쓰되 후보를 **상상해서 채운 뒤 실제 코드로
확인하지 않았다** — `pnpm typecheck && pnpm test` 게이트는 이 문장이 가리키는
파일/화면이 실제로 존재하는지 검사할 방법이 전혀 없어서, 잘못 채운 후보가 그대로 다음
저작자의 승격 실측 단계까지 통과했다.

즉 구조적 압력은 "검증 화면 항목을 비워 두면 안 될 것 같다"가 아니라, **"아직
없음"이라는 정직한 한 줄 뒤에 구체적인 후보 이름까지 붙이는 것이 이 저장소의 좋은
스타일로 이미 자리 잡았는데, 그 구체성 자체를 검증할 게이트가 없다**는 것이다.
`docs/notification.md`/`docs/dropdown.md`/`docs/virtual-list.md`처럼 "만들지 않는다"
판정 문서는 판정 근거가 전부 **이 저장소 안의 다른 코드**(catalog, crosswalk, 다른
recipe)라서 typecheck/grep으로 재검증이 쉽지만, "검증 화면 후보"는 근거가 **이 저장소
밖의 제품 코드**(yajalal, BurnTok)라서 이 저장소의 게이트가 원천적으로 닿지 못한다 —
같은 실수(근거를 확인하지 않고 적음)라도 위치에 따라 걸리는 그물이 다르다.

## 고칠 자리 제안

로드맵의 기록 형식에 "검증 화면"란을 채울 때의 규칙을 한 줄 추가하는 것을 제안한다 —
예: "구체적인 화면/컴포넌트 이름을 후보로 들 때는 실제 코드에서 확인한 뒤에만 적는다.
확인하지 못했다면 '아직 없음'에서 멈추고 후보를 지어내지 않는다." 이건 이 저장소
자체(`docs/`)에서 고칠 수 있는 문구라 `src`/`test` 금지 규칙과 충돌하지 않는다 — 다만
로드맵 문서 자체를 고칠지는 리드 판단으로 남긴다.

## 3차 산출물

`docs/steps.md`, `docs/breadcrumb.md`, `docs/description-list.md`, `docs/image.md`의
"검증 화면" 절을 직접 수정했다(문서 파일은 이번 담당에서 허용됨). `src`/`test`는
손대지 않았다.

## 3차 게이트

문서만 고쳤으므로 `pnpm typecheck && pnpm test`는 그대로다.
