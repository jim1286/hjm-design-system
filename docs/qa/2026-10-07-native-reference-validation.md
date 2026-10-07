# QA 리포트 — 레퍼런스 실험 Native 적용 검수

## 1. 최종 판정

**부분 확인**. 실제 iOS 개발 호스트에서 글자 역할·종이 표면·유한 카드 탐색과 상세 입력, 내용 전환·날짜/시각·명령 기록의 선택 흐름을 확인했다.
종이 실험의 접힌 화면과 보이지 않는 선을 수정했다. 조사 범위는 필요한 적용 판단으로 마무리했으며
11개 사이트의 모든 페이지 검토, 전체 Native/Android/VoiceOver 검수, npm 게시 또는 소비 앱 반영을 뜻하지 않는다.

실행: 2026-10-07 20:11–20:33 Asia/Seoul · 수행자 Codex · main.

## 2. 대상과 이력

- 시작 HEAD `13d55253a36df7b0e8794cc6a7d8aee343a769d4`. CollectionRail/글자 역할/ruled의 기존 Web·host 결과를 재실행 영수증으로 사용하지 않고 이번 기기 결과를 별도로 기록한다.
- 최종 Native EffectSurface/종이 preview 수정과 생성 dist 포함. 공유 comments 변경도 Metro checkout에 존재하지만 이 작업에서 stage하지 않는다.
- 수정 전 종이 Default: 비교 도구/설명만 있고 화면 본문과 입력이 없음. flex 화면의 부모에 높이가 없었기 때문이다.
- 중간 `flex:1` 부모로 화면이 복구됐지만 비교 도구가 route 공간을 많이 차지했다. 최종은 기존 테마 비교와 같은 640unit viewport와 바깥 ScrollView로 정리했다.
- 수정 전 ruled/40/명시 강도0.12에서 선이 보이지 않음. 최종은 spacing×spacing 타일/명시 Rect 폭/명시 content units로 iOS 래스터를 확인했다. 배경 장식은 Animated 밖에 유지한다.

| 최종 실행 source | SHA-256 |
| --- | --- |
| Native effect-surface.tsx | b3519787560356c94b7e14e021b56af6cd662ee2c8512fb91282f06d0d5f92de |
| Native paper-surface-preview.tsx | bf93a4847aaebcf8be997a493734cf527afc5339ea16b0daa676918208b37925 |
| Native font-role-preview.tsx | c315949f2adc2fdb38789cead04fd23872bb1619dfaa2ab57496bcda759c8b19 |
| Native collection-detail-preview.tsx | 045e73f5d4354f07c8fdac928251825f6f7d52056b44a6c93053a68da80e9d08 |

## 3. 환경과 검증 범위

- 기존 Device Hub의 iPhone17Pro · iOS26.5 · 논리 화면402×874. 창395×860point, 실제 창 캡처790×1720pixel.
- 설치된 HJMNativeShowcase `dev.hjm.designsystem.showcase` 0.1.0(1), embedded jsbundle 없는 개발 호스트.
- 저장된 bare Debug bundle 주소가 localhost:8084여서 이전 화면/미연결 inspector가 보였다. README 절차로 HJM의 RCT_jsLocation만 localhost:8187로 연결하고 앱만 재실행했다. 기존 Metro8187 PID54288을 재사용했고 실제 inspector의 iPhone17Pro 연결을 확인했다.
- 새 기기·추가 부팅·native build/prebuild/pod install·Metro 재시작 없음. 다른 제품과 기존 공유 기기는 유지했다.
- 직접 AXUIElement 조회와 실제 Device Hub 창 픽셀을 사용했다. Cua로 Device Hub를 연결하지 않았다. Storybook 진입에는 simctl deep link, touch/typing에는 idb를 보조로 사용했다. idb/simctl screenshot을 Device Hub 캡처로 부르지 않는다.
- 합성 한국어 기록이며 계정/서버/저장 없음. textScale1만 사용했고 최대 글자/모사 확대/LargeText는 실행하지 않았다.

