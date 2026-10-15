# 미디어 재생 제어

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-15
- 근거: [미디어 제어 계약](../../media-transport.md), `src/media-transport.ts`, 양 renderer `src/media-transport.tsx`
- 스토리북: `배포/구성/직접 조작과 모션/미디어 재생 제어`

## 언제 쓰나

실제 오디오/영상 엔진의 재생·일시 정지·유한 길이 탐색을 같은 구조로 제공할 때 쓴다.
모달에서 영상 host를 표시하는 Dialog나 실제 플레이어 엔진을 대체하지 않는다.
단순 이동 버튼이나 일반 수치 입력은 기존 IconButton/Slider를 직접 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| MediaTransport | 관측 상태와 실제 callback 연결 | [계약](../../media-transport.md) |
| IconButton | 실제 재생 상태로 모핑하는 제어 | [IconButton](../components/icon-button.md) |
| Slider | 탐색 초안→실제 seek 확정 | [Slider](../components/slider.md) |

## 배치

```text
[실제 재생/일시 정지]  현재 시간 / 실제 전체 길이
[──── 실제 위치 탐색 ────] (길이를 알 때만)
제어 실패: 해당 영역 중앙 → 같은 행동으로 재시도
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 기존 영상/오디오 host 아래 | md |
| 제어·시간 | IconButton/Text | inline, 세로 중앙 | sm, 아이콘 24 |
| 탐색 | Slider | 제어 아래 본문 폭 | 기존 Slider 규격 |
| 실패 | Text | 구성 내부 중앙 | 임의 상단 여백 없음 |

## 흐름과 상태

1. 제품 엔진 이벤트에서 state를 갱신한다. 클릭은 실제 엔진 callback만 호출한다.
2. 실제 playing 값에 따라 버튼 이름·모핑을 갱신한다.
3. 탐색 초안은 드래그/키 입력이 끝나면 onSeek에 전달한다. 성공·실패 뒤 관측 위치로 돌아온다.
4. 실패한 요청은 현재 상태를 유지한다. 중복 요청은 차단한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 실제 playing 아이콘·시간·가능한 탐색 | 기존 버튼·Slider 계약 |
| 진행 중 | 같은 버튼 내부 로딩·탐색 잠금 | 크기 유지, 중복 실행 차단 |
| 실패 | 관측값 유지·중앙 오류 | Web alert / Native assertive |

## 코드 골격

```tsx
// Web
import { MediaTransport } from "@hjmds/react/media-transport";
<MediaTransport state={observedMedia} labels={mediaLabels} formatTime={formatTime}
  onPlay={playActualMedia} onPause={pauseActualMedia} onSeek={seekActualMedia} />;
```

```tsx
// Native
import { MediaTransport } from "@hjmds/react-native/media-transport";
<MediaTransport state={observedMedia} labels={mediaLabels} formatTime={formatTime}
  onPlay={playActualMedia} onPause={pauseActualMedia} onSeek={seekActualMedia} />;
```

실행 예제는 Web `showcase/web/src/patterns/media-transport-preview.tsx`, Native `showcase/native/src/media-transport-preview.tsx`다.
제품에서 showcase 원본을 import하지 않고 자체 엔진 이벤트를 공개 API에 연결한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 실제 예제 엔진 | HTMLVideoElement | 기존 Expo Video |
| 모핑 | SVG d 직접 반영 | react-native-svg host 직접 반영 |
| 탐색 확정 | seeked/error | 엔진 setter/이벤트 계약 |
| 숨김 | document visibility | AppState + host active |

## 함정

- 클릭만으로 playing을 바꾸거나 타이머로 시간을 더하지 않는다.
- duration null/0에 가짜 분모나 임의 길이를 넣지 않는다.
- active=false는 컨트롤 수명이다. 플레이어 pause/dispose도 제품 adapter에서 수행한다.
- 다른 미디어 엔티티로 전환할 때 key를 바꾸고 이전 플레이어·요청을 정리한다.
- Native 재생 모듈 없음 안내를 실제 재생 성공으로 기록하지 않는다. 새 API는 npm 1.21.0에서 제공한다.
