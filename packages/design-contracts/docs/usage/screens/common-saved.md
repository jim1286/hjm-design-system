# 저장한 항목

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/화면/공통 화면/저장한 항목`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/콘텐츠/저장한 항목`

## 목적

SavedItemsScreen을 사용해 저장한 항목 흐름을 구성한다. 제품이 데이터·권한·서버 확정·문구를 공급하며, 예제의 메모리 저장을 운영 저장으로 취급하지 않는다.

## 영역 구조

```text
host: 남은 높이·safe area·키보드
└─ 컬렉션 2열 → 게시물 3열 → 상세·해제/Undo → 격자 복귀
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | SavedItemsScreen | route 본문 | [API 배치 규칙](../components/saved-items-screen.md#배치), host 남은 높이 |
| 내용 | SavedItemsScreen 내부 Grid | 첫 화면 컬렉션 격자 → 컬렉션 안 게시물 격자 → 상세(`renderDetail`) | 컬렉션 `columns={{compact:2}}`·gap `spacing.md` 16·최소 열 80, 게시물 `columns={{compact:3}}`·gap `spacing.xxs` 4·최소 열 44 |
| 상태 | state 또는 해당 API 상태 | 본문 자리·비차단 notice | 입력 중 실패는 본문 높이와 초안을 유지 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 새 컬렉션 | Button·ghost(내장, `labels.createCollection`) | 첫 화면 머리 오른쪽 actions 자리 | 하나. 누르면 `onCreateCollection` → 제품 Sheet(footer에 만들기 Button 하나) |
| 뒤로 | Button·ghost(내장, `labels.back`) | 컬렉션·상세 머리 왼쪽 leading 자리 | 하나. 상세 → 격자 → 컬렉션 순으로 `onBack` |
| 게시물 열기 | 격자 칸(내장 버튼) | 게시물 격자 | 칸마다 하나, `onOpenItem` |
| 저장 해제 | IconButton·ghost(제품이 `renderDetail`에 둔다) | 상세 본문 머리 행 오른쪽(왼쪽은 작성자) | 하나. 해제 후 상세를 닫고 격자로 복귀 |
| 실행 취소 | Button·secondary·small | `notice`(상태 문구 오른쪽) | 해제 직후 하나 |
| 복구 | Button·secondary | 오류 근처 | 재시도할 대상과 범위를 표시 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 컬렉션 2열 → 게시물 3열 → 상세 → 저장 해제·실행 취소 → 격자 복귀 | 각 공개 콜백을 제품 상태에 연결 |
| 로딩 | 최초 조회는 본문 상태, 저장은 해당 행동 pending | 중복 제출 차단; 성공을 먼저 표시하지 않음 |
| 빈 | 실제 조회 0건 또는 아직 작성하지 않은 상태 안내 | 시작·조건 해제 등 맥락에 맞는 대안 |
| 오류 | 목록 비어 있음과 조회 실패를 구분하고 재시도 제공 | 실패 원인과 재시도 경로 제공 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [SavedItemsScreen](../components/saved-items-screen.md) | 필수 props·슬롯·플랫폼 차이 |
| [Button](../components/button.md) | 동작·로딩·보조 행동 |
| [SavedItemsScreen](../components/saved-items-screen.md) | 화면 높이·본문 교체·스크롤 소유 |

## 코드 골격

```tsx
// Web
import { IconButton } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { SavedItemsScreen } from "@hjmds/react/saved-items";

<SavedItemsScreen title={t("saved.title")} items={items} collections={collections}
  {...(collectionId !== undefined ? { collectionId } : {})}
  selectedItemId={selectedItemId} labels={labels} state={state}
  onOpenCollection={openCollection} onOpenItem={openItem} onBack={goBack}
  onCreateCollection={openCreateSheet}
  notice={undoNotice}
  renderThumbnail={renderThumbnail}
  renderDetail={(item) => <Stack gap="md">
    <Stack axis="inline" align="center" justify="between">
      <Text emphasis="strong">{item.author}</Text>
      <IconButton label={t("saved.unsave", { title: item.title })} tone="ghost" onClick={() => unsave(item.id)}><BookmarkGlyph /></IconButton>
    </Stack>
    {renderBody(item)}
  </Stack>} />
```

```tsx
// Native
import { IconButton } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { SavedItemsScreen } from "@hjmds/react-native/saved-items";

<SavedItemsScreen title={t("saved.title")} items={items} collections={collections}
  {...(collectionId !== undefined ? { collectionId } : {})}
  selectedItemId={selectedItemId} labels={labels} state={state}
  onOpenCollection={openCollection} onOpenItem={openItem} onBack={goBack}
  onCreateCollection={openCreateSheet}
  notice={undoNotice}
  renderThumbnail={renderThumbnail}
  renderDetail={(item) => <Stack gap="md">
    <Stack axis="inline" align="center" justify="between">
      <Text emphasis="strong">{item.author}</Text>
      <IconButton label={t("saved.unsave", { title: item.title })} tone="ghost" onPress={() => unsave(item.id)}><BookmarkGlyph /></IconButton>
    </Stack>
    {renderBody(item)}
  </Stack>} />
```

`collectionId`를 생략하면 컬렉션 첫 화면, `null`이면 모든 게시물이다. 저장 해제 버튼은 API에 내장되지 않는다:
제품이 `renderDetail` 머리 행에 두고, 해제 뒤 `selectedItemId`를 `null`로 돌리고 `notice`에 실행 취소를 띄운다.
콜백·데이터·지역화 함수는 제품에서 공급한다.

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자 | 2배 글자에서 제목·행은 내용 높이로 증가. footer·닫기·입력 필드가 겹치지 않는지 확인 |
| 다크 | semantic 색으로 내용과 표면을 함께 전환; 예제 브랜드 색을 제품 기본값으로 복사하지 않음 |
| 좁은 폭 | 320px에서도 컬렉션 2열·게시물 3열. 제목은 줄바꿈하며 가로 넘침 없이 본문 하나만 스크롤 |
| 키보드 | Native host가 safe area와 키보드를 한 번 처리; Web은 포커스된 입력과 footer 가림 확인 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 열기·해제 콜백 | `onClick` | `onPress` |
| `Stack`·`Text` import | `@hjmds/react/layout` | `@hjmds/react-native/primitives` |

## 함정

- 목록 비어 있음과 조회 실패를 구분하고 재시도 제공.
- Storybook은 실제 서버·OS 권한·라우터 연동 증거가 아니다. 기본·다크·큰 글자와 실패/복구를 각각 확인한다.

- 새 컬렉션은 Sheet footer에 만들기 하나, 본문은 스크롤한다. Native는 `scrollable keyboardAvoidance`를 사용하고 사진 선택 Button은 `growWithContent`로 이미지 높이를 보존한다. 고정 44 높이에 사진을 넣으면 행이 겹친다(2026-10-06 시뮬레이터 재현).
