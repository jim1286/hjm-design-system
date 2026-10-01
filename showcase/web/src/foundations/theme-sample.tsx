import { useState } from "react";
import { Stack, Surface, Text } from "@hjmds/react/layout";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Notice } from "@hjmds/react/feedback";
import { Bell } from "lucide-react";
import { createLucideGlyph } from "@hjmds/react/icon-lucide";
import { Icon } from "@hjmds/react/display";
import { DataTable } from "@hjmds/react/data-table";
const glyph=createLucideGlyph({notifications:Bell});
/** Uses the surrounding brand provider so this is a real theme comparison. */
export function ThemeSample(){
 const[name,setName]=useState("산책");const[saved,setSaved]=useState(false);
 return <Surface padding="lg"><Stack gap="md">
 <Text variant="heading">오늘의 기록</Text><Text>한글과 English, 숫자 123을 함께 확인해요.</Text>
 <Stack axis="inline" gap="sm"><Icon name="notifications" decorative renderGlyph={glyph}/><Text>알림을 확인해요</Text></Stack>
 <Button onClick={()=>setSaved(true)}>기록 저장</Button><Button disabled>저장할 내용이 없어요</Button>
 <TextField label="기록 이름" value={name} onValueChange={setName}/><TextField label="공유 주소" value="" onValueChange={()=>{}} error="주소를 확인해 주세요."/>
 <Notice tone={saved?"success":"info"} title={saved?"미리보기 기록을 저장했어요":"변경 내용은 미리보기에서만 적용돼요"} description="실제 제품의 설정은 바뀌지 않아요."/>
 <Notice tone="warning" title="동기화 대기 중" description="연결되면 다시 시도할 수 있어요."/>
 <DataTable columns={[{id:"name",header:"기록"},{id:"status",header:"상태"}]} rows={[{id:"walk"},{id:"read"}]} labels={{table:"기록 목록",selectAll:"모두 선택",selectRow:id=>`${id} 선택`,sortColumn:header=>`${header} 정렬`}} renderCell={(row,column)=>column==="name"?(row==="walk"?"산책":"독서"):(row==="walk"?"완료":"진행 중")}/>
 </Stack></Surface>;
}
