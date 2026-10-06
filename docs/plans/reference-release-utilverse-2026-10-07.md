# 레퍼런스 전수 검토 → HJM 릴리스 → Utilverse 채택

2026-10-07 사용자 요청: 11개 사이트를 전수 조사하고 권장 항목을 모두 실험에 넣은 뒤,
UI·기능 검증을 거쳐 승격·릴리스하고 Utilverse의 대체 가능한 자체 UI를 HJM으로 바꾼다.
이 요청은 검증 후 Storybook 승격과 HJM npm 게시 권한을 포함한다. Utilverse 스토어 출시는 포함하지 않는다.
상태: 진행 중. 이전 7개 실험과 PR #55 머지는 전체 목표 완료가 아니다.

## 완료 증거

| 요구 | 필요한 증거 | 현재 상태 |
| --- | --- | --- |
| 11개 사이트 전수 조사 | 사이트별 발견 URL 목록과 페이지별 검토·미확인 기록, 후보별 채택 판단 | 미완료. 이전 조사 수집 수를 UI 검토 수로 세지 않음 |
| 권장 항목 모두 실험 구현 | 후보 목록과 Web/Native 공개 API·개별 스토리·사용 지침 연결 | 로컬 main 16개 실험 구현, 추가 후보 검토 중 |
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
| Transition Panel | Web 빠른 전환·입력 보존. Native 큰 글자 키보드 아래 입력 접근 문제를 화면 scroll host로 수정 | 필드 외곽 자동 노출·전체 환경·성능. docs/qa/2026-10-07-native-panel-noise.md |
| Animated Background | Tabs gooey 유지. SegmentedControl selectionMotion=slide 실험 추가 | Web RTL 리사이즈 배경 이탈 수정, iOS 2배 글자 키보드 접근·다크/RTL 선택 확인. 팔레트·Android·접근성·성능 대기. docs/qa/2026-10-07-selection-motion.md |
| Stateful Button | Web·iOS 실패→편집→현재 초안 저장 확인. pending 라벨·실패 설정 잠금·비서버 안내 보완 | 환경 조합·제품 상태 연결. docs/qa/2026-10-07-feedback-panel-reference.md |
| File Upload | Web 실제 파일 제한·중복·취소·키보드 재시도 확인, 상태 전환 초점 수정. Native 합성 오류/재시도/성공 확인 | Native 시스템 picker·실제 전송 취소·환경 조합. docs/qa/2026-10-07-upload-reference.md |
| Bento Grid | ProductBento 실험 | 좁은 화면/Native 정보 순서·레이아웃 검증 |
| CTA | Ente/Webflow 갤러리 캡처 대조. ProductBento에 BottomCTA/BottomInfo·초안 유지·실패/재시도 연결. Web·iOS 실제 흐름 확인 | 전체 갤러리 시각 검토·제품 팔레트·Native 환경 조합. docs/qa/2026-10-07-cta-reference.md |
| Refero | Wise 캡처·역할 추출 간 불일치를 확인해 REFERENCE_BRIEF에 관찰/추론 구분 추가 | 전체 스타일 시각 검토와 역할별 제품 테마 대조 |
| Image Comparison | Native SVG 실패를 PNG fixture로 수정, 실제 드래그/양끝 확인. 양 renderer RTL 캡션 방향 수정 | Native 환경 조합·스크롤 충돌·이미지 host 실패 안내. docs/qa/2026-10-07-image-comparison.md |
| Dynamic / Expandable Toolbar | 단일 선택을 SegmentedControl로 수정. Web RTL 키보드·접기 포커스·초안 유지, iOS 키보드 중 선택·재개 확인 | Native 환경 조합·VoiceOver·제품 편집 모델. docs/qa/2026-10-07-toolbar-reference.md |
| Progressive Blur | 경계·초점 보호를 포함한 양 renderer 실험 구현. iOS 실제 합성·끝 항목 선택·내용 축소·다크 확인 | Android 합성·접근성·제품 팔레트·비용 비교. progressive-blur-adoption-2026-10-07.md |
| Noise / EffectSurface | 정적 noise 레이어와 동일 강도 grain 비교 실험 추가. Web 강도 변경 후 입력 유지·버튼, iOS 표시·입력·키보드 중 스크롤/버튼 확인 | 제품 팔레트·대비·성능·Android·접근성 검증. docs/qa/2026-10-07-noise-experiment.md |
| Hero Video Dialog | 기존 Dialog + 제품 player host Web/Native 실험 구현. Web 실제 재생·실패 복구·닫기·초안 유지 확인 | Native 실제 기기, 제품 팔레트, 실제 유음 콘텐츠의 자막/대본 검증 남음. 무음 fixture를 자막 검증으로 세지 않음 |
| Rating | Web 키보드/초기화 초점 버그 수정, iOS 큰 글자 선택·초기화·비활성 확인 | RTL·다크·제품 팔레트·스크린리더 검증. docs/qa/2026-10-07-rating-reference.md |
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
| components/LanguageSelect.tsx | Sheet 안 Pressable 선택 행 | Select로 선택창 전체 대체 검토 |
| components/PhotoFilePreview.tsx | Native Modal + 이미지 미리보기 | ImageViewer / Dialog의 host·확대·닫기 계약 |
| components/AuthorAvatar.tsx | Pressable 아바타 | Avatar의 공개 행동/링크 슬롯 |
| features/ConversationScreen.tsx | 메시지 주변 Pressable·NativeText | ChatMessage / MessageComposer / reaction 계약 |
| features/ToolboxScreen.tsx | 제품 tile Pressable | Card / Grid / action 공개 슬롯, 제품 shell 테마 유지 |
| components/DisplayPresentation.tsx | 전체 화면 native Modal | ScreenLayout / Dialog 비교, 출력 geometry·회전·화면 유지는 제품 host |
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
JSX에서 실제 사용한 import·alias·행 번호·파일 hash를 기록했다. 현재 열네 파일은 source-reviewed이며
나머지 122개는 pending이다. source-reviewed는 UI·동작 검증이나 채택 완료가 아니다.
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