## 4. 확인 결과·발견한 문제·재현과 수정

| 실제 흐름 | 관찰과 판정 |
| --- | --- |
| 앱 소유 설정 | ProductNotes/ProductReading 실제 렌더 확인. `Product66` 편집 후 산책 노트→숲→문장 모음에서 첫 화면 입력 유지. 실제 두 설정 선택과 구성 변화 확인; 모든 비교 tile/상태 검수 아님 |
| 글자 역할 Default | 영문 제목 serif·본문 serif·UI·기술 mono 구분, 한국어/숫자 표시. 특정 glyph가 요청한 명명 font에서 나왔다는 증거는 아니다 |
| 글자 상세에서 10종 light 테마 전환 | 실제 입력 `QA42`를 본문과 상세에서 확인, 다음 테마 10회 모두 같은 초안 유지, 닫기 후 원본 입력/화면 유지. VoiceOver 초점 증거로 확대하지 않음 |
| 글자 dark/RTL/terminal 상속 | 실제 화면 확인. terminal 상속에서 제목/본문/UI mono 표현 유지. 모든 OS font 자산/문자 범위/사용권 검수 아님 |
| 종이 최종 입력·기록·상세 | `Final55` 입력, 바깥 스크롤로 키보드 위 필드 확인, Return→기록 확인에 현재 초안 표시, 상세 같은 값 확인→닫기 |
| 종이 최종 10종 light 상속 | 같은 입력/확인 결과가 테마를 순회해도 유지, 화면/기록/입력 도달 가능. 한 번의 이동 직후 tap은 선택을 바꾸지 않았으므로 해당 이름의 캡처를 줄무늬40 통과로 사용하지 않음 |
| 종이 최종 10종 dark 명시 ruled40 | 실제 선택 표시와 canvas 확인, 본문/입력 도달 가능. RTL/ReducedMotion 첫 화면도 확인 |
| 종이 최종 light 재검수 | 정지된 Default→줄무늬 추가24→40→줄무늬 없는 면을 각각 실제 화면으로 확인. SVG 패턴 수정 후 선이 표시됨 |
| 카드 LTR 끝·처음 | 산책 메모 `QA88` 입력 후 끝까지 이동, 마지막 여행과 다음 비활성 확인. 이전으로 돌아와 입력 유지 |
| 카드 상세·테마 | 상세 메모 `Detail99` 입력 후 다음 테마에서도 유지. 닫기 후 원본 카드 메모 QA88 유지; 두 초안은 의도적으로 별도 fixture state |
| 카드 touch/RTL/dark/empty | touch 가로 이동과 복수 항목 노출, RTL 안정된 첫 산책/끝 여행·다음 비활성, dark/빈 상태 확인. 전환 직후 RTL 한 장의 중간 위치를 최종 anchor로 사용하지 않음 |

원인은 source와 실제 수정 전후로 제한한다. iOS의 한-unit tile/백분율 Rect 조합에서 선이 사라졌고,
물리 폭을 명시한 타일에서 선이 나타났다. 이를 모든 SVG 엔진의 일반 오류라고 주장하지 않는다.

## 5. 검사·관찰 결과

