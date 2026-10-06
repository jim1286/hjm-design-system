# Utilverse 앱 틀·라우팅·서비스 채택 조사

2026-10-07 · Utilverse fa201bc90e4c94219de0f4f51ac0328987ad1cb2,
HJM ad7b77a. inventory 136개 hash가 현재 소스와 일치한다. 이번에 36개 TSX를
추가로 읽었다. 진입점 재수출 확인은 목적지 기능의 UI 검증으로 집계하지 않는다.
소비 앱 코드·의존성은 아직 바꾸지 않았다.

## 직접 구성된 UI와 기존 API 대조

| 대상 | 판단 | 채택 조건 |
| --- | --- | --- |
| notification-tools 행 | ListRow로 교체 | title/description, ToolArtwork leading, chevronEnd trailing, disabled 유지. 검색·회원 상태별 진입 제한을 그대로 연결하고 큰 글자·전체 행 터치를 검증 |
| UiGlyph | 기존 Icon adapter 정리 | next→chevronEnd, down→chevronDown, bell→notifications, star→favorite, compose→edit를 대조. next는 현재 고정 방향으로 resolve되어 RTL에서도 우측을 가리킴. onPrimary는 tone=inverse로 연결하고 제품 화살표·도구 glyph host는 보존 |
| AppDock | 기존 Surface/Button/Stack 유지 | home에서만 보이는 launcher. BottomNavigation은 persistent destination이고 bar/floating/capsule·density를 제공하지만 5개 shell의 38–54px artwork·프레임·로그인 명령까지 동등하지 않음. deprecated style로 강제 변환하지 않음 |
| HomeWallpaper | 제품 이미지 host 유지 | EffectSurface는 mesh/glow/grain/noise이며 제품 이미지 드리프트 슬롯이 없음. 기존 SVG peer 부재 주석은 현재 binary 증거가 아님. reduced motion·홈 이탈 정리 외 background 일시정지를 실제 검증 |
| ToolArtwork | 제품 asset host 유지 | 5개 shell 매핑·fallback·contain·decorative 의미 유지. 모든 제품 그림을 공통 glyph로 바꾸지 않음 |
| HomeToolPreview | 기존 Sheet 유지 | 한 개만 필요할 때 mount. onDismissComplete 뒤 이동하고 접근 제한 도구는 상세로 이동. exit 도중 이중 이동·화면 겹침 검증 |
| ToolAccessGate | 기존 ScreenLayout 유지 | checking_session/login_required/prepared/unavailable/not_found 구분. 로그인 from/intent와 상세 진입 유지 |

HJM 비교 원문: Native navigation.tsx BottomNavigationProps/configuration 및 renderer,
data-display.tsx ListRowProps, effect-surface.tsx/공통 descriptor, primitives.tsx Icon,
design-contracts/src/icon.ts semanticIconNames/getIconDirectionality, /icon-lucide adapter.
Native Icon은 glyph를 호스트가 공급하는 계약이므로 UiGlyph 소스가 남는 것 자체는 미채택이 아니다.
Lucide로 바꾸는 경우 optional peer와 설치 binary 지원을 먼저 확인하고 제품 지정 그림을 보존한다.

## 라우팅·생명주기에서 보존할 것

루트 HJM provider는 OS fontScale을 한 번 적용하고 device preferences를 읽는다. SafeAreaView와
ToastRegion의 inset 소유권을 유지해 새 ScreenLayout과 이중 여백이 생기지 않게 한다.
서비스 provider를 시각 교체 때문에 재마운트하지 않는다. LanguageHandoff는 background에서
OCR 원문을 지우고, PushService는 복원 중 등록 해제를 피하며 오래된 observation을 정리한다.
AuthProvider는 계정 변경 전 query를 취소·비우고 삭제 영수증 복원 후 인증을 복원한다.
Preferences의 언어 전환은 화면을 remount하지 않으므로 입력 초안을 유지한다.

도구 라우트는 실행 가능한 도구만 최근 기록·tool_used로 집계한다. 접근 차단 화면을 도구
실행으로 취급하지 않는다. ToolResultAds는 결과별 symbol 소유권을 모아 배너 하나만 보이고
route id로 리셋한다. QR 두 패널의 한쪽 빈 결과가 다른 쪽 결과 배너를 지우지 않게 한다.

## 이번에 읽은 파일

