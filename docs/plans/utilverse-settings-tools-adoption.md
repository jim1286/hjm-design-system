# Utilverse 설정·도구 화면 채택 판단

검토일: 2026-10-07. 소비 `fa201bc90e4c94219de0f4f51ac0328987ad1cb2`, HJM `a035f5d`.
아래 열 파일 전체 소스와 HJM Native screens/inputs/primitives/navigation/keyboard/overlays를
대조했다. DisplayPresentation은 기존 검토를 재확인했으며 신규 열 파일에 중복 집계하지 않는다.
해시와 파일별 판단은 [inventory](utilverse-ui-adoption-inventory.json)에 있다. 소비 구현·기기 QA는
아직 수행하지 않았다. 관련 서비스 구현 전체까지 검토했다는 뜻이 아니다.

## 파일별 대체 경로

| 파일 (`apps/mobile/src/`) | 판단 | 보존할 계약과 검증 |
| --- | --- | --- |
| `features/SettingsScreen.tsx` | SharedSettingsScreen 유지. shell별 selected Button 묶음은 RadioGroup vertical/row + leading artwork + renderIndicator로 교체 후보 | 5개 shell key·그림·지역화, preferencesDocument의 ready/pending/error·영속 저장 유지. theme 변경을 단순 UI 성공으로 표시하지 않음. loading/error는 화면 전체를 대체하지 않고 notice/상태 안내로 연결 |
| `components/SettingsSection.tsx` | 독립 섹션은 Section + Divider + Stack으로 대체 가능 | 현재 hairline/spacing을 앱에서 재구현하지 않음. SettingsScreen 안의 embedded 모드에는 제목·구분선을 중복하지 않음 |
| `components/AnalyticsSettings.tsx` | Switch 유지, 실패 Text는 Notice 후보, 비embedded wrapper는 Section | analytics 외부 store의 enabled/ready와 setCollectionEnabled Promise 완료 유지. 설정 UI 변경이 실제 수집/동의 정책 변경을 허용하지 않음 |
| `components/AdPrivacySettings.tsx` | Button 유지, 실패 안내 Notice·wrapper Section | privacyRequired/checking/busy 조건, showPrivacy가 false를 반환할 때의 실패 안내 유지. SDK/OS 동의 흐름을 HJM으로 이동하지 않음 |
| `components/NotificationSettings.tsx` | 도구 이동 Button 안 artwork/설명/chevron은 ListRow, 오류는 Notice. Switch 유지 | 알림 권한 요청→document 변경→timer/reminder 갱신 순서, unsupported/로그인 제한·OS 설정 열기·load 재시도를 구분. leading 32 그림은 ListRow 슬롯 안에서 검증 |
| `components/ScreenHeader.tsx` | 탐색 행은 TopBar leading/actions, 제목/설명/큰 artwork는 Section 조합 후보 | canGoBack/back 또는 deep link fallback replace를 제품 callback으로 보존. dismiss는 오른쪽 close, back은 왼쪽 back. 큰 글자·긴 제목·actions 줄바꿈 및 중복 safe area 확인 |
| `components/ToolHeader.tsx` | 위 공통 header 경로를 제품 정보로 공급하는 얇은 adapter 유지 | id별 제목·56 artwork·local/server/data 문구·알림/커뮤니티 이동은 제품 소유. 일반 설정 헤더와 동일한 모양으로 줄이지 않음 |
| `components/ToolScreenLayout.tsx` | 이미 MediaSelectionScreen/ScreenLayout/BottomCTA/Collapsible 사용. 기존 상위 구성 유지 | renderScroll의 FlatList 가상화, scrollRef 결과 이동, mask drag 중 scrollEnabled, empty picker/오류·CTA 의미 보존. 중첩 ScrollView 금지. 키보드 host는 아래 비교 전 유지 |
| `components/ChoiceField.tsx` | 기존 RadioGroup/SegmentedControl adapter. 세로 선택은 직접 RadioGroup에 연결 가능; 짧은 가로 선택의 전환 정책은 별도 검증 | locale별 label 폭·fontScale 전환, hideLabel/accessibilityLabel·disabled 유지. HJM 현재 value/callback은 null 가능이므로 undefined만 검사하는 기존 cast를 그대로 이식하지 않음 |
| `features/DisplayBoardScreen.tsx` | TextArea/Checkbox 유지, ChoiceField 경로 통합; 입력 오류를 TextArea error/invalid 또는 Notice에 연결 후보 | validateDisplay가 제품 입력을 검증하고 Keyboard.dismiss 후 immutable presentation snapshot을 여는 순서 유지. 출력 도중 설정 초안을 변경하지 않음 |

## 탐색 헤더는 현재 구현으로 대조

현재 HJM TopBar는 긴 제목을 자르지 않고 큰 글자에서 actions를 다음 줄로 옮긴다. 과거의
고정 높이/한 줄 제목 설명을 교체 불가 근거로 쓰지 않는다. 다만 subtitle을 직접 받지 않으며
56 크기 제품 artwork와 설명이 있는 별도 identity 행은 Section 등으로 분리해야 한다.
TopBar titleLeading은 장식용 작은 그림이며 접근성 트리에서 숨긴다. 제품 artwork의 의미가
제목에 이미 포함되는지 확인한다. ScreenHeader의 OS fontScale > 1.3과 HJM environment 배율의
전환점은 같다고 가정하지 않고 OS 글자와 provider 배율을 모두 시험한다.

## 키보드 host 차이

제품 `lib/use-keyboard-inset.ts`는 wrapper의 실제 window 하단과 keyboard screenY의 겹침만
padding으로 적용한다. HJM `KeyboardAvoiding`은 keyboard event의 height와 offset으로 계산하고
wrapper 위치는 측정하지 않는다. 따라서 API 이름만 보고 교체하면 safe area/하단 독/Android
adjustResize에서 여백이 중복될 수 있다. 제품 adapter를 즉시 삭제하지 않는다. 공통 measured
host가 필요한지 검토하고 하나의 소유자만 적용한다. 제품 hook도 frame change·회전·늦은
measure callback 수명 검증은 추가로 필요하다. 기존 코드 보존을 동작 통과로 해석하지 않는다.

## 전광판 출력은 별도 제품 host

기존에 검토한 DisplayPresentation 전체를 재확인했다. Native Modal fullScreen·회전 방향,
StatusBar 숨김, ScreenWakeLease와 AppState, 측정한 textWidth와 이동 거리/속도, 화면 읽기 또는
모션 감소 시 정적 출력이 있다. HJM Dialog는 Modal을 transparent로 만들고 제목/제한 폭/스크롤
본문을 제공하므로 presentationStyle만 넘겨도 같은 출력이 되지 않는다. 출력 geometry·사용자
본문·wake lease는 유지하며 일반 버튼/안내·설정 UI만 공통화한다. 현재 출력은 이미 HJM 색·글자
배율·버튼을 사용한다. 화면 회전·스크린리더·정지/재개·background 복귀는 소비 기기 QA로 남긴다.

## 완료 조건

공식 HJM 릴리스 후 해당 버전의 exports/props를 다시 확인하고 소비 코드·lock·contract를 함께
갱신한다. 다섯 shell theme × light/dark, 큰 글자, locale/RTL, iOS/Android, 실제 권한 거절과
영속 저장 실패를 검증한다. 설정 UI의 재사용을 알림 예약·광고 동의·분석 수집 확인으로 보고하지
않는다. 이 보고서는 교체 계획이며 구현 완료·전수 UI 검증·출시 증거가 아니다.
