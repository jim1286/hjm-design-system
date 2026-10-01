import type { Preview } from "@storybook/react-vite";

import { WebDesignSystemProvider } from "../src/runtime/WebDesignSystemProvider";
import "@hjmds/react/styles.css";
import "../src/showcase.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "테마",
      description: "디자인 시스템 색상 테마",
      defaultValue: "light",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "light", title: "밝은 테마" },
          { value: "dark", title: "어두운 테마" },
        ],
        dynamicTitle: true,
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
        dynamicTitle: true,
      },
    },
    textScale: {
      name: "글자 크기",
      defaultValue: "1",
      toolbar: {
        icon: "paragraph",
        items: [
          { value: "1", title: "100%" },
          { value: "1.5", title: "150%" },
          { value: "2", title: "200%" },
        ],
        dynamicTitle: true,
      },
    },
    motion: {
      name: "움직임",
      defaultValue: "full",
      toolbar: {
        icon: "lightning",
        items: [
          { value: "full", title: "기본 움직임" },
          { value: "reduced", title: "동작 줄이기" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === "dark" ? "dark" : "light";
      const direction = context.globals.direction === "rtl" ? "rtl" : "ltr";
      const rawTextScale = Number(context.globals.textScale);
      const textScale = [1, 1.5, 2].includes(rawTextScale) ? rawTextScale : 1;
      const reducedMotion = context.globals.motion === "reduced";

      return (
        <WebDesignSystemProvider
          edgeToEdge={context.parameters.hjm?.edgeToEdge === true}
          input={{ direction, reducedMotion, textScale, theme }}
          systemTheme="light"
        >
          <Story />
        </WebDesignSystemProvider>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    a11y: { test: "error" },
    options: {
      storySort: {
        // Share approval roots and conceptual layers with Native (STORYBOOK_NAVIGATION.md);
        // source/gallery-based grouping hid the difference between a control and a whole screen.
        order: ["배포", ["토큰", "컴포넌트", ["개요", "전체 목록", "글자와 아이콘", "레이아웃", "동작", "입력", "탐색", "데이터 표시", "상태와 알림", "오버레이", "시각 효과", "기반 기능"], "구성", "화면"], "실험", ["토큰", "컴포넌트", ["개요", "전체 목록", "글자와 아이콘", "레이아웃", "동작", "입력", "탐색", "데이터 표시", "상태와 알림", "오버레이", "시각 효과", "기반 기능"], "구성", "화면"], "*"],
      },
    },
  },
};

export default preview;
