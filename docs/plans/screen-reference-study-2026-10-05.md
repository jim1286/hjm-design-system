# 반복 화면 UI/UX 참고 조사

2026-10-05. 사용자가 첫 예제를 보고 UI가 빈약하다고 지적했고, 현재 앱·웹과 다른 제품을
최대한 많이 참고하도록 요청했다. API가 있다는 사실과 제품 화면의 완성도를 혼동한 것이
첫 시안의 문제였다. 따라서 빈 슬롯 데모를 실제 정보와 조작이 있는 화면으로 다시 만든다.

## 포트폴리오 근거

현재 코드뿐 아니라 다음 저장된 화면을 직접 열어 비교했다. 과거 캡처이므로 현재 운영 화면과
동일하다고 주장하지 않는다. 소스 경로는 screen-patterns 계약의 조사 표를 함께 참고한다.

- Utilverse `docs/design/previews/native-development-login-20261002/login-light.png`: 중앙의 제품 마크,
  짧은 가치 문구, 행동 영역, 하단 고지. 참고 캡처의 개발 로그인과 법률 준비 상태는 복사하지 않는다.
- BurnTok `docs/design/evidence/2026-09-08/web-dm-320.png`: 보낸 메시지의 우측 정렬, 본문을 방해하지
  않는 시간순 흐름, 하단의 입력+전송. 320px에서 긴 문구와 입력 복구가 필요하다.
- Diairy `docs/qa/2026-09-28-uiux/evidence/r2/findings_shots/persona_c97c9efa_settings-nature-preview_step030.png`:
  주제별 설정 표면과 실제 현재 값, 설명과 스위치의 관계. 브랜드 배경과 하단 navigation은 제품 소유다.
- Spint의 현재 SettingsScreen 소스: 닉네임·알림·도움말·계정의 구획과 저장/재인증 분기.

## 외부 참고 — 13개 제품/시스템

공식 제품 문서와 디자인 팀의 공개 자료를 사용한다. 설명 문서 확인과 시각 자산 확인을 구분한다.
아래 ‘반영’은 HJM의 설계 판단이며 해당 제품과 동일한 UI/API를 제공한다는 의미가 아니다.

| 참고 | 확인 자료 | 반영할 원칙 / 복사하지 않는 것 |
| --- | --- | --- |
| Toss TDS | [ListRow](https://tossmini-docs.toss.im/tds-react-native/components/list-row/) 공식 API | 아이콘·내용·현재값/제어의 행 문법. TDS 의존성이나 자산을 가져오지 않음 |
| Linear | [Inbox](https://linear.app/docs/inbox), 공식 inbox 이미지 직접 확인 | 짧은 필터와 사람·활동·시간 위계. 작업관리 전용 우선순위 규칙은 제외 |
| Slack | [Activity](https://slack.com/blog/news/slack-activity-triage-for-notifications), [threads](https://slack.com/help/articles/115000769927-Use-threads-to-organize-discussions--Use-threads-to-organize-discussions--) | 알림에서 다음 행동이 보이고 답장은 원문 맥락 유지. 다중 업무 사이드바는 모든 앱에 강요하지 않음 |
| Notion | [계정·환경 설정](https://www.notion.com/help/account-settings) | 계정·사용 환경·언어를 의미별 구획으로. 설정 변경의 저장 범위는 제품이 명시 |
| WhatsApp | [디자인 팀의 UI 개편](https://www.meta.com/design-at-meta/blog/whatsapp-user-interface-update/) | 중립색 중심, 발신/수신 구별, 익숙한 입력 위치. 배경 doodle·브랜드 녹색은 복사하지 않음 |
| Telegram | [공식 제품 업데이트](https://www.telegram.org/blog?setln=en) | 메시지 안의 다양한 콘텐츠와 도구 확장을 위한 슬롯. 실제 미구현 전송/편집 기능을 데모의 기본 기능처럼 주장하지 않음 |
| Airbnb | [Messages tab](https://www.airbnb.com/resources/hosting-homes/a/getting-the-most-out-of-the-messages-tab-678) | 대화의 상대·맥락과 메시지 분류, 빠른 답장. 예약 도메인은 공통 계약에 넣지 않음 |
| Apple | [iPhone 알림 설정](https://support.apple.com/guide/iphone/change-notification-settings-iph7c3d96bab/ios) | 채널·앱별 허용 상태를 분리. OS 권한과 제품 수신 설정을 같은 스위치로 속이지 않음 |
| Discord | [Inbox FAQ](https://support.discord.com/hc/en-us/articles/360045027712-Inbox-FAQ) | 읽지 않음·멘션 분류와 원문으로 돌아가는 행동. 모든 앱에 서버/채널 계층을 추가하지 않음 |
| Duolingo | [Core tabs redesign](https://blog.duolingo.com/core-tabs-redesign/) | 헤더·타입·여백을 일관되게 하되 화면 목적을 보존. 모든 화면에 큰 일러스트를 강요하지 않음 |
| GitHub | [알림 분류](https://docs.github.com/en/subscriptions-and-notifications/how-tos/viewing-and-triaging-notifications/managing-notifications-from-your-inbox) | 읽음, 완료, 저장은 별도 의미. 공통 컴포넌트가 임의로 상태를 확정하지 않음 |
| Google | [로그인 화면 개편](https://workspaceupdates.googleblog.com/2024/02/new-google-sign-in-page.html) | 목적·설명·입력·행동의 명확한 위계. Google 계정 입력 폼을 우리 서비스 로그인처럼 복제하지 않음 |
| Spotify | [프로필 관리](https://support.spotify.com/us/article/spotify-profile/) | 프로필과 계정 관리 구분. 음악 콘텐츠나 브랜드 색을 가져오지 않음 |

## 수정 기준

1. 기본 화면에서 테스트용 상태 전환/실패 버튼을 제거한다. Storybook 상태별 story와 복구 예제로 옮긴다.
2. 설정은 프로필 요약 → 사용 환경 → 계정/도움말이며, 버튼 몇 개 대신 아이콘·설명·현재값·실제 스위치 행을 쓴다.
3. 알림은 여러 사람의 실제 길이 문구와 시간, 새 소식/읽음, 전체/읽지 않음 필터를 제공한다.
4. 채팅은 상대 헤더, 날짜, 양방향 메시지, 답장 인용, 전송 상태, 입력+전송을 하나의 흐름으로 보여준다.
5. 브랜드 색을 화면 전체에 칠하지 않는다. HJM semantic surface와 제품이 제공한 artwork 슬롯을 구분한다.
6. 390px·큰 글자·다크·데스크톱·상태 화면을 한 장씩 모아 다시 비교한다. 기존 첫 시안 캡처는 완료 근거에서 제외한다.

## 아직 필요한 확인

- 넓은 웹의 목록/상세 구조와 실제 native 키보드 검증은 별도로 추적한다.
- 문서에 적힌 원칙만으로 외부 앱을 모두 직접 조작했다고 보고하지 않는다.
- 제공자 로고는 제품 자산 슬롯이다. 예제에서 임의 G나 방패를 공식 로고처럼 쓰지 않는다.
