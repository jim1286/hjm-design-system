# 페이지 진입 입력 포커스 · 하단 시트 자동 포커스 폐지

2026-10-18 사용자 요청: “input 있으면 무조건 포커스 정책 있잖아”, “페이지 진입에만 적용하고 하단 시트에는 폐지해 포커스”.

## 구현

- 일반·검색·작성·채팅·댓글·인증 페이지의 첫 유효 입력(또는 진입 주 입력)에 한 번 포커스한다. 비활성·읽기 전용 입력은 제외하며 이미 사용 중인 입력을 빼앗지 않는다.
- 하단 Sheet는 입력 개수, initialFocus/initialFocusRef, 표시 크기와 무관하게 입력 자동 포커스를 하지 않는다. 중첩 ScreenLayout과 본문·footer 모두 같은 경계에 둔다. Web 모달 컨테이너 초점·focus trap과 사용자가 입력을 누르는 동작은 유지한다.
- 진입 종료·사용자 조작 이후 검색 칸·단계 입력이 나타나도 자동 포커스를 다시 시작하지 않는다. 기존 Dialog·측면 Sheet의 모달 포커스 계약은 유지한다.
- Web 진입 대기 중 click/contextmenu가 먼저 오면 포커스를 취소한다. microtask 안에서 뒤늦게 scope를 activate하면 이미 열린 반응 메뉴에서 포커스를 빼앗았으므로 활성화와 실제 포커스 시점을 분리하고 settled 진입을 재설정하지 않는다.
- 구현 source: `401e47f5`(페이지/시트 경계), `0a46915b`(선행 사용자 조작 경합). 사용 지침과 prop 설명을 함께 갱신했다.

## 소비 소스의 직접 누락

- Unairplane ScheduleEntrySheet의 명시적 first-input을 제거했다(`9821e78`).
- 번뚝 아이디어·스핀트 가입·Utilverse 공통 도구 화면의 이전 단계/늦은 mount 포커스 설명을 정리했다(`447f143f`, `b4c680b`, `1dbd6c5`).
- 다에리 Web 프로필 닉네임만 raw text input이라 포커스 scope에 등록되지 않았다. Native와 같은 HJM TextField로 바꾸고 변경 제한·초안·서버 오류·저장을 유지했다(`6bcc5b1`). 직접 raw input 검색의 나머지는 file/radio/hidden이며 텍스트 입력 자동 포커스 대상이 아니다.
- Utilverse 체크리스트·타이머·노트의 create/new-only target 제외와 로그인 화면의 조건부 none을 제거했다(`16be253`). 다에리 약관 화면 Web·Native도 조건부 none 대신 공통 페이지 기본값을 따른다(`7c271ce`).

## 검증

- contracts screen-patterns 24건, Native host mock 진입 포커스 10건, 실제 Chromium focus/overlay 22건 통과. 하단 시트의 한 입력·여러 입력·재열기·중첩 본문·footer·명시적 ref, 수동 포커스, 페이지 입력, click/contextmenu가 대기 포커스보다 먼저 오는 경우를 확인했다.
- 최초 공개 1.33.0 소비 번뚝 Web 테스트에서 반응 메뉴 3건 실패를 확인했다. 위 scope 활성화 경합을 직접 수정한 후보 source를 기존 HJM source adapter로 연결하자 메시지·댓글 시트·가입 82건 모두 통과했다. 임시 Vitest 설정은 제거했다.
- 다에리 ProfileSettings 10건(비동기 페이지 진입 포커스 포함)과 Web 타입 검사 통과. 회복 테스트는 오류 문구의 제거를 확인하도록 좁혔다. HJM 필드가 유지하는 빈 alert live region을 제거하거나 성공으로 숨기지 않았다.
- 정확한 커밋 소스를 mac-ci에서 확인해 contracts build, Web·Native 타입 검사, 세 package build 및 실제 release artifact 검사를 통과했다. 공유 checkout에 있던 별도 screen-flows gap=0 타입 오류는 포커스 작업에 섞어 고치거나 stage하지 않았다.
- 사용 지침 선택 감사는 기존 auth-screen-layout 적용 버전 머리말 형식 오류를 보고했다. 게시 차단 조건으로 늘리지 않았고 통과로 기록하지 않는다.
- iOS/Android 실제 키보드·기기 QA, 앱 binary/스토어 제출, 제품 운영 배포는 실행하지 않았다. 서버·데이터·계정 계약을 바꾸지 않았다.

## 최종 게시와 공개 Storybook

