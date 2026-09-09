import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, TextInput, View, type ViewStyle } from "react-native";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  Button,
  Field,
  HjmNativeProvider,
  Surface,
  TextArea,
  hjmCompositionStyleKeys,
  type ButtonProps,
  type FieldProps,
  type HjmCompositionStyle,
  type HjmCompositionStyleProp,
  type SurfaceProps,
  type TextAreaProps,
  type CardProps,
  type ContainerProps,
  type IconButtonProps,
  type SectionProps,
  type StackProps,
  type SwitchProps,
  type TagProps,
  type TextProps,
  type SheetProps,
  type SheetSize,
} from "../src/index.js";
import { sheetRecipe } from "@hjmds/design-contracts/recipes";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function render(node: React.ReactNode): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">
        {node}
      </HjmNativeProvider>,
    );
  });
  return renderer!;
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (!Array.isArray(style)) return (style ?? {}) as Record<string, unknown>;
  return Object.assign({}, ...style.map(flattenStyle));
}

describe("React Native composition style boundary", () => {
  it("exports one reusable layout-only type for Stable Core props", () => {
    const placement = {
      alignSelf: "stretch",
      flexGrow: 1,
      marginEnd: 8,
      marginTop: 16,
      width: "100%",
    } satisfies HjmCompositionStyle;

    expect(placement).toMatchObject({ flexGrow: 1, marginTop: 16, width: "100%" });
    expect(hjmCompositionStyleKeys).toEqual(expect.arrayContaining([
      "alignSelf",
      "flex",
      "marginTop",
      "width",
    ]));
    expectTypeOf<ButtonProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<SurfaceProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<FieldProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<TextAreaProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    // 배치 전용 style은 컴포넌트마다 따로 열지 않는다. 하나라도 빠지면 소비 앱이
    // 그 컴포넌트에서만 legacy `style`을 쓸 수밖에 없어 계약이 무너진다.
    expectTypeOf<TextProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<StackProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<ContainerProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<SectionProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<CardProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<TagProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<SwitchProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<IconButtonProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();

    type ControlledVisualValue = HjmCompositionStyle[
      | "backgroundColor"
      | "borderRadius"
      | "height"
      | "opacity"
      | "padding"
      | "transform"
    ];
    type ControlledVisualValueIsExcluded = NonNullable<ControlledVisualValue> extends never
      ? true
      : false;
    expectTypeOf<ControlledVisualValueIsExcluded>().toEqualTypeOf<true>();

    const invalidPlacement = {
      // @ts-expect-error Controlled visual keys are not composition styles.
      backgroundColor: "#ff0000",
    } satisfies HjmCompositionStyle;
    const invalidTypography = {
      // @ts-expect-error Text typography keys are not composition styles.
      fontSize: 20,
    } satisfies HjmCompositionStyle;
    const legacyVisualStyle: ViewStyle = { backgroundColor: "#00ff00" };
    const invalidButtonPlacement = {
      // @ts-expect-error A broad ViewStyle variable cannot bypass the composition boundary.
      layoutStyle: legacyVisualStyle,
    } satisfies Pick<ButtonProps, "layoutStyle">;
    void invalidPlacement;
    void invalidTypography;
    void invalidButtonPlacement;
  });

  it("adds canonical placement without changing legacy raw-style runtime behavior", () => {
    const renderer = render(
      <>
        <Button
          layoutStyle={{ marginTop: 8, width: "100%" }}
          onPress={() => undefined}
          style={{ backgroundColor: "#123456" }}
        >
          저장
        </Button>
        <Surface
          layoutStyle={{ flexGrow: 1, marginTop: 9 }}
          style={{ backgroundColor: "#234567" }}
          testID="legacy-surface"
        />
        <Field
          label="사용자 정의 필드"
          layoutStyle={{ marginTop: 10 }}
          style={{ backgroundColor: "#345678" }}
        >
          <View testID="field-control" />
        </Field>
        <TextArea
          accessibilityLabel="설명"
          containerStyle={{ backgroundColor: "#456789" }}
          inputStyle={{ fontSize: 31 }}
          layoutStyle={{ marginTop: 11 }}
        />
      </>,
    );

    const button = renderer.root.findByType(Pressable);
    expect(flattenStyle(button.props.style({ pressed: false }))).toMatchObject({
      backgroundColor: "#123456",
      marginTop: 8,
      width: "100%",
    });
    const surfaceHost = renderer.root.findAllByType(View).find(
      (node) => node.props.testID === "legacy-surface",
    );
    expect(flattenStyle(surfaceHost?.props.style)).toMatchObject({
      backgroundColor: "#234567",
      flexGrow: 1,
      marginTop: 9,
    });
    expect(flattenStyle(renderer.root.findByProps({ testID: "field-control" }).parent?.props.style))
      .toMatchObject({ backgroundColor: "#345678", marginTop: 10 });
    expect(flattenStyle(renderer.root.findByType(TextInput).props.style))
      .toMatchObject({ fontSize: 31 });
    const textAreaFrame = renderer.root.findAllByType(View).find((node) => {
      const style = flattenStyle(node.props.style);
      return style.backgroundColor === "#456789";
    });
    expect(flattenStyle(textAreaFrame?.props.style)).toMatchObject({
      backgroundColor: "#456789",
      marginTop: 11,
    });
  });
});

describe("sheet height axis", () => {
  it("keeps sheet height in the recipe instead of a caller style", () => {
    // 소비 제품이 `contentStyle={{ height: "60%" }}`로 시트 높이를 정하고 있었다.
    // 높이는 recipe 소유이므로 semantic 단계로 노출하고, contentStyle은 배치 전용으로
    // 좁혔다. auto는 내용이 높이를 정하고 maxHeightRatio가 상한을 잡는다.
    expect(sheetRecipe.sizes).toMatchObject({
      auto: null,
      medium: 0.6,
      large: 0.85,
      full: 1,
    });
    expect(sheetRecipe.defaults.size).toBe("auto");
    expectTypeOf<SheetProps["size"]>().toEqualTypeOf<SheetSize | undefined>();
    // contentStyle이 배치 전용으로 좁혀졌는지 확인한다. 시각 키는 타입에서 막힌다.
    type SheetContent = NonNullable<SheetProps["contentStyle"]>;
    expectTypeOf<{ marginTop: 4 }>().toMatchTypeOf<SheetContent>();
    // 시각 키는 never로 좁혀져 값을 넣을 수 없다.
    expectTypeOf<HjmCompositionStyle["height"]>().toEqualTypeOf<undefined>();
  });
});
