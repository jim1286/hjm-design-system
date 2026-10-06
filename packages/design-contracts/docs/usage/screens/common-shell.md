# 화면 골격과 상태

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/화면/공통 화면/화면 골격`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/화면 틀과 도구/화면 골격과 상태`

## 목적

ScreenLayout을 사용해 화면 골격 흐름을 구성한다. 제품이 데이터·권한·서버 확정·문구를 공급하며, 예제의 메모리 저장을 운영 저장으로 취급하지 않는다.

## 영역 구조

```text
host: 남은 높이·safe area·키보드
└─ 헤더 → notice → 본문 → footer
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | ScreenLayout | route 본문 | [API 배치 규칙](../components/screen-layout.md#배치), host 남은 높이 |
| 내용 | 공개 슬롯 | 헤더 → notice → 본문 → footer | 화면 recipe의 sectionGap·itemGap; 슬롯 안은 각 지침 토큰 |
| 상태 | state 또는 해당 API 상태 | 본문 자리·비차단 notice | 입력 중 실패는 본문 높이와 초안을 유지 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 작업 | ScreenLayout 공개 행동 슬롯 | 뒤로는 leading, 화면 도구는 actions, 주 행동은 footer | 같은 표면에 경쟁하는 primary 하나만 |
| 복구 | Button·secondary | 오류 근처 | 재시도할 대상과 범위를 표시 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 헤더 → notice → 본문 → footer | 각 공개 콜백을 제품 상태에 연결 |
| 로딩 | 최초 조회는 본문 상태, 저장은 해당 행동 pending | 중복 제출 차단; 성공을 먼저 표시하지 않음 |
| 빈 | 실제 조회 0건 또는 아직 작성하지 않은 상태 안내 | 시작·조건 해제 등 맥락에 맞는 대안 |
| 오류 | 초기 로딩만 본문 교체; 갱신 실패는 notice로 본문 유지 | 실패 원인과 재시도 경로 제공 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [ScreenLayout](../components/screen-layout.md) | 필수 props·슬롯·플랫폼 차이 |
| [Button](../components/button.md) | 동작·로딩·보조 행동 |
| [ScreenLayout](../components/screen-layout.md) | 화면 높이·본문 교체·스크롤 소유 |

## 코드 골격

```tsx
// Web
import { IconButton } from "@hjmds/react/actions";
import { BottomCTA } from "@hjmds/react/bottom-cta";
import { ScreenLayout } from "@hjmds/react/screens";

<ScreenLayout
  title={t("saved.title")}
  leading={<IconButton label={t("common.back")} onClick={goBack}><BackGlyph /></IconButton>}
  state={isLoading ? { kind: "loading", title: t("saved.loading") } : { kind: "ready" }}
  footer={<BottomCTA primaryAction={{ label: t("saved.add"), onClick: add }} />}
>
  <SavedList items={items} />
</ScreenLayout>
```

```tsx
// Native — host가 safe area를 한 번 처리한다
import { IconButton } from "@hjmds/react-native/actions";
import { BottomCTA } from "@hjmds/react-native/bottom-cta";
import { ScreenLayout } from "@hjmds/react-native/screens";

<ScreenLayout
  title={t("saved.title")}
  leading={<IconButton label={t("common.back")} onPress={goBack}><BackGlyph /></IconButton>}
  state={isLoading ? { kind: "loading", title: t("saved.loading") } : { kind: "ready" }}
  footer={<BottomCTA primaryAction={{ label: t("saved.add"), onPress: add }} />}
>
  <SavedList items={items} />
</ScreenLayout>
```

콜백·데이터·지역화 함수는 제품에서 공급한다. 필수 props와 플랫폼별 차이는 위 API 지침에서 확인한다.

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자 | 2배 글자에서 제목·행은 내용 높이로 증가. footer·닫기·입력 필드가 겹치지 않는지 확인 |
| 다크 | semantic 색으로 내용과 표면을 함께 전환; 예제 브랜드 색을 제품 기본값으로 복사하지 않음 |
| 좁은 폭 | 320px부터 한 열로 읽기 순서 유지. 가상화 본문은 scroll=content, 중첩 스크롤 금지 |
| 키보드 | Native host가 safe area와 키보드를 한 번 처리; Web은 포커스된 입력과 footer 가림 확인 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `BottomCTA` 행동 | `primaryAction.onClick` | `primaryAction.onPress` |
| `BottomCTA` 위치 | `position`(`flow`·`sticky`) | 없음. `ScreenLayout` `footer`가 본문 아래 고정 |

## 함정

- 초기 로딩만 본문 교체; 갱신 실패는 notice로 본문 유지.
- 이 화면에는 전송 행동이 없어 `실패와 초안 복구` 스토리를 2026-10-06 뺐다. 갱신 실패 복구는 `연결 복구`로 확인한다.
- Storybook은 실제 서버·OS 권한·라우터 연동 증거가 아니다. 기본·다크·큰 글자와 실패/복구를 각각 확인한다.
