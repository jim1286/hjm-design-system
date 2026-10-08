# 내용 전환 비교 실험 등록과 검토

> 2026-10-09 QR 정리: 원시 URL 원장·캡처는 현재 보관하지 않는다. 과거의 원장/이미지 보존 문구는 당시 작업 기록이며, 현재 확인 가능한 결과·실패·미확인 범위는 이 문서 본문이다. 새 조사나 재검증을 수행한 것은 아니다.

2026-10-07 · 상태: Web·Native 실험 등록, 로컬 검증. 승급·npm 게시·소비 제품 반영 아님.
사용자 요청: 조사한 추가·개선·교체 후보를 규격대로 모두 실험에 등록.

## 조사 단위와 채택

[Motion Transition Panel](https://motion-primitives.com/docs/transition-panel)의 두 제공 Code
6803자 전체 독해와 실제 탭/4단계/마지막 Close를 검토한 후보 단위를 먼저 등록했다.
전체 11사이트와 Motion 96예제의 모든 상태 조사가 끝났다는 뜻이 아니다.
[원본 검토](2026-10-07-motion-reference-page-review.md)와 중앙 ledger의 원본 partial 범위는 유지한다.
원본 마지막 Close의 null branch, 일반 button 탭, 과도기 exit 내용 복제를 채택하지 않는다.

기존 공개 Tabs/TabPanel의 수동 활성화·이름 연결, ContentTransition 현재 subtree·height,
OnboardingScreen 이전/다음/완료를 합성한다. 새 wrapper/상태 엔진/public export를 만들지 않는다.
기존 배포 예제는 유지하고 표현 비교만 `실험/구성/비교와 검증/내용 전환 비교`에 등록한다.
제품 초안·실패·완료는 제어 상태이며 네트워크·저장소·라우팅 변경이 없다.

## 등록 규격

- 두 플랫폼 같은 4마디 제목/고정 분류/항목 이름.
- Default, StepFlow, Dark, LargeText, ReducedMotion, Rtl. 환경은 같은 globals 키.
- Web URL id `composition-comparison-content-transitions` 신규 6개. 생성 도구로 active935 갱신.
- [구성 사용 지침](../../packages/design-contracts/docs/usage/compositions/content-transition-comparison.md): 구성 요소·ASCII 배치·영역 표·흐름/상태·공개 import·플랫폼 차이·제품 책임.
- Native requires는 `storybook:generate`; 해당 생성 파일은 gitignore된 로컬 결과.
- 공개 package source는 바꾸지 않아 source Changeset 대상 아님. 이 구성과 기존 테마 개선은 미게시.

## 실제 Web 행동과 시각 확인

로컬 Storybook 기존 서버를 재사용했다. 새 임시 IAB79/80은 종료했고 viewport/media override를
해제했다. 개발 UI 검증이며 Release 성능·실제 스크린리더 낭독·Native 기기 QA가 아니다.

1. 기본 desktop/light에서 초안 입력 후 계획 탭 ArrowRight: 포커스 작성, 선택은 계획 유지.
   작성 Enter 후 선택/내용 변경, 같은 초안 유지, DOM tabpanel 하나. 동적 본문 remount는
   문서에 명시하며 내부 input DOM identity 보존을 주장하지 않는다.
2. 완료 스토리 이전/다음, 마지막 완료 실패 예약→완료→danger alert→같은 완료 재시도→확인한
   초안 결과. Web 완료 후 제거된 footer 대신 다시 비교 버튼에 포커스. 다시 비교에도 초안 유지.
3. 390×844, dark/2x/RTL/reduced 실제 provider 속성 확인. 마지막 단계에서 10테마
   retro/paper/forest/minimal/editorial/brutalist/glass/aurora/terminal/clay 실제 순회.
   모두 같은 초안·text input 하나·document.scrollWidth390. 이는 10종 DOM/행동 대조이며
   각 테마 전체 상태의 별도 픽셀·성능 검증 완료가 아니다.
4. 같은 큰 글자 환경에서 fade/rise/slide/scale/none/profile 6선택과 계획→작성 전환.
   모두 radio 의미·선택 값·tabpanel 하나·같은 초안·scrollWidth390. reduced이므로 이 검증은
   각 preset의 정상 모션 곡선/지속 시간 측정이 아니다.
5. 큰 글자 안내 제목/진행과 고정 footer 사이 본문은 독립 scroll. 실패 알림이 본문 아래에
   있을 때 실제 scroll해 읽을 수 있음을 확인했다. 원본 no-op Close와 달리 완료 결과가 실제 나타난다.

캡처 설명(원시 이미지 정리): 탭·실패·완료 비교. 관찰 결과와 검증 한계는 이 문서의 본문에 보존한다.

최종 원본 픽셀 묶음1202×1195, SHA-256
`0482285cef07ca24c58322e6c16d6cdd1417f68038b284fb5b6092d20e059965`.
3개 실제 CDP CSS clip을 나란히 묶고 영문 상태 라벨만 붙였다. 실패는 본문 scroll 후 모습이다.
개별 임시 PNG는 최종 묶음 보존 후 제거했다. 원본 참고 사이트 이미지를 복사하지 않았다.

## 로컬 검사와 수정

양 Showcase typecheck 통과. 최초 SegmentedControl prop `appearance`는 타입에서 거부돼
공개 `presentation="pills"`로 수정하고 양쪽 재검사 통과. 초기 문서 TextField 경로는
없는 text-field.md를 가리켜 docs 검사가 거부했고 실제 field.md로 정정했다. 최종 QA 포함581MD 통과했다.
최초 버튼 selected는 checkbox 의미였으므로 단일 선택 공개 SegmentedControl의 radio로 바꿨다. 비교 제목은 공개 Heading으로 의미 있는 h2를 제공하고 최종 화면/실패/완료를 다시 확인했다.

- usage:check: 토큰12/컴포넌트139/구성55/화면22.
- storybook:check:423파일/935Web IDs 정적 규격 통과.
- Web 관련 경계/브랜드 fixture:3파일4검사 통과.
- Native 등록/컴포넌트 스토리:2파일7검사 통과.

원격 CI·버전 상승·게시 실행 안 함. 다른 세션의 댓글 화면 source/dist/QA는 수정·stage하지 않는다.

## 미확인

Native 실제 기기·키보드·VoiceOver/TalkBack·완료 포커스, 정상 모션 각 preset/높이의 수치
성능, 두 번째 실제 제품 팔레트, 모든 테마의 모든 상태 픽셀, 소비 앱 도입은 후속 검토다.
등록은 이 후보 한 단위다. 다른 추가/개선/교체 후보의 전수 등록과11사이트 전수 조사는 진행 중이다.

## 미리보기 높이 토큰 감사 후속

2026-10-07 날짜·시각 등록 중 verify:tokens가 이 실험의 minHeight360을 처음 검출했다.
short viewport에서 OnboardingScreen의 독립 body scroll/footer를 검증하는 fixture 크기는
제품의 디자인 토큰과 의미가 달라 기존 geometry exception 형식에 file/selector/property/value를
정확히 한정하고 source·사용 지침에 이유를 기록했다. 화면 크기/동작 변경은 없으며 이전
실제 화면 증거는 유지한다. 토큰 검사 재실행 결과는 날짜·시각 QA에도 기록한다.


## 선택 Native 흐름 후속

6표현·10테마 초안 유지와 단계 실패/재시도/완료를 실제 iOS에서 확인했다. 도달 불가 footer를 Native preview 바깥 ScrollView로 수정했다.
선택 dark/RTL 화면도 확인했다. 상세 재현·제약·source SHA·원시 보관 처리는
[동일 작업 Native 검수 기록](2026-10-07-native-reference-validation.md#8-내용-전환날짜시각명령-기록-후속-검수)에 보존했다.
Android·VoiceOver·실물/Release 성능·모든 상태/환경 검수·승급·npm 게시 완료는 아니다.
