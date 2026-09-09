# HJM Design System 라이브러리 적용 정책

기준: 2026-09-08. [포트폴리오 공통 정책](https://github.com/jim1286/app-portfolio/blob/main/docs/LIBRARY_POLICY.md)과
[Query 정책](https://github.com/jim1286/app-portfolio/blob/main/docs/libraries/TANSTACK_QUERY_POLICY.md)을 이 저장소에도 적용한다.
라이브러리 선택은 제품의 framework·runtime 경계 안에서 하며, 모듈마다 별도 원칙을 복제하지 않는다.
중앙 변경을 아직 게시하지 않은 로컬 적용에서는 함께 둔 `app-portfolio` checkout의 같은 경로를 원문으로 읽는다. GitHub 링크는 게시 후 소비 경로이며 원격 반영 완료를 뜻하지 않는다.

공용 계약·React·React Native renderer가 각각 호환성 원문을 소유한다. renderer의 React 계열은 peer 계약이며 앱 상태·QueryClient·HTTP·인증·제품 API를 DS로 가져오지 않는다. 변경은 공개 API·접근성·대표 소비 앱 영향으로 검증한다. 상세 배포 범위는 RELEASE_GOVERNANCE 문서를 따른다.

대표 구현의 실제 진입 파일·수정 근거·동작 검사·미검증 범위는 [2026-09-08 구현 경계 조사표](https://github.com/jim1286/app-portfolio/blob/main/docs/audits/2026-09-08/LIBRARY_BOUNDARIES.md)의 이 저장소 행을 따른다. manifest와 lock의 전체 위치·직접 선언은 같은 감사의 `library-inventory.json`이 기록한다.

## 의존성 및 변경 계약

- 실제 버전은 각 manifest와 lockfile이 원문이다. 중앙 [등록부](https://github.com/jim1286/app-portfolio/blob/main/docs/library-policy.json)의 `hjm-design-system` 항목은 채택한 라이브러리·허용 버전 계열·Query 소스 소유권을 기록한다.
- 적용 분류: `framework`, `native-platform`, `storage`, `testing`, `toolchain`, `ui`.
- manifest 추가·이동·삭제는 중앙 `repositories.hjm-design-system.manifests`와 실제 패키지 소비 관계를 함께 갱신한다. 빈 manifest도 등록한다.
- 새 라이브러리·다른 major 계열·Git/path source 변경은 사용 목적, 기존 기능 중복, renderer/서버 경계, 제거 방법과 관련 검증을 기록한 뒤 중앙 등록부도 갱신한다.
- HTTP는 runtime별 공용 transport, runtime 입력은 소유 schema, 비밀은 secure adapter, UI 로컬 상태는 화면/도메인 owner를 사용한다. 별도 캐시·HTTP client·schema를 화면에서 임의로 만들지 않는다.
- 버전 숫자를 맞추기 위한 framework 호환성 무시나 불필요한 패키지 추가는 하지 않는다. peer·SDK·빌드 도구는 해당 호환성 계약을 우선한다.

## 검사와 증거

포트폴리오 루트에서 다음을 실행한다. 독립 checkout의 설치·제품 검사는 해당 저장소의 기존 명령을 사용한다.

```bash
npm ci --ignore-scripts --prefix scripts/library-policy-tools
node scripts/check-library-policies.mjs --module hjm-design-system
```

중앙 검사는 direct manifest 경로·등록·버전 계열·근거 파일 존재와 등록된 Query key factory/생성 위치를 검사한다. 문서 내용의 정확성이나 모든 간접 호출까지 증명하지 않는다.
API 요청의 모든 입력, 계정 격리, persistence race, 실기기 동작은 해당 행동 테스트와 QA로 확인한다.
이 문서와 정적 검사 통과만으로 전체 library API의 런타임 검증이나 원격 required gate 설치를 주장하지 않는다.
