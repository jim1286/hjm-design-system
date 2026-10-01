export const voiceCopy = {
 title: "산책하며 남긴 메모",
 labels: {play:"재생",pause:"일시정지",seek:"재생 위치",loading:"불러오는 중",error:"음성 메모를 불러오지 못했어요.",retry:"다시 시도",backward:"이전으로",forward:"다음으로"},
 simulated: "재생 상태를 살펴보는 예제입니다. 실제 음성은 재생하지 않아요.",
};
export const voiceTime = (seconds:number) => `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,"0")}`;
