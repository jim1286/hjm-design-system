# KeyboardAvoidanceContext

- 단계: 컴포넌트
- 상태: 배포
- 지원: Native
- 적용: 1.27.0
- 검토일: 2026-10-23
- 근거: Native `src/keyboard.tsx`; 2026-10-16 키보드 전수 조사에서 바깥 KeyboardAvoiding과 안쪽 ScreenLayout이 같은 키보드 이벤트에 동시에 여백을 주지 않게 하려고 추가
- 스토리북: 없음

## 언제 쓰나

제품이 직접 만든 키보드 대응 영역 안에서 HJM `ScreenLayout`·`Sheet`가 여백을 두 번 주지 않게 할 때 쓴다.
`KeyboardAvoiding`, 키보드 대응을 켠 `Sheet`, `Dialog`는 이 값을 이미 `true`로 제공하므로 보통 직접 쓸 일이 없다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면을 키보드 위로 올리기 | `ScreenLayout`(기본 `keyboardAvoidance`) 또는 `KeyboardAvoiding` |
| 모달 안 입력 | `Sheet`(기본 `keyboardAvoidance`)·`Dialog` |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `KeyboardAvoidanceContext` | 키보드 처리 중인 영역 표시 | 없음 | `@hjmds/react-native/keyboard` |

## 최소 사용 예

```tsx
// Native — 제품 고유 키보드 어댑터가 이미 화면을 올리는 경우
import { KeyboardAvoidanceContext } from "@hjmds/react-native/keyboard";

<ProductKeyboardAdapter>
  <KeyboardAvoidanceContext.Provider value>
    <ChatScreen title={title} composer={composer}>{timeline}</ChatScreen>
  </KeyboardAvoidanceContext.Provider>
</ProductKeyboardAdapter>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `boolean` | `false`(제공자 없음) | `true`면 안쪽 `ScreenLayout`이 자체 키보드 여백과 포커스 스크롤을 건너뛴다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 화면에 그리는 것 없음 | React context |
| 간격 | 없음 | 같음 |
| 순서·정렬 | 키보드 대응 영역 바로 안쪽에 둔다 | `KeyboardAvoiding` 구현 |
| 고정·스크롤 | 영향 없음 | 같음 |
| 좁은 폭·큰 글자 | 영향 없음 | 같음 |

## 꼭 지킬 것

키보드 여백을 실제로 주는 영역에서만 `true`를 제공한다. 여백을 주지 않으면서 `true`를 주면 안쪽 화면이 키보드에 가려진다.
