# QA 리포트 — HJM Native Showcase iPhone 개발 클라이언트 갱신

## 1. 최종 판정

- **부분 확인**: Debug 네이티브 빌드·서명 검증·실물 iPhone 설치 통과. 전체 사용자 흐름과 운영 Release 검증은 별도다.
- 앱: `dev.hjm.designsystem.showcase` · 0.1.0(1).
- 빌드 시작: 2026-10-07T13:01:11.727293+09:00 · 설치 완료: 2026-10-07T14:37:34.449589+09:00 (Asia/Seoul).
- 개발 서버 URL을 전달한 process launch: passed.
- 개발 Firebase config SHA-256: `기존 설정/해당 없음`.
- 개발 Firebase identity: 기존 설정/해당 없음 · plist bundle ID: 기존 설정/해당 없음.
- 기기 실행 process 관찰(새 설치 bundle 경로 일치): [{'pid': 40414, 'installed_bundle_path_match': True}].
- Metro 관찰: iOS Bundled markers observed after private URL launches; product screens not inspected.
- 기존 설치 앱 inventory 동일: True. 보호한 운영 identity: {'com.jimin.diairy': {'version': '1.4.2', 'build': '36', 'unchanged': True}, 'com.jmstudioapps.spint': {'version': '1.0.4', 'build': '8', 'unchanged': True}, 'app.burntok.mobile': {'version': '1.5.1', 'build': '33', 'unchanged': True}}.
- Debug development signature(get-task-allow=true) 확인: True.
- 개발 signing profile 확인: 기존 설정/해당 없음.
- Credential audit: 해당 변경 없음/별도 실행하지 않음.
- Analytics 정적 검사: 별도 실행하지 않음.
- 최종 설정 확인: 기존 설정/해당 없음. app.config SHA-256: `초기 snapshot`.

## 2. 대상과 이력

- HJM Native Showcase iOS 개발 앱. 수행자: Codex. 브랜치: `main`.
- 빌드 복사본 HEAD: `bd41c5a2ab0abbc6458bf985851865ccb8747f9c`. 기존 미커밋 소스를 포함: True.
- 실제 빌드 artifact: `/Users/jimin/Library/Application Support/PortfolioDev/BuildUpdates/20261007-1255/artifacts/hjm.app`. 설치 대상은 `.dev` 개발 identity(HJM은 전용 showcase identity)다.
- 운영/TestFlight identity로 빌드·설치·업로드하지 않았다. 모펀은 갱신 범위에서 제외했다.

## 3. 환경과 검증 범위

- 실물 iPhone 12 Pro · iOS 27.2 · 케이블 연결 · Developer Mode enabled.
- Xcode 27 / iPhoneOS 27 SDK · Debug arm64 · Node 24.20.0 · pnpm 11.24.0 · CocoaPods 1.17.0.
- 기존 공용 source/iOS/DerivedData를 보호하기 위해 APFS 복사본과 작업 전용 DerivedData 사용.
- Native 입력 snapshot SHA-256: {'showcase/native/package.json': 'c76d8ca47367a9bc1df495d5feb8865ad173d11df91b3c266f671aae8670a725', 'showcase/native/app.json': '304ced1e3af1f56cf21205aec4866367cd45f0cc0e51f65ab802fcbd7cb638ae', 'pnpm-lock.yaml': '7672d95309508e6d33ff443d1b06f54974825b17a6d13f162b2a9a6b83ca532e'}. 최종 config 변경은 위 최종 digest로 구분한다.
- 실제 로컬 개발 API: 사설 Tailscale HTTPS, 포트 없음. Metro는 기존 개발 runtime을 재사용한다.
- 2026-10-07 로컬 readiness 응답과 4개 API의 developmentLogin/dev=true를 확인했다. Serve의 private HTTPS listener와 공개 Funnel 비활성도 확인했다. Mac은 userspace Tailscale여서 시스템 DNS/IP로 직접 요청한 원격 probe는 실패했고, 이 관찰을 iPhone 연결 장애로 단정하지 않는다. 실제 iPhone 사설 URL 연결은 별도 launch·Metro 관찰 범위로만 보고한다.
- 로그인·locale·테마·큰 글자·알림·사진·위젯 등 사용자 흐름은 이번 설치 검사에서 실행하지 않았다.

