# QA 리포트 — 종이 줄무늬와 테마 상속

## 1. 최종 판정

부분 확인: 기존 EffectSurface에 정적 ruled와 ruledSpacing을 추가하고 paper canvas 및 양 Showcase 실험에 연결했다. Web 실제 화면·양 renderer 회귀·타입·경계 검사가 통과했다. Native 실제 기기 래스터/입력/음성/OS 복귀와 실험 승급·npm 게시·소비 앱 반영은 미확인이다.
2026-10-07 19:40~19:57 KST root 수행. 사용자 “필요한것만 조사해”에 따라 저장된 A-02 원장을 재사용했다. 추가 전수 조사는 하지 않았다.
최대 글자와 최대값을 모사한 확대를 설계·실행·후속·완료/릴리스 차단에서 제외했다. LargeText는 규격상 등록만 했으며 실행하지 않았다.

## 2. 구현과 이전 동작

main0a7ddfcb + 이번 변경. 버전1.15.0 유지, 새 ruled 옵션은 게시된 1.15.0에 포함되지 않는다. 공유 Comment/screen-flows 미커밋 변경도 빌드 환경에 있지만 이 기능의 검수로 확대하지 않는다.
이전 종이 grain과 noise에는 노트 선이 없었다. 새로운 입력/테마 엔진 대신 기존 EffectSurfaceDescriptor.layers에 ruled를 추가했다. 한 선1host unit, 간격 기본24/유한8~128, semantic text 색/intensity. 기존 최대4layer 수와 optional Native SVG peer를 유지한다.
줄무늬를 mesh/grain transform 밖에 두어 선 간격이 늘어나거나 움직이지 않는다. ruled-only active 요청도 animation을 시작하지 않는다. seed는 줄 위치를 바꾸지 않는다. 텍스트 baseline/내용 회전/테이프·찢어진·타공·물결 경계는 제공하지 않는다.
paper 실제 canvas는 grain+ruled/intensity0.06/spacing24다. 실험의 앱 소유 override는 grain 또는grain+ruled/intensity0.12/spacing24·40이며 명시 override와 상속을 구분한다. 공통 OverviewScreen의 도구·기록·footer·내용 상태를 그대로 합성했다.
양 실험 경로: `실험/구성/비교와 검증/종이 줄무늬 비교`; Default/Dark/LargeText/ReducedMotion/Rtl.

| 소스 | SHA-256 |
| --- | --- |
| packages/design-contracts/src/effect-surface.ts | f7b8631b3662ed629fe758861d121adb9f0881ae2bdc7c8255fea369980b34ff |
| packages/design-contracts/src/design-profile.ts | c1b6a544b4187d1de5072f0a98af33fb1b7947a19d2fb42e3563e4529ea4fd15 |
| packages/react/src/effect-surface.tsx | 9f34384bc577729667a8c26d6f79d0c24a876dcbb2e832665f44d478eebc50be |
| packages/react-native/src/effect-surface.tsx | dbea03aaf12791e7268c5c87fb0db7c49403be6237e691d287c13b31ceba4750 |
| showcase/shared/paper-surface.ts | be1904bb97bfc7bd119c47065b3f4656feae0dd3b0320b882a626e2d65678b3d |
| showcase/web/src/patterns/paper-surface-preview.tsx | c3da0f1f9156e144b30c245a7e293c8d8fd47932a6ff18d6f45a65a55a603b3d |
| showcase/native/src/paper-surface-preview.tsx | b92d30276d4ddbc74e9f914a2d580281d7db9534ba83dccbcfd92cf8ec645a08 |

## 3. 환경과 실제 흐름

macOS Chromium/DPR1, 본인 Playwright 신규tab1. frozen Storybook preview6030, 1200×1000 light/ltr 및390×844 dark/rtl, reduced motion/textScale1. 공유 watch·Expo·DeviceHub·시뮬레이터를 조작하지 않았다. 합성 메모이며 실제 서버/계정/영구 저장 없음.

| 흐름 | 실제 관찰과 판정 |
| --- | --- |
| 10종×3모드×두 환경 = 60조합 | paper/forest/minimal/editorial/brutalist/glass/aurora/terminal/clay/retro에서 상속/평면/명시 줄무늬. 모두 같은 입력 DOM·초안 유지, 가로 overflow 없음 |
| 상속과 override | 상속은 paper만 ruled, 다른 preset은 기존 layer 유지. 명시 ruled는 각 palette에서 24unit, transform none. plain은 ruler 없음 |
| 간격24→40·기록 확인 | 동일 입력·초안 유지, 실제 pattern height40. status가 현재 초안을 표시 |
| light 및 좁은 dark/RTL 상세→Escape | 현재 초안 표시, 닫힌 후 자세히 읽기 trigger로 초점 복귀. 남은 ruled 간격40 |
| VQ 한 장 | 최종64PNG contact sheet1400×8320 검토, 종이 light 상속·forest dark RTL ruled·좁은 Dialog 원본 확인. 제목/본문/입력/닫기/행동 잘림 관찰 없음 |

