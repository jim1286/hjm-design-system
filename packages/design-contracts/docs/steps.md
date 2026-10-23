# Steps contract

## 문제

사용자가 여러 단계로 이루어진 흐름의 어디에 서 있는지 보여준다 — 지나온 단계가 몇 개인지,
지금 단계가 무엇인지, 남은 단계가 몇 개인지. Yajalal 온보딩(환영 → 구단 → 관심 선수 → 알림
→ 완료)과 BurnTok 가입 흐름이 같은 문제를 각자 화면에서 풀고 있다.

## 일반화한 계약

### collection 기본 계약과의 대응

각 step은 stable string `id`, 보이는 `label`, 선택적 `description`을 가진다(Collection 기본
계약의 최소 부분집합). `textValue`, `none|single|multiple` selection mode,
`idle|loading|loadingMore|empty|error` async state는 가져오지 않는다 — Steps는 검색/타이핑
탐색 대상이 아니고(제품이 문자로 찾지 않는다), 사용자가 선택하는 대상도 아니며(고르는 게
아니라 보여주기만 한다), 서버에서 비동기로 채워지는 목록도 아니다(제품이 항상 전체 flow를
동기로 안다). 이 세 축을 억지로 채우면 유령 계약이 된다.

### 단일 커서로 상태를 유도한다

로드맵의 공통 상태 축 표에는 `pending/current/complete/error`가 없다 — Steps 전용 축이다.
각 step은 이 네 값 중 하나만 가지지만, **제품이 각 step에 개별 status를 배열로 넘기지
않는다.** 대신 하나의 `currentStepId`(+ 선택적 `currentStepStatus: "current" | "error" | "complete"`)만
받고, `resolveStepsDescriptor`가 배열 위치로 나머지를 유도한다.

```
index < cursor  → complete
index === cursor → currentStepStatus (기본 "current", 실패 시 "error", 끝나면 "complete")
index > cursor  → pending
```

두 단계 이상 "current"이거나, cursor보다 앞선 단계가 아직 "pending"으로 남거나, cursor
너머의 단계가 "complete"인 상태는 애초에 표현할 수 없다 — 이 저장소의 다른 계약들
(`SheetOpenState`, `ComboboxCollectionState`, `LoadMoreState`)과 같은 이유다: 유효하지 않은
조합을 타입과 유도 규칙으로 만들 수 없게 한다. 누르기는 커서 앞 단계로 돌아가는 것만 열었으므로(아래
참고) 흐름은 항상 cursor 기준 선형이라 이 유도가 항상 맞다.

`"complete"`는 2026-10-02에 추가했다. 그 전에는 마지막 단계에 커서가 있으면 항상 "진행 중"으로
읽혀 끝난 흐름을 표현할 수 없었고, STEA 후보 검토의 주문 처리 구성은 끝나면 Steps를 `Result`로
바꿔 우회했다. cursor를 `"complete"`로 두면 cursor까지 완료, 그 뒤는 pending이라 위 선형 유도를
깨지 않는다. 마지막 step에서 쓰면 전체 완료다. step별 status 배열은 여전히 받지 않는다.

### 순서를 접근성 이름에 남긴다

마커가 숫자를 시각적으로만 보여주면(원 안의 "2") 화면낭독기는 라벨만 읽고 몇 번째인지
잃는다. `resolveStepsDescriptor`는 각 step에 `position`(1-based), `total`, 그리고 제품이
공급한 `composeAccessibleName({ position, total, label })`으로 만든 `accessibleName`을
붙인다. 한국어 "3단계 중 2단계"는 영어 "step 2 of 3"과 어순이 다르므로 HJM이 문장을
조립하지 않고 — 항상 조립은 하되(브리프 요구) 실제 어순·조사는 product composer에
맡긴다. resolver는 composer가 빈 문자열을 반환하면 던진다.

### 상태는 색 하나로 말하지 않는다

- 시각: `stepsRecipe.indicator.marks`가 pending/current는 숫자(마커 없음, `null`), complete는
  기존 `check` 아이콘, error는 기존 `error` 아이콘을 쓴다. 넷 다 border·content 색이 달라
  색맹 사용자도 테두리 유무·마크 모양으로 구분한다.
