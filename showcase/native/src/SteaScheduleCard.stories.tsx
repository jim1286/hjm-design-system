import type { Meta, StoryObj } from "@storybook/react-native";
import { ScheduleDayList } from "./stea-composition-previews";
// STEA Code 후보 검토(docs/plans/stea-code-adoption-2026-10-02.md). 2026-10-02 사용자 승인으로 실험에서 배포로 옮겼다(Web id 보존).
const meta = { title: "배포/구성/선택과 필터/날짜 선택과 예정 목록", component: ScheduleDayList } satisfies Meta<typeof ScheduleDayList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
