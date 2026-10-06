import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { listRecipe, menuRecipe, searchFieldRecipe, segmentedControlRecipe, sheetRecipe, statisticRecipe, tooltipRecipe } from "@hjmds/design-contracts/recipes";
import { uploadItemRecipe } from "@hjmds/design-contracts/components/upload-item";
import { control, spacing } from "@hjmds/design-contracts/foundations";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Agreement } from "../src/agreement.js";
import { ClipboardButton } from "../src/clipboard.js";
import { Avatar, List, Statistic } from "../src/advanced-display.js";
import { Badge, ListRow } from "../src/display.js";
import { EmptyState, Progress, Result } from "../src/feedback.js";
import { SearchField } from "../src/forms.js";
import { Section } from "../src/layout.js";
import { Masonry } from "../src/masonry.js";
import { Menu, Sheet, Tooltip } from "../src/overlays.js";
import { HjmProvider } from "../src/provider.js";
import { ScreenLayout } from "../src/screens.js";
import { Chip, SegmentedControl } from "../src/selection.js";
import { Toast } from "../src/toast.js";
import { TransferList } from "../src/transfer-list.js";
import { UploadItem } from "../src/upload-item.js";
import { DataTable } from "../src/data-table.js";
import "../src/styles.css";

// Regression proofs for the 2026-10-06 follow-up list: each case pins a Web value that disagreed with the
// recipe (or with Native) before its fix.
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  await page.viewport(414, 896);
});
async function render(node: React.ReactNode) {
  await act(async () => root.render(<HjmProvider>{node}</HjmProvider>));
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });
}
const px = (value: number) => `${value}px`;
const css = (element: Element) => getComputedStyle(element);
function rect(left: number, top: number, width: number, height: number): DOMRect {
  return { x: left, y: top, left, top, width, height, right: left + width, bottom: top + height, toJSON: () => ({}) };
}

it("Sheet size=full fills the viewport and the body uses sheetRecipe spacing", async () => {
  await render(<Sheet open onOpenChange={() => undefined} size="full" title="필터" closeLabel="닫기" footer={<button type="button">적용</button>}><p>본문</p></Sheet>);
  const sheet = document.body.querySelector<HTMLElement>(".hjm-sheet")!;
  // Before: max-block-size 90dvh capped `full`.
  expect(sheet.getBoundingClientRect().height).toBeGreaterThan(window.innerHeight * 0.95);
  expect(css(sheet).paddingTop).toBe(px(sheetRecipe.content.paddingTop));
  expect(css(sheet).rowGap).toBe(px(sheetRecipe.body.gap));
  expect(css(sheet.querySelector(".hjm-sheet__header")!).paddingInlineStart).toBe(px(sheetRecipe.content.paddingHorizontal));
  expect(css(sheet.querySelector(".hjm-sheet__footer")!).paddingTop).toBe(px(sheetRecipe.footer.paddingTop));
  // Visible body inset stays the recipe's: 4px focus room is cancelled by the negative margin.
  const body = sheet.querySelector(".hjm-sheet__body")!;
  expect(parseFloat(css(body).paddingTop) + parseFloat(css(body).marginTop)).toBe(0);
  expect(css(body).rowGap).toBe(px(sheetRecipe.body.gap));
});

it("ScreenLayout header and state gaps come from screenPatternRecipe", async () => {
  await render(<ScreenLayout title="설정" contentInset="none" actions={<button type="button">저장</button>} state={{ kind: "empty", title: "비어 있어요" }} stateAction={<button type="button">추가</button>} />);
  expect(css(container.querySelector(".hjm-screen__header")!).columnGap).toBe(px(screenPatternRecipe.itemGap));
  expect(css(container.querySelector(".hjm-screen__state")!).rowGap).toBe(px(screenPatternRecipe.stateGap));
});

it("SearchField draws searchFieldRecipe padding, gap and clear-button sizes", async () => {
  await render(<><SearchField label="찾기" clearLabel="지우기" defaultValue="산책" /><SearchField label="크게" size="large" clearLabel="지우기" defaultValue="산책" /></>);
  const [medium, large] = [...container.querySelectorAll(".hjm-search-field")];
  expect(css(medium!.querySelector(".hjm-field__control")!).paddingInlineStart).toBe(px(searchFieldRecipe.sizes.medium.paddingHorizontal));
  expect(css(medium!.querySelector(".hjm-field__control")!).columnGap).toBe(px(searchFieldRecipe.sizes.medium.gap));
  expect(medium!.querySelector(".hjm-search-field__clear")!.getBoundingClientRect().width).toBe(searchFieldRecipe.sizes.medium.clearDiameter);
  expect(getComputedStyle(medium!.querySelector(".hjm-search-field__clear")!, "::after").top).toBe(px(-searchFieldRecipe.sizes.medium.clearHitSlop));
  expect(large!.querySelector(".hjm-field__control")!.getBoundingClientRect().height).toBeGreaterThanOrEqual(searchFieldRecipe.sizes.large.minHeight);
  expect(large!.querySelector(".hjm-search-field__clear")!.getBoundingClientRect().width).toBe(searchFieldRecipe.sizes.large.clearDiameter);
});

