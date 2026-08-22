import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { control, spacing } from "@hjm/design-contracts/foundations";
import { buttonRecipe } from "@hjm/design-contracts/recipes/base";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  Button,
  Card,
  HjmProvider,
  IconButton,
  Stack,
  Surface,
  Tag,
  Text,
} from "../src/index.js";

describe("Web core normalization", () => {
  it("emits canonical Text, Surface, and Stack defaults", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Text>본문</Text>
        <Surface>표면</Surface>
        <Stack><span>항목</span></Stack>
      </HjmProvider>,
    );
    expect(markup).toContain('data-variant="body" data-tone="primary" data-emphasis="regular"');
    expect(markup).toContain('data-tone="default" data-bordered="false"');
    expect(markup).toContain('data-padding="none" data-radius="lg"');
    expect(markup).toContain('data-axis="block" data-gap="md"');
    expect(markup).toContain('align-items:stretch');
    expect(markup).toContain('justify-content:flex-start');
  });

  it("uses the shared Tag and Card anatomy while keeping Web heading semantics", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Tag tone="attention">주의</Tag>
        <Card
          actions={<Button>확인</Button>}
          description="설명"
          media={<img alt="미디어" />}
          selected
          title="제목"
        >
          내용
        </Card>
      </HjmProvider>,
    );
    expect(markup).toContain('class="hjm-tag__label"');
    expect(markup).toContain('data-state="selected"');
    expect(markup).toContain('data-tone="accent" data-bordered="true"');
    expect(markup).toContain('<h3 class="hjm-card__title" data-slot="title">제목</h3>');
    for (const slot of ["media", "body", "description", "content", "actions"]) {
      expect(markup).toContain(`data-slot="${slot}"`);
    }
  });

  it("draws an accent edge only for an explicitly bordered Surface", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Surface tone="accent">무테</Surface>
        <Surface tone="accent" bordered>테두리</Surface>
      </HjmProvider>,
    );
    expect(markup.match(/data-tone="accent" data-bordered="false"/g)).toHaveLength(1);
    expect(markup.match(/data-tone="accent" data-bordered="true"/g)).toHaveLength(1);

    const css = readFileSync(
      fileURLToPath(new URL("../src/styles.css", import.meta.url)),
      "utf8",
    );
    expect(css).toContain(
      '.hjm-surface[data-tone="accent"][data-bordered="true"] { border-color: color-mix',
    );
    expect(css).not.toMatch(
      /\.hjm-surface\[data-tone="accent"\] \{[^}]*border-color/,
    );
    expect(css).toContain(
      '.hjm-tag[data-tone="info"] { background: color-mix(in srgb, var(--hjm-accent-info) 10%, transparent); }',
    );
    expect(css).toContain("font-size: var(--hjm-type-caption-size)");
  });

  it("emits shared IconButton defaults and preserves the small visual hit target", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <IconButton label="메뉴">☰</IconButton>
      </HjmProvider>,
    );
    expect(markup).toContain('data-tone="ghost"');
    expect(markup).toContain('data-size="medium"');
    expect(markup).toContain('data-shape="rounded"');
    expect(markup).toContain('data-state="idle"');

    const css = readFileSync(
      fileURLToPath(new URL("../src/styles.css", import.meta.url)),
      "utf8",
    );
    expect(css).toContain(
      '.hjm-icon-button[data-size="small"]::after { content: ""; position: absolute; inset: calc(-1 * var(--hjm-space-xxs)); }',
    );
  });

  it("maps every Button size to shared height and typography with a small hit target", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Button size="small">작게</Button>
        <Button size="medium">보통</Button>
        <Button size="large">크게</Button>
      </HjmProvider>,
    );
    for (const size of ["small", "medium", "large"]) {
      expect(markup).toContain(`data-size="${size}"`);
    }
    expect(markup).toContain(
      `--hjm-control-button-small:${buttonRecipe.sizes.small.height}px`,
    );
    expect(markup).toContain(`--hjm-space-xxs:${spacing.xxs}px`);
    expect(buttonRecipe.sizes.small.hitSlop).toBe(spacing.xxs);
    expect(
      buttonRecipe.sizes.small.height + buttonRecipe.sizes.small.hitSlop * 2,
    ).toBeGreaterThanOrEqual(control.minTouchTarget);

    const css = readFileSync(
      fileURLToPath(new URL("../src/styles.css", import.meta.url)),
      "utf8",
    );
    expect(css).toMatch(
      /\.hjm-button \{[^}]*min-block-size: var\(--hjm-control-button-medium\);[^}]*font-size: var\(--hjm-type-body-size\);[^}]*line-height: var\(--hjm-type-body-line-height\);/s,
    );
    expect(css).toMatch(
      /\.hjm-button\[data-size="small"\] \{[^}]*min-block-size: var\(--hjm-control-button-small\);[^}]*font-size: var\(--hjm-type-label-size\);[^}]*line-height: var\(--hjm-type-label-line-height\);/s,
    );
    expect(css).toMatch(
      /\.hjm-button\[data-size="large"\] \{[^}]*min-block-size: var\(--hjm-control-button-large\);[^}]*font-size: var\(--hjm-type-body-large-size\);[^}]*line-height: var\(--hjm-type-body-large-line-height\);/s,
    );
    expect(css).toMatch(
      /\.hjm-button\[data-size="small"\]::after \{[^}]*position: absolute;[^}]*inset: calc\(-1 \* var\(--hjm-space-xxs\)\);/s,
    );
  });
});
