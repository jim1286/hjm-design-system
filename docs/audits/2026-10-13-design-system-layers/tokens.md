# 토큰 단계 전수 조사와 수정

2026-10-13 · main HEAD `767d47f7`에서 시작한 공유 working tree 기준. 기존 미커밋 작업 포함.

토큰 사용 지침 13개를 모두 본문으로 읽고 실제 foundation, semantic color, recipe, Web CSS/Provider, Native Provider·Text·font resolver와 대조했다. 이 보고서는 정적 전수 조사와 지정한 Native 모의 호스트 검사 결과다. npm 최신 게시 상태, 소비 앱 반영, 브라우저·실기기 외형·성능·접근성 순회 검증으로 확대하지 않는다. OS 최대 글자 및 이를 모사한 조건은 조사·검사·후속 범위에서 제외했다.

읽은 작업 지침: 저장소 `AGENTS.md`, `CONTRIBUTING.md`, `README.md`와 `docs/RELEASE_GOVERNANCE.md`의 관련 부분, 상위 `docs/QA_REPORT_STANDARD.md`. 사용자 추가 지시에 따라 확정 문제는 조사 중 바로 수정했다. 코드 위치·버전 상승·전체 회귀를 새 완료 조건으로 만들지 않았다.

## 항목별 범위

아래 경로에서 `usage/`는 `packages/design-contracts/docs/usage/`, `contracts/`는 `packages/design-contracts/src/`, `web/`는 `packages/react/src/`, `native/`는 `packages/react-native/src/`를 뜻한다. ‘미발견’은 대조한 정적 범위에서 확정 문제를 발견하지 않았다는 뜻이다.

| 파일 | 본문 확인 | 연결 소스 | 발견/처리 | 미검증 범위 |
| --- | --- | --- | --- | --- |
| `usage/tokens/color.md` | 전체 | contracts/colors.ts, semantic-colors.ts, palette-contrast.ts; web/theme.ts; native/provider.tsx | T-03, T-06 수정 | 제품 팔레트별 실제 화면 대비 |
| `usage/tokens/elevation-opacity.md` | 전체 | contracts/foundations.ts, component-contracts.ts; web/theme.ts/styles.css; native/primitives.tsx | T-03 수정 | 실제 iOS/Android 그림자·합성 |
| `usage/tokens/font-roles.md` | 전체 | contracts/foundations.ts/design-profile.ts; web/layout.tsx/styles.css; native/primitives.tsx/internal/styles.ts | T-03 수정 | 등록 폰트의 실기기 glyph·굵기 |
| `usage/tokens/layers.md` | 전체 | contracts/foundations.ts; web/theme.ts/styles.css; native/feedback.tsx | T-03 수정 | Native Modal·Toast 실제 창 순서 |
| `usage/tokens/layout.md` | 전체 | contracts/foundations.ts/container.ts/responsive.ts; web/layout.tsx; native/primitives.tsx | 정적 검토에서 미발견 | 실제 회전·창 폭 변경 |
| `usage/tokens/motion.md` | 전체 | contracts/foundations.ts; web/theme.ts/provider.tsx; native/provider.tsx | T-01, T-03 수정 | 실기기 설정 변경·애니메이션 표시 |
| `usage/tokens/radius.md` | 전체 | contracts/foundations.ts/design-profile.ts/base-recipes.ts; web/theme.ts; native/provider.tsx/primitives.tsx | T-03 수정 | 모든 공개 컴포넌트의 실기기 전파 |
| `usage/tokens/size.md` | 전체 | contracts/foundations.ts/design-system-provider.ts/base-recipes.ts; web/theme.ts; native/internal/styles.ts | 정적 검토에서 미발견 | 실제 포인터·터치 hit target |
| `usage/tokens/spacing.md` | 전체 | contracts/foundations.ts/component-contracts.ts/component-recipes.ts; web/theme.ts/styles.css | T-05 수정 | 모든 제품 화면의 실제 리듬 |
| `usage/tokens/stroke.md` | 전체 | contracts/foundations.ts/component-contracts.ts/component-recipes.ts; web/theme.ts | 정적 검토에서 미발견 | 기기별 hairline·focus 표시 |
| `usage/tokens/theme-studio.md` | 전체 | contracts/theme-studio.ts/palette-contrast.ts | T-04 수정 | 브라우저 다운로드·Native 공유 UI |
| `usage/tokens/typography-studio.md` | 전체 | contracts/foundations.ts/design-profile.ts; web/theme.ts/styles.css; native/provider.tsx/primitives.tsx/internal/styles.ts | T-02 수정 | 폰트 로딩 실패·실기기 적용 |
| `usage/tokens/typography.md` | 전체 | contracts/foundations.ts; web/theme.ts/layout.tsx/styles.css; native/primitives.tsx/internal/styles.ts | T-02, T-03, T-07 수정 | 폰트 자산·실제 줄바꿈 |

