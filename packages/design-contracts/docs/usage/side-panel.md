# SidePanel 사용 지침

적용: `@hjmds/react` 1.12.1 (Web 전용) · 검토일: 2026-10-06 ·
계약: [SidePanel](../side-panel.md), recipe `sidePanelRecipe`·정책 `sidePanelBehaviorDefaults`(`src/side-panel.ts`)

## 언제 쓰나

Web 화면 가장자리(시작·끝)에 도킹되어 밀려 나오는 보조 패널에 쓴다. 목록 옆 상세 편집, 필터,
보조 내비게이션이 전형이다. 기본은 모달(초점 가둠·스크롤 잠금)이고, 뒤 페이지를 계속 조작해야 하면
비모달(`dismissPolicy.modal: false`)로 연다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 모바일·Native, 하단에서 올라오는 작업 패널 | [Sheet](sheet.md) |
| 짧은 확인·결정 | [AlertDialog](alert-dialog.md), [Dialog](dialog.md) |
| 항상 보이는 앱 왼쪽 내비게이션 | [Sidebar](sidebar.md) |
| 트리거 옆 작은 내용 | [Popover](popover.md) |
| 고정 2단 배치(크기 조절) | [Splitter](splitter.md), [Layout](layout.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `SidePanel` | `@hjmds/react`, `/side-panel` | 없음(계약상 unsupported) | 기본 |

## 최소 사용 예

```tsx
// Web — 모달(기본)
import { SidePanel } from "@hjmds/react/side-panel";

<SidePanel open={open} onOpenChange={(next) => setOpen(next)}
  title={t("orders.filter.title")} closeLabel={t("common.close")}
  footer={<Button onClick={apply}>{t("orders.filter.apply")}</Button>}>
  <OrderFilters value={draft} onChange={setDraft} />
</SidePanel>
```

```tsx
// Web — 비모달: 뒤 목록을 계속 조작
<SidePanel open={open} onOpenChange={(next) => setOpen(next)} edge="end" size="wide"
  title={t("orders.detail.title")} closeLabel={t("common.close")}
  dismissPolicy={{ modal: false, dismissible: true, dismissWhileBusy: false, escapeDismiss: true }}>
  <OrderDetail id={selectedId} />
</SidePanel>
```

Native 사용 예는 없다. Native는 [Sheet](sheet.md)를 쓴다.

## 축과 기본값

- `edge`: `start` · `end`(기본). 논리 방향이라 RTL에서 뒤집힌다. `size`: `compact` 320 · `regular`(기본) 400 · `wide` 560.
- `dismissPolicy`: 기본 `{ modal: true, dismissible: true, dismissWhileBusy: false, escapeDismiss: true, outsideDismiss: true }`.
  `Partial`이 아니라 **전체 객체**를 넘긴다. `modal: false`에는 `outsideDismiss`를 쓸 수 없다(타입 오류).
- 열림: `open` + `onOpenChange(open, { reason })` 또는 `defaultOpen` + `trigger`(uncontrolled면 필수).
  reason: `trigger` · `close-action` · `escape` · `outside` · `programmatic`.
- `title`·`closeLabel` 필수, `description`, `footer`, `busy`(기본 `false`), `initialFocusRef`, `returnFocusRef`,
  `onDismissComplete({ reason })`(닫힘마다 한 번), `modalPriority`(기본 `0`), `portalContainer`, `className`.

## 꼭 지킬 것

- 모달 SidePanel은 Dialog·Sheet와 같은 모달 스택에 들어간다. 제품이 따로 focus trap·스크롤 잠금을 얹지 않는다.
- 비모달은 backdrop이 없고 Escape는 패널 안에서만 듣는다. 닫기 수단(닫기 버튼·Escape)을 막지 않는다.
- 저장 중에는 `busy`로 사용자 닫기를 막는다. owner가 `open=false`로 닫는 것은 항상 허용된다(`programmatic`).
- 문구(`title`, `closeLabel`)는 i18n 키로 넣는다. 폭·radius·색을 `className`으로 덮지 않는다. 폭은 `size`로 고른다.
