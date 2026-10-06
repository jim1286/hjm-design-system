import type {Meta, StoryObj} from "@storybook/react-vite";
import {FoundationValues} from "./token-reference-previews";
const meta = {id: "foundations-stroke", title:"배포/토큰/표면과 움직임/테두리", component:FoundationValues, args:{group:"stroke"}, parameters:{controls:{disable:true}}} satisfies Meta<typeof FoundationValues>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {name:"기본"};
export const Dark: Story = {name:"어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = {name:"큰 글자",globals:{textScale:"2"}};