## 발견과 조치

### T-01 · P1 · Native 초기 모션 설정 응답이 더 최신 OS 이벤트를 덮음

- 근거 강도: 확정. 위치 `packages/react-native/src/provider.tsx:138`의 초기 promise와 이벤트 listener를 대조했다.
- 트리거: 초기 `isReduceMotionEnabled()` 요청이 pending인 동안 `reduceMotionChanged(true)`를 받은 다음 초기 응답이 false로 도착한다. 수정 전에는 최신 ‘동작 줄이기’가 false로 되돌아간다. 초기 요청 reject도 catch 없이 남았다.
- 영향: Provider 환경을 쓰는 모든 Native 애니메이션이 오래된 설정을 읽을 수 있다.
- 최소 수정: live event 수신 여부를 기록해 초기 응답이 덮지 못하게 하고, 초기 실패는 안전 기본값 true를 유지한다. unmount 후 callback도 무시한다. 인접 reduced-transparency 구현과 같은 시간 순서 원칙이다.
- 검증: `packages/react-native/test/provider-safety.test.tsx:26` 이후에 이벤트 우선·초기 실패 회귀 2건을 추가했다. 지정 Provider 검사 총 9건 통과. 실제 OS 이벤트 UI 검증은 미실행.

### T-02 · P2 · 서체 편집 지침이 폐기된 제품 래퍼/CSS 상속 경로를 안내

- 근거 강도: 확정. `usage/tokens/typography-studio.md:35`의 수정 전 예제는 Web `host="contents"`로 제품 CSS를 상속하고 Native는 HJM이 fontFamily를 지정하지 않아 제품 Text 래퍼로 해결한다고 안내했다.
- 실제 소비: `web/styles.css:49`의 역할별 font-family와 `web/theme.ts:106`의 Provider 변수는 제품 루트 상속보다 직접 적용된다. `native/primitives.tsx:223`, `native/internal/styles.ts:16`은 Provider stack의 named font를 적용한다.
- 영향: 지침대로 제품 서체를 골라도 HJM 본문/입력이 기본 서체로 남거나 불필요한 제품 래퍼가 생긴다.
- 최소 수정: Web/Native 모두 폰트 등록 후 공개 `designProfile.tokens.fontFamily`로 전달하는 예제로 교체. typography의 ‘Native는 서체를 지정하지 않음’도 중립 기본 stack과 사용자 stack을 구분했다.
- 검증 한계: Props/실제 소비 소스 대조이며 문서 TSX 전체를 별도 실행 예제로 만들거나 실물 폰트를 로드하지 않았다.

### T-03 · P2 · 게시된 프로필을 미게시로 안내하는 토큰 지침 잔존

- 근거 강도: 확정된 내부 문서 불일치. `packages/design-contracts/docs/design-profile.md:3,61`은 기본 프로필 1.15.0과 후속 1.16.0을 명시한다. 수정 전 color/elevation-opacity/radius/typography의 ‘실험·미게시’, font-roles의 UI 역할 미게시, motion의 프로필 미게시 표기가 충돌했다.
- 트리거/영향: 소비자가 토큰 지침만 읽으면 사용할 수 있는 공식 프로필·서체 경로를 피하거나 별도 구현하게 된다.
- 최소 수정: 해당 오래된 상태 문구를 제거하고 확정된 계약 버전으로 연결. layers의 과거 ‘미게시’ 및 소비된 changeset 경로는 현재 값과 1.12.1 이관 비교 설명으로 교체했다. 과거 수치를 삭제하지 않은 이유는 기존 제품 z-index 이관에 유효하기 때문이다.
- 게시 사실은 기존 계약/CHANGELOG의 역사 기록에 근거하며 이번 조사에서 npm을 재조회한 결과가 아니다.

