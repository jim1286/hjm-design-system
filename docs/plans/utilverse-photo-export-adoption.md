# Utilverse 사진·파일 내보내기 채택 조사

2026-10-07 · 소비 HEAD fa201bc90e4c94219de0f4f51ac0328987ad1cb2.
136개 inventory hash가 현재 소스와 일치한다. 아래 11개 TSX를 추가로 읽어 총 35개를
source-reviewed로 기록했다. 실제 UI 회귀·소비 코드 교체는 아직 하지 않았다.

| 소스 (apps/mobile/src 기준) | 판단과 유지할 계약 |
| --- | --- |
| `components/PhotoOutputCard.tsx` | Preserve original/result comparison, onDisplay review gate, separate save/share/edit actions; use saveDisabled only for matching single-export composition. |
| `components/SelectedPhoto.tsx` | Replace visual frame with shared Surface candidate; preserve full-image contain and product picker host. |
| `components/FileJobNotice.tsx` | Absorb status/error presentation with Notice; keep cleanup retry distinct from export retry and created/saved/shareReturned outcomes. |
| `components/ResultCopy.tsx` | Already uses HJM Button; compare Clipboard contract while preserving keyed value, lifetime and actual clipboard receipt. |
| `components/ResultShare.tsx` | Keep native Share host and busy lifecycle; consider Notice failure presentation, never infer durable save from share result. |
| `components/ToolResult.tsx` | Keep existing ContentTransition/Surface composition and editable OCR live-region suppression. |
| `components/SocialPhotoPicker.tsx` | Keep MessageComposer and OS picker ownership; verify stable attachment identity and busy/lifetime before changes. |
| `features/PhotoConvertScreen.tsx` | Keep FileJobSession, alpha-to-JPEG consent and separate gallery/share actions; absorb eligible result and notice presentation. |
| `features/PhotoScreen.native.tsx` | Keep resize budget/quality warnings, alpha consent, cancellation and cleanup; replace presentation only after host contract checks. |
| `features/PhotoScreen.tsx` | Keep platform resolution re-export; no independent UI replacement. |
| `features/PhotoScreen.web.tsx` | Keep native-only capability notice; stub is not a separate web product. |

## 검토 후 저장과 파일 세션

PhotoOutputCard는 result 미리보기가 표시되고 사용자가 검토해야 저장·공유를 허용한다.
미리보기 자체를 막는 전체 disabled 대신 DocumentResource에 saveDisabled를 추가했다.
원본/결과 비교, 검토 Checkbox, 이미지 onDisplay, 편집, 두 개의 독립 내보내기 행동이 모두
대체된 것은 아니다. 단일 저장 구성에 맞는 경우만 DocumentResource를 채택하며 별도 공유에도
같은 제품 게이트를 연결한다. PhotoOutputCard 상태의 파일 교체 처리는 호출부 key까지 확인한다.

함께 읽은 `lib/file-job-session.ts`는 생성 파일 소유권·export lease·generation을 관리한다.
원본 picker URI를 소유 파일처럼 삭제하면 안 된다. 취소는 build generation을 무효화하되
native 작업이 돌아올 때까지 busy를 유지한다. export 도중 dispose해도 lease 파일은 보존한다.
cleanup 실패와 내보내기 실패는 서로 다른 복구 행동이다.

특히 build/export는 오류를 snapshot.fault에 기록하고 Promise를 resolve한다. 따라서
`await session.export()` 완료를 HJM saved 상태로 변환하면 실패를 성공으로 보이게 한다.
notice의 created/saved/shareReturned 및 fault를 명시적으로 대응해야 한다. HJM action-session의
reset으로 제품 파일 생성·취소·정리 엔진을 교체하지 않는다.

## 채택 전 검증

원본/결과 변경 후 이전 onDisplay 무효화, 검토 전 저장·공유 차단, 검토 후 각 host 실행,
JPEG alpha 동의, 크기 목표 미달/원본보다 커짐 안내, 취소 중 중복 작업 차단, cleanup 재시도,
공유창 복귀와 실제 저장 구분을 확인한다. 결과 카드 큰 글자·5개 제품 테마·스크린리더,
OCR 편집의 반복 낭독 억제, native-only web stub 유지도 소비 앱 회귀 범위다.
