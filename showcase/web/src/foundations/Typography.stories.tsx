import type {Meta, StoryObj} from "@storybook/react-vite";
import {FoundationValues} from "./token-reference-previews";
const meta = {id: "foundations-typography", title:"배포/토큰/타이포그래피", component:FoundationValues, args:{group:"typography"}, parameters:{controls:{disable:true}}} satisfies Meta<typeof FoundationValues>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Roles: Story = {name:"기본"};
export const Dark: Story = {name:"어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = {name:"큰 글자",globals:{textScale:"2"}};
