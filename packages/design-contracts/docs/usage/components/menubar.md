# Menubar

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Menubar](../../menubar.md), `src/menubar.ts`(`menubarRecipe`)
- 스토리북: `배포/컴포넌트/탐색/메뉴 막대`

## 언제 쓰나

데스크톱 Web 앱 상단에 항상 같은 자리에 있는 가로 메뉴 막대(파일·편집·보기)에 쓴다.
막대 전체가 tab stop 하나이고, 한 번에 메뉴 하나만 열리며, 열린 상태에서 ←/→로 옆 메뉴로 넘어간다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 버튼 하나에 붙는 action 목록 | [Menu](menu.md) |
| 포인터 위치에서 여는 메뉴 | [ContextMenu](context-menu.md) |
| 화면(페이지)을 바꾸는 상단 탐색 | [Tabs](tabs.md), [TopBar](top-bar.md) |
| 모바일·Native 앱 | 없음. 앱 바는 OS 소유이고 Native renderer가 없다 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Menubar` | 기본 | `@hjmds/react`, `/menubar` | — |

## 최소 사용 예

```tsx
// Web
import { Menubar } from "@hjmds/react/menubar";

<Menubar
  descriptor={{
    accessibilityLabel: t("editor.menubar"),
    menus: [
      { id: "file", label: t("menu.file"), items: [
        { id: "save", label: t("menu.save"), textValue: t("menu.save"), shortcut: "⌘S" },
      ] },
      { id: "edit", label: t("menu.edit"), items: [
        { id: "undo", label: t("menu.undo"), textValue: t("menu.undo") },
      ] },
    ],
  }}
  onAction={(itemId, menuId) => run(menuId, itemId)}
/>
```

Native 예는 없다(renderer 없음).

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor` | `{ accessibilityLabel: string; menus: readonly { id, label: string, items, disabled? }[] }` | 필수 | 타입 `MenubarDescriptor`(`@hjmds/design-contracts/components/menubar`) |
| 항목 | `{ id, label: string, textValue: string, description?, shortcut?, tone?, disabled? }`(`MenuItemDescriptor`) | — | `textValue` 필수. `shortcut`은 표시 문구일 뿐 키를 등록하지 않는다 |
| `onAction` | `(id: Key, menuId: MenuKey) => void` | 필수 | 항목 id가 먼저, 메뉴 id가 두 번째 |
| `openMenuId` · `onOpenMenuIdChange` | `MenuKey \| null` · `(id: MenuKey \| null) => void` | — | 제어형 열린 메뉴 |
| `defaultOpenMenuId` | `MenuKey \| null` | `null`(닫힘) | 비제어형 열린 메뉴 |
| 메뉴 `disabled` | `boolean` | `false` | 키보드 이동에서 건너뛴다 |
| `className` · `layoutStyle` | 문자열 · 배치 전용 style 객체 | — | 막대 루트 배치. 색·높이 변수는 덮이지 않는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 막대 높이 최소 44(`control.minTouchTarget`). 라벨 높이 44 이상, radius `radius.sm` 8. 패널 폭 `13.75rem`~`min(24rem, 90vw)`. 항목 높이 44 이상 | `menubarRecipe`, `.hjm-menubar*` |
| 간격 | 막대 좌우 `spacing.xs` 8, 라벨 사이 `spacing.xxs` 4, 라벨 좌우 `spacing.sm` 12. 패널 안쪽 4, radius `radius.md` 12. 항목 위아래 8 · 좌우 12, 단축키와 12 | `menubarRecipe`, `.hjm-menubar__panel`·`__item` |
| 순서·정렬 | 메뉴는 데스크톱 관례(파일 → 편집 → 보기 → … → 도움말). 패널은 해당 라벨 바로 아래 시작 쪽에 붙는다. 단축키 문구는 항목 끝(`space-between`) | `.hjm-menubar__panel` |
| 고정·스크롤 | 화면 맨 위(앱 제목·TopBar 아래나 같은 줄 시작 쪽). sticky 여부는 놓는 레이아웃이 정한다. 패널은 Menu와 같은 portal·fixed 배치(`layer.dropdown` 400)로 공간이 부족하면 뒤집고 화면 안으로 민다. 모달 안에서는 소유 모달 + 1이다 | `useAnchoredPopup`, `.hjm-menubar__panel` |
| 좁은 폭·큰 글자 | 폭이 모자라면 라벨이 다음 줄로 감긴다(`flex-wrap`). 모바일 폭은 대상이 아니다 | `.hjm-menubar` |

```text
┌ 화면 (Web, 데스크톱) ─────────────────────────────────────┐
│ [파일] [편집] [보기]                         ← 막대 ≥44   │
│  └┬───────────────────┐                                   │
│   │ 저장          ⌘S  │  ← 패널: 라벨 바로 아래, 시작 정렬 │
│   │ 다른 이름…   ⇧⌘S  │     13.75rem ~ 24rem               │
│   └───────────────────┘                                   │
│ 본문(스크롤)                                              │
└───────────────────────────────────────────────────────────┘
```

## 꼭 지킬 것

- `descriptor.accessibilityLabel`, 각 메뉴 `id`·`label`은 비어 있으면 안 되고, 메뉴마다 항목이 하나 이상 있어야 한다. 어기면 던진다.
- 항목 `textValue`는 계약 타입상 필수다. 지역화한 문구를 그대로 넣는다.
- 메뉴 구성과 단축키 문구는 제품 소유다. 단축키 자체의 키 바인딩은 Menubar가 등록하지 않으므로 제품이 따로 연결한다.
- `className`·`layoutStyle`은 배치에만 쓴다. 색·높이를 덮지 않는다.

2026-10-07 Web 전체 회귀 중 키보드로 옮긴 항목이 첫 항목으로 돌아가는 문제를 재현했다.
미게시(1.14.0 이후) 수정은 패널의 늦은 mouseenter가 키보드 선택을 덮지 않고 실제 마우스 이동에
맞춰 활성 항목을 바꾼다. 메뉴 막대 라벨의 hover 전환·클릭·비활성 건너뛰기는 유지한다.
고정 지연이나 키보드 검사 재시도로 가리는 대신 입력 의도를 구분했다.
[검증 기록](../../../../../docs/qa/2026-10-07-command-records.md).

### 프로필 모서리·제목 소비

2026-10-07 소비 감사에서 Web 라벨의 숫자 recipe 모서리가 프로필을 우회했다. 기존 `radius.sm` 역할을 가까운 Provider의 CSS 변수로 읽고 변수 없는 독립 사용은 recipe 8을 유지한다. 열린 메뉴·roving focus·비활성 건너뛰기·행동과 Web 전용 범위는 바꾸지 않는다.

프로필 연결은 1.15.0 이후 미게시 변경이며, 기본 배포 계약과 실제 Native 기기 검증은 구분한다.
