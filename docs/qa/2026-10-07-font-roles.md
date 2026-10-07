# QA 리포트 — 표시·읽기·기술 글자

## 1. 최종 판정

부분 확인: optional display/reading family 역할, Text.fontRole, 양 renderer 및 실험 등록을 구현했다. Web 실제 화면과 contracts/Web/Native host 회귀·타입·경계 검사가 통과했다. Native 실제 기기 font/glyph/fallback·OS 흐름, 승급·npm 게시·소비 앱 반영은 미확인이다.
2026-10-07 19:18~19:40 KST root 수행. 사용자 “필요한것만 조사해”에 따라 저장된 A-05/C-T01 판단을 재사용했고, 구현에 필요한 플랫폼 서체 문서만 확인했다. 전체 사이트 전수 검토를 수행했다고 주장하지 않는다.
최대 글자 및 최대값을 모사한 확대는 설계·실행·후속·완료/릴리스 차단에서 제외했다. LargeText는 규격상 등록만 했으며 실행하지 않았다.

## 2. 변경과 이전 동작

main 89d03ba7 + 이번 변경. 1.15.0 숫자는 유지했으며 이번 API는 게시된 1.15.0에 포함되지 않는다.
이전 ui/code 두 family만으로 제목과 읽기 본문을 독립 설정할 수 없었다. profile에 display/reading을 선택적으로 추가하고 기존 Text에 fontRole을 연결했다. 기본 Heading/title은 display, body/bodyLarge는 reading, label/caption/조작은 ui, 기술 표시는 code다. role은 기존 의미·크기·weight·문서 level을 바꾸지 않는다.
역할 생략 시 **현재 ui**를 상속하므로 Verdana 등 제품 override와 terminal의 monospace를 유지한다. 새 중립 기본 family나 별도 registry/state engine/root entry를 만들지 않았다. 입력 배열 복사·freeze, 잘못된 persisted role/빈 family 검증을 공통 계약이 소유한다.
Web은 가까운 Provider와 portal의 CSS 변수를, Native는 기존 platform font resolver를 사용한다. 본문 컨테이너 안의 버튼·필드는 UI family를 유지한다. 브랜드 폰트·권리·glyph·파일 등록/로딩은 제품 소유다. small-caps/contextual tracking/OpenType는 이번 구현 범위가 아니다.
실험 경로: `실험/토큰/색과 글자/표시·읽기·기술 글자`; Default/Inherited/Dark/LargeText/ReducedMotion/Rtl.

| 대상 | SHA-256 |
| --- | --- |
| packages/design-contracts/src/foundations.ts | 54b5b068b221821a1886c38deb521556c6d0ec50a03e2eae5455d7085653633c |
| packages/design-contracts/src/design-profile.ts | 67ad0f2731c73f33ab67aa090dcf5fa8a6cd86a88f0dba7ec94c70720c902fa8 |
| packages/react/src/layout.tsx | 247a0f38183d5789f9ac7cb4815117dcf05bae36037017d59ed026cc21dae8fd |
| packages/react/src/theme.ts | 549fe932ec463ce6f5344127c4fc2423f8406173ac2b78c4107305c44334d4cb |
| packages/react/src/styles.css | 8162c741f392750be74d7509999f1d1231994c4ecf764ceeed89115a9ca073af |
| packages/react-native/src/primitives.tsx | 4006baf4d946b07c73068e837574ad2527f06c5bff59b493fb0f4140667db719 |
| packages/react-native/src/heading.tsx | 8801937c519e586e695451c4b5ddc297e12813ef8f95a64f065ecdb570043b72 |
| showcase/shared/font-role-preview.ts | ac27887024c0c029b0b2f5e5e1ff78fcabd26378040f03a6d2ca5dbee0fed91b |
| showcase/web/src/foundations/font-role-preview.tsx | 60b2effe170189c704e3a7b953eaa01c45f1f584f24460e58dfe75200949c9f1 |
| showcase/native/src/font-role-preview.tsx | c315949f2adc2fdb38789cead04fd23872bb1619dfaa2ab57496bcda759c8b19 |

## 3. 환경과 실제 흐름

macOS Chromium/DPR1, 본인 Playwright tab1, frozen Storybook preview6029. 1200×1000 light/ltr 및 390×844 dark/rtl, textScale1, reduced motion. 공유 Native watch·Expo·시뮬레이터와 다른 세션 Comment 변경을 조작하지 않았다. 합성 입력이며 서버/영구 저장 없음.

