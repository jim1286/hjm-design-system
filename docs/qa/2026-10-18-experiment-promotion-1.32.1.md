# HJM 1.32.1 실험 승격·게시·소비 적용

2026-10-18 사용자 요청: “승격하고 릴리즈 해줘”, “릴리즈 되면 전수 적용해”.

## 결과와 범위

잔여 실험 4개(대화 목록, 대화 날짜 구분, 입력 중 표시, 페이지 위치 표시)를 Web·Native 함께
`배포/`로 옮겼다. 기존 story ID·API·동작과 beta 성숙도는 유지했다. 공개 Storybook index의 실험 항목은 0개다.
세 npm 패키지는 1.32.1 fixed patch로 게시했다. 소비 앱·웹 8개와 정책 사이트 생성용 Release Hub의
모든 HJM dependency 22개가 manifest·실제 node_modules에서 1.32.1인 것을 대조했다.
8개 앱의 계약·release record·catalog snapshot도 같은 train/source를 가리킨다.

## 릴리스와 공개 산출물

- source/tag commit: `5cd86e192ebdd524fdbb6a08c1bb5bb8231ab1fa`, `v1.32.1` peeled SHA 일치.
- [npm 게시 run 39106194952](https://github.com/jim1286/hjm-design-system/actions/runs/39106194952): build·publish·tag success.
- [Storybook run 39106185527](https://github.com/jim1286/hjm-design-system/actions/runs/39106185527): build·Pages 이동 안내 success.
- artifact ID `12128855666`, `hjm-storybook-5cd86e192ebdd524fdbb6a08c1bb5bb8231ab1fa`.
- Actions artifact digest: `sha256:b110567ba26218fe661d4f457da2fbd4de977fe1579540e35fecb94a4150d716`.
- manifest SHA-256: `8721000e1c6df5d0403d2c0a2924423c1630c4f4cc3d072c4ae2352608196a8f`.
- delivery archive SHA-256: `3add52262a3714b0233b97d2ebbabcdc514c1786531579ae39a2b556de939e50`.
- VPS current: `/srv/hjm-storybook/releases/5cd86e192ebdd524fdbb6a08c1bb5bb8231ab1fa-8721000e1c6d`.
  직전 정상 release `f73174d666227b75c037d41ac73099241191d475-4ba7d0b25655`는 previous로 보존했다.
- [공개 Storybook](https://storybook.jmstudioapps.com/): loopback·HTTPS 각각 638개 파일 hash/cache와 4개 미등록 경로 404 통과.
  네 항목의 공개 index 경로가 모두 `배포/`임을 확인했고, 브라우저에서 PageIndicator 기본 미리보기를 확인했다.
- 중앙 `sync-design-system.mjs`가 세 실제 tarball의 SHA-512 integrity, package 버전, tag 소스 manifest,
  catalog·consumer-policy를 검증했다. 중앙 import 후 dry-run updates 0.
  최초 npm 조회의 404/캐시 지연 관측을 재게시 근거로 쓰지 않았고, 새 메타데이터 조회 후 설치했다.

## 소비 검사와 메시지 UI 대조

| 대상 | 확인 |
| --- | --- |
| 번뚝 Web·앱 | 양쪽 타입 검사, Web DM 기존 테스트 31건 통과. `ChatScreen`·`ChatMessage`·`MessageComposer`·`TypingIndicator`, 대화 목록의 `ConversationRow`, 댓글의 `CommentThreadRow` 채택 대조. 개별 배치하던 읽음 글자를 양쪽 `ChatMessage.deliveryLabel`로 연결했다. 최신 발신 메시지·readAt 조건을 유지한다. |
| Utilverse 앱 | 타입 검사 통과. 대화의 `ChatDateSeparator`·`ChatScreen`·`ChatMessage`, 댓글의 `CommentThreadScreen`·`MessageComposer`, 홈 페이저 `PageIndicator` 채택 대조. 입력 중 기능을 새로 만들지 않았다. |
| 스핀트 앱 | 타입 검사 통과. 댓글 `CommentThreadScreen`, 알림 `NotificationInboxScreen` 채택 대조. 별도 1:1 DM 제품이 아니다. |
| 다에리 Web·앱 | 양쪽 타입 검사 통과. 편지는 제품 도메인 UI이며 기존 HJM 화면 구조 안에 남긴다. 채팅 타임라인·typing·대화 목록을 추가하지 않았다. |
| 오늘야구·선택의창·Unairplane 앱 | 각 타입 검사 통과. 채팅·DM이 없어 이번 메시지용 API를 억지로 추가하지 않았다. |
| Portfolio Site | 타입 검사 통과. 메시지 UI 비적용. |
| Release Hub | 타입 검사, 기존 정책 정적 출력 테스트 3건 통과. HJM contracts를 쓰는 정책 생성 경계 확인. |

전체 consumer frozen 설치 통과. Utilverse 검사에는 지정된 Node 24.21.0, 나머지 타입 검사에는 Node 24.20.0을 썼다.
초기 번뚝·다에리 설치는 Node 26에서 engine 경고를 냈으며 이후 검사는 지정 Node로 실행했다.
게시물은 mac-ci에서 생성·빌드·artifact 확인 후 GitHub hosted workflow로 게시했다.

승격 관련 사용 지침 6개 검사는 통과했다. 별도로 실행한 Storybook 정적 감사는 기존 CommonChat Group 순서
Web·Native 2건과 Web 전용 단축키 기록 분류 1건을 보고했다. 이번 변경은 해당 파일을 바꾸지 않았으며
감사 실패를 통과로 기록하지 않는다. 전체 회귀·ExploreQA·소비 앱 실기기 QA는 실행하지 않았다.

소스/설치·타입 검증이 제품 운영 적용·스토어 공개를 뜻하지 않는다. 앱 버전 상승·스토어 빌드·제출·제품 운영 배포는 실행하지 않았다.
이번 확인은 소비 버전과 위 메시지 사용처의 연결 범위이며 모든 화면·모든 상태의 시각 검증 완료를 뜻하지 않는다.

## main 적용 commit

모든 아래 commit은 각 origin/main과 일치를 확인했다. 기존 다른 세션의 서버·정책·마케팅 변경은 stage하지 않았다.

| 저장소 | commit |
| --- | --- |
| `apps/burntok` | `f45ceec63b977056f70cab9b9db48a448605e24f` |
| `apps/choose-window` | `3c3a05dcfc4c2b0b4376eab5e3f36251d1ab6b3b` |
| `apps/portfolio-site` | `88bff06302a790a6ea5aaeb4441ebbdf4765f3fe` |
| `apps/unairplane` | `851c8540ffe02e4f1b29e9db6abe04bb5d79e424` |
| `apps/yajalal` | `2f81519ec495f8b0f9a5a54d6481279a4de9a7ed` |
| `apps/spint` | `27a0a39d3a5a6c71a77017358d19e32186cecc72` |
| `apps/diairy` | `9e45479012b19f9c23e13b384c533052b8c7937b` |
| `apps/utilverse` | `4f2caca68a88b8cbc13c062aa1295d2f0b5c1733` |
| `.` | `726a7c8a184309ee6bac05f1a3b5e519383487b7` |
| `control-plane/app-release-hub` | `0fe36007ef051ad1600e9daa2c7341113ee4e9c6` |

## 정리

이번 작업의 임시 artifact·대조 목록·commit 목록은 결과를 이 문서에 보존한 뒤 제거한다.
작업용 branch·worktree·clone은 만들지 않았다. 운영 current/previous와 CI artifact·npm tarball은 복구 원본으로 보존한다.
기존 공유 Metro·개발 서버는 재시작하지 않았고, 이번 세션의 작업 등록만 해제한다.
