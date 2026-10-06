# SavedItemsScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 계약](../../screen-patterns.md); 저장한 항목을 Instagram의 컬렉션 탐색 방식으로 바꾸라는 사용자 요청. 기존 ListDetailScreen·Grid를 합성하며 별도 저장 엔진은 만들지 않는다. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/콘텐츠/저장한 항목`

## 언제 쓰나

저장한 이미지·게시물을 컬렉션 표지 → 사진 격자 → 상세 순서로 탐색할 때 쓴다.
공통 규격은 컬렉션 2열과 게시물 3열, 뒤로가기, 빈 컬렉션이다. 저장·해제·Undo·권한·라우팅은 제품 상태를 콜백으로 연결한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 텍스트 중심의 즐겨찾기 목록 | ListDetailScreen + ListRow |
| 검색·조건 변경이 주 행동 | SearchScreen |
| 상품 구매·결제가 주 행동 | 제품 화면 + ScreenLayout |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `SavedItemsScreen` | 컬렉션·격자·상세 화면 | `@hjmds/react/saved-items` | `@hjmds/react-native/saved-items` |
| `SavedItem` · `SavedCollection` · `SavedItemsLabels` | 데이터·문구 타입 | 같은 subpath의 타입 | 같은 subpath의 타입 |

루트 barrel에는 추가하지 않는다. 전용 화면이 불필요한 앱에 화면 의존성을 강제하지 않기 위해 별도 진입점을 쓴다.

## 최소 사용 예

```tsx
// Web
import { SavedItemsScreen } from "@hjmds/react/saved-items";

<SavedItemsScreen title={t("saved.title")} items={items} collections={collections}
  {...(collectionId !== undefined ? {collectionId} : {})}
  selectedItemId={selectedItemId}
  labels={{allItems:t("saved.all"),privateNotice:t("saved.private"),back:t("common.back"),empty:t("saved.empty"),createCollection:t("saved.create")}}
  onOpenCollection={openCollection} onOpenItem={openItem} onBack={goBack}
  onCreateCollection={openCreateSheet}
  renderThumbnail={renderThumbnail} renderDetail={renderDetail}/>
```

```tsx
// Native — 저장 해제는 renderDetail 머리의 ghost IconButton
import { Image } from "react-native";
import { IconButton } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { SavedItemsScreen } from "@hjmds/react-native/saved-items";

<SavedItemsScreen title={t("saved.title")} items={items} collections={collections}
  {...(collectionId !== undefined ? { collectionId } : {})}
  selectedItemId={selectedItemId}
  labels={{ allItems: t("saved.all"), privateNotice: t("saved.private"), back: t("common.back"),
    empty: t("saved.empty"), createCollection: t("saved.create") }}
  onOpenCollection={openCollection} onOpenItem={openItem} onBack={goBack}
  onCreateCollection={openCreateSheet}
  renderThumbnail={(post) => <Image source={{ uri: post.imageUrl }} resizeMode="cover" style={{ width: "100%", height: "100%" }} />}
  renderDetail={(post) => <Stack gap="md">
    <Stack axis="inline" align="center" justify="between">
      <Text emphasis="strong">{post.title}</Text>
      <IconButton label={t("saved.unsave", { title: post.title })} tone="ghost" onPress={() => unsave(post.id)}>
        <BookmarkIcon />
      </IconButton>
    </Stack>
    <PostDetail post={post} />
  </Stack>} />
```

