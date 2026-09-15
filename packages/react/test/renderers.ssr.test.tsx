import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  isLargeTextScale,
  resolveDesignSystemProviderValue,
} from "@hjmds/design-contracts/components/design-system-provider";
import { largeTextThreshold } from "@hjmds/design-contracts/foundations";
import {
  segmentedControlRecipe,
  skeletonRecipe,
} from "@hjmds/design-contracts/recipes";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  Grid,
  HjmProvider,
  IconButton,
  Link,
  ListRow,
  Notice,
  Progress,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Skeleton,
  Spinner,
  Stack,
  Surface,
  Switch,
  Tabs,
  Tag,
  Text,
  TextArea,
  TextField,
  useHjmTheme,
} from "../src/index.js";
import type { TabItem } from "../src/index.js";

function ThemeProbe() {
  const { environment } = useHjmTheme();
  return <output>{`${environment.theme}:${environment.direction}:${environment.textScale}`}</output>;
}

const tabs: readonly TabItem[] = [
  { id: "overview", label: "개요", panel: "개요 내용" },
  { id: "history", label: "기록", panel: "기록 내용" },
];

describe("HjmProvider SSR contract", () => {
  it("emits deterministic dark, RTL, 200%, and reduced-motion state", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider
        theme="dark"
        direction="rtl"
        textScale={2}
        reducedMotion
        systemTheme="light"
      >
        <ThemeProbe />
        <Text variant="title" tone="brand">제목</Text>
      </HjmProvider>,
    );

    expect(markup).toContain('data-theme="dark"');
    expect(markup).toContain('data-text-scale="2"');
    expect(markup).toContain('data-motion="reduced"');
    expect(markup).toContain('dir="rtl"');
    expect(markup).toContain('--hjm-text-scale:2');
    expect(markup).toContain("dark:rtl:2");
    expect(markup).toContain('data-variant="title"');
  });

  it("requires useHjmTheme consumers to cross the provider boundary", () => {
    expect(() => renderToStaticMarkup(<ThemeProbe />)).toThrow(/HjmProvider/);
  });

  it("preserves a complete reviewed product palette through the value boundary", () => {
    const canonical = resolveDesignSystemProviderValue(
      { direction: "rtl", reducedMotion: true, textScale: 1.25, theme: "light" },
      { systemTheme: "dark" },
    );
    const value = {
      ...canonical,
      palette: {
        ...canonical.palette,
        theme: { ...canonical.palette.theme, primary: "#123456" },
      },
    };
    const markup = renderToStaticMarkup(
      <HjmProvider value={value}>
        <ThemeProbe />
      </HjmProvider>,
    );
    expect(markup).toContain("--hjm-color-primary:#123456");
    expect(markup).toContain('data-motion="reduced"');
    expect(markup).toContain('dir="rtl"');
    expect(markup).toContain("light:rtl:1.25");
  });
});

describe("native HTML and accessible relationships", () => {
  it("connects field labels, descriptions, errors, and native controls", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <TextField id="name" label="이름" description="실명을 입력하세요" required />
        <TextArea id="bio" label="소개" error="소개가 필요합니다" />
        <SearchField id="search" clearLabel="검색어 지우기" label="검색" defaultValue="야구" />
        <Field controlId="custom" label="사용자 정의" error="필수 항목입니다">
          {(controlProps) => <select {...controlProps}><option>선택</option></select>}
        </Field>
      </HjmProvider>,
    );

    expect(markup).toContain('<label class="hjm-field__label" for="name">');
    expect(markup).toContain('aria-describedby="name-description"');
    expect(markup).toContain('id="name-description"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('aria-describedby="bio-error"');
    expect(markup).toContain('<textarea');
    expect(markup).toContain('type="search"');
    expect(markup).toContain('aria-label="검색어 지우기"');
    expect(markup).toContain('<select id="custom"');
    expect(markup).toContain('aria-describedby="custom-error"');
  });

  it("supports aria-only field names while rejecting unnamed controls", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <TextField aria-label="선수 이름" />
        <TextArea aria-label="선수 소개" />
        <SearchField aria-label="선수 검색" clearLabel="검색어 지우기" />
      </HjmProvider>,
    );

    expect(markup).not.toContain('class="hjm-field__label"');
    expect(markup).toContain('aria-label="선수 이름"');
    expect(markup).toContain('aria-label="선수 소개"');
    expect(markup).toContain('aria-label="선수 검색"');
    expect(() =>
      renderToStaticMarkup(
        <HjmProvider systemTheme="light">
          <TextField />
        </HjmProvider>,
      ),
    ).toThrow(/label or aria-label/);
  });

  it("uses button, anchor, checkbox, radio, switch, and tab semantics", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Button loading>저장</Button>
        <IconButton label="메뉴">☰</IconButton>
        <Link
          href="/home"
          renderAnchor={({ children, ...props }) => (
            <a {...props} data-framework-link="next">{children}</a>
          )}
        >
          홈
        </Link>
        <Checkbox label="동의" defaultChecked />
        <RadioGroup
          label="등급"
          defaultValue="a"
          items={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
        />
        <Switch label="알림" defaultChecked />
        <SegmentedControl
          label="보기"
          items={[{ value: "list", label: "목록" }, { value: "grid", label: "격자" }]}
        />
        <Tabs label="선수 정보" items={tabs} />
      </HjmProvider>,
    );

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('aria-label="메뉴"');
    expect(markup).toContain('<a href="/home"');
    expect(markup).toContain('data-framework-link="next"');
    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain('type="radio"');
    expect(markup).toContain('role="switch"');
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('role="tabpanel"');
    expect(markup).toMatch(/aria-controls="[^"]+-panel-overview"/);
  });
});

