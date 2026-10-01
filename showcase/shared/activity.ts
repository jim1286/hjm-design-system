// Deterministic local fixture; these values are not product analytics or GitHub data.
export const activityDescriptor={startDate:'2026-07-01',endDate:'2026-09-30',days:Array.from({length:92},(_,i)=>({date:new Date(Date.UTC(2026,6,1+i)).toISOString().slice(0,10),value:(i*17+i%3)%11})).filter((_,i)=>i%13!==0)};
export const activityCopy={label:'최근 활동',list:'목록으로 보기',grid:'히트맵으로 보기',hint:'진할수록 활동이 많아요. 점선은 아직 기록을 받지 못한 날입니다.'};
export const formatActivity=(date:string,value:number|null)=>`${date}: ${value===null?'기록 없음':`${value}회`}`;
