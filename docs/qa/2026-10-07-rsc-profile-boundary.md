# HJM profile 주입의 React Server Component 경계 보완

## 1. 최종 판정

확인 범위 통과. Web layout/provider의 client directive 누락을 보완했다. Next의 캐시 없는 실제 build에서 directive가 없는 대조군은 createContext 오류, 두 entry를 선언한 후보는 통과했다. production hydration과 입력 유지도 통과했다. 전체 로컬 gate에서 드러난 기존 테스트/fixture 연결 누락을 보완하고 실패 이후의 미완료 gate를 이어서 모두 통과했다. 단일 ci:check 재실행 성공이나 npm 게시/소비 이관 완료를 뜻하지 않는다.

## 2. 대상과 이력

2026-10-07 23:39 KST부터 Codex. production browser는23:55 KST, 로컬 gate 마감은2026-10-08 00:10 KST에 확인했다. HJM main f2d77534bd4ca136f554a6833355c0bc70f0e055 위의 이 작업 미커밋 source와 재사용 fixture를 검사한다. 기존 다른 세션19 dirty paths는 보존한다. primary HJM에서 source를 작성하되 candidate renderer/Next build와 전체 gate는 본인 임시 출력/분리 snapshot에서 수행한다.

## 3. 환경과 범위

Node24.20.0, HJM pnpm11.18.0, 소비 설치에서 읽은 Next16.3.3/React19.2.8. framework/패키지 버전과 공유 source·lock은 변경하지 않았다. 최초 snapshot은 기존 dependency 링크를 재사용했고 pnpm이 primary node_modules/.modules.yaml의 시각을 갱신했다. 내용에 임시 경로가 없음을 확인했다. 이후 Metro의 외부 symlink 해석 문제 때문에 snapshot에만 offline/frozen/ignore-scripts/clone 설치(890패키지, download0)를 했다. primary를 재설치하거나 metadata를 임의 복구하지 않았다. fixture는 Web의 granular /layout와 /provider, 서버에서 contracts로 만든 paper profile(radius md29/collection rows), 서버 작성 JSX 본문만 사용한다. Next의 임시 output/cache 및 2 build workers는 공유 앱 출력과 호스트 자원 간섭을 피하기 위한 fixture 선택이며 제품 기본값 변경이 아니다. 실제 API/provider/DB·기기·OS 최대 글자/최대값 모사는 제외한다.

## 4. 재현·수정 전후

Diairy 게시1.15 채택에서 guide server module의 createContext 오류가 발생했고 제품은 Surface 재수출 wrapper로 복구됐다. 현재 HJM main candidate renderer를 임시 Next app의 node_modules에 복사한 직접-import fixture에서도 같은 page-data 수집 오류(exit1)가 재현됐다. layout/provider는 internal의 React context를 import하지만 directive를 선언하지 않았다.

두 granular entry에 use client를 선언한다. 서버 page 전체 또는 루트 barrel을 client로 만드는 대안은 필요한 경계보다 넓어 배제한다. Source와 tsc output 모두 directive를 보존한다. 첫 candidate 재실행은 임시 Next managed dependency cache 때문에 기존 bundle을 재사용해 같은 오류를 냈다. 본인 .next만 제거한 뒤 build가 통과했다. 같은 stylesheet/fixture에서 directive 두 줄만 제거한 캐시 없는 대조군도 다시 오류를 냈다. 후보 복구 후 캐시 없는 재검증 결과를 아래에 기록한다.

계약 API/props/descriptor·Native 동작은 변경하지 않는다. 다른 Web entry/루트 barrel을 서버에 직접 import하는 보장은 하지 않는다. callback/ref와 hooks는 소비 Client Component에서 만들어야 한다. 설치1.15.0에는 이 보완이 없으므로 Diairy wrapper는 다음 게시본을 검증해 설치하기 전까지 유지한다. 기존 Provider 사용 지침의 기본 designProfile가 미게시라는 오래된 설명도 이미 검증된1.15 기본 프로필과 미게시 후속을 구분하도록 정정한다.

## 5. 실제 검사 결과