| 파일 (apps/mobile/src 기준) | 소스 판정 |
| --- | --- |
| `app/_layout.tsx` | Keep HJM provider/Container/ToastRegion, single OS fontScale application and home-only shell. Preserve service/provider lifetimes and safe-area ownership. |
| `app/account.tsx` | Keep Expo Router re-export: export { default } from '../features/AccountScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/blocked-users.tsx` | Keep Expo Router re-export: export { default } from '../features/BlockedUsersScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/community/[id].tsx` | Keep Expo Router re-export: export { default } from '../../features/CommunityScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/delete-account.tsx` | Keep Expo Router re-export: export { default } from '../features/DeleteAccountScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/dev-push.tsx` | Already HJM controls; preserve development iOS bundle/ticket gate and lazy SDK import; production notification permission work is not a styling replacement. |
| `app/index.tsx` | Keep Expo Router re-export: export { default } from '../features/ToolboxScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/login.tsx` | Keep Expo Router re-export: export { default } from '../features/LoginScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/messages/index.tsx` | Keep Expo Router re-export: export { default } from '../../features/ConversationScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/moderated-content.tsx` | Keep Expo Router re-export: export { default } from '../features/ModeratedContentScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/notification-tools.tsx` | Replace composed navigation Button row with ListRow title/description/leading/trailing; preserve disabled availability and search/session gates. |
| `app/notifications.tsx` | Keep Expo Router re-export: export { default } from '../features/NotificationInboxScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/ops/appeals/[id].tsx` | Keep Expo Router re-export: export { ModerationAppealDetailScreen as default } from '../../../features/ModerationAppealsScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/ops/appeals/index.tsx` | Keep Expo Router re-export: export { default } from '../../../features/ModerationAppealsScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/ops/reports/[kind]/[id].tsx` | Keep Expo Router re-export: export { ModerationDetailScreen as default } from '../../../../features/ModerationScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/ops/reports/index.tsx` | Keep Expo Router re-export: export { default } from '../../../features/ModerationScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/polls/[id].tsx` | Keep Expo Router re-export: export { default } from '../../features/PollDetailScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/profile.tsx` | Keep Expo Router re-export: export { default } from '../features/ProfileEditScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/settings.tsx` | Keep Expo Router re-export: export { default } from '../features/SettingsScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/tool-notifications/[id].tsx` | Keep Expo Router re-export: export { default } from '../../features/ToolNotificationSettingsScreen'; Feature review is separate; route wrapper review does not validate destination behavior. |
| `app/tools/[id].tsx` | Keep execution availability, history/analytics boundary and route keyed ToolResultAds; tool-specific implementations remain independently audited. |
| `components/AnalyticsScope.tsx` | No visual UI; preserve catalog screen naming, initialization and navigation observation. |
| `components/AppDock.tsx` | Home-only launcher already Surface/Button/Stack; persistent BottomNavigation would change role, five product frames and artwork sizes. Compare accessibility and labels without replacing shell identity. |
| `components/HomeToolPreview.tsx` | Already lazy mounted Sheet; preserve navigation after onDismissComplete and availability gating, no 30-sheet eager mount. |
| `components/HomeWallpaper.tsx` | Product image host and slow drift; EffectSurface provides mesh/glow/grain/noise, not equivalent image motion. Verify background suspension and current binary instead of trusting old SVG-absence comment. |
| `components/LanguageHandoffScope.tsx` | No visual UI; retain sensitive OCR handoff clearing on background/unmount. |
| `components/PushServiceScope.tsx` | No visual UI; retain restore gate, account/locale ownership, generation-safe observation and abort cleanup. |
| `components/ReminderServiceScope.tsx` | No visual UI; keep service cleanup and notification-to-tool routing. |
| `components/TimerServiceScope.tsx` | No visual UI; keep timer service cleanup and a13 routing. |
| `components/ToolAccessGate.tsx` | Already ScreenLayout state/actions; preserve five availability states, login return intent, detail route and tool artwork. |
| `components/ToolArtwork.tsx` | Product shell-specific artwork via Expo Image; decorative role and contain remain product asset host. |
| `components/ToolResultAds.tsx` | Result ownership map and route-keyed single ad host are product behavior, not a generic result component. |
| `components/UiGlyph.tsx` | Already HJM Icon host. Normalize semantic aliases (next to chevronEnd) for RTL, use inverse tone instead of onPrimary color bypass; custom tool/send artwork remains host-owned. |
| `features/ToolScreen.tsx` | Catalog fallback uses HJM Stack/ToolHeader; preserve id-keyed screen and scroll/keyboard behavior. |
| `lib/preferences.tsx` | Provider-only device-scoped preferences; preserve locale update without remounting routes or losing drafts. |
| `lib/session.tsx` | Provider-only auth/deletion lifecycle; keep query cancel-clear before identity changes and deletion receipt before restore. |

## 남은 검증

RTL next/back, 계정/비회원/복원 오류별 dock 목적지, 큰 글자 라벨의 접근성 이름,
다섯 shell 이미지 및 홈/비홈 배치, 닫기 애니메이션 뒤 이동, 앱 foreground/background 서비스
정리, 입력 중 언어 전환과 계정 전환 캐시 분리를 소비 적용 후 실제 흐름으로 확인한다.
소스 보존 판단은 이 동작들이 현재 기기에서 모두 통과했다는 뜻이 아니다.
