# ProgressiveBlur

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.14.0
- 검토일: 2026-10-07
- 근거: `src/progressive-blur.ts`, [도입 검토](../../../../../docs/plans/progressive-blur-adoption-2026-10-07.md)
- 스토리북: `배포/컴포넌트/시각 효과/가장자리 흐림`

승급: 2026-10-07 사용자 승인, [검토 결과](../../../../../docs/qa/2026-10-07-experiment-promotion-release.md). Storybook 분류이며 제품 적용 증거는 별도다.

## 언제 쓰나

스크롤 영역의 바깥에 더 내용이 있음을 알리거나 장식 이미지 가장자리를 흐릴 때 쓴다.
내용과 형제인 장식 레이어이며 텍스트·버튼을 children으로 받지 않는다. 원본 목록의 마지막
행이 끝에서도 가려져 HJM은 실제 ScrollMetrics 경계와 입력 초점에 따라 효과를 제거한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 배경 mesh/glow/grain | [EffectSurface](effect-surface.md) |
| 읽기 완료율 | [Progress](progress.md)의 ScrollProgress |
| 가려야 하는 개인정보 | 권한·데이터 정책으로 제거. 블러는 보안 경계가 아님 |
| 중요한 본문·고정 버튼 위 | 효과를 사용하지 않음 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ProgressiveBlur` | 추가 장식 API | `@hjmds/react/progressive-blur` | `@hjmds/react-native/progressive-blur` |
| ProgressiveBlurDescriptor | 공통 입력 | `@hjmds/design-contracts/progressive-blur` | 같음 |
| ProgressiveBlurHostLayer | Native 호스트 입력 | 해당 없음 | `@hjmds/react-native/progressive-blur` |

루트 export에 없다. 기존 EffectSurface는 내용을 흐리지 않는 배경 장식이므로 별도 API를 둔다.
Native renderer에 Expo/마스크 peer를 추가하지 않는다. 실제 블러·마스크 엔진은 제품이 연결한다.

## 최소 사용 예

```tsx
// Web
import { ProgressiveBlur } from "@hjmds/react/progressive-blur";
<ProgressiveBlur descriptor={{ edge: "bottom", extent: 64, strength: 0.5,
  content: { kind: "scroll", metrics, focused: contentHasFocus } }} />
```

```tsx
// Native
import { ProgressiveBlur } from "@hjmds/react-native/progressive-blur";
<ProgressiveBlur descriptor={{ edge: "bottom", extent: 64, strength: 0.5,
  content: { kind: "scroll", metrics, focused: contentHasFocus } }}
  renderLayer={layer => renderProductBackdropLayer(layer)} />
```

내용과 효과를 같은 positioned/clipped 부모의 형제로 둔다. 위쪽과 아래쪽이 필요하면 두 개를
놓는다. Web useScrollMetrics를 재사용하고 Native는 실제 onScroll/onLayout/onContentSizeChange를
연결한다. 내용에 초점이 있는 동안 focused=true를 전달한다. 읽기 도구·외부 키보드 포커스도
제품에서 전달하거나 그 환경에서는 효과를 끈다. Showcase를 소비 앱에서 import하지 않는다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| descriptor.edge | top · bottom · start · end | 필수 | start/end는 provider direction으로 물리 위치 결정 |
| descriptor.extent | 0 초과~160 logical px | 필수 | 실제 host에서 비교 후 명시적으로 선택 |
| descriptor.strength | 0~1 | 필수 | 0은 효과 없음, 플랫폼 간 같은 px를 뜻하지 않음 |
| descriptor.layers | 정수 2~8 | 4 | 실험 시작값, 기기 성능 보증이 아님 |
| descriptor.content | decoration 또는 scroll | 필수 | scroll은 metrics와 focused 필수 |
| renderLayer(Native) | layer → ReactNode | 필수 | 실제 플랫폼 블러와 alpha mask. 호스트 없음은 null로 표현 가능 |

Native layer에는 side(물리 방향), strength, start/end(0~1 alpha ramp 위치)가 전달된다.
inner edge에서 투명, 지정 side 쪽에서 불투명인 마스크를 만든다. Web은 strength×16px blur와
CSS mask를 쓴다. Native intensity와 CSS radius는 같은 단위가 아니다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 상하: 부모 폭 + extent 높이, 좌우: 부모 높이 + extent 폭 | resolveProgressiveBlur와 renderer |
| 간격 | 자체 여백 없음, 지정 side에 0으로 부착 | renderer absolute frame |
| 순서·정렬 | 내용 뒤의 형제 레이어, 포인터 통과 | pointerEvents none |
| 고정·스크롤 | 스크롤 내용 밖 같은 부모 안에 둠 | 예제 positioned host |
| 좁은 폭·큰 글자 | 부모 크기와 새 ScrollMetrics를 사용, 입력 초점 때 제거 | content.kind scroll |

## 꼭 지킬 것

- 장식 내용을 별도 accessible subtree로 만들지 않는다. 컴포넌트는 장식 호스트 전체를 접근성 트리에서 숨긴다.
- scroll 끝에서는 해당 효과가 사라지고 맞춤/미측정이면 양쪽 모두 사라진다. content.kind decoration으로 이를 우회하지 않는다.
- Native renderLayer는 절대 위치로 부모를 채우고 터치 대상·텍스트를 넣지 않는다.
- Native 호스트가 실패하면 장식만 사라진다. 복구를 원할 때 명시적으로 remount한다.
- 정적 효과여서 자체 자동 애니메이션이 없다. 주변 콘텐츠의 모션 감소·일시 정지는 별도로 유지한다.
- 원본 8층을 무조건 복사하지 않고 2~8층과 효과 없음을 같은 기기에서 비교한다. 기본값 4는 실험용이다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 실제 효과 | CSS backdrop-filter + mask-image | 제품 blur/mask host |
| 추가 peer | 없음 | HJM 없음, 제품 호스트에 따라 필요 |
| 지원 누락 | CSS 미지원이면 내용은 그대로 보임 | null 또는 호스트 오류 경계로 장식만 제거 |
| 스크롤 | useScrollMetrics | 실제 Native 이벤트 연결 |
| 데모 엔진 | 브라우저 | ExpoBlur + MaskedView + SVG alpha mask |

Expo SDK57 Android는 BlurTargetView/blurTarget/blurMethod가 있어야 실제 블러가 된다.
동적 목록 뒤에 효과를 렌더하며 Android 12 이전 비용은 별도로 측정한다. 모듈 누락 안내는
효과 지원·기기 검증 통과가 아니다. 실험 승격 전 양 플랫폼의 실제 합성과 기기 성능을 확인한다.

## 함정

전체 화면에 고정하면 다른 영역을 흐릴 수 있다. 부모를 반드시 클리핑한다. extent가 작은
viewport보다 크지 않게 선택한다. 공개 HJM API는 기본 subtree의 배치를 바꾸지 않으며,
제품 호스트의 alpha mask가 틀리면 단위 테스트가 통과해도 실제 블러는 보이지 않을 수 있다.
