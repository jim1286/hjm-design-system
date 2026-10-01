// Original synthetic records; all displayed totals are derived from this same array.
export const dashboardRecords=[
 {id:"a",date:"2026-09-02",title:"가을 산책",minutes:20},
 {id:"b",date:"2026-09-08",title:"책 한 장",minutes:15},
 {id:"c",date:"2026-09-16",title:"생각 정리",minutes:10},
 {id:"d",date:"2026-09-25",title:"새로운 길",minutes:25},
 {id:"e",date:"2026-09-28",title:"조용한 오후",minutes:30},
 {id:"f",date:"2026-09-28",title:"짧은 메모",minutes:5},
 {id:"g",date:"2026-09-30",title:"한 달 돌아보기",minutes:20},
] as const;
export const dashboardPeriods=[{id:"week",label:"최근 7일",start:"2026-09-24",end:"2026-09-30"},{id:"month",label:"9월",start:"2026-09-01",end:"2026-09-30"},{id:"empty",label:"8월",start:"2026-08-01",end:"2026-08-31"}] as const;
export type DashboardPeriod=typeof dashboardPeriods[number]["id"];
export function summarizeDashboard(id:DashboardPeriod){
 const period=dashboardPeriods.find(item=>item.id===id);if(!period)throw new TypeError("Unknown dashboard period");
 const records=dashboardRecords.filter(item=>item.date>=period.start&&item.date<=period.end);
 const start=Date.parse(period.start+"T00:00:00Z"),end=Date.parse(period.end+"T00:00:00Z");
 // Fixture is a complete local dataset: absent records are known zero, not unknown data.
 const days=Array.from({length:(end-start)/86400000+1},(_,index)=>{const date=new Date(start+index*86400000).toISOString().slice(0,10);return{date,value:records.filter(item=>item.date===date).length};});
 return{period,records:records.slice().reverse(),count:records.length,minutes:records.reduce((sum,item)=>sum+item.minutes,0),activeDays:new Set(records.map(item=>item.date)).size,heatmap:{startDate:period.start,endDate:period.end,days}};
}
export const dashboardCopy={title:"작은 순간이 쌓인 한 달",intro:"기록한 날과 머문 시간을 함께 돌아봐요.",fixture:"2026년 9월의 예제 기록입니다. 실제 사용자 통계가 아닙니다.",activity:"기록한 날",records:"기간별 기록",empty:"아직 기록이 없는 달이에요",emptyBody:"기록이 있는 9월로 돌아가 흐름을 살펴보세요.",reset:"9월 보기",list:"날짜 목록으로 보기",grid:"활동 달력으로 보기"};
export const dashboardDay=(date:string,value:number|null)=>`${date} · ${value===null?"확인되지 않음":`${value}개 기록`}`;
