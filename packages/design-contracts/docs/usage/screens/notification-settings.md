# 알림 설정

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-17
- 근거: `showcase/web/src/patterns/NotificationSettings.stories.tsx`, `showcase/native/src/NotificationSettings.stories.tsx`, `src/component-recipes.ts`(`topBarRecipe`·`bottomCtaRecipe`·`sectionRecipe`·`switchRecipe`), `src/container.ts`, `src/responsive.ts`(`resolveWindowClass`), `packages/react/src/styles.css`(`.hjm-top-bar`·`.hjm-bottom-cta`)
- 스토리북: `배포/화면/설정/알림 설정`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 화면 API가 없는 제품 콘텐츠는 `ScreenLayout`의 본문에 HJM 구성을 연결한다.

## 목적

알림 종류 몇 개를 스위치로 켜고 끈 뒤 하단 버튼 하나로 저장하는 설정 화면이다. 상단 바 · 읽기 폭 본문 · 하단 행동 바의
세 층으로 된 화면 골격의 기준 예다. 스위치를 바꾸는 즉시 서버에 반영하는 설정이면 하단 저장 바를 빼고 각 Switch의
`onCheckedChange`에서 저장한다.

## 영역 구조

```text
ScreenLayout: 제목(고정) → 본문(스크롤) → footer(고정)
  본문: CompositionLayout(설정 제목·설명 → 설정 행 → 저장 안내)
  footer: 저장 행동
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | ScreenLayout | host의 남은 높이 | 공통 화면 폭·padding·본문 스크롤 |
| 설정 묶음 | CompositionLayout | 본문 | 공통 제목·설명·내용 간격 |
| 설정 값 | Switch | 구성 본문 | 제품 데이터·변경 콜백 |
| 저장 | footer | 화면 하단 | HJM 고정 영역; 제품 저장 요청과 pending 연결 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 저장(주 행동) | Button(primary) | 화면 맨 아래 바 | 1. 저장 중 `loading`, 저장 뒤에는 라벨을 `t("settings.saved")`로 바꾸고 `disabled` |
| 보조 행동 | Button(secondary) | 같은 바, 주 행동 앞(왼쪽) | 스토리에는 없음. 둘 다 있으면 [보조][주] 같은 폭으로 나뉜다 |
| 항목 켜기·끄기 | Switch `presentation="row"` 행 전체 | 본문 CompositionLayout 안 | 항목 수만큼, 위→아래 |
| 다시 불러오기 | Notice `action` > Button `tone="secondary" size="small"` | 불러오기 실패 Notice 안 | 스토리에 없음. 1 |
| 뒤로 | ScreenLayout `leading` | 상단 바 시작 끝 | 스토리에는 없음. 하위 설정 화면이면 1 |
| 파괴 행동 | — | — | 없음 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 스위치가 메모리 예제의 초기 저장값. 변경이 없으면 저장 버튼 비활성 | 스위치를 바꾸면 저장 가능. 저장값으로 되돌리면 다시 비활성 |
| 로딩 | 스토리에 없음. 첫 값을 불러오는 동안 CompositionLayout 안 스위치 자리에 [Skeleton](../components/skeleton.md) `shape="text"`, 저장 버튼 `disabled`. 저장 중이면 Button에 `loading`(누름을 막고 같은 자리에 스피너) | 기다림 |
| 빈 | 해당 없음(설정 항목은 항상 있다). 항목이 조건부면 CompositionLayout 아래 안내 Text | — |
| 오류 | **최초 불러오기 실패**(스토리에는 없음): 스위치 대신 [Notice](../components/notice.md) `tone="danger"` + `action` 다시 시도, 저장 버튼 `disabled`. **저장 실패**(스토리에서 `다음 저장 실패시키기`로 실행): CompositionLayout 끝에 Notice `tone="danger"`(action 없음 — 다시 시도는 저장 버튼이 맡는다), 사용자가 고른 스위치 값을 그대로 두고 `loading`만 푼다. 문구는 네트워크 실패 `settings.error.offline`·서버 실패 `settings.error.server`로 나눈다. 다시 시도가 또 실패하면 같은 Notice가 같은 자리에 남고 문구만 갱신한다. Native는 `announcement="assertive"`(기본 `none`) | 다시 시도 / 다시 저장 |
| 저장됨 | CompositionLayout 끝에 Notice `tone="success"`(제목 + 켜짐/꺼짐 요약). 버튼은 "저장했어요"로 바뀌고 비활성. Native Notice `announcement="polite"` | 스위치를 다시 바꾸면 저장 상태가 풀린다 |


### 설정 초안의 저장 경계

두 스토리는 `showcase/shared/notification-settings.ts`에서 기존 `createActionSession`을 사용한다. 마지막 저장값과 현재 초안을 따로 표시하며, 저장 중에도 스위치를 수정할 수 있다. 성공은 제출 snapshot만 확정하고 새 초안은 남긴다. 저장 실패 후 하단의 같은 버튼으로 **현재 초안**을 다시 제출한다. 중복 저장은 잠그며 값을 저장값으로 되돌리면 불필요한 저장을 막는다. `예제 실행`의 실패 스위치는 다음 저장 한 번에만 적용한다. 실제 조회·권한·푸시·계정 API 없이 화면이 열려 있는 동안만 유지되는 메모리 데모다.

| 상황 | 연결 | 유지·복구 |
| --- | --- | --- |
| 최초 조회 실패 | 설정값 대신 오류·재시도 | 기본 false를 실제 서버 설정처럼 저장하지 않는다 |
| 사용자 수정 | draft와 마지막 saved 분리 | 값을 바꾸면 저장됨 표시를 해제한다 |
| 저장 중 재수정 | 제출 snapshot 보관 | 성공은 제출한 값에만 적용한다. 현재 draft가 다르면 다시 저장 가능 상태 |
| 저장 실패 | 현재 draft 유지 | 하단 저장 버튼으로 재시도하고 별도의 경쟁 저장 버튼을 만들지 않는다 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [ScreenLayout](../components/screen-layout.md) | 제목·본문·고정 footer |
| [CompositionLayout](../components/composition-layout.md) | ② 설정 묶음 제목·설명 |
| [Switch](../components/switch.md) | ② 항목 행 |
| [Notice](../components/notice.md) | 저장 결과·오류 |
| [Skeleton](../components/skeleton.md) | 첫 값 불러오기 |
| [Button](../components/button.md) | ③ 하단 저장 |
| [Stack](../components/stack.md) | 세 층 사이, 스위치 목록 |
| [화면 여백과 너비](../tokens/layout.md) | `layout.readingMaxWidth`, `layout.pagePadding.compact`·`regular`, `resolveWindowClass` |
| [간격](../tokens/spacing.md) | `spacing.xxs`·`xs`·`sm`·`md`·`lg` |

## 코드 골격

<!-- usage-example: Web ../../../../../showcase/web/src/patterns/NotificationSettings.stories.tsx -->
- [Web 실행 예제](../../../../../showcase/web/src/patterns/NotificationSettings.stories.tsx)
<!-- usage-example: Native ../../../../../showcase/native/src/NotificationSettings.stories.tsx -->
- [Native 실행 예제](../../../../../showcase/native/src/NotificationSettings.stories.tsx)

예제는 ScreenLayout·CompositionLayout에 설정 데이터와 저장 콜백을 연결한다. 메모리 저장 fixture를 운영 요청으로 취급하지 않는다.

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 다크 | 공통 semantic token으로 전환 |
| 좁은 폭 | 공통 화면·구성의 줄바꿈과 간격을 사용 |

ScreenLayout이 화면 여백과 스크롤을, CompositionLayout이 묶음 간격을 관리한다. 테마는 공통 semantic token을 사용한다. footer 안에서 BottomCTA를 중첩해 여백과 경계선을 두 번 적용하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| Switch 기본 배치 | `inline`(행으로 쓰려면 `presentation="row"` 명시) | `row` |
| 하단 바 고정 | ScreenLayout footer | ScreenLayout footer |
| 안전 영역 | 제품 host에서 연결 | 제품 host에서 연결 |
| 저장·오류 알림 | Notice가 `role="status"` | Notice `announcement` 명시(기본 `none`): 저장됨 `polite`, 오류 `assertive` |
| 스토리 상태 | 기본·다크·큰 글자, 기본 화면에서 저장 실패와 재시도 실행 | 기본·다크·큰 글자, 동일 메모리 저장 흐름 |

## 함정

- Native에서 `safeAreaBottom`을 넘기지 않으면 홈 인디케이터가 저장 버튼 위에 겹친다. 기본값은 0이다.
- 현재 스토리는 저장 요약 문구를 템플릿 문자열(`내 활동 ${…}`)로 조립한다. 제품은 위 코드처럼 켜짐/꺼짐 키 표와 보간 값을 쓴다.

## 근거

- 설정 초안의 저장 경계 상황 표: 2026-10-13 전수 점검 — 최초 조회와 변경 요청의 상태를 같은 골격으로 설명하던 부분을 구체화했다.