- 낭독: 각 resolved step은 `statusLabel`(제품이 공급한 `StepsStatusLabels`에서 상태별 문구)을
  들고 있다. CheckboxGroup 계약과 같은 이유 — Native에는 Web `aria-current="step"`에 대응하는
  공용 상태가 없으므로, 상태 문구를 renderer가 Web에서는 보조 텍스트로, Native에서는
  `accessibilityHint`로 전달해야 한다. `accessibleName`(순서+라벨)이 주 이름이고
  `statusLabel`은 보충이다 — 상태 단어가 이름 앞에 와서 라벨을 덮지 않는다.

## HJM 기본값

- `currentStepStatus` 기본값은 `"current"`(`stepsDefaults.currentStepStatus`). 실패를
  표현하려는 제품만 명시적으로 `"error"`를 넘긴다.
- `presentation` 기본값은 `"focus"`다. 현재 표지는 `content.primary` 채움 + `canvas` 글자,
  완료는 중립 체크, 예정은 옅은 번호, 오류는 danger 표지를 사용한다. 도달한 연결선도 중립색이다.
  2026-10-23 사용자가 선택한 시안에 따라 이전 success 완료·brand 현재 테두리를 대체한다.
- 숫자 표지 32, `renderMark` 제품 그림 44, 버튼 최소 높이 44를 분리한다. 그림 표지는 canvas를 유지한다.
- `compact`는 현재 순서·제목·상태와 분할 막대, 번역된 `overviewLabel` 버튼을 제공한다.
  펼쳐야 지난 단계가 버튼이 된다. `vertical`은 현재 단계의 `renderStepContent(id)`만 펼친다.
- 콘텐츠·초안·입력 검증·서버 확정은 제품이 소유한다. 표현 변경은 navigationMode의 권한을 바꾸지 않는다.
- 정확한 props와 배치는 [사용 지침](usage/components/steps.md), 수치는 `stepsRecipe`가 소유한다.

## 플랫폼 번역

- Web: cursor step이 `"current" | "error"`일 때만 `aria-current="step"`을 단다. cursor가
  `"complete"`면 진행 중인 단계가 없으므로 `aria-current`를 달지 않는다.
  마커 아이콘은 decorative(숨김)로 두고 root의 accessible name은 `accessibleName`
  하나다. `statusLabel`은 visually-hidden 텍스트 또는 `aria-describedby`로 덧붙인다.
  connector는 `aria-hidden`.
- Native(RN): root에 `accessibilityLabel=accessibleName`,
  `accessibilityHint=statusLabel`(Web의 aria-current 동등물이 없어 hint로 상태를 전달 —
  CheckboxGroup의 `aria-required`/`aria-invalid` 대응과 같은 처리). 마커·connector는
  `accessibilityElementsHidden`/`importantForAccessibility="no"`.
- Reduce Motion: 상태 전환(예: current → complete) 애니메이션은 즉시 전환 또는 짧은 opacity로
  대체한다. 이동·반복 모션은 두지 않는다(motion 원칙 그대로).

## 공개한 축 / 배제한 축

| 축 | 상태 |
| --- | --- |
| `pending / current / complete / error`(유도) | 공개 |
| 순서(`position`/`total`) | 공개 |
| 지난 단계 누르기(`revisitable` + renderer `onStepPress`) | **공개(1.31.0)** — 2026-10-18 spint 작성 화면이 지난 단계를 눌러 돌아가려고 단계 레일을 직접 그렸다. resolver가 커서보다 앞선 단계에 `revisitable: true`를 붙이고, renderer는 제품이 `onStepPress`를 줄 때 그 단계만 버튼으로 만든다(칸 전체, 최소 44 `stepsRecipe.press.minTouchTarget`). 이전 판단("뒤로 가기는 별도 버튼")은 바로 앞 단계 행동에는 그대로 유효하다. |
| 앞으로 건너뛰기(현재·다음 단계 누르기) | **배제** — 검증 전 단계를 지나치고 단일 커서 유도를 흐린다. 커서 단계는 이미 있는 자리라 누를 이유가 없다. |
| 세로·축약 표현 | **공개(개발)** — 2026-10-23 사용자 선택. `presentation: focus / compact / vertical`, 새 상태 엔진 없이 동일 커서를 표현한다. |
| dot type(압축 점 표현) | **배제** — 측정된 요구가 없다. numbered + check/error 마크 하나만 공개한다. |
| 제품 그림 표지 | **공개** — `renderMark(status, position)` 슬롯. 그림·의미는 제품, 공간·접근성·누름은 HJM 소유다. |
| 임의 navigation type | 별도 antd 표현을 복제하지 않음. 현재 요구는 공개 presentation 세 가지로 충족한다. |

