# 필요한 레퍼런스 적용 완료 감사와 게시 경계

## 1. 범위·실행 환경

2026-10-07. 시작 HJM main 372ba71efe61f466c259fde949812809ee6e430f.
최신 사용자 “이제 조사 마무리해”, “필요한것만 조사해”에 따라 외부 전수 수집을 재개하지 않는다.
초기 감사는 실제 요구의 코드/등록/게시/소비 상태를 대조했으며 소비 설치/변경·기기 조작을 실행하지 않았다. 이후 22:28/22:45 KST 소비 반영은 §8/§9에 따로 기록한다. 후속에서도 버전 상승·npm 게시·CI dispatch·기기 조작은 수행하지 않았다.
OS 최대 글자/최대값 모사는 모든 판단·검사·후속·차단에서 제외한다. 일반 배율 API/과거 기록은 보존한다.

## 2. 요구와 authoritative 근거

| 요구 | 대조한 원본 | 판정 |
| --- | --- | --- |
| 필요한 외부 자료·중복/흡수/교체 판단 | 조사 마감, adoption-decisions JSON의149 items/8 merges와 source index | 선택 적용 조사 마감. 재사용96/개선24/신규검토10/보류19. 후보 수는 새 API/실험 수가 아님. 전체 페이지 전수 완료 아님 |
| 최소10종 참고 테마 | contracts src/design-profile.ts의10종+neutral, 1.15.0 게시 tarball의 실제 모듈 import | retro/paper/forest/minimal/editorial/brutalist/glass/aurora/terminal/clay10종. neutral 제외 |
| 앱 소유 테마를 한 번 주입 | defineHjmDesignProfile/Provider, product-design fixture, product-theme QA | palette/tokens/material/interactions/compositions/screens 부분 상속·override 제공. 게시 모듈에서 forest 상속 md29/rows/editorial과 원본 md16·동결 확인 |
| 컴포넌트→구성→화면과 같은 상태 유지 | 양 Provider·ScreenLayout·OverviewScreen source, 항목별 Web QA와 Native 선택 QA | supported profile axes를 실제 renderer에서 소비. 명시 props 우선. 상태 엔진/데이터/초안을 테마마다 복제하지 않음. 모든 기존 화면의 임의 영역 재구성 자동 생성 계약은 아님 |
| 조사 후 필요한 실험 등록 | 등록7개 각 Web/Native Story title·usage·QA 파일 직접대조 | 신규6개+기존 테마 개선1개. 기존 OverviewScreen까지 관련 메뉴8개. 규격 경로 일치 |
| 필요한 누락 개선/검증 | profile QA의 모서리/제목/UI 서체/Toast 후속과 Native QA§9 | 현재 main 수정. 직전 집중 회귀27건/build/typecheck/규격·graph 검사를 기록. 이번 감사로 모든 플랫폼/AT/성능 통과를 추가하지 않음 |
| 검토 후 후속8개 승급·npm 게시 | AGENTS 명시 승인 규칙, navigation§2 기존17개 승인, 후속8개 검토팩 | 기존 승인 대상17개와 후속8개를 구분. 사용자 확인 질문 대기; 현재 실험 유지. 승인/게시 완료 아님 |
| 게시 후 소비 제품 버전 갱신 | npm latest·remote tag·원격 main 계약/중앙 record | 중앙/BurnTok/Portfolio Site/Unairplane/Spint/Mofun1.15.0 확인. 나머지4개1.14.0 갱신 필요. 공유 local1.14.0만 보고 원격 누락이라 판단하지 않음 |

## 3. 공식 게시본 확인

공식 registry의 세 npm latest/version은 모두1.15.0이고 tarball bytes의 SHA-512가 metadata integrity와 일치했다.
Git remote의 annotated v1.15.0는 commit9aa33e2063dc65d0427697fb5a20b48ab7cba387이다.
GitHub Release 목록은 비어 있었지만 npm 부재의 증거로 쓰지 않았다.

| package | tarball bytes | integrity |
| --- | --- | --- |
| @hjmds/design-contracts | 1778680 | sha512-+rrqGUHokB95/INfZnHs/h82uriGJ9f7ZwtgjyD1vjgSpCtRE32oUMq0sh3vAsNKjWBOv5VrkR1MCAZu6Kd9cw== |
| @hjmds/react | 668501 | sha512-MyNhlUbQZ9PyYfBhLkhr6sT6JUkK2DipJFJIwR5RmWf+ni3zfSgCtaCNRnPREu1u3SNQGiAOU+pXiN3Oa8sfqQ== |
| @hjmds/react-native | 366514 | sha512-sUymPs5zui7r/BV2wokQKkRp4Jb0k6VECWA4kQ0BOiX0CfSNmP/H5ATyunMGXxnV0vBxKfsGwrmi9n+ShI9tKA== |

