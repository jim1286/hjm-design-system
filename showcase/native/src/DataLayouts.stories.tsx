import type { Meta, StoryObj } from "@storybook/react-native";
import { DataLayoutPreview as Demo } from "./data-layout-preview";
const meta = { title: "배포/구성/데이터 배치", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
export const PackedCards: StoryObj<typeof meta> = { name: "카드 묶음",};
export const WindowedList: StoryObj<typeof meta> = { name: "가상 목록 예제", args: { mode: "virtual" } };
export const ShareCode: StoryObj<typeof meta> = { name: "공유 코드", args: { mode: "qr" } };
