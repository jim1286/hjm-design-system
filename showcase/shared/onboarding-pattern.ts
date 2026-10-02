export const onboardingCopy={
 eyebrow:"작은 기록의 시작",steps:[{id:"welcome",label:"소개"},{id:"interests",label:"관심사"},{id:"ready",label:"확인"}],
 statusLabels:{pending:"대기",current:"현재 단계",complete:"완료",error:"확인 필요"},
 panels:[{title:"나의 속도로 쌓아 가요",body:"매일 멋진 일을 할 필요는 없어요. 기억하고 싶은 작은 순간부터 남겨 보세요."},{title:"무엇을 담고 싶나요?",body:"마음이 가는 주제를 골라 보세요. 여러 개를 선택하거나 나중에 정할 수 있어요."},{title:"이렇게 시작해 볼까요?",body:"선택한 주제를 확인해요. 언제든 바꿀 수 있어요."}],
 topics:[{id:"daily",label:"일상"},{id:"travel",label:"여행"},{id:"reading",label:"독서"},{id:"ideas",label:"아이디어"}],
 next:"계속",back:"이전",skip:"나중에 정하기",finish:"시작하기",restart:"처음부터 보기",done:"준비됐어요",doneBody:"관심 주제를 고르는 온보딩 예제를 마쳤어요.",empty:"관심 주제를 아직 선택하지 않았어요.",scope:"이 예제의 선택은 현재 화면에서만 유지됩니다.",
};
export const onboardingStepName=({position,total,label}:{position:number;total:number;label:string})=>`${total}단계 중 ${position}, ${label}`;
export function toggleOnboardingTopic(selected:readonly string[],id:string){
 if(!onboardingCopy.topics.some(topic=>topic.id===id))throw new TypeError("Unknown onboarding topic");
 return selected.includes(id)?selected.filter(value=>value!==id):[...selected,id];
}
export function onboardingSummary(selected:readonly string[]){return onboardingCopy.topics.filter(topic=>selected.includes(topic.id)).map(topic=>topic.label).join(" · ")||onboardingCopy.empty;}
