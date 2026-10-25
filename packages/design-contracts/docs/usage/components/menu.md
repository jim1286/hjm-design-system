# Menu

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-20
- 근거: [Dropdown 판정](../../dropdown.md), [Popover 경계](../../popover.md), `src/component-recipes.ts`(`menuRecipe`)
- 스토리북: `배포/컴포넌트/탐색/메뉴`

## 언제 쓰나

트리거 버튼을 누르면 뜨는 **항목 목록**에 쓴다. 더보기(⋯) 행동, 정렬 기준 고르기,
보기 옵션 켜고 끄기처럼 안정적인 id를 가진 action·단일 선택·다중 선택 목록이 여기에 속한다.
트리거·떠 있는 표면·항목 목록을 Menu 하나가 소유하므로 별도 Dropdown은 없다.

## 세 가지 표시 방식 — 개발 소스, 미게시

2026-10-20 유틸버스 더보기에서 제목·목록·닫기가 하나의 넓은 빈 표면에 떠 있어 항목 구분이 흐렸고,
그룹 목록·앵커 메뉴·하단 행동 목록을 상황별로 함께 쓰자는 사용자 결정으로 `presentation`을 추가했다.
별도 메뉴 컴포넌트 세 개가 아니라 **하나의 Menu에서 항목·권한·선택·닫힘 후 실행을 공유하는 표현 축**이다.
새 prop은 설치된 npm 버전에 있다고 가정하지 않는다. 로컬 소스 개발 또는 이 변경을 포함한 게시 버전에서 사용한다.

| `presentation` | 선택하는 상황 | 배치와 닫기 |
| --- | --- | --- |
| `grouped` | 화면 전체의 보조 행동·명확히 구분된 목록 | 중앙 패널, 연한 목록 면·행 사이 선, 분리된 닫기 버튼. 폭 상한 288, 안쪽 12, 목록–닫기 간격 8, 기본 행 높이 52 |
| `anchored` | 댓글 ⋮·항목 관리처럼 트리거 대상과의 연결이 중요 | 트리거의 논리적 끝에 맞추고 아래 공간이 부족하면 위로 배치. Native 폭 상한 280, 안쪽 8, 기본 행 높이 48. 별도 닫기 행 없이 바깥 누름·Escape/back으로 닫기 |
| `bottom` | 사진·파일·공유 등 모바일에서 아래쪽으로 접근하는 행동 목록 | 하단에서 목록 면과 닫기 버튼을 별도 표면으로 분리. 폭 상한 420, 바깥 패널 padding 0·행 좌우 12, 목록–닫기 간격 8, 기본 행 높이 56. 하단 safe area 포함 |

값은 `menuRecipe.presentations`가 소유한다(Native pt, Web CSS px/rem 대응). `density="compact"`는 기존 최소 터치 높이 44를 유지한다.
Web의 기존 앵커 메뉴 폭·충돌 해소 계약은 유지한다. Native 기본은 `grouped`, Web 기본은 `anchored`다.
일반적인 ‘더 보기’는 제목 줄을 반복하지 않는다. Native `title`은 기본 생략하며 명시한 대상 제목만 표시하고 접근성 이름은 `triggerLabel`로 유지한다.
Web의 `grouped`/`bottom`에는 지역화한 `dismissLabel`을 반드시 전달한다.

공통 화면이 상황에 맞는 기본값을 정한다. 댓글의 `commentMenu.presentation`은 양 renderer에서 `anchored`가 기본이며
제품 고유 상호작용 이유가 있을 때만 바꾼다. 유틸버스 홈은 `grouped`를 명시한다.
항목 수·로딩 상태·창 너비만으로 세 방식 사이를 자동 전환하지 않는다. 앵커형의 위치·가용 높이만 화면에 맞춰 계산한다.
폭·여백·구분선·가림막·키보드/포커스·다음 모달 실행 순서를 앱에서 재조립하지 않는다.

