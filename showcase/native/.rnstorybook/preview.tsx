import type { ReactNode } from "react";
import type { Preview } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HjmNativeProvider, useHjmNativeTheme } from "@hjmds/react-native/provider";

function Canvas({ children }: { children: ReactNode }) {
  const { colors } = useHjmNativeTheme();
  return <View style={[styles.canvas, { backgroundColor: colors.bg }]}>{children}</View>;
}

// Window insets reach every renderer through the provider, so overlays such as
// Sheet and DatePicker clear the home indicator without a per-story prop
// (2026-09-30 native audit).
function Insets({ children, theme, direction, textScale, reducedMotion }: {
  children: ReactNode; theme: "light" | "dark"; direction: "ltr" | "rtl"; textScale: 1 | 1.5 | 2; reducedMotion: boolean;
}) {
  const insets = useSafeAreaInsets();
  return <HjmNativeProvider theme={theme} direction={direction} textScale={textScale} reducedMotion={reducedMotion} safeAreaInsets={insets}>{children}</HjmNativeProvider>;
}

const preview: Preview = {
  // Put individual components first; grouped fixtures remain available for comparing composition.
  // Keep the same approval roots and conceptual layers as Web (STORYBOOK_NAVIGATION.md);
  // source/gallery-based grouping hid the difference between a control and a whole screen.
  parameters: { options: { storySort: { order: ["배포", ["토큰", "컴포넌트", ["개요", "전체 목록", "글자와 아이콘", "레이아웃", "동작", "입력", "탐색", "데이터 표시", "상태와 알림", "오버레이", "시각 효과", "기반 기능"], "구성", "화면"], "실험", ["토큰", "컴포넌트", ["개요", "전체 목록", "글자와 아이콘", "레이아웃", "동작", "입력", "탐색", "데이터 표시", "상태와 알림", "오버레이", "시각 효과", "기반 기능"], "구성", "화면"], "*"] } } },
  globalTypes: {
    theme: {
      name: "테마",
      defaultValue: "light",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "light", title: "밝은 테마" },
          { value: "dark", title: "어두운 테마" },
        ],
      },
    },
    direction: {
      name: "글 읽는 방향",
      defaultValue: "ltr",
      toolbar: {
        icon: "transfer",
        items: [
          { value: "ltr", title: "왼쪽에서 오른쪽" },
          { value: "rtl", title: "오른쪽에서 왼쪽" },
        ],
      },
    },
    textScale: {
      name: "글자 크기",
      defaultValue: "1",
      toolbar: {
        icon: "zoom",
        items: [
          { value: "1", title: "100%" },
          { value: "1.5", title: "150%" },
          { value: "2", title: "200%" },
        ],
      },
    },
    reducedMotion: {
      name: "움직임",
      defaultValue: "full",
      toolbar: {
        icon: "lightning",
        items: [
          { value: "full", title: "기본 움직임" },
          { value: "reduced", title: "동작 줄이기" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => (
      <Insets
        theme={context.globals.theme === "dark" ? "dark" : "light"}
        direction={context.globals.direction === "rtl" ? "rtl" : "ltr"}
        textScale={context.globals.textScale === "2" ? 2 : context.globals.textScale === "1.5" ? 1.5 : 1}
        reducedMotion={context.globals.reducedMotion === "reduced"}
      >
        <Canvas><Story /></Canvas>
      </Insets>
    ),
  ],
};

const styles = StyleSheet.create({ canvas: { flex: 1, padding: 16 } });

export default preview;
