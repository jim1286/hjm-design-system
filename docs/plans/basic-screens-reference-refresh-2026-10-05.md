# 기본 화면 레퍼런스 재구성

2026-10-05 사용자 요청: 사진 선택처럼 다른 기본 화면도 기존 앱의 익숙한 구조를 따를 것.
회색 배경 금지, 댓글의 Instagram 구조, 검색 300ms debounce, 작성창 자동 높이 및 하단 이모지 제거는 유지한다.
새 catalog API를 만들지 않고 기존 공개 screens/screen-flows와 Grid, Avatar, ListRow, Sheet,
AlertDialog를 합성한다. 신규 화면은 계속 실험 단계이며 제품 이관·npm 게시·스토리북 배포 승인은 아니다.

## 참고 근거와 적용

| 화면 | 참고 | 반영 |
| --- | --- | --- |
| 목록/상세 | [Apple 메모](https://support.apple.com/en-ie/guide/iphone/iph65637affe/ios) | 날짜 구획, 제목/요약, 전체/즐겨찾기, 상세에서 목록 복귀 |
| 작성 | [Google Keep 작성](https://support.google.com/keep/answer/2888246), [공식 시각 자료](https://blog.google/products-and-platforms/products/workspace/8-tips-help-you-keep-google-keep/) | 제목/본문 집중, 상단 완료 행동, 초안 유지와 나가기 확인 |
| 프로필/저장 | 기존 Instagram 댓글 조사와 사진 격자 패턴 | 아바타/통계/소개/수정, 3열 게시물, 계정 메뉴 분리; 저장 목록은 제목 있는 2열 |
| 신고/차단 | [Signal 메시지 요청](https://support.signal.org/hc/en-us/articles/360007459591-Signal-Profiles-and-Message-Requests) | 사유 선택 → 설명 → 확인, 차단 확인과 신고자 안내 |
| 권한 안내/온보딩 | [Duolingo의 알림 동의 실험](https://blog.duolingo.com/putting-in-work-the-habit-of-language-learning/) | 구체적 알림 예시, 이점 설명, 허용/나중에; 단계별 한 가지 선택 |
| 설정/채팅 | [Signal 프로필](https://support.signal.org/hc/en-us/articles/360007459591-Signal-Profiles-and-Message-Requests) 및 해당 문서 실제 이미지 | 프로필 중심 설정, 주제별 행, 상대 아바타와 제목, 둥근 입력창 |
| 알림 | 기존 BurnTok 소스/캡처 | 오늘/이번 주, 전체/답글/읽지 않음 필터, 활동 행과 설정 진입 |
| 로그인 | 기존 포트폴리오 로그인 표준 | 짧은 브랜드/가치 안내, 제공자 이름/정본 로고, 하단 동의 고지 |
| 댓글 | 기존 Instagram 댓글 개편 유지 | 원문 작성자 요약 추가, 기존 답글·좋아요·작성창 유지 |

직접 확인한 외부 시각 자료: Signal 지원 문서의 `message_request_uknown.png`와 Google 공식
Keep GIF 프레임. Keep 글은 2017년, Duolingo 글은 과거 실험이므로 최신 앱의 픽셀 동일성 근거가 아니다.
나머지는 공식 기능 문서 또는 이전 조사 근거이며 실제 최신 앱을 전부 실행한 것으로 보고하지 않는다.
원본 브랜드 자산/문구/코드를 복제하지 않고 화면의 정보 순서와 조작 방식을 적용했다.

## 공개 조합 변경과 이유

- `EditorScreen.submitPlacement`는 기본 footer를 유지하며 header 옵션을 추가한다. 작성 화면에서
  상단 저장을 선택해도 draft 안내와 나가기 확인은 같은 API가 소유한다.
- `ModerationScreen.reasonPicker`는 기존 RadioGroup 대신 제품의 단계형 사유 목록을 연결한다.
  허용된 사유인지 확인하는 submit guard와 차단 확인은 그대로 유지한다.
- ScreenLayout 제목 최소 폭은 읽기 폭의 1/6에 글자 배율을 반영한다. 이전 1/4(웹 12rem)은
  390px에서도 저장/대화 정보 버튼을 다음 줄로 밀었다. 큰 글자에서는 여전히 자연스럽게 줄바꿈한다.
- 채팅 입력은 full shape, 받은 메시지는 화면 배경과 같은 색 + 테두리로 구분한다.
  회색 면으로 발신 방향을 구분하지 않고 정렬/아바타/메타데이터를 함께 사용한다.
- 예제 새 기록은 로컬 목록에 추가되지만 앱 종료 후 영속 저장이나 서버 저장을 의미하지 않는다.

## 검증

390×844 브라우저에서 12개 화면 × 기본/다크/글자 2배를 캡처하고 함께 비교했다.
목록 즐겨찾기/새 기록, 작성 취소/유지/저장, 프로필 수정/탭/계정 메뉴, 신고 사유/설명/완료,
저장 해제/되돌리기, 설정 프로필 저장, 알림 필터, 메시지 전송, 온보딩 선택/완료를 조작했다.
페이지 가로 넘침과 pageerror 0. Web/Native showcase 타입·검사, 공개 화면 관련 동작·계약 검사,
renderer budget, API map, 문서 링크 및 Web 정적 Storybook build/검증을 확인한다.
실제 Native 기기, OS 권한, 서버 API, 소비 앱 이관은 이 작업에서 수행하지 않는다.

- [목록·작성·프로필·신고·권한·온보딩](../qa/2026-10-05-reusable-screens.md)
- [저장·설정·알림·채팅·로그인·댓글](../qa/2026-10-05-reusable-screens.md)
- [첫 그룹 다크](../qa/2026-10-05-reusable-screens.md)
- [둘째 그룹 다크](../qa/2026-10-05-reusable-screens.md)
- [첫 그룹 큰 글자](../qa/2026-10-05-reusable-screens.md)
- [둘째 그룹 큰 글자](../qa/2026-10-05-reusable-screens.md)
