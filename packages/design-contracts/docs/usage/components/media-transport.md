# MediaTransport

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [미디어 재생 제어 계약](../../media-transport.md), `src/media-transport.ts`의 `resolveMediaPlayback`·`mediaTransportPaths`, 양 renderer `src/media-transport.tsx`
- 스토리북: `배포/구성/직접 조작과 모션/미디어 재생 제어`

## 언제 쓰나

제품의 실제 오디오·영상 엔진에 재생·일시 정지·유한 길이 탐색 제어를 붙일 때 쓴다.
Lucian 007의 재생/정지 모핑을 실제 관측 상태와 연결하려고 IconButton과 Slider를 합성했다.
버튼 모양과 위치는 엔진이 보고한 `state`만 따르며, 클릭으로 playing을 미리 바꾸지 않는다. 구성 배치는 [미디어 재생 제어 지침](../compositions/media-transport.md)에 있다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 모달 안 영상 표시 | [영상 미리보기](../compositions/video-dialog.md) 구성 |
| 단순 아이콘 행동 | `IconButton` |
| 일반 수치 입력 | `Slider` |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `MediaTransport` | 재생/일시 정지 모핑·시간·탐색 | `@hjmds/react/media-transport` | `@hjmds/react-native/media-transport` |

`MediaPlaybackState`·`resolveMediaPlayback`은 `@hjmds/design-contracts/media-transport`에 있다. Native는 optional peer `react-native-svg`가 필요하다.

## 최소 사용 예

```tsx
// Web
import { MediaTransport } from "@hjmds/react/media-transport";

<MediaTransport state={observed /* video 이벤트에서 갱신 */}
  onPlay={() => video.play()} onPause={() => video.pause()}
  onSeek={seconds => seekAndWaitForSeeked(video, seconds)}
  labels={{ play: t("media.play"), pause: t("media.pause"), seek: t("media.seek"), decrement: t("media.back"),
    increment: t("media.forward"), unknownDuration: t("media.live"), error: t("media.failed") }}
  formatTime={formatTime} active={visible} />
```

```tsx
// Native
import { MediaTransport } from "@hjmds/react-native/media-transport";

<MediaTransport state={observed /* player 이벤트에서 갱신 */}
  onPlay={() => player.play()} onPause={() => player.pause()}
  onSeek={seconds => { player.currentTime = seconds; }}
  labels={mediaLabels} formatTime={formatTime} active={isFocused} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| state | `{ playing, position, duration \| null, buffering? }` | 필수 | 엔진 관측값. 음수·비유한 값은 `RangeError` |
| onPlay / onPause | () => void \| Promise | 필수 | 실제 엔진 호출. 실패는 reject |
| onSeek | (seconds) => void \| Promise | 필수 | 실제 seek 확인 후 resolve. [0, duration]으로 제한해 호출 |
| labels | play·pause·seek·decrement·increment·unknownDuration·error | 필수 | 현지화 문구 |
| formatTime | (seconds) => string | 필수 | 시간 표시와 Slider 값 문구 |
| disabled | boolean | false | 모든 제어 비활성 |
| active | boolean | true | false면 제어·모핑 정지, 탐색 초안 폐기 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | IconButton(ghost) 안 글리프 24×24, Slider step 0.1초 | 양 renderer |
| 간격 | 바깥 세로 md, 제어·시간 행 sm | 양 renderer |
| 순서·정렬 | [재생/일시 정지 · 현재/전체 시간(caption)] 세로 중앙 → 탐색 Slider(길이를 알 때만) → 오류(가로 중앙) | 양 renderer |
| 고정·스크롤 | 영상·오디오 host 아래, 바깥 host 소유 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | Slider는 본문 폭, 제어 행은 줄바꿈 없음 | 양 renderer |

## 꼭 지킬 것

- `state`는 엔진 이벤트에서만 갱신한다. callback 성공만으로 playing을 바꾸지 않는다.
- `duration: null`(라이브·미확인)이나 0이면 탐색 Slider가 사라진다. 알려진 양의 길이만 탐색한다.
- 다른 미디어로 바꿀 때 host `key`를 바꾸고 이전 엔진을 해제한다. 숨길 때는 `active={false}`와 함께 엔진 pause를 제품이 실행한다.

## 상태와 상호작용

| 상태 | 모습 |
| --- | --- |
| 기본 | 실제 playing에 맞는 play/pause 모양과 이름, `playing`이면 selected |
| 버퍼링 | 정지 상태에서만 버튼 로딩. 재생 중이면 일시 정지 가능 |
| 요청 중 | 버튼 로딩, 탐색 잠금, 중복 요청 차단 |
| 탐색 | 드래그·키 입력 중 값은 로컬 초안, 놓으면 `onSeek` 한 번. 끝나면 관측 위치로 복귀 |
| 실패 | 관측 상태 유지, 중앙 오류, 같은 제어로 재시도 |

모핑은 `motion.normal` 동안만 실행하고 reduced motion·비활성·백그라운드에서는 목표 모양으로 즉시 정착한다. 프레임마다 React 렌더를 하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 글리프 | SVG `currentColor`, requestAnimationFrame으로 path만 변경 | react-native-svg `contentBrand`, Animated.Value listener로 path만 변경(`useNativeDriver: false`) |
| 정지 조건 | `document.hidden` | `AppState`가 active 아님 |
| 탐색 단계 문구 | `decrement`·`increment`를 Slider에 전달하지 않음 | Slider `decrementLabel`·`incrementLabel` |
| 실패 알림 | `role="alert"` | `accessibilityRole="alert"`·assertive |
