# 펼침과 메뉴

- 단계: 구성
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Collapsible](../../collapsible.md), [ContextMenu](../../context-menu.md), [Menubar](../../menubar.md), `showcase/web/src/patterns/Disclosure.stories.tsx`, `src/collapsible.ts`, `src/menubar.ts`, `packages/react/src/styles.css`(`.hjm-collapsible`, `.hjm-context-menu`, `.hjm-menubar`)
- 스토리북: `배포/구성/탐색과 이동/펼침과 메뉴`

## 언제 쓰나

Web에서 내용을 숨겼다 펼치거나(Collapsible), 대상에 붙은 작업 메뉴를 우클릭·키보드로 열거나(ContextMenu),
데스크톱 앱처럼 상단 메뉴 막대를 두는(Menubar) 세 방식을 각각 보여 주는 모음이다. 스토리 셋은 이어진 흐름이 아니다.

| 필요 | 고를 것 | 스토리 |
| --- | --- | --- |
| 이웃 없는 단독 펼침 하나(배송 정보 더 보기) | `Collapsible` | 단일 펼침 |
| 펼침 여러 개가 한 묶음, "하나만 열림"·구분선·그룹 키보드 이동이 필요 | [Accordion](../components/accordion.md) | — |
| 목록 항목·카드에 붙는 보조 작업(이름 바꾸기·삭제) | `ContextMenu` | 포인터 메뉴 |
| 버튼 하나로 여는 작업 목록 | [Menu](../components/menu.md) | — |
| 문서 편집기 같은 데스크톱 Web의 파일·편집·도움말 막대 | `Menubar` | 데스크톱 메뉴 막대 |

ContextMenu로만 닿는 작업을 두지 않는다. 같은 작업을 보이는 버튼·Menu로도 제공한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Collapsible` | 트리거(문자열) + 펼침 내용. `defaultOpen` 또는 controlled | [Collapsible](../components/collapsible.md) |
| `ContextMenu` | 자식 요소를 대상으로 우클릭·길게 누르기(500ms)·Shift+F10·메뉴 키로 여는 메뉴 | [ContextMenu](../components/context-menu.md) |
| `Menubar` | 메뉴 여러 개를 가로로 둔 막대. 항목은 Menu와 같은 `MenuItemDescriptor` | [Menubar](../components/menubar.md) |
| `Notice` · `Toast` | 작업 결과·실패 알림(스토리의 Notice는 데모) | [Notice](../components/notice.md), [Toast](../components/toast.md) |
| `Text` | 키보드 사용 안내 | [Text](../components/text.md) |
| `Stack gap="md"` | 세로 흐름 | [Stack](../components/stack.md) |
| `Container` | 바깥 틀. 제품 화면이 소유한다 | [Container](../components/container.md) |

## 배치

```text
┌ 바깥 틀: 문서 스크롤 > Container (gutter 16 | 20) ──────────────────────────┐
│ 단일 펼침                               포인터 메뉴                           │
│ ┌──────────────────────────────────┐    ┌──────────────────────────────────┐ │
│ │ 배송 정보 더 보기             ▾  │    │ 우클릭하거나 Shift+F10 …  (안내) │ │
│ │   ↕ spacing.xs 8                 │    │ ┌ 대상: 2026년 9월 18일 기록 ┐   │ │
│ │ 주문 다음 날 도착합니다…         │    │ └──────────────┬─────────────┘   │ │
│ └──────────────────────────────────┘    │      ┌ 메뉴(fixed) ───────────┐  │ │
│                                         │      │ 이름 바꾸기          F2│  │ │ ← 항목 높이 44
│ 데스크톱 메뉴 막대                      │      │ 복제하기 (흐림)         │  │ │
│ ┌──────────────────────────────────┐    │      │ 삭제하기 (danger)       │  │ │ ← 파괴 행동은 맨 끝
│ │ [파일] [편집] [도움말(흐림)]     │    │      └─────────────────────────┘  │ │
│ │ ┌ 패널 ───────────────┐          │    └──────────────────────────────────┘ │
│ │ │ 새 기록         ⌘N  │          │ ← 막대 높이 44, 좌우 spacing.xs 8       │
│ │ │ 열기            ⌘O  │          │ ← 패널은 라벨 바로 아래, 시작 정렬      │
│ │ └─────────────────────┘          │                                         │
│ └──────────────────────────────────┘                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | 문서 스크롤 > `Container` | 제품 화면이 소유. 메뉴 표면은 `position: fixed`라 스크롤 컨테이너에 잘리지 않는다 | 좌우 `Container gutter`: 폭 600 미만 `compact` 16, 이상 `regular` 20([화면 여백](../tokens/layout.md)). Menubar는 편집 영역 맨 위 |
| 펼침 트리거 | `Collapsible` trigger | 펼침 내용 위, 꽉 찬 폭, 표시(▸/▾)는 끝 | 최소 높이 `control.minTouchTarget` 44, 위아래 `spacing.xs` 8, 글자–표시 `spacing.sm` 12 |
| 펼침 내용 | `Collapsible` content | 트리거 바로 아래 | 트리거와 `collapsibleRecipe.gap` `spacing.xs` 8 |
| 메뉴 대상 | `ContextMenu` 자식 | 제품 레이아웃 소유(스토리의 대상 상자는 showcase CSS) | 포커스 링 2px |
| 메뉴 표면 | ContextMenu 메뉴 | 포인터 위치에 `position: fixed`, 뷰포트 안 | 최대 폭 `min(24rem, 90vw)`, 최대 높이 뷰포트 − 2×`spacing.md`, padding `spacing.xxs` 4, radius `md` 12. 항목 높이 44, padding `spacing.xs` 8 · `spacing.sm` 12 |
| 메뉴 막대 | `Menubar` | 화면·편집 영역 상단, 가로, 좁으면 줄바꿈 | 최소 높이 `menubarRecipe.minHeight` 44, 라벨 사이 `spacing.xxs` 4, 좌우 `spacing.xs` 8, 라벨 좌우 `spacing.sm` 12 |
| 메뉴 패널 | Menubar 패널 | 라벨 바로 아래(`top: 100%`), 시작 정렬 | 최소 폭 13.75rem, 최대 `min(24rem, 90vw)`, 항목 높이 44 |
| 결과 알림 | `Notice` 또는 `Toast` | 대상·막대 아래 본문, 또는 Toast 자리 | Stack `gap="md"` 16 |

