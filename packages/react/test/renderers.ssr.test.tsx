import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolveDesignSystemProviderValue } from "@hjm/design-contracts/components/design-system-provider";
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