## 추가 후보: 문장 주석

2026-10-07 Magic UI Highlighter의 실제 데모·공식 소스를 대조했다. 기존 TextFormat은
Web의 kbd/code/quote만 제공하므로 기존 API로 바로 흡수 가능하다는 초기 대응표는
기능 동등성을 뜻하지 않는다. 기본 강조·밑줄 외 박스/원/취소선/괄호와 줄별 주석을
비교할 새 실험 후보로 유지한다. 아직 구현하지 않아 실험 수는 14개다.

원본은 inline-block과 rough-notation을 사용하고 body resize마다 주석을 hide/show한다.
HJM에서는 문장 줄바꿈·텍스트 선택을 보존하고 장식은 접근성 트리에서 제외해야 한다.
정적 배경색만 더해 원본 손그림·줄별 표현까지 흡수했다고 판단하지 않는다.
공통 주석 계약과 양 renderer 측정·모션 감소·제품 팔레트를 설계한 뒤 실험으로 구현한다.
원본 문서의 duration 기본값 500ms와 해당 source의 600ms 차이도 관찰했다.
상세 근거와 미확인 범위는 [문장 강조 조사](../qa/2026-10-07-highlighter-reference.md)에 있다.

문장 주석의 공통 geometry 구현을 시작했다. `packages/design-contracts/src/text-annotation.ts`는
실제 측정한 줄 조각에서 7가지 주석의 결정적 경로와 잘림 방지 bounds를 만든다.
현재는 내부 모듈이며 공개 export·양 renderer·실험 스토리는 아직 없다. 문장 일부의
Native 줄별 측정이 다음 구현 지점이다. 실험 수를 늘리거나 UI 검증으로 집계하지 않는다.

문장 주석 Web 내부 renderer와 실제 DOM 브라우저 회귀 6개를 추가했다. 순수 geometry는
contracts subpath로 연결했지만 Web renderer 공개 export·양쪽 Storybook은 미등록이다.
Native 0.86.2/iOS 26.5에서 중첩 Text의 줄 이벤트 미발생·measure 0×0을 실측했다.
Native에는 정확한 문장 조각 측정 host가 필요하며 전체 문단 좌표로 대체하지 않는다.
원형 주석의 끝 글자와 선이 겹치는 시각 문제도 남았다. 양 renderer 연결과 이 문제 해결
후 실험으로 등록한다. 현재 14개 실험 및 전수 조사·릴리스 미완료 상태는 유지한다.

문장 주석의 큰 글자 끝부분을 가로지르는 circle 경로는 실패 회귀를 먼저 확인한 뒤
바깥으로 휜 루프로 수정했다. 계약 12개/브라우저 7개 통과. 원본 타원과의 형태 차이와
조밀한 줄 간격, Native 측정 문제는 계속 검토하며 아직 새 실험으로 집계하지 않는다.

Native 문장 주석의 후속 측정 후보로 Skia Paragraph를 실제 기존 iOS 기기에서 검증했다.
같은 엔진의 범위 측정과 그리기를 사용하면 한글·emoji·혼합 RTL의 대상 부분을 표시할 수
있었다. fallback run 경계가 겹치는 문제를 공통 병합 함수로 수정했다. 일반 Native Text와
줄바꿈은 달랐으며 선택·복사·폰트/스케일·장식 외곽·Android가 남아 있어 공개 컴포넌트나
새 실험으로 등록하지 않았다. 내부 측정 후보 확인을 일반 본문 대체 완료로 세지 않는다.

