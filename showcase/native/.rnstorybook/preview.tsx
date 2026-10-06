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
  // Same literal as Web (.storybook/preview.tsx) and scripts/check-storybook.mjs expectedStorySort(); the checker fails
  // on any difference, so change all three with docs/STORYBOOK_NAVIGATION.md §1. Titles are
  // `<배포|실험>/<단계>/<분류>/<항목>` (2026-10-06 spec). `alphabetical` + `ko` orders items that `order` does not list
  // (가나다); Native 10.4.4 sorts its on-device index with the same storybook preview-api storySort as Web.
  // The 컴포넌트/개요 entries exist only on Web; listing them here keeps one literal for both platforms.
  parameters: {
    options: {
      storySort: {
        method: "alphabetical",
        locales: "ko",
        order: [
          "배포", ["토큰", ["색과 글자", "공간과 크기", "표면과 움직임", "편집 도구"],
          "컴포넌트", ["개요", ["사용 안내", "컴포넌트 찾기", "구현·검증 현황", "글자와 아이콘 모아 보기", "레이아웃 모아 보기", "동작 모아 보기", "입력 모아 보기", "탐색 모아 보기", "데이터 표시 모아 보기", "상태와 알림 모아 보기", "오버레이 모아 보기", "기반 기능 모아 보기"], "글자와 아이콘", "레이아웃", "동작", "입력", "탐색", "데이터 표시", "상태와 알림", "오버레이", "시각 효과", "기반 기능"],
          "구성", ["입력과 작성", "선택과 필터", "탐색과 이동", "정보 표시", "피드백과 복구", "직접 조작과 모션", "비교와 검증"],
          "화면", ["소개", ["서비스 소개", "온보딩", "권한 안내"], "계정", "설정", "검색", "콘텐츠", "소통", "화면 틀과 도구"]],
          "실험", ["토큰", ["색과 글자", "공간과 크기", "표면과 움직임", "편집 도구"],
          "컴포넌트", ["개요", ["사용 안내", "컴포넌트 찾기", "구현·검증 현황", "글자와 아이콘 모아 보기", "레이아웃 모아 보기", "동작 모아 보기", "입력 모아 보기", "탐색 모아 보기", "데이터 표시 모아 보기", "상태와 알림 모아 보기", "오버레이 모아 보기", "기반 기능 모아 보기"], "글자와 아이콘", "레이아웃", "동작", "입력", "탐색", "데이터 표시", "상태와 알림", "오버레이", "시각 효과", "기반 기능"],
          "구성", ["입력과 작성", "선택과 필터", "탐색과 이동", "정보 표시", "피드백과 복구", "직접 조작과 모션", "비교와 검증"],
          "화면", ["소개", ["서비스 소개", "온보딩", "권한 안내"], "계정", "설정", "검색", "콘텐츠", "소통", "화면 틀과 도구"]],
          "*",
        ],
      },
    },
  },
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
    // `motion` matches the Web toolbar key so stories can set the same globals on both platforms
    // (was `reducedMotion` here until the 2026-10-06 Storybook spec).
    motion: {
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
        reducedMotion={context.globals.motion === "reduced"}
      >
        <Canvas><Story /></Canvas>
      </Insets>
    ),
  ],
};

const styles = StyleSheet.create({ canvas: { flex: 1, padding: 16 } });

export default preview;
