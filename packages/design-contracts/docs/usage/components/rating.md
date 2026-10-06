# Rating

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.14.0
- 검토일: 2026-10-07
- 근거: [계약](../../reference-controls.md)
- 스토리북: `배포/컴포넌트/입력/별점 선택`

승급: 2026-10-07 사용자 승인, [검토 결과](../../../../../docs/qa/2026-10-07-experiment-promotion-release.md). Storybook 분류이며 제품 적용 증거는 별도다.

## 언제 쓰나

정수 점수를 선택하거나 계산된 소수 평균을 읽기 전용으로 보여 줄 때 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 반점 간격의 연속 점수 입력 | [Slider](slider.md)의 기존 별점 예제 |
| 일반 선택지 | [RadioGroup](radio-group.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Rating` | 독립 supplemental | `@hjmds/react/rating` | `@hjmds/react-native/rating` |

## 최소 사용 예

```tsx
// Web
import { Rating } from "@hjmds/react/rating";
<Rating label={label} value={score} onValueChange={setScore} getValueLabel={formatScore} clearLabel={clearLabel} />
```

```tsx
// Native
import { Rating } from "@hjmds/react-native/rating";
<Rating label={label} value={score} onValueChange={setScore} getValueLabel={formatScore} clearLabel={clearLabel} />
```

Native는 import를 `@hjmds/react-native/rating`로 바꾼다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | number 또는 null | 필수 | 5개 기본, max 1~10. 미평가는 null이며 입력 점수는 1~max의 정수, 평균은 readOnly의 0~max 소수다. |
| Web `layoutStyle` | 배치 전용 style | 없음 | 바깥 틀의 폭·margin·flex 배치 |
| `disabled` | boolean | false | 변경을 막고 현재 값을 유지 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Web은 44px 최소 radio 영역, Native는 control.minTouchTarget 44. 별 그림은 글자 크기에 따라 커지고 행이 줄바꿈된다. | renderer `rating.tsx` |
| 간격 | space.xs=8px의 별 사이 간격; 초기화는 점수 문구 뒤에 온다. | foundations spacing |
| 순서·정렬 | 질문→선택→점수→선택적 초기화 | renderer 순서 |
| 고정·스크롤 | 바깥 화면이 스크롤을 소유한다 | 별도 스크롤 없음 |
| 좁은 폭·큰 글자 | 폭을 강제 고정하지 않고 본문/행의 줄바꿈을 허용한다 | 위 배치 |

## 꼭 지킬 것

- Web 초기화 후 첫 별점으로 초점이 돌아온다. Space로 다시 선택할 수 있다.
- label, value, getValueLabel을 제품 언어로 공급한다. 입력형은 onValueChange가 필수이고 평균형에는 전달하지 않는다.
- 브랜드는 HJM provider의 semantic palette로 연결한다. 점수 집계·이미지 변환·저장은 제품 소유다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 조작 | Web은 실제 radio와 name으로 폼에 연결한다. Native는 radio 접근성 상태와 onPress를 쓴다. | 같은 의미를 플랫폼 host로 번역 |
