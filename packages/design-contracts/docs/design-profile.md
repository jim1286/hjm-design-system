# 디자인 프리셋 계약

검토일: 2026-10-07 · 상태: 10종 실험 구현·대상 로컬 검사 완료 · 미게시(1.14.0 이후)

사용자가 레트로·종이·숲 등의 테마에 따라 같은 기능의 상호작용·구성·화면 배치도 자동으로 달라지고, 앱이 자기 테마를 한 번 주입하기를 요청했다. 색상 프리셋만으로는 그 요구를 충족하지 못하므로 네 축을 하나의 데이터 계약으로 둔다. 기존 상태 엔진을 테마마다 복제하는 방식은 채택하지 않는다.

## 소유권과 공개 경로

`@hjmds/design-contracts/design-profile`은 `hjmDesignPresets`, `defineHjmDesignProfile`, `HjmDesignProfile`, `HjmDesignProfileInput`, `HjmDesignPreset`을 제공한다. 이 subpath는 기존 ThemeStudio의 색상 편집과 역할이 다르다. 색상 편집 subpath에 질감/구성 그래프를 추가하지 않고 선택형 프로필 진입점으로 분리했다. package export 추가의 근거는 이 절이다.

제품은 설정 파일에서 preset을 상속하고 필요한 축만 수정한다. 설정은 Web/Native renderer를 import하지 않으며 글꼴 자산의 설치·라이선스·로딩, 브랜드 자산, 데이터·권한·라우팅·서버 확정은 제품이 소유한다. HJM은 지원 가능한 표현/행동/배치와 환경 대체 경로를 소유한다.

```ts
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";

export const productDesign = defineHjmDesignProfile({
  extends: "forest",
  id: "product-design",
  compositions: { collection: "rows" },
});
```

이 helper는 검증한 불변 프로필을 만든다. Web `HjmProvider.designProfile`, Native `HjmNativeProvider.designProfile`에 넣으며, 중첩 Provider는 가장 가까운 프로필을 상속한다. 기존 프로필 없는 소비자의 기본값은 유지한다.

## 축과 기본값

| 축 | 중립 기본값 | 참고 프리셋의 차이 |
| --- | --- | --- |
| palette | 현재 HJM light/dark 17 semantic roles | 레트로의 잉크/황갈색, 종이의 따뜻한 중립색, 숲의 녹색 |
| tokens | 기존 radius/fontFamily/typography/heading/shadow | 모서리·글자 크기/행간/강조·그림자와 일반 monospace fallback; 폰트 자산은 번들하지 않음 |
| material | canvas/card 모두 null | 레트로 noise, 종이 grain, 숲 mesh+glow; 오로라만 active=true, 나머지는 정적 |
| interactions | contentTransition=fade, selectionMotion=none | 레트로 slide, 종이 fade, 숲 rise와 slide 선택 배경 |
| compositions | collection=rows, toolbar=inline | 레트로 grid/inline, 종이 rows/collapsible, 숲 cards/collapsible |
| screens | overview=dashboard | 종이 editorial, 숲 landscape |

상속 후 데이터는 재귀적으로 동결한다. 호출자의 배열/descriptor를 동결하지 않고 복사해 앱 소유 상태에 영향을 주지 않는다. light/dark 팔레트와 nested 토큰은 역할별로 병합하며, preset 원본은 바뀌지 않는다. 고정된 원·pill 의미 때문에 radius.full=999는 유지한다. 글자 크기·줄 높이·그림자·질감 범위와 지원하는 변형 이름을 검사하고 지정 색상 쌍의 대비 미달을 거부한다. 이 검사는 완성 화면 접근성 인증이 아니다.

## 기존 API 비교와 연결 순서

- 기존 Provider/brandPalette/environment는 유지한다. 프리셋은 별도 환경 축이 아니라 네 단계의 표현/배치 기본값이며 명시적인 props가 우선한다.
- `ContentTransition`의 fade/rise/slide/scale와 `SegmentedControl`의 selectionMotion을 재사용한다. 없는 피드백 엔진을 제공했다고 표시하지 않는다.
- Surface와 Web 테마 변수, Native tokens 및 직접 foundation을 읽는 소비자를 함께 연결한다. `tokens.radius` 값 정의만으로 전체 컴포넌트 적용을 주장하지 않는다.
- 구성은 기존 Grid/List/Collapsible/도구 묶음과 공개 슬롯을 대조한다. 화면은 기존 ScreenLayout의 제목·본문·상태·주 행동 계약을 유지하며 배치 변형을 추가한다. 같은 화면의 데이터/초안을 variant subtree 안에 저장해 전환 시 버리지 않는다.
- 질감은 optional EffectSurface renderer의 host/peer 경계를 유지한다. 프로필의 descriptor 정의만으로 native SVG peer 설치나 실제 표시를 보증하지 않는다.

## 현재 증거와 남은 조건

공통 데이터·Provider·기본 토큰 소비·상호작용 기본값·OverviewScreen 구성과 화면·양쪽 Storybook 비교를 구현했다. 전체 기존 컴포넌트의 정적 토큰 소비 감사는 진행 중이다. 브라우저의 입력 유지·복구와 light/dark·좁은 폭·큰 글자·RTL·모션 축소는 [QA 기록](../../../docs/qa/2026-10-07-design-profile-research.md)에서 확인했다. Native 실기기 검증은 아직 미완료다. 실험 등록·승격·게시·Utilverse 적용을 분리한다. 완료 기준은 [작업 계획](../../../docs/plans/reference-release-utilverse-2026-10-07.md)의 프리셋 절을 따른다.

