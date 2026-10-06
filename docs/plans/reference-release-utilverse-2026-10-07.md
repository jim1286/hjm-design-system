# 레퍼런스 전수 검토 → HJM 릴리스 → Utilverse 채택

2026-10-07 사용자 요청: 11개 사이트를 전수 조사하고 권장 항목을 모두 실험에 넣은 뒤,
UI·기능 검증을 거쳐 승격·릴리스하고 Utilverse의 대체 가능한 자체 UI를 HJM으로 바꾼다.
이 요청은 검증 후 Storybook 승격과 HJM npm 게시 권한을 포함한다. Utilverse 스토어 출시는 포함하지 않는다.
상태: 진행 중. 이전 7개 실험과 PR #55 머지는 전체 목표 완료가 아니다.

## 완료 증거

| 요구 | 필요한 증거 | 현재 상태 |
| --- | --- | --- |
| 11개 사이트 전수 조사 | 사이트별 발견 URL 목록과 페이지별 검토·미확인 기록, 후보별 채택 판단 | 미완료. 이전 조사 수집 수를 UI 검토 수로 세지 않음 |
| 권장 항목 모두 실험 구현 | 후보 목록과 Web/Native 공개 API·개별 스토리·사용 지침 연결 | 로컬 main 13개 실험 구현, 추가 후보 검토 중 |
| UI·기능 검증 | 밝음/어두움/큰 글자/RTL/모션 감소 및 실제 행동, 전체 시트와 기기 QA | PR #55 자동 검사 통과. 신규 시각·기기 검증 필요 |
| 검증 후 승격 | 항목별 QA 근거, Storybook 양쪽 경로와 지침 동시 갱신 | 미실행. 사용자 승인일 2026-10-07, 검증 조건 충족 후 적용 |
| HJM 릴리스 | 동기화된 버전·Changeset·CI, npm 세 패키지와 tag의 동일 SHA | 미실행. 게시 1.13.1 이후 실험·host 개선은 로컬 main 작업 중 |
| Utilverse 적용·대체 | 모든 화면/컴포넌트 대조표, 공개 API 교체, 제품 상태·테마·데이터 회귀 | 사전 소스 조사 시작. 릴리스 후 정확한 npm 버전 설치 |

## 후속 후보와 검토 순서

2026-10-06 조사 §3의 18개 후보를 빠뜨리지 않는다. 아래 상태는 구현·권고를 구분한다.
새 목록에서 발견한 후보도 검토 후 추가하며 장식 유사성만으로 구현을 중복하지 않는다.

| 후보 | 현재 구현/판단 | 남은 일 |
| --- | --- | --- |
| Morphing Popover / Dialog | 원본 초점·초안 소실 확인. 양 Dialog renderer와 Web Popover에 motionOrigin 구현, 초안 보존 편집 실험에 비모달 변형 추가 | Dialog/Popover 전체 환경·기기·성능 검증. docs/qa/2026-10-07-overlay-origin-transition.md |
| Transition Panel | ContentTransition animateHeight 구현 | 실제 Web/Native 빠른 전환·입력 보존·큰 글자 UI 검증 |
| Animated Background | Tabs gooey 유지. SegmentedControl selectionMotion=slide 실험 추가 | Web/Native 회귀 7개 통과, 기본·다크·큰 글자 Web UI 확인; 좁은 화면·팔레트·기기 검증 대기 |
| Stateful Button | ActionFeedback 실험 | 완료·실패·재시도와 UI 검증 |
| File Upload | UploadRecovery 실험 | 선택·중복·취소·오류 복구 검증 |
| Bento Grid | ProductBento 실험 | 좁은 화면/Native 정보 순서·레이아웃 검증 |
| CTA | Ente/Webflow 갤러리 캡처 대조. ProductBento에 BottomCTA/BottomInfo·초안 유지·실패/재시도 연결. Web·iOS 실제 흐름 확인 | 전체 갤러리 시각 검토·제품 팔레트·Native 환경 조합. docs/qa/2026-10-07-cta-reference.md |
| Refero | Wise 캡처·역할 추출 간 불일치를 확인해 REFERENCE_BRIEF에 관찰/추론 구분 추가 | 전체 스타일 시각 검토와 역할별 제품 테마 대조 |
| Image Comparison | 양 renderer 공개 API 및 실험 | 실제 드래그·스크롤 충돌·RTL·이미지 실패 UI 검증 |
| Dynamic / Expandable Toolbar | ContextToolbar 실험 | 키보드·초안 유지·초점 복귀 검증 |
| Progressive Blur | 경계·초점 보호를 포함한 양 renderer 실험 구현. iOS 실제 합성·끝 항목 선택·내용 축소·다크 확인 | Android 합성·접근성·제품 팔레트·비용 비교. progressive-blur-adoption-2026-10-07.md |
| Noise / EffectSurface | 기존 grain은 반복 점 패턴, 원본 Noise Texture는 fractal noise로 정적 소스상 차이 확인 | 실제 질감·양 플랫폼 비용 비교 후 추가 여부 결정 |
| Hero Video Dialog | 기존 Dialog + 제품 player host Web/Native 실험 구현. Web 실제 재생·실패 복구·닫기·초안 유지 확인 | Native 실제 기기, 제품 팔레트, 실제 유음 콘텐츠의 자막/대본 검증 남음. 무음 fixture를 자막 검증으로 세지 않음 |
| Rating | 양 renderer 공개 API 및 실험 | 평균/입력/초기화·키보드·큰 글자 UI 검증 |
| 3D icons | 그림과 시작 안내 실험 추가(Web/Native), CC0 원본 2개 | Web 흐름·다크·큰 글자·390px 확인, Native 실제 기기·다른 제품 팔레트 검증 남음 |
| Number Ticker | 공식 소스·기본 데모 대조 후 기존 엔진 유지. 양쪽 소수/음수·비라틴·지수·모션 감소·RTL 비교 스토리 추가 | Native 실제 변형·접근성 및 전체 환경 검증. docs/qa/2026-10-07-number-reference.md |
| Scroll Progress / Tracing Beam | 원본 본문/선 관찰, 기존 ScrollProgress 유지. Web·iOS 본문 스크롤·축소·복원 검증 | 광선 표현·원본 속도 반응은 미확인. docs/qa/2026-10-07-reading-reference.md |
| Animated List | ContentTransition enterOnMount + List 양 플랫폼 실험 추가. 초기 데이터 지연 없이 새 행 등장·초안 보존·재정렬·삭제·정지 | 전체 팔레트·RTL·성능·Native 환경 검증. 재정렬 이동 모션은 미구현. docs/qa/2026-10-07-live-list.md |