## Utilverse 미리보기·전광판 계약 대조

2026-10-07 fa201bc의 두 컴포넌트와 호출부를 HJM e7903e6에 대조했다.
계획의 FullScreenOverlay는 실제 공개 API가 아니므로 삭제했다. 사진 결과 확인은 Expo
onDisplay에 의존하며 ImageViewer의 onLoad로 치환할 수 없다. 전광판의 출력 geometry와
화면 유지 수명은 제품 소유다. 기존 Native Modal을 없애기 위해 기능을 줄이지 않는다.
[파일별 판단과 남은 검증](utilverse-preview-display-adoption.md)에 채택 전제와 보존 계약을 적었다.
현재 소비 manifest는 1.12.2-basic-screens-preview.6 로컬 tarball이다. HJM 게시 버전과
소비 설치 버전을 혼동하지 않으며 이번 대조에서 Utilverse 소스를 수정하지 않았다.

언어 선택·Avatar·AuthorAvatar·SocialPhotoGallery 네 파일의 소스 대조를 추가했다.
[선택·미디어 채택 판단](utilverse-selection-media-adoption.md)에 기존 API 연결과
조회 수명·터치 대상·이니셜 보존 조건을 적었다. Carousel의 숨겨진 슬라이드도
renderSlide가 실행되므로 선택 사진만 조회하도록 연결해야 한다. 사용 지침에도
이 경계를 추가했다. 현재 소스 검토 6/136이며 소비 적용·기기 검증 수는 아니다.

ImageViewer의 제품 이미지 host·상태 이벤트를 구현하고 stale callback 회귀를 추가했다.
iOS 실측에서 retry 터치가 Gallery gesture layer에 막히는 문제와 사진 위 오류 문구의
가독성 문제를 수정했다. light·dark/2배 글자에서 재시도 복구를 확인했다.
[검증 기록](../qa/2026-10-07-image-viewer-host.md). 명시적 배율·회전과 Expo onDisplay
실기기 검증·Utilverse 적용은 남아 있으며 실험 개수와 전수 조사 완료 상태는 바꾸지 않는다.

ImageViewer의 회전 허용 prop과 좌우 cutout 보호를 추가했다. 닫기·재시도·이전/다음은
긴 문구가 줄바꿈될 수 있다. Gallery의 공개 ref에는 정확한 scale 설정이 없어
2배/pixel 보기의 구현 경로를 별도 검증한다. 회전 실측과 명시적 배율은 아직 미완료다.

정확한 배율 진단에서 Gallery의 scale=1 세로 pan은 손을 떼면 0으로 돌아갔다.
ResumableZoom은 804×804/402×454의 ±201/±175, 출력 크기 600×600의
±99/±73 경계에 머물 수 있었다. 공통 image geometry와 회귀를 추가했으며
공개 배율 UI·접근 가능한 이동·모드 변경 검토 무효화는 다음 구현 지점이다.


ImageViewer의 선택적 inspection 공개 API에 fit/2배/출력 크기와 방향/중앙 버튼을 연결했다.
실제 남은 viewport에서 공통 geometry를 계산하며 크기·모드·재시도 변경 시 새 host의 표시
확인을 다시 기다린다. iOS light와 dark/2배 글자에서 합성 실패 복구·배율 전환·버튼 이동을
확인했고 Native 1,201 테스트가 통과했다. 일반 Gallery 경로는 유지한다.
[검증 범위](../qa/2026-10-07-image-viewer-host.md)에 Android·회전·스크린리더·Expo 표시 확인·
제품 팔레트·성능 미확인을 남겼다. 아직 미게시·Utilverse 미적용이며 실험은 14개다.


## 추가 후보: 기억하는 날짜 직접 입력

