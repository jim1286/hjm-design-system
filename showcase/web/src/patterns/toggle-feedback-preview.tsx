import { useState } from "react";
import { ToggleFeedbackButton } from "@hjmds/react/toggle-feedback";
import { Stack, Text } from "@hjmds/react/layout";
import { Checkbox } from "@hjmds/react/selection";
import { resolveToggleFeedbackProposal, type ToggleFeedbackEffect } from "@hjmds/design-contracts/toggle-feedback";
function Choice({ effect, fail }: { effect: ToggleFeedbackEffect; fail: boolean }) {
 const [state,setState]=useState({selected:false,count:effect==="ripple"?128:effect==="ribbon"?24:56});
 const copy=effect==="ripple"?{select:"구독",selected:"구독 중",count:"구독자"}:effect==="ribbon"?{select:"북마크",selected:"북마크됨",count:"저장"}:{select:"좋아요",selected:"좋아요 선택됨",count:"좋아요"};
 return <ToggleFeedbackButton entityId={effect} effect={effect} state={state} locale="ko-KR" labels={{...copy,pending:"변경 중",error:"변경하지 못했어요. 이전 상태를 유지합니다."}}
  onSelectedChange={async selected=>{if(fail)throw new Error("fixture failure");setState(previous=>resolveToggleFeedbackProposal(previous,selected));}} />;
}
export function ToggleFeedbackPreview() {
 const [fail,setFail]=useState(false);
 return <Stack gap="xl"><Text>예시 어댑터 · 선택할 때만 국소 반응을 표시하고 해제할 때는 장식 없이 바뀝니다.</Text>
  <Choice effect="ripple" fail={fail}/><Choice effect="ribbon" fail={fail}/><Choice effect="burst" fail={fail}/>
  <Checkbox label="요청 실패 상황" checked={fail} onCheckedChange={setFail}/>
 </Stack>;
}
