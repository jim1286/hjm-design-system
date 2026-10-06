# Utilverse 추첨·점수판 UI 채택 계획

2026-10-07. 소비 HEAD fa201bc90e4c94219de0f4f51ac0328987ad1cb2, HJM 42393da.
8개 TSX 전체와 HJM Celebration/StepPlayer 및 소비 dependency 선언을 확인했다.
136개 hash 일치. 누적 111개 source-reviewed / 25개 pending. 소비 변경·기기 검증은 미실행이다.

## 파일별 판단

| 소스 (apps/mobile/src 기준) | 판단 |
| --- | --- |
| `components/Celebration.tsx` | Shared Celebration currently statically imports react-native-fast-confetti; consumer has Reanimated4.5.1 but not this peer. Validate/install supported optional host after release before replacement, preserving reduced-motion/noninteractive decoration and completion independent of animation. |
| `components/RouletteWheel.tsx` | Retain wheel SVG and Animated rotation tied to rouletteSlotCenter/stop-angle domain. Only ordinal numbers enter SVG; candidate names stay in HJM labels. Product artwork palette remains product-owned. |
| `components/LadderBoard.tsx` | Retain validated numeric lane/bridge SVG and horizontal geometry. Path slice follows domain replay cursor; participant labels stay outside SVG. Generic Steps is not a ladder diagram replacement. |
| `features/RouletteScreen.tsx` | Already HJM controls; use Notice for saved/error states. Preserve one immutable secure selection driving rotation and final result, animation cancellation guard, saved-input recovery and reduced-motion same outcome. |
| `features/LadderScreen.tsx` | Compare Select/RadioGroup for participants, Progress for cursor and Accordion for all outcomes. StepPlayer is conditional because its visible Steps need semantic stages. Preserve replay generation cancellation and no redraw on play/pause/replay. |
| `features/ScoreboardScreen.tsx` | Replace manual reset/remove confirmation and Notice feedback. Retain +/- while storage pending, separate structural/undo lock, adaptive one-column threshold and large ScoreNumeral requirement. |
| `features/TeamsScreen.tsx` | Compare bounded NumberField for team count only after preserving parser errors; shared Section/Notice and static label treatment for members. Do not use action/selection Chip for noninteractive names. Preserve stable duplicate entry IDs, secure distribution and export labels. |
| `features/LottoScreen.tsx` | Replace exclusion selected buttons with multi-selection contract and history Alert.alert with AlertDialog; keep product ball art, too-few remaining validation, secure generation, 30-record cap and result retained on history-save failure. |

## 선택·진행 UI와 결과 그림

사다리와 룰렛은 제품 도메인 좌표를 그리는 이미지 host다. 공통 컴포넌트의 형태만 비슷하다는 이유로
추첨·경로를 다른 엔진으로 바꾸지 않는다. HJM Steps를 사다리의 선 하나마다 생성하면 읽을 수 없는
단계 목록이 되므로 StepPlayer는 의미 있는 단계 정의가 가능한 경우만 채택한다. 당장은 participant
선택과 Progress, 전체 결과 접기를 각각 기존 공개 API로 비교한다.

룰렛은 선택 한 번이 멈춤 각도와 결과를 함께 결정한다. 애니메이션 완료 시 두 번째 추첨을 하거나
reduced motion일 때 다른 난수 경로를 사용하지 않는다. 사다리 replayGeneration은 취소된 타이머가
새 참가자를 진행시키지 못하게 하므로 유지한다. 결과 카드 live region에 100ms 커서를 넣지 않는다.

점수판 +/-는 pending 중에도 큐에 들어간다. undo/구조 변경 잠금은 카운터와 다르므로 파일별
현재 조건을 유지한다. 삭제 확인에는 오류를 삼킨 void helper 대신 실제 저장 Promise를 연결한다.

## 축하 효과의 현재 의존성 경계

소비 package.json에는 Reanimated4.5.1이 있지만 react-native-fast-confetti/Skia 선언은 없다.
HJM Celebration은 fast-confetti를 정적으로 import한다. 기존 제품의 10월3일 실패 주석만 믿지 않고
이 현재 소스를 다시 확인했다. 릴리스 후 optional peer의 호환성·정책·native host를 검증하고
가능하면 공통 어댑터로 교체한다. peer 없이 import하거나 기존 native binary가 지원한다고
가정하지 않는다. 설치/빌드/실기기 확인 전까지 제품 대체 효과를 제거하지 않는다.

## 아직 필요한 검증

룰렛 2~30칸 끝 각도/동일명 항목, 사다리 2~12인 경로·취소 직후 선택·재생 재개,
팀 분배 최대100인·남는 인원·이름 중복, 제외45개 중 최소6개·기록 저장 실패와 결과 유지,
점수 연속 탭·음수·긴 자릿수·저장 실패·취소, 각 제품 테마와 큰 글자·다크·모션 감소·접근성.
추첨은 로컬 도구이며 결제나 복권 구매를 실행하지 않는다. 실제 기능 검증은 아직 pending이다.
