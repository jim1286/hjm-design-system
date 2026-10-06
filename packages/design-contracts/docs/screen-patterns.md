# 반복 화면 조합

검토일: 2026-10-06 · 상태: Storybook 배포(2026-10-06 사용자 승인) · 패키지 게시/제품 적용 전

사용자가 로그인·설정·알림·채팅 화면을 미리 일반화해 개발 생산성을 높이도록 요청했다.
기존 AuthScreenLayout, Section, ListRow, TopBar, Layout, EmptyState, action-session,
NotificationBell과 두 renderer의 exports를 비교했다. 새 primitive catalog를 늘리는 대신
`@hjmds/react/screens`, `@hjmds/react-native/screens`의 supplemental 화면 조합으로 제공한다.

## 현재 제품에서 확인한 반복과 차이

| 근거 파일(app-portfolio 기준) | 반복 구조 | 제품에 남기는 것 |
| --- | --- | --- |
| apps/burntok/apps/mobile/src/app/login.tsx | AuthScreenLayout의 hero/main/footer | OAuth, 제공자 자산, 심사자 폼 조건 |
| apps/diairy/apps/mobile/src/features/settings/SettingsScreen.tsx | 제목, 카드 그룹, 계정 행동 | CozySky, 섹션 이동, 계정 병합·탈퇴 |
| apps/spint/apps/mobile/src/features/settings/SettingsScreen.tsx | 프로필, 언어, 알림, 도움말, 계정 그룹 | 닉네임 변경 제한, 재인증, 서버 저장 |
| apps/burntok/apps/web/src/app/notifications/page.tsx | 헤더, 필터/도구, 상태, 알림 목록 | focus 복구, 읽음 확인, 라우팅 |
| apps/utilverse/apps/mobile/src/features/NotificationInboxScreen.tsx | 필터, 알림, 더 보기, 읽음 상태 | 계정 scope, 요청 취소, 페이지 합치기 |
| apps/utilverse/apps/mobile/src/features/ConversationScreen.tsx | 헤더, 타임라인, 작성창 | 채널 권한, 도구 카드, 답글, 전송 영수증 |

Flutter 앱에는 React 컴포넌트를 주입할 수 없다. 화면 역할과 상태 계약을 참조할 수 있지만
별도 Dart renderer가 생기기 전에는 적용된 것으로 간주하지 않는다.

## 선택 기준과 소유권

- 로그인: 기존 `auth-screen`의 `AuthScreenLayout` + `AuthProviderButton`을 그대로 쓴다.
  새 LoginScreen alias나 제공자 preset은 만들지 않는다. 카드 유지·중앙 로딩·정책 고지는
  [로그인 계약](auth-screen.md)을 따른다.
- `ScreenLayout`: 제목, 뒤로 가기 슬롯, 도구, 안내, 본문, 하단 행동을 하나의 화면으로 배치한다.
  `Layout`은 앱 전체 navigation/sidebar를, `TopBar`는 개별 상단 UI를 소유한다. 화면 전체의
  남는 높이와 상태 교체는 이 조합이 소유하므로 앱 shell과 중복되지 않는다.
- `SettingsScreen`: `profile`과 안정적인 id를 가진 `sections`를 받는다. 각 섹션은 기존
  `Section`을 사용한다. 내부에는 ListRow·Switch·Select·TextField를 그대로 합성한다.
  저장 방식·낙관적 갱신·실패 복구·탈퇴 확인은 [action-session](action-session.md)과 제품이 소유한다.
- `NotificationInboxScreen`: 필터는 상태가 바뀌어도 유지하고 본문만 교체한다. `NotificationItem`은
  기존 ListRow에 지역화한 읽음 상태와 시각을 조합한다. href/onClick(Web), onPress(Native)를
  그대로 사용하며 표시·탭·스크롤 자체가 읽음 처리를 실행하지 않는다.
- `ChatMessage`: 발신/수신 정렬, 작성자, 아바타, 답장 인용, 전송 상태와 시각을 합성한다.
  기존 Asset/VoiceNote 등은 children에 넣고 영수증·반응·재시도는 제품이 넘긴다. 전체 타임라인을
  live region으로 만들지 않으므로 과거 메시지 로딩 때 읽기 순서를 가로채지 않는다.
- `MessageComposer`: 기존 TextArea와 Button을 조합한다. 빈 입력·pending·disabled에서는
  전송하지 않고 Enter는 줄 바꿈으로 유지한다(IME 조합과 충돌 방지). 제품 onSend에 원문을
  전달하며 초안 초기화는 서버 영수증을 받은 제품만 수행한다. 1~5줄은 짧은 작성창이 타임라인을
  밀어내지 않도록 정한 기본값이며 더 긴 입력은 TextArea 안에서 스크롤한다.
- `ChatScreen`: `composer`와 타임라인을 분리한다. 기본 `scroll="content"`로 FlatList 등
  제품 타임라인의 가상화·이전 메시지 위치·새 메시지 배지를 보존한다. 작은 예제만
  `scroll="screen"`을 쓴다. 새 채팅 데이터 모델이나 전송 엔진은 만들지 않는다.

