# QA — Storybook 자체 도메인 이전

## 1. 판정

Web Storybook을 `https://storybook.jmstudioapps.com/`에 게시하고 실제 manager·preview 화면,
공개 464파일 hash/cache 및 미등록 404를 확인했다. GitHub Pages 호환 이동 안내도 공개되어
기존 manager/iframe 링크의 path/query/hash와 실제 preview 렌더링을 확인했다.
Native showcase·npm 릴리스·소비 앱 기능 변경은 이번 이관이 아니다.

## 2. 대상·승인·환경

2026-10-10 KST, 사용자 "ㅇㅇ"은 자체 도메인/VPS 게시, 기존 story URL 유지,
포폴/GitHub/HJM 안내 주소 갱신 제안을 승인했다. 앞선 정책·포폴 직접 이관의 후속 작업이다.
개발 Mac에서 버전 상승/새 작업 branch/worktree/clone 없이 진행한다. mac-ci는 Tailscale online이었으나
기존 host key 검증을 유지한 SSH가 publickey/password 권한으로 거부됐다. GitHub hosted Ubuntu·Node 24·
pnpm 11.18.0으로 고정 main을 검사·빌드하고 승인된 직접 SSH 경로로 해당 artifact만 VPS에 전달했다.
후속 delivery는 [실행 정본](../../deploy/storybook/README.md)을 따르며 mac-ci 또는 권한이 있는 환경에서 실행한다.
키 값·쿠키·token을 기록하거나 GitHub Actions에 새 SSH credential을 배포하지 않았다.

## 3. 원본과 초기 공개 산출물

