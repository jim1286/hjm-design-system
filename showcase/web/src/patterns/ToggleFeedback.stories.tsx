import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleFeedbackPreview } from "./toggle-feedback-preview";
import { Container } from "@hjmds/react/layout";
const meta={id:"compositions-toggle-feedback",title:"실험/구성/직접 조작과 모션/선택 반응 버튼",component:ToggleFeedbackPreview,decorators:[(Story)=><Container size="reading"><Story/></Container>]} satisfies Meta<typeof ToggleFeedbackPreview>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Default:Story={name:"기본"};
export const Dark:Story={name:"어두운 테마",globals:{theme:"dark"}};
export const LargeText:Story={name:"큰 글자",globals:{textScale:"2"}};
