# BezierEditor

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: `src/authoring-tools.ts`의 `validateBezier`·`cubicBezierPoint`, 양 renderer `src/authoring-tools.tsx`, [제작 도구 구성](../compositions/authoring-tools.md)
- 스토리북: `배포/구성/직접 조작과 모션/베지어 이징 편집`

## 언제 쓰나

CSS `cubic-bezier` 이징 네 좌표를 슬라이더로 편집하고 곡선과 움직임 미리 보기를 함께 보여 줄 때 쓴다.
x는 0~1로 제한하고 y는 넘침(overshoot)을 허용한다. 값은 controlled이며 저장·모션 토큰 반영은 제품이 한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 숫자 하나 조정 | [Slider](slider.md) |
| 정해진 HJM 모션 토큰 선택 | [모션 토큰](../tokens/motion.md) |
| 키보드 단축키 기록 | `ShortcutRecorder`(Web 전용, [제작 도구 구성](../compositions/authoring-tools.md)) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `BezierEditor` | 베지어 이징 편집과 미리 보기 | `@hjmds/react/authoring-tools` | `@hjmds/react-native/authoring-tools` |

좌표 타입 `BezierCoordinates`는 `@hjmds/design-contracts/authoring-tools`에서 import한다.
Native는 곡선을 `react-native-svg`로 그리므로 optional peer인 `react-native-svg`를 설치해야 한다.

## 최소 사용 예

```tsx
// Web
import { BezierEditor } from "@hjmds/react/authoring-tools";
import type { BezierCoordinates } from "@hjmds/design-contracts/authoring-tools";

const [value, setValue] = useState<BezierCoordinates>([0.25, 0.1, 0.25, 1]);
<BezierEditor value={value} onValueChange={setValue} formatCoordinate={v => v.toFixed(2)}
  labels={{ coordinates: [t("x1"), t("y1"), t("x2"), t("y2")], preview: t("preview"),
    curve: t("curve"), decrement: t("decrease"), increment: t("increase") }} />
```

```tsx
// Native
import { BezierEditor } from "@hjmds/react-native/authoring-tools";

<BezierEditor value={value} onValueChange={setValue} active={isFocused}
  formatCoordinate={v => v.toFixed(2)}
  labels={{ coordinates: [t("x1"), t("y1"), t("x2"), t("y2")], preview: t("preview"),
    curve: t("curve"), decrement: t("decrease"), increment: t("increase") }} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| value | `[x1, y1, x2, y2]` | 필수 | 유한수, x는 0~1. 벗어나면 `RangeError` |
| onValueChange | `(value) => void` | 필수 | 슬라이더 변경마다 새 배열 |
| yRange | `[min, max]` | `[-2, 2]` | y 슬라이더 범위. y1·y2가 범위 밖이면 오류 |
| duration | number(ms) | 1000 | 미리 보기 시간. 0 이하면 오류 |
| active | boolean | 미지정(활성) | `false`면 미리 보기 버튼 비활성·애니메이션 중지 |
| disabled | boolean | false | 슬라이더와 미리 보기 비활성 |
| labels | `coordinates`(4개)·`preview`·`curve`·`decrement`·`increment` | 필수 | 슬라이더·버튼·곡선 접근성 이름 |
| formatCoordinate | `(value) => string` | 필수 | 슬라이더 값 문구 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 곡선 영역 폭 100%·높이 180, 미리 보기 트랙 높이 24·지름 20 공, 슬라이더는 폭을 채운다 | 양 renderer `svg`/`Svg`, 공 `View` |
| 간격 | 곡선·슬라이더 4개·트랙·버튼 사이 `spacing.md` 16, 트랙 좌우 안쪽 4 | `Stack gap="md"`, `paddingInline`/`paddingHorizontal: 4` |
| 순서·정렬 | 곡선 → x1·y1·x2·y2 슬라이더 → 미리 보기 트랙 → 미리 보기 버튼 | 양 renderer |
| 고정·스크롤 | 자체 스크롤 없음. viewBox는 두 끝점과 제어점 y를 모두 담도록 맞춘다 | `curveMin`·`curveMax` |
| 좁은 폭·큰 글자 | 곡선은 폭에 맞춰 축소된다. 슬라이더 라벨은 줄바꿈되고 터치 높이 44는 유지 | [Slider](slider.md) |

## 꼭 지킬 것

- 값은 controlled다. 저장·되돌리기·모션 토큰 등록은 제품이 하며 HJM은 초안만 보여 준다.
- 축소 모션 설정이면 미리 보기를 실행하지 않는다. 화면을 떠날 때는 `active={false}`로 애니메이션을 멈춘다.
- 곡선 색·공 색을 제품 CSS로 덮지 않는다. 곡선은 brand 콘텐츠 색을 쓴다.

## 상태와 상호작용

값·시간·`active`·`disabled`·축소 모션이 바뀌면 진행 중 미리 보기를 취소한다. Web은 문서가 숨겨질 때
(`visibilitychange`), Native는 앱이 비활성일 때(`AppState`) 애니메이션을 멈춘다. 미리 보기는 공을 120만큼
가로 이동한다. 미리 보기 트랙은 장식이라 접근성 트리에서 숨긴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 애니메이션 | Web Animations API `cubic-bezier(...)` | `Animated.timing` + `Easing.bezier`, native driver |
| 곡선 색 | 보조선 `currentColor`, 곡선 `--hjm-color-content-brand` | 보조선 `textMuted`, 곡선·제어점·공 `contentBrand` |
| 증감 버튼 이름 | `decrement`·`increment`를 Slider에 넘기지 않는다 | Slider `decrementLabel`·`incrementLabel`로 전달 |
| 추가 export | 없음 | `authoringToolsCapabilities`(`bezierEditor: true`, `shortcutRecorder: false`) |
| 의존성 | 없음 | optional peer `react-native-svg` |
