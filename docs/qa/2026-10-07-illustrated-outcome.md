# 3D 자산을 이용한 시작 안내 실험

2026-10-07 · 실험 구현과 Web 시연 확인. 승격·실기기·npm 게시 완료가 아니다.

## 변경과 선택 근거

18개 후보 중 3D icons 활용을 기존 EmptyState·OnboardingScreen·Result의 제품 슬롯으로
구현했다. 새 상태 엔진이나 wrapper를 만들지 않았다. 양쪽 Storybook 경로는
`실험/구성/피드백과 복구/그림과 시작 안내`이며 Default/Dark/LargeText를 제공한다.

3dicons Notebook·Tick의 개별 상세에서 CC0를 확인하고 그림의 의미도 직접 열어 대조했다.
처음 받은 200px WebP는 흰 배경이 합성되어 다크에서 사각형이 드러났다. 같은 상세의
Download current로 dynamic/color 500px PNG 원본을 받아 교체했고 두 파일의 alpha를 확인했다.
배경을 임의로 편집하지 않았으며 원문·용량·hash는 Showcase 자산 README에 보존했다.

## 기능·시각 확인

- IAB 기본 1280×720: 빈 상태→시작 안내→입력 단계. 공백 제목에서 완료가 비활성이다.
- 제목 입력→이전→그림 없이 보기→다음에서 동일 제목 유지. 그림 없이 완료한 결과에도
  입력 제목과 다시 체험하기 행동이 남았다. 이 예제는 서버 저장을 하지 않는다고 표시한다.
- 다크 1280×720: PNG 교체 후 흰 사각형이 없어지고 제목·주 행동을 읽을 수 있다.
- 큰 글자 2배: 기본 폭과 좁은 폭을 확인했다. browser viewport 호출만으로는 대상 탭의
  innerWidth가 바뀌지 않아 검증으로 세지 않았다. 해당 탭의 CDP metrics로 innerWidth=390을
  확인한 뒤 단계 이동·입력·완료를 실행했다. 결과 h2=40px, document.scrollWidth=390,
  체크 이미지 decode 완료, 표시 폭 32px를 확인했다. metrics는 검증 뒤 해제했다.
- 해당 실험 탭에서 실제 notebook.png 요청을 CDP Network 차단으로 실패시켰다. img가 0개로
  제거됐지만 제목·설명·기록 시작하기 버튼은 유지됐고 버튼으로 첫 단계에 진입했다. 차단·캐시
  설정은 즉시 복원했다. 손상 파일 디코딩과 Native 장치 디코딩은 별도 미확인이다.

## 자동 검사

Web Showcase typecheck·43개 테스트·token boundary 통과. Native story index 생성·typecheck·17개
테스트 통과. 이 테스트들은 기존 Showcase 계약 검사이며 새 흐름의 장치 테스트는 아니다.
사용 지침/스토리 ID/문서 링크 검사 통과. PNG 교체 후 Web Storybook production build가 종료 코드 0으로 완료됐고 두 PNG가
해시 파일명으로 assets에 포함됐다.

## 남은 범위

Native 실제 화면·접근성·초안 보존, 두 제품 팔레트 전체 시트, 손상 이미지 디코딩 검증,
다른 3dicons 항목/색/각도 전수 검토는 남았다. 다른 후보(progressive blur·video 등)의 구현도 남았다.
이 기록은 특정 두 자산의 시연이며 11개 사이트 전체 검토나 제품 채택을 증명하지 않는다.