| 검사 | 결과 |
| --- | --- |
| React typecheck |통과|
| SSR layout-image/brand-palette/package-boundary |3파일10회귀 통과|
| Browser design-profile/layout-image |2파일12회귀 통과; 기존11preset 전환·초안/선택/초점 유지 포함, 최대값 전용 조건 아님|
| renderer tsc candidate build |본인 temp outDir로 통과, shared foreign dist를 재생성하지 않음|
| Next no-directive 대조군 |첫 clean fixture와 동일 CSS 조건의 fresh-cache 대조군 모두 createContext/page-data 수집 실패 exit1|
| Next 선언 후보 |첫 재실행의 stale cache 오류 보존, 본인 cache 정리 후 production build 통과|

공식 [Next 라이브러리 저자 지침](https://nextjs.org/docs/app/getting-started/server-and-client-components#third-party-components)과 [React use-client 계약](https://react.dev/reference/rsc/use-client)을 읽고 설치된 framework docs와 대조했다. 위 집중 결과를 전체 Web/Native·Storybook/모든 제품 검사 또는 게시 proof로 확대하지 않는다. 전체 로컬 gate의 실패와 구간별 최종 결과는 아래에 남긴다.

브라우저 production 서버는 본인 임시 app의 새 loopback port로만 실행하고 종료했다. Chromium153.0.8010.12/390×844에서 SSR 제목/profile 데이터와 radius29px를 확인했다. OS 동작 감소 모사를 바꾸자 실제 --hjm-motion-scale이1→0으로 바뀌었고, 입력값 edited draft와 같은 input 노드가 유지됐으며 page/console error는0이었다. 최초 one-off runtime probe는 존재하지 않는 data-reduced-motion을 가정해 null assertion으로 종료했다. 제품 prop을 바꾸지 않고 실제 공개 CSS 변수로 확인했다.

전체 local ci:check의 첫 snapshot 실행은 contracts1030건 중1029통과/1실패였다. 기존 CollectionRail public export가 exact boundary allowlist에 빠진 상태였으며 manifest/test가 main baseline과 byte-identical임을 대조했다. 모듈이 제공하는 Metro/import 조건을 검사해야 하므로 allowlist를 완화하지 않고 기존 public companion1항목을 추가했다. 이 변경도 재실행 snapshot에 포함했다. contracts1030건/계약103개·Metro/Web graph 통과 뒤 Web SSR278건 중1실패와 Native export 목록 누락1건이 이어졌다. Web은 Text.fontRole 추가 뒤 속성의 문자열 연속 순서를 기대했고, Native도 기존 CollectionRail entry를 exact 목록에서 빠뜨렸다. 같은 Text root의 variant/font-role/tone/emphasis 값4개를 각각 확인하고 Native companion1항목을 등록해 의미/정확한 경계 검사를 유지했다. 새로운 허용 API나 검사 완화가 아니다. 사용 지침의 최초 새 h2 절2개는 규격 checker에 거부돼 허용된 기존 import 절 아래 h3로 정리했고 검사기/규격을 바꾸지 않았다. usage13/139/59/22와 문서602개·git diff --check를 통과했다.

최종 local `ci:check` 실행도 Native Metro fixture의 CollectionRail import 누락에서 exit1로 멈췄다. 이미 공개된 entry를 fixture에서 직접 import하고 실제 렌더 binding을 추가했다. 이후 실패 gate와 미완료 gate만 이어서 실행했다. Native Showcase의 토큰 전수 값 검사는 새 font resolver 함수까지 값으로 세어1건 실패했으므로 함수 export와 token 값을 구분했다. 모든 token 값의 정확한 대응은 계속 검사한다. 두 글꼴 resolver의 구현/계약 검사는 contracts suite에 있다.

| 최종 완료한 local gate 구간 | 결과 |
| --- | --- |
| contracts type/test/build/contract/bundle |100파일1030건,103계약 및 Web/Metro graph 통과|
| Web type/SSR/browser/build |SSR18파일278건·browser119파일1156건 통과; browser act 경고는 보존|
| Native type/test/build/Metro |116파일1263건 통과/기존12skip; Metro67families/700modules/raw1492.1KiB/gzip368.7KiB/9.97s. JS pre-Hermes이며 Native binary가 아님|
| renderer graph·workspace·evidence |모듈/금지 경계 통과; active Web103/Native83 계약 대응 및1.15 고정 train 동기화|
| docs·governance·API·usage·Storybook |분리 snapshot 문서584개, governance45건,310API이름, usage13/139/59/22,433story파일/970Web ID 통과|
| Native Showcase generate/type/test |6파일21건 통과|
| Web Showcase type/test/token boundary |15파일48건,313소스/70정확 예외 통과|
| Web Showcase production/static |10.44s build,103canonical renderer stories·13navigation pages 통과. use-client 무시/chunk 경고는 보존|
| generated output |정규 build의 Web6개 후보 output과 primary 후보가 byte-identical. 임시 outDir의 로컬 절대 source 경로가 들어 있던4map을 정규 source map으로 교체; 나머지 generated 경로 drift0|

Metro 첫3회는 snapshot의 외부 pnpm symlink를 file map에서 해석하지 못했다. read-only watch root/path 추가도 실패했고 primary 설정은 바꾸지 않았다. snapshot offline 설치 뒤 기존 file-map cache가 symlink를 파일로 기억해 TreeFS 오류가 났다. snapshot에만 독립 fileMapCacheDirectory/cacheVersion을 써서 통과했다. 그 임시 cache 폴더가 미생성 상태여서 cache write ENOENT 경고1개가 있었지만 실제 graph와 bundle 검사는 exit0이었다. 공유 Metro cache를 지우지 않았다. 임시 Metro config는 저장소 변경 대상이 아니며 정리 때 제거한다. Native checker의 기존 byte ceiling은 이 변경에서 건드리지 않았고 측정값은 그 아래였다.

## 6. 미확인과 게시 경계

다른 RSC framework/version·루트 barrel·다른 granular UI entry·Native/실물/Release UI·VoiceOver·성능은 이 regression의 범위가 아니다. 고정 train 버전 상승·원격 CI dispatch·npm 게시·소비 앱 wrapper 제거를 하지 않는다. 신규8개 실험 승급/게시 명시 승인 대기는 별도이며 기존 배포 API의 버그 보완은 현재 위치에서 한다. 로컬 main source 커밋e0d5b39f804e41a70d8b874cb8e9c51f78a4b7f6은 완성됐지만 HTTPS push3회(HTTP/1.1 포함)가 GitHub Internal Server Error로 거절됐다. SSH 대안은 저장 키 인증 publickey 거절로 끝났다. 조회한 원격 main은f2d77534bd4ca136f554a6833355c0bc70f0e055이므로 마지막 보완의 원격 통합은 미완료다. 이를 게시 승인 대기와 합치지 않는다.

## 7. 보관 처리

fixture source와 사용 지침·Changeset·의미 있는 기존 regression 보완을 영구 보존한다. 본인 raw log11개/runtime receipt1개, 총223239bytes의 정렬 manifest(name/bytes/SHA-256; canonical JSON)의 SHA-256은06b65206463343ab2ff264d3fe9cfa080fbe3a44688e4837b6aec2b551191786이다. 주요 receipt SHA는 runtime22e7678040ee21dab25fd53ed0d7d60b8d0b9310bcb033f7b4fd5d2402d125f0, Web browser3fa3390557846627512d987d4233f880662651b78b5e2f835ed56f571031eef9, 마지막 실패 local gate659d322e4d83b3f313fa56183ded7f8a8a97c4318049b0f422dd162ab9026f1b이다.

Next output100파일88514113bytes manifest SHA9f1beb95d031eba47ff9bb68dbc457093b0b861ee1b9a3b8b6596dbddfb87b46, Web static464파일13001011bytes manifest SHA6a09a110bc7aad665372db1c1ddc27ce24887d11230d9869d45f0664f367f306. 이 tree digest는 재빌드 재현성을 주장하지 않고 확인했던 산출물을 식별한다. 검증 결과와 digest 보존 뒤 본인 temp app/copy/snapshot/offline deps/cache/raw logs만 제거한다. push 재개에는 원격에 올릴 로컬 Git commit과 영구 fixture를 사용한다. 재사용 fixture와 제품 소스·공유 .next·기기·개발 런타임을 보존한다. primary dependency metadata의 앞서 설명한 갱신을 숨기지 않는다.
