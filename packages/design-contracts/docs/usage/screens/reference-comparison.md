# 기록 표현 비교

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 구성 API 지침 참조
- 검토일: 2026-10-15
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/화면/표현 비교/같은 기록의 세 가지 구성`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/화면 틀과 도구/기록 표현 비교`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 화면 API가 없는 제품 콘텐츠는 `ScreenLayout`의 본문에 HJM 구성을 연결한다.

## 목적

ScreenLayout을 사용해 같은 기록의 세 가지 구성 흐름을 구성한다. 제품이 데이터·권한·서버 확정·문구를 공급하며, 예제의 메모리 저장을 운영 저장으로 취급하지 않는다.

## 영역 구조

```text
host: 남은 높이·safe area·키보드
└─ 표현 방식 선택 → 검색 → 같은 데이터 목록·읽기·이미지 표현
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | ScreenLayout | route 본문 | [API 배치 규칙](../components/screen-layout.md#배치), host 남은 높이 |
| 내용 | Stack `gap="xl"` > SegmentedControl → SearchField(제품 돋보기 adapter + placeholder) → 상태 문구 → 카드(Surface `padding="lg"`) | 표현 방식 선택 → 검색 → 같은 데이터 목록·읽기·이미지 표현 | 구획 사이 `spacing.xl` 24. 목록·읽기는 Stack `gap="lg"` 한 열, 이미지는 Grid 두 열(`minColumnWidth` 240 = `spacing.xxxl` 40 × 6) |
| 상태 | state 또는 해당 API 상태 | 본문 자리·비차단 notice | 입력 중 실패는 본문 높이와 초안을 유지 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 보기 방식 | SegmentedControl(`label` 보기 방식) | 검색 위 | 세 값, 항상 하나 선택 |
| 읽기 · 저장 | Button secondary · Button secondary `selected` | 카드 아래 | 카드마다 한 줄 [읽기][저장](선택하면 `저장 취소`). 보이는 문구는 짧은 동사이고 카드 제목을 포함한 이름은 접근성 이름(Web `aria-label`, Native `accessibilityLabel`)으로 둔다. 저장은 그 카드에 대한 행동의 눌림 토글이라 `selected`를 허용한다. 보기 방식처럼 선택지를 고르는 곳에는 쓰지 않는다([선택 조립 규칙](../SELECTION.md#조립-규칙필수)) |
| 검색 초기화 | EmptyState `action` > Button secondary | 결과 없음 자리 | 하나. 이 화면에는 primary가 없다 |
| 읽기 마치기 | Button(Sheet footer) | 상세 Sheet | 하나 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 표현 방식 선택 → 검색 → 같은 데이터 목록·읽기·이미지 표현 | 각 공개 콜백을 제품 상태에 연결 |
| 로딩 | 동기 메모리 예제에는 없음. 제품 최초 조회는 본문 중앙 상태, 재조회는 기존 기록을 유지하고 저장은 해당 행동 pending | 중복 제출 차단; 성공을 먼저 표시하지 않음 |
| 빈 | 검색 결과 0건: EmptyState `compact`(상태 문구는 0개로 남는다) | `검색 초기화` |
| 오류 | 동기 예제는 서버 실패를 제공하지 않음. 제품 최초 실패는 중앙 state/error + stateAction, 재조회 실패는 notice와 기존 목록, 저장 실패는 해당 항목 옆에서 복구 | 검색·보기·저장 상태와 열린 상세 유지 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [ScreenLayout](../components/screen-layout.md) | 필수 props·슬롯·플랫폼 차이 |
| [Button](../components/button.md) | 동작·로딩·보조 행동 |
| [SearchField](../components/search-field.md) | 같은 기록 검색 |
| [SegmentedControl](../components/segmented-control.md) | 보기 방식 전환 |
| [Heading](../components/heading.md) | 카드 제목(읽기 중심 `level4`, 나머지 `level5`) |
| [Grid](../components/grid.md) | 이미지 중심 두 열 |
| [EmptyState](../components/empty-state.md) | 결과 없음 |

### 현재 예제와 제품 비동기 상태

실행 원본은 `showcase/web/src/patterns/reference-flow-previews.tsx`와
`showcase/native/src/reference-flow-previews.tsx`의 RecordComparison이다. 공개 RecordComparison 화면 export는 없다.
현재 예제는 같은 메모리 목록·즉시 저장 토글·세 표현을 비교한다. 아래 코드는 제품 상태를 연결하는 골격이다.
`hasLoaded`는 0건을 포함해 성공 응답을 받은 이력이다. 재조회 때 false로 되돌리지 않는다.
최초 실패는 ScreenLayout stateAction에 재시도를 주고, 재조회 실패는 notice에 Notice와 재시도를 둔다.
검색어·보기 방식은 제품 상태에 유지하며 제품의 전체 빈 결과는 ScreenLayout 본문 중앙에 둔다.
예제의 compact EmptyState는 카드 구성 비교용 인라인 표시이며 전체 빈 화면의 배치 기준이 아니다.

## 코드 골격

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { SearchField } from "@hjmds/react/forms";
import { EmptyState } from "@hjmds/react/feedback";
import { Heading } from "@hjmds/react/heading";
import { Stack, Surface, Text } from "@hjmds/react/layout";
import { SegmentedControl } from "@hjmds/react/selection";
import { ScreenLayout } from "@hjmds/react/screens";

// 보기 방식 id → 문구 키 표. 템플릿으로 만든 키는 키 추출·누락 검사가 찾지 못한다.
const modeKey = { list: "records.mode.list", reading: "records.mode.reading", image: "records.mode.image" } as const;
type Mode = keyof typeof modeKey;

<ScreenLayout
  title={t("records.compare.title")}
  description={t("records.compare.intro")}
  stateAction={error && !hasLoaded ? retryAction : null}
  notice={hasLoaded && error ? refreshNotice : null}
  state={loading && !hasLoaded ? { kind: "loading", title: t("records.loading") }
    : error && !hasLoaded ? { kind: "error", title: t("records.error") } : { kind: "ready" }}
>
  <Stack gap="xl">
    <SegmentedControl label={t("records.mode.label")} value={mode} onValueChange={(value) => setMode(value as Mode)}
      items={(Object.keys(modeKey) as Mode[]).map((value) => ({ value, label: t(modeKey[value]) }))} />
    <SearchField label={t("records.search")} clearLabel={t("common.clearSearch")} value={query} onValueChange={setQuery} />
    <Text role="status">{t("records.count", { count: results.length })}</Text>
    {results.map((record) => (
      <Surface key={record.id} padding="lg">
        <Stack gap={mode === "list" ? "sm" : "lg"}>
          <Text tone="muted" variant="caption">{record.category}</Text>
          <Heading level={mode === "reading" ? "level4" : "level5"} semanticLevel={2}>{record.title}</Heading>
          {mode !== "list" ? <Text>{record.body}</Text> : null}
          <Stack axis="inline" wrap gap="sm">
            <Button tone="secondary" onClick={() => openRecord(record.id)}>{t("records.read", { title: record.title })}</Button>
            <Button tone="secondary" selected={savedIds.includes(record.id)} onClick={() => toggleSaved(record.id)}>{t("records.save")}</Button>
          </Stack>
        </Stack>
      </Surface>
    ))}
    {results.length === 0 ? <EmptyState density="compact" title={t("records.empty")}
      action={<Button tone="secondary" onClick={() => setQuery("")}>{t("records.resetSearch")}</Button>} /> : null}
  </Stack>
</ScreenLayout>
```

