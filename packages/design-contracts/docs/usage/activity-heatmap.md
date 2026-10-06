# ActivityHeatmap 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Activity heatmap](../activity-heatmap.md), descriptor `resolveActivityHeatmap`(`src/activity-heatmap.ts`)

## 언제 쓰나

최대 1년(366일) 범위의 일별 활동량을 한눈에 보여 주는 읽기 전용 개요에 쓴다. 프로필의 기록 빈도,
습관 달성 일수 같은 화면이다. 카탈로그 계약이 아닌 별도 보조 기능(supplemental)이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 날짜를 고르거나 일정 보기 | [Calendar](calendar.md), [DatePicker](date-picker.md) |
| 366일보다 긴 기록 | 제품이 범위를 나눠 페이지로 보인다(한 번에 넘기면 throw) |
| 숫자 하나의 요약 | [Statistic](statistic.md) |
| 시간 순 사건 목록 | [Timeline](timeline.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `ActivityHeatmap` | `@hjmds/react/activity-heatmap` | `@hjmds/react-native/activity-heatmap` | supplemental, granular subpath만 |
| `ActivityHeatmapDescriptor` 타입 | `@hjmds/design-contracts/activity-heatmap` | 같음 | 입력 descriptor |

root entry에서는 export되지 않는다. `ActivityHeatmaps` 같은 복수형 공개 이름은 없다.
optional peer는 필요 없다(Native는 `react-native` 기본 View·ScrollView만 쓴다).

## 최소 사용 예

```tsx
// Web
import { ActivityHeatmap } from "@hjmds/react/activity-heatmap";

<ActivityHeatmap
  label={t("profile.activity.label")}
  descriptor={{ startDate: "2026-01-01", endDate: "2026-12-31", days }}
  formatDay={(date, value) =>
    value === null ? t("profile.activity.unknown", { date }) : t("profile.activity.day", { date, count: value })}
  view={view}
/>
```

```tsx
// Native
import { ActivityHeatmap } from "@hjmds/react-native/activity-heatmap";

<ActivityHeatmap
  label={t("profile.activity.label")}
  descriptor={{ startDate: "2026-01-01", endDate: "2026-12-31", days, weekStartsOn: 0 }}
  formatDay={(date, value) =>
    value === null ? t("profile.activity.unknown", { date }) : t("profile.activity.day", { date, count: value })}
/>
```

## 축과 기본값

- `view`: `grid`(기본) · `list`. list는 같은 정보를 보이는 문구로 나열한다. 전환 버튼은 제품이 [Button](button.md)으로 둔다.
- descriptor `thresholds`: 기본 `[1, 3, 7]`, 양수이고 증가해야 한다. 0보다 크면 4단계 세기로 나뉜다.
- descriptor `weekStartsOn`: `1`(월요일, 기본) · `0`(일요일).
- `days`에 없는 날은 `null`(미상, 점선 테두리), 명시한 `0`은 0이다. 둘 다 중립 면 색이다.

## 꼭 지킬 것

- `label`과 `formatDay`는 i18n 문구로 넣고 `value === null`을 따로 처리한다. 색만으로 값을 전하지 않는다.
- 날짜는 `YYYY-MM-DD`이고 범위 안에서 고유해야 한다. 값은 유한한 0 이상. 어기면 렌더 중 throw다.
- 세기 색은 테마의 brand semantic 색이 정한다. 제공자별 색·데이터 fetch는 들어 있지 않다(제품 소유).
- 스타일 prop이 없다. 배치는 바깥 wrapper로 한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| grid 넘침 | 가로 스크롤 region(`tabIndex=0`) | 가로 `ScrollView` |
| 값 확인 | 셀 접근성 이름 + hover `title` | 셀 접근성 이름 |
| list 길이 | 페이지 흐름 | 세로 `ScrollView`는 host가 감싼다 |

## 함정

- grid 셀은 읽기 전용이라 눌러서 상세로 가는 동작이 없다. 셀 단위 상호작용이 필요하면 계약 공백으로 올린다.
- 실기기 렌더와 VoiceOver 청취 순회는 아직 검증되지 않았다([계약 문서](../activity-heatmap.md)).