it("Tooltip and Menu use their recipe offset and viewport padding", async () => {
  await render(<>
    <Tooltip defaultOpen placement="bottom" trigger={<button type="button">도움말</button>} content="설명" />
    <Menu defaultOpen align="start" label="작업" trigger={<button type="button">작업</button>} items={[{ id: "edit", label: "수정" }]} />
  </>);
  const [tooltipTrigger, menuTrigger] = [...container.querySelectorAll("button")];
  const tooltip = document.body.querySelector<HTMLElement>('[role="tooltip"]')!;
  const menu = document.body.querySelector<HTMLElement>('[role="menu"]')!;
  Object.defineProperty(tooltipTrigger!, "getBoundingClientRect", { configurable: true, value: () => rect(100, 100, 36, 24) });
  Object.defineProperty(tooltip, "getBoundingClientRect", { configurable: true, value: () => rect(0, 0, 100, 30) });
  // The trigger overhangs the right edge, so the end-aligned menu must clamp to the collision padding.
  Object.defineProperty(menuTrigger!, "getBoundingClientRect", { configurable: true, value: () => rect(window.innerWidth - 10, 200, 24, 24) });
  Object.defineProperty(menu, "getBoundingClientRect", { configurable: true, value: () => rect(0, 0, 180, 100) });
  Object.defineProperty(menu, "scrollWidth", { configurable: true, value: 180 });
  Object.defineProperty(menu, "scrollHeight", { configurable: true, value: 100 });
  Object.defineProperty(tooltip, "scrollWidth", { configurable: true, value: 100 });
  Object.defineProperty(tooltip, "scrollHeight", { configurable: true, value: 30 });
  await act(async () => window.dispatchEvent(new Event("resize")));
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });
  expect(tooltip.style.top).toBe(px(124 + tooltipRecipe.positioning.sideOffset));
  expect(menu.style.left).toBe(px(window.innerWidth - menuRecipe.collisionPadding - 180));
  expect(css(tooltip).maxWidth).toBe(px(tooltipRecipe.content.maxWidth));
  expect(css(menu.querySelector(".hjm-menu__item")!).borderTopLeftRadius).toBe("12px");
});

it("SegmentedControl, Chip and Badge sizes follow their recipes", async () => {
  await render(<>
    <SegmentedControl label="보기" size="small" items={[{ value: "a", label: "목록" }, { value: "b", label: "지도" }]} defaultValue="a" />
    <Chip label="기본" onPress={() => undefined} /><Chip label="중간" size="medium" onPress={() => undefined} /><Badge size="small">새 글</Badge>
  </>);
  const track = container.querySelector(".hjm-segmented__items")!;
  expect(css(track).paddingTop).toBe(px(segmentedControlRecipe.container.padding));
  expect(css(track).columnGap).toBe(px(segmentedControlRecipe.container.gap));
  expect(css(track).borderTopLeftRadius).toBe("16px");
  expect(container.querySelector(".hjm-segmented__item")!.getBoundingClientRect().height).toBe(segmentedControlRecipe.sizes.small.minHeight);
  const [small, medium] = [...container.querySelectorAll(".hjm-chip")];
  expect(css(small!).paddingInlineStart).toBe(px(spacing.sm));
  expect(css(medium!).paddingInlineStart).toBe(px(spacing.md));
  expect(css(container.querySelector(".hjm-badge")!).paddingInlineStart).toBe(px(spacing.xxs));
});

it("Section stacks below breakpoint.medium (600), not 640", async () => {
  await page.viewport(620, 800);
  await render(<Section title="최근 기록" action={<button type="button">모두 보기</button>}>내용</Section>);
  expect(css(container.querySelector(".hjm-section__header")!).flexDirection).toBe("row");
});

