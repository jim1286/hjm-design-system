import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { Button, IconButton } from "../src/actions.js";
import { CommentThreadRow } from "../src/screen-flows.js";
import { Icon } from "../src/supplemental-display.js";
import "../src/styles.css";

// 2026-10-17 measured audit: 44 targets at row/header edges left their glyph 10–15px inside the 16px inset and, in
// top-aligned comment rows, 12px below the author line. One edge rule (IconButton/Button `edge`) fixes both.
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
  await page.viewport(1280, 720);
});

const glyph24 = <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12" /></svg>;
const chevron16 = <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" /></svg>;

describe("edge-aligned controls", () => {
  it("keeps the shared share glyph's strokes inside its viewport at both weights", async () => {
    await act(async () => root.render(<HjmProvider>{(["regular", "strong"] as const).map(weight =>
      <Icon key={weight} name="share" decorative weight={weight} />
    )}</HjmProvider>));
    const icons = container.querySelectorAll<SVGSVGElement>('svg[data-name="share"]');
    expect(icons).toHaveLength(2);
    for (const svg of icons) {
      const bounds = svg.querySelector<SVGPathElement>('path')!.getBBox();
      const halfStroke = Number(svg.getAttribute('stroke-width')) / 2;
      expect(bounds.x - halfStroke).toBeGreaterThanOrEqual(0);
      expect(bounds.y - halfStroke).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width + halfStroke).toBeLessThanOrEqual(24);
      expect(bounds.y + bounds.height + halfStroke).toBeLessThanOrEqual(24);
    }
  });
  for (const direction of ["ltr", "rtl"] as const) {
    it(`puts the glyph slot / label on the 16px inset and keeps the 44 target (${direction})`, async () => {
      await page.viewport(402, 844);
      await act(async () => root.render(<HjmProvider direction={direction}>
        <div data-row style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingInline: 16 }}>
          <IconButton label="뒤로" edge="start">{glyph24}</IconButton>
          <IconButton label="더 보기" edge="end">{glyph24}</IconButton>
        </div>
        <div data-row style={{ display: "flex", justifyContent: "flex-end", paddingInline: 16 }}>
          <Button tone="ghost" size="small" edge="end" trailing={chevron16}>정렬</Button>
        </div>
        <div data-row style={{ display: "flex", justifyContent: "flex-end", paddingInline: 16 }}>
          <IconButton label="추가" tone="secondary" edge="end">{glyph24}</IconButton>
        </div>
      </HjmProvider>));
      const rows = [...container.querySelectorAll<HTMLElement>("[data-row]")];
      const inset = (row: HTMLElement, element: Element, side: "start" | "end") => {
        const r = row.getBoundingClientRect(), e = element.getBoundingClientRect();
        const left = side === "start" ? direction === "ltr" : direction === "rtl";
        return left ? e.left - r.left : r.right - e.right;
      };
      const [back, more] = [...rows[0]!.querySelectorAll(".hjm-icon-button")];
      expect(back!.getBoundingClientRect().width).toBe(44);
      expect(inset(rows[0]!, back!.querySelector("svg")!, "start")).toBeCloseTo(16, 0);
      expect(inset(rows[0]!, more!.querySelector("svg")!, "end")).toBeCloseTo(16, 0);
      expect(inset(rows[1]!, rows[1]!.querySelector("svg")!, "end")).toBeCloseTo(16, 0);
      // Framed tones align their frame, not the glyph.
      expect(inset(rows[2]!, rows[2]!.querySelector(".hjm-icon-button")!, "end")).toBeCloseTo(16, 0);
    });
  }

  it("centres the comment row's trailing glyphs on the author line", async () => {
    await page.viewport(402, 844);
    await act(async () => root.render(<HjmProvider>
      <CommentThreadRow item={{ id: "one", parentId: null, author: "seoyeon", body: <span>여기 분위기 너무 좋다</span>, timeLabel: "2시간", likeCountLabel: "24", likeIcon: glyph24, likeLabel: "좋아요" }}
        onLike={() => {}} onReply={() => {}} replyLabel="답글 달기" />
    </HjmProvider>));
    const author = [...container.querySelectorAll<HTMLElement>(".hjm-comment-row__text .hjm-text")].find(node => node.textContent === "seoyeon")!;
    const line = author.getBoundingClientRect();
    const authorCentre = line.top + parseFloat(getComputedStyle(author).lineHeight) / 2;
    const heart = container.querySelector(".hjm-comment-row__like svg")!.getBoundingClientRect();
    expect(heart.top + heart.height / 2).toBeCloseTo(authorCentre, 0);
    // No menu or product actions: the like button is last and its glyph slot ends on the row edge.
    const row = container.querySelector(".hjm-comment-row__like")!.parentElement!.getBoundingClientRect();
    expect(row.right - heart.right).toBeCloseTo(0, 0);
  });
});