- 최종 fixed train `1.33.2`, source/tag `8feb3bc0c911b39ea4093a8f07da4acdc7bb373f`.
- [npm 게시 run 39108571024](https://github.com/jim1286/hjm-design-system/actions/runs/39108571024): build·publish·tag success. 같은 train에 다른 승인 작업의 빈 상태 14px/헤더 보조 문구 변경도 포함되며 해당 작업과 소비 설치를 조율했다.
- [Storybook run 39108510489](https://github.com/jim1286/hjm-design-system/actions/runs/39108510489), delivery artifact `12129601869`.
- Actions digest `sha256:8858f28ff88d060bd2345faa123d13684ae0f5789f9de352eebeb1b00fef1db1`.
- manifest SHA-256 `d11768b7efa870941dea05279a887a47f47901d3aded740126373795c03fd4b3`.
- delivery archive SHA-256 `725714aa8ac768d2dfbeb3bab79e5189e33e7dc00cf806e4ea79fdd2a0e9449a`.
- VPS current `/srv/hjm-storybook/releases/8feb3bc0c911b39ea4093a8f07da4acdc7bb373f-d11768b7efa8`.
- 후보 loopback·[공개 HTTPS](https://storybook.jmstudioapps.com/) 각각 638개 파일 hash/cache와 4개 미등록 경로404 통과. 운영 release·previous와 CI artifact는 보존했다.
- publish 성공 후에도 RN exact metadata·packument/abbreviated metadata·tarball 공개 결과가 어긋났다. CF REVALIDATED 후에도 구버전 목록을 관측했으며 원인은 미확인이다. 07:49:23 UTC RN1.33.2 metadata200을 확인한 뒤 재개했다. 같은 버전을 재게시하거나 registry/tarball 우회 설치를 하지 않았다.
- 중앙 release import는 최종 세 npm tarball의 SHA-512·manifest·tag·catalog를 검증했고 source를 위 SHA로 고정했다.

## 최종 소비 결과

8개 제품과 Release Hub의 HJM dependency 22개를 manifest·실제 node_modules에서 1.33.2로 확인했다. 8개 제품의 pnpm lock·release profile/source도 대조했다. 아래는 dependency 채택 commit이며 각 origin/main 반영을 확인했다. 이후 Diairy는 test-only `ebeb90f6ddb0be745f239a5545920b1a07ad23f3`도 main에 반영했다.

| 소비처 | 채택 commit | 검증 |
| --- | --- | --- |
| BurnTok | `f96f027d1d97218a6707a6241c78c1a78b682f0d` | 1.33.2 manifest·lock·실제 설치·contract/profile 및 Web·Mobile 타입 통과 |
| Choose Window | `eb58e442152f16b103f7dd64369bd4550e5db35e` | 1.33.2 manifest·lock·실제 설치·contract/profile 및 Mobile 타입 통과 |
| Diairy | `78fc379652ae33e5650560276915eb38602f6ac3` | 1.33.2 manifest·lock·실제 설치·contract/profile 및 Web·Mobile 타입 통과 |
| Spint | `67e1e607612017f109506c8efa04cbff9342d5c9` | 1.33.2 manifest·lock·실제 설치·contract/profile 및 Mobile 타입 통과 |
| Unairplane | `58d131de1a9b7c4b4e2a83322c9a9b83d692b499` | 1.33.2 manifest·lock·실제 설치·contract/profile 및 Mobile 타입 통과 |
| Utilverse | `081e8c86031cfed73d008b5461112e527b19ab56` | 1.33.2 manifest·lock·실제 설치·contract/profile 및 Mobile 타입 통과 |
| Yajalal | `bea3e3cf3bee77eb6c968310ec1d40e02418bbf0` | 1.33.2 manifest·lock·실제 설치·contract/profile 및 Mobile 타입 통과 |
| Portfolio Site | `5bc56ccdd97f11ecf990a1feac4a15e6ae4baa22` | 1.33.2 manifest·lock·실제 설치·contract/profile 및 Web 타입 통과 |
| App Release Hub | `85216ba11d6c0765b56061f35596cfb955f5e131` | contracts 1.33.2 manifest·npm lock·실제 설치·타입 통과 |

- `HJM_LOCAL_SOURCE=0`으로 설치된 게시물을 검사했다. Web·앱 10개 표면 및 Hub 타입 검사가 통과했다. 마지막 소비 코드 수정 후 Diairy Web·Native와 Utilverse Native 타입도 다시 통과했다.
- 게시물 기준 소비 테스트: BurnTok 89건(메시지·댓글·가입 82 + 공유 7), Diairy 27건(Web ProfileSettings 10 포함), Spint 9건 통과.
- 추가 Web CommunityRulesGate는 초기 12/13 통과, 빈 field live 영역과 실제 logout 오류 alert를 구분하지 못한 선택자1건 실패였다. 실제 실패 문구와 alert 역할을 검증하도록 test-only 수정 후 13/13 통과했다. 제품의 오류를 숨기거나 live 영역을 제거하지 않았다.
- 중앙 release/profile import도 1.33.2/source8feb3bc0로 고정·commit·push했다. 제품 버전 상승·스토어 빌드·제출·OTA/운영 배포는 하지 않았다.


## 정리

작업용 branch·worktree·clone을 만들지 않았다. 테스트용 임시 설정과 이번 작업의 원시 로그·artifact 사본은 결과를 보존한 뒤 제거한다. 운영 release/previous, npm 산출물, CI artifact는 복구 원본으로 보존한다. 다른 세션의 Card/Menu/화면 변경·생성물·활성 Metro는 보존한다. 로컬 HJM main의 fast-forward는 그 별도 미커밋 catalog 파생물과 충돌해 강제 진행하지 않았다. 배포 Mac/태그/공개 산출물은 위 exact SHA로 확인했다.
