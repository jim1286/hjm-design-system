# 로그인

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/화면/공통 화면/로그인`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/계정/로그인`

## 목적

AuthScreenLayout을 사용해 로그인 흐름을 구성한다. 제품이 데이터·권한·서버 확정·문구를 공급하며, 예제의 메모리 저장을 운영 저장으로 취급하지 않는다.

## 영역 구조

```text
host: 남은 높이·safe area·키보드
└─ 히어로 → 제공자 카드 → 하단 동의
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | AuthScreenLayout | route 본문 | [API 배치 규칙](../components/auth-screen-layout.md#배치), host 남은 높이 |
| 내용 | 공개 슬롯 | 히어로 → 제공자 카드 → 하단 동의 | 화면 recipe의 sectionGap·itemGap; 슬롯 안은 각 지침 토큰 |
| 상태 | state 또는 해당 API 상태 | 본문 자리·비차단 notice | 입력 중 실패는 본문 높이와 초안을 유지 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 작업 | AuthScreenLayout 공개 행동 슬롯 | 제공자 버튼에는 이름만; 로그인 중 카드 중앙 스피너 하나 | 같은 표면에 경쟁하는 primary 하나만 |
| 복구 | Button·secondary | 오류 근처 | 재시도할 대상과 범위를 표시 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 히어로 → 제공자 카드 → 하단 동의 | 각 공개 콜백을 제품 상태에 연결 |
| 로딩 | 제공자 로그인 진행 중: `pendingLabel`로 카드 크기를 유지한 채 중앙 로딩 하나(버튼 목록은 숨겨도 자리 유지, 로딩 아래 문구 없음). 제공자 목록 최초 조회 로딩과 다르다(LS-09) | 중복 요청 차단. `예제 로그인 취소`는 실패 문장 없이 버튼만 복구 |
| 빈 | — (로그인 화면에는 빈 상태가 없다) | — |
| 오류 | `pendingLabel`을 지워 버튼을 복원하고 카드 안 버튼 위에 Notice `danger` 한 줄(기술 오류 원문 금지) | 같은 제공자 버튼으로 다시 시도 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [AuthScreenLayout](../components/auth-screen-layout.md) | 필수 props·슬롯·플랫폼 차이 |
| [AuthProviderButton](../components/auth-provider-button.md) | 제공자 버튼(이름만) |
| [Top](../components/top.md) | 히어로 제목·설명(제목을 `Text`로 그리지 않는다) |
| [Notice](../components/notice.md) | 로그인 실패 한 줄 |
| [Button](../components/button.md) | 동작·로딩·보조 행동 |
| [ScreenLayout](../components/screen-layout.md) | 화면 높이·본문 교체·스크롤 소유 |

## 코드 골격

```tsx
// Web
import { AuthScreenLayout } from "@hjmds/react/auth-screen";

<AuthScreenLayout
  mainCard
  {...(pending ? { pendingLabel: t("auth.pending") } : {})}
  hero={<ProductHero />}            // 제품 마크·제목·설명
  main={<ProviderButtons />}        // pending이어도 같은 목록
  footer={<ConsentAndPolicyLinks />}
/>
```

```tsx
// Native
import { AuthScreenLayout } from "@hjmds/react-native/auth-screen";

<AuthScreenLayout
  mainCard
  {...(pending ? { pendingLabel: t("auth.pending") } : {})}
  hero={<ProductHero />}            // 제품 마크·제목·설명
  main={<ProviderButtons />}        // pending이어도 같은 목록
  footer={<ConsentAndPolicyLinks />}
/>
```

콜백·데이터·지역화 함수는 제품에서 공급한다. 필수 props와 플랫폼별 차이는 위 API 지침에서 확인한다.

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자 | 2배 글자에서 제목·행은 내용 높이로 증가. footer·닫기·입력 필드가 겹치지 않는지 확인 |
| 다크 | semantic 색으로 내용과 표면을 함께 전환; 예제 브랜드 색을 제품 기본값으로 복사하지 않음 |
| 좁은 폭 | 320px부터 한 열로 읽기 순서 유지. 가상화 본문은 scroll=content, 중첩 스크롤 금지 |
| 키보드 | Native host가 safe area와 키보드를 한 번 처리; Web은 포커스된 입력과 footer 가림 확인 |

## 함정

- 실패하면 버튼을 복원; 카드 크기 유지와 중복 요청 차단.
- 스토리는 기본·어두운 테마·큰 글자, `로그인 중`, `로그인 실패와 다시 시도`(첫 시도 실패 → 다시 누르면 성공)다. 빈 화면·로그인 필요 같은 본문 상태는 이 화면에 해당하지 않아 2026-10-06 스토리에서 뺐다.
- Storybook은 실제 서버·OS 권한·라우터 연동 증거가 아니다. 기본·다크·큰 글자와 실패/복구를 각각 확인한다.
