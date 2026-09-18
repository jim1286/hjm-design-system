import { Agreement } from "@hjmds/react-native/agreement";
import { AuthProviderButton } from "@hjmds/react-native/provider-button";
import { Heading } from "@hjmds/react-native/heading";
import { ToggleGroup } from "@hjmds/react-native/toggle-group";
import { BottomInfo } from "@hjmds/react-native/bottom-info";
import { Collapsible } from "@hjmds/react-native/collapsible";
import { Asset } from "@hjmds/react-native/asset";
import { TagsInput } from "@hjmds/react-native/tags-input";
import { DateRangePicker } from "@hjmds/react-native/date-range";
import { Mentions } from "@hjmds/react-native/mentions";
import { TransferList } from "@hjmds/react-native/transfer-list";
import { KeyboardAvoiding } from "@hjmds/react-native/keyboard";
import { Top } from "@hjmds/react-native/top";
import { Calendar } from "@hjmds/react-native/calendar";
import { FloatingActionButton } from "@hjmds/react-native/floating-action-button";
import React from "react";
import { AppRegistry, View } from "react-native";

import { Button, Link } from "@hjmds/react-native/actions";
import { Carousel } from "@hjmds/react-native/carousel";
import { TopBar } from "@hjmds/react-native/top-bar";
import { BottomCTA } from "@hjmds/react-native/bottom-cta";
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
      React.createElement(FloatingActionButton, {
        descriptor: { label: "새 기록", icon: { name: "add" } },
        renderIcon: () => React.createElement(Text, null, "＋"), onContentClearanceChange: noop,
      }),
      React.createElement(TopBar, { title: "새 소식" }),
      React.createElement(Carousel, {
        label: "새 소식",
        slides: [{ id: "one", label: "첫 소식" }, { id: "two", label: "다음 소식" }],
        labels: { previous: "이전", next: "다음", pause: "멈춤", resume: "재생", navigation: "소식 이동" },
        composeAccessibleName: ({ position, total, label }) => `${position}/${total} ${label}`,
        renderSlide: ({ label }) => React.createElement(Text, null, label),
      }),
      React.createElement(BottomCTA, { primaryAction: { label: "계속", onPress: noop } }),
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
      React.createElement(Calendar, { descriptor: { grid: { cells: Array.from({ length: 7 }, (_, index) => ({ date: `2026-09-0${index + 1}` })), weekdayLabels: ["S", "M", "T", "W", "T", "F", "S"], todayDate: "2026-09-01" }, monthLabel: "September" }, composeAccessibleName: ({ date }) => date }),
      React.createElement(Heading, { level: "level2" }, "기록 모아보기"),
      React.createElement(KeyboardAvoiding, { safeAreaBottom: 34 }, React.createElement(View, null)),
      React.createElement(BottomInfo, { items: ["가입하면 약관에 동의하는 것으로 봅니다"] }),
      React.createElement(Collapsible, { trigger: "배송 정보 더 보기", defaultOpen: true }, null),
      React.createElement(Asset, { descriptor: { kind: "lottie", accessibilityLabel: "편지를 나르는 동물" } }, null),
      React.createElement(TagsInput, { label: "관심사", composeRemoveLabel: (tag) => `${tag} 지우기` }),
      React.createElement(DateRangePicker, {
        descriptor: { grid: calendarGrid, monthLabel: "2027년 2월" },
        composeAccessibleName: ({ date }) => date,
        rangeLabels: { start: "시작일", end: "종료일", between: "기간 안" },
      }),
      React.createElement(Mentions, {
        accessibilityLabel: "메모", value: "", onValueChange: () => {},
        triggers: [{ id: "user", trigger: "@" }], candidates: [],
        emptyMessage: "결과가 없어요", listLabel: "추천 대상",
      }),
      React.createElement(TransferList, {
        items: [{ id: "walk", label: "산책", textValue: "산책" }],
        labels: { source: "가능", target: "선택", toTarget: "추가", toSource: "빼기", selectAll: "모두 선택", empty: "없음" },
      }),
      React.createElement(ToggleGroup, { descriptor: { accessibilityLabel: "글자 꾸미기", items: [{ id: "bold", label: "굵게" }] } }),
      React.createElement(Top, { descriptor: { title: "오늘 기록", description: "짧아도 괜찮아요" } }),
      React.createElement(Agreement, {
        descriptor: {
          accessibilityLabel: "약관 동의",
          allLabel: "전체 동의하기",
          items: [{ id: "terms", label: "이용약관", required: true, detail: { label: "전문 보기" } }],
        },
        optionalLabel: "(선택)",
        requiredLabel: "(필수)",
      }),
      React.createElement(AuthProviderButton, {
        descriptor: { label: "Google로 계속하기", provider: "google" },
        logo: React.createElement(View, null),
        onPress: noop,
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