## 10종 확장과 현재 연결

2026-10-07 사용자 요청으로 참조 팩은 최소 10종이며 neutral은 수에서 제외한다.
[조사/QA 기록](../../../docs/qa/2026-10-07-design-profile-research.md)에 개별 출처와 원본 관찰/HJM 해석을 구분한다.
Provider의 `designProfile`에 `hjmDesignPresets.forest` 또는 `defineHjmDesignProfile(...)` 결과를 넣는다.
부분 JSON을 Provider에 직접 넣지 않는다. 앱의 파일·등록·설정 저장과 폰트 로딩은 앱이 소유한다.
`brandPalette`는 선택된 프로필의 해당 테마 팔레트 위에 놓인다.

프로필은 현재 양 플랫폼 Provider, 기본 Text/Surface/Button·필드 모서리, ContentTransition,
SegmentedControl, ScreenLayout 및 optional OverviewScreen에 연결한다. 모든 기존 공개 컴포넌트의
정적 recipe 경로까지 자동 반영 완료를 뜻하지 않는다. ScreenLayout의 기존 기본 배치는 프로필이 없으면 유지한다.
유리의 실제 backdrop blur와 클레이 inset shadow는 미구현이며, 참조 표현의 완전 지원으로 안내하지 않는다.


## 큰 제목까지 한 번에 지정하기

`tokens.heading`은 `level1`~`level5`의 fontSize/lineHeight/fontWeight를 부분 지정한다.
현재 Heading은 두 renderer 모두 이 값으로 그리고 문서 `semanticLevel`과 textScale을
따로 유지한다. 중립은 foundation의 40/32/24/20/18px를 그대로 쓰며, 에디토리얼의
level1/2는 44/34px·행간 54/44px·굵기 500, 브루탈리즘은 48/38px·행간 56/46px·굵기
800이다. 이 두 큰 제목 선택은 원본 치수 복제가 아니라 편집형/강한 강조 프리셋의
시각 계층을 구분한 HJM 실험값이며 좁은 폭·큰 글자 QA와 함께 판단한다.

```ts
const productDesign = defineHjmDesignProfile({
  extends: "paper",
  tokens: { heading: { level1: { fontSize: 52, lineHeight: 64, fontWeight: "500" } } },
});
```

미지정 값은 preset을 상속한다. `tokens.typography.heading/titleLarge/title`은 이전과
같이 Heading level3/4/5의 변경 기본값이며, 같은 필드에 명시한 `tokens.heading`이
우선한다. 나머지 프로필 축·본문 Text typography와 문서 순서는 바꾸지 않는다.
지원하지 않는 persisted heading 단계는 조용히 무시하지 않고 거부한다.

## 오버레이·선택 입력의 프로필 연결 보완

2026-10-07 실제 소비 경로 대조에서 Web의 Dialog/Sheet/Toast 전용 그림자 변수와 Native의
Dialog/AlertDialog/Sheet, Select/Combobox, Notice/Progress/Skeleton/Toast가 프로필의 해당
역할 대신 foundation/recipe 값을 직접 읽었다. Provider 값만 바꾸는 방식으로는 동일 화면의
카드와 열린 오버레이가 다른 표현을 유지했으므로 기존 API의 소비 경로를 연결했다.

- Web Dialog/Sheet/Toast와 Native Dialog/AlertDialog/Sheet/일반 Toast는 `tokens.shadow.floating`을
  읽는다. 프로필 없는 소비자는 각 recipe의 기존 그림자와 Native elevation을 유지한다.
- Native에서 모서리의 역할 이름은 각 recipe가 정하고 값은 Provider의 `tokens.radius`가 정한다.
  원·pill의 full=999, Sheet 하단의 바닥 모서리 0, 명시한 Skeleton 반지름은 유지한다.
- Android elevation은 별도 플랫폼 그림자를 그리므로 프로필 opacity=0이면 elevation도 0이다.
  나머지는 radius/offsetY의 최대값으로 근사한다. CSS blur와 기기 그림자의 픽셀 동등성을 뜻하지
  않는다. [플랫폼 근거](https://reactnative.dev/docs/view-style-props#elevation).
- 액션·선택·초안·Modal lifecycle·safe area·키보드 처리는 바꾸지 않는다. Liquid Toast의
  managed presentation은 기존 별도 표현 host가 계속 소유한다.

기존 테마 조합 실험에서 Notice/Skeleton/Toast와 Dialog/Sheet를 직접 열고, 오버레이 안의
다음 테마 버튼으로 10종을 순회한다. 같은 제어 초안을 닫기/재열기에서도 유지한다.
Web의 10개 밝은 Dialog와 10개 dark/RTL/2배 Sheet 및 390px 검토는 위 QA 기록에 있다.
Native 테스트는 실제 기기의 표시·VoiceOver 증거가 아니다. 이 보완은 glass blur/clay inset을
구현한 것이 아니며, 남은 다른 컴포넌트의 직접 토큰/recipe 소비 경로도 계속 대조한다.
