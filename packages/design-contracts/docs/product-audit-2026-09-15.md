# 실제 8개 앱에서 도출한 HJM 업데이트

기준: 2026-09-15 local checkout · HJM 1.1.1 · 상태: 우선순위 등록 및 첫 수정

## 판단 근거

app-portfolio `portfolio.json`에 등록된 BurnTok, Choose Window, Portfolio Site,
Taground, Unairplane, Yajalal, Spint, Diairy를 조사했다. 앱별 상세 근거는 각 제품의
`docs/design/PRODUCT_EVOLUTION_2026-09-15.md`, 전체 연결은 메타 저장소의 같은 이름 문서에 있다.
아래 `apps/`로 시작하는 경로는 메타 저장소 기준이며 조사 당시 working tree의 줄 번호다.
제품 이름 뒤의 짧은 경로는 해당 제품, Showcase 경로는 이 모듈의 `showcase/web` 기준이다.

94개 catalog 항목 중 stable 4, beta 61, planned 29다. 기존 renderer의 존재와 제품 채택·실기기
증거는 다르다. 이 조사로 maturity를 올리거나 planned 전체 구현을 약속하지 않는다.
Yajalal과 Choose Window의 현재 제품은 Flutter이므로 JS renderer 소비자로 계산하지 않는다.

## 업데이트 목록과 수용 기준

| ID / 우선순위 | 문제·소스 근거 | 추가/개선할 계약 | 완료 기준·첫 소비 |
| --- | --- | --- | --- |
| DS-01 / P1 | BurnTok `apps/burntok/apps/web/src/app/globals.css:301`의 Toast 임시 우회 | compact에서 copy·close를 같은 행에, optional action은 별도 행에 유지 | 320/390/480px·장문·2배 글자·RTL browser. 로컬 수정됨; npm 소비 뒤 BurnTok 우회 제거 |
| DS-02 / P1 | Taground `apps/taground/apps/mobile/src/features/community/message-composer.tsx:63,168–195`의 설명 복사와 같은 폴더 `room-community-card.tsx:95–100` focus DOM 조회 | Field/TextArea support/error ID와 사용자 describedby 병합, Checkbox focus ref | 두 input 고유 ID·오류 변경·Web focus·native hint 보존. 실제 Taground 우회 제거 후 채택 완료 |
| DS-03 / P1 | BurnTok `apps/burntok/apps/web/src/components/ui/AppModal.tsx:59`, 양쪽 `sheet-successor.ts` | dismiss 요청과 실제 exit/focus/격리 정리 완료 분리 | StrictMode·unmount·Android back·후속 overlay 정확히 한 번. 제품 0ms 타이머 복사 금지 |
| DS-04 / P1 | Diairy `apps/diairy/apps/mobile/src/components/StateView.tsx:6`; Spint `apps/spint/apps/mobile/src/features/cell/CellScreen.tsx` 신고 오류(제품 문서 경로 기준) | Notice/EmptyState/Skeleton/Button 조합 지침 | 초기 조회·기존 데이터+실패·빈 결과·행동별 pending/error 분리. Query/네트워크는 제품 소유 |
| DS-05 / P1 | Diairy `apps/diairy/apps/mobile/src/components/ProgressRing.tsx:10`; Choose Window `lib/screens/home/widgets/route/sun_exposure_bar.dart:39` | 작업 진행·분포 비율·정지·추정의 의미와 접근성 recipe | min/max/now, 값 없는 진행, 큰 글자/중복 발표. Diairy ring 의미 수정은 제품 소유 |
| DS-06 / P1 | Unairplane `apps/unairplane/src/data/airportCatalog.ts:55`, `src/screens/AddFlightScreen.tsx:214` | 기존 Combobox의 로컬 검색/선택 recipe | stable IATA/표시 이름 분리, offline·직접 입력·스캔값 보존; 공항 데이터는 제품 소유 |
| DS-07 / P2 | Unairplane `src/components/RouteMap.tsx:341`; Yajalal 통계표·AI 결과(제품 문서 근거) | Statistic/DescriptionList/Timeline 긴 값·시각/출처 조합 | 값 강제 축소/잘림 없이 읽기, 추정과 측정 구분. 새 StatsCard 만들지 않음 |
| DS-08 / P2 | BurnTok 두 표면 `src/features/feed/components/DiscoveryShowcase.tsx:27`/`:34` | 기존 Carousel planned 계약의 Web/RN 이동·현재 위치 renderer | 0/1/N·폭 변경·항목 삭제·keyboard·AT. 카드 내용/추천/자동재생은 공통화하지 않음 |
| DS-09 / P2 | Choose Window 자체 theme/empty state, Yajalal 자체 ErrorWidget·통계표 | Flutter 의미·토큰 대응표와 fixture | 플랫폼별 tap/큰 글자/상태 의미. Flutter renderer 신설·다크모드 추가는 자동 결정하지 않음 |
| DS-10 / P1 | Showcase `src/showcase.css`의 renderer와 겹치는 24개 class | showcase scaffolding namespace 분리 | 실제 IconButton 모양·Tabs 흐름을 browser로 검증. 220px 고정 stage 제거, section 40→24px |
| DS-11 / P1 | Diairy `apps/diairy/apps/web/src/app/globals.css:992`의 Notice action 우회 | action의 축소 방지와 공간 부족 시 다음 행 배치 | 320px·1배/2배 글자에서 짧은 재시도 라벨을 온전히 읽기. 로컬 수정됨; 소비 후 제품 우회 제거 |
| DS-12 / P1 | Taground static Web의 기존 feed는 light, 새 modal은 dark. RNW hook 서버/첫 client 값 불일치 재현 | NativeProvider의 Web hydration snapshot 일치 | 실제 renderToString→hydrateRoot, 명시 theme/상속/value/OS 변경. 로컬 수정됨; 게시·제품 소비 후 재검증 필요 |