- `pnpm --filter @hjmds/react-native build`: 통과.
- Native `effect-surface`, `font-roles`, `collection-rail` 집중 host 검사: 3파일/11검사 통과(20:21, 662ms). 실제 기기 검수와 별도다.
- 같은 명령에서 Native Showcase `tsc --noEmit` 통과. 최종 ScrollView 변경 뒤 타입 검사 재통과. 문서 링크591개, usage(13토큰/139컴포넌트/59구성/22화면), Storybook433파일/969ID 및 renderer import-graph 경계 통과. Native effect-surface는 2모듈/14.5kB raw/4.2kB gzip이며 바이트 상한을 바꾸지 않았다.
- 실제 캡처의 빈 canvas margin x90–109/y900–1124에서 어두운 선 시작점: 24unit일 때 y900/940/980/1020/1060/1100(40pixel 간격), 40unit일 때 y940/1007/1073(67/66pixel 간격), plain은 해당 주기 선 없음. Device Hub 축척 약1.6625pixel/논리unit과 일치한다. 이 작은 래스터 비교는 전체 대비나 실물 기기 성능 측정이 아니다.
- 초기 직접 AX PID 조회는 일부 AppKit 경로에서 -1을 반환해 실패했다. 실제 Device Hub PID로 bounded AX 조회를 수행했고 0.37–1.8초, timeout -25204는 관찰하지 않았다. 지원하지 않는 attribute 오류는 성공으로 세지 않는다.
- QA 입력이 field를 focus하지 못한 초기 시도에서 개발 Inspector를 켰다. 초기 font modal sheet는 Inspector chrome이 뒤에 남아 있어 modal 범위만 판단했다. 이후 개발 메뉴 보조 명령에서 HJM이 홈으로 나간 것을 관찰해 재실행했고, 최종 종이/카드/글자 환경 캡처에는 해당 chrome이 없다. 개발 메뉴 종료 원인과 host binary의 lifecycle은 이 검수에서 확정하지 않았다.
- 원격 CI/dispatch·버전 상승·npm 게시 없음.

## 6. 미확인 범위와 후속 조건

VoiceOver 실제 읽기/초점 순회, Android·실물·Release 성능, 제품 font 자산/권리/로딩/전체 glyph, 소비 앱 설치/운영 반영은 미확인이다.
이번 자료를 위 범위의 통과 영수증으로 사용하지 않는다. 내용 전환·날짜/시각·명령 기록의 선택 Native 흐름은 아래 후속 결과로 관리한다. 모든 상태·플랫폼 검수로 확대하지 않는다.
미독해 외부 페이지, 테이프·찢어진/타공/물결 경계 등 불채택/별도 후보, 최대 글자 조건은 이번 완료/릴리스 차단으로 추가하지 않는다.

## 7. 보관 처리

실제 Device Hub 캡처와 AX/input 값을 대조한 뒤 VQ 비교 시트를 검토하고 결과·source SHA·원시 manifest SHA를 이 리포트에 보존한다.
본인 `/tmp/hjm-theme-devicehub-20261007` 원시 이미지·JSON·임시 스크립트/바이너리를 정리한다. 공유 Metro/시뮬레이터/기존 타인 helper와 소스·fixture·출처 원장은 보존한다.

최종 VQ48장 비교 시트(1800×2760)와 앞선 글자/종이/상태별 시트·필요한 원본을 직접 검토했다. 제목·입력·닫기·CTA가 도달 가능한지 확인했고, Inspector와 이동 직후 캡처의 한계는 위 결과에 보존했다.
본인 raw 233파일/49725114bytes 정렬 manifest SHA-256: `479d4a48b76274ec81005e6909c9763482b13c4be7904f6874c1de6ce8b6c8c3`. 최종 VQ PNG SHA-256: `c441905c487067a9078e542484e1b4c7a63aff3fb03670288fa319ce861190dc`.
리포트 대조 후 위 본인 임시 디렉터리의 PNG/AX JSON/Swift·Python helper/바이너리·pycache를 제거했다. 기존 공유 Metro8187와 Device Hub, 설치 앱, 다른 세션의 /tmp helper는 유지했다.


## 8. 내용 전환·날짜/시각·명령 기록 후속 검수

실행: 2026-10-07 20:37–20:52 Asia/Seoul. 시작 HEAD `ae697d866217b6bfcd36dce509dafa30a3b3387d`.
같은 iPhone17Pro/iOS26.5·설치 개발 호스트·Metro8187·실제 Device Hub 창을 재사용했다.
기존 comments dirty 변경을 포함한 checkout에서 실행했고 해당 변경은 이 작업의 stage 대상이 아니다.
새 외부 자료 조사·native build·기기 생성·원격 CI·버전 상승·npm 게시는 하지 않았다.
최대 글자 및 모사 확대는 실행하지 않았고 모든 캡처의 글자 환경은 textScale1이다.