```tsx
// Native: 홈 보조 행동
<Menu presentation="grouped" triggerLabel={t("home.more")} dismissLabel={t("common.close")}
  items={items} onActionAfterDismiss={handleAction} />
// Native: 사진 관련 행동 목록 (사진 선택 자체의 전용 구성은 PhotoSourceSheet 우선)
<Menu presentation="bottom" triggerLabel={t("photo.actions")} dismissLabel={t("common.close")}
  items={photoActions} onActionAfterDismiss={handlePhotoAction} />
// Web: 같은 표현 축; modal 표현에는 dismissLabel이 필요하다.
<Menu presentation="grouped" label={t("home.more")} dismissLabel={t("common.close")}
  trigger={<IconButton label={t("home.more")}>⋯</IconButton>} items={items} />
// 공통 댓글 화면: 목록과 권한은 제품, 트리거와 Menu는 HJM
commentMenu={{ presentation: "anchored", label: commentMenuLabel,
  dismissLabel: t("common.close"), items: allowedItems, onAction: handleCommentAction }}
```

### 관리 메뉴의 짧은 헤더 — 개발 소스, 미게시 (2026-10-25)

번뚝의 긴 분기 이력·반복 설명이 하단 메뉴를 과도하게 키운 사용자 관측에 따라,
양 renderer에 `title`, `description`, `dismissPlacement="header" | "footer" | "none"`를 제공한다.
2026-10-25 사용자의 관리 메뉴 상단 제거 요청으로 `none`을 추가했다. 제목·보조 설명을 생략하고 `none`을 지정하면 목록만 표시하며 바깥 누름·Escape/back으로 닫는다. 접근성 이름과 `dismissLabel`은 유지한다.
기본은 기존 `footer`다. `header`는 grouped/bottom에서 제목 옆에 지역화한
`dismissLabel`의 ✕를 두고 하단 닫기 버튼을 생략한다. 바깥 누름·Escape/back과
닫힌 후 실행 계약은 유지한다. `anchored`에는 헤더를 표시하지 않는다.
보조 설명은 대상 이름·현재 버전 등 짧은 맥락에 쓰며 한 줄 넘침은 말줄임한다.
분기 이력은 기록 화면, 현재 설정값은 trailing, 실행 결과가 불명확한 행동만 description으로 전달한다.
행·아이콘·본문·안전 영역과 스크롤은 기존 Menu가 소유한다.

