import type { Meta, StoryObj } from "@storybook/react-vite";
import { TransferTask } from "@hjmds/react/transfer-task";
import { Container,Stack,Text } from "@hjmds/react/layout";
import { transferLabels,formatTransfer,receiveTransfer } from "../../../shared/transfer-task-example";
function Preview(){return <Stack gap="md"><TransferTask labels={transferLabels} formatProgress={formatTransfer} onTransfer={async context=>{
 const response=await fetch(new URL("../../../shared/assets/reference-video/preview.mp4",import.meta.url),{signal:context.signal});await receiveTransfer(response,context);
 }}/><Text variant="caption">로컬 예제 영상의 실제 응답 바이트를 읽습니다. 파일 저장·공유는 제품에서 연결합니다.</Text></Stack>;}
const meta={id:"compositions-transfer-task",title:"배포/구성/피드백과 복구/전송 진행과 취소",component:Preview,decorators:[Story=><Container size="reading"><Story/></Container>]} satisfies Meta<typeof Preview>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={name:"기본"};export const Dark:Story={name:"어두운 테마",globals:{theme:"dark"}};export const LargeText:Story={name:"큰 글자",globals:{textScale:"2"}};
