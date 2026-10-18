# 로그인

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 구성 API 지침 참조
- 검토일: 2026-10-17
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/화면/공통 화면/로그인`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/계정/로그인`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 화면 API가 없는 제품 콘텐츠는 `ScreenLayout`의 본문에 HJM 구성을 연결한다.

## 목적

AuthScreenLayout을 사용해 로그인 흐름을 구성한다. 제품이 데이터·권한·서버 확정·문구를 공급하며, 예제의 메모리 저장을 운영 저장으로 취급하지 않는다.

## 영역 구조

```text
host: 남은 높이·safe area·키보드
└─ (머리 띠: [뒤로/닫기] 로그인) → 히어로 → 제공자 카드 → 하단 동의
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | AuthScreenLayout | route 본문 | [API 배치 규칙](../components/auth-screen-layout.md#배치), host 남은 높이 |
| 머리(선택) | AuthScreenLayout `title`·`exit`(1.31.0) | 맨 위 고정, 화면 가장자리까지 | ScreenLayout 가운데 머리 띠(최소 52). 바깥에 TopBar를 따로 얹지 않는다 |
| 내용 | 공개 슬롯 | 히어로 → 제공자 카드 → 하단 동의 | 화면 recipe의 sectionGap·itemGap; 슬롯 안은 각 지침 토큰 |
| 상태 | pendingLabel 또는 main 안 Notice | 제공자 카드 내부 | 카드 크기를 유지하고 동의 고지를 남긴다 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 작업 | AuthScreenLayout 공개 행동 슬롯 | 제공자 버튼에는 이름만; 로그인 중 카드 중앙 스피너 하나 | 같은 표면에 경쟁하는 primary 하나만 |
| 복구 | Button·secondary | 오류 근처 | 재시도할 대상과 범위를 표시 |
| 나가기 | AuthScreenLayout `exit`(아이콘 뒤로/닫기) | 머리 띠 시작 끝 | 0~1. 로그인 진행 중에는 제품이 `disabled` |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 히어로 → 제공자 카드 → 하단 동의 | 각 공개 콜백을 제품 상태에 연결 |
| 로딩 | 제공자 로그인 진행 중: `pendingLabel`로 카드 크기를 유지한 채 중앙 로딩 하나(버튼 목록은 숨겨도 자리 유지, 로딩 아래 문구 없음). 제공자 목록 최초 조회 로딩과 다르다(LS-09) | 중복 요청 차단. `예제 로그인 취소`는 실패 문장 없이 버튼만 복구 |
| 빈 | — (로그인 화면에는 빈 상태가 없다) | — |
| 오류 | `pendingLabel`을 지워 버튼을 복원하고 카드 안 버튼 위에 Notice `danger` 한 줄(기술 오류 원문 금지) | 같은 제공자 버튼으로 다시 시도 |


### 제공자 목록과 로그인 요청 분리

| 상황 | 연결 | 유지·복구 |
| --- | --- | --- |
| 목록 조회 중 | 제품이 main 영역 상태 제공 | AuthScreenLayout에는 ScreenLayout.state prop이 없다 |
| 사용자 취소 | pendingLabel 제거 | 실패로 알리지 않고 제공자 버튼을 복원한다 |
| 제공자 실패 | main 안 Notice + 같은 버튼 | 기술 오류 원문 대신 지역화된 안내; 동의 링크 유지 |
| 버튼 목록 변경 | 동일 mainCard 안에서 갱신 | 진행 중 버튼을 제거해 카드 높이를 줄이지 않는다 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [AuthScreenLayout](../components/auth-screen-layout.md) | 필수 props·슬롯·플랫폼 차이 |
| [AuthProviderButton](../components/auth-provider-button.md) | 제공자 버튼(이름만) |
| [AuthScreenLayout](../components/auth-screen-layout.md#공개-이름과-import)의 `AuthScreenHero` | 히어로 마크·eyebrow·태그라인·설명(`Top`·`Text`로 조립하지 않는다) |
| [AuthScreenLayout](../components/auth-screen-layout.md#공개-이름과-import)의 `AuthScreenFooter` | 동의 고지·정책 링크(ghost `Button`으로 만들지 않는다) |
| [Notice](../components/notice.md) | 로그인 실패 한 줄 |
| [Button](../components/button.md) | 동작·로딩·보조 행동 |
| [ScreenLayout](../components/screen-layout.md) | 화면 높이·본문 교체·스크롤 소유 |

## 코드 골격

```tsx
// Web
import { AuthScreenFooter, AuthScreenHero, AuthScreenLayout } from "@hjmds/react/auth-screen";