describe("layout and display vertical slice", () => {
  it("consumes shared responsive/Grid resolution on the server", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Grid
          columns={{ compact: 1, medium: 2, expanded: 3 }}
          gap={{ compact: "sm", expanded: { row: "lg", column: "md" } }}
          minColumnWidth={{ compact: 180 }}
          windowWidth={1_000}
          availableWidth={800}
        >
          <Surface>1</Surface>
          <Surface>2</Surface>
          <Surface>3</Surface>
        </Grid>
      </HjmProvider>,
    );

    expect(markup).toContain('data-window-class="expanded"');
    expect(markup).toContain('data-columns="3"');
    expect(markup).toContain('grid-template-columns:repeat(3, minmax(0, 1fr))');
    expect(markup).toContain('row-gap:20px');
    expect(markup).toContain('column-gap:16px');
  });

  it("renders the requested production display and feedback slice", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Stack gap="md">
          <Badge tone="success">활성</Badge>
          <Badge tone="strong" variant="outline">요약</Badge>
          <Tag tone="brand">유격수</Tag>
          <Card title="선수 카드" description="시즌 기록"><span>본문</span></Card>
          <ListRow title="경기 기록" description="오늘" href="/games" selected />
          <Notice title="안내" description="변경 사항입니다" tone="info" />
          <EmptyState title="기록 없음" description="첫 기록을 추가하세요" />
          <Progress label="업로드" value={45} valueText="45%" />
          <Spinner label="불러오는 중" />
          <Skeleton animated />
        </Stack>
      </HjmProvider>,
    );

    expect(markup).toContain('class="hjm-card');
    expect(markup).toContain('data-tone="strong" data-size="medium" data-variant="outline"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('<progress');
    expect(markup).toContain('aria-valuetext="45%"');
    expect(markup).toContain('aria-hidden="true"');
  });

  it("ships opt-in CSS with logical properties and reduced-motion fallbacks", () => {
    const css = readFileSync(
      fileURLToPath(new URL("../src/styles.css", import.meta.url)),
      "utf8",
    );
    expect(css).toContain("--hjm-type-body-size");
    expect(css).toContain("padding-inline");
    expect(css).toContain('[dir="rtl"]');
    expect(css).toContain("prefers-reduced-motion");
    expect(css).toContain('.hjm-badge[data-variant="outline"]');
    expect(css).toContain("font-size: var(--hjm-type-caption-size)");
    expect(css).toContain("font-weight: var(--hjm-font-weight-bold)");
  });
});

