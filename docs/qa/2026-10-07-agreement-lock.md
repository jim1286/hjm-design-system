# QA 리포트 — 약관 제출 잠금과 큰 글자

## 판정과 대상

부분 확인. 2026-10-07, main eaf9e5d 위 Agreement 변경. 필수 동의 상태를 유지하며
변경만 잠그는 descriptor.disabled를 양 renderer에 추가했다. npm 게시·Utilverse 적용은 미실행이다.

## 환경

Web 개발 Storybook 6006, IAB 390×844 dark/textScale2 및 기본 light 흐름.
Native 기존 iPhone 17 Pro / iOS26.5 / Expo Go57.0.9, Metro8084.
idb·simctl 확인이며 Device Hub 직접 UI 검증이나 실물 Release 검증은 아니다.
로컬 fixture로 실제 가입·법적 동의 저장은 수행하지 않았다.

## 문제와 수정 전후

Utilverse 필수 Checkbox 둘은 제출 중 잠그지만 기존 Agreement는 required+item.disabled를
거절했다. 묶음 잠금을 추가해 선택·필수 판정·전체 동의 분모를 유지한다. 전문 읽기는 가능하다.
Web은 aria-disabled와 이벤트 방어로 초점을 유지하고 Native는 disabled/accessibilityState를 제공한다.

2배 글자에서 긴 전문 버튼이 제목 폭을 좁혀 한국어가 세로로 끊기고 문자 체크가 원 밖으로 나갔다.
제목 70% 기준 폭과 줄바꿈, 고정 도형 체크로 보완했다. Native 실제 화면에서 flexBasis만으로는
제목이 여전히 좁아지는 것을 재현해 minWidth 70%를 추가했다. 최종 캡처·AX에서 두 제목 모두
370pt 폭을 사용하고 전문 버튼이 각각 다음 줄에 놓였다. 체크 도형은 원 안에 있다.

## 흐름 결과

- Web 잠금 중 전체·개별 키보드 입력은 선택을 바꾸지 않고 초점을 유지한다. 전문 열기와 잠금 해제 후 전체 선택 확인.
- Native light1x 잠금 중 미선택 개인정보 터치 후 unchanged, 전문 열기, 해제 후 전체 선택 확인.
- Native 최종 dark2x: 전체 mixed/이용약관 checked/개인정보 unchecked 모두 enabled=false.
  전문 버튼 두 개 enabled=true. 개인정보 전문을 터치하면 예시 본문이 나타나고 선택은 그대로다.
- 임시 Native story globals는 확인 후 제거했다. 기본 비활성 story에 다크/큰 글자를 강제하지 않는다.

## 검사

계약 agreement.test.ts 9개, Native agreement.interaction.test.tsx 2개 통과(최종 minWidth 변경 후 재실행).
이전 Web Agreement 두 browser 파일 13개 통과 및 세 package typecheck/build 통과.
큰 글자 browser 테스트 초기 실패에는 CSS import 누락이 있었다. 이를 제품의 수정 전 회귀 증거로
세지 않는다. 수정 전 화면 관찰과 CSS를 명시적으로 읽은 최종 테스트를 구분한다.

문서 링크 575개, usage/Storybook 규격 923 story, Native Showcase typecheck, renderer graph/platform 경계, API map/workspace/evidence 검사 통과. 전체 ci:check는 이번 변경에서 미실행이다.

## 미확인과 보관

Android, VoiceOver/TalkBack 발화·초점, 전체 RTL/팔레트 조합, 실제 가입 API는 미검증이다.
자동 회귀·AX 속성을 실제 스크린리더 검증으로 세지 않는다. 작업 캡처·실패 스크린샷은
본 기록 보존 후 제거하며 재사용 fixture·테스트·소스는 유지한다.
