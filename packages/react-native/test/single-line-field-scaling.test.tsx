import { fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import { typography } from "@hjmds/design-contracts/foundations";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { TextInput } from "react-native";
import { afterEach, expect, it } from "vitest";
import { HjmNativeProvider, SearchField, TextField } from "../src/index.js";
import { __setWindowDimensions } from "./react-native.mock.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function inputStyle(renderer: ReactTestRenderer) {
  const style = renderer.root.findByType(TextInput).props.style;
  return Object.assign({}, ...(Array.isArray(style) ? style : [style]));
}

afterEach(() => __setWindowDimensions({ width: 402, height: 874, scale: 3, fontScale: 1 }));

// 2026-10-07 user scope: OS maximum font size is excluded; preserve this historical fixture without running it.
it.skip("resizes the single-line frame with OS text, then shrinks after returning to normal", () => {
  let renderer!: ReactTestRenderer;
  const node = () => <HjmNativeProvider reducedMotion theme="light"><TextField accessibilityLabel="Folder name" value="QA folder" /></HjmNativeProvider>;
  act(() => { renderer = create(node()); });
  const normalHeight = inputStyle(renderer).minHeight;
  __setWindowDimensions({ width: 402, height: 874, scale: 3, fontScale: 3 });
  act(() => renderer.update(node()));
  const largeStyle = inputStyle(renderer);
  expect(largeStyle.minHeight).toBeGreaterThanOrEqual(typography[fieldRecipe.textVariant].lineHeight * 3 + fieldRecipe.paddingVertical * 2);
  expect(largeStyle.fontSize).toBe(typography[fieldRecipe.textVariant].fontSize);
  __setWindowDimensions({ width: 402, height: 874, scale: 3, fontScale: 1 });
  act(() => renderer.update(node()));
  expect(inputStyle(renderer).minHeight).toBe(normalHeight);
});

// 2026-10-07 user scope: OS maximum font size is excluded; preserve this historical fixture without running it.
it.skip("uses the controlled scale once when the OS uses a different scale", () => {
  __setWindowDimensions({ width: 402, height: 874, scale: 3, fontScale: 3 });
  let renderer!: ReactTestRenderer;
  act(() => { renderer = create(<HjmNativeProvider reducedMotion textScale={2} theme="light"><TextField accessibilityLabel="Name" /></HjmNativeProvider>); });
  const input = renderer.root.findByType(TextInput);
  expect(input.props.allowFontScaling).toBe(false);
  expect(inputStyle(renderer).minHeight).toBe(typography[fieldRecipe.textVariant].lineHeight * 2 + fieldRecipe.paddingVertical * 2);
});

// 2026-10-07 user scope: OS maximum font size is excluded; preserve this historical fixture without running it.
it.skip("keeps a non-scaling field at its ordinary frame size", () => {
  let ordinary!: ReactTestRenderer;
  act(() => { ordinary = create(<HjmNativeProvider reducedMotion theme="light"><TextField accessibilityLabel="Ordinary" /></HjmNativeProvider>); });
  const ordinaryHeight = inputStyle(ordinary).minHeight;
  __setWindowDimensions({ width: 402, height: 874, scale: 3, fontScale: 3 });
  let renderer!: ReactTestRenderer;
  act(() => { renderer = create(<HjmNativeProvider reducedMotion theme="light"><TextField accessibilityLabel="Code" allowFontScaling={false} /></HjmNativeProvider>); });
  expect(inputStyle(renderer).minHeight).toBe(ordinaryHeight);
});

// 2026-10-07 user scope: OS maximum font size is excluded; preserve this historical fixture without running it.
it.skip("matches an explicit native font multiplier limit when sizing the frame", () => {
  __setWindowDimensions({ width: 402, height: 874, scale: 3, fontScale: 3 });
  let capped!: ReactTestRenderer;
  let uncapped!: ReactTestRenderer;
  act(() => {
    capped = create(<HjmNativeProvider reducedMotion theme="light"><TextField accessibilityLabel="Limited" maxFontSizeMultiplier={2} /></HjmNativeProvider>);
    uncapped = create(<HjmNativeProvider reducedMotion theme="light"><TextField accessibilityLabel="Unrestricted" maxFontSizeMultiplier={0} /></HjmNativeProvider>);
  });
  expect(inputStyle(capped).minHeight).toBeLessThan(inputStyle(uncapped).minHeight);
  expect(inputStyle(capped).minHeight).toBeGreaterThanOrEqual(typography[fieldRecipe.textVariant].lineHeight * 2 + fieldRecipe.paddingVertical * 2);
});

// 2026-10-07 user scope: OS maximum font size is excluded; preserve this historical fixture without running it.
it.skip("also expands the shared search input frame without changing its text scale", () => {
  let renderer!: ReactTestRenderer;
  const node = () => <HjmNativeProvider reducedMotion theme="light"><SearchField accessibilityLabel="Search" clearLabel="Clear search" busyLabel="Searching" value="QA" /></HjmNativeProvider>;
  act(() => { renderer = create(node()); });
  const normal = inputStyle(renderer);
  __setWindowDimensions({ width: 402, height: 874, scale: 3, fontScale: 3 });
  act(() => renderer.update(node()));
  expect(inputStyle(renderer).minHeight).toBeGreaterThan(normal.minHeight);
  expect(inputStyle(renderer).fontSize).toBe(normal.fontSize);
});