### T-04 · P2 · ThemeStudio의 정상 팔레트 테스트 예제가 항상 실패

- 근거 강도: 확정. `usage/tokens/theme-studio.md:54`는 수정 전 `checkBrandPaletteContrast(...).toEqual([])`를 안내했다. 실제 `contracts/palette-contrast.ts:71` 함수는 `{ light: findings, dark: findings }`를 반환한다.
- 트리거/영향: 예제를 제품 테스트에 복사하면 대비가 모두 정상이어도 반환형이 달라 실패한다.
- 최소 수정: `{ light: [], dark: [] }`와 비교하도록 변경했다. 대비 기준 자체는 바꾸지 않았다.

### T-05 · P2 · Select 팝업 안쪽 여백을 4로 잘못 안내

- 근거 강도: 확정. 수정 전 `usage/tokens/spacing.md:20`은 Select·Menubar 목록 popup padding을 spacing.xxs=4로 안내했다. `contracts/component-contracts.ts:34`의 floatingSurfaceContract.padding은 spacing.xs=8이며 Select/Menu recipe와 Web theme가 이를 소비한다.
- 영향: 제품 고유 popup을 문서 값으로 만들면 공통 popup과 리듬이 달라진다.
- 최소 수정: xxs의 사례를 실제 SegmentedControl track padding/gap으로 바꾸고 Select/Menu popup은 xs 행으로 이동했다.

### T-06 · P2 · 피드백 색 변경 가능 범위를 과도하게 금지

- 근거 강도: 확정. 수정 전 color 지침은 피드백 색을 brandPalette로 바꿀 수 없다고 안내했으나 `contracts/colors.ts:15`의 ThemeColors는 danger/dangerFill/onDanger를 포함한다.
- 최소 수정: 고정 accent인 info/success/warning/attention과 변경 가능한 danger 역할을 구분했다. 오류 의미와 지정된 대비 유지 의무는 보존했다. 새 팔레트 API는 추가하지 않았다.

### T-07 · P2 · typography 원본 굵기를 Text의 기본 렌더링 굵기로 오해 가능

- 근거 강도: 확정된 해석 공백. `web/layout.tsx:339`와 `native/primitives.tsx:204`는 프로필이 없을 때 기본 emphasis regular=400을 쓴다. 토큰 표의 title=700·heading=800은 원본 굵기이며 Text의 기본 굵기와 동일하지 않다.
- 컴포넌트 담당과 기존 text 지침을 대조해 이 동작이 기존 계약임을 확인했다. 기본 렌더링을 바꾸지 않았다.
- 최소 수정: typography 표 바로 아래에 프로필 없음/프로필 있음/명시 emphasis/Heading 우선순위를 명시했다. 컴포넌트 지침 보강은 컴포넌트 담당이 수행한다.

## 검증과 보존

- Native package cwd에서 `pnpm exec vitest run test/provider-safety.test.tsx test/provider-theme.test.tsx`: 2파일 9/9 통과.
- 같은 cwd에서 `pnpm exec tsc --noEmit`: 최종 통과. 최초에는 새 테스트의 이벤트 mock cast 타입 오류 1건이 있었고 host stub의 축소 계약을 주석으로 설명하고 이중 cast로 수정한 뒤 재실행했다.
- `git diff --check -- packages/react-native/src/provider.tsx packages/react-native/test/provider-safety.test.tsx packages/design-contracts/docs/usage/tokens`: 통과.
- 전체 테스트·build·동기화 생성기·설치·커밋·push·배포는 이 담당 작업에서 실행하지 않았다. 수정된 토큰 지침은 10개, Native 소스/테스트는 각각 1개다.
- 기존 dirty인 Web theme.ts는 읽기만 했다. 기존 자료·다른 세션 변경을 삭제하지 않았고 임시 파일을 만들지 않았다.