`bottom`도 안정적인 id의 행동/선택 목록이면 Menu다. 입력 본문이 생기면 Dialog·Sheet,
확인 문구와 버튼만 필요하면 AlertDialog를 사용한다. Menu가 닫힌 후 여는 원칙은 세 표현 모두 동일하다.
실행 예제는 양 Showcase의 Menu `Grouped`·`Anchored`·`Bottom`이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 목록이 아닌 임의 콘텐츠(작은 폼, 링크 섞인 본문) | [Popover](popover.md) (Web) |
| 우클릭·키보드 메뉴 키로 포인터 위치에서 여는 메뉴 | [ContextMenu](context-menu.md) |
| 데스크톱 앱의 파일·편집·보기 가로 막대 | [Menubar](menubar.md) (Web) |
| 폼 값 하나를 고르는 입력 | [Select](select.md), [Combobox](combobox.md) |
| 하단에서 올라오는 큰 선택 화면 | [Sheet](sheet.md) |
| 명령 검색 | [CommandPalette](command-palette.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Menu` | 기본 | `@hjmds/react`, `/overlays` | `@hjmds/react-native`, `/navigation`, `/top-bar` |
| `MorphingMenu` | action 전용 morph 표현(optional peer `bloom-menu` 0.1.0 필요) | `/menu-morph` | — |

## 최소 사용 예

```tsx
// Web
import { IconButton } from "@hjmds/react/actions";
import { Menu } from "@hjmds/react/overlays";

<Menu
  label={t("post.more")}
  trigger={<IconButton label={t("post.more")}>⋯</IconButton>}
  items={[
    { id: "edit", label: t("post.edit") },
    { id: "delete", label: t("post.delete"), tone: "danger" },
  ]}
  onActionAfterDismiss={(id) => handle(id)}
/>
```

```tsx
// Native
import { Menu } from "@hjmds/react-native/navigation";

<Menu
  triggerLabel={t("post.more")}
  dismissLabel={t("common.close")}
  items={[
    { id: "edit", label: t("post.edit") },
    { id: "delete", label: t("post.delete"), tone: "danger" },
  ]}
  onActionAfterDismiss={(id) => handle(id)}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `presentation` | `grouped` · `anchored` · `bottom` | Web `anchored` · Native `grouped` | 위의 표현 선택 표 참조 |
| `items` · `sections` | 둘 중 정확히 하나(Native는 `source`도 가능) | 필수 | 섹션마다 `label` 또는 `accessibilityLabel`이 필요하다. 활성 항목이 하나도 없으면 `TypeError` |
| 항목 모양 | Web `{ id, label: ReactNode, textValue?, description?, leading?, trailing?, tone?, disabled? }` · Native `{ id, label: string, textValue?, description?, shortcut?, tone?, disabled? }` | — | Web `label`이 글이 아니면 `textValue` 필수(typeahead) |
| 항목 `tone` | `neutral` · `danger` | `neutral` | |
| `onAction` | Web `(id: string) => void` · Native `(value) => void \| Promise<void>` | — | 고르는 즉시. 메뉴가 닫히기 전이다 |
| `onActionAfterDismiss` | Web `(id: string) => void` · Native `(value) => void \| Promise<void>` | — | 메뉴가 실제로 닫힌 뒤 한 번. Dialog·Sheet 열기·화면 이동은 여기서 한다 |
| `open` · `defaultOpen` · `onOpenChange` | `onOpenChange: (open: boolean, detail) => void` — Web `detail = { reason }`, Native 두 번째 인자가 `reason` | 비제어 `false` | reason: Web `trigger` · `selection` · `escape` · `outside` · `tab`, Native `trigger` · `selection` · `escape` · `outside` · `programmatic`. 개발 소스의 Web 모달 닫기 버튼도 `programmatic`. 제어하면 `onOpenChange` 필수(Web) |
| 선택(Web) | `selectionMode`: `action` · `single`(`value: string \| null`, `onValueChange(value: string)`) · `multiple`(`value: ReadonlySet<string>`, `onValueChange(value: ReadonlySet<string>)`) | `action` | `defaultValue`로 비제어 |
| 선택(Native) | `selection`: `{ mode: "none" }` · `{ mode: "single", selectedKey, onSelectionChange(key \| null) }` · `{ mode: "multiple", selectedKeys: ReadonlySet, onSelectionChange(keys) }` | `{ mode: "none" }` | `defaultSelectedKey(s)`로 비제어 |
| `density` | `comfortable` · `compact` | `comfortable`(recipe) | Web은 생략하면 Provider density를 따른다 |
| `asyncState` | `{ status: "idle" }` · `{ status: "loading" \| "loadingMore" \| "empty" \| "error", message }` | `{ status: "idle" }` | `message`는 현지화(Web `ReactNode`, Native `string`) |
| `align`(Web) | `start` · `end` | `start` | RTL에서 자동 반전 |
| `layoutStyle` | 배치 전용 style 객체 | — | Web은 트리거를 감싼 흐름 안 wrapper, Native는 트리거 host. 표면(popup·Modal)은 따라 움직이지 않는다 |

## 배치

Native popover와 항목 모서리는 Provider token에서 recipe 역할을 해석한다. 선택·열림·dismiss와 action 순서는 프로필 교체로 초기화하지 않는다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 항목 높이 `comfortable` 56(`layout.rowHeight.singleLine`) · `compact` 44(`control.minTouchTarget`). Web 표면 폭 `13.75rem`~`min(24rem, 90vw)`, 높이 최대 `100dvh − 2 × spacing.md`. Native 폭은 `menuRecipe.presentations`의 상한과 가용 폭 중 작은 값, 그룹/하단 높이 최대 75%, 앵커 높이는 위·아래 가용 공간 | `menuRecipe.density`, `.hjm-menu__content`, `react-native/src/navigation.tsx` |
| 간격 | 항목 좌우 `spacing.sm` 12, leading·문구·단축키 사이 12. 섹션 제목 좌우 12 · 위아래 `spacing.xs` 8. Web: 트리거와 8(`menuRecipe.sideOffset`), 화면 가장자리 8(`collisionPadding`), 안쪽 `spacing.xs` 8(`menuRecipe.surface.padding`; 2026-10-06까지 4, 1.13.0 변경), 표면·항목 radius `radius.md` 12, 구분선 위아래 4 · 좌우 8. Native: safe area 바깥 여백 `spacing.md` 16, 표현별 안쪽 여백은 `presentations.padding`, 영역 사이 `spacing.xs` 8, radius `radius.lg` 16 | `collectionItemContract`, `menuRecipe.sectionLabel`·`surface`, `.hjm-menu__*`, `useAnchoredPopup` |
| 순서·정렬 | 일반 행동을 위에, `danger` 행동은 맨 아래. Web `align="start"`(기본)는 트리거 시작 끝, `end`는 끝 끝에 맞춘다(행 끝 ⋯은 `end`). Native는 선택한 presentation에 따라 항목 → 분리된 닫기(앵커형은 생략). 명시한 대상 제목만 앞에 표시 | `menuRecipe`, `src/overlays.tsx` |
| 고정·스크롤 | Web: 트리거에 붙는 portal(z-index `layer.dropdown` 400), 아래가 모자라면 위로 뒤집고 가로는 화면 안으로 민다. 넘치면 표면 안 스크롤. Native: `Modal` 안의 중앙/트리거 옆/하단 배치. 가림막을 누르면 닫히며 항목 목록만 스크롤. Web 모달 표현도 HJM 공통 포커스 격리·배경 스크롤 잠금을 사용 | `useAnchoredPopup`, `react-native/src/navigation.tsx`(`Menu`) |
| 좁은 폭·큰 글자 | Web 폭 상한 `90vw`, 항목 문구는 줄바꿈된다. Native 높이 상한 75%를 넘으면 목록이 스크롤된다. 짧은 목록은 내용 높이만 사용한다(`flexGrow: 0`) | `.hjm-menu__content`, `maxHeight: "75%"` |

```text
그룹형 (중앙)             앵커형 (트리거 옆)        하단형 (하단)
╭─────────────────╮       행              ⋮       ╭─────────────────╮
│ ╭─────────────╮ │             ╭────────────╮    │ 저장            │
│ │ 최근 사용    │ │             │ 신고       │    │─────────────────│
│ │─────────────│ │             │────────────│    │ 공유            │
│ │ 설정        │ │             │ 차단       │    ╰─────────────────╯
│ ╰─────────────╯ │             ╰────────────╯    ╭─────────────────╮
│ [     닫기    ] │                               │      닫기       │
╰─────────────────╯                               ╰─────────────────╯
```


## 꼭 지킬 것

- 항목 id는 비어 있지 않고 유일해야 하며, 활성 항목이 하나 이상 있어야 한다. 어기면 렌더 중 던진다.
- Web에서 `label`이 문자열이 아닌 항목은 typeahead용 `textValue`를 준다. 없으면 던진다.
- 다른 모달·시트·화면 이동을 여는 action은 `onActionAfterDismiss`로 실행한다. 이 콜백은 메뉴가 실제로 닫힌 뒤(Native는 Modal teardown 뒤)에만 실행되므로 두 표면이 겹치지 않는다.
- Native에서 teardown 완료 전에 재열거나 owner를 교체하면 이전에 대기하던 after-dismiss action은 폐기된다. 비동기 action의 요청 오류는 제품 콜백 안에서 처리하고 제품 오류 UI에 연결한다. 메뉴는 Promise 실패에 따른 오류 화면이나 자동 재시도를 만들지 않는다.
- 항목 문구·아이콘(제품 소유)은 i18n 키와 제품 아이콘으로 넣고, 색은 `tone`으로만 바꾼다.
- `MorphingMenu`는 action 전용이다. 선택·async가 필요하면 `Menu`를 쓴다. reduce-motion·RTL에서는 스스로 `Menu`로 돌아간다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 트리거 | `trigger`(element 필수), `label`은 메뉴 이름 | `triggerLabel` 필수, `trigger`/`renderTrigger` 선택 |
| 닫기 버튼 이름 | 앵커형은 없음, 그룹/하단형은 `dismissLabel` 필수 | `dismissLabel` 필수 (앵커형은 바깥 닫기의 접근성 이름) |
| 선택 | `selectionMode="single"\|"multiple"` + `value`/`onValueChange` | `selection={{ mode, selectedKey(s), onSelectionChange }}` |
| 선택 후 실행 | 없음 | `onSelectionAfterDismiss` |
| 상태 | `disabled` | `disabled`, `readOnly`(+`readOnlyLabel`), `busy`, `onRetry`/`retryLabel` |
| 표면 | 앵커형 `AnchoredPortal`, 그룹/하단형 `HjmPortal` (`portalContainer`) | 세 표현 모두 하나의 `Modal` |
| 항목 label | `ReactNode`(+`textValue`) | `string` |
| 배치 | `className`, `layoutStyle` | `layoutStyle`(`style`은 제거된 속성) |

과거 근거(2026-10-20의 세 표현 도입 전): 2026-10-18 스핀트 댓글 메뉴 사진에서 단일 행동에도 넓은 폭과 빈 공간이 생겼다. Native 메뉴 폭을 기존 recipe 상한에 맞추고 목록의 기본 확장을 없앴으며, 닫기는 조용한 행동으로 분리했다. 사용자 후속 요청으로 닫기 위 구분선은 제거했다.

## 전사 개발 적용 선택 — 2026-10-20

같은 날 사용자가 모든 앱의 메뉴를 상황별 세 표현으로 명시해 달라고 요청했다. 화면/구성은 기본값에
우연히 기대지 않고 사용 의도를 정한다. 제품 adapter는 `presentation`을 전달할 수 있어야 하며,
번뚝 `AppMenu`는 사용처마다 명시하도록 요구한다.

| 사용 의도 | 선택 | 적용 |
| --- | --- | --- |
| 화면 전체의 보조 행동 | `grouped` | 유틸버스 홈, 번뚝 실행 화면의 방문자 행동(앱·웹) |
| 모바일에서 작품을 관리하는 묶음 작업 | `bottom` | 번뚝 실행 화면의 소유자 관리. 웹은 같은 작업을 중앙 `grouped`로 표시 |
| 특정 콘텐츠·작성자·댓글·메모에 붙는 행동 | `anchored` | 번뚝 피드/이야기/프로필/아이디어 메시지/댓글, 유틸버스 메모/댓글, 스핀트 댓글 |
| 옆의 제어를 바꾸는 선택 | `anchored` | HJM SplitAction·ModeAction의 ChoiceMenu, SearchScreen 결과 정렬 |

명시적인 제품/플랫폼 선택이며 항목 수나 화면 폭으로 표현을 자동 전환하지 않는다. 메뉴가 닫힌 뒤의
이동·신고·차단·삭제 확인·시스템 공유 순서를 세 표현 모두 유지한다. 제품에서 표면 색을 따로 덮어
메뉴 전용 모양을 만들지 않고 HJM Provider 테마와 공개 아이콘 슬롯을 사용한다.

**복합 구성은 보존한다.** ChatMessage의 길게 누르기는 반응 선택·원문/사진 미리보기·메시지 행동이
한 묶음인 전용 구성이다. 일반 Menu로 치환하면 반응과 앨범 조작이 사라지므로 기존 hold 구성과 그
앵커 배치를 유지한다. PhotoSourceSheet·미디어 선택·언어/팀 선택·입력/신고 시트·확인창·시스템 공유창도
각각의 전용 계약을 따른다. 탭·내비게이션의 ‘메뉴’ 아이콘과 본문 ‘더 보기’ 펼침은 행동 메뉴가 아니다.
현재 등록 앱의 경로별 조사·검증 범위는 포트폴리오 `docs/design/STANDARD_ADOPTION.md`의 메뉴 절을 따른다.
새 `presentation` 축과 소비자 코드는 개발 소스이며 게시/버전 상승/운영 배포를 수행하지 않는다.
