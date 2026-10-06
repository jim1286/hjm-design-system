# Utilverse 알림 UI 채택 계획

2026-10-07. 소비 HEAD fa201bc90e4c94219de0f4f51ac0328987ad1cb2, HJM c72330f.
4개 TSX 전체 소스 검토 및 HJM NotificationItem/ScreenLayout/시간 선택 지침 대조.
136개 hash 일치. 91개 source-reviewed / 45개 pending. 소비 구현은 변경하지 않았다.

## 파일별 판단

| 소스 (apps/mobile/src 기준) | 판단 |
| --- | --- |
| `components/CommunityNotificationSettings.tsx` | Already SegmentedControl/Button. Use Section/Notice for structure and phase/error feedback; retain server expectedRevision, account/origin/tool query scope, no automatic retry/private background refresh and explicit device-registration permission action. |
| `components/ToolNotificationControl.tsx` | Already Switch. Use Notice for denied/failed/storage states while preserving master enable, document pending, timer readiness and service-owned state; checked preference is not OS delivery proof. |
| `features/ToolNotificationSettingsScreen.tsx` | Compare DatePicker/DateEntry and hour/minute Select composition; preserve local civil-time validation, tomorrow calendar arithmetic, eight-reminder limit, queued storage mutation before scheduler refresh. Existing ScreenLayout scroll=content correctly delegates scrolling to child. |
| `features/NotificationInboxScreen.tsx` | Already shared NotificationInboxScreen/NotificationItem. Absorb read action using inherited ListRow trailingAction and common separators; retain blur unmount, account/filter/tool keys, receipt-before-confirmation, abort guards and scoped invalidation. |

## 공통 API 흡수

NotificationItem은 ListRow props에서 description/selected/titleStyle만 제외하므로 trailingAction을
그대로 지원한다. 수신함의 외부 가로 Stack과 별도 읽음 IconButton을 이 슬롯으로 옮기는 후보를
우선 검증한다. 알림 열기와 읽음 확정은 독립 행동이며 하나의 press handler로 합치지 않는다.
현재 ScreenLayout scroll=content 아래 ScrollView는 의도된 단일 스크롤 소유권이다.
중복 스크롤이라고 오판해 제거하지 않는다.

날짜는 DatePicker 또는 DateEntry, 시각은 기존 시·분 Select 구성을 비교한다. DurationField는
경과 시간 입력이므로 하루 중 시각과 바꾸지 않는다. reminderDate의 로컬 날짜/시각 검증을 유지하고
내일 preset의 setDate(+1)를 고정 24시간 덧셈으로 바꾸지 않는다. 날짜·시각이 저장된 후 초기화되는
현재 처리와 OS 예약 refresh 실패를 구분해야 한다. 저장 성공을 실제 알림 도착으로 표현하지 않는다.

## 보존할 기능

- 커뮤니티 구독은 expectedRevision을 서버로 보내고 실패 후 재조회한다. 공통 선택 UI가 낙관적으로 확정하지 않는다.
- master off/미지원/권한 거절/기기 등록 미준비/저장 오류는 서로 다른 상태다. 공통 Notice가 원인을 지우지 않는다.
- 수신함은 blur 시 private query owner를 해제하고 요청을 abort한다. 화면을 숨기기만 하는 전환으로 바꾸지 않는다.
- 읽음 확인은 receipt 이후에만 표시하며 계정 범위로 invalidate한다. 페이지 간 중복 ID를 제거한다.
- 수신함 guest/restoring 본문에는 중복 코드가 있지만 상위 화면 state가 콘텐츠를 대체하므로 실제 중복 표시라고 주장하지 않는다.

## 남은 검증

날짜/시각 입력의 DST·존재하지 않는 시각·과거값, preset과 8개 한도, 저장 실패, OS 권한 거절과
설정 복귀, 구독 충돌, 읽음 요청 중 화면 이탈·계정 변경·필터 변경, 두 독립 행동의 접근성,
제품 테마·다크·큰 글자·VoiceOver는 pending이다. 실제 서버/OS 전송은 소스 검토로 확인하지 않았다.
