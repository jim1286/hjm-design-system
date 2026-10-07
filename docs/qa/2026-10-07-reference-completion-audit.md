# 필요한 레퍼런스 적용 완료 감사와 게시 경계

## 1. 범위·실행 환경

2026-10-07. 시작 HJM main 372ba71efe61f466c259fde949812809ee6e430f.
최신 사용자 “이제 조사 마무리해”, “필요한것만 조사해”에 따라 외부 전수 수집을 재개하지 않는다.
이번 감사는 실제 요구의 현재 코드/등록/게시/소비 상태를 대조한다. 원격 CI·버전 상승·npm 게시·소비 설치/변경·기기 조작은 실행하지 않았다.
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
| 게시 후 소비 제품 버전 갱신 | npm latest·remote tag·원격 main 계약/중앙 record | 중앙/BurnTok1.15.0 확인. 나머지8개1.14.0 갱신 필요. 공유 local1.14.0만 보고 원격 누락이라 판단하지 않음 |

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

원격 GitHub main의 app.contract.json을 직접 읽었다. 아래 blob은 계약 파일의 Git blob이며 runtime/lock/install/QA 영수증이 아니다.

| 제품 | train | contract blob |
| --- | --- | --- |
| BurnTok | 1.15.0 | d8932e5c092712e4151eaac610edb35373237d78 |
| Portfolio Site | 1.14.0 | e69e29d91784068f2c5e1d44601db4a456918ad3 |
| Unairplane | 1.14.0 | ab757ed43dee4efc78552f6ab1c34cc28d706775 |
| Spint | 1.14.0 | 1ee96af847cb7c3df4f33475f91bb0706cf3be5e |
| Diairy | 1.14.0 | 2c3b318e5689fb5f7bece2bd9594c13f87fbb9ce |
| Mofun | 1.14.0 | a6fcacd9e01ec0381861d7ed91c4839fef28b710 |
| Utilverse | 1.14.0 | b72da3316bf006322403a541c0b1845512a493be |
| Choose Window | 1.14.0 | 4dbfd83cee6ab84f7a52c4006d73ad3948a57859 |
| Yajalal | 1.14.0 | cd0056c7bd358acf6a31fca5b7c00768b9076a1b |

중앙 remote docs/profiles/hjm-release.json blob b3bde1e6c80521361902ec8da33e3c3c287ffed0은1.15.0이다.
공유 local 중앙 record와9제품 source는1.14.0이었지만 local refs/worktree 대조로 BurnTok의 완료1.15.0 branch가 있음을 확인한 뒤 원격을 재확인했다.
공유 dirty·개발 runtime을 보존했다. 중앙 sync-design-system --version1.15.0 dry-run은 local3파일 갱신 계획을 제시했지만 원격 반영이 이미 있어 --write를 수행하지 않았다.

## 5. 미확인과 남은 작업

후속8개 승급·npm 게시 승인 확인 뒤 승인 대상만 첫 마디/usage/승인 기록을 함께 변경한다.
후속 release는 actual version intent 단계에서 기존 원격 CI/게시 정책을 따른다.
남은8개 소비 제품은 최신 remote main 기반 분리 checkout에서 manifest/lock/contract/catalog/표준을 정합하게 갱신하고 실제 필요한 회귀를 확인한다.
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