| 흐름 | 관찰과 판정 |
| --- | --- |
| 10종×상속/분리×두 환경 = 40조합 | retro/paper/forest/minimal/editorial/brutalist/glass/aurora/terminal/clay; 같은 입력 DOM과 초안 유지, 가로 overflow 없음. 상속 title/body가 현재 UI와 일치, 분리 title Georgia/reading Palatino CSS stack 확인 |
| terminal 상속 | title/body/UI monospace 일치, code 유지. 기존 ui-only profile 호환 확인 |
| 넓은 분리 Dialog 입력→다음 테마→Escape | 제목 display/본문 reading portal 전파, 상세와 본문 초안 동일, 동일 본문 input 유지, 닫힌 후 상세 보기로 초점 복귀 |
| 좁은 다크/RTL 상속 Dialog 입력→다음 테마→닫기 | UI family 상속, 본문/상세 초안 동일, overflow 없음, 초점 복귀 |
| VQ 한 장 비교 | 42개 최종 PNG contact sheet 1400×7480 검토. 종이 light 분리·terminal dark RTL 상속·좁은 Dialog 원본 확인. 제목/본문/입력/닫기/주 행동 잘림 관찰 없음 |

CSS stack 확인은 실제 모든 glyph가 명명된 font에서 렌더링된 증거가 아니다. 한글 fallback·웹 font 다운로드·제품 라이선스·Native device availability를 완료로 보고하지 않는다.
초기 preview에서 favicon404 두 건; 최종 dark navigation의 error/warning0. 실행 JS 오류는 관찰하지 않았다.

## 4. 로컬 검사

| 검사 | 결과 |
| --- | --- |
| contracts font-roles + design-profile tests | 11검사 통과, 역할/기존 UI fallback/복사와 freeze/invalid 입력 |
| Web font-roles.browser | 2검사 통과, 실제 computed family/Heading semantic level/Card/Dialog/nested reset/UI 조작/같은 입력과 초안 |
| Native font-roles host | 2검사 통과, 역할별 host style/heading 의미/UI field/실제 onChangeText→profile 갱신. 실제 기기 검증 아님 |
| 양 renderer build/typecheck, contracts build/typecheck, 양 Showcase typecheck | 통과 |
| Native Storybook 생성 | 통과 |
| Web story-dependency/style-boundary | 2검사 통과 |
| Web token boundary | 311 source·70 exact declarations 통과 |
| contracts/renderer import graph | 통과, 모듈 수/금지 경계 유지. 바이트 증가만 보고, 상한 변경 없음 |
| Web frozen Storybook build | exit0, 9.75s. 기존 use-client/chunk 경고 |
| usage/Storybook/public API map/doc links | 토큰13/컴포넌트139/구성58/화면22; 431파일/964ID; 310platform API; 문서586개 최종 검사 통과 |

초기 Native showcase SegmentedControl 진입점은 selection 대신 실제 inputs로 수정했다. 초기 Native test의 defaultValue 추정은 실제 controlled value/onChangeText로 수정했다. Web focus를 act 안에 두어 테스트 경고를 없앴다. 최종 집중 검사 모두 통과. 마지막 foundation 설명 수정은 native에서 첫 named family를 요청하는 기존 resolver의 동작을 정확히 적은 주석 변경이며 contracts를 다시 생성했다. frozen Web artifact 동작에는 영향이 없다.
일반 개발 원격 CI/dispatch, 버전 상승, npm 게시를 실행하지 않았다.

## 5. 미확인과 보관

Native 실제 font/glyph/fallback·OS 입력·읽기 순서·모달 복귀는 후속 검수 범위다. 제품 font 자산/로딩/권리와 contextual tracking/small-caps는 별도다. 미독해 외부 페이지는 완료/릴리스 차단 항목이 아니다.
원시 파일 44개 총5534225bytes, 이름/크기/SHA 정렬 manifest SHA: 094d5843aa754035f712d2b846aefadaaf379f27d08cb15621ca92b74153c6c4. Contact sheet SHA: 93c8d720c147385760852be839d390e283b2a1f12a649f22434644ac2382a639. Frozen index SHA: 75a13b5fbb1ee4c2c4aa48bd783f8197dd00d3463b36ea64b7ad1be19b5786fa.
QR 지침에 따라 검토 후 본인 원시 이미지·JSON/contact sheet·임시 static/log·확인 가능한 본인 snapshot·preview/tab을 제거한다. 재사용 fixture·계약·회귀와 출처 원장은 보존한다.

검토 후 본인 raw/static/log와 정확히 확인한 preview6029 PID91955 및 tab1을 정리했다. 기존 blank tab0·공유 watch/Expo/시뮬레이터·다른 세션 기록은 보존했다.

| 확인 후 제거한 본인 snapshot/log | bytes | SHA-256 |
| --- | --- | --- |
| page-2026-10-07T10-29-40-642Z.yml | 0 | e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 |
| console-2026-10-07T10-29-40-409Z.log | 276 | 835a8d74ddf8f4745aa73a10120c7ba01adbf04ab321fb8b8657c8bbe943bbd2 |
| page-2026-10-07T10-30-50-132Z.yml | 2682 | cf23fea2dd6f24c116be4ffd688c46ecca5be43bee8fa2223c4c465ff25bdae2 |
| page-2026-10-07T10-31-06-154Z.yml | 2665 | b54c9313a1729db6cc7923070dcb9ba5106107c867307e78d8092351081f8809 |
| page-2026-10-07T10-31-07-458Z.yml | 0 | e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 |
