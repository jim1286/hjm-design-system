import type {Meta, StoryObj} from "@storybook/react-vite";
import {FoundationValues} from "./token-reference-previews";
const meta = {id: "foundations-effects", title:"배포/토큰/표면과 움직임/그림자와 투명도", component:FoundationValues, args:{group:"effects"}, parameters:{controls:{disable:true}}} satisfies Meta<typeof FoundationValues>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {name:"기본"};
export const Dark: Story = {name:"어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = {name:"큰 글자",globals:{textScale:"2"}};
