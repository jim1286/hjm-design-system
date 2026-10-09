# Storybook 자체 도메인 게시

2026-10-10 사용자 승인으로 Web Storybook의 대표 주소를 `https://storybook.jmstudioapps.com/`으로 옮긴다.
특정 Codex/Sites 계정에 의존하지 않고 GitHub에서 검사한 고정 artifact를 SSH로 게시하는 것이 목적이다.
이번 도메인 이관은 앞선 정책·포폴 이관의 직접 배포 승인을 이어 개발 Mac에서 수행하며,
반복 delivery는 mac-ci 또는 권한이 있는 배포 환경이 맡는다. React Native showcase·npm 버전은 변경하지 않는다.

## 빌드와 artifact

기존 `showcase.yml`의 main fixed-train 버전 상승/명시적 수동 실행 → `pnpm ci:check`를 유지한다.
검사한 `showcase/web/storybook-static`을 `artifact.py prepare`로 파일 closure/hash·source SHA·CI run ID와 묶는다.
`hjm-storybook-<source SHA>` Actions artifact는 manual delivery 시간을 확보하면서 누적을 제한하도록 30일 보존한다.
일반 개발 push에서 전체 검사를 실행하거나 게시하지 않는다. 고정 artifact는 그 이후 source commit과 별개다.

```sh
# gh로 실제 성공 run의 artifact를 내려받고 headSha·검사 job·artifact name을 먼저 확인한다.
gh run view <run-id> --repo jim1286/hjm-design-system --json headSha,status,conclusion,jobs
gh run download <run-id> --repo jim1286/hjm-design-system --name hjm-storybook-<source-sha> --dir /absolute/new/artifact
python3 deploy/storybook/artifact.py verify /absolute/new/artifact <source-sha>
bash deploy/storybook/publish.sh /absolute/new/artifact ubuntu@51.79.240.56 /absolute/ssh-key-file <source-sha>
python3 deploy/storybook/artifact.py check-http /absolute/new/artifact https://storybook.jmstudioapps.com
```

Python 3, curl, Bash, SSH/SCP 및 known_hosts가 필요하다. 빌드는 Node 24·pnpm 11.18.0 frozen install을 사용한다.
빌드 파일을 현재 dirty checkout에서 재생성하지 않고 검사한 artifact 그대로 승격한다. SSH key 원문은 Git/로그에 넣지 않는다.
다른 계정/컴퓨터는 GitHub 저장소·artifact 읽기와 서버 SSH 관리 권한을 따로 받아 같은 명령을 실행한다.
키 경로는 호출자가 제공하며 특정 사용자 경로를 스크립트에 고정하지 않는다.

## 운영·검증·복구

- DNS: OVH `storybook` A `51.79.240.56`, TTL300. HTTPS는 기존 Caddy가 관리한다.
- web root: `/srv/hjm-storybook/current/public`; releases는 `<source-sha>-<manifest-prefix>`.
- edge snippet: `/etc/caddy/conf.d/hjm-storybook.caddy`. 다른 snippet/컨테이너/DB는 교체하지 않는다.
- 포폴·정책·BurnTok과 `/opt/burntok/deploy.lock`을 공유한다. 전송 archive hash, 설치 closure/hash,
  loopback 18086 후보의 모든 file status/hash/cache 및 음성 404 검증 후 current를 원자 교체한다.
- HTML/index는 revalidation, Vite content-hash assets만 1년 immutable, 나머지는 300초다.
  임의 URL을 manager HTML로 반환하지 않는다. `?path=/story/...`와 `iframe.html?id=...`는 실제 파일을 사용한다.
- source.sha·manifest.json·archive.sha256·deployed.at·edge.caddy는 release root에 보존하고 web root에 공개하지 않는다.
- 전환 실패 시 이전 current/snippet을 복구한다. 게시 뒤 HTTPS 실제 bytes와 Storybook UI/iframe을 확인해야 완료다.
- 후속 rollback은 host lock을 잡고 previous symlink와 해당 release의 edge.caddy를 복원한 뒤
  Caddy validate/reload와 공개 검증을 수행한다. 첫 배포는 previous가 없어 새 snippet 제거·기존 Pages 유지가 복구 경로다.

GitHub Pages는 `deploy/storybook/redirect`의 이동 안내를 게시한다. index/iframe/404 안내는 path/query/hash를 보존한다.
HTTP 서버 301/308이 아니라 HTML/JS 이동이다. 알 수 없는 old path의 404 이동 안내는 브라우저에서만 실행된다.
기존 Storybook id와 이력은 보존한다. 배포 source와 pipeline/config SHA·검사 run은 작업별 QA에 따로 기록한다.