## 간격과 버튼: 공통 숫자보다 조합의 원인을 수정

2026-09-15 사용자가 넓은 컴포넌트 간격과 어색한 버튼을 지적해 실제 화면/코드를 추가 조사했다.

- Showcase의 `.hjm-icon-button`, `.hjm-tabs`, `.hjm-toast` 등 데모 CSS가 renderer 이후 로드되어
  크기/모서리/flow를 덮었다. 데모만 `hjm-showcase-*`로 옮겼다. 컴포넌트 recipe 수치를 줄이는
  대안은 소비 앱까지 바꾸면서도 cascade 충돌을 남기므로 채택하지 않았다.
- Spint 색상/이모지 선택은 텍스트 Button의 수평 padding을 불필요하게 사용했다.
  제품은 기존 medium IconButton과 glyph slot으로 전환하고 이름·선택 상태·44pt target을 유지한다.
- Diairy 작성 화면은 Web gap/padding 24와 Native 16/20이 달랐다. Web을 gap/padding16으로
  조정하고 ghost 보조 행동의 내용 폭과 primary 전체 폭을 구분했다. 390px 편집 폭은285→301px.
- Portfolio Site는 제품 CSS의 hero/section/card 최소높이가 원인이었다. 제품에서 밀도를 조정하고
  CTA 아이콘 색을 버튼 글자 색에 맞췄다. 공용 spacing scale 자체는 그대로 둔다.
- Flutter 제품에는 HJM CSS가 실행되지 않는다. 실제 버튼/접근성 수정과 token 대응 제안을 분리한다.

## 첫 구현·검증 연결

- Web Toast와 Notice: `packages/react/src/styles.css`,
  `packages/react/test/toast-layout.browser.test.tsx`(Toast7 + Notice2).
  default 증거는 canonical SSR에서 유지하고 추가 browser 시나리오는 실행 registry의
  dark/long-copy/large-text/rtl 환경으로 직접 실행한다.
- Showcase 격리: `packages/react/test/showcase-style-isolation.browser.test.tsx`.
  SSR class 확인만으로 발견되지 않은 Tabs 가로 배치와 버튼 모양을 실제 browser로 검사한다.
- Review: `Patterns/Toast layout`, 기존 Button/IconButton/Tabs/Notice story.
- Toast는 1280px 창의 420px 카드에서도 액션 행을 유지한다. 창 breakpoint만으로 판단하면
  실제 provider의 좁은 카드에서 큰 글자 버튼이 다시 압축되므로 grid를 카드 기본 구조로 둔다.
- NativeProvider: `packages/react/test/native-provider-hydration.browser.test.tsx`5개와
  `packages/react-native/test/provider-theme.test.tsx`4개. 실제 hydration과 Native 우선순위를 검증한다.
- Changeset: Web compact layout과 Native hydration 수정에 각각 patch 기록을 추가했다.
  공개 API·runtime dependency 변경은 없다.
- generated evidence는 `contracts:sync → build → evidence:sync`로 갱신한다.
  제품 adoption·VoiceOver/TalkBack·게시 증거를 자동 생성하지 않는다.

## 외부 비교와 책임 경계

[Carbon empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/)에서 원인과 다음 행동의
구분, [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)에서
focus 이동 없는 상태 발표, [Radix Progress](https://www.radix-ui.com/primitives/docs/components/progress)에서
determinate/indeterminate 의미를 확인했다(2026-09-15). 외형·코드·자산·런타임은 복사하지 않는다.
제품이 문구·시간 포맷·권한·비동기 작업을 소유하며 HJM에는 그 결과를 표현하는 계약만 둔다.

## DS-02 / DS-03 마무리 (2026-09-18)

- **DS-02(Field/TextArea 설명·Checkbox focus).** 오류가 뜨면 지원 문구가 사라지던 것을
  고쳤다. 이제 설명과 오류가 **함께** 보이고 `aria-describedby`도 소비자의 자체 값 →
  설명 → 오류 순으로 병합한다. Taground가 설명을 오류 문자열에 복사해 넣은 이유가 바로
  그 가림이었다. Checkbox는 이미 `forwardRef`가 실제 input에 닿아 있어 DOM 조회 없이
  focus할 수 있고, 회귀 테스트로 고정했다.
- **DS-03(Dialog 종료 분리).** Sheet에만 있던 "요청과 정리 완료의 분리"를 Dialog에도
  넣었다. `onDismissComplete`는 portal이 사라지고 `useModalFocus`가 초점을 되돌린 뒤
  한 번만 울린다. StrictMode probe와 실제 unmount는 epoch로 구분한다. 제품이 0ms 타이머로
  정리 시점을 추측하던 우회를 제거할 수 있다.
- 로컬 검증: `packages/react/test/field-dialog-quality.browser.test.tsx` 4개.
  제품 저장소의 우회 제거는 게시 후 각 제품에서 따로 한다.

