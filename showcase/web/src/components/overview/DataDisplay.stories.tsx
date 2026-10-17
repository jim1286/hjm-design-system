import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "../preview-registry";
import { componentStory } from "../story-factory";

// Role overview page: canonical components of one role on one page (Web only). Moved under 개요 on 2026-10-06 with its
// id kept so the old 배포/컴포넌트/<역할> URLs still open; each component also has its own item now (docs/STORYBOOK_NAVIGATION.md §1.2).
const meta = { includeStories: ["UploadItem","Avatar","Badge","CounterBadge","Card","List","ListRow","VirtualList","Accordion","Collapsible","Asset","Statistic","Timeline","Chart","DataTable","Tree","Calendar","Carousel","DescriptionList","Image","QRCode","Tag","ChatMessage","NotificationRow","NotificationItem","CommentThreadRow","ProfileSummary","IconTile"], id: "components-data-display", title: "배포/컴포넌트/개요/데이터 표시 모아 보기", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const UploadItem: Story = { ...componentStory("UploadItem"), name: "업로드 항목" };
export const Avatar: Story = { ...componentStory("Avatar"), name: "아바타" };
export const Badge: Story = { ...componentStory("Badge"), name: "배지" };
export const CounterBadge: Story = { ...componentStory("CounterBadge"), name: "숫자 배지" };
export const Card: Story = { ...componentStory("Card"), name: "카드" };
export const List: Story = { ...componentStory("List"), name: "목록" };
export const ListRow: Story = { ...componentStory("ListRow"), name: "목록 행" };
export const VirtualList: Story = { ...componentStory("VirtualList"), name: "가상 목록" };
// 렌더러를 만들지 않기로 한 행이다 — 토큰 계약만 있고 그리기는 제품 라이브러리 몫이다.
export const Accordion: Story = { ...componentStory("Accordion"), name: "아코디언" };
export const Collapsible: Story = { ...componentStory("Collapsible"), name: "접기와 펼치기" };
export const Asset: Story = { ...componentStory("Asset"), name: "이미지·영상 표시" };
export const Statistic: Story = { ...componentStory("Statistic"), name: "수치 표시" };
export const Timeline: Story = { ...componentStory("Timeline"), name: "타임라인" };
// Keep canonical overview coverage alongside the dedicated chart gallery.
export const Chart: Story = { ...componentStory("Chart"), name: "차트" };
export const DataTable: Story = { ...componentStory("DataTable"), name: "데이터 표" };
export const Tree: Story = { ...componentStory("Tree"), name: "트리 목록" };
// Catalog category data-display is the Storybook role too (2026-10-06 follow-up reverted the same-day move to 입력).
export const Calendar: Story = { ...componentStory("Calendar"), name: "달력" };
export const Carousel: Story = { ...componentStory("Carousel"), name: "캐러셀" };
export const DescriptionList: Story = { ...componentStory("DescriptionList"), name: "설명 목록" };
export const Image: Story = { ...componentStory("Image"), name: "이미지" };
export const QRCode: Story = { ...componentStory("QRCode"), name: "큐알 코드" };
export const Tag: Story = { ...componentStory("Tag"), name: "태그" };
// 2026-10-17 screen compositions registered.
export const ChatMessage: Story = { ...componentStory("ChatMessage"), name: "채팅 말풍선" };
export const NotificationRow: Story = { ...componentStory("NotificationRow"), name: "알림 미리보기 행" };
export const NotificationItem: Story = { ...componentStory("NotificationItem"), name: "알림 목록 항목" };
export const CommentThreadRow: Story = { ...componentStory("CommentThreadRow"), name: "댓글 행" };
export const ProfileSummary: Story = { ...componentStory("ProfileSummary"), name: "프로필 요약" };
export const IconTile: Story = { ...componentStory("IconTile"), name: "아이콘 타일" };
