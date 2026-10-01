import type { Meta, StoryObj } from "@storybook/react-native";
import { Effects, Icons, Faces, Transitions } from "./visual-previews";
const meta = { title: "배포/구성/시각 효과", component: Effects } satisfies Meta<typeof Effects>;
export default meta;
export const BackgroundEffects: StoryObj<typeof meta> = { name: "배경 효과",};
export const SemanticLucide: StoryObj<typeof meta> = { name: "의미별 루시드 아이콘", render: () => <Icons /> };
export const BlobatarFaces: StoryObj<typeof meta> = { name: "블로바타 표정", render: () => <Faces /> };

export const ContentMotion: StoryObj<typeof meta> = { name: "내용 전환 효과", render: () => <Transitions /> };
