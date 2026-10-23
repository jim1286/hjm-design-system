# List

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: recipe `listRecipe`(`src/component-recipes.ts`), TaskList 계약: [Task list](../../task-list.md)
- 스토리북: `배포/컴포넌트/데이터 표시/목록` · `배포/컴포넌트/입력/할 일 목록`

## 언제 쓰나

이미 다 불러온, 개수가 많지 않은 행들을 이름 있는 목록 하나로 묶을 때 쓴다. List는 목록 의미
(`role="list"`)와 행 사이 구분선·묶음 배경만 소유하고, 각 행의 모양은 안에 넣는 [ListRow](list-row.md)가 정한다.
체크로 완료를 표시하는 할 일 목록은 `TaskList`를 쓴다.

### 목록 계열 고르기

| 화면 형태 | 쓸 것 |
| --- | --- |
| 수십 개 이하의 행을 한 번에 그림(설정, 계정 메뉴, 검색 결과 한 페이지) | `List` + `ListRow` |
| 유한 카드 여러 장의 독립 입력/행동을 함께 보여주는 가로 탐색 | `CollectionRail` (1.16.0 추가·실험, 아래 가로 배치 지침) |
| 행 한 줄의 제목·설명·앞뒤 슬롯 | [ListRow](list-row.md) |
| 높이가 고정된 행 수백~수천 개를 창 안에서 스크롤 | [VirtualList](virtual-list.md) |
| 이어지는 목록의 다음 페이지 요청 footer | [LoadMore](load-more.md) (List·VirtualList 아래에 둔다) |

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 행이 많아 한 번에 그리면 느림 | [VirtualList](virtual-list.md) |
| 열이 있는 표 | [DataTable](data-table.md) |
| 높이가 다른 카드 격자 | [Masonry](masonry.md), [Grid](grid.md) |
| 이름·값 쌍 나열 | [DescriptionList](description-list.md) |
| 여러 항목을 골라 확정 | [CheckboxGroup](checkbox-group.md) |
| 순서 바꾸기 | [SortableCollection](sortable-collection.md) |
| 시간순 사건 | [Timeline](timeline.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ListSeparator` | 동반 — 가상화 host의 장식 선(checkout·미게시) | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |
| `List` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |
| `TaskList` | 확장 — 완료 체크 목록(optional) | `/task-list` | `/task-list` |
| `CollectionRail` | 동반·대안 — 독립 행동을 가진 유한 가로 목록([구성 지침](../compositions/collection-detail.md)) | `/collection-rail` | `/collection-rail` |

`TaskList`는 granular subpath로만 import 된다. 추가 peer는 없다. 순서 바꾸기를 합성하면 SortableCollection의 peer가 필요하다.

## 최소 사용 예

```tsx
// Web
import { List, ListRow } from "@hjmds/react/display";

<List label={t("settings.account")} appearance="grouped">
  <ListRow key="email" title={t("settings.email")} description={email} href="/settings/email" />
  <ListRow key="logout" title={t("settings.logout")} onClick={logout} />
</List>
```

```tsx
// Native
import { TaskList } from "@hjmds/react-native/task-list";
import { Text } from "@hjmds/react-native/primitives";

<TaskList label={t("todo.today")} items={tasks}
  onCompletedChange={(id, completed) => saveTask(id, completed)}
  emptyContent={<Text tone="muted">{t("todo.empty")}</Text>} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | 현지화 문자열(필수) | — | 목록의 접근성 이름. 비면 `TypeError` |
| `separator` | `indented` · `full` · `content` · `none` | `indented` | `indented`는 위 행의 글자 열에서 시작(leading이 있으면 52, 없으면 0) |
| `appearance` | `plain` · `grouped` | `plain` | `grouped`는 배경과 둥근 모서리로 한 덩어리 |
| `layoutStyle` | 배치 key만 | — | 목록 루트 배치. Native `style`은 제거된 속성 — `layoutStyle`, 모양은 `appearance`·`separator` |
| TaskList `items` | `readonly TaskItem[]` — `{ id, label, completed, description?, disabled? }` | — | `id`·`label`이 비거나 `id`가 중복되거나 `completed`가 boolean이 아니면 `TypeError` |
| TaskList `onCompletedChange` | `(id: string, completed: boolean) => void` | — | 필수. 체크 하나마다 한 번. 목록 순서·저장은 제품이 정한다 |
| TaskList `disabled` | `true` · `false` | `false` | 전체 체크박스를 끈다 |
| TaskList `itemPresentation` | `plain` · `card` | Checkbox 기본값(`card`) | 기존 표면 안의 항목은 `plain`으로 중복 테두리를 피한다. 행·체크·별도 행동 배치는 TaskList가 유지한다(checkout 변경·미게시). |
| TaskList `renderItemAction` | `({ item, disabled }) => ReactNode` | — | 체크 아래 별도 행동. disabled는 전체/항목 잠금의 합이며 제품 버튼에 전달한다. 간격 spacing.sm 12, 체크 안에 중첩하지 않음 |
| TaskList `emptyContent` | ReactNode | — | `items`가 비면 `List` 안에 그린다 |
| TaskList `renderCollection` | `(context: { items, renderItem: (item: TaskItem) => ReactNode }) => ReactNode` | — | SortableCollection을 합성할 수 있다. 이때 목록 루트는 제품이 그린다 |
| TaskList `layoutStyle`(Web) | 배치 key만 | — | List 루트 배치. `renderCollection`을 쓰면 무시되고 제품 루트를 배치한다. Native TaskList는 `layoutStyle`이 없다 |

- List 자체에는 이벤트 콜백이 없다. 행의 누름은 각 [ListRow](list-row.md)가 받는다.

2026-10-19 Utilverse 체크리스트는 단순한 체크 행을 유지하려고 항목·삭제 버튼 배치를 제품에서 재조립하고 있었다. `TaskList itemPresentation="plain"`과 기존 `renderItemAction`으로 연결한다. Web/Native 모두 같은 Checkbox 표현 옵션을 전달하며 생략한 소비자의 모양·완료 콜백은 유지한다. 기존 양쪽 TaskList 실행 예제에서 단순 행과 독립 삭제 행동을 함께 보여준다.

## 배치

Native `grouped` 프레임은 Provider의 `tokens.radius.lg`를 읽는다. plain 목록과 separator 의미는 변하지 않는다.

2026-10-19 오늘야구 순위 행은 공개 `leadingStyle`로 순위+사진 슬롯을 넓혔지만 Native 구분선은 기본 40+12만 사용해 사진 아래에서 시작했다. Native는 앞쪽 프레임의 실제 layout 폭+recipe gap을 항목에 전달해 구분선을 글자 열에 맞춘다(checkout 변경·미게시). 기본 40폭은 여전히52이며 leading 없는 행은0이다. RTL은 논리적 시작 쪽에 적용하고 `full`/`none`은 변하지 않는다. Web은 고정된 기본 leading 프레임을 사용하므로 기존 CSS를 유지한다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 화면 본문 폭을 채우는 세로 묶음이다. `plain`은 자르지 않으므로 행 표면이 부모 여백 쪽으로 8씩 넓어진다(행 글자는 목록 콘텐츠 가장자리). `grouped`는 배경 `--hjm-color-bg`와 모서리 `radius.lg` 16으로 한 덩어리가 되고 그 모양으로 자르므로, 좌우 안쪽 여백 `listRecipe.grouped.paddingInline`(= `listRowRecipe.surfaceBleed` 8)을 두어 행 표면이 잘리지 않고 행 글자는 이전처럼 덩어리 끝에서 8 안쪽에 온다 | `design-contracts/src/component-recipes.ts`(`listRecipe`), `react/src/styles.css`(`.hjm-list`), `react-native/src/data-display.tsx`(List) |
| 간격 | 행 사이 간격은 없고 구분선 1px(`--hjm-color-border`)만 들어간다. 구분선 위치는 목록 콘텐츠 가장자리(= leading 없는 행의 글자 시작) 기준이고, 각 구분선은 바로 위 행에 속한다(iOS 셀 구분선과 같다). `indented`는 위 행의 글자 열에서 시작한다: leading이 있으면 `leadingInsetStart` 52(leading 40 + `spacing.sm` 12), 없으면 `insetStart` 0. 끝은 행의 trailing 끝과 같은 콘텐츠 가장자리 0이다. `full`은 위 행과 무관하게 시작·끝 모두 −8로 행 표면 폭과 같다(`listRecipe.separators`, 두 플랫폼, Web `--hjm-list-separator-*`). 위 행의 leading 여부는 ListRow가 알린다: Web은 행 루트의 `data-leading`, Native는 List 항목 context. 덩어리 바깥 여백·섹션 사이 간격은 감싸는 Stack이 준다(페이지 좌우 여백은 `layout.pagePadding`, 섹션 간격은 `layout.sectionGap` = `spacing.xl` 24) | `design-contracts/src/component-recipes.ts`(`listRecipe`), `design-contracts/src/foundations.ts`(`layout`), `react/src/styles.css`(`.hjm-list`), `react-native/src/data-display.tsx`(List) |
| 순서·정렬 | 다음 페이지 요청은 목록 바로 아래에 [LoadMore](load-more.md)를 둔다 | — |
| 고정·스크롤 | List 자체는 스크롤하지 않는다. 화면 스크롤 안에 둔다 | `react-native/src/data-display.tsx`(List) |
| 좁은 폭·큰 글자 | — | — |

```text
┌─ List grouped (radius.lg 16, --hjm-color-bg) ─────────┐
│ ListRow                                          │
│      ──────────────────────────────────────────  │ ← indented 구분선(위 행에 leading이 있으면 글자 열 52, 없으면 0)
│ ListRow                                          │
│      ──────────────────────────────────────────  │
│ ListRow                                          │
└──────────────────────────────────────────────────┘
[ LoadMore ]
```

### CollectionRail 가로 배치

새 `CollectionRail`은 1.16.0 추가 실험 companion이다. 기존 List의 배포/호환 계약은 유지한다.

2026-10-18 미게시 타입 보완: Web/Native의 `CollectionRailProps<Item>`은 `Item extends CollectionRailItem`의 제품 필드를 `renderItem(item)`까지 보존한다. 항목은 `id`·`label`을 계속 제공하며 추가 데이터는 제품 소유다. 기존 타입이 추가 필드를 지워 소비 앱이 ID 역조회나 type assertion을 해야 하던 번뚝 추천 카드 이관에서 확인했다. 스크롤·측정·안정 ID 계약은 바뀌지 않는다.

#### 언제 쓰나

이미 불러온 유한 카드/자료를 여러 개 함께 읽고 가로로 탐색할 때 쓴다. 독립 입력·버튼·링크는 계속 접근 가능하며
스크롤 anchor는 선택 값과 다르다. 모든 항목을 그리는 List의 companion이며 큰 데이터의 가상화는 제공하지 않는다.

#### 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 한 패널만 선택·표시하고 다른 패널은 숨김 | [Carousel](carousel.md) |
| 세로 행과 구분선 | [List](list.md)·[ListRow](list-row.md) |
| 수백~수천 데이터 | [VirtualList](virtual-list.md) 또는 별도 가상화 계약 |
| 드래그로 순서를 확정 | [SortableCollection](sortable-collection.md) |

#### 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `CollectionRail` | List companion — 유한 가로 배치/탐색 | `@hjmds/react/collection-rail` | `@hjmds/react-native/collection-rail` |

`CollectionRailItem`·geometry/resolver는 `@hjmds/design-contracts/collection-rail`. 신규 granular entry만 사용하고 추가 peer/root import는 없다.

#### 최소 사용 예

```tsx
import { CollectionRail } from "@hjmds/react/collection-rail";
// Native: @hjmds/react-native/collection-rail
<CollectionRail label={t("records.title")} items={records}
  labels={{ previous: t("records.previous"), next: t("records.next"), navigation: t("records.navigation") }}
  renderItem={item => <RecordCard item={item} />} emptyContent={<EmptyRecords />} />
```

#### 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | string | 필수 | 현지화된 목록 이름 |
| `items` | `{id,label}[]` | 필수 | 안정·고유·빈 값 아닌 ID/label, empty 허용 |
| `renderItem` | `(item) => ReactNode` | 필수 | 버튼·입력·카드는 기존 공개 API 사용 |
| `labels` | previous/next/navigation string | 필수 | 스크롤 행동 이름, empty 금지 |
| `showNavigation` | boolean | `true` | `false`면 이동 버튼 행과 그 여백을 제거하고 스와이프·스크롤·초점 노출을 유지한다. 2026-10-20 스핀트 요청: 터치 탐색과 중복되는 버튼 제거 |
| `density` | compact/comfortable/chip | comfortable | 최대 폭240/360/144(`layout.readingMaxWidth`의 1/3·1/2·1/5), 실제 폭에서 clamp. 간격은 `collectionRailRecipe.gapSteps`(카드 md 16, chip xs 8). `chip`은 미니 스코어보드 같은 같은 폭의 작은 칩 줄이다(미게시, 2026-10-23). 항목마다 다른 내용 폭은 지원하지 않는다 — 이전/다음·앞쪽 anchor·초점 노출이 한 항목 폭 단위로 움직이기 때문이다 |
| `defaultStartKey` | item ID | 첫 항목 | 초기 위치만. 선택/상세 값 아님 |
| `onStartKeyChange` | `(key: string|null) => void` | 생략 | 앞쪽 항목 변화 관찰; 선택 확정 callback 아님 |
| `emptyContent` | ReactNode | 생략 | 제품의 빈 목록 내용 |
| `bleed` | boolean | `false` | 1.28.1. 기본 inset ScreenLayout 본문 안에서 화면 좌우 끝까지 스크롤하고 첫·끝 항목은 본문 여백(기본 `spacing.md` 16, ChatScreen 10)에 맞춘다. viewport가 여백만큼 밖으로 나가고 같은 양을 안쪽 padding으로 되돌린다(ListRow bleed와 같은 규칙, Web `--hjm-screen-body-inline`, Native 본문 inset context). 본문 바로 아래 섹션으로 둔다 — Card·Surface 안, `body-edge`/`none` 본문, Sheet·Dialog 안에서는 넘을 여백이 0이라 움직이지 않는다 |
| `layoutStyle` | 공개 배치 key | 생략 | 루트 배치. 카드 시각 표현은 Card/Provider |

#### 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 가용 viewport 폭, item 최대240/360. viewport358일 때 item334·다음 item8px 일부 | `collectionRailRecipe.itemMaxWidth/edgeHint`, `layout.readingMaxWidth`720/`spacing.xl`24 |
| 간격 | item 간16, controls 위/사이12, track 상하8 | `spacing.md`16, `spacing.sm`12, `spacing.xs`8 |
| 순서·정렬 | items 데이터 순서와 stable key 유지; controls 끝쪽. RTL은 논리 방향 번역 | resolver 및 renderer의 명시적 direction |
| 고정·스크롤 | viewport만 실제 가로 scroll, controls는 밖. 끝에서 멈추고 자동 이동 없음 | 공통 maxOffset·target resolver |
| 좁은 폭·큰 글자 | 기본 글자의 좁은 폭에서 실제 측정으로 카드 폭을 줄임. 최대 글자 조건은 제외 | 2026-10-07 사용자 범위, root AGENTS.md |

#### 화면 끝까지 닿는 가로 목록(`bleed`)

```text
│←16→│ 제목(본문 여백)            │
│[카드1][카드2][카드3][카…  ← 스크롤하면 화면 끝까지, 처음·끝 카드는 16 여백선
```

한 섹션만 화면 끝까지 스크롤하려고 화면 전체를 `contentInset="body-edge"`로 바꾸고 섹션마다 `Container gutter`를 다시 주지 않는다(spint 홈 "더 보기" 2026-10-17). 기본 inset을 두고 그 섹션의 CollectionRail에 `bleed`를 준다.
`scroll="content"`에서 제품 목록(FlatList·스크롤 `div`)이 본문을 스크롤하면 그 viewport가 여백 안에서 rail을 자른다. 그 목록에 `useScreenBodyScrollRoom()`(`/screens`, Web·Native 같은 이름)을 준다 — Native `style`·`contentContainerStyle`, Web `style`. viewport는 화면 끝까지, 내용은 여백선에 그대로 남고, 안의 `bleed` rail이 끝까지 스크롤한다.

```tsx
// Native: spint 홈처럼 FlatList가 본문을 스크롤하는 화면
const room = useScreenBodyScrollRoom();
<ScreenLayout title={t("hot.title")} scroll="content">
  <FlatList style={[{ flex: 1 }, room.style]} contentContainerStyle={room.contentContainerStyle} data={rows} renderItem={renderCard}
    ListHeaderComponent={<CollectionRail bleed label={t("more.title")} items={more} labels={railLabels} renderItem={renderTile} />} />
</ScreenLayout>
```

#### 꼭 지킬 것

같은 항목에 안정 ID를 쓰고 테마/폭을 subtree key로 두지 않는다. 카드 전체를 버튼으로 만들어 입력/상세 버튼을 중첩하지 않는다.
초점 카드 노출은 선택을 확정하지 않는다. 서버 조회·선택·권한·초안·상세 콘텐츠는 제품이 소유한다.
앱은 Showcase를 import하지 않는다. 설치한 게시 버전의 entry가 있는지 확인한 뒤 사용한다.

#### 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 스크롤 | clientWidth·ResizeObserver·negative RTL scrollLeft | onLayout·LTR ScrollView 물리 offset·RTL row placement |
| 키보드 | viewport/controls의 방향·Home/End, input 키 유지 | 플랫폼 ScrollView·자식 입력·명시적 previous/next; 실제 OS 검수 필요 |
| 부분 노출 | 모든 listitem mounted·inert 아님, 초점 시 최소 노출 | removeClippedSubviews=false, 자식 접근성 유지, focus 노출 |
| 끝 행동 | aria-disabled로 끝에서도 호출 행동 초점 유지 | 기존 Button disabled 상태 |


## 꼭 지킬 것

- 자식 하나가 행 하나다. 자식마다 안정된 `key`를 준다(없으면 순서 index로 key를 만든다).
- 구분선을 행에 직접 그리지 않는다. `separator`로 정한다.
- `plain` 목록은 좌우 여백이 8 이상인 부모(화면 본문, Card·Sheet 본문 등) 안에 둔다. 여백 0인 상자에 두면 행 표면이 잘리거나 Web에 가로 스크롤이 생긴다.
- TaskList는 체크해도 순서를 바꾸거나 지우지 않는다. 저장·실패·되돌리기는 제품이 `onCompletedChange`에서 처리한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 구조 | `role="list"` + 자식마다 `role="listitem"` | `accessibilityRole="list"` |
| 구분선 | CSS(`data-separator`, 다음 항목 `::before`, 위 행 `data-leading`은 `:has()`로 읽음) | 행 사이 1px `View`(위 행 ListRow가 context로 leading 여부를 알림) |
| 배치 | `layoutStyle`(+ `className`) | `layoutStyle`(`style`은 제거된 속성) |

2026-10-07 Utilverse 항목 삭제 채택을 위해 `renderItemAction`을 추가했다. 체크와 삭제의 초점·누름을 분리하고 큰 글자 라벨 폭을 보존하도록 행동을 다음 줄에 둔다. `renderCollection`의 `renderItem`에도 포함된다. 삭제 저장·실패·되돌리기는 제품이 처리한다.

항목 삭제 뒤에는 제품이 다음 항목의 독립 행동(없으면 이전 항목, 목록이 비면 후속 행동)으로 초점을 복구한다. Web Showcase는 ref와 커밋 후 focus 예시를 제공한다. Native 접근성 초점 검증은 아직 남아 있다.

## 근거
- 구분선 시작은 위 행의 글자 열: 2026-10-17 사용자 보고(leading 없는 행에서 구분선이 중간에서 잘린 것처럼 보임). 고정 시작 52가 leading 없는 행에도 적용돼 Web 402 대시보드 기록 목록에서 행 글자 16 / 구분선 68~394(콘텐츠 끝 386보다 8 더 나감)였다. 위 행의 leading 여부로 시작을 정하고 끝을 콘텐츠 가장자리로 맞춘 뒤 글자 16 / 구분선 16~386, leading 있는 목록은 글자 85 / 구분선 85~369(콘텐츠 끝 369), RTL도 대칭으로 측정됐다.
- 구분선·grouped 여백: 2026-10-17 사용자 결정(행 글자는 여백 선 16, 표면만 바깥으로 8). 행 콘텐츠 상자가 목록 콘텐츠 가장자리로 옮겨져 `indented` 시작이 60 → 52가 되어도 화면에서 보이는 위치(글자 시작)는 같다. 기본 화면에서 행 글자가 24, 섹션 제목이 16이던 실측은 [ListRow 근거](list-row.md#근거)에 있다. 이전 plain 목록의 `overflow: hidden`은 grouped 모서리만을 위한 것이라 grouped로 옮겼다.

## 가변 높이 가상 목록의 구분선 (checkout·미게시)

2026-10-20 번뚝 가변 높이 FlatList는 공개 VirtualList의 고정 rowHeight 계약으로 바꿀 수 없어
자체 선을 그리고 있었다. `ListSeparator`는 List와 같은 recipe/테마의 장식 선만 제공한다.
가상화·키보드·측정은 기존 host가 유지하고, 전체 목록의 의미/이름과 행은 해당 host가 제공한다.
유한 목록은 List를 쓰며 각 행에 ListSeparator를 직접 반복하지 않는다.

- `separator`: `content`(기본, 이미 자체 padding이 있는 행의 본문 양 끝), `full`(ListRow 표면까지 확장),
  `indented`(글자 열), `none`(아무것도 그리지 않음). List에도 content를 선택할 수 있다.
- `leading`: 기본 false. indented에서만 ListRow 기본 leading 폭+간격을 예약한다.
  List 내부의 사용자 지정 leading 실측은 기존 List가 계속 처리한다.
- `layoutStyle`: 바깥 host에 맞추는 배치 전용 속성. 색/두께는 recipe가 소유한다.
- 선은 장식이며 별도 초점·접근성 항목·클릭 행동을 만들지 않는다. 마지막 행 뒤에는 host가 생략한다.

```tsx
import { ListSeparator } from "@hjmds/react-native/data-display";

<FlatList data={rows} keyExtractor={row => row.id} renderItem={renderRow}
  ItemSeparatorComponent={ListSeparator} />
```

양 renderer의 기존 List 스토리 `독립 구분선`은 공개 API의 세 가지 경계를 보여준다.
Web 가상 host도 같은 ListSeparator를 행 사이에 연결하며, 고정 높이를 쓰는 host는 선의 두께를 행 높이에 포함한다.
