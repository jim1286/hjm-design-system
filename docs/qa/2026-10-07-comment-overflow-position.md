# 댓글 더보기 위치와 세로 점 아이콘 검증

- 작업일: 2026-10-07, 15:20–15:31 KST
- 요청: 하트 옆으로 더보기를 옮기고 점3개를 세로로, 디자인 시스템에도 동일하게 반영
- 판정: HJM source/두 renderer/두 Showcase와 번뚝 PR33 작업 버전에 반영. npm 게시·운영 배포·새 binary 없음.
- 범위: 공개 CommentThreadItem.actions를 본문 아래에서 하트 뒤 같은 inline 행으로 이동했다.
  spacing.xxs(4), flexShrink0, 기존 IconButton44px/semantic 색을 사용한다. likeAction=null과
  별도 콜백/권한/API 이름은 유지한다. 두 댓글 예제는 Menu/MoreVertical과 기존 controlled
  답글·좋아요 콜백을 연결했다. 자유 슬롯에 메뉴 항목/신고·삭제 권한을 공통으로 추정하지 않는다.
  body에 큰 내용을 넣는 기존 소비자는 actions에서 body로 옮기는 migration을 Changeset에 적었다.

## 코드와 재현

새 테스트 `packages/react/test/comment-overflow-evidence.browser.test.tsx`는 실제 public
CommentThreadScreen/InstagramCommentsPreview/Menu를 Chromium320×844에서 실행한다.
light·dark·textScale2의3조건에서 하트 오른쪽/같은 y/44px, 세로 glyph의3circle,
좋아요24→25, 더보기 열기만으로 반응 유지, Escape 닫기/트리거 focus 복귀,
메뉴 답글→seoyeon 대상/@seoyeon 초안/기존 좋아요 유지가 모두 통과했다.
9개 준비/메뉴/답글 상태를 한 장으로 모아 직접 확인했다. 2배 글자에서 제목·시각이
줄바꿈하고 일부 댓글은 화면 내부 scroll 아래에 있다. 숨겨진 하단 내용을 동시에
모두 보인 것으로 보고하지 않는다. 전체 AX/VoiceOver/실기기 큰 글자/Android는 미실행이다.

```sh
# packages/react
pnpm exec vitest run --config vitest.browser.config.ts test/screen-flows.browser.test.tsx test/comment-overflow-evidence.browser.test.tsx
# packages/react-native
pnpm exec vitest run test/screen-flows.test.tsx
```

Web screen-flows24/24에는 light/dark×LTR/RTL×textScale2/320폭의 같은 부모·논리 순서·
44px·Enter와 Tab 독립 콜백을 포함한다. Native25/25는 RN host mock이며 실제 레이아웃
검증을 대체하지 않는다. SSR composition-style102개, renderer 양쪽/Showcase 양쪽 type,
pnpm build(세 public packages), usage:sync/check, api-map:check(308이름), docs:check(577문서),
bundle:renderer:check가 terminal0이다. API export 추가/삭제와 Storybook 분류 이동은 없다.
크기 보고는 boundary 검사 output이며 제품 성능 개선 주장으로 확대하지 않는다.

중간 오류는 probe와 구분한다. 상대경로 새 테스트 append가 cwd 오류로 무실행한 첫 실행은
새 테스트 증거가 아니다. Native 최초24pass/1fail는 default likeIcon=null 때문에 기존
IconButton의 정상 계약 거절이었다. glyph를 공급한 final25pass다. 실제 예제 browser-a는
/tmp screenshot Vite fs access 거절로3fail, b는 Locator.press가 없는 Vitest API여서3fail였다.
repo내 임시 .cache와 userEvent.keyboard로 고친 c는3/3이며 제품 코드/보안 설정을 완화하지
않았다. React act/deprecated react-test-renderer 경고가 있으나 assertion 실패는 없다.

## 번뚝 반영과 독립 세션 경계

번뚝 해당 두 CommentsSheet는 다른 작업 세션 소유였다. root user AGENTS의 세션 조율에
따라 중복 수정을 피했고 그 세션은 같은 요구를 PR33 branch
codex/hjm-screen-adoption-20261007의 commit7e9d1a9972524fa93cfea491906e55e53fe651c0에 반영했다.
그 worktree의 clean HEAD와 두 source의 하트→MoreVertical 같은 행을 직접 확인했다.
main의 이전 CommentsSheet에는 이 branch의 HJM 채택/댓글 상태 이관을 부분 복사하지 않았다.
main 반영/PR merge·운영 배포는 별개이며 이번 작업에서 하지 않았다.

제품 세션의 실제 QA(`scratchpad/wt/hjm-adoption-20261007/burntok/docs/qa/2026-10-07-hjm-screen-adoption.md`, 포트폴리오 루트 기준)
15:10–15:27 기록을 직접 읽었다. ExpoGo57 iPhone17Pro/iOS26.5 Light/보통 글자에서
하트 x293–337와 더보기337–381 같은 y277–321, 메뉴 열기 DELETE0/삭제 선택 DELETE200와40→39,
답글 대상/좋아요1, 웹390×844 light/dark×root16/32px의4조건·44px/overflow0·본문168/108px,
Web24/24/양표면type을 확인한 범위다. 이는 해당 세션의 실행 증거이며 이 HJM source의 실제
Native 실행 증거로 확대하지 않는다. 이 root는 DeviceHub/기기/Metro/API 입력·재시작0이다.

## 산출물 식별

- `packages/react/src/screen-flows.tsx` SHA256 `49ae276dc43b6eb2074baf67434e2a0091f182377cd9c9e3a94b983f5a409af4`
- `packages/react-native/src/screen-flows.tsx` SHA256 `476c3a18946d8a0a75e88f70a6224b0e44b990328b32f657a4154004bc215a81`
- `showcase/web/src/patterns/instagram-comments-preview.tsx` SHA256 `84fda43ba4c40c7cfbb3b5e8f6c4f1f7c2efe0a1e647f710d85660aefc13540b`
- `showcase/native/src/instagram-comments-preview.tsx` SHA256 `94aaeffc9ea3b06ad2c0b7a00ff0c5ddaec4092049a4d575459ba8393808d717`
- 9상태 contact SHA256 `2ca3094b1408f0e8cccbf8f0929375a483f43e99037fcbca9c213c74cac17075`

사용 지침 두 개/규칙 문서와 .changeset/comment-overflow-adjacent-heart.md를 갱신했다.
제품 main merge/npm 게시/스토어/운영 배포/실제 HJM Native/성능은 미실행이다.

최종 `storybook:check`는 terminal0이다. 새 QA의 저장소 밖 링크를 재현 경로 표기로 고친 뒤 문서 링크를 재검사했다.

15:34 KST 원시 정리 전 inventory: 이번 작업 소유의 임시 캡처·로그·결과 41파일/924361bytes, 경로·크기·SHA256 원장 digest `9ee4e7651bf595002e3b21c5e5a9ef5e2baf5bda968afc8910849ed1bd6626e3`. 최종 결과·재현·한계·source/contact hash는 이 QA에 보존했다. 원시 출력만 제거하며 제품 소스·재사용 테스트·fixture·다른 세션 증거는 보존한다.
원시 정리 완료.

최종 React 타입 재검사는 terminal0이며 새 QA를 포함한 docs:check는578문서 통과다. 변경 경로의 diff whitespace 검사도 통과했다.
