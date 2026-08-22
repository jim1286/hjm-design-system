# Changesets

사용자에게 영향을 주는 package 변경에는 `pnpm changeset`으로 changeset을 추가합니다.
세 public API package는 fixed group이므로 한 package가 release되면 모두 같은 버전으로
올라갑니다. 이 저장소는 현재 Git tag/package-path 배포를 사용하며 npm publish는 별도
결정 전까지 수행하지 않습니다.

Generated version commit이 `main`의 HEAD에 도달하면 `Version Packages` workflow가 전체 release
gate를 통과한 동일 commit에 canonical `v<version>` tag를 생성합니다. version PR을 병합하거나
authored source commit과 generated version commit을 한 번에 push할 수 있습니다. 이미 존재하는
tag는 건너뛰므로 일반 main push가 release를 중복 생성하지 않습니다.

최초 모노레포 PR도 예외로 빈 Changeset을 쓰지 않습니다. 0.5.2 package baseline과 세
fixed package의 실제 `minor` Changeset을 적용하면 version command가 0.6.0 source·lockfile·generated
artifact를 만들고, 그 generated commit만 `v0.6.0`으로 태그됩니다. 이후 사용자 영향 변경도
같은 경로를 따릅니다.