describe("Skeleton pulse", () => {
  /* The recipe owns the pulse. Before 0.9.13 the stylesheet repeated its
     duration, curve and opacity range as literals and defaulted the animation
     off, so a skeleton rendered as a frozen block and a recipe change could not
     reach the CSS. Gates read this stylesheet as text only — a whole release
     once shipped with an unbalanced brace — so the binding is asserted here. */
  it("renders the pulse without opting in", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Skeleton />
      </HjmProvider>,
    );
    expect(markup).toContain('data-shape="block"');
    expect(markup).toContain('data-animated="true"');
  });

  it("lets a caller opt out of the pulse", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Skeleton animated={false} />
      </HjmProvider>,
    );
    expect(markup).toContain('data-animated="false"');
  });

  it("emits the pulse geometry from the recipe instead of the stylesheet", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Skeleton />
      </HjmProvider>,
    );
    const { animation, shapes } = skeletonRecipe;
    expect(markup).toContain(
      `--hjm-skeleton-duration:${animation.duration}ms`,
    );
    expect(markup).toContain(
      `--hjm-skeleton-circle-size:${shapes.circle.defaultHeight}px`,
    );
    expect(markup).toContain(
      `--hjm-skeleton-from-opacity:${animation.fromOpacity}`,
    );
  });

  it("keeps the stylesheet free of a second copy of those numbers", () => {
    const css = readFileSync(
      fileURLToPath(new URL("../src/styles.css", import.meta.url)),
      "utf8",
    );
    const rule = css
      .split("\n")
      .find((line) => line.includes('.hjm-skeleton[data-animated="true"]'));
    expect(rule).toContain("var(--hjm-skeleton-duration)");
    expect(rule).toContain("var(--hjm-skeleton-easing)");
    expect(rule).not.toContain(`${skeletonRecipe.animation.duration}ms`);
    expect(css).toContain(
      "@keyframes hjm-pulse { from { opacity: var(--hjm-skeleton-from-opacity); } to { opacity: var(--hjm-skeleton-to-opacity); } }",
    );
  });
});

describe("SegmentedControl large-text layout", () => {
  /* The recipe declares that large text stacks the options; React Native reads
     it directly, and this renderer translates it into a stylesheet rule keyed on
     the browser's own font size. Binding the two here means a recipe that stops
     asking for stacking cannot leave the CSS behind. */
  it("translates the recipe's stacked layout into the stylesheet", () => {
    const css = readFileSync(
      fileURLToPath(new URL("../src/styles.css", import.meta.url)),
      "utf8",
    );
    const stacks = segmentedControlRecipe.adaptive.largeTextLayout === "stacked";
    const rule = /@media \(max-width: 11em\) \{\s*\.hjm-segmented__items \{[^}]*flex-direction: column;/;
    expect(rule.test(css)).toBe(stacks);
    if (!stacks) return;
    expect(css).toContain(".hjm-segmented__item { flex: 0 0 auto; min-inline-size: 0; }");
    // 브라우저 기본 글꼴만이 web의 large-text 신호가 아니다. provider에 textScale을
    // 선언한 제품은 `data-large-text`로 같은 전환을 받아야 한다 (#20).
    expect(css).toContain('[data-large-text="true"] .hjm-segmented__items { flex-direction: column;');
  });

  /* 계약은 임계값 하나를 말하는데(`stackAtFontScale`), 렌더러가 그것을 각자 숫자로
     다시 적으면 다시 갈라진다. provider가 내보내는 플래그가 그 임계값을 읽고 있는지
     여기서 묶는다 (#20). */
  it("publishes the recipe threshold as a provider flag", () => {
    expect(segmentedControlRecipe.adaptive.stackAtFontScale).toBe(largeTextThreshold);
    expect(isLargeTextScale(largeTextThreshold)).toBe(true);
    expect(isLargeTextScale(largeTextThreshold - 0.01)).toBe(false);

    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light" textScale={largeTextThreshold}>
        <SegmentedControl
          label="보기"
          items={[{ value: "list", label: "목록" }, { value: "grid", label: "격자" }]}
        />
      </HjmProvider>,
    );
    expect(markup).toContain('data-large-text="true"');

    const small = renderToStaticMarkup(
      <HjmProvider systemTheme="light" textScale={1}>
        <SegmentedControl
          label="보기"
          items={[{ value: "list", label: "목록" }, { value: "grid", label: "격자" }]}
        />
      </HjmProvider>,
    );
    expect(small).not.toContain("data-large-text");
  });

  /* 0.9.11 shipped this stylesheet with one closing brace too many. Every gate
     passed — the SSR assertions read the file as text, and the showcase bundler
     only warned — while the consumer's Next build failed outright on
     `Invalid empty selector`. The structure is now read as structure. */
  it("ships a structurally balanced stylesheet", () => {
    const css = readFileSync(
      fileURLToPath(new URL("../src/styles.css", import.meta.url)),
      "utf8",
    );
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    let depth = 0;
    let unbalanced = false;
    for (const character of withoutComments) {
      if (character === "{") depth += 1;
      if (character === "}") {
        depth -= 1;
        if (depth < 0) unbalanced = true;
      }
    }
    expect(unbalanced).toBe(false);
    expect(depth).toBe(0);
  });

  it("keeps the row as the default layout", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <SegmentedControl
          label="보기"
          items={[
            { value: "list", label: "목록으로 보기" },
            { value: "map", label: "지도로 보기" },
          ]}
        />
      </HjmProvider>,
    );
    expect(markup).toContain('class="hjm-segmented__items"');
    expect(markup).not.toContain("flex-direction");
  });
});
