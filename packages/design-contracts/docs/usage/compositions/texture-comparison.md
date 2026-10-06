# 질감 비교

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.14.0
- 검토일: 2026-10-07
- 근거: [EffectSurface 계약](../../effect-surface.md), `showcase/*/texture-comparison-preview.tsx`
- 스토리북: `배포/구성/정보 표시/질감 비교`

승급: 2026-10-07 사용자 승인, [검토 결과](../../../../../docs/qa/2026-10-07-experiment-promotion-release.md). Storybook 분류이며 제품 적용 증거는 별도다.

## 언제 쓰나

기존 반복 점 grain과 불규칙한 정적 noise를 같은 배경·강도로 비교할 때 쓴다.
독립 NoiseTexture API를 추가하지 않고 기존 EffectSurface의 선택 레이어를 사용한다.
일반 입력·데이터 패널은 불투명 Surface, 작업 진행·성공은 Progress·Result를 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| EffectSurface | 질감·테마·장식 수명주기 | [배경 효과](../components/effect-surface.md) |
| SegmentedControl | 두 영역의 강도를 함께 선택 | [단일 선택](../components/segmented-control.md) |
| TextField·Button·Text | 읽기·입력·행동·결과 확인 | [입력](../components/field.md) |

noise는 생성된64×64 PNG alpha mask이며 자체 런타임 픽셀 생성·외부 요청이 없다.
기본 intensity0.22, 실험의 비교 강도0.6은 가독성 스트레스 조건이며 제품 기본 권장이 아니다.
seed는 고정 타일의 위상만 이동한다. 새 타일 픽셀을 생성하지 않는다.

## 배치

```text
[강도 선택: 두 영역에 함께 적용]
[grain: 제목 → 설명 → 입력 → 버튼]
[noise: 제목 → 설명 → 입력 → 버튼]
[선택 결과와 비교 한계]
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 화면 본문 세로 | gap lg20 |
| 비교 영역 | EffectSurface | grain 다음 noise | 내부 padding spacing.lg20, Stack gap md16 |
| 질감 | SVG mask | absolute 배경 | viewBox 밖64×64 CSS pixel/Native logical point 타일 반복 |
| 본문 | TextField·Button | 장식 앞 일반 레이아웃 | 기존 recipe |
| Native 화면 | ScreenLayout·KeyboardAvoiding | 본문 스크롤과 바깥 키보드 여백 | 긴 내용·큰 글자 접근용 |

## 흐름과 상태

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 두 질감과 기본22% 강도 | 입력·버튼 활성 |
| 진행 중 | 강도 선택을 두 질감에 함께 반영 | 입력 유지, 인위 대기 없음 |
| 실패 | 장식 host 실패는 기존 EffectSurface fallback | 제품 입력·행동은 유지 |

1. 강도를 바꾸고 두 영역의 문장을 읽고 타이핑한다.
2. 영역별 버튼을 눌러 결과 안내를 비교한다. 결과는 예제 내부 선택일 뿐 저장하지 않는다.

## 코드 골격

```tsx
// Web
import { EffectSurface } from "@hjmds/react/effect-surface";
<EffectSurface descriptor={{ layers: ["noise"], active: false }}><Content /></EffectSurface>
```

```tsx
// Native
import { EffectSurface } from "@hjmds/react-native/effect-surface";
<EffectSurface descriptor={{ layers: ["noise"], active: false }}><Content /></EffectSurface>
```

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 장식 | SVG image·mask | react-native-svg Image·Mask |
| peer | 없음 | 기존 react-native-svg15.15.5 필요 |
| 동작 | 가시성·document visibility | visible·AppState |

Native FeTurbulence는 미구현이라 공유 PNG mask를 택했다. 새 GPU peer나 Native 무표시
fallback을 동일 구현으로 세지 않는다. noise는 theme.text 색의 alpha mask다. 임의 브랜드/강도에서
대비를 보장하지 않는다. 기본은 정적이며 active를 켜면 기존 모션 감소·숨김 수명주기를 유지한다.
Web/RN rasterization·비율 차이로 픽셀 일치를 보장하지 않는다. 원본 SVG Perlin noise와 달리
자체 생성한6 octave value noise이며 원본 자산을 복사하지 않았다. 실제 기기 표시·비용·VoiceOver
검증은 따로 한다.
