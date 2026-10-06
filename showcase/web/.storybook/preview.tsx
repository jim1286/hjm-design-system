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
        // docs/STORYBOOK_NAVIGATION.md §1.2 (2026-10-06): stage → fixed category vocabulary; items alphabetical (ko)
        // except the ITEM_ORDER lists. Native preview carries the same literal; scripts/check-storybook.mjs (S8)
        // compares both against expectedStorySort(). Kept as a literal because Storybook statically reads this value.
        method: "alphabetical",
        locales: "ko",
        order: [
          "배포",
          [
            "토큰", ["색과 글자","공간과 크기","표면과 움직임","편집 도구"],
            "컴포넌트", ["개요",["사용 안내","컴포넌트 찾기","구현·검증 현황","글자와 아이콘 모아 보기","레이아웃 모아 보기","동작 모아 보기","입력 모아 보기","탐색 모아 보기","데이터 표시 모아 보기","상태와 알림 모아 보기","오버레이 모아 보기","기반 기능 모아 보기"],"글자와 아이콘","레이아웃","동작","입력","탐색","데이터 표시","상태와 알림","오버레이","시각 효과","기반 기능"],
            "구성", ["입력과 작성","선택과 필터","탐색과 이동","정보 표시","피드백과 복구","직접 조작과 모션","비교와 검증"],
            "화면", ["소개",["서비스 소개","온보딩","권한 안내"],"계정","설정","검색","콘텐츠","소통","화면 틀과 도구"],
          ],
          "실험",
          [
            "토큰", ["색과 글자","공간과 크기","표면과 움직임","편집 도구"],
            "컴포넌트", ["개요",["사용 안내","컴포넌트 찾기","구현·검증 현황","글자와 아이콘 모아 보기","레이아웃 모아 보기","동작 모아 보기","입력 모아 보기","탐색 모아 보기","데이터 표시 모아 보기","상태와 알림 모아 보기","오버레이 모아 보기","기반 기능 모아 보기"],"글자와 아이콘","레이아웃","동작","입력","탐색","데이터 표시","상태와 알림","오버레이","시각 효과","기반 기능"],
            "구성", ["입력과 작성","선택과 필터","탐색과 이동","정보 표시","피드백과 복구","직접 조작과 모션","비교와 검증"],
            "화면", ["소개",["서비스 소개","온보딩","권한 안내"],"계정","설정","검색","콘텐츠","소통","화면 틀과 도구"],
          ],
          "*",
        ],
      },
    },
  },
};

export default preview;
