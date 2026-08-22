# FloatingActionButton contract

## 문제

목록·피드처럼 스크롤되는 콘텐츠 위에, 화면 전체 폭을 쓰지 않으면서도 항상 손닿는
자리에 떠 있는 단일 생성 행동(새 기록 추가, 새 글 작성)이 필요하다. antd
`FloatButton`이 이 문제를 커버한다.

## BottomCTA와 겹치지 않는다 (판정)

이 시스템에는 이미 화면 하단에 고정된 주요 행동(`bottomCtaRecipe`)이 있다. 둘의
차이는 이름이 아니라 **콘텐츠와의 관계**다.

| | BottomCTA | FloatingActionButton |
| --- | --- | --- |
| 폭 | 화면 전체(`bottomCtaRecipe`에 `paddingHorizontal: layout.pagePadding.regular`) | 콘텐츠 폭과 무관한 고정 크기 원/알약 |
| 의미 | 그 화면의 **결론** — 이 흐름은 이 행동으로 끝난다 | 아직 브라우징 중인 콘텐츠 **위에 뜬** 생성 행동 — 화면의 결론이 아니다 |
| 콘텐츠와의 관계 | 콘텐츠 아래 고정된 별도 행(`bottomCtaRecipe.slots`에 `root/description/secondaryAction/primaryAction`) | 콘텐츠 **위에 겹쳐** 뜨고, 콘텐츠 마지막 항목을 가리는 문제가 생긴다(아래 참고) |
| 스크롤 반응 | 없음 — 위치 고정, 크기 불변 | 스크롤 방향에 따라 확장/축소(아래 참고) |

즉 한 화면에 어느 하나만 있는 경우가 대부분이지만, 원리상 공존도 가능하다(예:
목록 화면에 "필터 적용" 같은 BottomCTA 결론 행동과 별개로 "새 항목 추가" FAB가
뜨는 경우). 두 계약을 하나로 합치면 "화면의 결론"과 "콘텐츠 위 생성 행동"이라는
서로 다른 두 의미를 한 recipe가 떠안게 되므로 분리를 유지한다.

## 일반화한 계약

### Button/IconButton recipe를 재사용한다 — 새 recipe를 얻지 못한다

`floatingActionButtonRecipe`는 새 톤·크기·그림자를 선언하지 않는다.

- `circle`은 `iconButtonRecipe.sizes.large`(diameter 52) 그대로.
- `tone`은 `iconButtonRecipe.tones.primary` 그대로.
- `shape`는 `iconButtonRecipe.shapes.circle`(`radius.full`) 그대로.
- `expandedLabel`은 `buttonRecipe.sizes.large`의 `textVariant`/`paddingHorizontal` 그대로.

두 모드(collapsed/expanded) 모두 `large` 티어를 공유하므로 모양이 원 ↔ 알약으로
바뀌는 동안 높이(터치 타깃)는 52로 고정된다 — 라벨이 나타나거나 사라질 때 버튼
전체가 세로로 들썩이지 않는다. `docs/dropdown.md`가 "Menu와 거의 같은 anatomy를
다시 선언하지 않는다"고 판정한 것과 같은 이유로, 이 모듈도 `Button`의 recipe를
포크하지 않는다.

### 스크롤에 따른 확장/축소

`FloatingActionButtonScrollSignal`(`away-from-start`/`toward-start`/`idle`)은
LoadMore의 `viewport` 신호, Popover의 `AnchoredOverlay`와 같은 경계를 따른다 —
**스크롤 리스너와 임계값 판단은 렌더러 소유**이고, 이 모듈은 이산적인 신호 하나만
받아 다음 모드를 돌려준다(`resolveFloatingActionButtonLayoutMode`). `idle`은
"판단할 근거가 없다"는 뜻이므로 현재 모드를 그대로 유지한다 — 델타가 0인 프레임마다
매번 추측해서 버튼이 깜빡이는 사고를 막는다.

라벨이 숨어도(`collapsed`) 접근성 이름은 줄어들지 않는다.
`resolveFloatingActionButtonDescriptor`는 두 모드 모두에서
`resolvedAccessibilityLabel`을 항상 전체 `label`로 고정한다 — 아이콘만 보이는
상태가 "이름 없는 버튼"이 되는 사고를 타입 차원에서 막는다.

### 콘텐츠 마지막 항목을 가리는 문제 — 여백은 계약이 책임진다