it("Statistic, TransferList, UploadItem, DataTable, EmptyState and List spacing follow the recipes", async () => {
  await render(<>
    <Statistic descriptor={{ id: "a", label: "걸음", value: "1,200" }} presentation="surface" density="compact" />
    <TransferList items={[{ id: "a", label: "기록 A", textValue: "기록 A" }]} labels={{ source: "전체", target: "선택", toTarget: "담기", toSource: "빼기", selectAll: "모두 선택", empty: "비어 있어요" }} />
    <UploadItem descriptor={{ id: "p", name: "photo.png", state: { status: "pending" } }} labels={{ pending: "대기", uploading: "올리는 중", success: "완료", cancel: "취소", retry: "다시" }} />
    <DataTable columns={[{ id: "title", header: "제목" }]} rows={[{ id: "r" }]} labels={{ table: "표", selectAll: "모두", selectRow: (id) => id, sortColumn: (h) => h }} renderCell={() => "값"} />
    <EmptyState title="없어요" />
    <List label="목록" separator="indented"><ListRow title="하나" /><ListRow title="둘" /></List>
  </>);
  const statistic = container.querySelector(".hjm-statistic")!;
  expect(css(statistic).rowGap).toBe(px(statisticRecipe.density.compact.gap));
  expect(css(statistic).paddingTop).toBe(px(statisticRecipe.density.compact.padding));
  expect(css(container.querySelector(".hjm-transfer-list__option")!).paddingInlineStart).toBe(px(spacing.sm));
  expect(css(container.querySelector(".hjm-transfer-list__actions")!).rowGap).toBe(px(spacing.sm));
  const upload = container.querySelector(".hjm-upload-item")!;
  expect(css(upload).minHeight).toBe(px(uploadItemRecipe.row.minHeight));
  expect(css(upload).paddingTop).toBe(px(uploadItemRecipe.row.paddingVertical));
  expect(css(container.querySelector(".hjm-data-table__table td")!).paddingInlineStart).toBe(px(spacing.md));
  expect(css(container.querySelector(".hjm-empty-state")!).paddingTop).toBe(px(spacing.xxxl));
  const second = container.querySelectorAll(".hjm-list__item")[1]!;
  expect(getComputedStyle(second, "::before").insetInlineStart).toBe(px(listRecipe.separators.indented.insetStart));
});

it("circular Progress keeps the copy row above the ring", async () => {
  await render(<Progress label="업로드" value={40} valueText="40%" shape="circular" />);
  const copy = container.querySelector(".hjm-progress__copy")!.getBoundingClientRect();
  const ring = container.querySelector(".hjm-progress__ring")!.getBoundingClientRect();
  expect(ring.top).toBeGreaterThanOrEqual(copy.bottom);
});

it("Avatar initials, Agreement initial state and Result order match Native", async () => {
  const onStateChange = vi.fn();
  await render(<>
    <Avatar name="Kim Min Jun" />
    <Agreement descriptor={{ accessibilityLabel: "약관", allLabel: "전체 동의", items: [{ id: "terms", label: "이용약관", required: true }] }}
      defaultCheckedIds={new Set(["terms"])} onStateChange={onStateChange} requiredLabel="(필수)" optionalLabel="(선택)" />
    <Result status="failure" title="실패" actions={[{ label: "다시 시도", onAction: () => undefined }, { label: "나중에", onAction: () => undefined }]} />
  </>);
  // Before: Web took the first two words ("KM").
  expect(container.querySelector(".hjm-avatar__fallback")!.textContent).toBe("KJ");
  expect(onStateChange).toHaveBeenCalled();
  expect(onStateChange.mock.calls[0]![0]).toMatchObject({ satisfied: true });
  expect([...container.querySelectorAll(".hjm-result__actions button")].map((button) => button.textContent)).toEqual(["나중에", "다시 시도"]);
});

it("ClipboardButton defaults to secondary, Toast forwards its HTML attributes, empty Masonry is a named group", async () => {
  await render(<>
    <ClipboardButton value="code" labels={{ idle: "복사", copied: "복사됨" }} />
    <Toast id="saved-toast" data-testid="toast" descriptor={{ id: "t", description: "저장했어요", closeLabel: "닫기" }} onDismissRequest={() => undefined} />
    <Masonry items={[]} keyExtractor={(item: string) => item} label="사진" width={240} getItemHeight={() => 100} renderItem={(item) => item} empty={<p>사진이 없어요</p>} />
  </>);
  expect(container.querySelector("button.hjm-button")!.getAttribute("data-tone")).toBe("secondary");
  const toast = container.querySelector<HTMLElement>("#saved-toast")!;
  expect(toast.dataset.testid).toBe("toast");
  expect(toast.getAttribute("role")).toBe("group");
  expect(container.querySelector('[role="group"][aria-label="사진"]')).not.toBeNull();
  expect(control.minTouchTarget).toBe(44);
});
