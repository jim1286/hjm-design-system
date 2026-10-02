// STEA Code 후보 중 2026-10-02 사용자가 추가로 실험을 요청한 표현 3종(앞뒤 카드·픽셀 캐릭터·티켓)의
// 공유 데이터다. 원본(Coral Flip Card·Retro Pixel Bat·Sci-Fi Event Ticket)의 코드와 이미지는 쓰지 않는다.
// 박쥐 스프라이트는 라이선스가 없어 아래 캐릭터를 새로 그렸고, 3D 회전·hover tilt는 Native 비용과
// 접근성 대체가 확인되지 않아 명시적 버튼 전환과 정적 배치로 대신한다
// (docs/plans/stea-code-adoption-2026-10-02.md "흡수 검증 결과").
// shared/의 다른 모듈처럼 패키지를 import하지 않는다.

// --- 앞면과 상세 정보 전환 ------------------------------------------------------

export const flipCopy = {
  title: "이번 주 모임",
  front: {
    name: "성수 북클럽",
    summary: "10월 9일 목요일 저녁 7시",
    note: "이번 달 책은 『작은 것들의 신』이에요.",
  },
  backLabel: "모임 상세 정보",
  back: [
    { id: "place", label: "장소", value: "성수동 연무장길 책방 2층 작은 방" },
    { id: "bring", label: "준비물", value: "읽은 부분까지 표시한 책, 함께 나눌 문장 하나" },
    { id: "people", label: "인원", value: "8명 중 6명 참여 예정" },
    { id: "host", label: "진행", value: "지민" },
  ],
  // 버튼은 전환되는 면 밖에 둔다. 면 안에 두면 면이 바뀔 때 포커스한 버튼이 사라진다.
  showBack: "자세히 보기",
  showFront: "앞면 보기",
  faceStatus: (back: boolean) => (back ? "상세 정보를 보고 있어요." : "요약을 보고 있어요."),
} as const;

// --- 빈 상태와 픽셀 캐릭터 ------------------------------------------------------

export const pixelCopy = {
  title: "아직 남긴 기록이 없어요",
  description: "말랑이가 첫 기록을 기다리고 있어요.",
  start: "첫 기록 남기기",
  started: "기록 작성 화면으로 이동하는 예제예요.",
  pause: "움직임 멈추기",
  resume: "다시 움직이기",
} as const;

/** 팔레트 키. 색 값은 renderer가 테마에서 고른다(어두운 테마에서도 대비 유지). */
export type PixelInk = "outline" | "body" | "light" | "eye";
const inkByChar: Readonly<Record<string, PixelInk>> = { o: "outline", b: "body", h: "light", e: "eye" };

// 12×12 원본 캐릭터. "."은 투명이다.
const idle = [
  "............",
  "....oooo....",
  "..oobbbboo..",
  ".obhbbbbbbo.",
  ".obhbbbbbbo.",
  "obbeebbeebbo",
  "obbeebbeebbo",
  "obbbbbbbbbbo",
  "obbbboobbbbo",
  ".obbbbbbbbo.",
  "..oooooooo..",
  "............",
];
const hop = [...idle.slice(1), idle[0]!];
const blink = idle.map((row, index) => (index === 5 ? row.replaceAll("e", "b") : index === 6 ? row.replaceAll("e", "o") : row));

/** 프레임 순서: 제자리 → 뛰기 → 제자리 → 눈 깜빡임. */
export const pixelFrames: readonly (readonly string[])[] = [idle, hop, idle, blink];
export const pixelGridSize = 12;
/** 프레임 간격. 원본 박쥐(0.4초/7프레임)보다 느리게 해 빈 화면에서 시선을 덜 끈다. */
export const pixelFrameMs = 220;
/** 모션 감소·멈춤에서 보여 줄 대표 프레임. */
export const pixelStillFrame = 0;

export type PixelRun = Readonly<{ x: number; y: number; width: number; ink: PixelInk }>;

/**
 * 같은 색이 이어지는 가로 칸을 하나로 묶는다. Native는 칸마다 View를 만들면 프레임당 수십 개가
 * 다시 그려지므로, 묶어서 요소 수를 줄인다. Web SVG도 같은 결과를 쓴다.
 */
export function pixelRuns(frame: readonly string[]): readonly PixelRun[] {
  const runs: PixelRun[] = [];
  frame.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ink = inkByChar[row[x]!];
      if (!ink) { x += 1; continue; }
      let end = x + 1;
      while (end < row.length && inkByChar[row[end]!] === ink) end += 1;
      runs.push({ x, y, width: end - x, ink });
      x = end;
    }
  });
  return runs;
}

export const pixelFrameRuns: readonly (readonly PixelRun[])[] = pixelFrames.map(pixelRuns);

// --- 일정과 식별 정보 티켓 -------------------------------------------------------

export const ticketCopy = {
  title: "가을 밤 재즈 공연",
  subtitle: "입장할 때 아래 코드를 보여 주세요.",
  detailsLabel: "공연 정보",
  details: [
    { id: "date", label: "날짜", value: "2026년 10월 17일 토요일" },
    { id: "time", label: "시간", value: "저녁 7시 30분 (입장 7시부터)" },
    { id: "place", label: "장소", value: "서울 마포구 와우산로 소극장 지하 1층 공연장" },
    { id: "seat", label: "좌석", value: "A열 12번" },
  ],
  bookingLabel: "예매 번호",
  booking: "JZ-1017-A12-4821",
  qrLabel: "입장 QR 코드, 예매 번호 JZ-1017-A12-4821",
  // QR을 읽을 수 없는 환경(화면 밝기·카메라 실패)에서도 같은 정보를 확인할 수 있어야 한다.
  qrFallback: "QR을 읽을 수 없으면 직원에게 예매 번호를 알려 주세요.",
} as const;
