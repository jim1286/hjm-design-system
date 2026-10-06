import type { Meta, StoryObj } from "@storybook/react-vite";
import { ServiceIntroductionPreview } from "./Landing.previews";
// 2026-10-06: 실험/화면/서비스 소개/제품 체험 중심 (with 설명과 사례 중심) merged here. The deployed id
// patterns-landing stays; the absorbed ids reference-product--* are retired in story-ids.json.
const meta = { id: "patterns-landing", title: "배포/화면/소개/서비스 소개", component: ServiceIntroductionPreview } satisfies Meta<typeof ServiceIntroductionPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Product: Story = { name: "제품 체험 중심", args: { variant: "product" } };
export const Editorial: Story = { name: "설명과 사례 중심", args: { variant: "editorial" } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const ProductDark: Story = { ...Product, name: "제품 체험 중심 · 어두운 테마", globals: { theme: "dark" } };
export const ProductLargeText: Story = { ...Product, name: "제품 체험 중심 · 큰 글자", globals: { textScale: "2" } };
export const EditorialDark: Story = { ...Editorial, name: "설명과 사례 중심 · 어두운 테마", globals: { theme: "dark" } };
export const EditorialLargeText: Story = { ...Editorial, name: "설명과 사례 중심 · 큰 글자", globals: { textScale: "2" } };
