import { useState } from "react";
import { ToggleFeedbackButton } from "@hjmds/react/toggle-feedback";
import { Stack, Text } from "@hjmds/react/layout";
import { resolveToggleFeedbackProposal, type ToggleFeedbackEffect } from "@hjmds/design-contracts/toggle-feedback";
import { toggleFeedbackExample as copy } from "../../../shared/toggle-feedback-example.js";
import { PreviewTools, PreviewToolButton } from "./preview-tools.js";
function Choice({ effect, fail }: { effect: ToggleFeedbackEffect; fail: boolean }) {
 const [state,setState]=useState({selected:false,count:copy.seed[effect]});
 return <ToggleFeedbackButton entityId={effect} effect={effect} state={state} locale="ko-KR" labels={{...copy.labels[effect],pending:copy.pending,error:copy.error}}
  onSelectedChange={async selected=>{if(fail)throw new Error("fixture failure");setState(previous=>resolveToggleFeedbackProposal(previous,selected));}} />;
}
export function ToggleFeedbackPreview() {
 const [fail,setFail]=useState(false);
 return <Stack gap="sm"><Text tone="muted">{copy.hint}</Text>
  {copy.effects.map(effect=><Choice key={effect} effect={effect} fail={fail}/>)}
  <PreviewTools><PreviewToolButton selected={fail} onClick={()=>setFail(value=>!value)}>{copy.failTool}</PreviewToolButton></PreviewTools>
 </Stack>;
}