## 설계상 남아 있는 경계

Foundation의 spacing/stroke/motion은 현재 제품 프로필로 바꾸는 축이 아니다. radius/typography/heading/fontFamily/shadow만 프로필 토큰에 포함된다. 따라서 모든 foundation 숫자를 동적으로 바꾸는 새 테마 엔진으로 확장하지 않았다.

`semantic-colors.ts`의 상태 alpha와 `foundations.ts`의 stateLayer, `colors.ts`의 accentTint는 같은 수치를 일부 중복 보관한다. 현재 값 불일치는 없지만 추후 변경에서 한쪽만 달라질 가능성은 있다. 공개 이름을 삭제하는 대신 의미가 같은 내부 정의의 참조 공유를 검토할 수 있다. 이 항목은 확정 결함이나 기기 실패로 세지 않는다.


## 추가 분담: 화면 지침 6개

부모의 추가 배정으로 아래 6개 지침 본문을 전부 읽고 필요한 실제 예제와 대조했다. 토큰 13개와 별개의 화면 범위이며 다른 화면 16개는 부모 보고서를 따른다.

| 파일 (`usage/screens/`) | 본문 확인 | 대응 소스 | 발견·수정 | 미검증 |
| --- | --- | --- | --- | --- |
| dashboard.md | 전체 245줄(수정 전) | 양 Dashboard.stories.tsx, shared/dashboard-pattern.ts, public ScreenLayout | S-T01: 최초/재조회 상태 예제를 ScreenLayout으로 정리, pills 가로 동작 정정 | 서버 데이터·브라우저·기기 |
| discovery-gallery.md | 전체 306줄(수정 전) | 양 DiscoveryGallery.stories.tsx, shared/discovery-gallery.ts, public ScreenLayout | S-T01: 중앙 상태/성공 이력/요청 key, S-T02: 단일 필터와 독립 토글 표 정정 | 실제 비동기 검색·저장 |
| landing.md | 전체 347줄(수정 전) | Web Landing.previews.tsx, Native introduction-preview.tsx, 양 reference-flow-previews ServiceIntroduction | S-T03: 실제 Surface padding 구성, 제품 비동기 저장 경계 | 실제 서버 실패·폰트·기기 |
| mockup-studio.md | 전체 190줄(수정 전) | MockupStudio.tsx, SceneTimeline 호출 경계 | S-T04: 도구 PNG 실패 Notice와 재시도 구현, 제품 규칙/도구 실제 상태 구분 | 브라우저 파일·canvas·영상 출력 |
| product-bento.md | 전체 117줄(수정 전) | 양 reference-adoption-previews ProductBentoPreview, useDemoAction 연결 | S-T05: 의미 있는 Heading 적용, 공개 API와 로컬 데모 경계 | 실제 이미지 네트워크·저장 |
| reference-comparison.md | 전체 159줄(수정 전) | 양 reference-flow-previews RecordComparison | S-T01: `loading && !hasLoaded`로 초기 교체 제한, 최초 실패/재조회 notice 분리 | 서버·라우터·기기 |

### S-T01 · P2 · 오래된 화면 골격이 중앙 상태와 재조회 보존을 놓침

확정: dashboard/discovery 문서가 원래 초기 로딩을 숫자/카드 모양 Skeleton으로 직접 조립했고, reference-comparison은 `state={loading ? ...}`로 재조회 때도 본문을 제거했다. 실제 `contracts/screen-patterns.ts:3`는 최초 조회만 본문 대체라고 정의한다.

수정: dashboard/discovery의 복제된 긴 비동기 골격을 public ScreenLayout/state/stateAction/notice 연결로 줄였다. 실제 동기 fixture 원본을 명시해 배치 코드와 제품 서버 흐름을 구분했다. 성공 결과 0건도 `hasLoaded=true`이며 재조회에는 이를 초기화하지 않는다. 초기 로딩/실패/빈 상태는 남은 본문 중앙, 조회 후 실패는 기존 내용과 Notice를 유지한다. 검색·기간 요청 key가 현재 선택과 같을 때만 응답을 적용하고 저장 오류는 항목 단위로 처리하도록 보강했다. reference-comparison의 예제는 최초 로딩 조건과 초기 오류/stateAction, 재조회 notice를 추가했다.

