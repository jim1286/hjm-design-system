import { useState } from "react";
import { Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { Notice } from "@hjmds/react-native/feedback";
import { Bell } from "lucide-react-native";
import { createLucideGlyph } from "@hjmds/react-native/icon-lucide";
import { Icon } from "@hjmds/react-native/primitives";
import { List, ListRow } from "@hjmds/react-native/data-display";
const glyph=createLucideGlyph({notifications:Bell});
/** Uses the surrounding brand provider so this is a real theme comparison. */
export function ThemeSample(){
 const[name,setName]=useState("산책");const[saved,setSaved]=useState(false);
 return <Surface padding="lg"><Stack gap="md">
 <Text variant="heading">오늘의 기록</Text><Text>한글과 English, 숫자 123을 함께 확인해요.</Text>
 <Stack axis="inline" gap="sm"><Icon descriptor={{name:"notifications",decorative:true}} renderGlyph={glyph}/><Text>알림을 확인해요</Text></Stack>
 <Button onPress={()=>setSaved(true)}>기록 저장</Button><Button disabled>저장할 내용이 없어요</Button>
 <TextField label="기록 이름" value={name} onValueChange={setName}/><TextField label="공유 주소" value="" onValueChange={()=>{}} error="주소를 확인해 주세요."/>
 <Notice announcement={saved?"polite":"none"} tone={saved?"success":"info"} title={saved?"미리보기 기록을 저장했어요":"변경 내용은 미리보기에서만 적용돼요"} description="실제 제품의 설정은 바뀌지 않아요."/>
 <Notice tone="warning" title="동기화 대기 중" description="연결되면 다시 시도할 수 있어요."/>
 <List label="기록 목록"><ListRow title="산책" trailingText="완료"/><ListRow title="독서" trailingText="진행 중"/></List>
 </Stack></Surface>;
}