## 4. 확인 결과·발견한 문제·재현과 수정

| 시나리오 | 결과 | 판정 |
| --- | --- | --- |
| iPhoneOS Debug 빌드 | xcodebuild exit 0 | 통과 |
| 서명·identity | codesign deep/strict 검증 및 전용 bundle ID 확인 | 통과 |
| 실물 기기 설치 | devicectl install app exit 0 | 통과 |
| iOS scene configuration | UISceneConfigurations 존재: True | 통과 |
| Firebase SDK 자동 통계 수집 | Info.plist 값: None | 해당 없음 |
| 개발 서버 URL로 process launch | passed | 통과 |
| 실제 화면과 제품 기능 | 직접 화면·상호작용 미검증 | 미확인 |

- 빌드 전 임시 경로 보완 도구가 expo-constants의 직접 node_modules 링크를 가정해 실패했다. HJM은 이 패키지를 전이 의존성으로 받으므로 직접 링크가 없으며, 공백 없는 전용 복사본에서는 해당 basename 보완이 필요하지 않다. 선택적 링크가 없으면 건너뛰도록 작업 전용 도구만 보완했고 원본 dependency·lockfile은 바꾸지 않았다.

## 5. 검사·관찰 결과

- 앱 루트의 development 환경으로 `expo prebuild --platform ios --clean --no-install --skip-dependency-update react,react-native`, `pod install`을 실행했다. 정리 대상은 별도 복사본의 ios뿐이다.
- `HJMNativeShowcase` workspace/scheme에 `xcodebuild -configuration Debug -sdk iphoneos -destination generic/platform=iOS -jobs 2`, 전용 DerivedData, 자동 development signing을 적용했다. 공유 Mac 부하를 줄이기 위한 2 jobs이며 Release/스토어 경로를 사용하지 않았다.
- Debug 클라이언트는 Metro를 사용하므로 번들 내장은 생략한다. 별도 복사본은 IDE 편집 대상이 아니어서 번뚝 초기 빌드를 제외하고 compiler index store를 끈다.
- 서명 검사는 `codesign --verify --deep --strict`, 설치는 `devicectl device install app`으로 수행했다.

| 단계 | exit code |
| --- | --- |
| prebuild-initial-path | 0 |
| prebuild | 0 |
| pods | 0 |
| build | 0 |
| signature | 0 |
| install | 0 |
| launch | 0 |

서명된 실행 파일 SHA-256:

- `HJMNativeShowcase`: `a0210a53b80ee14e06e826707c03a63c1fbe0811c3f4addea58457f62c60ef4e`
- `HJMNativeShowcase.debug.dylib`: `450f85b9e4a0ea4dfe896fec256adac63ace095aebff3785f52ebb2ebf34b289`

## 6. 미확인 범위와 후속 조건

- 실제 앱 화면·로그인·Fast Refresh·권한·알림·위젯·사진·번역/OCR 기능: 설치 이후 제품별 기기 흐름 검증 필요.
- 운영 API, 운영 Release 성능, TestFlight/스토어 업로드·심사·공개: 이번 작업 범위 밖. 개발 빌드 성공을 운영 검증으로 사용하지 않는다.
- Firebase 콘솔 이벤트 도착·네트워크 전송 전체: 확인하지 않았다. 자동 통계 수집의 기본 차단은 생성된 plist로만 확인했다.

## 7. 보관 처리

- 검사 이력·실패 원인·재현 조건·보완·한계를 이 리포트에 통합했다.
- 이번 작업의 원시 빌드/설치/launch 로그·기기 목록 JSON·임시 스크립트·복사본·중간 빌드 파일을 제거했다. 다른 앱과 다른 세션의 런타임·출력·공용 캐시는 보존했다.
- 서명된 `.app`은 동일 개발 클라이언트 재설치에 필요한 산출물로 보관한다. 새 개발 빌드로 대체되면 삭제할 수 있다.
