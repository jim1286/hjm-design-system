import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PhotoSourceSheet } from "@hjmds/react/screen-flows";
import { Button } from "@hjmds/react/actions";
import { Container, Stack, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
// Result ids map to copy through a table like the product's id→i18n-key table.
const resultCopy = { none: "아직 사진을 고르지 않았어요.", camera: "촬영 선택 — 제품이 카메라를 열어요.", library: "앨범 선택 — 제품이 선택기를 열어요." } as const;
type Result = keyof typeof resultCopy;
function Preview({cameraAvailable=true}:{cameraAvailable?:boolean}){
 const [open,setOpen]=useState(false),[result,setResult]=useState<Result>("none");
 // Cancel or dismiss only closes the sheet: the previous selection and its status stay unchanged.
 return <Container gutter="compact"><Stack gap="md"><Heading level="level3">게시물 사진</Heading><Button onClick={()=>setOpen(true)}>사진 추가</Button><Text role="status">{resultCopy[result]}</Text><PhotoSourceSheet open={open} onOpenChange={setOpen} cameraAvailable={cameraAvailable} onSelect={value=>setResult(value)} labels={{title:"사진 추가",library:"앨범에서 선택",camera:"사진 촬영",cancel:"취소"}}/></Stack></Container>;
}
const meta={id: "compositions-selection-photo-source", title:"배포/구성/선택과 필터/사진 촬영과 앨범 선택",component:Preview} satisfies Meta<typeof Preview>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Default:Story={name:"기본"};
export const LibraryOnly:Story={name:"카메라 없음",args:{cameraAvailable:false}};
export const Dark:Story={name:"어두운 테마",globals:{theme:"dark"}};
export const LargeText:Story={name:"큰 글자",globals:{textScale:"2"}};
