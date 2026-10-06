import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PhotoSourceSheet } from "@hjmds/react/screen-flows";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
function Preview({cameraAvailable=true}:{cameraAvailable?:boolean}){
 const [open,setOpen]=useState(false),[source,setSource]=useState("");
 return <Stack gap="md"><Button onClick={()=>setOpen(true)}>사진 추가</Button><Text>{source}</Text><PhotoSourceSheet open={open} onOpenChange={setOpen} cameraAvailable={cameraAvailable} onSelect={value=>setSource(value==="camera"?"촬영 선택 — 제품이 카메라를 열어요":"앨범 선택 — 제품이 선택기를 열어요")} labels={{title:"사진 추가",library:"앨범에서 선택",camera:"사진 촬영",cancel:"취소"}}/></Stack>;
}
const meta={title:"실험/구성/사진/촬영과 앨범 선택",component:Preview} satisfies Meta<typeof Preview>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Default:Story={name:"선택과 취소"};
export const Dark:Story={name:"어두운 테마",globals:{theme:"dark"}};
export const LargeText:Story={name:"큰 글자",globals:{textScale:"2"}};
export const LibraryOnly:Story={name:"카메라 없음",args:{cameraAvailable:false}};