## 이번에 갱신한 관찰

- Uiverse는 2026-10-07 IAB에서 `/elements` 목록을 열 수 있었다. 페이지 제목은 4,489 UI elements이며,
  기존 Galaxy 소스 3,802개와 동등하지 않다. 이전의 HTTP 403을 현재 사이트 전체 접근 불가로 이어 쓰지 않는다.
  목록은 Randomized 정렬이므로 안정된 정렬과 페이지 경계를 확인한 뒤 URL별 중복을 제거해야 한다.
- 21st 약관 §3의 자동 수집·미디어/메타데이터 재사용 제한을 현재 원문에서 재확인했다.
  전체 마켓 일괄 수집은 진행하지 않으며 공식 제공 경로/원저자 소스와 검토 가능한 범위를 구분한다.
  이 제한 때문에 남은 페이지를 검토 완료로 바꾸거나 전수 조사 범위를 축소하지 않는다.
- Utilverse 작업 시작 시 main은 ahead 1 / behind 2이고 dirty source는 없었다. 다른 작업의 커밋을
  초기화하지 않는다. 앱은 Native 전용이며 5개 제품 테마·자체 artwork·로컬 도구 데이터 경계를 유지한다.

## Utilverse 1차 대조 지점

검색 결과를 교체 확정으로 세지 않는다. 제품 소유 도구 렌더링·native host는 실제 계약에 따라 남길 수 있다.

| 소스 | 현재 구현 | 우선 대조할 HJM |
| --- | --- | --- |
| components/LanguageSelect.tsx | Sheet 안 Pressable 선택 행 | ListRow / 선택 목록 계약 |
| components/PhotoFilePreview.tsx | Native Modal + 이미지 미리보기 | ImageViewer / Dialog의 host·확대·닫기 계약 |
| components/AuthorAvatar.tsx | Pressable 아바타 | Avatar의 공개 행동/링크 슬롯 |
| features/ConversationScreen.tsx | 메시지 주변 Pressable·NativeText | ChatMessage / MessageComposer / reaction 계약 |
| features/ToolboxScreen.tsx | 제품 tile Pressable | Card / Grid / action 공개 슬롯, 제품 shell 테마 유지 |
| components/DisplayPresentation.tsx | 전체 화면 native Modal | FullScreenOverlay / 화면 layout 비교, 화면 밝기·회전은 제품 host |
| 삭제·신고 확인 5개 화면 | Alert.alert | AlertDialog와 취소·파괴 행동·중복 제출 계약 |

소스는 `apps/utilverse/apps/mobile/src/` 기준이다. 전체 route·feature·component inventory를 만들고
각 항목에 교체/유지 이유와 검증을 연결한 뒤 채택 완료 여부를 판단한다.


## 조사 재개에 쓰는 기록

- `reference-component-review-ledger.json`: 기존 네 공식 목록 283개 URL의 대응 판단과 페이지별 실제 검토 상태.
  기본 pending은 이전 분류를 새 UI 검증으로 잘못 올리지 않기 위한 값이다. 첫 후속 Animated Background에 구체적인 관찰을 추가했다.
