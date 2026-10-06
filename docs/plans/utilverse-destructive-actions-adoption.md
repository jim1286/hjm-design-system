# Utilverse 삭제·신고·명령 피드백 채택 판단

검토일: 2026-10-07. 소비 `fa201bc90e4c94219de0f4f51ac0328987ad1cb2`, HJM `5bc85ef`.
아래 여섯 TSX 전체를 읽고 Native AlertDialog/Sheet, 공통 alert-dialog 세션과 대조했다.
연관 로직은 PendingCommand 전체, CommandLifetimes/useCommandLifetime 전체,
DeletionCoordinator의 run/confirm/결과 적용 부분을 읽었다. 그 밖의 인증 구현 전수 검토는 아니다.
소비 source·dependency는 수정하지 않았다. [파일 hash와 상태](utilverse-ui-adoption-inventory.json).

| 파일 | 판단 | 채택 전제 |
| --- | --- | --- |
| DeleteAccountScreen.tsx | Alert.alert 최종 동의를 HJM AlertDialog로 교체 가능 | 동의와 서버/로컬/Apple 완료를 분리, native 인증 modal을 열기 전 확인창 종료, owner/준비 상태 재확인 |
| CommentReportForm.tsx | 이미 HJM Surface/TextArea/Button, 폼 유지 | capturedRevision·clientReportId·durable pending reason·명시적 재시도 유지 |
| ChatMessageSheet.tsx | 이미 HJM Sheet/ReactionPicker, 닫힘 정책 연결 보완 | 자식 edit/report/block의 전송 상태를 Sheet busy에 연결; 불확실 상태의 이탈 정책은 작업별 구분 |
| BlockAuthorForm.tsx | 이미 HJM 폼, 상태 안내만 Notice 대조 | 현재 revision 조회 후 target-state PUT, receipt 검증과 차단 콘텐츠 cache 제거 유지 |
| CommandFeedback.tsx | Notice로 표시 구성 대체 가능 | sending/uncertain/error 및 제품별 오류 문구 mapping 유지, done을 새 성공 알림으로 만들지 않음 |
| CommandNotice.tsx | Notice로 표시 구성 대체 가능 | safetyFaultCopy의 작업별 문구, uncertain의 동일 요청 retry 유지 |

## 확인창의 성공 의미

HJM AlertDialog의 onConfirm은 resolve되면 confirmed로 닫는다. Utilverse PendingCommand는
요청 실패를 catch해 error/uncertain snapshot에 기록하고 start/retry Promise를 resolve한다.
DeletionCoordinator.run도 실패를 issue로 publish하고 throw하지 않는다. 따라서 두 함수를
그대로 onConfirm으로 연결하면 실패까지 확인 성공처럼 닫힐 수 있다.

탈퇴는 기존 화면의 의미대로 **최종 동의만** AlertDialog에서 받는 경로를 우선한다.
onConfirm 없이 confirm request를 열고 controlled onOpenChange로 닫는다. Native onResult의
confirmed에서 준비한 대상 계정·현재 상태가 여전히 유효한지 확인한 뒤 deletion.confirm을
한 번 호출한다. 세션 결과는 completeExit 후 전달되므로 native provider 인증과 확인창이
겹치는 문제를 피할 수 있는 연결 지점이다. 실제 iOS/Android 인증 modal 연결은 아직 미검증이다.
확인창을 닫기 전에 컴포넌트를 조건부 제거하면 결과가 suppressed될 수 있으므로 mounted 상태를
유지한다. onResult를 삭제 성공이나 자동 router.back의 조건으로 사용하지 않는다.

제품 상태 화면은 serverDataStatus=erased, localCleared, appleStatus를 각각 표시한다.
provider 인증 취소, challenge 만료, 네트워크 불확실, 재시작 후 복구, 완료 뒤 늦은 조회 오류를
같은 실패나 같은 성공으로 합치지 않는다. 동의 후 계정 전환·중복 누름·화면 이탈도 검증한다.
이 대조는 실제 계정을 삭제하는 검증을 수행했다는 뜻이 아니다.

## Sheet 닫힘과 자식 명령

ChatMessageSheet는 busy prop을 받지만 Sheet의 busy에는 전달하지 않는다. 하위 ChatEditForm과
ChatReportForm은 전송 중 자체 닫기 버튼을 비활성화하지만 Sheet close/back/outside에는 그
상태가 연결되지 않는다. HJM Sheet에는 busy/dismissPolicy가 이미 있으므로 새 Sheet를 만들지 않는다.
자식 명령 phase를 parent에 알리는 연결과 target id가 바뀔 때 이전 상태 해제를 검토한다.

edit/report의 uncertain 입력은 durable record가 있어 현재 제품은 화면 이탈을 허용한다.
BlockAuthorForm은 sending뿐 아니라 uncertain에서도 자체 닫기를 막는다. 하나의 공통
`busy = sending || uncertain` 규칙을 모든 폼에 복사하면 제품 복구 정책이 바뀐다.
실제 이탈 시 CommandLifetimes가 dispose→AbortSignal을 보내며 서버 작업의 취소를 보장하지
않는다. 재진입 시 같은 pending identity가 복구되는지 제품 회귀로 확인해야 한다.

신고는 화면을 연 시점의 revision, 편집은 본문과 revision을 캡처한다. 배경 refetch 때문에
검토하지 않은 새 revision으로 명령을 보내지 않는다. 실패 후 사유 편집, 동일 request 재시도,
복구된 uncertain의 입력 잠금, 다른 계정으로 이탈을 유지한다. 텍스트를 HJM Form의 자동 제출
동작에 연결해 복구 명령이 mount 시 재전송되도록 만들지 않는다.

## 피드백 구성

CommandFeedback/CommandNotice의 uncertain은 Notice title + action(Button retry)로 대체할 수 있다.
오류는 Notice tone=danger와 제품 문구 mapping을 사용하고 필요 announcement는 한 곳만 소유한다.
현재 sending은 짧은 caption이므로 Notice로 변경할 때 높이·키보드 아래 composer 영역의
밀림을 실제 화면에서 비교한다. loading을 성공률이나 서버 진행 퍼센트로 표현하지 않는다.
두 컴포넌트의 모양은 같아도 오류 사전과 안전 명령의 의미가 다르므로 도메인 mapping을
공용 HJM 패키지에 옮기지 않는다. 이 두 함수의 모든 호출부는 이번에 검토한 범위가 아니다.

## 남은 확인

동의→확인창 닫힘→provider 인증, 닫기 차단과 uncertain 이탈, 재진입 복구, 실패 후 편집,
대상/계정 변경, 큰 글자·키보드·긴 문구, light/dark·다섯 제품 테마, VoiceOver/TalkBack,
Android back은 소비 적용 이후 실제 runtime 검증이 필요하다. 아직 신규 실험이나 승격으로 세지 않는다.