### S-T02 · P2 · 갤러리 선택 제어 표와 실제 API가 서로 뒤바뀜

확정: 문서 행동 표는 카테고리를 selected Button, 저장만 보기를 SegmentedControl로 설명했으나 양 플랫폼 소스는 반대다. 단일 카테고리는 SegmentedControl pills, 독립 ‘저장만’은 Button selected가 맞다. 표/도식과 selected 버튼 테두리 안내를 현재 계약에 맞췄다. Dashboard의 pills가 큰 글자에서 세로 스택이라는 옛 설명도 wrap 동작으로 정정했다. 기본 동작은 수정하지 않았다.

### S-T03 · P2 · 소개 화면의 직접 스타일 지침이 실제 공개 합성과 불일치

확정: 실제 Landing 예제는 `EffectSurface > Surface padding="xl"`을 쓰는데 문서는 className/style로 장식 표면에 여백을 직접 넣었다. 두 플랫폼 코드 골격과 배치 표를 현재 공개 합성으로 바꿨다. 메모리 데모 저장을 서버 완료처럼 오인하지 않도록 제출 snapshot/중복 방지/성공 확정/실패 초안 유지/같은 footer 재시도를 명시했다.

### S-T04 · P2 · 목업 편집 지침의 실패 복구 행동이 실제 도구에 없음

확정: 수정 전 `showcase/web/src/studio/MockupStudio.tsx`는 실패를 status Text에만 적었고 지침은 Notice와 PNG 재시도 행동을 안내했다. 도구의 실패 종류(image/scene/export)를 따로 보관해 같은 편집 내용 옆에 Notice를 표시하고 export 실패에서 기존 savePng를 재사용하는 ‘다시 내보내기’를 연결했다. 파일 교체 실패에는 이전 이미지를 유지하고 다른 파일 선택 경로를 유지한다. 새 선택·내보내기·초기화는 이전 실패를 해제한다. 실제 코드에서 이미 사용 중인 loading도 지침에 반영했다. 타임라인 영상/포스터의 실제 상태 표현은 이 변경이 보강했다고 주장하지 않는다.

### S-T05 · P2 · 기능 소개 화면이 제목 모양 Text만 제공

확정: ProductBentoPreview 두 플랫폼의 화면 제목과 기능 카드 제목이 Text variant였고 heading 의미가 없었다. 해당 함수 안에서만 기존 Heading을 재사용해 화면 level3/semanticLevel1, 카드 level5/semanticLevel2로 연결했다. 구성 담당과 파일/함수 경계를 조율했다. 사진 상태와 저장 상태를 분리하고 입력·조건·마지막 저장값을 유지하는 제품 사용 지침을 추가했다.

### 추가 검사

- Native Showcase `pnpm exec tsc --noEmit`: 통과.
- Web Showcase 같은 명령: 실패. 당시 다른 변경 파일인 `list-detail-recovery-preview.tsx:17`의 `detail.state` 타입, `reference-navigation-bars.tsx:28`의 string/undefined 타입 2건. 본 담당 변경 오류는 출력되지 않았지만 전체 통과로 간주하지 않았다. parent에 전달했고 build/생성물을 임의 갱신하지 않았다.
- 변경한 토큰/화면 16문서의 TSX 코드 블록 35개를 TypeScript parser로 구문 검사: 최종 0 오류. 최초 typography.md의 인접 JSX 형제 2예제 오류를 fragment로 수정했다. 이는 구문 검사이며 Props/외부 상태 타입 검사가 아니다.
- 추가 수정 소스: Web MockupStudio.tsx, Web/Native reference-adoption-previews.tsx의 ProductBentoPreview. 지침 6개와 이 보고서를 추가 변경했다. 관련 diff whitespace 검사 통과.
- 브라우저 실행·파일 실제 선택·PNG 내보내기·Native 실기기·성능 측정은 미실행. 원시 파일/임시 폴더는 생성하지 않았다.
