# Utilverse 사진 미리보기·전광판 대체 판단

2026-10-07 소스 검토. 소비 snapshot `fa201bc90e4c94219de0f4f51ac0328987ad1cb2`,
HJM snapshot `e7903e6`. 소비 파일 hash는 [inventory](utilverse-ui-adoption-inventory.json)에 있다.
두 컴포넌트의 소스 검토이며 기기 실행·전체 화면 검토·교체 완료가 아니다.

## 대체 조건

| 대상 | 확인한 제품 계약 | 현재 HJM 차이 | 결정 |
| --- | --- | --- | --- |
| PhotoFilePreview | Expo Image onDisplay 이후에만 onReady(true). 닫기·보기 모드 변경 시 review 무효화, ticket와 unmount로 늦은 이벤트 차단. fit/2배/출력 pixel, 가로·세로 pan, 회전, cachePolicy=none | optional ImageViewer는 RN Image onLoad로 자체 로딩 상태만 해제한다. image host 슬롯·표시 완료 통지·명시적 배율 모드·supportedOrientations prop 없음 | host와 보기 계약을 보완한 뒤 대체. 현재 API로 직접 교체하면 결과 검토 의미가 바뀌므로 보류 |
| DisplayPresentation | 실측 글자 폭·거리 기준 속도, 방향·일시정지, 배경 전환 정지, 독립 wake lease, 회전, reader/reduced-motion 정지 표현 | ScreenLayout은 화면 배치이며 Modal이 아니다. Dialog는 제목·유계 ScrollView·카드 구조를 가진다. FullScreenOverlay는 공개 API에 없음 | 제품 출력과 wake lease 유지. 공통 layout 적용 가능성은 별도 fixture로 검증하고 Modal 이름만 바꾸는 wrapper는 만들지 않음 |

근거: Utilverse `docs/decisions/ADR-0020-photo-strip-and-mask.md`,
`docs/decisions/ADR-0018-world-clock-and-display.md`; HJM
`packages/react-native/src/image-viewer.tsx`, `overlays.tsx`, `screens.tsx`.
Dialog의 NativeModalProps는 orientation/presentation props를 통과시키지만 내용이 전광판용
전체 화면 canvas가 되는 것은 아니다. 따라서 orientation prop 존재만으로 동등성을 판정하지 않는다.

## 호출부에서 확인한 경계

- `PhotoOutputCard.tsx`는 `key={shown.uri}`로 미리보기를 다시 만들며 결과 사진에만 onReady를 연결한다.
  reviewRequired일 때 준비·사용자 확인 두 조건으로 저장/공유를 막는다. 이 조건은 HJM의 일반
  이미지 로딩 상태로 흡수하지 않는다. 결과 교체·원본 전환·닫기/재열기 회귀는 소비 검증에 포함한다.
- `PhotoScreen.native.tsx`의 리사이즈 결과는 onReady/key를 주지 않는다. 결과 교체 중 열려 있는
  미리보기의 배율·실패 상태와 늦은 이벤트는 별도 검증 대상이다. 이 호출은 export review gate를
  사용하지 않으므로 mask 결과와 같은 승인 흐름으로 간주하지 않는다.
- `DisplayBoardScreen.tsx`는 presentation이 있을 때만 전체 화면 컴포넌트를 마운트하고 닫으면
  해제한다. 입력 폼은 기존 도구 화면에 남는다. 문장·속도·방향·keepAwake는 제품 상태다.
- 호출부는 관련 부분만 대조했다. 세 파일 전체의 자체 UI 검토는 아직 pending으로 남긴다.

## 구현·검증 순서

1. ImageViewer 확장 전에 이미지 표시 host와 확대 상태의 책임을 설계한다. 일반 갤러리 paging과
   파일 결과 검토를 동일한 상태로 합치지 않는다. optional peer와 플랫폼 이미지 host 경계를 유지한다.
2. fit/2배/pixels 접근 가능한 명시적 조작, pan/pinch 충돌, 이미지 오류·재시도, 가로 화면·큰 글자에서
   닫기/보기 모드 접근, 표시 완료 뒤 사용자 확인 및 교체/닫기의 무효화를 검증한다.
3. 전광판은 ScreenLayout의 contentInset/scroll/header/footer로 출력 영역이 줄거나 중첩 scroll이
   생기는지 비교한다. 출력 NativeText는 사용자 문장의 viewport geometry이므로 표준 본문 Text로
   치환해 실측·스케일 계약을 잃지 않는다. wake tag 소유권·늦은 activation 정리는 제품에 둔다.
4. HJM 구현과 UI·기능 검증 및 실제 npm 게시 후 소비 dependency/lock을 갱신한다. 현재 소비 manifest의
   두 HJM dependency는 `1.12.2-basic-screens-preview.6` 로컬 tarball이며 게시 1.13.1 채택 증거가 아니다.

이번 작업은 소스 판단 두 건과 잘못된 API 이름 정정이다. 소비 코드 변경·테스트 실행·기기 QA·
HJM 공개 API 확장·게시를 수행하지 않았다. 원시 캡처나 임시 실행 산출물은 생성하지 않았다.
