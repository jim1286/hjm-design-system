# Consumer release gate

HJM의 canonical `v<version>` tag는 private consumer인 Yajalal Native와 BurnTok Web의
Storybook inventory가 같은 canonical release commit의 generated manifest와 맞는 경우에만
생성됩니다. canonical repository는 public이고 두 consumer는 private이므로, public caller가
private reusable workflow를 직접 호출할 수 없습니다. 자동 gate는 canonical에만 보관한 단일
fine-grained token으로 두 consumer에 `repository_dispatch`를 보내고 결과 evidence를 검증합니다.

## 실행 순서

1. authored Changeset을 포함한 source commit 뒤에 generated version commit을 HEAD로 둡니다.
   두 commit을 한 번에 push하거나 Changesets version PR을 별도로 병합할 수 있습니다. 어느
   방식이든 package version을 바꾼 commit이 push의 최종 commit이어야 합니다.
2. `version` job은 fixed package version commit을 식별하고 package, renderer, Storybook,
   committed artifact를 검증합니다.
3. `scripts/check-consumer-release.mjs`는 두 consumer의 default branch HEAD가 코드에 고정된
   reviewed full SHA와 같은지 확인합니다.
   - BurnTok `main`: `58794d4bbd5597ab6d6101f8888307eea08f67ee`
   - Yajalal `develop`: `e4164cc5207e48faf4a164dea3ce9475e63c0242`
4. script는 `{ repository, release_sha, version, correlation_id, consumer_ref }` payload로 두
   `hjm-release-candidate` event를 보냅니다. consumer workflow는 자체 checkout을
   `consumer_ref`에, public canonical checkout을 `release_sha`에 고정하고 실제 HEAD를 다시
   비교합니다.
5. canonical은 workflow 파일, event, evaluated run name, 생성 시각, consumer `head_sha`가 모두
   일치하는 단 하나의 run만 추적합니다. 다른 commit의 run이나 과거 성공 run은 재사용하지
   않습니다.
6. 두 run이 모두 `success`여야 하며, 각 run에서 다음 고유 artifact가 정확히 하나 생성되어야
   합니다.
   - `hjm-consumer-evidence-burntok-<correlation-id>`
   - `hjm-consumer-evidence-yajalal-<correlation-id>`
7. canonical은 artifact ZIP을 다운로드해 evidence JSON, generated manifest, Yajalal dispatch
   record 안의 repository, canonical release SHA, consumer SHA, version, correlation ID를 다시
   exact-join합니다. artifact가 비었거나 만료됐거나 내부 값이 다르면 실패합니다.
8. 위 검증이 모두 끝난 뒤에만 같은 job의 tag step이 실행되어 현재 HEAD에 `v<version>`을
   생성합니다. token 누락, dispatch 실패, timeout, cancelled/failure run, artifact 누락 또는
   payload 불일치는 모두 tag 생성을 막습니다.

## Secret과 최소 권한

canonical `hjm-design-system` repository에 Actions secret 하나만 둡니다.

- 이름: `HJM_CONSUMER_SYNC_TOKEN`
- 종류: fine-grained personal access token 또는 동등한 GitHub App token
- repository access: `jim1286/BurnTok`, `jim1286/yajalal`만 선택
- repository permissions:
  - `Contents: Read and write` — `repository_dispatch` 생성
  - `Actions: Read-only` — workflow run과 evidence artifact 조회·다운로드

consumer repository에는 `HJM_CANONICAL_READ_TOKEN`이 필요하지 않습니다. canonical은 public이라
consumer의 기본 `GITHUB_TOKEN`으로 full SHA를 읽을 수 있고, consumer 자체 private checkout은
각 consumer run의 기본 token으로 수행합니다. broad classic PAT를 복제하거나 소비 앱에 canonical
token을 저장하지 않습니다.

`HJM_RELEASE_TOKEN`은 기본 `GITHUB_TOKEN`으로 Changesets PR을 만들 수 없는 운영 정책에서만 쓰는
별도 선택 사항이며 consumer evidence 신뢰 경계와는 무관합니다.

## 이 gate가 증명하는 것과 증명하지 않는 것

이 gate는 canonical release SHA의 active ID가 실제 exported CSF story에 빠짐없이 연결되고,
BurnTok에서는 built Storybook index에, Yajalal에서는 generated Native registration과 Storybook
CSF index 해석 결과에 결합됐음을 증명합니다. known planned ID는 문서 registration으로만 남고
active evidence에는 포함되지 않습니다.

inventory 일치만으로 dark/RTL/large-text/accessibility scenario가 실행됐다고 주장하지 않습니다.
새 tag가 생성된 뒤 consumer dependency를 그 tag의 package path로 올리고 각 앱의 CI/device gate를
통과시키는 작업도 별도 adoption 단계입니다.