모든 문구·접근성 이름·상대시간·날짜는 제품 i18n에서 전달한다. 문자열을 renderer에서
번역하거나 정해진 메뉴·제공자·정책 URL을 번들하지 않는다. 새 직접 의존성은 없다.

## 상태, 키보드, 접근성

`state`는 `ready | loading | empty | error | restricted`의 구별된 union이다. ready 외에는
비어 있지 않은 지역화 title이 필요하다. 2026-10-06 전체 로딩 재점검에서 화면 골격에 문구가 남아 있는 것을 발견해, loading은 공통 Spinner만 표시하고 title·description은 접근성 이름으로 전달하도록 맞췄다. `stateAction`에는 retry/login 등 실제 제품 행동을 넣는다.
본문 전체 상태는 헤더와 footer를 제외한 남은 영역 가운데에 놓고, 긴 내용은 스크롤한다.
새로고침 실패와 저장 오류는 `ready` + `notice`로 전달한다. 초기 로딩으로 바꾸면 본문이
unmount되므로 입력 초안을 보존해야 하는 갱신에는 사용하지 않는다.

Web은 제목이 연결된 main을 만든다. 이미 main인 제품 shell 안에서는 `as="section"`을 쓴다.
error는 alert, 그 밖의 초기 상태는 status다. 행동은 live region 바깥에 두어 안내 재방송이
버튼 탐색을 방해하지 않게 한다. Native는 header와 accessibilityLiveRegion을 사용한다.
읽음 상태는 색이나 글자 굵기뿐 아니라 statusLabel로도 제공한다.

Web host는 실제 남은 높이를 제공해야 한다(예: flex route의 `height:100%`, shell 없는 예제는
`height:100dvh`). Native host는 safe area와 탭/상단 navigation inset을 먼저 제외한다.
HJM이 기종별 높이나 중첩 safe area를 추측하지 않는다. Native ChatScreen은 기존
`KeyboardAvoiding` 또는 제품 keyboard adapter 하나로 감싸며 둘을 동시에 적용하지 않는다.
ready 이외의 채팅에는 작성창을 숨겨 접근 제한·초기 로딩에서 전송 조작이 노출되지 않게 한다.

## 사용 예시

```tsx
import { SettingsScreen } from '@hjmds/react/screens';

<SettingsScreen title={t('settings.title')} sections={[
  { id: 'preferences', title: t('settings.preferences'), children: <Preferences /> },
  { id: 'account', title: t('settings.account'), children: <AccountActions /> },
]} />
```

Native는 import를 `@hjmds/react-native/screens`로 바꾼다. 기존 제품 wrapper 내부를 교체할 때
라우트·query·mutation·계정 scope·초안·키보드·스크롤 복구는 유지한다. 배포된 exact npm train을
받기 전 제품의 dependency나 lockfile을 로컬 source로 우회하지 않는다. 이 additive API는
기존 앱 코드를 자동 변경하지 않는다.

## 검증 범위

계약 검증, Web 브라우저 행동/배치, Native host mock, 두 Storybook은 각각 다른 근거다.
실제 기기 키보드·스크린리더·제품 화면 적용은 별도 확인이 필요하다. 공통 화면 예제는
2026-10-06 사용자 승인으로 `실험/화면/공통 화면`에서 `배포/화면/<분류>/<항목>`(소개·계정·설정·검색·콘텐츠·소통·화면 틀과 도구)으로 옮겼다.
새 화면 스토리는 `실험/화면/<분류>/<항목>`에 최종 이름으로 두고 검토하며, 스토리북 배포 분류 승인은 구현 완료·npm 게시와 별개다.
진행 및 미검증 항목은 [구현 기록](../../../docs/plans/reusable-screens-2026-10-05.md)을 따른다.

## 시각 설계 근거

첫 시안의 빈약한 화면에 대한 사용자 피드백 후 [제품 비교 조사](../../../docs/plans/screen-reference-study-2026-10-05.md)를
추가했다. 실제 앱 캡처 3종, 현재 제품 소스, 외부 13개 제품/시스템의 공개 근거를 구분했다.
설정의 그룹과 현재값, 알림의 사람/활동/시간 위계, 채팅의 양방향 정렬과 짧은 작성창을 반영한다.
개발용 상태 버튼은 기본 UI에 두지 않고 Storybook의 상태 story 및 복구 예제에서 제공한다.

## 설정 화면 시각 구성 (2026-10-05 개편)

사용자가 회색 배경을 금지했으므로 설정 그룹은 채워진 카드 대신 투명 배경·구분선·여백으로 구획한다.
프로필, 화면과 언어, 알림과 소리, 계정과 도움말 순으로 구성한다. 선택 값은 행 설명에 두어
큰 글자에서 제목과 가로 폭을 경쟁하지 않게 한다. 테마·언어는 세로 선택 시트, 프로필은
저장/닫기가 가능한 입력 시트를 쓴다. 테마는 예제 provider에 즉시 반영하고 계정 저장은 제품이 소유한다.

## 기본 화면 조합 확장

