# QA 리포트 — 아바타 묶음과 이동 경로 레퍼런스

## 1. 최종 판정

부분 확인. 기존 Web 아바타 그룹 예제의 잘림을 수정했고 Breadcrumb는 유지 판단이다.
2026-10-07 04:23~04:28 KST, Codex. 갤러리의 모든 예제를 검토한 결과는 아니다.

## 2. 대상과 이력

HJM main fbecc70 위 미커밋 Showcase·사용 지침·후보 ledger 변경.
공개 renderer/API는 변경하지 않았다. 기존 배포 예제의 배치 오류 수정이며 신규 실험이나
승격을 추가한 것으로 집계하지 않는다. 전체 실험 항목은 14개를 유지한다.

## 3. 환경과 검증 범위

Codex IAB localhost:6006 개발 Storybook. 1280×720과 390×844, dark/RTL/textScale=2.
브라우저 버전은 미기록. 예제 데이터이며 서버 요청·제품 데이터·실물 기기는 포함하지 않았다.
브라우저 회귀는 Node 24.20.0/pnpm 11.18.0, headless Chromium에서 실행했다.

## 4. 확인 결과·발견한 문제·재현과 수정

### 아바타

[Component Gallery](https://component.gallery/components/avatar/)의 현재 목록은 38개다.
첫 행의 기본 사진/실루엣 표현을 보았고 연결된 [Primer AvatarStack](https://primer.style/design/components/avatar-stack)
문서의 묶음·hover 확장 설명을 읽었다. 연결된 Gestalt AvatarGroup은 404라 미확인으로 남겼다.
38개 전체 시각 검토나 Primer hover 실제 조작 완료로 세지 않는다.

1. `patterns-textformat--grouped-avatars`, dark/RTL/2x를 연다.
2. 수정 전 그룹을 ListRow.leading 안에 둬 40×40 프레임의 overflow에 두 사람·남은 인원이 잘렸다.
3. Card 본문의 Stack으로 옮겼다. 단일 아이콘/이미지용 ListRow 규격을 넓히지 않았다.
4. 390×844에서 두 사람과 남은 인원, 읽지 않은 댓글 표시를 확인했다. 긴 제목·설명도 줄바꿈했다.
5. RTL에서 `+3`이 `3+`로 보이는 것을 발견해 이 예제의 숫자 토큰을 bdi dir=ltr로 격리했다.
   수정 후 `+3` 순서를 시각적으로 확인했다. 제품 전체의 현지화 문구를 LTR로 고정하는 API가 아니다.

접근성 트리에 그룹 이름 `함께한 사람 5명`과 두 사람 이름이 존재한다. overflow는 기존 계약대로
장식이며 전체 수는 그룹 이름으로 전달한다. 실제 스크린리더 발화는 미검증이다.

### 이동 경로

[Component Gallery](https://component.gallery/components/breadcrumbs/)는 현재 55개 예제다.
첫 행 A11Y Style Guide/Ant Design/Atlassian의 경로 그림과 페이지 본문의 계층·nav/ol·현재 위치
설명을 확인했다. HJM의 조상 링크, 마지막 비링크, aria-current와 기존 줄바꿈 계약에 대응한다.

HJM 390px dark/RTL/2x에서 `전체 보관함` 링크를 Return으로 실행했다. 실제 hash가 records로
바뀌고 현재 경로는 비링크가 됐으며 초점이 새 본문으로 옮겨졌다. 현재 구현을 유지하고 별도
엔진·축약 메뉴를 추가하지 않는다. 모든 외부 예제의 모바일·축약 동작까지 비교한 판단은 아니다.

## 5. 검사·관찰 결과

- Web Showcase check: typecheck·43 tests·토큰 경계 통과. 이후 숫자 bdi 조정은 최종 typecheck로 확인.
- `pnpm test:browser test/page-navigation.browser.test.tsx`: 6 tests 통과. 실제 조상 anchor,
  현재 위치·장식 구분자, 긴 경로/320px/2x LTR·RTL 줄바꿈 등을 포함한다.
- usage:check 및 git diff --check 통과. public source가 바뀌지 않아 전체 CI 반복은 하지 않았다.

## 6. 미확인 범위와 후속 조건

Avatar 38개/Breadcrumb 55개 전체 화면, Native 그룹 신규 필요성, 전체 구성원 공개·선택 흐름,
실제 VoiceOver/TalkBack 및 다른 제품 팔레트 검토는 남아 있다. 이번 예제 배치 수정을
그룹 기능 전체 검증·11개 사이트 전수 조사·소비 앱 채택으로 확대하지 않는다.

## 7. 보관 처리

브라우저 관측은 본 리포트와 URL별 ledger에 요약했다. 임시 검사 로그는 결과 대조 후 제거한다.
제품 소스·회귀 테스트·실행 중 Storybook 로그를 유지한다.
