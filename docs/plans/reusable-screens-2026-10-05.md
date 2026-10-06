# 반복 화면 공통화 구현 기록

2026-10-05 · 목표: 반복되는 로그인·설정·알림·채팅을 HJM의 재사용 가능한 화면 계층으로 설계·구현한다.

## 범위와 판단

계약은 [screen-patterns](../../packages/design-contracts/docs/screen-patterns.md)에 있다.
기존 로그인은 AuthScreenLayout을 재사용한다. 설정·알림함·채팅은 별도 opt-in subpath의
화면 조합이며 catalog primitive를 추가하지 않는다. 기존 action recovery 및 reference-flow
작업과 dirty 변경은 보존한다. 이번 변경에 npm 게시·전체 제품 migration은 포함하지 않는다.
사용자는 디자인시스템 설계·구현을 요청했으며, 앱별 채택은 게시된 train에서 별도 검증한다.

## 완료 확인 목록

- [x] 실제 앱의 반복 구조 조사 및 기존 API와 중복 검토
- [x] 상태·배치·스크롤·권한·제품 로직 경계 계약
- [x] Web/Native 화면 조합과 granular exports
- [x] 계약 기본 상태·전송 제어, Web 4개/Native 4개 행동 테스트(최신 시각 변경의 전체 회귀는 진행 중)
- [x] 양쪽 Storybook 개별 화면·라이트/다크·큰 글자·상태/복구 예제 등록
- [x] Web 전체 화면 시트와 상태·RTL·긴 문구 검토 (Native 실기기 범위는 아래 제한)
- [x] package build, API map, bundle, 문서, showcase 게이트
- [x] 제한 사항을 포함한 내부 구현 감사

기기 실행·npm 게시·소비 앱 migration·운영 배포는 이 목록의 내부 검증으로 주장하지 않는다.

## 사용자 보정 반영

첫 화면은 구조만 묶은 빈약한 UI라는 피드백을 받았다. [참고 조사](screen-reference-study-2026-10-05.md) 후
설정의 실제 항목 행, 알림 목록의 정보 위계, 양방향 메시지/인용, 한 줄 작성창을 추가했다.
초기 캡처는 승인이나 완료 근거가 아니다. 최신 화면 시트·상태·넓은 웹 및 Native 동작을 다시 검토한다.

## 최종 로컬 확인

- Node 24.20.0 `pnpm ci:check` 종료 코드 0. 로그 `/tmp/hjm-reusable-screens-ci-v4.log`.
- Contracts 928, Web SSR 181, Web browser 989, Native 936 테스트 통과.
  메시지 메타데이터 회귀 추가 후 해당 SSR 2개, 입력창 최종 수정 후 browser 4개 별도 통과.
- Native showcase 24, Web showcase 32 테스트 및 타입 검사 통과. Storybook 정적 빌드·탐색 검증 통과.
- Native Metro Android production JS bundle 58 families / 677 modules 통과. 기기 실행 증거는 아니다.
- Web/Native screens 번들 상한 통과. 기존 root/overlays/styles/top-bar/navigation 경보는 110% 허용 범위이며 상한을 늘리지 않았다.
- 414px 기본/다크/큰 글자 및 상태, 전송 실패, 1280px 데스크톱 총 34장 캡처. 브라우저 pageerror 0.
- 뒤로가기는 fixture의 홈으로, 알림 상세는 대화로 연결된다. 전송 실패 시 초안 보존을 확인했다.

## 범위와 남은 제품 검증

새 화면은 양쪽 Storybook의 **실험**에 있다. 승격·npm 게시·소비 앱 적용은 하지 않았다.
Native 기기 키보드/safe-area·실제 provider 인증·설정 영속화는 제품 host와 연결해 검증해야 한다.
설정 선택은 fixture 내부 상태이며 운영 계정·언어·테마 저장이 아니다. 프로필·도움말 상세는 슬롯 조합 예제다.
Web desktop은 읽기 폭 제한의 단일 화면이며, 대화 목록을 포함한 master-detail 라우팅은 제품 소유다.
근거 캡처는 [화면 시트](../qa/2026-10-05-reusable-screens.md),
[다크](../qa/2026-10-05-reusable-screens.md),
[큰 글자](../qa/2026-10-05-reusable-screens.md)에서 확인한다.