댓글·검색·프로필은 아래 `screen-flows` 공개 조합을 소비하는 Web/Native 화면 예제로 제공한다.
저장 목록은 기존 `ScreenLayout` 조합 예제를 유지한다. 댓글은 reply context와 composer를 사용하며 서버 전송/권한은
제품 소유다. 검색은 로컬 fixture이고, 저장 해제는 되돌릴 수 있으며 프로필 수정은 저장 전까지
별도 초안이다. 각 화면은 기본·다크·큰 글자·로딩·빈 상태·오류·제한 상태를 제공한다.

알림은 번뚝의 날짜 구획과 판 없는 활동 행을 참고한다. 열람 즉시 서버 읽음 처리 정책까지
공통 컴포넌트로 옮기지 않는다. 알림 설정과 원문 진입은 소비 화면 callback이 소유한다.

채팅·댓글 입력창은 수동 resize를 제공하지 않고 1~5줄 범위에서 내용에 맞춰 커진다.
Web은 CSS content sizing, Native는 content-size event와 recipe line bounds를 사용한다.
최대 높이 뒤에는 내부 스크롤하며, 빈 초안은 다시 한 줄로 돌아온다. 한 줄 시작은 MessageComposer
내부 전용이다(Web `.hjm-message-composer__row`의 변수 재정의, Native 비공개 `hjmCompactMultiline`). 공개
TextArea의 명시적 `minVisibleLines`는 Web·Native 모두 일반 편집기의 80pt(`fieldRecipe.multilineMinHeight`)
하한을 유지한다. 2026-10-06 리뷰에서 이 하한을 한 줄 control 최솟값(44pt)으로 낮춘 미게시 변경이 기존
`minVisibleLines={2}` 필드를 80pt에서 64pt로 줄여 되돌렸다.

댓글 조합 예제는 부모 id로 답글을 묶고 펼침 상태를 별도로 유지한다. 답글 작성 시 대상과
취소 동작을 표시하며 전송 후 초안을 정리한다. 예제 검색은 300ms 디바운스로 마지막 입력만
갱신한다. 서버 검색의 요청 취소/응답 경합과 실제 댓글 전송 성공 판정은 제품 계층의 책임이다.


## 기본 흐름 공개 조합 (2026-10-05)

`@hjmds/react/screen-flows`와 `@hjmds/react-native/screen-flows`는 선택적 진입점이다.
루트 barrel에는 추가하지 않는다. 화면 전체의 반복되는 상태 연결을 재사용하되, 기존 Grid,
UploadItem, RadioGroup, AlertDialog, TextField와 ScreenLayout의 계약을 그대로 합성한다.
기존 컴포넌트는 개별 UI가 필요한 경우, 이 진입점은 화면 수준 흐름이 필요한 경우 선택한다.

| API | 제공하는 흐름 | 제품이 연결할 것 |
| --- | --- | --- |
| ListDetailScreen | 목록 유지, 상세 전환, 새로고침/추가 로딩 action | 데이터, 페이지 커서, 라우팅 |
| EditorScreen | 수정 중 닫기 확인, 저장 busy, 초안 안내 | 검증, 영속 초안, 저장, 라우터/OS 뒤로가기 guard |
| ProfileScreen | 요약, 수정 진입, 계정 action 슬롯 | 계정 정보, 인증, 탈퇴/로그아웃 |
| ModerationScreen | 사유 선택, 신고 활성 조건, 차단 확인 | 서버 신고/권한, 차단 mutation |
| MediaSelectionScreen | 썸네일 격자, 업로드 상태, 순서/삭제/재시도 | 실제 picker, 권한, 이미지 URI 수명, 업로드 |
| SearchScreen | 300ms debounce, 이전 요청 AbortSignal, 검색/필터 슬롯, 기본 입력의 확정 신호(`onSubmit`)·검색 중 표시(`searching`)·label 숨김, 한 줄 가로 스크롤 필터 줄, 두 단계 검색 단계(검색 전·입력 중·결과)와 확정 경로, 최근·추천 검색어·제안 배치, 결과 개수·정렬, 적용 필터 칩, 초안/적용 필터 시트, 0건 원인별 복구, 개수 낭독 | API, 제안·결과·개수 조회, 오류 문구, 필터 정의와 계산, 정렬 값, 최근 검색 저장소, 늦은 응답 무시 |
| PermissionScreen | prompt/denied/granted/unavailable에 맞는 action | OS 요청과 설정 이동, 앱 복귀 후 실제 권한 조회 |
| OnboardingScreen | 단계 범위 검증, 이전/다음/건너뛰기 | 선택 데이터와 완료 여부 저장 |
| CommentThreadScreen | 부모/답글, 펼침, 좋아요/답글, 작성창 | 실제 댓글/권한/전송과 성공 후 초안 정리 |

