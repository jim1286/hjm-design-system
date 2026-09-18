import type { Meta, StoryObj } from "@storybook/react-vite";
import { Asset, AssetGroup } from "@hjmds/react/asset";
import { Stack, Text } from "@hjmds/react/layout";

/*
  한 줄에 아이콘·이미지·Lottie·비디오가 섞여 나오는 상황이 이 컴포넌트가 생긴 이유다.
  액자만 공통이고 안에 무엇을 넣을지는 제품이 정한다 — 여기서는 글자로 대신한다.
*/
export function AssetPreview() {
  return (
    <Stack gap="md">
      <AssetGroup label="오늘 도착한 편지들" size="large">
        <Asset descriptor={{ kind: "icon", size: "large", decorative: true }}><Text>◇</Text></Asset>
        <Asset descriptor={{ kind: "image", size: "large", accessibilityLabel: "숲 사진" }}><Text>🌲</Text></Asset>
        <Asset
          descriptor={{ kind: "lottie", size: "large", accessibilityLabel: "달리는 여우" }}
          accessory={<Text>▶</Text>}
        >
          {/* 재생 여부는 계약이 이미 판정해서 넘겨준다. */}
          {({ animate }) => <Text>{animate ? "🦊" : "🦊"}</Text>}
        </Asset>
      </AssetGroup>
      <Stack axis="inline" gap="sm">
        <Asset descriptor={{ kind: "image", size: "small", shape: "circle", accessibilityLabel: "작은 원형" }}><Text>🌙</Text></Asset>
        <Asset descriptor={{ kind: "image", size: "medium", shape: "square", accessibilityLabel: "중간 정사각" }}><Text>🌞</Text></Asset>
        <Asset descriptor={{ kind: "video", size: "xlarge", accessibilityLabel: "소개 영상", }} accessory={<Text>▶</Text>}><Text>🎬</Text></Asset>
      </Stack>
    </Stack>
  );
}

const meta = { title: "Patterns/Asset", component: AssetPreview } satisfies Meta<typeof AssetPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const MixedMedia: Story = {};
export const ReducedMotion: Story = { globals: { motion: "reduced" } };
