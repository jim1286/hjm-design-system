# 11개 레퍼런스 조사 결과 적용

상태: 아래 범위 실험 구현 완료 · 부분 검증 통과, 전체 게이트 실패는 QA에 기록 · 2026-10-06 · 사용자 요청: “적용해”.
[조사](ui-reference-full-audit-2026-10-06.md)의 조건부 후보를 모두 새 라이브러리로 도입하지 않고
기존 API로 충족되는 구성과 새로운 의미 계약을 구분한다. 다른 세션의 기존 미커밋 코드는 보존한다.

## 구현한 범위

- `Rating`: 두 renderer의 독립 `/rating` entry. null·정수 입력·소수 평균, 명시적 초기화,
  radio/읽기 전용 이미지 의미, 제품 번역. 새 의존성 없이 기존 Button·토큰을 사용한다.
- `ImageComparison`: 두 renderer의 `/image-comparison` entry. 같은 비율의 이미지 좌표를 유지하며
  기존 Image의 실패 fallback과 Slider의 키보드/adjustable·드래그 계약을 사용한다.
- `ContentTransition animateHeight`: 기본 false. Web ResizeObserver/WAAPI, Native onLayout/Animated.
  첫 측정·모션 감소·백그라운드 정지와 단일 콘텐츠를 유지한다. 자동 높이 전환이 필요한 작은 패널용이다.
- 양쪽 7개 개별 실험 항목, 각각 Default/Dark/LargeText: 별점, 이미지 비교, 높이 전환, 버튼 완료
  피드백, 파일 선택·오류 복구, 기능 카드·CTA 소개, 입력을 유지하는 편집 도구.
- 사용 지침·공개 API 대응표·Changeset·구체적인 import graph 예산을 함께 갱신한다.

## 조사 후보별 적용 판단

| 조사 후보 | 이번 적용·선택 |
| --- | --- |
| Morphing Popover/Dialog | geometry 이관 보류. 현재 Dialog/Popover의 focus·stack 계약을 변경하지 않으며 기존 MorphingMenu는 계속 선택 가능하다. 실기기 동등성 근거 없이 기존 overlay를 모핑 엔진으로 교체하지 않는다. |
| Transition Panel | `animateHeight`로 필요한 주변 높이 표현만 두 플랫폼에 적용. |
| Animated Background | Tabs의 기존 gooey 표시 유지. SegmentedControl 공유 표현은 별도 검증이 필요하여 이번 변경에서 추가하지 않았다. |
| Stateful Button | 기존 Button의 loading·label과 action-session을 연결한 완료/실패 구성. 새 mutation/버튼 API 없음. |
| File Upload | 기존 FilePicker·UploadItem을 연결해 중복 선택 제거, 전송 시작·취소·오류·재시도 구성. 전송률을 타이머로 만들지 않음. |
| Bento Grid | 기존 Surface/Stack으로 기능 카드와 실제 이미지 비교를 배치. Web 2:1, 좁은 Web/Native는 원래 순서의 단일 흐름. |
| CTA | 제목→가치 설명→기능 미리보기→주 행동→조건 안내. 실제 클릭으로 첫 기록 입력이 나타남. |
| Refero | 제품 레퍼런스를 HJM 토큰/행동으로 번역하는 brief 템플릿 추가. 브랜드 기본값 변경 없음. |
| Image Comparison | 새 controlled 조합, 전후 전체 보기 예제. |
| Dynamic/Expandable Toolbar | 기존 Collapsible·Button과 바깥 입력을 조합해 입력 문맥 유지. |
| Progressive Blur | 보류. 정보 가림과 RN 합성 비용을 검증하기 전 기본 목록에 적용하지 않음. |
| Noise/EffectSurface | 기존 grain/glow/mesh가 이미 제공하는 표현은 중복 추가하지 않음. |
| Hero Video Dialog | 실제 제품의 자막·영상·host player가 필요하므로 새 영상 엔진은 추가하지 않음. Dialog+Asset 조합 유지. |
| Rating | 새 입력/읽기 전용 계약과 두 renderer 구현. |
| 3D icons | 제품별 자산 슬롯 경로 유지. 특정 브랜드·이미지 선택 없이 공용 패키지에 일괄 번들하지 않음. |
| Number Ticker | 현재 Intl/RTL/fallback을 가진 AnimatedStatistic 유지. |
| Scroll Progress | 현재 명시적 host와 Timeline 계약 유지. |
| Animated List | 실제 데이터 순서와 ContentTransition을 사용. 가짜 알림 발생기를 추가하지 않음. |

전수 조사의 미확인 범위는 원 조사에 그대로 남아 있다. 위 표의 보류를 구현 완료로 세지 않는다.

## 실험 경로

Web story ID는 `reference-adoption-{rating,imagecomparison,adaptivecontent,actionfeedback,uploadrecovery,productbento,contexttoolbar}`.
Native는 각각 `실험/컴포넌트/입력/별점`, `실험/컴포넌트/데이터 표시/이미지 전후 비교`,
`실험/구성/내용 전환/높이가 이어지는 패널`, `실험/구성/공통 동작/버튼 완료 피드백`,
`실험/구성/파일 전송/선택과 오류 복구`, `실험/화면/서비스 소개/기능 카드와 주 행동`,
`실험/구성/편집/입력을 유지하는 도구`다. 배포 분류로 승격하거나 npm 게시하지 않는다.

## 검증

결과·수정 전후·미확인 범위는 [작업 QA](../qa/2026-10-06-reference-adoption.md)에 기록한다.
네이티브 호스트 테스트는 Device Hub/실기기 검증이 아니며 소비 앱 설치·게시와 별개다.