<AuthScreenLayout
  mainCard
  {...(pending ? { pendingLabel: t("auth.pending") } : {})}
  hero={<AuthScreenHero mark={<ProductMark />} title={t("auth.tagline")} description={t("auth.description")} />}
  main={<ProviderButtons />}        // pending이어도 같은 목록
  footer={<AuthScreenFooter notice={t("auth.consent")} links={policyLinks} />}  // { label, href | onClick }
/>
```

```tsx
// Native
import { AuthScreenFooter, AuthScreenHero, AuthScreenLayout } from "@hjmds/react-native/auth-screen";

<AuthScreenLayout
  mainCard
  {...(pending ? { pendingLabel: t("auth.pending") } : {})}
  hero={<AuthScreenHero mark={<ProductMark />} title={t("auth.tagline")} description={t("auth.description")} />}
  main={<ProviderButtons />}        // pending이어도 같은 목록
  footer={<AuthScreenFooter notice={t("auth.consent")} links={policyLinks} />}  // { label, onPress }
/>
```

콜백·데이터·지역화 함수는 제품에서 공급한다. 필수 props와 플랫폼별 차이는 위 API 지침에서 확인한다.

## 다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 다크 | semantic 색으로 내용과 표면을 함께 전환; 예제 브랜드 색을 제품 기본값으로 복사하지 않음 |
| 좁은 폭 | 320px부터 한 열로 읽기 순서 유지. 가상화 본문은 scroll=content, 중첩 스크롤 금지 |
| 키보드 | Native host가 safe area와 키보드를 한 번 처리; Web은 포커스된 입력과 footer 가림 확인 |

## 함정

- 예제는 로그인 시도마다 작업 식별자를 두고 제공자 중복 실행을 차단한다. 취소·언마운트 후 늦게 도착한 타이머는 홈이나 오류를 열지 않는다. 취소 뒤 새 시도는 별개의 작업이다. 성공 뒤 홈에서 대화·알림으로 이동할 때 로그인 예제의 초기 오류·진행 상태를 넘기지 않는다. 실제 OAuth 취소를 검증한 것은 아니다.
- 실패하면 버튼을 복원; 카드 크기 유지와 중복 요청 차단.
- 스토리는 기본·어두운 테마, `로그인 중`, `로그인 실패와 다시 시도`(첫 시도 실패 → 다시 누르면 성공)다. 빈 화면·로그인 필요 같은 본문 상태는 이 화면에 해당하지 않아 스토리에 두지 않는다.
- Storybook은 실제 서버·OS 권한·라우터 연동 증거가 아니다. 기본·다크와 실패/복구를 각각 확인한다.

## 근거

- 제공자 목록과 로그인 요청 분리 상황 표: 2026-10-13 전수 점검 — 최초 조회와 변경 요청의 상태를 같은 골격으로 설명하던 부분을 구체화했다.
- 히어로·하단 동의를 `AuthScreenHero`·`AuthScreenFooter`로 연결: 2026-10-17 사용자 피드백("굵기랑 크기 줄여", "간격 줄여") — `Top large` 히어로가 402 폭에서 두 줄 32/40이었고 ghost Button 링크 사이가 42였다. 수치는 [API 배치 규칙](../components/auth-screen-layout.md#배치).
- 빈 화면·로그인 필요 스토리 없음: 2026-10-06 해당하지 않는 본문 상태 스토리를 뺐다.