`MediaSelectionScreen.actionLabels`는 짧은 표시 문구이며 removeLabel/moveUpLabel/moveDownLabel은
각 사진 이름을 포함한 접근성 이름이다. 사진을 카드의 작은 leading 아이콘으로 줄이면 선택 내용을
확인하기 어려워 preview를 독립적인 큰 썸네일로 둔다. 격자는 compact 2열, expanded 3열이다.
SearchScreen은 검색창과 필터만 상단에 유지하며 최근 검색은 본문과 함께 스크롤한다.
필터 예제는 시트 내부 초안과 적용값을 분리해 취소하면 기존 결과를 유지한다.

### 소비 예시

```tsx
import { SearchScreen } from "@hjmds/react/screen-flows";

<SearchScreen
  title={t("search.title")}
  queryLabel={t("search.query")}
  query={query}
  onQueryChange={setQuery}
  onSearch={(value, { signal }) => {
    void searchApi(value, { signal }).then(result => {
      if (!signal.aborted) setResults(result);
    }).catch(error => {
      if (!signal.aborted) setError(error);
    });
  }}
  filters={<ProductFilters />}
>
  <ProductResults items={results} />
</SearchScreen>
```

Native는 import만 해당 renderer의 `screen-flows`로 바꾸고 플랫폼별 자식/host를 제공한다.
React Query 등을 쓰는 제품은 이 화면의 callback을 기존 제품 query 상태와 연결하며 별도 캐시를 만들지 않는다.
필터 변경은 debounce query 변경과 독립적이므로 제품 query key에 필터도 포함한다.
예제 미디어는 로컬 샘플 사진과 모의 업로드이며 기기 갤러리·네트워크 업로드를 실행하지 않는다.
예제 권한은 상태 분기만 보여 주며 실제 OS 권한을 바꾸지 않는다.


### 사진 라이브러리와 선택 이후의 구분

