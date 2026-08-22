import React from "react";
import { AppRegistry, View } from "react-native";

import { Button, Link } from "@hjm/react-native/actions";
import { List, Statistic } from "@hjm/react-native/data-display";
import { reactNativeRendererEvidence } from "@hjm/react-native/evidence";
import { Notice, ToastRegion } from "@hjm/react-native/feedback";
import { Combobox, Field, Select } from "@hjm/react-native/forms";
import { Chip, SearchField } from "@hjm/react-native/inputs";
import { NumberField } from "@hjm/react-native/number-field";
import { Slider } from "@hjm/react-native/slider";
import {
  BottomNavigation,
  Menu,
} from "@hjm/react-native/navigation";
import { Dialog } from "@hjm/react-native/overlays";
import { Icon, Text } from "@hjm/react-native/primitives";
import { HjmNativeProvider } from "@hjm/react-native/provider";

const noop = () => undefined;

function MetroSmokeApp() {
  return React.createElement(
    HjmNativeProvider,
    { reducedMotion: true },
    React.createElement(
      View,
      null,
      React.createElement(Text, { variant: "title" }, "HJM Metro smoke"),
      React.createElement(Text, null, `${reactNativeRendererEvidence.components.length} claims`),
      React.createElement(Icon, {
        descriptor: { name: "check", decorative: true },
        renderGlyph: ({ name }) => React.createElement(Text, null, name),
      }),
      React.createElement(Button, { onPress: noop }, "저장"),
      React.createElement(Link, {
        descriptor: {
          label: "설정",
          destination: { kind: "internal", href: "/settings" },
        },
        onNavigate: noop,
      }),
      React.createElement(
        Field,
        { label: "계정" },
        React.createElement(Text, null, "fixture@example.com"),
      ),
      React.createElement(Select, {
        dismissLabel: "선택 목록 닫기",
        label: "언어",
        options: [
          { value: "ko", label: "한국어" },
          { value: "en", label: "English" },
        ],
        placeholder: "언어 선택",
      }),
      React.createElement(Combobox, {
        clearLabel: "선택 지우기",
        dismissLabel: "검색 결과 닫기",
        emptyMessage: "검색 결과가 없습니다",
        label: "도시",
        loadingMessage: "검색 중",
        items: [{ id: "seoul", label: "서울", textValue: "서울 Seoul" }],
      }),
      React.createElement(SearchField, {
        busyLabel: "검색 중",
        clearLabel: "검색어 지우기",
        label: "검색",
      }),
      React.createElement(NumberField, {
        decrementLabel: "인원 줄이기",
        incrementLabel: "인원 늘리기",
        label: "인원",
        max: 8,
        min: 1,
      }),
      React.createElement(Slider, {
        decrementLabel: "점수 낮추기",
        incrementLabel: "점수 높이기",
        label: "점수",
        max: 100,
        min: 0,
      }),
      React.createElement(Chip, { label: "필터", onPress: noop }),
      React.createElement(BottomNavigation, {
        descriptor: {
          accessibilityLabel: "주요 메뉴",
          items: [
            { id: "home", label: "홈", icon: { name: "home" } },
            { id: "profile", label: "프로필", icon: { name: "user" } },
          ],
          selectedKey: "home",
        },
        onActivate: noop,
        renderIcon: ({ name }) => React.createElement(Text, null, name),
      }),
      React.createElement(Menu, {
        dismissLabel: "메뉴 닫기",
        triggerLabel: "더보기",
        items: [{ value: "edit", label: "수정" }],
        onSelect: noop,
      }),
      React.createElement(
        List,
        { label: "지표" },
        React.createElement(Statistic, {
          descriptor: { id: "orders", label: "주문", value: "12" },
        }),
      ),
      React.createElement(Notice, { title: "번들 확인", tone: "success" }),
      React.createElement(ToastRegion, null),
      React.createElement(Dialog, { closeLabel: "닫기", defaultOpen: false, title: "확인" }),
    ),
  );
}

AppRegistry.registerComponent("HjmMetroSmoke", () => MetroSmokeApp);
