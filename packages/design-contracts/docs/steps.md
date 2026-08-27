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
않는다.** 대신 하나의 `currentStepId`(+ 선택적 `currentStepStatus: "current" | "error"`)만
받고, `resolveStepsDescriptor`가 배열 위치로 나머지를 유도한다.

```
index < cursor  → complete
index === cursor → currentStepStatus (기본 "current", 실패 시 "error")
index > cursor  → pending
```

두 단계 이상 "current"이거나, cursor보다 앞선 단계가 아직 "pending"으로 남거나, cursor
너머의 단계가 "complete"인 상태는 애초에 표현할 수 없다 — 이 저장소의 다른 계약들
(`SheetOpenState`, `ComboboxCollectionState`, `LoadMoreState`)과 같은 이유다: 유효하지 않은
조합을 타입과 유도 규칙으로 만들 수 없게 한다. clickable을 공개하지 않기로 했으므로(아래
참고) 흐름은 항상 cursor 기준 선형이라 이 유도가 항상 맞다.

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
- `complete` = success 톤(`semanticColors.feedback.success`), `error` = danger 톤
  (`semanticColors.feedback.danger`) — badge/notice가 이미 쓰는 soft background + border +
  foreground 3단 조합을 재사용한다.
- `current`는 배경을 채우지 않고 `semanticColors.content.brand` 테두리·글자만 쓴다.
  identity.md가 명시한 대로 `primary` fill(버튼 등 주요 행동)과 `contentBrand`(포커스·선택·
  현재 위치)를 분리하기 위해서다 — Steps 마커는 행동이 아니라 위치 표시이므로 contentBrand만
  쓴다.
- `connector.tone`은 `reached`(brand) / `unreached`(border.default) 두 값뿐이다.
  `isStepReached(status)`(`pending`만 false)로 renderer가 인접 segment 색을 고른다.
- 텍스트(라벨·description)와 마커 글자·아이콘(`indicator.content`), 도달한 connector 색은
  각각 4.5:1 / 3:1을 만족하도록 recipe 색을 선택했다(test로 두 기준을 분리해 검증). `pending`
  마커 테두리와 `connector.unreached`는 Divider·Badge가 이미 쓰는 공용 저대비 `border.default`/
  alpha 톤을 그대로 재사용하는 장식적 tint라 대비 기준 대상이 아니다 — 상태 구분은 마커
  글자·모양(숫자 vs check vs error)과 `statusLabel`이 이미 이중으로 전달한다.

## 플랫폼 번역

- Web: cursor step(`status === "current" | "error"`)에만 `aria-current="step"`을 단다.
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
| clickable(스텝 탭으로 이동) | **배제** — 브리프 지침이자 실제 사용처 둘 다 뒤로 가기는 별도 버튼(Yajalal `OnboardingScreen`의 "이전" `AppButton`)이다. 필요해지면 그때 추가한다. |
| vertical 방향 | **배제** — 두 사용처 모두 가로 진행바 하나만 필요해 antd 표면을 미리 복제하지 않는다. |
| dot type(압축 점 표현) | **배제** — 측정된 요구가 없다. numbered + check/error 마크 하나만 공개한다. |
| custom icon(스텝별 임의 아이콘 교체) | **배제** — 4개 상태 마크로 충분하고, 임의 아이콘 허용은 브랜드 표현의 일관성을 깨뜨린다. |
| navigation type(`navigation`/`inline` 등 antd variant) | **배제** — 위 clickable/vertical 배제와 같은 이유로 단일 표현만 남긴다. |

## 검증 화면

first-party Web·Native renderer와 상태 파생·환경 matrix 증거는 연결되어 surface는 `beta`다.
실제 제품 vertical slice는 아직 없으므로 `stable` 승격 gate는 닫혀 있다.

유력 후보였던 "Yajalal 온보딩(`OnboardingScreen`의 `AppProgress` 대체)"은 검증 결과
부정확했다 — `OnboardingScreen.tsx`는 지금도 그대로 `AppProgress`(연속 진행바,
`value={currentStepIndex + 1}` + `valueText="N / M"`)를 쓰고 있고, 이를 Steps로 바꾸는
결정된 계획은 어디에도 없다. 화면 자체(환영→구단→관심 선수→알림→완료, 각 단계에 이름이
있고 뒤로 가기 버튼이 있음)는 Steps가 실제로 풀 수 있는 문제와 모양이 맞으므로 잠재
후보로는 남기되, "이미 대체 대상으로 정해진 화면"처럼 적지 않는다 — 지금은 제품이 그
화면을 진행바로 계속 쓰고 있다는 사실만 정확하다. BurnTok 가입 흐름은 이번 재검증에서
직접 확인하지 않았다.
