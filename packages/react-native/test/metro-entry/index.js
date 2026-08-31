import React from "react";
import { AppRegistry, View } from "react-native";

import { Button, Link } from "@hjmds/react-native/actions";
import { hjmCompositionStyleKeys } from "@hjmds/react-native/composition-style";
import { List, Statistic } from "@hjmds/react-native/data-display";
import { DatePicker } from "@hjmds/react-native/date-picker";
import { reactNativeRendererEvidence } from "@hjmds/react-native/evidence";
import { Notice, ToastRegion } from "@hjmds/react-native/feedback";
import { FilePicker } from "@hjmds/react-native/file-picker";
import { Combobox, Field, Select } from "@hjmds/react-native/forms";
import { Chip, SearchField } from "@hjmds/react-native/inputs";
import { NumberField } from "@hjmds/react-native/number-field";
import { OtpField } from "@hjmds/react-native/otp-field";
import { PasswordField } from "@hjmds/react-native/password-field";
import { Slider } from "@hjmds/react-native/slider";
import { Steps } from "@hjmds/react-native/steps";
import { UploadItem } from "@hjmds/react-native/upload-item";
import {
  BottomNavigation,
  Menu,
} from "@hjmds/react-native/navigation";
import { Dialog } from "@hjmds/react-native/overlays";
import { Icon, Text } from "@hjmds/react-native/primitives";
import { HjmNativeProvider } from "@hjmds/react-native/provider";

const noop = () => undefined;
const calendarGrid = {
  cells: [
    ...Array.from({ length: 3 }, () => ({})),
    ...Array.from({ length: 28 }, (_, index) => ({ date: `2027-02-${String(index + 1).padStart(2, "0")}` })),
    ...Array.from({ length: 4 }, () => ({})),
  ],
  weekdayLabels: ["일", "월", "화", "수", "목", "금", "토"],
  todayDate: "2027-02-19",
};

function MetroSmokeApp() {
  return React.createElement(
    HjmNativeProvider,
    { reducedMotion: true },
    React.createElement(
      View,
      null,
      React.createElement(Text, { variant: "title" }, "HJM Metro smoke"),
      React.createElement(Text, null, `${reactNativeRendererEvidence.components.length} claims`),
      React.createElement(Text, null, `${hjmCompositionStyleKeys.length} composition keys`),
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
      React.createElement(PasswordField, {
        autofillHint: "current",
        concealLabel: "비밀번호 숨기기",
        label: "비밀번호",
        revealLabel: "비밀번호 보기",
      }),
      React.createElement(OtpField, {
        label: "인증번호",
        length: 6,
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
      React.createElement(DatePicker, {
        clearLabel: "날짜 지우기",
        closeLabel: "달력 닫기",
        composeAccessibleName: ({ date }) => date,
        descriptor: {
          grid: calendarGrid,
          displayValue: null,
          placeholder: "날짜 선택",
          label: "날짜",
          defaultSelectedDate: null,
          defaultOpen: false,
        },
        monthLabel: "2027년 2월",
      }),
      React.createElement(FilePicker, {
        buttonLabel: "파일 선택",
        descriptor: { accept: ["image/*"] },
        label: "첨부 파일",
        onPick: async () => null,
        onPickError: noop,
        onSelect: noop,
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
      React.createElement(Steps, {
        composeAccessibleName: ({ position, total, label }) => `${total} 중 ${position}, ${label}`,
        descriptor: { steps: [{ id: "a", label: "계정" }, { id: "b", label: "확인" }], currentStepId: "b" },
        statusLabels: { pending: "예정", current: "현재", complete: "완료", error: "오류" },
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
      React.createElement(UploadItem, {
        descriptor: { id: "photo", name: "photo.png", state: { status: "uploading", progress: 0.5 } },
        labels: { pending: "대기", uploading: "업로드 중", success: "완료", cancel: "취소", retry: "재시도" },
        onCancel: noop,
      }),
      React.createElement(ToastRegion, null),
      React.createElement(Dialog, { closeLabel: "닫기", defaultOpen: false, title: "확인" }),
    ),
  );
}

AppRegistry.registerComponent("HjmMetroSmoke", () => MetroSmokeApp);