## 설정 페이지 후속 개편

사용자 요청에 따라 회색 카드 배경을 제거했다. 공통 SettingsScreen도 Web/Native 모두
투명 그룹과 구분선을 사용한다. 전용 예제는 프로필 수정·테마 즉시 반영·언어 선택·알림 스위치·
개인정보와 도움말 시트를 제공한다. 새 계정/복구 story의 채팅 전용 문구와 실패 버튼도 제거했다.

Web showcase 32 / Native showcase 24 검사 및 양쪽 타입 검사, Native screens 회귀 4개 통과.
브라우저에서 테마 선택 후 초점 복귀, 언어 선택, 프로필 저장, 큰 글자 도움말 접근을 확인했다.
Native 기기 검증은 하지 않았으며 공유 dist는 다른 세션의 번뚝 QA와 조율 중이다.

## 로그인 로고·알림·작성창·기본 화면 확장

- Google/Apple 정본을 private 포트폴리오 동기화 도구로 로컬 `.env.local`에 투사한다.
  공개 HJM 파일에는 상표 바이트를 넣지 않고 제품 제공 logo 슬롯을 그대로 사용한다.
- 번뚝 현재 notifications/page.tsx를 참고해 오늘/이번 주 구획·판 없는 알림 행·설정 진입으로 수정했다.
- 댓글/검색/저장 목록/프로필을 양쪽 실험 화면에 추가했다. 새 공통 API를 중복 정의하지 않는다.
- Web composer 수동 resize 제거 및 성장/상한/축소 확인. Native bounded TextArea도 content-size 기반으로 수정했다.
- Native 전체 937개, Web screens browser 5개, showcase Web 32개/Native 24개 통과.
- 브라우저에서 답글 게시, 검색 결과/빈 상태, 저장 해제/되돌리기, 프로필 저장, 로고 로딩을 확인했다.
  추가 화면 28장 + 기존 화면 34장을 캡처했으며 pageerror 0. Native 기기 검증은 미실행이다.
- 공유 Native dist를 다른 QA가 소비하므로 갱신하지 않고 `/tmp/hjm-basic-native-dist`로 빌드 검증한다.

## 댓글 재구성 및 검색 디바운스