- `reference-site-inventory.json`: 2026-10-07 robots에 공시된 사이트맵에서 발견한 페이지 URL. Minimal 3,433,
  CTA 551, Aceternity 501, Magic UI 257, Refero 1,394. 총 6,136 URL이며 중복 이미지 loc는 수집하지 않는다.
  이 수는 공개 링크 탐색 종료나 시각 검토 수가 아니다. 이전 감사의 추가 내부 링크를 대조해야 한다.
- 위 두 JSON은 페이지 원문·미디어·실행 로그가 아니라 후속 검토의 URL별 진척을 유지하는 조사 증거다.
  QA 원시 파일 정리 때 삭제하면 매번 범위를 다시 발견해야 하므로 검토 종료까지 보존한다.


## Utilverse 소스 inventory

`node scripts/audit-consumer-ui.mjs <utilverse-root> docs/plans/utilverse-ui-adoption-inventory.json`
명령으로 소비 저장소의 TypeScript parser를 사용해 `apps/mobile/src/**/*.tsx` 136개를 읽었다.
JSX에서 실제 사용한 import·alias·행 번호·파일 hash를 기록했으며 파일별 review는 아직 pending이다.
HJM import가 있다는 사실만으로 내부 자체 UI가 대체됐다고 판단하지 않는다. Alert.alert 같은
JSX 밖 호출은 위 1차 대조 목록 및 후속 동작 분석으로 함께 확인한다.

PhotoFilePreview를 직접 읽고 중요한 차이를 확인했다. 제품은 Expo Image의 `onDisplay`로만
결과 검토를 허용하고 오래된 파일 이벤트를 ticket으로 무효화한다. 현재 HJM ImageViewer는
Native Image `onLoad`만 사용하며 host-render/표시 확인 슬롯이 없다. 단순 교체하면 데이터 승인
시점이 바뀌므로 릴리스 전 공통 host 확장 또는 공통 overlay+제품 이미지 host 구성을 검토해야 한다.
LanguageSelect는 ListRow의 고정 접근성 역할을 보완하려고 별도 radio Pressable을 사용한다.
HJM RadioGroup의 renderIndicator와 세로 row presentation으로 같은 의미·체크 표시를 지원하는지 비교한다.


## 2026-10-07 공식 페이지 범위 재검사

`python3 scripts/audit-reference-pages.py`로 Magic UI·Aceternity 사이트맵 757개 정규화 URL에서
시작해 HTML 내부 링크를 따라 발견 큐가 빌 때까지 검사했다. 총 1,194 URL: Magic UI HTML 286,
Aceternity HTML 893, 404 14, 오디오 1. 이 검사는 정적 HTML 범위이며 브라우저에서만 나타나는
링크·로그인·유료 영역·전체 화면과 동작 검토를 완료했다는 뜻이 아니다. URL·응답·hash·제목 요소·
heading·표시된 코드 import·소스 링크를 `reference-page-source-index.json`에 보존했다.
원문 HTML은 보존하지 않는다. 반복 탐색은 기존 기록으로 재개하며 21st는 자동 수집 대상에서 제외한다.

기존 Aceternity 후보에 있는 12개 주소가 404였다. 실제 source 파일 이름과 문서 route가
일치하지 않는 항목을 새로 대조해야 한다. 내부 링크에서 찾은 목록 밖 25개 페이지를 ledger에
추가했다(설치/도구 문서 4개 포함). 오래된 URL을 조용히 지우지 않고 404 근거를 남긴다.
원문 title 요소에는 SVG 제목도 섞일 수 있어 document title이라고 표시하지 않으며,
표시 코드 import가 비어 있다는 사실을 의존성이 없다는 근거로 쓰지 않는다.

## Utilverse Avatar 채택에 필요한 호스트 확장

자체 Avatar는 Expo Image disk 캐시와 로딩 중 이니셜 유지가 있다. Native HJM Avatar에
`renderImage({source,size,fallback,onError})`를 추가해 제품 host를 연결하고 프레임·접근성·
대체 표시를 HJM에 남겼다. A→B→A 뒤 이전 이미지 실패가 새 이미지를 지우지 않도록
source 세대 검사를 넣었다. 기존 Native Image 경로는 유지한다. 아직 미게시·앱 미적용이다.

## 영상 다이얼로그 실험

10번째 레퍼런스 실험으로 `실험/구성/정보 표시/영상 미리보기`를 두 Showcase에 추가했다.
공개 Dialog를 재사용하고 플레이어만 제품 호스트로 공급한다. 6초 자체 생성 무음 fixture로
Web 실제 재생과 decoder 오류→재시도를 확인했다. 닫기 즉시 플레이어를 제거하고 초안과
초점 복귀를 유지한다. Native 모듈 없는 기존 개발 앱은 지원 누락 안내를 보여 준다.
이 안내는 기기 재생 통과가 아니며 승격·릴리스 전에 실제 host 검증이 남는다.
자세한 결과와 미확인 범위는 `docs/qa/2026-10-07-video-dialog.md`에 기록한다.
