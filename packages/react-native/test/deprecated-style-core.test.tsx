import type { ReactElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi, type MockInstance } from "vitest";

import {
  Agreement,
  Asset,
  AssetGroup,
  AuthProviderButton,
  BottomCTA,
  BottomInfo,
  Carousel,
  Collapsible,
  Container,
  Heading,
  HjmNativeProvider,
  Icon,
  IconButton,
  Link,
  Section,
  Steps,
  Text,
  Top,
  UploadItem,
  type IconButtonProps, type LinkProps, type BottomCTAProps, type ContainerProps, type IconProps, type SectionProps,
} from "../src/index.js";

// Placement remains public; removed visual props must not reach a host through untyped spreads.

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type StyleProps = Readonly<{ style?: object; layoutStyle?: object }>;
const noop = () => undefined;
const cases: ReadonlyArray<readonly [string, (props: StyleProps) => ReactElement]> = [
  ["IconButton", (p) => <IconButton label="닫기" onPress={noop} {...p}><View /></IconButton>],
  ["Link", (p) => <Link descriptor={{ label: "설정", destination: { kind: "internal", href: "/s" } }} onNavigate={noop} {...p} />],
  ["BottomCTA", (p) => <BottomCTA primaryAction={{ label: "계속", onPress: noop }} {...p} />],
  ["Agreement", (p) => (
    <Agreement
      descriptor={{ accessibilityLabel: "약관 동의", allLabel: "전체 동의", items: [{ id: "terms", label: "이용약관", required: true }] }}
      optionalLabel="(선택)"
      requiredLabel="(필수)"
      {...p}
    />
  )],
  ["Asset", (p) => <Asset descriptor={{ kind: "image", decorative: true }} {...p}><View /></Asset>],
  ["AssetGroup", (p) => <AssetGroup label="참여자" {...p}><View /><View /></AssetGroup>],
  ["AuthProviderButton", (p) => <AuthProviderButton descriptor={{ label: "Google", provider: "google" }} logo={<View />} onPress={noop} {...p} />],
  ["BottomInfo", (p) => <BottomInfo items={["안내"]} {...p} />],
  ["Carousel", (p) => (
    <Carousel
      composeAccessibleName={({ position, total, label }) => `${position}/${total} ${label}`}
      label="소식"
      labels={{ previous: "이전", next: "다음", pause: "멈추기", resume: "재생", navigation: "이동" }}
      renderSlide={({ label }) => <Text>{label}</Text>}
      slides={[{ id: "a", label: "첫 소식" }]}
      {...p}
    />
  )],
  ["Collapsible", (p) => <Collapsible trigger="더 보기" {...p}><Text>내용</Text></Collapsible>],
  ["Container", (p) => <Container {...p}><View /></Container>],
  ["Heading", (p) => <Heading level="level2" {...p}>제목</Heading>],
  ["Icon", (p) => <Icon descriptor={{ name: "close" }} renderGlyph={() => <View />} {...p} />],
  ["Section", (p) => <Section title="섹션" {...p}><View /></Section>],
  ["Steps", (p) => (
    <Steps
      composeAccessibleName={({ position, total, label }) => `${position}/${total} ${label}`}
      descriptor={{ steps: [{ id: "a", label: "A" }, { id: "b", label: "B" }], currentStepId: "a" }}
      statusLabels={{ pending: "예정", current: "현재", complete: "완료", error: "오류" }}
      {...p}
    />
  )],
  ["Top", (p) => <Top descriptor={{ title: "제목" }} {...p} />],
  ["UploadItem", (p) => (
    <UploadItem
      descriptor={{ id: "photo", name: "photo.png", state: { status: "uploading", progress: 0.4 } }}
      labels={{ pending: "대기", uploading: "업로드 중", success: "완료", cancel: "취소", retry: "재시도" }}
      onCancel={noop}
      {...p}
    />
  )],
];

function render(node: ReactElement): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<HjmNativeProvider reducedMotion theme="light">{node}</HjmNativeProvider>);
  });
  return renderer!;
}

function flatten(style: unknown): Record<string, unknown> {
  const resolved = typeof style === "function" ? style({ pressed: false }) : style;
  if (!Array.isArray(resolved)) return (resolved ?? {}) as Record<string, unknown>;
  return Object.assign({}, ...resolved.map(flatten));
}

function hasStyle(renderer: ReactTestRenderer, key: string, value: unknown): boolean {
  return renderer.root.findAll((node) => typeof node.type === "string" && node.props.style !== undefined)
    .some((node) => flatten(node.props.style)[key] === value);
}

let warn: MockInstance<typeof console.warn>;
beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => vi.restoreAllMocks());

describe("Native canonical style boundary", () => {
  it.each(cases)("%s applies layoutStyle without a deprecation warning", (_name, make) => {
    const renderer = render(make({ layoutStyle: { marginTop: 7 } }));
    expect(hasStyle(renderer, "marginTop", 7)).toBe(true);
    expect(warn).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });

  const guarded = ["IconButton", "Link", "BottomCTA", "Container", "Icon", "Section"];
  it.each(cases.filter(([name]) => guarded.includes(name)))(
    "%s rejects removed style from untyped callers", (_name, make) => {
      expect(() => render(make({ style: { marginTop: 9 } }))).toThrow(TypeError);
    },
  );
  it.each(cases.filter(([name]) => !guarded.includes(name)))("%s ignores removed style from untyped callers", (_name, make) => {
    const renderer = render(make({ style: { marginTop: 9 } }));
    expect(hasStyle(renderer, "marginTop", 9)).toBe(false);
    act(() => renderer.unmount());
  });

});

it("excludes removed core visual overrides from public types", () => {
  expectTypeOf<IconButtonProps>().not.toHaveProperty("style");
  expectTypeOf<LinkProps>().not.toHaveProperty("style");
  expectTypeOf<BottomCTAProps>().not.toHaveProperty("style");
  expectTypeOf<ContainerProps>().not.toHaveProperty("style");
  expectTypeOf<IconProps>().not.toHaveProperty("style");
  expectTypeOf<SectionProps>().not.toHaveProperty("style");
});
