import { useState } from "react";
import { failureToolCopy } from "../../../shared/failure-tools";
import { PreviewToolButton, PreviewTools } from "./preview-tools";
import { SplitAction, AccountSwitcher, PasswordRulesField, PricingChoice } from "@hjmds/react/task-controls";
import { Stack, Text } from "@hjmds/react/layout";
import type { PriceOption } from "@hjmds/design-contracts/task-controls";
export function SplitActionPreview() {
 const [mode,setMode]=useState("draft"),[result,setResult]=useState(""),[fail,setFail]=useState(false);
 return <Stack gap="md"><SplitAction modes={[{id:"draft",label:"초안 저장"},{id:"publish",label:"게시 요청"}]} modeId={mode} onModeChange={setMode} executeLabel={m=>m.label} menuLabel="실행 방식 선택" dismissLabel="닫기" errorLabel="실행하지 못했어요. 선택은 유지됩니다." onExecute={async id=>{if(fail)throw new Error("fixture failure");setResult(`${id==="draft"?"초안 저장":"게시 요청"} 처리 확인`);}}/><Text>{result}</Text><PreviewTools><PreviewToolButton selected={fail} onClick={() => setFail(value => !value)}>{failureToolCopy.execute}</PreviewToolButton></PreviewTools></Stack>;
}
export function AccountSwitcherPreview() {
 const [account,setAccount]=useState("personal"),[fail,setFail]=useState(false);
 return <Stack gap="md"><AccountSwitcher label="계정 전환" dismissLabel="닫기" accounts={[{id:"personal",label:"개인 작업실",description:"개인 기록"},{id:"team",label:"함께 쓰는 작업실",description:"협업 기록"}]} accountId={account} errorLabel="전환하지 못했어요. 기존 계정을 유지합니다." onSwitch={async id=>{if(fail)throw new Error("fixture failure");setAccount(id);}}/><PreviewTools><PreviewToolButton selected={fail} onClick={() => setFail(value => !value)}>{failureToolCopy.switchAccount}</PreviewToolButton></PreviewTools></Stack>;
}
export function PasswordRulesPreview() {
 const [value,setValue]=useState("");
 return <PasswordRulesField label="새 비밀번호" value={value} onValueChange={setValue} autofillHint="new" revealLabel="비밀번호 보기" concealLabel="비밀번호 숨기기" description="아래 규칙 충족 여부만 표시합니다." progressLabel="비밀번호 규칙" summaryLabel={(n,total)=>`${total}개 조건 중 ${n}개 충족`} ruleLabel={r=>`${r.satisfied?"충족":"미충족"} · ${r.label}`}
 rules={[{id:"length",label:"8자 이상",test:v=>v.length>=8},{id:"number",label:"숫자 포함",test:v=>/\d/.test(v)},{id:"letter",label:"영문자 포함",test:v=>/[a-z]/i.test(v)}]}/>;
}
const prices:readonly PriceOption[]=[{id:"monthly",label:"월간",amountMinor:9000,currency:"KRW",interval:"month",intervalCount:1,benefits:["월별 기록 정리","공유 기록함"]},{id:"annual",label:"연간",amountMinor:80000,currency:"KRW",interval:"year",intervalCount:1,benefits:["연간 기록 정리","공유 기록함"]}];
export function PricingChoicePreview() {
 const [selected,setSelected]=useState("monthly"),[result,setResult]=useState(""),[fail,setFail]=useState(false);
 return <Stack gap="md"><PricingChoice label="예시 기록 요금제" options={prices} selectedId={selected} onSelectionChange={setSelected} formatPrice={p=>`${p.amountMinor.toLocaleString("ko-KR")}원 / ${p.interval==="month"?"매월":"매년"}`} continueLabel="선택 확인" errorLabel="진행하지 못했어요. 선택은 유지됩니다." onContinue={async p=>{if(fail)throw new Error("fixture failure");setResult(`${p.label} 선택 확인 · 실제 결제는 제품에서 연결`);}}/><Text>{result}</Text><PreviewTools><PreviewToolButton selected={fail} onClick={() => setFail(value => !value)}>{failureToolCopy.proceed}</PreviewToolButton></PreviewTools></Stack>;
}