```tsx
// Native
import { Button } from "@hjmds/react-native/actions";
import { EmptyState } from "@hjmds/react-native/feedback";
import { Heading } from "@hjmds/react-native/heading";
import { SearchField, SegmentedControl } from "@hjmds/react-native/inputs";
import { Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { ScreenLayout } from "@hjmds/react-native/screens";

const modeKey = { list: "records.mode.list", reading: "records.mode.reading", image: "records.mode.image" } as const;
type Mode = keyof typeof modeKey;

<ScreenLayout
  title={t("records.compare.title")}
  description={t("records.compare.intro")}
  stateAction={error && !hasLoaded ? retryAction : null}
  notice={hasLoaded && error ? refreshNotice : null}
  state={loading && !hasLoaded ? { kind: "loading", title: t("records.loading") }
    : error && !hasLoaded ? { kind: "error", title: t("records.error") } : { kind: "ready" }}
>
  <Stack gap="xl">
    <SegmentedControl label={t("records.mode.label")} value={mode} onValueChange={setMode}
      items={(Object.keys(modeKey) as Mode[]).map((value) => ({ value, label: t(modeKey[value]) }))} />
    <SearchField label={t("records.search")} clearLabel={t("common.clearSearch")} busyLabel={t("common.searching")} value={query} onValueChange={setQuery} />
    <Text accessibilityRole="text" accessibilityLiveRegion="polite">{t("records.count", { count: results.length })}</Text>
    {results.map((record) => (
      <Surface key={record.id} padding="lg">
        <Stack gap={mode === "list" ? "sm" : "lg"}>
          <Text tone="muted" variant="caption">{record.category}</Text>
          <Heading level={mode === "reading" ? "level4" : "level5"}>{record.title}</Heading>
          {mode !== "list" ? <Text>{record.body}</Text> : null}
          <Stack axis="inline" wrap gap="sm">
            <Button tone="secondary" onPress={() => openRecord(record.id)}>{t("records.read", { title: record.title })}</Button>
            <Button tone="secondary" selected={savedIds.includes(record.id)} onPress={() => toggleSaved(record.id)}>{t("records.save")}</Button>
          </Stack>
        </Stack>
      </Surface>
    ))}
    {results.length === 0 ? <EmptyState density="compact" announcement="polite" title={t("records.empty")}
      action={<Button tone="secondary" onPress={() => setQuery("")}>{t("records.resetSearch")}</Button>} /> : null}
  </Stack>
</ScreenLayout>
```

