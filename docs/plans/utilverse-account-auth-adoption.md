# Utilverse 가입·계정·상태 안내 채택 계획

2026-10-07. 소비 HEAD fa201bc90e4c94219de0f4f51ac0328987ad1cb2, HJM 1dea6da.
10개 TSX 전체 소스 검토. 아래는 릴리스 후 교체 계획이며 소비 소스·의존성은 변경하지 않았다.
136개 inventory hash를 재확인했고 81개 source-reviewed, 55개 pending이다.
소스 검토는 UI·동작 검증이나 채택 완료를 뜻하지 않는다.

## 파일별 판단

| 소스 (apps/mobile/src 기준) | 판단과 보존 계약 |
| --- | --- |
| `features/LoginScreen.tsx` | Replace two required Checkbox controls with Agreement after submission-lock release; preserve synchronous version-bound consent invalidation, registration schema, pending action snapshot, reviewer gates and centered header. |
| `features/AccountScreen.tsx` | Use List for local divider wrappers and ProfileScreen accountActions with danger Button instead of deprecated ListRow titleStyle. Keep deletion as navigation and preserve account recovery gates. |
| `features/ProfileEditScreen.tsx` | Already EditorScreen with discard and controlled pending. Use Notice for errors; retain idempotent writes and validated receipt before profileChanged/toast. Picker concurrency and identity changes need runtime QA. |
| `features/BlockedUsersScreen.tsx` | Preserve scoped infinite query, deduplication and inline unblock confirmation outside pressable rows. Existing ScreenLayout/Surface/Button may use ListRow with trailingAction without changing confirmation ownership. |
| `components/AppleProviderButton.native.tsx` | Already AuthProviderButton with projected official logo, theme variants and busy guard. Native provider host remains product-owned. |
| `components/AppleProviderButton.tsx` | Web returns null for unsupported Apple provider; do not replace with a fake provider button. |
| `components/AuthIssue.tsx` | Use Notice assertive announcement while preserving ten distinct issue mappings, especially logout/deletion pending and storage uncertainty. |
| `components/ReviewLogin.tsx` | Already TextField/PasswordField/Button with focus transfer and busy behavior. Keep caller server+review gates and credentials inside auth coordinator. |
| `components/PolicyLinks.tsx` | Already Link; preserve HTTPS/no-credentials/no-hash URL validation, open failure callback and touch target. Legal content stays product-owned. |
| `components/LanguageNotice.tsx` | Use Notice for progress, fault and outcome announcements; preserve engine-vs-input errors and empty OCR outcome distinction. |

## 가입 약관의 구체적인 채택 경계

두 필수 Checkbox를 Agreement로 옮기려면 제출 중 선택만 잠그는 계약이 필요했다.
HJM 1dea6da에서 descriptor.disabled를 추가했고 큰 글자 줄바꿈까지 검증했다.
[약관 QA](../qa/2026-10-07-agreement-lock.md)는 공통 컴포넌트 근거이며 제품 가입 검증은 아니다.

제품의 versions 문자열과 consents.versions 비교를 유지한다. 약관 갱신 시 같은 렌더에서
이전 선택을 무효화해야 한다. onStateChange의 뒤늦은 알림으로 제출 가능 여부를 계산하지 않는다.
resolveAgreementState와 RegistrationInputSchema, 문서 두 개 존재, busy를 함께 판단한다.
전체 동의/필수/선택 등의 새 문구는 제품 i18n에 추가하고 실제 버전 식별자는 서버로 전달한다.

## 기존 HJM으로 흡수할 부분

계정 메뉴의 수동 hairline wrapper는 List가 소유한다. 삭제 화면으로 이동하는 행동은
ProfileScreen.accountActions와 danger Button으로 표현해 deprecated titleStyle 색 우회를 제거한다.
이동 자체를 즉시 계정 삭제로 바꾸지 않는다. 프로필 편집은 이미 EditorScreen을 사용하므로
새 편집 화면을 만들지 않는다. 에러 안내는 Notice의 announcement를 명시한다.

## 소비 검증 계획

- 약관 버전 교체와 제출 경합, 필수 미동의, 잠금 중 전문 열기, 실패 후 선택/이름 보존.
- 회원/비회원/만료/로그아웃 불확정/삭제 불확정 상태에서 노출 행동과 재시도.
- 프로필 이름 저장·사진 선택 취소·실패·삭제 및 실제 receipt 반영, 중복 picker와 계정 전환 경합.
- 차단 목록의 페이지 중복 제거·단일 해제·취소·실패·다른 계정 캐시 격리.
- 한국어/영어·5개 제품 테마·다크·큰 글자·VoiceOver, 심사 폼 두 조건과 provider 가용성.

위 제품 runtime 검증은 모두 pending이다. 인증 coordinator, 서버 확정, 정책 URL 및
네이티브 provider를 디자인 시스템으로 옮기는 변경은 하지 않는다.