- 단독 펼침은 이웃 없이 하나만 둔다. 펼침 여러 개가 이어지면 [Accordion](../components/accordion.md)이다.
- 메뉴 항목 순서: 자주 쓰는 작업 → 드문 작업 → 파괴 작업(`tone="danger"`)을 맨 끝에 둔다(스토리 순서).
- 단축키는 항목 끝에 label 크기·보조 색으로 표시된다. 긴 라벨은 줄바꿈되고 잘리지 않는다.

## 흐름과 상태

1. 단일 펼침: 트리거를 누르면 내용이 열리고 ▸가 ▾로 바뀐다. 다시 누르면 닫힌다.
2. 포인터 메뉴: 대상에서 우클릭(터치는 500ms 길게 누르기, 키보드는 포커스 후 Shift+F10·메뉴 키) → 메뉴 → 항목 선택 → `onAction(id)`.
   선택하면 메뉴가 닫히고 포커스가 대상으로 돌아온 뒤 제품이 작업을 실행한다.
3. 메뉴 막대: 라벨을 눌러 열고, 연 상태에서 ←/→로 옆 메뉴로 넘어간다. 비활성 메뉴는 건너뛴다 → 항목 선택 → `onAction(id, menuId)`.
4. `onAction`은 동기 콜백이다. 서버 작업(삭제·복제)의 진행·실패는 메뉴가 아니라 대상 쪽 제품 UI가 보인다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 펼침은 닫힘(▸) 또는 `defaultOpen`, 메뉴·막대 패널은 닫힘 | 트리거 `aria-expanded`, 내용은 `aria-controls` + `role="region"` |
| 진행 중 | 메뉴는 이미 닫혀 있다. 같은 작업이 다시 실행되지 않게 진행 중인 항목을 `disabled`로 주고, 대상에는 제품이 진행 표시를 둔다 | 포커스는 대상에 남는다 |
| 실패 | 서버 작업 실패(네트워크·서버)는 대상 근처 [Notice](../components/notice.md) `tone="danger"` 또는 [Toast](../components/toast.md)로 알리고, 다시 하려면 메뉴를 다시 연다. 재시도도 실패하면 같은 알림을 다시 띄운다 | Notice·Toast 알림, 포커스 이동 없음 |
| 펼침 열림 | ▾(장식), 내용 표시 | `aria-expanded="true"` |
| 펼침 비활성 | 트리거 opacity 0.5 | 누를 수 없음 |
| 메뉴 열림 | 대상 근처 떠 있는 표면 | 메뉴로 포커스가 옮겨지고, 선택·닫기 뒤 대상으로 돌아간다 |
| 항목 활성(키보드) | 안쪽 1px `content.brand` 테두리 | — |
| 항목 비활성 | opacity 0.5, 선택 안 됨 | — |
| 막대 메뉴 열림 | 라벨에 안쪽 brand 테두리 | — |