기록·검색·저장은 제품 상태다. 표현 전환은 같은 `results`를 다시 그리기만 하고 검색어·저장 상태를 초기화하지 않는다. 콜백·데이터·지역화 함수는 제품에서 공급한다. Web·Native import와 필수 props는 위 API 지침에서 확인한다.

## 다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 다크 | semantic 색으로 내용과 표면을 함께 전환; 예제 브랜드 색을 제품 기본값으로 복사하지 않음 |
| 좁은 폭 | 320px부터 한 열로 읽기 순서 유지. 가상화 본문은 scroll=content, 중첩 스크롤 금지 |
| 키보드 | Native host가 safe area와 키보드를 한 번 처리; Web은 포커스된 입력과 footer 가림 확인 |

## 함정

- 데모 저장은 메모리에서만 유지; 표현 전환은 검색·저장 상태를 초기화하지 않음.
- 결과 개수 문구는 Web `Text role="status"`, Native는 iOS 알림을 포함한 공개 `StatusText`으로 둔다. Native `accessibilityLiveRegion`만으로는 iOS에서 읽히지 않는다.
- Storybook은 실제 서버·OS 권한·라우터 연동 증거가 아니다. 기본·다크와 실패/복구를 각각 확인한다.

### 검색 복구와 상세 복귀

Web 예제의 검색 초기화는 사라질 빈 상태 버튼에서 기존 검색 입력으로 초점을 옮긴다. 보기 방식과 저장 목록은 그대로 유지한다. 상세를 닫으면 열었던 읽기 행동으로 돌아간다. Safari 포인터 클릭은 버튼을 focus하지 않을 수 있어 실제 클릭의 `event.currentTarget`을 Sheet `returnFocusRef`에 기록한다. Native 예제는 열 때의 host ref를 고정해 상세 안의 완료 행동이 복귀 대상을 덮지 않게 한다. host ref 검사는 실제 OS 접근성 초점 검증과 구분한다.
