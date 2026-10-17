// Deterministic local fixture; these values are not product analytics or GitHub data.
export const activityDescriptor={startDate:'2026-07-01',endDate:'2026-09-30',days:Array.from({length:92},(_,i)=>({date:new Date(Date.UTC(2026,6,1+i)).toISOString().slice(0,10),value:(i*17+i%3)%11})).filter((_,i)=>i%13!==0)};
// The view switch is a two-way choice (SegmentedControl); a centred ghost text button misaligned with the grid (review E21).
export const activityCopy={label:'최근 활동',view:'보기',views:[{value:'grid',label:'격자'},{value:'list',label:'목록'}],hint:'진할수록 활동이 많아요. 점선은 아직 기록을 받지 못한 날입니다.'} as const;
export const formatActivity=(date:string,value:number|null)=>`${date}: ${value===null?'기록 없음':`${value}회`}`;
