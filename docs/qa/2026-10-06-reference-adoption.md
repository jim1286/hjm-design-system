# 레퍼런스 적용 QA

2026-10-06 · 상태: 실험 구현 완료, 아래 검증 통과. 전체 CI는 통과하지 않음.
[구현 범위와 보류 항목](../plans/ui-reference-application-2026-10-06.md)

## 수정 전후와 원인

- 전: 전용 별점/이미지 비교 API 없음, 내용 전환의 주변 높이는 즉시 변경.
- 후: 두 플랫폼의 Rating/ImageComparison, opt-in 높이 전환, 양쪽 7개 실험 항목(기본/다크/큰 글자).
- 브라우저 첫 테스트에서 별 그림이 실제 radio 클릭을 가렸다. 장식에 pointer-events:none을
  적용해 입력이 pointer를 소유하도록 수정했다. 강제 클릭으로 우회하지 않았다.
- 실제 Showcase에서 기존 장식용 `.hjm-rating` 규칙이 새 fieldset을 48px/경고색으로 만들었다.
  새 컨테이너를 `.hjm-rating-control`로 분리한 뒤 기본/다크/큰 글자를 다시 확인했다.
- Native 높이 기능이 꺼져도 AppState listener를 추가하던 문제는 opt-in일 때만 등록하도록
  수정했다. 기존 전환 생명주기 테스트를 바꾸지 않고 다시 통과했다.
- 새 Native granular export 두 개를 Metro smoke fixture에 연결해 실제 번들 경로를 검사했다.
- 기능 카드의 제목/본문이 Web에서 한 줄에 붙던 문제는 두 플랫폼 모두 Stack 간격으로 수정했다.

## 자동 검사

| 검사 | 결과 |
| --- | --- |
| design-contracts typecheck/test/build/contracts:check | 통과, 90파일 937테스트(새 계약 2개 포함) |
| React check | typecheck, SSR 182 + browser 1,008테스트, build 통과 |
| 새 React browser 테스트 최종 재실행 | 4개 통과: radio 키보드/폼/초기화, readonly·disabled·RTL·큰 글자, 비교 좌표·Home/End, 빠른 높이 전환·reduced motion |
| Native typecheck/test | 83파일 968테스트 통과(새 host 4개 포함) |
| Native Metro production bundle | 통과, 61 families/682 modules, raw 1429.0KiB, gzip 350.2KiB. Android JS/pre-Hermes 검사이며 기기 실행이 아님 |
| Native Showcase | 생성·타입·24테스트 통과 |
| Web Showcase | 타입·32테스트·토큰 경계 통과. 48rem 분기는 사례별 편집 레이아웃 예외와 이유로 기록 |
| Web Storybook build/verify:static | 통과, canonical 103개 + navigation 13개 정적 색인 확인 |
| renderer import graph budgets | 통과(기존 누적 트리 경고 있음). 새 Rating/ImageComparison/ContentTransition 그래프 모두 PASS |
| workspace/evidence/docs/api-map/usage | 통과. 공개 API 이름 296개, 사용 지침 단위 136개 |

`pnpm ci:check`는 계약 테스트 이후 기존 수정 중인 `reactions` 그래프의 용량 제한에서 실패했다
(raw 약1.4kB, 예산1.3kB와 10% 허용폭 초과). 이번 작업은 reactions 소스/예산을 변경하지 않았다.
나머지 검사는 위와 같이 개별 실행했다. 별도 governance 검사는 작업 전 package.json에 추가되어
있던 `usage:check`와 검사기의 고정 check 문자열이 달라 실패했다. 검사기나 기존 변경을 지우거나
예산을 높여 성공으로 만들지 않았다. 따라서 전체 CI/릴리스 준비 완료로 보고하지 않는다.

## 실제 화면과 재현

- CUA의 로컬 Web Storybook에서 신규 7종 × 기본/다크/200% 글자 21개를 한 비교 화면으로
  모아 시각 검토했다. 비교판에서 아래가 잘린 긴 서비스 소개는 별도 전체 화면으로 확인했다.
- Rating: 최초 미평가, 읽기 전용 3.5, disabled 4와 테마·확대 상태. 실제 radio 선택/키보드는
  browser 회귀 테스트로 확인했다. 스타일 이름 충돌 수정 뒤 비교판을 재확인했다.
- ImageComparison: 동일 좌표의 전후 이미지와 50% 경계, 라벨/슬라이더/전체 보기 버튼을 확인했다.
  0/100 및 Home/End의 경계와 이미지 크기는 browser 테스트로 확인했다.
- 높이 패널: 200% 글자에서 메모 입력 후 상세를 선택해 내용 확장과 메모 보존을 확인했다.
- 저장 피드백: 다크에서 제목 입력→다음 저장 실패→저장으로 오류 문구와 제목 보존을 확인했다.
  다시 저장 버튼으로 pending 재진입까지 확인했으며 수동 성공 완료 관찰은 하지 않았다.
- 파일 전송: 200% 글자에서 예제 사진 추가→전송 시작→예제 실패 응답→다시 전송→예제 성공
  응답으로 같은 파일의 전송 완료와 제거 행동을 확인했다. 실제 파일/서버로 전송하지 않았다.
- 서비스 소개: 1280px의 2:1 카드 구성, 390×844에서 원래 순서의 단일 열과 가로 넘침 없는
  이미지/버튼을 확인했다. 주 행동 클릭으로 첫 기록 제목 입력이 나타나고 초점이 이동했다.
- 편집 도구: 390px 다크에서 입력→도구 펼침→강조 선택 후 입력값 보존과 선택 상태를 확인했다.
- 일시 viewport override는 해제했다. 임시 비교 HTML·실패 스크린샷·작업 로그는 이 기록으로
  요약하고 제거했다. 소스·재사용 fixture·회귀 테스트·dist는 보존한다.

## 미확인과 적용 경계

- Device Hub/실기기 프레임률, OS 최대 글자, VoiceOver/TalkBack. 새 native build/시뮬레이터 생성 없음.
- 실제 서버 전송·제품 저장·소비 앱 설치·npm 게시·배포 분류 승격 없음.
- Morphing overlay/SegmentedControl 추가 표시/Progressive Blur는 구현 범위 표의 보류 조건 유지.
- 11개 사이트의 모든 페이지와 유료/차단 콘텐츠까지 조사·적용 완료한 것은 아니다. 원 조사에
  남은 접근 제한과 미확인 범위를 보존한다.
