import { typography } from "@hjmds/design-contracts/foundations";
import { comboboxRecipe } from "@hjmds/design-contracts/recipes";
import { fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import { numberFieldRecipe } from "@hjmds/design-contracts/components/number-field";
import { sliderRecipe } from "@hjmds/design-contracts/components/slider";
import { type ReactElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Text as NativeText, TextInput } from "react-native";
import { afterEach, describe, expect, it } from "vitest";

import {
  Combobox,
  HjmNativeProvider,
  NumberField,
  Slider,
  Text,
  TextField,
} from "../src/index.js";
import { __setWindowDimensions } from "./react-native.mock.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function render(node: ReactElement): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(node, { createNodeMock: () => ({}) });
  });
  return renderer!;
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (!Array.isArray(style)) return (style ?? {}) as Record<string, unknown>;
  return Object.assign({}, ...style.map(flattenStyle));
}

function inputByLabel(renderer: ReactTestRenderer, label: string) {
  return renderer.root.findAllByType(TextInput).find(
    (input) => input.props.accessibilityLabel === label,
  )!;
}

function textByCopy(renderer: ReactTestRenderer, copy: string) {
  return renderer.root.findAllByType(NativeText).find(
    (text) => text.props.children === copy,
  )!;
}

function ProductControls() {
  return (
    <>
      <TextField accessibilityLabel="이름" allowFontScaling />
      <Combobox
        accessibilityLabel="도시"
        clearLabel="지우기"
        dismissLabel="닫기"
        emptyMessage="결과 없음"
        items={[{ id: "seoul", label: "서울", textValue: "서울" }]}
        loadingMessage="검색 중"
      />
      <NumberField
        accessibilityLabel="수량"
        allowFontScaling
        decrementLabel="감소"
        incrementLabel="증가"
        label="수량 레이블"
        max={10}
        min={0}
      />
      <Slider
        decrementLabel="낮추기"
        incrementLabel="높이기"
        label="점수 레이블"
        max={10}
        min={0}
      />
    </>
  );
}

afterEach(() => {
  __setWindowDimensions({ width: 800, height: 600, scale: 2, fontScale: 1 });
});

describe("Native Provider text-scale parity", () => {
  it("leaves OS scaling enabled and recipe sizes unmultiplied by default", () => {
    __setWindowDimensions({ width: 800, height: 600, scale: 2, fontScale: 2 });
    const renderer = render(
      <HjmNativeProvider reducedMotion theme="light">
        <ProductControls />
      </HjmNativeProvider>,
    );

    const field = inputByLabel(renderer, "이름");
    const combobox = inputByLabel(renderer, "도시");
    const number = inputByLabel(renderer, "수량");
    const sliderLabel = textByCopy(renderer, "점수 레이블");
    expect(field.props.allowFontScaling).toBe(true);
    expect(combobox.props.allowFontScaling).toBe(true);
    expect(number.props.allowFontScaling).toBe(true);
    expect(sliderLabel.props.allowFontScaling).toBe(true);
    expect(flattenStyle(field.props.style).fontSize)
      .toBe(typography[fieldRecipe.textVariant].fontSize);
    expect(flattenStyle(combobox.props.style).fontSize)
      .toBe(typography[comboboxRecipe.sizes.medium.textVariant].fontSize);
    expect(flattenStyle(number.props.style).fontSize)
      .toBe(typography[numberFieldRecipe.sizes.medium.textVariant].fontSize);
    expect(flattenStyle(sliderLabel.props.style).fontSize)
      .toBe(typography[sliderRecipe.sizes.medium.labelVariant].fontSize);
  });

  it("applies explicit scale 1 and 2 deterministically without a Native second pass", () => {
    __setWindowDimensions({ width: 800, height: 600, scale: 2, fontScale: 2 });
    const atOne = render(
      <HjmNativeProvider reducedMotion textScale={1} theme="light">
        <TextField accessibilityLabel="1배 입력" allowFontScaling />
      </HjmNativeProvider>,
    );
    const oneInput = inputByLabel(atOne, "1배 입력");
    expect(oneInput.props.allowFontScaling).toBe(false);
    expect(flattenStyle(oneInput.props.style).fontSize)
      .toBe(typography[fieldRecipe.textVariant].fontSize);

    const atTwo = render(
      <HjmNativeProvider reducedMotion textScale={2} theme="light">
        <ProductControls />
        <Text allowFontScaling style={{ fontSize: 11, lineHeight: 14 }}>
          사용자 크기
        </Text>
      </HjmNativeProvider>,
    );
    const field = inputByLabel(atTwo, "이름");
    const combobox = inputByLabel(atTwo, "도시");
    const number = inputByLabel(atTwo, "수량");
    const sliderLabel = textByCopy(atTwo, "점수 레이블");
    const customText = textByCopy(atTwo, "사용자 크기");
    const controls = [field, combobox, number, sliderLabel];
    expect(controls.every((control) => control.props.allowFontScaling === false)).toBe(true);
    expect(controls.every(
      (control) => control.props.maxFontSizeMultiplier === undefined,
    )).toBe(true);
    expect(flattenStyle(field.props.style).fontSize)
      .toBe(typography[fieldRecipe.textVariant].fontSize * 2);
    expect(flattenStyle(combobox.props.style).fontSize)
      .toBe(typography[comboboxRecipe.sizes.medium.textVariant].fontSize * 2);
    expect(flattenStyle(number.props.style).fontSize)
      .toBe(typography[numberFieldRecipe.sizes.medium.textVariant].fontSize * 2);
    expect(flattenStyle(sliderLabel.props.style).fontSize)
      .toBe(typography[sliderRecipe.sizes.medium.labelVariant].fontSize * 2);
    expect(customText.props.allowFontScaling).toBe(false);
    expect(flattenStyle(customText.props.style)).toMatchObject({
      fontSize: 22,
      lineHeight: 28,
    });
  });

  it("inherits or replaces a nested controlled scale instead of multiplying it", () => {
    const renderer = render(
      <HjmNativeProvider reducedMotion textScale={2} theme="light">
        <HjmNativeProvider>
          <TextField accessibilityLabel="상속 입력" />
        </HjmNativeProvider>
        <HjmNativeProvider textScale={1}>
          <TextField accessibilityLabel="재정의 입력" />
        </HjmNativeProvider>
      </HjmNativeProvider>,
    );
    const inherited = inputByLabel(renderer, "상속 입력");
    const replaced = inputByLabel(renderer, "재정의 입력");
    expect(inherited.props.allowFontScaling).toBe(false);
    expect(replaced.props.allowFontScaling).toBe(false);
    expect(flattenStyle(inherited.props.style).fontSize)
      .toBe(typography[fieldRecipe.textVariant].fontSize * 2);
    expect(flattenStyle(replaced.props.style).fontSize)
      .toBe(typography[fieldRecipe.textVariant].fontSize);
  });
});
