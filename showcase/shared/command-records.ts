export type CommandRecordsProps = { initialStatus?: "idle" | "pending" | "failed"; copyFailed?: boolean };
export const commandRecords = [
  { id: "command", label: "명령", language: "예시 명령", code: 'hjm-example inspect --message "A long, readable source stays intact across themes and display modes."\n' },
  { id: "output", label: "출력", language: "예시 출력", code: 'Example output only.\nSource: unchanged\nResult: readable\nThis text does not report a real command, build, deployment or server result.\n' },
] as const;
export const commandCopy = {
  title: "명령 기록 표시", description: "명령과 출력을 읽고 복사하는 표시 예제예요. 명령을 실행하지 않아요.",
  panels: "기록 종류", display: "긴 줄 표시", wrap: "줄바꿈", scroll: "가로 스크롤", refresh: "표시 새로고침", retry: "다시 불러오기",
  pending: "예제 응답을 기다리고 있어요", failed: "기록을 갱신하지 못했어요. 이전 원문은 남아 있어요.",
  tools: "검증 도구", respond: "미리보기 응답 받기", fail: "다음 갱신 실패", armed: "다음 갱신은 실패해요",
  copy: "원문 복사", copied: "복사했어요", copyError: "복사하지 못했어요. 원문을 선택해 직접 복사해 주세요.",
  dismiss: "복사 안내 닫기", select: "원문을 길게 눌러 시스템 메뉴에서 복사할 수 있어요.",
  fixture: "갱신 응답은 검증 도구의 예제예요. 실제 명령 실행·서버 조회는 제품에서 연결해요.",
} as const;