세 게시 manifest의 design-profile/effect-surface 공개 진입점은 존재하고 collection-rail은 없다.
게시 renderer의 layout.d.ts/primitives.d.ts에는 Text.fontRole이 없고 게시 effect-surface.d.ts에는 ruledSpacing이 없다.
기본10종과 OverviewScreen 제공을 후속 구현 게시로 합산하지 않는다.

## 4. 현재 소비 상태

2026-10-07 23:00 KST 원격 GitHub main의 app.contract.json을 다시 직접 읽었다. 아래 blob은 계약 파일의 Git blob이며 runtime/lock/install/QA 영수증이 아니다. Portfolio Site·Unairplane의 실제 설치와 검사는 §8의 제품 QA를 따른다.

| 제품 | train | contract blob |
| --- | --- | --- |
| BurnTok | 1.15.0 | d8932e5c092712e4151eaac610edb35373237d78 |
| Portfolio Site | 1.15.0 | 66d69de715b455f08b9640062b65e309f9a0eef0 |
| Unairplane | 1.15.0 | 6bbcf214325891e11904ddd8906c296f7f337368 |
| Spint | 1.15.0 | cdc5e29e0bf58bbcbd285e99856afa35fa701774 |
| Diairy | 1.14.0 | 2c3b318e5689fb5f7bece2bd9594c13f87fbb9ce |
| Mofun | 1.15.0 | bdced754956c5766ab7daeacbedc8c90dd64ec8d |
| Utilverse | 1.15.0 | f62089d88087d6a3c85215eedf41edd457f4a3dd |
| Choose Window | 1.14.0 | 4dbfd83cee6ab84f7a52c4006d73ad3948a57859 |
| Yajalal | 1.14.0 | cd0056c7bd358acf6a31fca5b7c00768b9076a1b |

중앙 remote docs/profiles/hjm-release.json blob b3bde1e6c80521361902ec8da33e3c3c287ffed0은1.15.0이다.
공유 local 중앙 record와9제품 source는1.14.0이었지만 local refs/worktree 대조로 BurnTok의 완료1.15.0 branch가 있음을 확인한 뒤 원격을 재확인했다.
공유 dirty·개발 runtime을 보존했다. 중앙 sync-design-system --version1.15.0 dry-run은 local3파일 갱신 계획을 제시했지만 원격 반영이 이미 있어 --write를 수행하지 않았다.

## 5. 미확인과 남은 작업

후속8개 승급·npm 게시 승인 확인 뒤 승인 대상만 첫 마디/usage/승인 기록을 함께 변경한다.
후속 release는 actual version intent 단계에서 기존 원격 CI/게시 정책을 따른다.
남은3개 소비 제품(Diairy·Choose Window·Yajalal)은 최신 remote main 기반 분리 checkout에서 manifest/lock/contract/catalog/표준을 정합하게 갱신하고 실제 필요한 회귀를 확인한다.
제품 브랜드/폰트 자산·설정 저장·라우팅·서버 확정은 제품 소유다.
Native Android·실물/Release 성능·VoiceOver 순회와 모든 테마/상태/플랫폼 조합은 미확인이며 현재 조사 마감 조건으로 다시 추가하지 않는다.

## 6. 재현과 해석

registry 조회는 npm view name@latest version/dist 및 name@1.15.0 exports/dist로 실행했다.
contracts tarball을 본인 temp에만 추출해 Node24에서 design-profile.js를 import했고 named preset10개/앱 override/원본 분리/동결이 통과했다.
이 import는 렌더링/host와 실제 소비 앱 실행 검사가 아니다.
세 renderer/package source 판독과7개 Story/usage 연결 대조도 위 범위만 증명한다.

## 7. 산출물 보관

본인 임시 published-profile 감사 폴더는 finally로 제거했다. 영구 소스/fixture/계약/원장은 보존한다.
검증한 contracts tarball SHA-256: c7b514fc0ed59c1a1a0b9a3dadf17e92d6b6c5b8ea319af19ff8477c14c8bba0.
게시 design-profile.js SHA-256: e42be8a8edcc39f660885e172d7983e87048540907adf747b38fb98768cb77f4.
원시를 다른 세션 checkout나 node_modules에 설치하지 않았다.

문서 링크599파일·사용 지침(토큰13/컴포넌트139/구성59/화면22) 검사 통과. usage의 적용 값을 정확한1.15.0로 정리하고 미게시 개선 경계는 본문에 남겼다. 초기 비규격 적용 문자열/첫 문단 색인 변화는 생성기를 통해 고쳤고 규격을 완화하지 않았다.

## 8. 게시 1.15.0 소비 반영 — 22:28 KST

