# Utilverse 공개 콘텐츠·복구 UI 채택 계획

2026-10-07. 소비 HEAD fa201bc90e4c94219de0f4f51ac0328987ad1cb2, HJM 3b8de6e.
6개 TSX 전체 소스와 HJM AlertDialog/Notice 계약을 대조했다. 소비 소스는 변경하지 않았다.
전체 136개 hash 일치, 누적 87개 source-reviewed / 49개 pending이다.

## 파일별 판단

| 소스 (apps/mobile/src 기준) | 판단 |
| --- | --- |
| `features/ModeratedContentScreen.tsx` | Replace Alert.alert with AlertDialog confirmation only; preserve captured reason, clientAppealId, uncertain/done lock, receipt validation, identity-scoped invalidation and private in-memory appeal text. |
| `components/StoredPublicAction.tsx` | Use Notice for load failure while preserving durable per-account/target action document loading before mounting recovered command. Close does not discard uncertain intent. |
| `components/StoredPublicComposition.tsx` | Use Notice for loading failure; preserve awaited document queue drain in addition to ready flag before mounting composer, optional unavailable surface and safe back route. |
| `components/PublicContentHistory.tsx` | Already Surface/Stack/selectable Text. Use Notice for failure, retaining immediate suppression of cached raw revisions after refresh denial/failure, scoped query and pagination. |
| `components/PersonalDocumentStatus.tsx` | Use persistent Notice for storage/invalid errors with explicit announcement; preserve member-vs-guest ownership text and read retry only when not ready. Ready write failure is not a read-retry action. |
| `components/CommentRevisionActions.tsx` | Compare existing Menu for owner/connection/busy-gated action choices and close-to-next-flow focus. Preserve durable pending edit ID, captured expectedRevision, uncertainty locks, conflict refresh and session-scoped invalidation. Keep edit/history forms separate. |

## 확인과 접수 성공의 분리

ModeratedContentScreen의 Alert.alert는 제출 시점 이유를 캡처하고 승인 후 command.start를 호출한다.
HJM AlertDialog는 중복 확인·busy·취소를 소유하지만 명령의 서버 receipt를 대신 확인하지 않는다.
단순히 command.start가 반환됐다는 사실을 성공으로 표시하지 않는다. 제품의 confirmedAppealFiling과
command.state.done을 유지하고 sending/uncertain 동안 입력을 잠근다. 미확정 명령은 같은 client ID로
재시도해야 한다. 이의 이유는 메모리에만 두며 일반 댓글 수정의 durable document와 합치지 않는다.

## 복구·개인정보 계약

StoredPublicComposition은 ready만 보지 않고 document.load 완료를 기다린다. 이전 화면의 pending write
queue가 비워져야 복구 명령을 구성할 수 있다. StoredPublicAction도 계정·대상 슬롯을 먼저 열어 기존 ID를
회복한다. 표시를 Notice로 바꾸더라도 로더/구독/lifetime을 새 UI 내부로 옮기지 않는다.
PublicContentHistory는 실패 뒤 캐시가 있어도 원문을 숨긴다. 공통 stale-content 표시를 도입하면
삭제·차단·운영 조치 이후 원문이 다시 드러날 수 있으므로 현재 차단 조건을 유지한다.

## 댓글 메뉴·편집

현재 Surface 안 버튼 메뉴는 기존 Menu 후보지만 권한별 항목·연결 상태·초점 반환과 메뉴 종료 후
신고/차단/편집 진입을 실제 기기에서 확인해야 한다. 메뉴 후보를 교체 완료로 세지 않는다.
편집의 captured.revision은 배경 새로고침으로 바꾸지 않는다. 복구 pending.body를 유지하고
uncertain/done 중 수정을 금지한다. sending 때 닫기 잠금과 uncertain 때 닫기 허용은 의도된 차이다.

## 남은 검증

실제 API 접수·중복 승인·취소·오프라인 후 재확인·계정 전환·앱 재시작 복구, 원문 접근 거절 후
캐시 비노출, 큰 글자·다크·제품 테마·스크린리더는 pending이다. 소스 검토를 동작 검증으로 세지 않는다.
