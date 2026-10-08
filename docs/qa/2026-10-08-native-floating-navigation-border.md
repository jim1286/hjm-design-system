# QA 리포트 — Native floating BottomNavigation top border

## 1. 최종 판정

- 판정: **부분 확인**. 공개 Native renderer 소스의 top-edge 결함을 재현·교정했고 focused 회귀와 typecheck는 통과했다. 패키지 생성물·게시·소비 제품 실기기 검증은 수행하지 않았다.
- 기존 공개 recipe와 Web renderer는 올바르므로 새 옵션·export·descriptor·recipe를 추가하지 않았다.
- 실행: 2026-10-08 10:08–10:10 KST. Node24.20.0, 수행자 Codex C.

## 2. 대상과 이력

- 저장소/브랜치: HJM 독립 저장소 `main`, 기준 HEAD `bab75c45c71d4460d001cc7a024be15514640a5e` + 본 미커밋 변경.
- source/read ownership: `AGENTS.md`/`CONTRIBUTING.md`/`docs/RELEASE_GOVERNANCE.md`를 읽고 main 작업·경로 한정 규칙을 따랐다. 기존 comment-overflow의 양 renderer source/test/dist/usage/showcase·Changeset·QA dirty는 보존했다.
- 본 작업 소유: `packages/react-native/src/navigation.tsx`, 기존 `packages/react-native/test/navigation-product.test.tsx`, `.changeset/native-floating-navigation-border.md`, 이 QA 파일. 커밋·push·게시 없음.

| 실행 KST | 대상 | 수정 전·후 | 판정 |
| --- | --- | --- | --- |
| 10:08:48 | 기존 floating product fixture에 effective 4-edge 기대 추가 | 교정 전 | top edge 실제0 / recipe1로 1건 FAIL. 다른7건은 `-t` 선택에서 제외 |
| 10:09:06 | native navigation source 1조건 교정 후 관련3파일 | 교정 후 | 22 PASS / 기존2 skip, 새 skip 없음 |
| 이후 같은 작업 | Native package typecheck | 교정 후 | exit0, emit/build 없음 |

## 3. 환경과 검증 범위

- Vitest4.1.11 + react-test-renderer + 저장소 Native host mock. 실제 iOS/Android 기기·브라우저 검증이 아니다.
- 기존 product fixture는 light/reducedMotion, floating/compact/center-gap, 4 destination와 center action, numeric badge, safeAreaBottom12, keyboard hide를 소비한다.
- router/API/서버/기기/Metro/로그인은 건드리지 않았다. 시작 시 load8.85/17.17/38.66, fullbuild 없음(watch tsc는 유지) 확인 후 최소 검사만 실행했다.
- OS 최대 접근성 글자 및 그 최대값 모사 조건은 설계·검사·후속·완료/릴리스 차단에서 완전히 제외했다. 추가하지 않았다.

## 4. 재현·원인·수정

| 조건 | 기대 | 교정 전 | 교정 후 |
| --- | --- | --- | --- |
| floating frame | recipe borderEdges=all, 모든 변1px | borderWidth1이지만 명시 borderTopWidth0이 위 변을 덮음 | top 포함 네 effective width1 |
| bar | top1px, 다른 변0 | 기존 정상 | 조건 의미 유지 |
| capsule | outer frame border0, 내부 list의 all-edge frame | 기존 정상 | outer top0 유지, 내부 list 변경 없음 |

원인: `navigation.tsx`의 surface style은 floating에 borderWidth1을 주면서 `presentation === bar ? width : 0`으로 borderTopWidth를 명시했다. React Native는 개별 edge 값을 전체 borderWidth보다 우선하므로 floating 위쪽이 사라진다. 기존 회귀는 borderWidth1만 기대해 이 결함을 놓쳤다.

공개 근거: `packages/design-contracts/src/component-recipes.ts`의 floating은 borderEdges=[all]/borderWidth1, Web `packages/react/src/styles.css`의 floating frame도 border1px이다. capsule은 frame이 다른 위치에 있으므로 무조건 모든 presentation의 outer border를 켜는 대안을 쓰지 않았다. Native 조건만 `capsule ? 0 : presentationRecipe.borderWidth`로 교정하고 이유 주석을 남겼다.

새 회귀는 실제 렌더된 surface의 flatten style을 읽어 각 edge별 width가 존재하면 그것을, 없으면 전체 borderWidth를 적용해 네 변을 검사한다. 내부 조건식을 그대로 복사하는 검사나 단순 borderWidth 존재 검사가 아니다.

소비 영향: floating Native 도크의 누락된 top1px가 복원된다. 현재 BurnTok의 1px surfaceStyle 보정과 결과가 같으므로 교정된 **게시 train 설치 후** 제품 보정을 제거할 수 있다. 현재 설치된1.16.0에서 먼저 보정을 지우면 누락이 되살아난다. palette scope/중앙action/방향/측정/safe-area/keyboard/선택/route intent는 바꾸지 않았다.

## 5. 검사 결과

아래 명령은 Node24.20.0 PATH에서 대상 저장소 루트로 실행했다.

| 명령 | 결과 | 의미 |
| --- | --- | --- |
| `pnpm --filter @hjmds/react-native exec vitest run test/navigation-product.test.tsx -t 'binds BottomNavigation slots' --reporter=dot` | 교정 전1 FAIL | expected1 / received0, 새 effective-edge 기대가 결함을 재현 |
| `pnpm --filter @hjmds/react-native exec vitest run test/navigation-product.test.tsx test/deprecated-style-navigation.test.tsx test/bottom-navigation.interaction.test.tsx --reporter=dot` | 3파일, 22 PASS / 기존2 skip | product intent/center/safe-area/keyboard, deprecated warning/호환, navigation action 회귀 보존 |
| `pnpm --filter @hjmds/react-native typecheck` | exit0 | 현재 dirty tree에서 Native source/types 확인, 생성물은 emit하지 않음 |

