import type { Meta, StoryObj } from "@storybook/react-vite";
import { Duration, Confirm, Reactions, Notifications } from "./compound-previews";
const meta={ includeStories: ["DurationPicker","InlineConfirmation","EmojiReactions","NotificationFeedback"],id: "gallery-compound-controls", title: "배포/구성/복합 입력",component:Duration} satisfies Meta<typeof Duration>;
export default meta;
export const DurationPicker:StoryObj<typeof meta>={ name: "소요 시간 선택",};
export const InlineConfirmation:StoryObj<typeof meta>={ name: "버튼 안에서 확인",render:()=> <Confirm/>};

export const EmojiReactions:StoryObj<typeof meta>={ name: "이모지 반응",render:()=> <Reactions/>};
export const NotificationFeedback:StoryObj<typeof meta>={ name: "알림 상태",render:()=> <Notifications/>};
