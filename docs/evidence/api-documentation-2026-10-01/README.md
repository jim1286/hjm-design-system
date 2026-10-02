# 시각 확장 API 문서 점검

검토일: 2026-10-01. 현재 checkout의 사용법·package exports·생성 JS/타입 선언·Changeset을 대조했다.
이 표는 설치와 사용 문서의 연결 상태를 증명한다. 동작·기기 검증·게시·소비 앱 적용은 [진행표](../../plans/visual-integration-progress.md)에서 별도로 추적한다.

Web은 `@hjmds/react`, Native는 `@hjmds/react-native`에 아래 하위 경로를 붙인다.
Sidebar의 세 표현은 기존 Web API 확장이며 Native API를 새로 만들지 않는다.

| 기능 | 하위 경로 | 지원 | 사용법 | 변경 기록 |
| --- | --- | --- | --- | --- |
| 정적 Blobatar | `./avatar-blobatar` | Web·Native | [계약](../../../packages/design-contracts/docs/avatar-fallback.md) | [Changeset](../../../.changeset/avatar-blobatar.md) |
| 모션 Blobatar | `./avatar-blobatar-motion` | Web·Native | [계약](../../../packages/design-contracts/docs/avatar-fallback.md) | [Changeset](../../../.changeset/blobatar-motion.md) |
| 내용·텍스트 전환 | `./content-transition` | Web·Native | [계약](../../../docs/interaction-adapters.md) | [Changeset](../../../.changeset/visual-foundations.md) |
| 폴더 미리보기 | `./folder-preview` | Web·Native | [계약](../../../packages/design-contracts/docs/folder-preview.md) | [Changeset](../../../.changeset/folder-preview.md) |
| Sidebar bounce/hook/proximity | `./sidebar` | Web | [계약](../../../packages/design-contracts/docs/sidebar.md) | [Changeset](../../../.changeset/sidebar-presentations.md) |
| 시간 간격 입력 | `./duration-field` | Web·Native | [계약](../../../packages/design-contracts/docs/compound-controls.md) | [Changeset](../../../.changeset/compound-controls.md) |
| Fluid/Matrix Orb | `./thinking-orb` | Web·Native | [계약](../../../packages/design-contracts/docs/thinking-orb.md) | [Changeset](../../../.changeset/thinking-orb-presentations.md) |
| 스크롤 진행 | `./scroll-progress` | Web·Native | [계약](../../../packages/design-contracts/docs/scroll-progress.md) | [Changeset](../../../.changeset/scroll-progress.md) |
| 코드 블록 | `./code-block` | Web·Native | [계약](../../../packages/design-contracts/docs/code-block.md) | [Changeset](../../../.changeset/code-block.md) |
| OTP 표현 | `./otp-field` | Web·Native | [계약](../../../packages/design-contracts/docs/otp-field.md) | [Changeset](../../../.changeset/otp-presentation.md) |
| 중력 글자 | `./gravity-letters` | Web·Native | [계약](../../../packages/design-contracts/docs/gravity-letters.md) | [Changeset](../../../.changeset/gravity-letters.md) |
| 활동 히트맵 | `./activity-heatmap` | Web·Native | [계약](../../../packages/design-contracts/docs/activity-heatmap.md) | [Changeset](../../../.changeset/activity-heatmap.md) |
| 반응 선택 | `./reaction-picker` | Web·Native | [계약](../../../packages/design-contracts/docs/compound-controls.md) | [Changeset](../../../.changeset/compound-controls.md) |
| 알림 벨 | `./notification-bell` | Web·Native | [계약](../../../packages/design-contracts/docs/compound-controls.md) | [Changeset](../../../.changeset/compound-controls.md) |
| 단계 재생 | `./step-player` | Web·Native | [계약](../../../packages/design-contracts/docs/step-player.md) | [Changeset](../../../.changeset/step-player.md) |
| 이미지 등장 | `./grid-reveal` | Web·Native | [계약](../../../packages/design-contracts/docs/grid-reveal.md) | [Changeset](../../../.changeset/grid-reveal.md) |
| 유동형 탭 표시 | `./navigation` | Web·Native | [계약](../../../packages/design-contracts/docs/gooey-navigation.md) | [Changeset](../../../.changeset/gooey-navigation.md) |
| 인라인 확인 | `./inline-confirm` | Web·Native | [계약](../../../packages/design-contracts/docs/compound-controls.md) | [Changeset](../../../.changeset/compound-controls.md) |
| 숫자 전환 | `./statistic-motion` | Web·Native | [계약](../../../docs/interaction-adapters.md) | [Changeset](../../../.changeset/native-statistic-motion.md) |
| 할 일 목록 | `./task-list` | Web·Native | [계약](../../../packages/design-contracts/docs/task-list.md) | [Changeset](../../../.changeset/task-list.md) |
| 음성 메모 | `./voice-note` | Web·Native | [계약](../../../packages/design-contracts/docs/voice-note.md) | [Changeset](../../../.changeset/voice-note.md) |
| 배경 효과 | `./effect-surface` | Web·Native | [계약](../../../packages/design-contracts/docs/effect-surface.md) | [Changeset](../../../.changeset/visual-foundations.md) |
| Lucide 아이콘 | `./icon-lucide` | Web·Native | [계약](../../../packages/design-contracts/docs/icon.md) | [Changeset](../../../.changeset/visual-foundations.md) |

기존 컴포넌트 합성인 Family Drawer와 화면 패턴·테마/글꼴/목업 편집은 별도 renderer API가 아니다.
해당 예제는 [탐색 기준](../../STORYBOOK_NAVIGATION.md)에 등록하고 테마 유틸리티는 contracts가 소유한다.
공개 컴포넌트 분류는 [생성 대응표](../../generated/public-component-map.md), 라이선스 고지는
[Web](../../../packages/react/THIRD_PARTY_NOTICES.md)와 [Native](../../../packages/react-native/THIRD_PARTY_NOTICES.md)가 소유한다.
Blobatar MIT와 Lucide ISC/Feather MIT 고지는 양쪽 패키지에 존재함을 확인했다.
Rare UI 원본 코드·상업용 목업 자산·폰트 파일을 재배포했다는 뜻은 아니다.

기계 대조 결과는 [inventory.json](inventory.json)에 남겼다. API-map 검사는 공개 이름의 분류·생성 drift를 검사하며, 사용법의 정확성이나 제품 적합성을 대신 판정하지 않는다.
