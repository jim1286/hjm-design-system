import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Animated, Pressable, Text as NativeText, View } from "react-native";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { glyph, toastRecipe, typography } from "@hjmds/design-contracts";
import { Toast } from "../src/feedback.js";
import { HjmNativeProvider } from "../src/provider.js";

// 2026-10-17 user: "기본 토스트 좌우랑 글자 라인이 안맞는데". The badge, first copy line and close glyph must share
// one centre and the glyph's end inset must mirror the badge's start inset; these assert the recipe-derived styles.
let renderer: ReactTestRenderer | undefined;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  renderer = undefined;
});
afterEach(() => { if (renderer) { const active = renderer; act(() => active.unmount()); } });
type Style = Record<string, unknown>;
function flatten(style: unknown): Style {
  const value = typeof style === "function" ? style({ pressed: false }) : style;
  if (Array.isArray(value)) return Object.assign({}, ...value.map(flatten)) as Style;
  return (value ?? {}) as Style;
}

async function renderToast(descriptor: Parameters<typeof Toast>[0]["descriptor"], textScale = 1) {
  await act(async () => {
    renderer = create(<HjmNativeProvider reducedMotion textScale={textScale}>
      <Toast descriptor={descriptor} renderToneIcon={() => <NativeText>!</NativeText>} />
    </HjmNativeProvider>);
  });
  const surface = flatten(renderer!.root.findAllByType(Animated.View)[0]!.props.style);
  const close = renderer!.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === "닫기")!;
  const views = renderer!.root.findAllByType(View);
  const copy = views.find(node => flatten(node.props.style).marginTop !== undefined && flatten(node.props.style).gap === toastRecipe.content.gap)!;
  const column = views.find(node => flatten(node.props.style).minHeight === toastRecipe.anchor.blockSize && flatten(node.props.style).flex === 1)!;
  return { surface, close: flatten(close.props.style), copy: flatten(copy.props.style), column: flatten(column.props.style) };
}

describe("Native toast first-line anchor", () => {
  it("derives the symmetric padding and close overhang from the recipe", async () => {
    const { surface, close, column } = await renderToast({ id: "saved", description: "저장했어요", closeLabel: "닫기", durationMs: null });
    expect(surface).toMatchObject({ paddingHorizontal: toastRecipe.surface.padding.inline, paddingVertical: toastRecipe.surface.padding.block });
    expect(surface.padding).toBeUndefined();
    // 44 target centred on the 32 anchor without stretching the row; glyph end sits on the md padding edge.
    expect(toastRecipe.close.blockOverhang).toBe((toastRecipe.close.diameter - toastRecipe.icon.badgeDiameter) / 2);
    expect(toastRecipe.close.inlineOverhang).toBe((toastRecipe.close.diameter - glyph[toastRecipe.close.glyph]) / 2);
    expect(close).toMatchObject({ width: toastRecipe.close.diameter, marginVertical: -toastRecipe.close.blockOverhang, marginEnd: -toastRecipe.close.inlineOverhang });
    // Single line: padding + anchor + padding is the recipe's single-line row.
    expect(toastRecipe.surface.padding.block * 2 + toastRecipe.anchor.blockSize).toBe(toastRecipe.surface.minHeight);
    expect(column.alignSelf).toBeUndefined();
  });

  it("centres the first line (title, else description) on the anchor at the rendered text scale", async () => {
    const description = await renderToast({ id: "saved", description: "저장했어요", closeLabel: "닫기", durationMs: null });
    expect(description.copy.marginTop).toBe((toastRecipe.anchor.blockSize - typography[toastRecipe.description.textVariant].lineHeight) / 2);
    act(() => renderer!.unmount()); renderer = undefined;
    const titled = await renderToast({ id: "retry", title: "연결을 확인해 주세요", description: "다시 시도할 수 있어요.", closeLabel: "닫기", durationMs: null }, 2);
    expect(titled.copy.marginTop).toBe((toastRecipe.anchor.blockSize - typography[toastRecipe.title.textVariant].lineHeight * 2) / 2);
  });
});
