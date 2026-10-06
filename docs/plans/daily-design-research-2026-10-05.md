# 2026-10-05 디자인 리포트 대조

입력: app-portfolio/research/2026-10-05/design-system.md, source-verification.md,
validation.md. 전일 자료 폴더는 이월 근거이며 오늘 새 시험으로 세지 않았다.
오늘 변경은 [상호작용 품질 기준](../INTERACTION_QUALITY.md)의 상태 소유권 선택 기준뿐이다.
기존 미커밋 overlays·계약·Storybook 작업은 보존했다.

## 재사용 및 보류

| 항목 | 현재 소스 대조와 판단 |
| --- | --- |
| 그룹 대표/전체 선택 | 두 showcase SelectionScope와 기존 품질 지침에 있음. 새 UI 없음 |
| 다중 선택 | CollectionSelectionModel, DataTable/Tree 계약 재사용. 서버 권한·부분 실패는 제품 소유 |
| 검색·미리보기·복귀 | 두 Search 및 ReferenceFilters 예제, Sheet·Dialog 재사용. 검색 범위 단계 확대와 URL 복원까지 구현됐다는 뜻은 아님 |
| 속성 복사 후 대상 적용 | 선택 모델은 재사용 가능. 실제 제품의 복사 속성·호환 대상·Undo 정책이 정해지지 않아 범용 복사 UI 보류 |
| 변환 전후 비교 | 기존 ReferenceComparison은 같은 기록의 표현 비교이며 이미지 변환 비교가 아님. 처리 엔진·비교 좌표·메모리 요구가 없는 상태에서 별도 이미지 UI 추가 보류 |
| 작은 화면/낮은 높이 | 루트 VQ와 기존 Sheet 계약의 스크롤·키보드·큰 글자 기준 재사용. 제품의 낮은 높이 문제를 해결했다고 주장하지 않음 |
| FlashList/Activity/Expo sheet | 공식 문서 3곳을 오늘 직접 열어 좁은 수명주기·호환성 주장 확인. 지침에 조건부 선택 기준 추가, 의존성 도입·교체 없음 |

FlashList 재활용 상태 누출 방지, Activity 숨김과 지속 작업 분리, BottomSheet API 이름과
실제 동작의 차이를 새로 명시했다. 근거 URL은 품질 기준에 연결했다. 공개 API 계약을
바꾸지 않았으므로 새 컴포넌트·스토리·Changeset을 만들지 않는다.

## 검증 범위

- 기존 Web/Native 스토리와 계약·선택 구현을 소스에서 대조했다.
- 공식 문서 재확인은 설치 앱이나 실제 기기 동작 검증이 아니다.
- `pnpm docs:check`: Markdown 252개 링크 검사 통과. `git diff --check`: 통과.
- UI·기본/어두운 테마/큰 글자·런타임 회귀 테스트는 재실행하지 않았다. UI 소스 변경 없음.
- npm 게시·소비 앱 설치·릴리스·스토리북 승급·서버/Metro 변경 없음.