초기 감사에서 남았던8개 중2개를 최신 remote main 기반 독립 worktree에서 완료했다. 기본10종 테마와 profile의 이미 게시된 버전을 소비하도록 갱신한 것이며, 미게시 글자 역할·줄무늬·CollectionRail 후속의 게시/채택으로 합산하지 않는다. 제품 브랜드 source와 앱 버전은 변경하지 않았다.

| 제품 | 실제 통합 | 로컬 검증과 한계 |
| --- | --- | --- |
| Portfolio Site | [PR25](https://github.com/jim1286/jim1286.github.io/pull/25) MERGED, head8867b7e754281d519855144a625e0a00038e4367 → main c90c9af406ad5c7d1fa1edb7813e2fbb70b2e987 | Node24.20/pnpm11.24 frozen 설치, canonical check/기존4회귀·TS·Vite, contract/design/중앙 scaffold/정적 library 통과. 게시 profile paper override29/rows/editorial 보존. [제품 QA](https://github.com/jim1286/jim1286.github.io/blob/c90c9af406ad5c7d1fa1edb7813e2fbb70b2e987/docs/qa/2026-10-07-hjm-1-15-upgrade.md) |
| Unairplane | [PR18](https://github.com/jim1286/unairplane/pull/18) MERGED, headbece7e3c72ab8133182ea5754fb645529c18293f → main453f76e9e744b40ec7ac24625c7b0cd505c1b641 | Node24.20/pnpm11.24 frozen 설치, canonical check/35파일287회귀·TS·데이터, contract/design/docs/중앙 scaffold/정적 library 및 iOS/Android Hermes export 통과. 기존 optional peer/TypeScript 경고3건은 남고 HJM1.14/1.15 optional 요구 동일함을 공식 metadata로 확인. [제품 QA](https://github.com/jim1286/unairplane/blob/453f76e9e744b40ec7ac24625c7b0cd505c1b641/docs/qa/2026-10-07-hjm-1-15-upgrade.md) |

두 저장소의 package/app 버전을 올리지 않았다. 공유 checkout·Metro·기기는 보존했다. manifest를 먼저 갱신하고 pnpm으로 lock을 재생성했으며 HJM 외 lock records는 그대로다. old-lock 선행 냉각 검사에는 검증된 old exact 예외를 일시 유지한 뒤 즉시 제거했고, 최종 예외와 frozen 설치는1.15.0-only다.

일반 변경의 커밋·squash 제목에 `[skip ci]`를 넣고 CI dispatch를 실행하지 않았다. Portfolio Site의 GitHub default CodeQL은 이를 무시하고 PR/main에서 자동 시작해 이번 변경에 해당하는 runs37628062009/37628158259를 취소했으며 둘 다 completed/cancelled를 확인했다. required gate를 우회하는 admin merge는 사용하지 않았다. Unairplane의 이 merge에 새 workflow run은 관찰되지 않았다.

Vite/Expo 임시 bundles는 제품 QA에 file count/bytes/manifest SHA를 기록한 뒤 제거했다. 브라우저·기기·실물/Release 성능·운영 API·서비스 배포/스토어 제출은 미수행이다. 후속8개 승급·게시 승인 대기는 별도이며 남은6개는 Spint·Diairy·Mofun·Utilverse·Choose Window·Yajalal이다.

## 9. Spint·Mofun 소비 반영 — 22:45 KST

두 제품은 모바일만 HJM을 소비하며 서버·SDK·브랜드 source·앱 version은 바꾸지 않았다. exact1.15.0 frozen 설치, 모바일 workspace4개 TS build, 모바일 type/unit/e2e, i18n/계약/문서, 중앙 scaffold/library, iOS/Android Hermes exports를 확인했다. source alias/stub의 계약 시험은 실제 기기 UI 검증으로 확대하지 않는다. 전체 root/server canonical은 이번 범위에서 미실행이다.

| 제품 | 실제 통합과 QA | 확인한 결과 |
| --- | --- | --- |
| Spint | [PR19](https://github.com/jim1286/spint/pull/19) MERGED, head7c39eafe5d45d0c4a78ad341b390998709bf0288 → main33378c30246cdc473e99030ec1ecdfe8eed6b30d; [QA](https://github.com/jim1286/spint/blob/33378c30246cdc473e99030ec1ecdfe8eed6b30d/docs/qa/2026-10-07-hjm-1-15-upgrade.md) | unit43파일272건, flow9건, i18n 생성4건; JS iOS4,053/Android4,069modules. 기존 peer3그룹과 sourcemap 원문 누락·Vite 설정 예고 경고는 보존 |
| Mofun | [PR6](https://github.com/jim1286/mofun/pull/6) MERGED, headd555a148bd5a1dc89fa942c23c6b60b1ae9503d9 → main360018e9c918365bc74413ca5c2b587fcfd22a64; [QA](https://github.com/jim1286/mofun/blob/360018e9c918365bc74413ca5c2b587fcfd22a64/docs/qa/2026-10-07-hjm-1-15-upgrade.md) | unit4파일39건, contract e2e7건; JS iOS3,671/Android3,766modules. 기존 peer6그룹은 해결됐다고 보고하지 않음 |

공식 registry integrity와 설치 버전을 확인했고 YAML 구조로 HJM 외 packages/snapshots/importer record가 바뀌지 않았음을 확인했다. 이전1.14와 새1.15의 외부 Native peer 요구도 동일하다. old exact 냉각 예외는 lock 선행 검증 중만 유지한 뒤 제거했다.

Mofun의 초기 중앙 검사 STALE_LIBRARY_ADOPTION은 product7manifest에 없는 expo-dev-client 채택 기록1개가 원인이었다. 없는 의존성을 다시 넣는 대신 중앙 record만 제거한 [메타 PR12](https://github.com/jim1286/app-portfolio/pull/12)를 main8b70e6cda8e32fef1a3aa144198426a4cd1ad9c0에 통합했다. 중앙 문서129개·현재 지침12개와 Mofun7manifest/58라이브러리/1Query 정적 검사가 통과했다.

일반 커밋/merge 제목의 `[skip ci]`와 version-file-only 기존 정책을 유지했다. 별도 원격 CI dispatch·npm 게시·Native build·서비스/스토어 배포를 하지 않았으며 두 merge SHA에 해당하는 신규 main workflow run도 관찰되지 않았다. TS/Metro 산출물은 각 제품 QA의 manifest digest를 남긴 뒤 제거하고 본인 설치만 정리했다. 공유 작업은 보존했다.

9개 소비 main 중5개(BurnTok·Portfolio Site·Unairplane·Spint·Mofun)가1.15.0이다. 나머지 Diairy·Utilverse·Choose Window·Yajalal4개는 원격 계약을 다시 읽어1.14.0임을 확인했다. 후속8개 실험 승급/게시 승인 대기는 별도다.

## 10. Utilverse 소비 반영 — 23:00 KST

[Utilverse PR2](https://github.com/jim1286/utilverse/pull/2)가 MERGED됐고 head19aeb88eb5fe43c84e115fcd197eebfe2d3b19dd → main a08bf0625747649c8c6410dc788a5db50bd41288을 확인했다. 원격 계약은1.15.0/blob f62089d88087d6a3c85215eedf41edd457f4a3dd다. [제품 QA](https://github.com/jim1286/utilverse/blob/a08bf0625747649c8c6410dc788a5db50bd41288/docs/qa/2026-10-07-hjm-1-15-upgrade.md)에 검사·한계·산출물 digest를 보존했다.

Node24.21/pnpm11.24 frozen 설치, 모바일과 공용3개 타입 검사, 모바일66파일321건·domain20파일179건·i18n6파일18건의 중복 제외518건, 추가 locale 생성1건, API/계약/디자인/문서137개·중앙 scaffold/library, iOS2636/Android2731modules Hermes export가 통과했다. peer 문제는 없고 HJM 외 YAML lock record와 이전/새 Native 외부 peer 요구도 동일하다. 실제 설치·공식 registry·중앙 integrity가 일치했다. 게시 profile의 앱 override29/rows/editorial도 보존됐지만 제품 UI의10종 전환 검증을 뜻하지 않는다.

기존 appealKeys factory의 중앙 등록 누락9건은 baseline 소스와 같은 AST 검사에서도 재현됐다. source를 바꾸지 않고 기존 export를 등록한 [메타 PR13](https://github.com/jim1286/app-portfolio/pull/13)을 main86819113e7677017265b2b81171c9cb428c4acc0에 통합했다. 중앙6manifest/72libraries/1Query·문서129개/현재 정책12문서 검사 통과. 검사기 완화·SDK 변경은 없다.

제품의 팔레트·다섯 shell theme·Expo/native 설정·앱/서버 버전은 유지했다. 기존 uuid deprecated와 AdMob 설정 key 무시/환경 color 경고는 제품 QA에 남겼다. 최초 one-off probe의 상대 require 오류는 공식 package subpath로 재확인했으며 최초 iOS 출력이 Android export로 교체된 뒤 플랫폼별 별도 경로를 재확인해 digest를 보존하고 본인 출력만 제거했다. 전체 root/server canonical·Native build·기기/운영/API·배포/스토어는 미실행이다.

일반 커밋/merge에는 [skip ci]를 사용했고 CI dispatch나 package 게시를 하지 않았다. 이번 merge SHA에 해당하는 신규 main workflow run은 관찰되지 않았다. 공유 runtime·dirty source를 보존한다. 현재9개 소비 main 중6개가1.15이며 Diairy·Choose Window·Yajalal3개는 원격 계약 재확인에서도1.14다. 후속8개 실험 승급·게시 승인 대기는 별도다.