2026-10-07 [Component Gallery Date input](https://component.gallery/components/date-input/)의
18개 예제 목록에서 [GOV.UK 공식 지침](https://design-system.service.gov.uk/components/date-input/)과
예제 HTML을 읽었다. 년·월·일의 독립 입력과 그룹 이름/오류, 부분 입력 보존, 생일 자동완성,
자동 초점 이동을 하지 않는 계약은 달력에서 날짜를 고르는 행위와 다르다. HJM 5582ec7의
Web DatePicker는 calendar dialog trigger, Native는 Sheet trigger이며 직접 분할 입력 API가 없다.
기존 매핑 `DatePicker / Field`를 기능 동등성으로 인정하지 않는다.

공통 날짜 조각 resolver + 기존 TextField/Form 구성으로 흡수할 수 있는지 실험 후보에 추가한다.
기존 달력은 유지한다. 지역별 순서, 월 이름 입력, 미완성/잘못된 날짜/범위 오류, 큰 글자/키보드,
Native 자동완성 지원과 스크린리더 그룹 의미를 검토한 뒤 양쪽 공개 구성과 실험을 설계한다.
[Wise compact date input](https://wise.design/components/compact-date-input)은 이번 텍스트 조회에서
본문이 거의 없어 동작 판단 근거로 사용하지 않았다. 18개 예제의 시각·상호작용은 미검토이며
새 후보를 구현된 실험 수로 더하지 않는다. 현재 실험 수는 14개다.


날짜 직접 입력 후속: GOV.UK 기본/단일 오류 예제를 실제 브라우저로 확인했다. 월 이름·부분
연도가 유지되고 누락된 연도에만 오류 표시가 있는 것을 관찰했다. Wise compact 링크는
실제 /404로 이동했다. 공통 내부 초안 resolver와 6개 회귀, contracts 타입/빌드를 통과했다.
달력 계산은 기존 정책대로 제품 adapter에 두고 부분 값·누락 우선·필드별 오류를 HJM이 연결한다.
[확인 범위와 다음 연결 작업](../qa/2026-10-07-date-entry-reference.md). 공개 renderer와 실험은
아직 없으며 14개 집계는 유지한다.


날짜 직접 입력은 이제 contracts/Web/Native 전용 공개 subpath와 사용 지침, 양쪽 Storybook
`실험/구성/입력과 작성/날짜 직접 입력`에 연결했다. 현재 실험은 **15개**다. 이전 14개 기록은
당시 snapshot이다. Web 윤년 오류 교정/순서 전환, iOS 기본 입력/확인을 실제 화면에서 관찰했다.
계약 7개·Web 3개·Native 4개 회귀를 추가했지만 환경/스크린리더/자동완성/Android 검증이 남아
승격·릴리스하지 않았다. Highlighter는 여전히 내부 후보이며 16번째 실험으로 세지 않는다.


날짜 입력 환경 검증에서 반복 오류와 Native 큰 글자 하단 접근 문제를 수정했다. 오류는
그룹 한 번 + 해당 필드 테두리/설명으로 연결하고 Native 예제는 화면 스크롤을 소유한다.
Web dark/RTL/390px/2배 글자, iOS light/2배 글자 입력→오류 복구→확인과 Native 1,207개
회귀를 확인했다. 제품 팔레트·Android·스크린리더 등은 남았으며 실험 15개/승격·릴리스 미완료다.


## 추가 후보: 관련 입력 묶음

GOV.UK 주소 그룹의 실제 화면·입력·Tab 이동과 HJM 제출/선택/날짜 API를 대조했다.
일반 입력 그룹은 기존 Form으로 대체되지 않으므로 [별도 실험 계획](field-group-experiment.md)에
공개 계약·Native 접근성·오류/잠금 검증 조건을 등록했다. 내부 공통 resolver와 회귀 6개를 추가했고
contracts typecheck·build가 통과했다. 공개 renderer·스토리는 아직 없으며 15개 집계에는 포함하지 않는다.


관련 입력 묶음을 양 renderer의 공개 `field-group` subpath와 Storybook에 연결했다. 현재 16개 실험이다.
[검증 기록](../qa/2026-10-07-field-group-reference.md)에 자동 검사·Web 환경 조합·기존 iOS 기기의
오류/입력/잠금/재정렬 관찰과 미확인 범위를 구분했다. 승격·릴리스·Utilverse 적용은 아직 하지 않았다.


대화·도구함 두 화면의 전체 소스와 현재 HJM renderer를 대조했다.
[채택 판단](utilverse-conversation-toolbox-adoption.md)에 검색 행·반응 집계·빈 상태의
교체 경로와 durable command·가상화 pager 보존 조건을 기록했다. 대화 화면은 이미
ChatScreen/ChatMessage를 사용하므로 초기 목록의 표현을 신규 전체 교체로 해석하지 않는다.
현재 8/136 source-reviewed, 128 pending이다. 소비 구현·기기 검증·릴리스는 미실행이다.


삭제·신고·차단·명령 피드백 여섯 TSX를 상세 검토했다. 현재 14/136 source-reviewed,
122 pending이다. [상태 의미와 교체 조건](utilverse-destructive-actions-adoption.md)에
Promise resolve와 서버 성공의 차이, Sheet 자식 명령의 닫힘 정책 연결을 기록했다.
소비 코드·기기 QA·릴리스는 미실행이다.