| 대상 | 실제 관찰과 판정 |
| --- | --- |
| 내용 전환 탭 | 초안 `Flow12` 편집과 Return, 작성 탭 선택, 표현 6종(테마 상속/나타남/떠오름/옆으로/확대/즉시) 선택 후 값 유지. 확대는 모션 preset이며 글자 확대가 아니다. 10종 테마 이름과 같은 초안을 대조했다. 이 6표현/10테마 순회는 outer-scroll 수정 전이며, 최종 수정 후 `Final56` 편집→작성 탭→다음 테마에서 유지 재확인 |
| 단계별 완료 문제 | 수정 전 비교 도구 아래 720unit viewport footer가 Canvas 밖에 있고 내려갈 수 없었다. preview 바깥 ScrollView를 추가했다. viewport 높이를 줄여 화면 내부 배치를 바꾸는 대신 기존 OnboardingScreen의 본문 scroll/footer 소유권을 유지한다 |
| 단계별 완료 수정 후 | `Step34` 편집 후 외부 scroll로 다음 버튼에 도달. 1→2→이전→2→3, 실패 예약→완료 실패와 같은 초안→재시도 성공→다시 비교 후 같은 초안 유지. 선택 dark/RTL/reduced-motion 첫 화면 확인. 애니메이션 시간·Release 성능 측정 아님 |
| 날짜/시각 | 달력 월 이동·닫기 후 날짜 미선택, 재열기→9월16일·9시·5분 선택. 확인 전/실패 후/재시도 성공에 같은 `2026-09-16 09:05` 표시. 다시 고르기에서 세 값 모두 초기화 |
| 날짜 처리 중 잠금 | Pending fixture의 날짜·시·초기화에 touch를 넣어도 달력/시 Sheet가 열리지 않고 `2026-09-16 09:30` 유지. disabled/dark/RTL 첫 화면 확인. 날짜/시각의 10종 전체 상태 검수나 실제 예약/서버 성공 아님 |
| 명령 기록 | 가로 스크롤 선택 후 실제 touch로 긴 원문 이동, 출력/줄바꿈으로 전환. 테마 10종의 이름과 같은 출력 원문 대조. 갱신 실패→이전 원문 유지→재시도 응답. CopyFailed 안내와 닫기, 선택 dark/RTL/reduced-motion 화면 확인 |
| 실제 OS 복사 | 기본 명령 원문을 길게 눌러 실제 iOS Copy 메뉴 표시→Copy. Simulator pasteboard bytes를 합성 fixture와 비교해 마지막 줄바꿈까지 정확히 일치. 이전 simulator clipboard는 비공개 메모리에서 보존하고 finally로 복원했으며 내용은 기록하지 않았다. CopyFailed는 fixture로서 OS 권한 거부를 재현한 결과가 아니다 |

달력 월 이동 뒤 첫 자동 close touch에서 일시적으로 AX 요소가 없어 후속 label 조회가 실패했다.
실제 Device Hub 화면에는 Sheet가 남아 있었으며 그 화면의 닫기 위치에 다시 touch해 닫힘을 확인했다.
첫 `date-cancel` 캡처는 배경 복귀였으나 이후 다시 열린 Sheet의 AX가 잠시 비어 있었다.
이 순간을 제품의 지속적인 닫기 결함이나 VoiceOver 통과로 단정하지 않는다.

| 실행한 최종 preview source | SHA-256 |
| --- | --- |
| Native content-transition-comparison-preview.tsx | 9b4b5cf8f6a6921337e146bfc240262086724efd361cb8767e09c7813bef09f0 |
| Native date-time-selection-preview.tsx | 0ff594b27d63d7efd1657a1abcce725f849bb614e6b72b4ecaaa0287c1cb2580 |
| Native command-records-preview.tsx | 5a8e21d2d1bc91176238242a112a41807082fc56422b161c096f8a036e952584 |

