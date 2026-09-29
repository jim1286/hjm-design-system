# Stable 승격 기준

검토일: 2026-09-29. 이 문서가 성숙도 승격 조건의 원문입니다.

`stable`은 공개 API와 동작을 SemVer로 지원한다는 약속입니다. 변경을 영구히 금지하거나
모든 제품·OS에서 검증을 마쳤다는 뜻은 아닙니다. `beta`는 API·동작 또는 renderer 검증에
구체적인 미완료 항목이 있다는 뜻입니다. 채택 제품 수나 사용 기간으로 구분하지 않습니다.

## 컴포넌트 승격에 필요한 것

1. 공개 타입·기본값·지원 동작이 문서와 일치하고, 알려진 계약 공백이 없어야 합니다.
2. 승격할 surface의 실제 renderer에 default·접근성·적용되는 환경/행동 회귀 증거가 있어야
   합니다. 필수 목록은 `showcaseManifest`이며 canonical `pnpm ci:check`를 통과해야 합니다.
   문서 등록, story 존재 또는 mock 실행을 실제 기기 검증으로 바꿔 부르지 않습니다.
3. catalog와 생성물, Changeset에 승격 범위를 함께 반영합니다. 기록은
   [Stable Core](stable-core.md)에 대상·검사·남은 제한을 간단히 남깁니다.

별도 승격 전용 JSON, 승인 단계, 소비 앱 배포 영수증을 추가하지 않습니다.
Web과 Native는 `surfaceStatus`로 각각 판정합니다. Web-only의 승격에 Native 구현은 필요
없습니다. 공유 contract의 승격과 각 renderer의 상태도 구분하고, 미구현 surface를 함께
stable로 올리지 않습니다. 선택형 모션·네이티브 확장은 기본 컴포넌트의 상태를 상속하지 않습니다.

## 별도로 확인할 것

| 항목 | 소유 범위 | 성숙도와의 관계 |
| --- | --- | --- |
| 제품 채택 수·사용 기간·배포 이력 | 채택 관측 | 우선순위와 개선 신호. 승격 최소치 없음 |
| 제품 화면의 키보드·스크린 리더·기기 QA | 소비 앱 릴리스 | 바뀐 흐름과 플랫폼 위험에 맞춰 실행 |
| HJM renderer 키 동작 / Native 접근성 action | Web `keyboard` / Native `native-actions` 증거 | 각 surface behavior contract에 실제 선언된 입력 방식만 요구 |
| 제품 화면의 dark·RTL·200%·reduced motion | 소비 앱 릴리스 | 제품이 지원하는 환경 검증. HJM 테스트와 중복 영수증을 요구하지 않음 |
| Web/Native 의미 일치 | 공통 계약과 관련 행동 회귀 | `adaptive` 전체에 별도 parity 테스트를 일괄 강제하지 않음 |
| 제품의 style 우회 | API 공백 또는 제품 이관 | HJM API 공백이면 해결. 단순 제품 이관 지연은 승격 조건 아님 |

컴포넌트의 접근성·환경 검증은 계속 필요합니다. 제품의 임의 조합과 도메인 흐름까지 HJM
성숙도 하나로 보증하려는 조건을 분리한 것입니다. 모달 focus/dismiss, 선택값 전이, 입력 복구
같은 고유 행동의 검증은 생략하지 않습니다. 실제 OS에 의존하는 확장의 미검증 제한도 유지합니다.

Web keyboard는 DOM focus와 문서화된 key binding을 browser renderer에서 확인합니다. Native
behavior contract은 물리 키가 아니라 접근성 role·state·action을 선언하므로, `onPress`나
TalkBack action 테스트를 keyboard 증거로 기록하지 않습니다. Native `native-actions`는 그
host action과 상태 전이를 renderer test에서 확인하며 실제 키보드·VoiceOver·TalkBack 기기 QA는
소비 앱 릴리스에서 수행합니다.

## 변경 이유

2026-09-29 감사에서 architecture는 ‘두 제품 또는 두 플랫폼’, 이 문서는 ‘한 제품 배포 +
제품 화면 실측’, 과거 Stable Core 기록은 ‘세 제품’을 사용하고 있었습니다. 이미 양쪽 renderer
필수 시나리오가 갖춰진 표시 컴포넌트 7개도 채택 수 때문에 beta에 머물렀습니다.
제품 인기도와 릴리스 절차가 API 지원 약속을 가로막는 문제를 없애기 위해 조건을 통일했습니다.
소비 Beta는 [소비 정책 §2](consumer-policy.md#2-성숙도별-채택)의 간단한 채택 기록으로 관리합니다.

2026-09-29 후속 증거 감사에서는 Native 실행 레지스트리의 `keyboard` 증거가 실제 물리 키보드
입력이 아니라 React Native host action 테스트에 연결된 것을 확인했습니다. Native 계약에 없는
입력을 공통 keyboard gate로 강제하거나 터치 action을 키보드 검증이라고 부르지 않도록 surface별
시나리오를 분리했습니다.