FAB는 콘텐츠 위에 겹쳐 뜨므로, 스크롤 가능한 콘텐츠는 항상 FAB의 발자국만큼 하단
여백을 예약해야 한다. 이 계산을 Web/RN 렌더러가 각자 다시 하면 어긋날 수 있으므로
`resolveFloatingActionButtonContentClearance(safeAreaBottomInset)`이 한 곳에서
`diameter + margin × 2 + safeAreaBottomInset`을 계산해 돌려준다. safe-area
inset은 BottomNavigation·Sheet·Toast와 같은 **additive** 모드다(base 여백에
더하지, `max()`로 대체하지 않는다).

### 낭독·탭 순서에서의 자리

FAB는 collection 항목이 아니다. 스크롤 콘텐츠 **뒤**에 오는 고정 sibling으로
렌더링하고, 콘텐츠 안에 넣지 않는다 — 항목이 추가/삭제되어도 FAB의 낭독·탭 순서
위치가 흔들리지 않는다. `BottomNavigation`이 "생성 행동은 destination 목록에
넣지 않고 별도 Button/IconButton으로 합성한다"고 이미 정한 경계와 같은 이유다.

## HJM 기본값

- `layoutMode` 기본값 `expanded` — 첫 진입 시 라벨이 보여야 사용자가 무슨
  행동인지 먼저 읽는다.
- 전환은 `motionPreset.micro`(120ms, Reduce Motion에서 즉시 전환)를 쓴다.
  스크롤마다 반복 트리거될 수 있는 상태 변화이므로, 다른 recipe들의 열기/닫기용
  `enter`/`exit`(200ms대)보다 hover/press급의 가장 빠른 티어를 골랐다 — 빠른
  스크롤 뒤로 전환이 밀려 쌓이는 사고를 막는다.
- `shadow.floating`을 재사용한다 — identity.md의 "floating은 menu·toast" 목록에
  이름이 명시돼 있지는 않지만, 콘텐츠 위에 실제로 떠 있는 계층이라는 같은
  조건을 만족하는 유일한 기존 티어다.
- 모서리 여백은 `spacing.md`(16) — BottomCTA의 화면 폭 여백(`layout.pagePadding`)과
  다른 스케일이다. FAB는 화면 가장자리에서 안쪽으로 들어온 작은 원이지, 폭 전체
  콘텐츠 정렬을 따르는 요소가 아니다.

## 플랫폼 번역

- Web: `position: fixed`(또는 스크롤 컨테이너 기준 `sticky`), `aria-label`이
  항상 전체 `label`(모드 무관). 아이콘은 decorative(`aria-hidden`).
- Native: 절대 위치 + safe-area 하단 inset을 additive로 적용.
  `accessibilityLabel` 역시 항상 전체 `label`.
- Reduce Motion: 모양 tween(원 ↔ 알약) 없이 아이콘/라벨 opacity 교차로 대체.

## 공개한 축 / 배제한 축

| 축 | 상태 |
| --- | --- |
| `layoutMode`(expanded/collapsed) | 공개 |
| 접근성 이름(항상 전체 label) | 공개, 모드와 독립 |
| 콘텐츠 하단 여백 계산 | 공개(`resolveFloatingActionButtonContentClearance`) |
| `disabled` | **배제** — 측정된 요구 없음. 생성 행동은 보통 항상 활성 상태다. 필요해지면 그때 연다 |
| 비동기/로딩 상태 | **배제** — FAB를 누르면 보통 즉시 다음 화면/시트가 열린다. 그 목적지 자체의 비동기 상태는 그 목적지(Dialog/Sheet)의 session이 소유할 몫이지 FAB의 몫이 아니다 |
| 위치(코너) 커스터마이즈 | **배제** — 측정된 제품 요구가 없다. 기본값(화면 논리적 끝 쪽 하단)만 공개하고, 다른 코너가 필요해지면 그때 연다 |
| BottomNavigation의 `center-gap` sibling action과의 통합 | **배제** — 그쪽은 이미 별도 Button/IconButton 합성으로 해결된 문제(`docs/architecture.md`)이고, 이 계약이 그 자리를 대신 흡수하지 않는다 |

## 검증 화면

아직 없음. `planned → beta` 승격은 실제 제품 vertical slice 이후 리드가
진행한다. 유력 후보: Yajalal 마이 플레이어 목록의 "선수 추가".
