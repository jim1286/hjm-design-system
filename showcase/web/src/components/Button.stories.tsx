import { Button, ButtonLink } from "@hjmds/react/actions";
import { HjmProvider } from "@hjmds/react/provider";
import { Stack } from "@hjmds/react/layout";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { ButtonStatePreview } from "./component-state-previews";

// Individual Button item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-actions--button keeps the same preview for old links.
const meta = { id: "components-actions-button", title: "배포/컴포넌트/동작/버튼", component: ContractStory, args: { name: "Button" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Pending: Story = { name: "처리 중", render: () => <ButtonStatePreview state="pending" /> };
export const Disabled: Story = { name: "비활성", render: () => <ButtonStatePreview state="disabled" /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

const raisedProfile = defineHjmDesignProfile({ controls: { button: { appearance: "raised", shape: "pill" } } });
export const Raised: Story = { name: "입체 버튼 · 제품 기본값 · 미게시", render: () => <HjmProvider designProfile={raisedProfile}><Stack gap="xs">
  <Button>계속하기</Button><Button tone="secondary">돌아가기</Button><Button loading>저장하기</Button><Button tone="ghost">조용한 행동</Button>
</Stack></HjmProvider> };

export const Navigation: Story = { name: "버튼형 이동 링크 · 미게시", render: () => <HjmProvider designProfile={raisedProfile}><Stack gap="sm"><Stack gap="xs"><ButtonLink href="#navigation-example">가이드 보기</ButtonLink><ButtonLink href="#navigation-example" tone="secondary" target="_blank" rel="noopener">새 탭으로 보기</ButtonLink><ButtonLink href="#navigation-example" disabled>사용할 수 없는 링크</ButtonLink></Stack><span id="navigation-example">이동 목적지</span></Stack></HjmProvider> };