## 검증 화면

기존 Steps의 등록 상태는 catalog를 따른다. 2026-10-23 추가한 표현은 미게시 개발 소스이며,
새 표현의 Storybook 화면 확인을 소비 앱 적용·npm 게시로 해석하지 않는다.

유력 후보였던 "Yajalal 온보딩(`OnboardingScreen`의 `AppProgress` 대체)"은 검증 결과
부정확했다 — `OnboardingScreen.tsx`는 지금도 그대로 `AppProgress`(연속 진행바,
`value={currentStepIndex + 1}` + `valueText="N / M"`)를 쓰고 있고, 이를 Steps로 바꾸는
결정된 계획은 어디에도 없다. 화면 자체(환영→구단→관심 선수→알림→완료, 각 단계에 이름이
있고 뒤로 가기 버튼이 있음)는 Steps가 실제로 풀 수 있는 문제와 모양이 맞으므로 잠재
후보로는 남기되, "이미 대체 대상으로 정해진 화면"처럼 적지 않는다 — 지금은 제품이 그
화면을 진행바로 계속 쓰고 있다는 사실만 정확하다. BurnTok 가입 흐름은 이번 재검증에서
직접 확인하지 않았다.

## 읽기 흐름의 자유 이동 — 2026-10-19

포트폴리오 설계·운영 설명은 단계 선택으로 해당 본문을 읽는 흐름이므로 `StepsDescriptor.navigationMode: "free"`에서 `onStepPress`가 모든 단계에 동작한다. 기본 `linear`는 기존 검증형 작성 흐름처럼 이전 단계만 허용한다. 이 절이 기존 앞으로 이동 배제 설명의 읽기 흐름 예외다. 단일 currentStepId와 앞/뒤 상태 도출은 유지하며 제품은 상태 문구를 읽기 맥락에 맞춘다.


### 2026-10-23 개발 확인

- Steps 계약 20개, Web Steps·StepPlayer 4개, Native Steps·StepPlayer 3개 테스트 통과. 세 패키지 빌드와 두 Showcase 타입 검사 통과.
- Web Storybook: focus·compact·vertical, 오류→수정→완료, 이전 단계와 초안 보존, 390/1000 폭, light/dark, reduced motion과 compact 키보드 펼침을 확인했다.
- iPhone 17 Pro · iOS 26.5 (`AC433031-1746-46C6-86A9-143A1FC839F8`): 기존 개발 클라이언트에서 세 표현을 표시하고 focus 이동·복귀, compact 펼침, vertical 본문 전환을 확인했다. dark focus도 표시했다. Android 기기와 VoiceOver는 미실행.
- Native Storybook 탐색 패널의 항목이 Device Hub 접근성 트리에 노출되지 않고 좌표 입력이 반응하지 않아 목록 선택·스크롤은 idb로 수행했다. 실제 결과 화면과 이후 버튼 동작은 Device Hub로 확인했다. 임시 키보드 캡처는 off로 원복했다.
- 패키지 전체 타입 검사는 기존 선택 UI 테스트의 optional brandPalette/unused import 오류로 실패했다. 변경한 Steps 소스·Showcase 타입 검사는 통과했으며 무관한 테스트 파일은 보존했다.
- 검증 중 생성된 무관한 컴파일 산출물 변경은 제거했다. 요청한 미리보기를 위해 Web 6006·Native 8084 개발 서버는 유지하며, 미리보기 종료 시 해당 프로세스를 종료하면 된다. 버전 상승·게시·운영 배포는 하지 않았다.
