# ActivityHeatmap

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Activity heatmap](../../activity-heatmap.md), descriptor `resolveActivityHeatmap`(`src/activity-heatmap.ts`)
- 스토리북: `배포/컴포넌트/데이터 표시/활동 히트맵`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ActivityHeatmap` | 기본(supplemental, granular subpath만) | `@hjmds/react/activity-heatmap` | `@hjmds/react-native/activity-heatmap` |
| `ActivityHeatmapDescriptor` 타입 | 보조(입력 descriptor) | `@hjmds/design-contracts/activity-heatmap` | 같음 |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | `string` | 필수 | 영역 접근성 이름 |
| `descriptor` | `{ startDate, endDate, days, thresholds?, weekStartsOn? }`(`ActivityHeatmapDescriptor`) | 필수 | 날짜는 `YYYY-MM-DD`, 범위 1~366일 |
| `formatDay` | `(date: string, value: number \| null) => string` | 필수 | 칸 접근성 이름·hover `title`·list 문구. `null`은 미상 |
| `view` | `grid` · `list` | `grid` | list는 같은 정보를 보이는 문구로 나열한다. 전환 버튼은 제품이 [Button](button.md)으로 둔다 |
| descriptor `thresholds` | 양수이고 증가하는 세 수 `[number, number, number]` | `[1, 3, 7]` | 0보다 크면 4단계 세기로 나뉜다 |
| descriptor `weekStartsOn` | `1`(월요일) · `0`(일요일) | `1` | — |
| descriptor `days` | `{ date: string, value: number }[]`(`ActivityDay`) | — | 목록에 없는 날은 `formatDay`에 `null`(미상, 점선 테두리)로 온다. 명시한 `0`은 0이다. 둘 다 중립 면 색이다 |
| Web `layoutStyle` | margin·width·flex·`alignSelf` | — | 바깥 배치 전용. Native는 없다(바깥 wrapper) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 칸 16×16(Web `1rem`, Native `spacing.md`), 7행(요일) × 주 수 열. 366일이면 53열 × 20 − 4 = 1056 폭이다. 칸은 터치 대상이 아니다(44 미만) | `react/src/activity-heatmap.tsx`, `react-native/src/activity-heatmap.tsx` |
| 간격 | 칸 사이 `spacing.xxs` 4. 위 제목·범례 블록과는 `layout.contentGap` 16 | 같은 파일, `foundations.ts` `layout` |
| 순서·정렬 | 제목·범례·보기 전환 버튼은 제품이 Heatmap 위에 둔다. 칸은 위→아래 요일, 시작→끝 주 순서다 | `design-contracts/src/activity-heatmap.ts`(`row`·`column`) |
| 고정·스크롤 | 화면 폭보다 넓으면 컴포넌트 자체가 가로 스크롤한다(Web `overflow-x: auto` 영역, Native `ScrollView horizontal`). 바깥에서 폭을 줄이거나 칸 크기를 덮지 않는다 | 같은 renderer 파일 |
| 좁은 폭·큰 글자 | 칸 크기는 글자 크기를 따라 커지지 않는다. 날짜별 행동·큰 글자 사용자에게는 `view="list"` 전환을 제공한다 | 같은 renderer 파일 |

## 꼭 지킬 것

- `label`과 `formatDay`는 i18n 문구로 넣고 `value === null`을 따로 처리한다. 색만으로 값을 전하지 않는다.
- 날짜는 `YYYY-MM-DD`이고 범위 안에서 고유해야 한다. 값은 유한한 0 이상. 어기면 렌더 중 throw다.
- 세기 색은 테마의 brand semantic 색이 정한다. 제공자별 색·데이터 fetch는 들어 있지 않다(제품 소유).
- 배치는 Web `layoutStyle`, Native는 바깥 wrapper로 한다. 칸 크기·색을 덮는 스타일 통로는 없다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| grid 넘침 | 가로 스크롤 region(`tabIndex=0`) | 가로 `ScrollView` |
| 값 확인 | 셀 접근성 이름 + hover `title` | 셀 접근성 이름 |
| list 길이 | 페이지 흐름 | 세로 `ScrollView`는 host가 감싼다 |
| 배치 prop | `layoutStyle` | 없음(바깥 wrapper) |

## 함정

- grid 셀은 읽기 전용이라 눌러서 상세로 가는 동작이 없다. 셀 단위 상호작용이 필요하면 계약 공백으로 올린다.
- 실기기 렌더와 VoiceOver 청취 순회는 아직 검증되지 않았다([계약 문서](../../activity-heatmap.md)).
