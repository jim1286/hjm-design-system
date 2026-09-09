import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  Badge,
  Button,
  Container,
  CounterBadge,
  Grid,
  HjmProvider,
  IconButton,
  ListRow,
  Stack,
  Surface,
  Switch,
  Tag,
  Text,
  hjmCompositionStyleKeys,
  type ContainerProps,
  type GridProps,
  type HjmCompositionStyle,
  type HjmCompositionStyleProp,
  type StackProps,
  type SurfaceProps,
  type TextProps,
} from "../src/index.js";

describe("web composition style", () => {
  it("accepts layout-only placement on the component roots that apps place directly", () => {
    // 배치 전용 style은 컴포넌트마다 따로 열지 않는다. 하나라도 빠지면 소비 앱이
    // 그 컴포넌트에서만 legacy `style`을 쓰게 되어 계약이 무너진다.
    expectTypeOf<StackProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<SurfaceProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<ContainerProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<GridProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<TextProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
  });

  it("keeps physical direction out of the key set so RTL placement stays logical", () => {
    expect(hjmCompositionStyleKeys).toEqual(expect.arrayContaining([
      "alignSelf",
      "flexGrow",
      "marginInline",
      "marginInlineStart",
      "marginTop",
      "width",
    ]));
    expect(hjmCompositionStyleKeys).not.toContain("marginLeft");
    expect(hjmCompositionStyleKeys).not.toContain("marginRight");
  });

  it("excludes the visual keys the recipe owns", () => {
    type Controlled = HjmCompositionStyle[
      | "backgroundColor"
      | "borderRadius"
      | "color"
      | "gap"
      | "height"
      | "padding"
    ];
    expectTypeOf<Controlled>().toEqualTypeOf<undefined>();
  });

  it("applies placement after the legacy style so layout wins", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider theme="light" systemTheme="light">
        <Stack layoutStyle={{ marginTop: 8, width: "100%" }} style={{ marginTop: 2 }}>
          <Text>content</Text>
        </Stack>
      </HjmProvider>,
    );
    expect(markup).toContain("margin-top:8px");
    expect(markup).toContain("width:100%");
  });

  it("places every root the apps use, not only Stack", () => {
    // 한 컴포넌트만 렌더로 확인하면 나머지는 타입만 맞고 실제 적용이 빠져도 통과한다.
    const markup = renderToStaticMarkup(
      <HjmProvider theme="light" systemTheme="light">
        <Container layoutStyle={{ marginTop: 4 }}>
          <Surface layoutStyle={{ marginInlineStart: 6 }}>
            <Grid columns={{ compact: 1, medium: 2 }} layoutStyle={{ marginBottom: 5 }}>
              <Text layoutStyle={{ alignSelf: "center" }}>content</Text>
            </Grid>
          </Surface>
        </Container>
      </HjmProvider>,
    );
    expect(markup).toContain("margin-top:4px");
    expect(markup).toContain("margin-inline-start:6px");
    expect(markup).toContain("margin-bottom:5px");
    expect(markup).toContain("align-self:center");
  });

  it("places the remaining roots that pass style through to the element", () => {
    // 이 컴포넌트들은 `style`을 직접 다루지 않고 `...props`로 흘려보내므로,
    // 타입만 열고 병합을 빼먹기 쉽다. 마크업으로 실제 적용을 확인한다.
    const markup = renderToStaticMarkup(
      <HjmProvider theme="light" systemTheme="light">
        <Badge layoutStyle={{ marginTop: 11 }}>badge</Badge>
        <Tag layoutStyle={{ marginTop: 12 }}>tag</Tag>
        <Button layoutStyle={{ marginTop: 13 }}>button</Button>
        <IconButton label="icon" layoutStyle={{ marginTop: 14 }}>
          <span>i</span>
        </IconButton>
        <CounterBadge count={3} layoutStyle={{ marginTop: 15 }} />
        <Switch checked={false} label="switch" layoutStyle={{ marginTop: 16 }} />
        <ListRow title="row" layoutStyle={{ marginTop: 17 }} />
      </HjmProvider>,
    );
    for (const px of [11, 12, 13, 14, 15, 16, 17]) {
      expect(markup).toContain(`margin-top:${px}px`);
    }
  });
});