2026-10-05 사용자가 파일 관리 카드처럼 보이는 사진 선택 화면의 재개편을 요청했다.
[Android Photo Picker의 실제 화면](https://developer.android.com/training/data-storage/shared/photo-picker)을
확인해 조밀한 3열 격자, 사진 위 선택 표시, 고정된 하단 완료 영역을 실험 예제에 적용했다.
선택 순서 숫자는 Apple Photos picker의 ordered selection 개념도 참고했다.
회색 카드 면은 사용하지 않는다. 원본 UI의 브랜드 자산이나 구현 코드를 복사하지 않는다.

`MediaSelectionScreen.library`는 제품이 공급하는 사진 라이브러리/virtualized picker 슬롯이며,
지정하면 선택 이후의 UploadItem 목록 대신 이 슬롯을 표시한다. `selectionSummary`는 하단의
선택한 사진·개수·오류 안내 슬롯이다. 기존 props는 호환되며, library를 생략하면 업로드 검토
흐름을 계속 쓸 수 있다. 실제 OS picker는 제품 host에서 실행해야 한다.
실험은 12개 로컬 사진의 선택/해제/순번/5장 상한/앨범 필터/실패 복구를 모델링한다.
검색 예제의 필터 행은 inline Stack의 center 정렬을 명시해 버튼과 정렬 요약의 다른 높이를 맞춘다.

## 기본 화면의 레퍼런스 적용

사용자의 후속 요청으로 12개 기본 화면을 익숙한 제품 패턴으로 정리했다.
`EditorScreen.submitPlacement="header"`는 상단 저장을 지원하며 기본값은 footer로 호환된다.
`ModerationScreen.reasonPicker`는 단계형 사유 목록 슬롯이며 기존 선택 유효성 검사·차단 확인을 유지한다.
ScreenLayout은 작은 화면에서 back/title/action을 한 행에 두고 글자 확대 시에만 여유 있게 줄바꿈하도록
제목 폭을 recipe에서 조정한다. 참고 출처·공개 API 선택 근거·검증 범위는
[기본 화면 재구성 기록](../../../docs/plans/basic-screens-reference-refresh-2026-10-05.md)에 있다.

## DM 반응과 여러 사진 작성 (2026-10-05)

사용자가 제품에 구현한 DM 길게 누르기와 여러 사진 작성을 디자인 시스템에도 반영하도록 요청했다.
공개 API map의 `ChatMessage`, `MessageComposer`, `TextArea`, `ReactionPicker`를 비교한 뒤
새 입력기·이모지 컴포넌트 대신 기존 조합을 확장했다. 하단 상시 이모지 입력 행은 제공하지 않는다.

- `MessageComposer.sendIcon`을 주면 빈 입력에서는 `attachmentAction`을, 글이나 사진이 있으면
  전송 아이콘을 입력창 안에 표시한다. 생략하면 기존 텍스트 전송 버튼을 유지한다.
- `attachments`는 `{ id, preview, removeLabel }[]`, 삭제는 `onRemoveAttachment(id)`다.
  id는 비어 있지 않고 유일해야 하며 삭제 이름은 제품에서 번역한다. 여러 사진은 가로로 표시한다.
  사진만 있어도 전송 가능하고 pending/disabled일 때 전송·사진 선택·삭제를 잠근다.
- `onSend(value)`는 현재 문자열을 그대로 전달한다. 사진 목록은 제품의 controlled state에서 읽는다.
  성공 여부를 HJM이 알 수 없으므로 글과 사진을 자동 삭제하지 않는다. 제품이 서버 성공 후 정리한다.
- `ChatMessage.reactions`는 기존 `ReactionPickerProps`와 `closeLabel`을 받는다.
  450ms 길게 누르면 열리고 Web에서는 10px 이동·pointer cancel로 보류를 취소한다.
  키보드 Enter/Space·우클릭, Native 접근성 activate도 지원한다. 같은 반응 재선택은 null이다.
  집계 배지는 제품 데이터에 맞게 기존 `actions` 슬롯에서 표시한다.
- `ReactionPicker.layout="strip"`은 줄바꿈 대신 가로 스크롤한다. 기본 `wrap`은 유지한다.
  Native 메시지 자식은 메뉴에서 미리보기로도 렌더링되므로 표시용 콘텐츠로 제공한다.

Web의 Escape/외부 클릭/포커스 복귀는 기존 Popover 계약을 따른다. Native는 Modal의 뒤로가기·
외부 누르기·닫기 버튼을 사용한다. iOS는 닫힘 완료, Android는 modal 제거 후 접근성 포커스를 복귀한다.
기기 사진 권한, 최대 첨부 수, URI 수명, 업로드, 반응 API·권한·낙관적 업데이트는 제품 소유다.
실험 스토리는 로컬 사진만 쓰며 실제 갤러리나 서버에 접근하지 않는다.

이 API는 현재 소스·스토리 단계다(스토리는 2026-10-06 스토리북 배포, 패키지는 미게시). Utilverse·BurnTok의 1.12.1 설치본을 이 소스와 동일하다고
보지 않는다. 공식 패키지 게시 후 중앙 `sync-design-system.mjs` 계획 검토·release record 갱신,
제품 dependency/lock/contract 갱신과 각 표면 회귀 검증을 거쳐 소비 코드를 교체한다.
로컬 file 의존성으로 게시 절차를 우회하지 않는다.

번들 측정에서 Web screens는 기존 기록 9모듈/62.2kB raw/14.2kB gzip에서
13모듈/97.7kB/22.3kB로 늘었다. 반응 helper·ReactionPicker·Popover·portal을 합성한 비용이다.
포커스/충돌 처리를 재구현하는 대신 해당 선택 진입점의 구조 기준을 갱신했다.
Native는 13모듈/160.0kB/32.2kB이며 바이트 기준은 유지한다. 선택 peer·루트 barrel 유입은 없다.
이 수치는 import graph 측정이며 실기기 프레임·터치 반응 성능을 의미하지 않는다.

### 추가 이모지와 메시지 답장

2026-10-05 후속 요청으로 `ReactionPicker.more={label, options}`를 추가했다. ＋ 버튼은 전체 전달
목록을 펼치며 선택하면 접힌다. `options`와 `more.options`의 id는 합쳐서 유일해야 한다.
빠른 목록에 없는 반응도 선택값으로 유지/해제할 수 있다. 이모지 목록과 지역화 이름은 제품이
공급한다. 실험에는 5개 빠른 반응과 32개 추가 예제가 있으며 Unicode 전체를 번들한 것은 아니다.

기존 `SwipeActions`는 행 작업을 펼치는 컴포넌트이며 Native optional gesture peer를 요구한다.
채팅 답장은 손을 놓을 때 바로 대상을 지정하는 다른 동작이어서 core `ChatMessage.replyAction`
(label/onPress/disabled)으로 제공한다. Web pointer, Native PanResponder는 공통 `isReplySwipe`의
60px·세로 이동 대비 2배 이상 조건을 사용한다. 세로 스크롤·취소에는 답장하지 않는다. 사용자 지시에 따라 눈에 보이는 답장 버튼은 두지 않는다.
키보드는 메시지에 포커스 후 Alt+좌/우 방향키, Native 접근성은 메시지의 답장 custom action을 쓴다.
애니메이션 없는 직접 이동 피드백이며 일반 터치에서는 좌우 스와이프로만 답장을 시작한다.

`MessageComposer.replyTo`는 author/excerpt/cancelLabel/onCancel이며 취소는 제품 callback만
호출한다. 글·첨부·reply id를 서버에 보내고 성공 후 지우는 책임은 제품에 있다.
`ChatMessage.replyLink`(label/onPress)를 주면 기존 reply 슬롯을 반응 trigger 밖의 버튼으로
제공해 중첩 버튼을 피한다. 원문 id·페이지 추가 로딩·삭제된 메시지 안내·가상 목록의 scrollToIndex는
제품이 처리한다. 기본 Native scroll="screen"에서는 `scrollRef`를 사용할 수 있다.
실험은 모든 메시지가 로컬에 있는 작은 목록이며 인용 선택 시 원문 이동·잠깐 강조를 보여 준다.

### 사진 없는 댓글 입력

2026-10-05 사용자 요청으로 댓글 실험도 `MessageComposer`를 재사용한다. `sendIcon`만 전달하고
attachmentAction/attachments는 전달하지 않는다. 빈 입력에는 전송 아이콘이 없고 글을 입력하면
입력창 오른쪽 안에 나타난다. 높이는 DM과 동일하게 1~5줄로 자동 조절한다. 별도 댓글 전송 버튼을 없앴다.
`inputRef`는 기존 TextArea의 host ref를 전달해 댓글 답글 선택 후 포커스를 유지한다.
답글 대상 취소는 초안을 지우지 않으며, 댓글 목록의 답글 탐색 동작은 그대로다.

사용자가 첨부한 댓글 화면 사진이 코드 추정보다 우선한다. 댓글은 `sendPresentation="circle"`로
입력창 안의 primary 파란 원형 버튼에 흰색(onPrimary) ArrowUp 20px / strokeWidth 2를 표시한다.
댓글과 DM 실험 모두 이 표현을 사용한다. 기존 소비자의 호환성을 위해 sendPresentation 기본값은 inline을 유지한다.

Attachment previews mask only the photo; removal controls remain outside that rounded mask, aligned to the top and trailing edges. The close mark is fixed-size iconography rather than scalable body text.

When a product route already owns navigation and safe-area gutters, `header` preserves that navigation and `contentInset="none"` prevents double padding. Shared layout still owns screen states and the content/footer boundary.

MessageComposer exposes maxLength, sendDisabled, additionalContent and leadingAction for product validation and tool sharing. A disabled send leaves draft editing available; additionalContent activates tool-only sends without inserting fabricated text.

SearchScreen accepts a queryField slot for an existing accessible SearchField with clear/busy controls; its debounce and request cancellation remain shared.
2026-10-06 search redesign: optional `onSubmit` (Enter / keyboard search key on the default field, ignored with `queryField`, IME composition ignored on Web) separates typing from committing, and optional `filtersOverflow` (`wrap` default, `scroll`) keeps the filter chips on one edge-to-edge scrolling line so large text cannot grow the pinned area row by row. Both are additive; defaults keep the previous behavior. Layout and states: [usage/screens/common-search.md](usage/screens/common-search.md).

### SearchScreen 두 단계 검색

2026-10-06 사용자 위임 결정(권장안 채택): 검색 화면 개편의 상태·흐름이 Storybook 미리보기 코드에만 있어 소비 앱이
가져다 쓸 수 없었다(AGENTS.md "Storybook 예제만으로 제공 완료가 아니다"). 그래서 그 로직을 `SearchScreen`의 선택 prop으로
올렸다. 모두 추가이며, 새 prop을 주지 않으면 이전과 같은 DOM·동작이다. 설계 근거(참고 서비스 조사, 쟁점별 선택)는
같은 날의 검색 화면 개편 설계를 따른다. 요약은 다음과 같다.

| 결정 | 이유 | 버린 대안 |
| --- | --- | --- |
| `committedQuery`를 주면 두 단계 검색. 단계는 `resolveSearchScreenPhase(query, committedQuery)`가 정한다(공백 = 검색 전, 확정값과 다름 = 입력 중, 같음 = 결과, 앞뒤 공백 무시) | 참고 서비스 공통의 "입력 중 제안 → 확정 → 결과" 구분. 기존 한 단계 검색(`committedQuery` 없음)은 그대로 둔다 | 입력 즉시 결과만 지원(제안 단계가 없어 최근 검색 저장 시점이 없음) |
| 모든 확정(Enter·검색 키, "‘q’ 검색" 행, 제안, 최근 검색, 추천 검색어)은 `onSubmit` 하나로 간다. 값은 `resolveSearchCommit`으로 앞뒤 공백을 지우고 공백만이면 부르지 않는다. 고른 값이 입력과 다르면 먼저 `onQueryChange`를 부른다 | "확정한 검색만 최근 검색에 넣는다"를 API가 지킨다. debounce된 `onSearch`는 `onSubmit`에 닿지 않는다 | 행마다 다른 콜백(제품이 저장 규칙을 경로마다 다시 맞춤) |
| 입력 중에는 `filters`·필터 시트 trigger를 숨기고, 검색어 때문에 0건이면(`resolveSearchEmptyCause` = `query`) 레일을 숨긴다. 필터 때문에 0건이면 레일을 남기고 "모두 해제"를 EmptyState 행동으로 둔다 | 입력 중 고정 영역을 줄인다. 필터가 원인인데 레일을 숨기면 원인을 지울 길이 사라진다 | 참고 서비스처럼 0건이면 항상 숨김 |
| 필터 시트는 열 때 `value`를 초안으로 복사하고, 어떤 방식으로 닫혀도 초안을 버리며, 주 행동에서만 `onApply(draft)`. 주 행동 문구는 `count(draft)`로 실시간, 0이면 비활성. 초기화는 항상 같은 자리, 초안이 기본값이면 비활성 | 기존 `여러 조건 적용과 초기화` 규칙과 eBay·Baymard 권고("N개 결과 보기"). 위치 흔들림 방지 | 시트 안에서 즉시 적용(조합 필터는 결과가 계속 바뀜) |
| 시트 열림은 제품이 제어(`open`/`onOpenChange`). 섹션만 여는 패싯 칩은 제품이 자기 범위를 정하고 `open`을 켠다 | 필터 정의·범위는 제품 소유. HJM에 범위 개념을 넣으면 제품 필터 모델을 강제한다 | `scope` 문자열을 HJM이 소유 |
| 레일 첫 칩(`filterSheet.trigger`)은 HJM이 그리고 이름에 적용 개수를 넣는다(Web `aria-haspopup="dialog"`) | 적용 칩·모두 해제 뒤 포커스가 돌아갈 고정 대상이 필요하다 | 제품이 trigger를 그림(포커스 복귀 대상을 HJM이 모름) |
| Web: 적용 칩·최근 검색 행을 지우면 같은 자리 다음 항목, 없으면 trigger(최근 검색은 입력)로 포커스. 목록이 실제로 줄어든 뒤에 옮긴다(`resolveFocusAfterRemoval`). Native는 옮기지 않는다 | 지운 버튼이 사라져 포커스가 `<body>`로 떨어지는 것을 막는다. Native는 프로그램 포커스 이동이 화면을 다시 읽게 해 낭독 커서를 그대로 둔다 | 항상 입력으로 이동(칩 줄 탐색이 끊김) |
| 개수 낭독은 HJM: 입력 중 "제안 N개", 결과 개수, `searching`이면 `searchingLabel`. Web은 숨긴 `role="status"`, Native는 `announceForAccessibilityWithOptions(queue)`. 문구가 바뀔 때만 | 제품마다 live region을 다시 만들면 중복·누락 낭독이 생긴다 | 제품 소유 |
| `resultSummary.count === null`이면 결과 머리 개수 자리에 Skeleton, `children` 대신 로딩 행 4개(`searchScreenRecipe.loadingRows`). Web은 ListRow `loading`(행 높이 유지) | 결과가 도착할 때 목록이 뛰지 않는다 | spinner로 본문 교체(`state="loading"`, 입력·필터·이전 결과가 사라짐) |
| 정렬은 결과 머리 끝 Menu(single). 바꾸면 본문을 맨 위로 | Menu 지침이 정렬을 용도로 명시. 시트 안 정렬은 정렬 하나에 시트 왕복이 필요 | 필터 시트 안 정렬 |
| `queryLabelVisibility="hidden"`: 보이는 label을 빼고 `queryLabel`을 접근성 이름(Web `aria-label`, Native `accessibilityLabel`)과 placeholder로 쓴다 | 참고 서비스 공통 모양. 1배 약 22, 2배 약 40만큼 고정 영역을 아낀다(2026-10-06 실측). placeholder가 검색 대상을 알린다(Apple HIG) | placeholder 없이 숨김(보이는 이름이 없는 입력) |
| `searching`+`searchingLabel`: Web `loading`, Native `busy`+`busyLabel`을 한 이름으로. 둘 다 주거나 둘 다 생략(타입) | 2026-10-06 utilverse 적용 조사: 진행 표시 하나 때문에 제품이 입력을 `queryField`로 통째로 바꿨다 | 플랫폼별 이름 그대로 노출 |

2026-10-06 릴리스 전 정리에서 Native `SearchField`도 `busy`인 동안 입력을 받게 했다(Web `loading`과 같다). 그 전에는 입력 변경을 무시해,
`searching`을 입력 중 제안 조회에 켜면 그동안 친 글자가 사라졌고 지침이 "확정 결과 요청에만"으로 제한했다. 진행 표시가 입력을
막을 이유가 없고(값을 저장하는 중이 아니라 결과를 불러오는 중) 두 플랫폼 동작이 달라 제품이 분기해야 했기 때문이다.
입력 잠금을 유지하고 지침으로 제한하는 안은 플랫폼 차이를 제품에 떠넘겨 버렸다([search-field 지침](usage/components/search-field.md) 플랫폼 차이).

Chat message reactions may supply a localized menuAction for product edit/history/report tools. Native invokes it after dismissing the reaction modal, preventing two iOS modal surfaces from competing. Reply remains gesture-only.

Comment rows support product-owned actions and an explicit likeAction slot (null omits the default button). This preserves emoji receipt/report/edit controls without nesting interactive buttons; canReply/replyDisabled carry product permissions. threadFooter owns cursor pagination. Native ScreenLayout accepts host refreshControl/keyboard scroll props.

## 댓글 본문 흐름 · 2026-10-05 실캡처 보정

Utilverse 실제 화면을 사용자 사진과 비교하자 이름·시각·본문을 각각 쌓고 반응 버튼을
아래에 배치해 댓글 한 개가 불필요하게 높아졌다. `CommentThreadItem.bodyText`를 전달하면
작성자와 본문을 하나의 줄 흐름으로 연결하고 `likeAction`은 오른쪽 끝에 유지한다.
`body`는 사진·숨김 안내 등 추가 콘텐츠용이다. 기존 rich body 소비자는 bodyText를
생략하면 기존 구조를 유지한다. Native는 nested Text, Web은 inline span으로 같은 의미를
구현한다. likeAction의 실제 저장·긴 누르기·이모지 선택은 제품 계약을 유지한다.

The 2026-10-05 device audit also found repeated metadata making message groups look separate. Hosts may send empty author/time strings within a group; both renderers omit those empty rows. Native state titles and descriptions center wrapped text so denied and empty views keep the shared alignment.

Photo albums and tool links set `ChatMessage.interactiveContent` so native accessibility keeps their child controls. A separate reaction target retains menu and reply actions. Web keeps the message as a keyboard-focusable group and ignores nested control presses, including Enter/Space on a nested link or button (only a key pressed on the bubble itself opens reactions; 2026-10-06 review). The visually hidden reaction popover header becomes visible while its Close action holds focus, so Shift+Tab never lands on an invisible target. The native reaction modal scrolls large previews while its Close control remains inside the safe area; the 2026-10-05 album capture exposed both issues.


## 사진 촬영과 앨범 선택 (2026-10-05)

`PhotoSourceSheet`는 `Sheet`와 `Button`의 보조 조합이며 `MediaSelectionScreen`이나
업로드 컴포넌트를 대체하지 않는다. 사용자 요청으로 사진 버튼 하나에서 앨범·촬영을 선택한다.
`labels`는 제품 지역화 문구이며 색은 현재 HJM provider/theme을 따른다.
`cameraAvailable=false`는 촬영 경로를 숨긴다. HJM은 Expo/브라우저 카메라 SDK를 의존하지 않는다.

Native는 시트가 실제 닫힌 뒤 `onSelect`를 호출한다. Web은 브라우저 사용자 활성화를 보존하기
위해 클릭 콜스택에서 호출한다. `onSelect`에서 Native는 카메라 권한을 요청한 뒤 촬영,
Web은 별도 `input[type=file][capture=environment]`를 클릭한다. 브라우저/기기가 capture를
지원하지 않으면 OS 파일 선택 화면으로 fallback할 수 있으며 실제 촬영을 보장하지 않는다.
앨범 input은 capture 없이 유지해 촬영 강제가 앨범 선택을 막지 않도록 한다.
취소·권한 거부·기기 부재는 기존 초안과 첨부를 보존한다. 권한 거부에는 앨범 대안을 안내한다.
사진 처리·EXIF 제거·크기/개수 제한·업로드·세션 수명은 제품 계약을 그대로 사용한다.
댓글처럼 사진을 허용하지 않는 입력에는 이 조합을 추가하지 않는다.


## 저장 컬렉션 화면

2026-10-06 사용자 요청으로 SavedItemsScreen을 실험 API(`./saved-items`)로 추가했다.
ListDetailScreen의 mount 유지·뒤로가기와 ScreenLayout 상태, Grid의 반응형 배치를 재사용한다.
일반 목록과 다른 컬렉션 표지 2열·게시물 3열·전체/컬렉션 해석이 공통 규격이므로 별도 화면 이름을 둔다.
`resolveSavedItems`는 Web·Native가 같은 소실 항목/삭제 컬렉션 정책을 사용하도록 contracts에 둔다.
저장소나 서버 요청을 포함하지 않으며 제품의 상태를 연결한다. [사용 지침](usage/components/saved-items-screen.md).

헤더 슬롯은 단계마다 소유자가 다르다. 컬렉션 홈에서는 HJM이 `actions`(새 컬렉션 버튼)를,
제품이 `leading`을 가진다. 컬렉션 안에서는 HJM이 `leading`(뒤로)을, 제품이 `actions`를 가진다.
그래서 홈에서는 제품 `actions`가 표시되지 않는다. `onBack`은 상세와 컬렉션 양쪽에서 호출되며
제품이 한 단계만 되돌린다(상세가 열려 있으면 `selectedItemId`, 아니면 `collectionId`를 비운다).
Web·Native가 같은 규칙이라 홈 actions 병합이나 콜백 분리는 양 플랫폼 API 결정으로 남긴다(2026-10-06 리뷰).

## 2026-10-06 Web 리뷰 보정

- ListDetailScreen은 처음부터 detail이 열린 채 mount(딥링크)되면 focus를 옮기지 않는다.
  목록→상세 사용자 전환에서만 뒤로 버튼으로 옮기고, 닫을 때 진입점으로 되돌린다.
- ReactionPicker는 카탈로그 전용 이모지를 고르면 접히면서 그 버튼이 사라지므로 focus를
  더보기(+) 버튼으로 옮긴다. 빠른 반응은 mount가 유지돼 focus도 그대로다. Popover 안에서는
  Popover가 trigger로 되돌린다.
- ReactionPicker 이모지 크기는 `layout="strip"`에서만 `--hjm-type-title-size`(Native strip의
  `Text variant="title"`과 같은 단계)로 키운다. 기본 `wrap`은 게시된 버튼 글자 크기를 유지한다.
- `./screens`, `./screen-flows`, `./saved-items`의 화면 루트는 ScreenLayout을 통해
  `layoutStyle`을 받는다(Native ScreenLayout과 같음). ListDetailScreen·SavedItemsScreen은
  목록·상세를 감싸는 바깥 host에 적용한다. PhotoSourceSheet는 portal Sheet라 제외한다.