공유 checkout에 다른 세션의 component/개발 설정 변경이 있었으므로 로컬 working tree를 빌드하지 않았다.
main exact source `957cf07f19d7b276e283754c219212ac73f4f4fe`,
[Showcase run 37949696443](https://github.com/jim1286/hjm-design-system/actions/runs/37949696443)의
intent/verify/deploy success와 `pnpm ci:check` 실행을 확인했다. 그 Pages artifact `11625392618`을 내려받아
tar의 상대 경로/파일 종류를 검사하고 build 파일만 추출했다. 이전 37881718099는 success여도 verify/deploy skipped여서 사용하지 않았다.

- 초기 Storybook index: 970 entries, 정적 파일 464개.
- manifest SHA-256 `816a62cf63c4c801277eb9ae9b0e54b5283422108df8eadf703865890f2a7267`.
- archive SHA-256 `9b702cd11654f1c489232389e38fb583012f348636e4592e6f199da8227782be`.
- 초기 release `/srv/hjm-storybook/releases/957cf07f19d7b276e283754c219212ac73f4f4fe-816a62cf63c4`.
- edge `/etc/caddy/conf.d/hjm-storybook.caddy`, 공용 host lock `/opt/burntok/deploy.lock`.
- DNS는 기존 storybook record 없음 확인 후 A 51.79.240.56 TTL300 저장/별도 row readback,
  외부 dig 및 정상 인증서 검증 HTTPS 200으로 확인했다. 다른 DNS record는 변경하지 않았다.

## 4. 수정·검증

artifact는 exact source/CI run과 public closure·byte/hash를 포함한다. 파일 삽입·수정·symlink·숨김 env·
다른 source·빈 index·기존 output 덮어쓰기/입력 내부 output을 거부하는 Python 4 tests를 통과했다.
publisher는 archive hash → 설치 closure → loopback 후보 모든 file/cache/404 → current 원자 교체 →
Caddy validate/reload 순서다. 다른 snippet/컨테이너/DB는 교체하지 않았다.

- loopback 18086에서 464파일 hash/cache/nosniff와 `/__missing__`, `/.env`, `/manifest.json`, `/artifact.py` 404 통과.
- 실제 HTTPS에서 같은 464파일 hash/cache/nosniff 및 4 음성 경로 통과. 인증서 우회 없음.
- 첫 직후 ACME 준비 중 TLS internal error, 그 뒤 Mac Python concurrent DNS의 일시적 NXDOMAIN을 관측했다.
  curl와 실제 브라우저는 정상 응답했다. checker를 curl의 일반 DNS/TLS 검증으로 바꾸고 전체 재검사했다.
- macOS tar가 provenance xattr PAX warning을 반복했지만 파일 bytes 검증은 일치했다.
  다음 전송은 Python tar writer로 해당 metadata를 포함하지 않도록 고쳤다.
- HJM docs link 검사 603문서, release governance source 검사, `bash -n`, 변경 diff check 통과.
- 새 pipeline/config source `f9703052d3e6d30ecf5641d466cbb098c0ce1aba`의
  [run 37951022211](https://github.com/jim1286/hjm-design-system/actions/runs/37951022211)은 최근 component 변경의
  Native composition test 두 `find()` 결과가 undefined일 수 있어 typecheck TS2532로 실패했다.
  해당 fixture가 measurement host 누락을 명시적으로 실패하도록 보정했다. 제품 동작·버전은 바꾸지 않았다.
- 보정 source `73f09040c70d16156ea833e35564b134525f3974`: Native typecheck 및 해당 test 11개 통과.
  [후속 run 37951528029](https://github.com/jim1286/hjm-design-system/actions/runs/37951528029)은 최근 ChatMessage의
  바깥 article 추가와 맞지 않는 React SSR fixture 1개에서 실패했다. 바깥 layoutStyle 적용 횟수 검증을 유지하고
  실제 바깥 article을 확인하도록 보정했다. source `f73174d666227b75c037d41ac73099241191d475`, 해당 SSR 102 tests 통과.
- 실제 in-app browser에서 `/` 진입 → 기존 `foundations-colors--default` story와 color preview 표시 확인.
  전체 component UI/Native device QA를 이 hosting 검사로 주장하지 않는다. 최대 글자 검사는 범위 밖이다.

## 5. 소비 링크와 포트폴리오

- HJM GitHub repository homepage: old Pages → 새 Storybook URL PATCH + 별도 GET 일치.
- GitHub profile README의 old Storybook 참조 1개를 exact 기존 blob SHA로 갱신/전체 bytes 재조회.
  commit `c8ffa64118005dff5c32e968562fe54685078b74`. 계정/저장소 URL은 유지했다.
- HJM README·AGENTS·release governance·배포 실행서와 root DP 1.8에 이관 이유/경로/공개 증거 경계를 반영했다.
- 포폴은 기존 developer facts의 공개 Link로 Storybook 행을 추가했다. label은 기존 한국어 source catalog에 있다.
  source `b802c5a448b5813e5ed0f6c5add3f014deceece2`, main push/ls-remote 일치.
  Node 24.20.0 / pnpm 11.24.0 `pnpm check`(12 tests, i18n fixture, docs, snapshot, TypeScript, build)와
  Hub source `policy:check` 통과. 자체 도메인 공개 27파일 SHA 일치, developer 섹션의 실제 링크 표시 확인.
- 포폴 release `/srv/portfolio-site/releases/b802c5a448b5813e5ed0f6c5add3f014deceece2-0f4a82b37635`,
  manifest `0f4a82b37635a0bebe1233161f0939e9fa4b17206f5502f5358c82ae8c88b608`,
  archive `ecda8493728b8e613715753dbef9a2360e3ba5863aa4d90d9c73e66655949438`.
  previous는 기존 `1996ea1419ae282458937a0ee8d0b2f53f21c851-1080046dcea3`를 보존했다.
  준비 명령의 잘못 입력한 SHA는 HEAD 검사로 거부됐고, 확인한 exact SHA로 준비/게시했다.
- 역사 research/QA의 old Pages URL, 고정 소스/credential 원본, 제출 이력서 파일은 일괄 치환하지 않는다.

## 6. 기존 서비스·복구·종료 정리

Caddy active, 정책 root 200 및 기존 release `2a590c361de3055a5c7cb9e2aea2fe5a9002563f-5cf044749441` 유지.
BurnTok readiness는 database/redis up, revision `a598cca68bc7d8d7ba3169d044de4e937cd03f72` 유지했다.
www는 locale path/query를 보존하는 308이다. 새 rollback 절차는 실행서에 있으며 실제 rollback drill은 아직 미실행이다.
main 이외의 작업 branch/worktree는 만들지 않았고 root·HJM·Portfolio 등록은 각각 main 하나뿐이다.
QA 요약을 보존한 뒤 이 작업의 `/tmp/hjm-storybook-migration-20261010` archive/public·CI 로그·임시 파일을 제거했다.
운영 release/manifest·재사용 도구·tests를 보존했다. 작업용 branch/worktree 제거 대상은 없었다.
별도 포폴 검사 탭은 닫고 최종 Storybook 탭은 결과로 남겼다. 다른 세션의 source·문서·프로세스·탭은 보존했다.

## 7. 파이프라인 최종 결과

[최종 run 37952457447](https://github.com/jim1286/hjm-design-system/actions/runs/37952457447)은
exact head `f73174d666227b75c037d41ac73099241191d475`로 intent/verify/deploy 모두 success다.
기존 전체 `pnpm ci:check`와 publisher 4 tests를 통과하고 delivery artifact와 Pages 이동 안내를 각각 업로드했다.
검사를 생략하거나 workflow의 release gate를 완화하지 않았다. 이후 main의 다른 기능 변경은 이 산출물에 포함되지 않는다.

- artifact `hjm-storybook-f73174d666227b75c037d41ac73099241191d475`를 다운로드하여 source/run/464파일 closure 일치 확인.
- manifest SHA-256 `4ba7d0b25655caad5402666c1b1a5030b3e9b832791b021e2e376fdc7cc28919`.
- archive SHA-256 `34aff70a4be3884177b46d31c8b49cf7c4b63bc9b601de43019f6b41942b4efe`.
- 최종 current `/srv/hjm-storybook/releases/f73174d666227b75c037d41ac73099241191d475-4ba7d0b25655`.
  previous는 초기 source `957cf07f19d7b276e283754c219212ac73f4f4fe-816a62cf63c4`를 보존했다.
- 후보 loopback 및 실제 HTTPS 각각 464파일 hash/cache/nosniff와 4 미등록 경로 404 통과. index 970 entries.
- Pages `/`, `/iframe.html`, `/404.html`의 공개 bytes가 추적한 이동 안내와 일치했다.
  실제 브라우저에서 old `?path=/story/foundations-colors--default#migration-check`가 새 origin의 동일 query/hash로 이동했다.
  old `iframe.html?id=foundations-colors--default&viewMode=story#preview-check`도 path/query/hash 유지 및 color preview 표시 확인.
- 최종 재조회: Caddy active, 포폴·정책 current 그대로, 정책 HTTPS 200, www locale/query 유지 308,
  BurnTok readiness database/redis up 및 기존 revision 유지.
- GitHub 저장소/artifact 읽기와 서버 SSH 관리 권한이 있는 다른 계정·컴퓨터도 같은 게시 명령을 사용할 수 있다.
  다른 계정에 새 권한을 부여하거나 credential을 발급한 작업은 아니다. npm/모바일 앱 버전은 변경하지 않았다.
