# TimePicker

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.34.0 이후)
- 검토일: 2026-10-23
- 근거: [TimePicker](../../time-picker.md), `src/time-picker.ts`의 `timePickerRecipe`, 양 renderer `src/time-picker.tsx`
- 스토리북: `배포/컴포넌트/입력/시각 선택`

## 언제 쓰나

하루 중 시각 하나를 시·분 두 열에서 고를 때 쓴다. 기본 `field`는 하나의 필드를 눌러
Web Popover / Native Sheet를 열고 명시적으로 확정한다. 기존 날짜 시트 안에서는 `inline`을 쓴다.
현재 checkout의 개발 소스에서 제공하며 npm 게시 버전은 아직 없다.

기존 탭 목록은 `selectionStyle="list"`(기본), 관성 스크롤·중앙 스냅은 `selectionStyle="wheel"`로 고른다.
휠 옵션은 2026-10-23 개발 소스에 추가한 미게시 기능이다. 값·초안·확정·취소 계약은 같으며
[도입 결정](../FINDING.md#휠-피커-검토-결과)에 따라 별도 WheelPicker 공개 API를 추가하지 않았다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 날짜 선택 | Calendar / DatePicker |
| 경과 시간 입력 | 제품의 duration 입력 |
| 시간대·서버 예약 계산 | 제품 도메인 로직 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `TimePicker` | 기본 | `@hjmds/react/time-picker` 또는 root | `@hjmds/react-native/time-picker` 또는 root |

필수: `value: string | null`, `onValueChange(value: string | null)`,
`labels: { label, hour, minute, placeholder, confirm, cancel }`.
선택: `presentation`(`field` 기본/`inline`), `selectionStyle`(`list` 기본/`wheel`), `minuteStep`(1 기본), `isTimeUnavailable`,
`disabled`, `readOnly`, `description`, `error`, 외부 배치용 `layoutStyle`.
Native `safeAreaInsets`는 단독 Sheet에 전달한다.

## 최소 사용 예

```tsx
// Native
import { TimePicker } from '@hjmds/react-native/time-picker';
<TimePicker presentation="inline" value={time} onValueChange={setTime}
  labels={{ label: '시간', hour: '시', minute: '분', placeholder: '시간 선택', confirm: '선택 완료', cancel: '취소' }} />
```

```tsx
// Web
import { TimePicker } from '@hjmds/react/time-picker';
<TimePicker value={time} onValueChange={setTime}
  labels={{ label: '시간', hour: '시', minute: '분', placeholder: '시간 선택', confirm: '선택 완료', cancel: '취소' }} />
```

휠 예제는 양 renderer에서 같은 옵션을 쓴다. `presentation="inline"`이면 바깥 폼이 최종 확정을 소유한다.

```tsx
// Web 또는 Native
<TimePicker selectionStyle="wheel" minuteStep={5} value={time} onValueChange={setTime}
  labels={{ label: '시간', hour: '시', minute: '분', placeholder: '시간 선택', confirm: '선택 완료', cancel: '취소' }} />
```

실행 예제: Web·Native의 `TimePicker.stories.tsx`에 `Wheel`(필드), `WheelInline`(본문),
`WheelReducedMotion`(동작 줄이기)이 있다. [Web 휠](https://storybook.jmstudioapps.com/?path=/story/components-inputs-time-picker--wheel)은 공개 사이트 반영 후 이용할 수 있다.

실행되는 원본은 [Web preview](https://github.com/jim1286/hjm-design-system/blob/main/showcase/web/src/components/preview-registry.tsx)의 `TimePickerPreview`,
[Native preview](https://github.com/jim1286/hjm-design-system/blob/main/showcase/native/src/component-examples.tsx)의 `TimePickerExample`이다.

## 배치

```text
시간 필드 → 하나의 Popover / Sheet
  헤더: 제목 · 닫기
  선택한 시각  14 : 30
       시          분
       13          29
      [14]        [30]
       15          31
  [       선택 완료       ]
```

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 요약 숫자 `typography.titleLarge` 20/28(2026-10-20 모바일 큰 글씨 지양 기준 반영·미게시), 행 44, 열 높이 220, Web 패널 최대 폭 304 | timePickerRecipe |
| 순서·정렬 | 요약 숫자 중앙 → 같은 폭 시·분 열 → field 확인 버튼. 숫자는 LTR·tabular-nums | 양 renderer |
| 간격 | 열 사이 spacing.sm(12), 영역 사이 spacing.md(16) | timePickerRecipe |
| 고정·스크롤 | 제목·확인은 공통 overlay 영역, 시·분 목록만 세로 스크롤 | Popover / Sheet / TimePicker |
| 좁은 폭·큰 글자 | 좁은 폭은 두 열을 같은 폭으로 유지. 최대 글자 조건은 사용자 지침으로 범위 제외 | 포트폴리오 AGENTS.md |
| 선택 표시 | radius.md, surfaceAccent 배경·text 글자·500 굵기 | 시간 값은 주요 글자로 강조하고, 제품 선택 배경과 확정 버튼 대표색을 구분(2026-10-20 토스 공개 팔레트 참고 요청) |
| 휠 중앙·끝 여백 | 행 44, 5행 높이 220, 위아래 여백 88, 중앙 테두리 stroke.default(1) | timePickerRecipe와 양 renderer. 첫 값·마지막 값도 중앙 정렬 |
| 설명·오류 | 입력 아래 description/error. 오류는 보조기술에도 알림 | 양 renderer |


시트 안 `inline`에는 별도 확인 버튼이나 중첩 Sheet가 생기지 않는다. 헤더·바깥 틀·safe area·초점 복귀는 공통 overlay가 소유한다.

## 꼭 지킬 것

- `HH:mm | null`을 사용한다. `00:00`도 유효하며 날짜·시간대 변환은 제품이 담당한다.
- `minuteStep`은 60의 양의 정수 약수. 기존 값을 자동 반올림하거나 불가한 분을 몰래 교체하지 않는다.
- 빈 값은 `--:--`. 두 부분을 고르기 전에는 확정하지 않는다. 닫기는 초안을 취소한다.
- 휠의 초기 정렬은 선택이 아니다. 스크롤 중에는 초안만 바뀌며 field 확인은 멈춘 뒤 가능하다. 간격 밖 외부 값은 자동 반올림하지 않는다.
- Web 휠은 scrollend 지원 브라우저를 대상으로 한다. 방향키·Home·End와 탭 선택도 지원한다. Native 휠은 열마다 adjustable 증감 액션을 제공한다. 동작 줄이기는 Provider에서 설정한다.
- inline은 완전하고 사용 가능한 값만 문자열, 미완성·불가한 조합은 null을 전달한다. 바깥 확인 버튼은 null을 확정하지 않는다.
- 시간 선택의 공통 배치·초안·취소·키보드 처리를 앱에서 다시 조립하지 않는다. 상세 동작은 [계약](../../time-picker.md)을 따른다.