썸네일은 해당 플랫폼 이미지로 슬롯 전체 크기를 `cover`로 채운다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| items | `readonly {id,title,...}[]`, 필수 | — | 현재 저장된 항목. 해제된 항목은 이 배열에서 제거 |
| collections | `readonly {id,title,itemIds:readonly string[]}[]`, 필수 | — | 제품이 관리하는 컬렉션과 멤버십 |
| collectionId | `string` 또는 `null` | `undefined` | 생략하면 컬렉션 홈, `null`이면 모든 게시물, 문자열이면 해당 컬렉션 |
| selectedItemId | `string` 또는 `null`, 생략 시 상세 없음 | — | 현재 컬렉션에 존재하는 항목만 상세로 표시 |
| labels | SavedItemsLabels, 필수 | — | 모든 공개 문구를 지역화하여 공급 |
| onOpenCollection · onOpenItem · onCreateCollection | 콜백, 필수 | — | 제품 상태/라우터 변경 요청 |
| onBack | `() => void`, 필수 | — | 한 단계만 올라간다. 상세가 열려 있으면 제품이 `selectedItemId`를 비우고, 아니면 `collectionId`를 생략해 컬렉션 홈으로 간다. 화면은 제품 history를 모른다 |
| actions · leading | ScreenLayout 상속 | 없음 | 홈에서는 제품 `actions` 대신 컬렉션 만들기 버튼이 그 자리를 쓰고 제품 `leading`은 유지된다. 컬렉션·상세에서는 `leading`이 뒤로 버튼이 되고 제품 `actions`가 보인다 |
| renderThumbnail · renderDetail | `(item) => ReactNode`, 필수 | — | 사진·상세 슬롯, API·자산은 제품 소유 |
| state · notice | ScreenLayout 상속 | ready · 없음 | 조회 상태, 저장 해제/복구 안내 |
| layoutStyle | `HjmCompositionStyleProp` | 없음 | Web·Native 모두 목록·상세를 담는 ListDetailScreen 바깥 틀에 적용한다(컬렉션·격자·상세 전환과 상관없이 같은 루트). 미게시(1.12.1 이후) |
| className(Web) | `string` | 없음 | 안쪽 목록 ScreenLayout에 붙는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | host의 남은 높이 100%, ScreenLayout 폭(최대 720); 컬렉션 표지·게시물 썸네일 1:1, 표지 radius `radius.md` | `ListDetailScreen`, Web `.hjm-saved-*`, Native `saved-items.tsx` |
| 간격 | 화면 padding `spacing.md` 16; 개인 저장 안내–격자 `spacing.md` 16; 컬렉션 2열 간격 `spacing.md` 16; 표지 4장 사이·게시물 3열 간격 `spacing.xxs` 4; 표지–컬렉션 제목 `spacing.sm` 12 | `Stack gap="md"`, `Grid gap`, Web `.hjm-saved-collection`, Native `gap: spacing.sm` |
| 순서·정렬 | 홈: 헤더(제목 → 새 컬렉션) → 개인 저장 안내 → 모든 게시물 → 사용자 컬렉션; 컬렉션: 헤더(뒤로 → 컬렉션 제목) → 사진 격자 또는 빈 안내; 상세: 헤더(뒤로 → 항목 제목) → `renderDetail` | `SavedItemsScreen` 렌더 순서 |
| 고정·스크롤 | 헤더 고정, 본문 스크롤; 상세 동안 격자 mount 유지 | ListDetailScreen·ScreenLayout |
| 좁은 폭·큰 글자 | 좁은 폭(320 창, 본문 288)에서도 컬렉션 2열·사진 3열을 유지한다. 열 수는 사용 가능 폭이 컬렉션 176 미만(최소 열 폭 80), 사진 140 미만(최소 열 폭 44)일 때만 줄어든다; 컬렉션 제목은 줄바꿈; 사진 속 글자를 유일한 이름으로 쓰지 않는다(버튼 접근성 이름은 `title`) | `Grid minColumnWidth`, `grid.ts` 열 계산 |

### 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 새 컬렉션 | `Button` ghost(`labels.createCollection`) → `onCreateCollection` | 홈 헤더 `actions` 자리(홈에 넘긴 제품 `actions`는 그리지 않는다). 생성 Sheet와 그 footer 확정 버튼은 제품이 그린다 | 홈에서만 1개. 컬렉션·상세에서는 제품 `actions`로 바뀐다 |
| 뒤로 | `Button` ghost(`labels.back`) → `onBack` | 컬렉션·상세 헤더 `leading` | 1개. 상세 → 격자 → 홈으로 한 단계씩, 단계는 제품이 상태를 비워 정한다 |
| 컬렉션·게시물 열기 | 표지·썸네일 전체가 버튼 → `onOpenCollection` · `onOpenItem` | 격자 각 칸 | 항목마다 1개 |
| 저장 해제 | `IconButton` ghost(제품) | `renderDetail` 머리 줄 끝(제목과 같은 줄) | 상세마다 1개. 실행 취소는 `notice` |

## 꼭 지킬 것

- 컬렉션 홈으로 돌아갈 때 `collectionId` prop을 생략한다. `null`은 모든 게시물을 뜻한다.
- 저장 해제의 서버 실패/Undo는 앱이 관리한다. 예제의 메모리 저장을 서버 저장으로 주장하지 않는다.
- 항목·컬렉션 ID와 제목은 비지 않고 ID는 고유해야 한다. 삭제된 컬렉션은 홈으로 복귀하고 없는 멤버는 렌더에서 제외한다.
- 상세가 열리면 제목·뒤로·상세만 표시한다. 생성 시트의 확정 행동은 footer 한 곳에 둔다.
- 제품이 목록을 필터링하거나 정렬하여 공급한다. 사진 권한·서버 페이지네이션은 이 화면이 수행하지 않는다.

## 함정

- 홈 화면에 보여야 할 제품 행동을 `actions`로 넘기면 그려지지 않는다(홈에서는 컬렉션 만들기가 그 자리를 쓴다). Web·Native가 같은 규칙이라 바꾸려면 두 renderer의 API 결정이다.
- `onBack`에서 `collectionId`와 `selectedItemId`를 한꺼번에 비우면 상세에서 바로 홈으로 건너뛴다.

- 비공개 안내는 권한 구현이 아니다. 서버에서 소유자 접근을 검사한다.
- HTML/WebView나 Instagram 자산을 복사하는 구현이 아니다. 제품 사진·테마·문구를 슬롯으로 전달한다.