줄은 실제 픽셀 화면에서 보인다. 내용·입력은 일반 레이아웃이며 카드 내용은 기존 Surface 위에 있다. 임의 브랜드/강도에서 전역 가독성을 보장하지 않는다. Native 단위·rasterization·실제 peer 설치는 Web 픽셀/타입 검사만으로 확인하지 않는다.
처음 favicon404 두 건, 최종 dark navigation console error/warning0. 실행 JS 오류는 관찰하지 않았다.

## 4. 로컬 검사와 수정 전후

| 검사 | 결과 |
| --- | --- |
| contracts effect-surface/design-profile | 13검사 통과: 기본/seed/four-layer bound/spacing 범위/invalid persisted 값/paper override |
| Web ruled-surface.browser | 2검사 통과: 실제 physical-unit pattern·motion 분리·초점과 같은 input·profile→공개 screen→neutral 제거 |
| Native effect-surface host | 5검사 통과: 정적 host·간격·편집 초안·기존 실패 격리/숨김/모션 실패와 공개 screen의10종+neutral 전파. 실제 기기 검증 아님 |
| contracts/Web/Native tsc build 및 noEmit | 통과 |
| 양 Showcase typecheck·Native story 생성 | 통과 |
| Web token boundary | 313source·70 exact declarations 통과 |
| contracts/renderer import graph | 통과. contracts effect-surface4modules/14.2kBraw/8.4kBgzip; Web effect-surface2modules; Native effect-surface2modules/14.5kBraw/4.2kBgzip. 모듈 수/금지 경계 유지, byte 상한 변경 없음 |
| frozen Web build | exit0, 10.11s, 기존 use-client/chunk 경고 |
| 문서 링크 | 589Markdown 통과 |
| Storybook/usage/public map | 433files/969IDs; 토큰13/컴포넌트139/구성59/화면22; 310platform API 통과 |

첫 Web screen 회귀 fixture는 required toolbarLabel을 빠뜨려 trim 오류가 났다. 실제 공개 prop을 공급한 뒤 2검사 통과. 사용 지침의 표 머리말/환경 export 표시 이름을 실제 탐색 규격에 맞춰 수정한 뒤 정적 검사 통과. 첫 Native story generator 경로 추정은 실패했고 설치된 workspace bin으로 실행해 통과했다.
최종 frozen artifact 뒤 바뀐 것은 환경 story의 표시 이름 규격 수정과 Native test 정리뿐이며 renderer/fixture 동작은 동일하다. 원격 CI/dispatch·버전 상승·npm 게시는 실행하지 않았다.

## 5. 미확인과 보관

Native 실제 선·옵션 peer·UI/OS 입력·읽기·모달 복귀/성능 검수는 남았다. 테이프·회전·찢어진/타공/물결 경계는 미구현이며 이 줄무늬로 대체 완료라고 세지 않는다. 외부 원제품 assets/live flow·사진 재질/동등성도 미확인이다. 미독해 외부 페이지는 현 완료·릴리스 차단 항목이 아니다.
원시 파일 66개 총7242725bytes. 이름/bytes/SHA 정렬 manifest SHA: ed75c9b689aa4a4358843de6e747be4a9a1372b626df51aa384e7b74e074ce97. Contact sheet SHA: c24065abf21547dadd39ada791b51d4bce24a91713bda8d8fa5464489e8475ed. Frozen index SHA: 4fcc23d95a32bd853906ac033d8d0b1a672a827d3777a9ec678e05de8093b125.
QR 지침에 따라 대조 후 본인 raw/JSON/contact sheet·정적 artifact/log·확인 가능한 snapshots·테스트 실패 이미지·preview/tab을 정리한다. 재사용 fixture·계약·회귀·조사 원장은 보존한다.

원시64PNG·JSON/contact sheet·본인 frozen static/log와 정확히 대조한 preview6030 PID96140·tab1을 정리했다. 기존 blank tab0·공유 watch/Expo/시뮬레이터·다른 세션 소스/QA는 보존했다.

| 확인 후 제거한 본인 원시 파일 | bytes | SHA-256 |
| --- | --- | --- |
| page-2026-10-07T10-49-03-334Z.yml | 0 | e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 |
| console-2026-10-07T10-49-03-071Z.log | 276 | 6b85c42fa762ec3a842ab5f7dc4937b6c015b52489edb00a9244cb7c599474e7 |
| page-2026-10-07T10-51-06-507Z.yml | 0 | e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 |
| propagates-the-paper-canvas-through-a-public-screen-and-removes-it-in-a-neutral-profile-1.png | 2082 | 0a157c250dcc942cb0f7ff7b76b82b83ead2517b136b5e9ec2ca4f08242cf3dd |