사용자 요청으로 댓글을 인스타그램에서 익숙한 구조로 재구성했다. 이름/시간·본문·좋아요/답글·
우측 하트, 답글 펼침/접힘과 부모 댓글 아래 들여쓰기, 답글 대상과 취소,
자동 높이 작성창을 제공한다. 기존 단순 댓글 예제 구현은 제거하고 전용 조합 예제로 교체했다.
참고: [Instagram 댓글 관리 화면](https://maketecheasier.com/manage-comments-on-instagram/).
현재 앱 버전의 모든 픽셀이나 기능과 동일하다는 검증은 아니다.

검색은 300ms 입력 대기 후 결과를 갱신한다. 연속 입력 및 unmount 시 타이머를 정리한다.
이는 로컬 fixture 검색이며 서버 검색을 연결할 때는 요청 취소와 응답 순서 보호를 제품에서 추가한다.
Web/Native showcase 타입 검사와 Web 32/Native 24 검사, Web 토큰 검사 통과.
브라우저에서 답글 펼침·게시·좋아요·초안 초기화, 마지막 검색어 반영을 확인했다. 화면 8장 캡처,
pageerror 0. Native 기기 검증은 미실행이다.

하단 이모지 빠른 입력 줄은 사용자 요청으로 Web/Native 모두 제거했다. 작성창과 게시 버튼은 유지한다.

## 승인된 8개 후보 구현 및 사진·검색 개편

2026-10-05 사용자의 모든 후보 진행 요청에 따라 목록/상세, 작성/수정, 프로필/계정,
신고/차단, 사진 선택, 검색/필터, 권한 안내, 온보딩을 Web/Native `screen-flows`에 구현했다.
댓글도 제어형 CommentThreadScreen으로 옮겼으며 기존 댓글·검색·프로필 예제가 공개 API를 소비한다.
화면은 `실험/화면/기본 흐름`에 등록했다. 실제 앱 이관 대상은 미지정이며 npm 게시·스토리북 배포 승인은 아니다.

후속 사진/검색 개편 요청으로 사진은 큰 썸네일 격자와 다중 선택 시트, 선택 순서와 5장 제한,
순서 변경/삭제/실패 재시도를 제공한다. 검색은 300ms debounce를 유지하며 최근 검색을 본문으로 이동했다.
콘텐츠 종류·정렬은 시트에서 초안으로 고르고 결과 개수 버튼으로 적용한다. 닫기는 초안을 버리고,
초기화와 빈 결과 복구를 제공한다. 회색 면을 추가하지 않았다. 샘플 사진은 showcase 내부의 로컬 자산이며
실제 OS picker와 업로드는 제품 callback으로 연결해야 한다.

검증: Web 전체 browser 995개/SSR 182개(격자 개편 전), 개편 후 화면 행동 10개 재검사,
Native 전체 949개, Web showcase 32개/Native showcase 24개, 양쪽 타입 검사 통과.
다른 세션 소유의 Native 기존 2개 회귀 기대값은 해당 세션에서 수정한 뒤 전체 재검사했다.
Web 정적 Storybook build/검증, renderer budget, public API map, workspace/evidence/docs/governance 통과.
브라우저 390×844에서 8개 흐름의 동작과 24장 캡처를 확인했고 사진/검색은 기본·다크·큰 글자에서
다중 선택/상한, 필터 취소/적용/초기화를 추가 확인했다. pageerror 및 페이지 가로 넘침 없음.
실제 iOS/Android 기기, 사진 권한, 네트워크 업로드와 소비 앱 검증은 미실행이다.

사진·검색 비교 시트:
- [기본](../qa/2026-10-05-reusable-screens.md)
- [다크](../qa/2026-10-05-reusable-screens.md)
- [큰 글자](../qa/2026-10-05-reusable-screens.md)

## 사진 선택 재개편 및 필터 정렬 수정

후속 사용자 피드백: 필터/최신순의 줄이 어긋나고 사진 선택이 기존 앱과 달라 재개편 요청.
Android 공식 Photo Picker GIF를 직접 확인한 뒤 3열 사진 격자, 겹쳐 표시하는 선택 번호,
앨범 선택, 하단 선택 목록·완료 버튼으로 예제를 교체했다. 기존 파일명/용량/재정렬 카드 중심
선택 예제와 관련 fixture state를 제거했다. 업로드 검토 API는 기존 소비 호환성을 위해 유지하며
선택 화면은 library/selectionSummary 슬롯으로 분리했다. 사용자 사진은 읽지 않으며 로컬 샘플 12개를 쓴다.

필터 행은 center 정렬을 명시했다. 브라우저 390×844의 기본·다크·글자 2배에서 버튼과 정렬 요약의
중앙 Y 차이 2px 미만을 확인했다. 사진 선택/해제/순번/5장 제한/앨범 필터/초기화/실패 후 선택 유지와
재시도 통과, pageerror 0. 큰 글자의 선택 번호는 원 안에서 잘리지 않도록 표시 크기도 함께 키웠다.
Web/Native showcase 32/24개, 두 renderer 관련 행동 5/5개, 타입·토큰·번들·문서 검사 통과.
Web 정적 Storybook 빌드와 검증도 통과했다. 실제 Native 기기와 OS picker 연결은 검증하지 않았다.

최신 시각 근거(이전 사진 선택 캡처를 대체):
- [기본](../qa/2026-10-05-reusable-screens.md)
- [다크](../qa/2026-10-05-reusable-screens.md)
- [큰 글자](../qa/2026-10-05-reusable-screens.md)

## 나머지 기본 화면 12종 재구성

사진 선택과 같은 수준으로 다른 앱 구성을 따르라는 후속 요청을 반영했다.
목록/작성/프로필/신고/권한/온보딩/저장/설정/알림/채팅/로그인/댓글을 Web/Native에 함께 수정했다.
참고 자료, API 호환성, 36장 캡처와 범위는 [기본 화면 재구성 기록](basic-screens-reference-refresh-2026-10-05.md)에 정리했다.
Web showcase 32개, Native showcase 24개, 화면 동작 Web 10개/Native 9개, 공통 계약 5개 통과.
Native 타입 검사, API map, renderer budgets, 토큰/문서 검사, Web 정적 빌드와 검증 통과.
브라우저 실제 조작과 pageerror/가로 넘침 0을 확인했으며 Native 실기기/소비 앱 반영은 별도다.