두 skip은 기존 bottom-navigation.interaction의 controlled/OS navigation label scale limit 사례로 이 변경에서 추가·수정하지 않았다. runner의 기존 react-test-renderer deprecation 안내도 숨기지 않았다.

### 2026-10-08 source 통합 직전 재검증

1.16.1 patch 준비를 위해 `main@bab75c45`의 comment-overflow와 floating 교정을 함께 읽고 검사했다. 실행은 Node24.20.0, 10:16 KST 시작이며 load5.79/9.36/25.68·가용 디스크12GiB에서 순차 focused 검사로 진행했다. 버전 생성·전체 build·release gate·push·게시·기기 실행은 수행하지 않았다. 다음 결과는 위 10:08 교정 당시 검사와 별개의 통합 직전 실행이다.

| 명령 | 결과 | 범위 |
| --- | --- | --- |
| `pnpm --filter @hjmds/react-native exec vitest run test/screen-flows.test.tsx test/navigation-product.test.tsx test/deprecated-style-navigation.test.tsx test/bottom-navigation.interaction.test.tsx --reporter=dot` | 4파일, 47 PASS / 기존2 skip | 댓글 action callback 독립성 및 floating/center/safe-area/keyboard/호환 회귀. Native host mock |
| `pnpm --filter @hjmds/react exec vitest run --config vitest.browser.config.ts test/screen-flows.browser.test.tsx test/comment-overflow-evidence.browser.test.tsx --reporter=dot` | 2파일, 27 PASS | 실제 Chromium, 320px light/dark·LTR/RTL 댓글 인접 배치, 메뉴·좋아요·답글·Escape 초점 복귀 |
| `pnpm -r --workspace-concurrency=1 --filter @hjmds/react --filter @hjmds/react-native --filter @hjm/showcase-web --filter @hjm/showcase-native run typecheck` | 4프로젝트 exit0 | 양 renderer 및 양 Showcase 타입 검사, noEmit |
| `pnpm usage:check` | PASS | 토큰13·컴포넌트139·구성59·화면22 지침 |
| `pnpm docs:check` | PASS | 통합 기록 추가 전595개 Markdown |
| `pnpm api-map:check` / `pnpm storybook:check` | PASS / PASS | 공개 platform API310, Storybook433파일·Web ID970 정적 검사 |
| `pnpm workspace:check` / `pnpm evidence:check` | PASS / PASS | 기존1.16.0 fixed train·export/catalog/문서·evidence 정합성. 새 버전 게시 증거가 아님 |

OS 최대 접근성 글자 및 최대값 모사 조건은 실행하지 않았고 기존 최대 전용2개 skip을 유지했다. 실행된 기존 일반2x fixture는 최대값 모사 목적이 없는 공개배율·행동 회귀이며 최대 조건의 완료 근거로 사용하지 않는다. Native runner의 react-test-renderer/act 안내와 브라우저의 act 안내는 발생했지만 모든 선택 검사는 통과했다; 경고를 숨기거나 실패 검사를 제외하지 않았다.

기존 [comment-overflow QA](2026-10-07-comment-overflow-position.md)의 양 renderer·양 Showcase4개 source SHA256은 현재와 모두 일치했다. 착수 시 전체 dirty26경로의 SHA256을 고정하고 검사 후 변화0을 확인했다. integration 대상25경로는 댓글 변경18 + floating 변경7(dist3 포함)이며, 기존 dist의 내용은 source 교정과 맞는 것을 읽었다. 이번 수행자는 dist를 생성하거나 직접 수정하지 않았다. 과거 개발클라이언트 설치 QA1은 이번 source commit 밖에 보존한다. 구형 `fix/1.13.2-recent-remove-icon` worktree dirty6경로도 보존했다; FixedGlyph 기능은 이미 main에서 더 보강된 구현으로 존재하므로 오래된 파일을 다시 적용하지 않는다. 활성 세션 종료를 읽기만으로 확정하지 않았다.

## 6. 미확인 범위와 후속

| 범위 | 현재 상태 | 담당/조건 |
| --- | --- | --- |
| 실제 Native paint | mock source/style 확인 | root가 교정된 설치본으로 실제 floating 도크 관찰 |
| dist·artifact·full release gates | build/생성/전량검사 미실행 | root가 릴리스 필요성/자원 조율 후 정상 생성·검사 |
| npm/고정 train·소비 lock | 버전/게시 변경 없음 | root 게시·integrity 확인 후 소비 제품 exact dependency 반영 |
| BurnTok surfaceStyle 보정 | 제품1.16.0에서 유지 | 교정된 train 실제 설치 후 해당 보정만 제거·실기 재검증 |

새 API가 없으므로 catalog/exports/Storybook 제목 이동은 없다. 기존 usage의 all-edge 의미는 그대로 유지한다. 이 local focused 통과를 릴리스·소비 적용 완료로 보고하지 않는다.

## 7. 보관 처리

- 수정 전 실패와 수정 후 결과를 이 리포트에 합쳤다. raw screenshot/log/JSON/임시 스크립트를 생성하지 않았으므로 제거할 본인 산출물은 없다.
- 테스트·Changeset·제품 소스 및 다른 세션의 dirty/계약 증거는 보존한다. 기존 QA 파일/기기 세션/원시 BurnTok 이미지는 수정하지 않았다.
