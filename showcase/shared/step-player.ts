export const playerCopy = {
  steps: [{id:"capture",label:"기록"},{id:"organize",label:"정리"},{id:"review",label:"돌아보기"}],
  panels: ["오늘의 순간을 짧게 남겨요.","관련 기록을 한곳에 모아요.","쌓인 순간을 천천히 돌아봐요."],
  labels: {play:"재생",pause:"일시정지",replay:"다시 보기",progress:"소개 재생 진행률"},
  statusLabels: {pending:"대기",current:"현재",complete:"지남",error:"확인 필요"},
};
export const playerStepName = ({position,total,label}:{position:number;total:number;label:string}) => `${total}단계 중 ${position}, ${label}`;
