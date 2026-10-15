# 베지어·단축키 편집 도구

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.20.0 이후)
- 검토일: 2026-10-15
- 근거: [편집 도구 계약](../../authoring-tools.md), `src/authoring-tools.ts`, 양 renderer `src/authoring-tools.tsx`
- 스토리북: `배포/구성/직접 조작과 모션/베지어 이징 편집`, Web `배포/구성/직접 조작과 모션/단축키 조합 기록`

ShortcutRecorder는 Web 전용이다. Native는 BezierEditor만 지원한다.

## 언제 쓰나

제품 안의 모션 편집기에서 두 제어점의 곡선을 조정하거나 웹 앱의 사용자 단축키를 실제로 등록할 때 쓴다. 단순 조합 표시는 기존 TextFormat을 사용한다. 제품 토큰 저장·전역 키 등록 서비스는 소비 제품이 소유한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| BezierEditor | 네 좌표 controlled 편집·실제 미리 보기 | [계약](../../authoring-tools.md) |
| ShortcutRecorder | 실제 키 조합 기록·검사·등록 요청 | [계약](../../authoring-tools.md) |
| Slider | 좌표별 값과 조절 동작 | [Slider](../components/slider.md) |
| Button | 미리 보기·기록·등록·취소 | [Button](../components/button.md) |

## 배치

```text
[곡선·두 제어점]
[x1 Slider] [y1 Slider] [x2 Slider] [y2 Slider]
[이동 미리 보기 영역]
[미리 보기]

[현재 등록값 / 기록 중 포커스 영역]
[기록] [초안 등록] [취소]
[상태 안내 / 중앙 등록 오류]
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 편집 패널 본문 | md |
| 곡선 | SVG | 좌표 위 | 본문 폭, 높이 180 |
| 좌표 | Slider 4개 | 세로 흐름 | 기존 Slider 계약 |
| 키 기록 | 포커스 group | 버튼 위 | 최소 높이 44, 내용 중앙 |
| 오류 | Text alert | 구성 내부 | 가로·세로 중앙 |

## 흐름과 상태

1. BezierEditor는 controlled 초안을 네 좌표 모두 편집하고 버튼으로 현재 곡선의 움직임을 재생한다.
2. 초안을 제품 토큰에 자동 기록하지 않는다. 별도 저장 흐름으로 연결한다.
3. ShortcutRecorder 기록 버튼으로 실제 키를 받는다. 예약·충돌·잘못된 조합은 등록하지 않는다.
4. 확인한 초안을 등록하면 실제 서비스 Promise를 기다린다. 실패 시 초안을 보존한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | controlled 값 표시 | Slider·버튼 기존 동작 |
| 키 기록 | 포커스 영역·기록 안내 | Escape 취소, Tab/blur 종료 |
| 진행 중 | 등록 버튼 로딩 | 중복 등록 차단 |
| 실패 | 기존 값과 초안 보존 | 중앙 alert |

## 코드 골격

```tsx
// Web
import { BezierEditor, ShortcutRecorder } from "@hjmds/react/authoring-tools";
<BezierEditor value={curve} onValueChange={setCurve} labels={curveLabels} formatCoordinate={formatNumber} />;
<ShortcutRecorder value={registeredShortcut} onRegister={registerActualShortcut} platform={platform}
  conflicts={existingShortcuts} reserved={platformReservations} labels={shortcutLabels} formatShortcut={formatShortcut} />;
```

```tsx
// Native
import { BezierEditor } from "@hjmds/react-native/authoring-tools";
<BezierEditor value={curve} onValueChange={setCurve} labels={curveLabels} formatCoordinate={formatNumber} />;
// ShortcutRecorder is unsupported on Native.
```

실행 예제는 Web `showcase/web/src/patterns/AuthoringTools.previews.tsx`, Native `showcase/native/src/authoring-tools-preview.tsx`다. Web 예제는 등록 callback에서 실제 keydown listener를 설치하고 실행 횟수를 보여 준다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 곡선 | CSS cubic-bezier / WAAPI | Animated / Easing.bezier |
| 단축키 | KeyboardEvent·제품 등록 callback | 지원하지 않음 |
| 백그라운드 | visibilitychange로 재생 중단 | AppState로 중단 |

## 접근성과 검증

각 좌표의 이름·값·증감 안내를 제품이 제공한다. reduced motion에서는 preview 이동을 재생하지 않는다. 키 조합 표시도 제품의 언어·레이아웃을 따른다. 계약 계산, Web 키 이벤트와 Promise 실패, Native 좌표 변경·preview host 호출을 검사한다. 실제 Native 기기와 제품별 예약키·전역 키 서비스 검증은 소비 단계에서 확인한다.
