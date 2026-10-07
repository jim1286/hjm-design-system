# 실험 전체 승격·1.16.0 릴리스·소비 제품 도입

## 1. 최종 판정

부분 확인. 현재 등록된 실험 8개 승격과 HJM 1.16.0 npm 세 패키지 게시·tag 확인은 완료했다. 소비 제품의 전면 도입·디자인 QA는 진행 중이다.

## 2. 대상과 이력

- 2026-10-08 KST, Codex 수행. 승인 원문과 8개 최종 경로는 [탐색 규격 §2](../STORYBOOK_NAVIGATION.md#2-승인-기록)에 있다.
- 시작 main: `5d314ebe52715c4341801fc0dfdcef0cecacd631`. 승격·peer train 준비: `92cab2cb`.
- 공유 checkout의 기존 댓글 관련 19개 dirty 경로를 제외하고, 별도 main clone에서 버전 생성과 전체 릴리스 검사를 수행한다. 공유 런타임은 재시작하지 않았다. 최종 문서 pnpm 검사에서 자동 frozen 확인이 `Already up to date`로 끝났으며 공유 dependency manifest·lock을 수정하지 않았다.
- 제품별 도입 후 디자인 QA를 마치고 다음 제품으로 넘어간다. 사용자의 병렬 요청에 따라 소비 제품의 읽기 전용 현황 조사는 세 에이전트가 분담한다.

## 3. 환경과 검증 범위

- macOS, Node 24.20.0, pnpm 11.18.0. 별도 clone에 frozen/offline 설치 890개, 다운로드 0.
- 이번 승격은 제목·상태·지침 변경이며 Web ID 970개를 유지한다.
- 최대 글자 크기는 사용자 지침에 따라 설계·검사·완료 조건에서 제외한다.

## 4. 확인 결과와 수정

- 승격 직후 사용 지침 검사에서 8개 문서의 상태 필드가 실험으로 남은 것을 검출했다. 담당 제목과 상태·검토일을 함께 갱신하고 사용 지침 색인을 재생성해 통과했다.
- 1.16.0의 additive API 변경에 맞춰 버전 생성 전에 두 renderer의 contracts peer를 `>=1.16.0 <1.17.0`으로 갱신했다. 근거는 [릴리스 계약](../RELEASE_GOVERNANCE.md)에 남겼다.

## 5. 검사 결과

| 검사 | 현재 확인 결과 |
| --- | --- |
| Storybook 규격 | 433개 파일, Web ID 970개 통과 |
| 사용 지침 | 토큰 13·컴포넌트 139·구성 59·화면 22 통과 |
| workspace 정합성 | 승격 소스의 기존 1.15.0 train / authored next peer 통과 |
| 문서 링크 | 공유 checkout 602개 문서 통과 |
| release:version | 별도 clone에서 1.16.0 생성·build·evidence sync 완료 |
| release:check | 전체 명령 exit 0. contracts 100파일/1030건, Web SSR 18파일/278건·브라우저 119파일/1156건, Native 116파일/1263건 통과(기존 12 skip), Native Showcase 6파일/21건, Web Showcase 15파일/48건 |
| Native Metro | Android production JS: 67 family·700모듈·1492.1KiB raw·368.7KiB gzip·11.38초. Native binary/기기 QA가 아님 |
| Storybook production | build·static 검증 통과. 실제 index 970개, 실험 prefix 0개, canonical 103개/탐색 페이지 13개 |
| release:commit:check HEAD^ | Changeset 10개를 소비한 fixed 1.15.0 → 1.16.0 commit 통과 |

원격 main은 `4df598a608b1592f45ef8fc9eb4d7b55c589599f`로 직접 확인했다. [Release Packages 실행 37677671554](https://github.com/jim1286/hjm-design-system/actions/runs/37677671554)는 성공했다. 버전 상승 Showcase workflow도 성공했고 Visual workflow도 성공했다. 로컬의 기존 React act 경고·번들 지시문 경고는 테스트 실패가 아니며 원시 로그 정리 전 보존했다.

npm 최초 조회에서 세 패키지가 404였고, 이후 Native → React → contracts metadata/tarball 순으로 관찰 가능해졌다. 재게시하지 않았다. 최종적으로 중앙 `sync-design-system.mjs --version 1.16.0` dry-run과 `--write`가 세 package tarball SHA-512·manifest·catalog·tag commit을 모두 검증해 exit 0이었다. npm 서버 내부 지연 원인은 확인하지 않았으며 단순 workflow 성공만으로 설치 가능을 판정하지 않았다.

## 6. 미확인 범위와 후속 조건

1. 전체 로컬 검사·원격 main 통합·정식 게시 및 registry 확인은 완료. 별도 Visual workflow 결과는 확인 중이다.
2. 중앙 release record는 전용 meta 작업트리에서 갱신했고 검사/통합 중이다. Portfolio Site부터 모든 활성 소비 제품과 정책 HTML 생성 모듈을 순차 적용한다.
3. 앱마다 실제 화면·구성·컴포넌트 채택과 제품 브랜드 연결을 완료하고, 모든 운영 표면의 디자인 QA 결과를 해당 제품 리포트에 기록한다. dependency/contract 버전만 바꾼 상태는 전면 도입 완료가 아니다.
4. 현재 조사 등록 149건의 후보 판단과 Storybook 등록 8개는 다른 범위다. 이번 승격을 모든 후보의 구현 완료나 11개 사이트 전 페이지 검토 완료로 보고하지 않는다.

## 7. 보관 처리

실행 중 원시 로그는 저장소 밖 임시 경로에 둔다. 검사가 끝나면 결과·실패·검증 한계를 이 리포트에 합치고 해당 작업의 원시 로그와 빌드 산출물을 정리한다. 다른 세션의 변경·런타임·산출물은 보존한다.