Native Showcase 타입 검사 통과. usage 13토큰/139컴포넌트/59구성/22화면 및
Storybook 433파일/969 Web ID 정적 검사 통과. 문서 링크591개 통과. 전체 package 검사를 실행한 영수증은 아니다.
실험은 기존 경로에 유지하며 이번 검수·수정은 승급 또는 게시 완료가 아니다.

후속 실제 창 캡처 82장 전체 VQ 시트와 전환/날짜/명령별 시트, 핵심 실패·성공·Copy 원본을 검토했다.
원시 자료/본인 helper 170파일·30044617bytes의 정렬 JSON manifest SHA-256:
`733a2885afb79b697952c4166649ac391fa58aedf8e19fe8aec2ad210304bb23`.
전체 VQ PNG SHA-256: `1241781a048b16a0608bf37480e461264f28d5452d15e7e968575d7dd2c42ef7`.
검토 후 본인 `/tmp/hjm-native-compositions-20261007` 170파일을 제거했고 경로가 남지 않은 것을 확인했다. 공유 runtime·소스·fixture와 기존 타인 helper는 보존한다.


## 9. 목록 화면 골격 독립 Story 검수

실행: 2026-10-07 21:40–21:49 Asia/Seoul. 시작 HEAD `88bbe6ad9e61c4686f3ccb8d066730d76c18c9e0`.
기존 iPhone 17 Pro/iOS 26.5·개발 호스트·Metro8187·Device Hub 창 10967을 재사용했다.
독립 `실험/컴포넌트/레이아웃/목록 화면 골격`의 Default/Dark에 제목 기반 deep link로 진입했다.
모든 실행은 textScale1이며 기기 생성·Native build·원격 CI·버전 상승·게시 없음.

- 기본 숲 테마의 도구 입력을 `저녁 산책 Overview73`으로 편집하고 Return 후 이번 주를 선택했다.
- 기록 도구를 접고 다시 열어 같은 초안과 선택이 유지됨을 AX 값과 실제 창에서 대조했다.
- 실패 재현 후 실패 문구·같은 초안/기간·다시 저장 행동을 확인했다. 재시도 후 저장 성공 문구와 같은 값을 확인했다. fixture의 성공이며 서버·영구 저장 영수증이 아니다.
- 본문을 끝까지 내려 휴식 카드의 제목 y576–608/본문 y620–640을 footer 버튼 y711 위에서 확인했다. 시작 위치에서 footer 뒤에 있는 마지막 카드는 본문 스크롤로 도달 가능했다.
- Dark 첫 화면과 저장 성공 화면에서 어두운 숲 표면·카드·본문·고정 CTA를 실제 창으로 확인했다. Story 전환은 새 fixture 상태이며 Story 간 초안 보존 주장 아님.

9개 실제 창 캡처 전체 VQ 시트와 끝/다크 원본을 검토했다. 모든 테마·Android·VoiceOver·실물/Release 성능으로 확대하지 않는다.
실행한 Native design-profile-preview.tsx SHA-256: `4b634bb73922cb255bc7f77495270916e593b2fec368c6a3e0fb513832245be1`.
원시 19파일/4449522bytes 정렬 manifest SHA-256: `bee7011d98774e2c9fe7fe90b8851d1989c0b5af835a374cc676b0ad186ad370`. VQ PNG SHA-256: `9406c75ed7aaf2da43136cdc7ccc0c2700f93db22bc64101181058beca6a71a4`.
문서에 결과와 digest를 남긴 뒤 본인 임시 폴더만 제거했다. 공유 Metro·기기·설치 호스트·소스·fixture는 보존한다.
첫 입력 직전 Metro 새로고침 때문에 Loading from Metro가 잠시 표시됐으며, 최신 화면에서 다시 입력한 결과를 사용했다. 첫 touch helper의 정수 좌표 오류는 제품 오류로 세지 않는다.
