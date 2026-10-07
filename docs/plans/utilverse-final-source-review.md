# Utilverse 마지막 소스 검토와 적용 경계

2026-10-07 · 기준 소비 main `b65973875a07`, HJM `0c9574bc88a6`, npm 1.14.0.
사용자가 기존 UI를 전수 조사하고 대치 가능한 공통 표현을 디자인 시스템으로 바꾸라고 요청했다.
136개 TSX 중 남아 있던 15개를 끝까지 읽었고, 이전 조사 뒤 hash가 달라진 알림 검색·도구 선택·홈
3개도 다시 읽었다. 파일별 hash·import된 JSX·판단은 [inventory](utilverse-ui-adoption-inventory.json)에 있다.
최종 소비 적용 commit `ca25701d648b331554fe5c3cdb51495e77db1e91`.
**136개 소스 검토는 136개 화면의 기기 검증이나 전체 교체 완료가 아니다.**

## 공통 표현과 제품 처리 로직

파일·사진은 취소 중에도 native decode/export lease가 끝날 때까지 잠긴다. 생성 파일만 소유하고
picker 원본을 제거하지 않으며, 저장된 PDF·QR·마스크·이어붙인 raster를 다시 검증한다.
PDF의 흰 종이, 좌표 변환, 마스크의 검정/흰 document ink, drag responder와 virtualized image list는
이 제품 처리 로직이다. 비슷하게 보이는 Carousel/ImageComparison/VirtualList로 바꾸면 이 계약이
사라지므로 유지한다. FieldGroup으로 좌표·Wi-Fi 관련 입력을 묶고 Notice로 상태·복구를 통일한다.

FileJobSession의 Promise resolve는 저장 성공이 아니다. `created`, `saved`, `shareReturned`,
`cancelled`와 fault를 명시적으로 표시하고 PHOTO_CLEANUP의 재시도는 export 재시도와 분리한다.
검토 전 PhotoOutputCard 저장/공유 차단과 원본/결과 비교는 계속 유지한다.

OCR·번역은 로컬 입력/원문을 커뮤니티에 올리지 않고 background 수명과 취소·모델 소유권을
유지한다. 편집 OCR 결과의 `live=false`, 원문 2,000자 번역 제한, Apple/Android 엔진의 attribution은
공통 결과 카드나 모션으로 대체하지 않는다.

투표·댓글·운영 심사는 계정 scope, captured writer, revision, receipt 검증, 불확실한 요청의 동일
의도 재확인과 실제 권한 gate를 유지한다. 이미 HJM ScreenLayout/CommentThreadScreen을 쓴다.
Notice·FieldGroup·AlertDialog로 대치할 표현은 남아 있으나, 이 조사로 대치됐다고 기록하지 않는다.

홈은 다섯 shell의 launcher다. 측정 batch·페이지 가상화·큰 글자 columns·peek·native scroll를
보존한다. 이미 SearchScreen을 쓰는 알림 검색과 ChatToolPicker를 홈에 그대로 복제하지 않는다.

## 구현과 검증 추적

첫 적용은 FileJobNotice·PersonalDocumentStatus·LanguageNotice, QrCreatePanel의 Wi-Fi 그룹,
PhotoMaskScreen의 정밀 좌표 그룹이다. 소비 코드의 최종 변경·검사·미확인 범위는
[Utilverse QA](https://github.com/jim1286/utilverse/blob/main/docs/qa/2026-10-07-hjm-notice-field-group-adoption.md)에 기록한다.
그 밖의 source-reviewed 항목은 기존 개별 채택 계획과 함께 계속 추적한다. runtimeVerification과
adoption은 서로 별개이며, 미실행 Native/스크린리더/전체 화면 회귀를 통과로 채우지 않는다.
