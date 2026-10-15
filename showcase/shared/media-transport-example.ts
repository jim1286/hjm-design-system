export const mediaTransportLabels = { play: "재생", pause: "일시 정지", seek: "재생 위치", decrement: "뒤로 이동", increment: "앞으로 이동", unknownDuration: "길이 미정", error: "미디어를 제어하지 못했어요. 다시 시도하세요." };
export const formatMediaTime = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
