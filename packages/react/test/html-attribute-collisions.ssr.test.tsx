import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";

import { ClipboardButton, type ClipboardButtonProps } from "../src/clipboard.js";
import { EmptyState, Notice, type EmptyStateProps, type NoticeProps } from "../src/feedback.js";
import { HjmProvider } from "../src/provider.js";
import type { DialogProps, SheetProps } from "../src/overlays.js";
import type { CardProps, ListRowProps } from "../src/display.js";
import type { SectionProps } from "../src/layout.js";
import type { ResultProps } from "../src/feedback.js";
import type { TopBarProps } from "../src/top-bar.js";

// HTML attributes share names with HJM slots (`title` is a tooltip string in the DOM).
// An intersection collapses the slot to the attribute's type, so products had to cast
// heading elements (BurnTok EmptyState, 2026-09-27 audit). These assertions pin the
// slot type on every component that owns a `title` slot over an HTML element type.
describe("HTML attribute name collisions", () => {
  it("keeps every title slot a ReactNode instead of the HTML tooltip string", () => {
    expectTypeOf<EmptyStateProps["title"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<NoticeProps["title"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<CardProps["title"]>().toEqualTypeOf<ReactNode | undefined>();
    expectTypeOf<ListRowProps["title"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<SectionProps["title"]>().toEqualTypeOf<ReactNode | undefined>();
    expectTypeOf<DialogProps["title"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<SheetProps["title"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<string>().not.toEqualTypeOf<EmptyStateProps["title"]>();
  });

  it("keeps the string-only titles that carry an accessible name themselves", () => {
    // Result reads its title from the contract descriptor and TopBar pairs `title` with
    // `titleAccessibilityLabel`; both stay strings on purpose, not by collision.
    expectTypeOf<ResultProps["title"]>().toEqualTypeOf<string>();
    expectTypeOf<TopBarProps["title"]>().toEqualTypeOf<string | undefined>();
  });

  it("keeps ClipboardButton.onCopy a value callback rather than the DOM clipboard event", () => {
    expectTypeOf<ClipboardButtonProps["onCopy"]>().toEqualTypeOf<((value: string) => void) | undefined>();
  });

  it("renders element titles without a cast", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider theme="light" systemTheme="light">
        <EmptyState title={<h2 data-testid="empty-title">기록 없음</h2>} description="첫 기록을 추가하세요" />
        <Notice title={<span data-testid="notice-title">안내</span>} tone="info" />
        <ClipboardButton value="abc" labels={{ idle: "복사", copied: "복사됨" }} onCopy={(value) => value.length} />
      </HjmProvider>,
    );
    expect(markup).toContain('<h2 data-testid="empty-title">기록 없음</h2>');
    expect(markup).toContain('<span data-testid="notice-title">안내</span>');
    expect(markup).not.toContain('title="');
  });
});
