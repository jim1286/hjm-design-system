# 2026년 10월 3일 디자인 리서치 반영 기록

오늘 리포트의 재사용 가치는 새 UI보다 수치 단위와 검증 경계를 명확히 하는 데 있다.
기존 컴포넌트·구성을 재사용하고 Progress 및 UploadItem 계약과 제품 상호작용 지침을 보완했다.

입력은 이미 압축 해제된 `app-portfolio/research/2026-10-03/`의 `README.md`,
`design-system.md`, `design-current-project.md`, `validation.md`, `validation-gaps.md`,
`project-source-deltas.md`, `evidence-package-check.json`이다. 리포트는 10월 2일의 고정 소스·실행
기록을 정리한 자료이며, 10월 3일 실기기 재검증이나 최신 운영 상태 확인으로 취급하지 않는다.
대조한 HJM checkout은 `main`, `6172d26`이다.

## 기존 구현으로 충족한 항목

| 조사 항목 | 현재 소스와 Storybook 대조 | 판단 |
| --- | --- | --- |
| Progress 기본 max | 공통 progressRecipe는 100. Web/Native에 진행 표시 스토리가 있음 | 새 진행 표시 컴포넌트 불필요 |
| UploadItem의 0–1 비율 | 두 renderer가 progress에 100을 곱해 내부 Progress에 전달. 불확정 값은 null | 기존 계약 유지, 단위 예제 추가 |
| STEA의 인증·진행·일정·뒤집기·수치·빈 상태·티켓 구성 | 기존 Web/Native 구성과 기본·어두운 테마·큰 글자 스토리가 있음. 10월 2일 승인으로 배포 분류에 있음 | 중복 구성 추가나 재승급 없음 |
| Native Grid 너비와 번들 예산 | 기존 픽셀 단위 내림 수정과 110% 예산 경계가 있음 | 수정 재적용 불필요. 번들 예산 통과를 실기기 성능 개선으로 해석하지 않음 |
| 저장·재시도·Undo·오래된 응답 복구 | 기존 공통 동작·상호작용 실험과 품질 기준이 있음 | 기존 기능 재사용. 제품 서버·영속 상태를 HJM 안에 복제하지 않음 |

Native Storybook에서 Progress는 `배포/컴포넌트/상태와 알림/진행 표시`, UploadItem은
`배포/컴포넌트/데이터 표시/업로드 항목`에 있으며 각각 기본·어두운 테마·큰 글자 스토리가 있다.
Web은 기존 `Feedback.stories.tsx`의 ‘진행 표시’와 `DataDisplay.stories.tsx`의 ‘업로드 항목’을
재사용한다. STEA 구성 7개는 두 표면 모두 기본·어두운 테마·큰 글자 스토리가 있다.

## 흡수한 원칙과 선택 기준

- [Progress 계약](../../packages/design-contracts/docs/progress.md): 직접 백분율 입력 64,
  직접 비율 입력 0.64와 max 1, UploadItem descriptor 입력 0.64를 비교하는 표를 추가했다.
  이미 올바른 비율을 일괄 변경하는 사고를 막는 기준이다.
- [UploadItem 계약](../../packages/design-contracts/docs/upload-item.md): 내부 변환 경계를 명시했다.
  제품에서 미리 변환하는 대안은 이중 변환을 만들기 때문에 채택하지 않는다.
- [제품 상호작용 품질 기준](../INTERACTION_QUALITY.md): Chromium shim·시뮬레이터·기기 조작,
  격리 예제·실제 소비 호스트, 파일 생성·파일 사용 결과를 구분해 기록하도록 구체화했다.
  변경된 경계에서 필요한 확인만 하며 문서 변경 때문에 전체 제품 QA를 재개하지 않는다.

## 보류한 범위

BurnTok·Utilverse 등 제품의 미완료 비교 QA, Android 라이브러리 조작, 출력 파일의 한글 복사·저장,
실제 부모 CSP 통합, 물리 기기 재시험과 서버 이미지 배포는 제품 작업으로 남긴다. 오늘 HJM 문서
보완으로 해결했다고 보고하지 않는다. 제품별 실패를 재현하지 않은 채 일반 컴포넌트를 추가할
근거도 없다. 마케팅·사업 제안은 이번 디자인 시스템 흡수 범위에 포함하지 않는다.

## 출처와 이번 검증

리포트의 핵심 변경 근거는 다음 공식 저장소 기록과 현재 구현으로 대조했다.

- [PR 49](https://github.com/jim1286/hjm-design-system/pull/49): STEA 구성 승인, Progress 기본값 통일,
  Web 인증번호 busy 처리. Native busy 키보드는 당시 미확인 범위로 남아 있다.
- [PR 50](https://github.com/jim1286/hjm-design-system/pull/50): Native Grid 너비의 기기 픽셀 단위 내림.
- [PR 51](https://github.com/jim1286/hjm-design-system/pull/51): 번들 예산의 10% 여유 경계.
- [릴리스 실행](https://github.com/jim1286/hjm-design-system/actions/runs/36967033905): GitHub API로
  completed/success와 대상 SHA `90ee2fbc895da8430851591fd74ddfe24eb7a929`를 확인했다.
  이 상태만으로 현재 npm 최신 버전이나 소비 앱 공개 상태를 판정하지 않는다.

이번 변경은 문서만 대상으로 한다. Web/Native 구현·기존 스토리 등록·테스트 원문을 확인했다.
Web UploadItem의 기존 browser test에는 0.64 입력이 내부 progress 값 64가 되는 assertion이 있다.
오늘 해당 browser test나 Native renderer test를 재실행한 것은 아니다.

- `pnpm docs:check`: Markdown 247개 문서 링크 검사 통과.
- `git diff --check`: 통과.
- 새 UI·승급·의존성 변경·빌드·게시·배포 없음. pnpm의 실행 전 준비는 already up to date였으며
  package.json·lockfile 변경은 없다.
- 기본·어두운 테마·큰 글자 스토리 등록을 소스에서 확인. 오늘 브라우저·기기 화면 조작과
  성능 측정은 실행하지 않았다.
