import type { Meta, StoryObj } from "@storybook/react-native";
import { DataLayoutPreview as Demo } from "./data-layout-preview";
const meta = { title: "배포/구성/정보 표시/카드 묶음과 긴 목록", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const WindowedList: StoryObj<typeof meta> = { name: "가상 목록 예제", args: { mode: "virtual" } };
export const ShareCode: StoryObj<typeof meta> = { name: "공유 코드", args: { mode: "qr" } };
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