## 코드 골격

```tsx
// Web
import { Collapsible } from "@hjmds/react/collapsible";
import { ContextMenu } from "@hjmds/react/context-menu";
import { Menubar } from "@hjmds/react/menubar";
import { Container, Stack, Text } from "@hjmds/react/layout";

<Container size="content" gutter={gutter}>
  <Stack gap="md">
    <Collapsible trigger={t("order.shipping.more")} defaultOpen>
      <Text as="p">{t("order.shipping.body")}</Text>
    </Collapsible>

    <ContextMenu accessibilityLabel={t("record.actions")} onAction={runRecordAction} items={[
      { id: "rename", label: t("record.rename"), textValue: t("record.rename"), shortcut: "F2" },
      { id: "delete", label: t("record.delete"), textValue: t("record.delete"), tone: "danger", disabled: deleting },
    ]}>
      <RecordCard record={record} /* 제품 소유 대상 */ />
    </ContextMenu>

    <Menubar descriptor={{ accessibilityLabel: t("editor.menu"), menus }} onAction={(id, menuId) => run(menuId, id)} />
  </Stack>
</Container>
```

```tsx
// Native
// 없음. ContextMenu·Menubar는 Web 전용이다. Native의 단독 펼침은 `@hjmds/react-native/collapsible`의 Collapsible,
// 길게 누르기 메뉴는 실험적 `NativeContextMenu`(`/context-menu-native`)가 있다.
```

스토리의 항목(파일·편집·도움말, 기록 작업)과 실행 결과 Notice는 데모다. 항목 구성과 실행은 제품 소유다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `Collapsible` | `/collapsible`, 배치는 `layoutStyle`(또는 `className`) | `/collapsible`, 배치는 `layoutStyle`(`style`은 deprecated) |
| 대상 메뉴 | `ContextMenu`(stable) | `NativeContextMenu`(실험적 어댑터) |
| `Menubar` | 있음 | 없음 |

## 함정

- `Collapsible`에 `open`과 `defaultOpen`을 함께 주거나 `open`만 주고 `onOpenChange`를 빼면 `TypeError`다.
- 펼침 여러 개를 Collapsible로 나열하면 구분선·그룹 키보드 이동·"하나만 열림"이 없다. 그런 묶음은 Accordion이다.
- `ContextMenu` `accessibilityLabel`은 필수다.
- 현재 단일 펼침 스토리는 Collapsible 두 개(배송·환불)를 `Stack gap="md"`로 이어 둔다. 이웃이 있는 펼침 묶음은 Accordion 기준이므로 따라 하지 않는다.
- 현재 스토리는 실행 결과 Notice 설명을 `` `${last} 작업을 실행했습니다.` ``처럼 템플릿 문자열로 만들고 문구가 한국어 리터럴이다. 제품은 작업 id→i18n 키 상수 표를 둔다.
