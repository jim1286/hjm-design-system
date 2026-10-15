# Lucian 도입 현황

검토일: 2026-10-15 · upstream `42396145b375a17712fd738ca0e1d977556c0b73`

200개 전수 비교의 공통 구성 21개와 기존 보완 13개가 대상이다. 제품 전용·보류·기존 재사용 항목은 추가 구현 범위가 아니다.
공개 API 제공, 테스트, Storybook 시연, npm 게시, 제품 적용을 구분한다. 현재 신규 API는 모두 미게시다.

2026-10-15 사용자 요청(“다 승격해”)으로 이번 도입 대상의 신규 Storybook 항목 25개(Web 25·Native 24)를 `실험/`에서 `배포/`로 승격했다. 기존 보완은 이미 배포된 버튼·차트·탭·입력 등에서 유지한다. Web story ID와 API·동작은 그대로 보존하며, npm 게시·제품 적용·기기 QA 상태는 승격과 별개다.

| ID | 항목 | 분류 | 구현 현황 | 남은 조건 |
| --- | --- | --- | --- | --- |
| 001 | Liquid Glass 버튼 | 기존 보완 | Button.completion 양 플랫폼 구현·검사 통과 | npm 게시·제품 적용·Native Yoga 기기 QA 미실행 |
| 004 | 진행률 다운로드 버튼 | 기존 보완 | TransferTask 양 플랫폼 구현·검사 통과 | npm 게시·제품 전송 adapter·Native 기기 QA 미실행 |
| 006 | 구독 리플 버튼 | 기존 보완 | ToggleFeedbackButton ripple 양 플랫폼 구현·검사 통과 | npm 게시·제품 적용·Native 기기 모션 QA 미실행 |
| 012 | 북마크 리본 | 기존 보완 | ToggleFeedbackButton ribbon 양 플랫폼 구현·검사 통과 | npm 게시·제품 적용·Native 기기 모션 QA 미실행 |
| 022 | 좋아요 하트 터짐 | 기존 보완 | ToggleFeedbackButton burst 양 플랫폼 구현·검사 통과 | npm 게시·제품 적용·Native 기기 모션 QA 미실행 |
| 028 | 늘어나는 댓글 입력창 | 기존 보완 | MessageComposer.lengthFeedback 양 플랫폼 구현·검사 통과 | 기존 자동 높이 조절 재사용; npm 게시·제품 적용 미실행 |
| 048 | 스와이프와 이어진 밑줄 탭 | 기존 보완 | Tabs.swipePosition 양 플랫폼 구현·검사 통과 | npm 게시·제품 pager 연결·Native 기기 제스처 QA 미실행 |
| 078 | 밀어서 답장하는 채팅 | 기존 보완 | ReplyMessage/ReplyComposer 양 플랫폼 구현·검사 통과 | 실제 메시지 ID 전달; npm 게시·제품 전송 연결 미실행 |
| 083 | 대기에서 진행으로 바뀌는 막대 | 기존 보완 | TransferTask 양 플랫폼 구현·검사 통과 | 실제 report·Promise 완료만 표시; 제품 CI adapter·npm 게시 미실행 |
| 086 | 흘러나오는 AI 답변 | 기존 보완 | StreamingAnswer 양 플랫폼 구현·검사 통과 | 실제 스트림·중지·부분 응답 보존; 제품 AI adapter·npm 게시 미실행 |
| 095 | 모양이 바뀌는 막대 차트 | 기존 보완 | BarChart.animateChanges 양 플랫폼 구현·검사 통과 | npm 게시·제품 적용·Native SVG 기기 QA 미실행 |
| 096 | 훑으면 색이 갈리는 주가 선 | 기존 보완 | LineChart.animateChanges/scrubEmphasis 양 플랫폼 구현·검사 통과 | npm 게시·제품 적용·Native SVG 기기 QA 미실행 |
| 097 | 항목을 빼면 다시 나뉘는 도넛 | 기존 보완 | PieChart exclusion 양 플랫폼 구현·검사 통과 | npm 게시·제품 적용 미실행 |
| 007 | 재생 버튼 모핑 | 구성 후보 | media-transport 양 플랫폼 구현·검사 통과 | npm 게시·제품 적용·Native 기기 재생 미실행 |
| 010 | 분할 실행 버튼 | 구성 후보 | task-controls 양 플랫폼 구현·검사 통과 | npm 게시·제품 적용 미실행 |
| 027 | 펼쳐지는 상단 검색 | 구성 후보 | ExpandableSearch 양 플랫폼 구현·검사 통과 | 최근 검색·AbortSignal·경쟁 응답 무시; npm 게시·제품 검색 API 연결 미실행 |
| 033 | 제목 바로 고치기 | 구성 후보 | 로컬 커밋 e8a0a152 / 관련 검사 통과 | npm 게시·소비 제품 적용 미실행 |
| 036 | 비밀번호 강도 미터 | 구성 후보 | task-controls 양 플랫폼 구현·검사 통과 | npm 게시·제품 적용 미실행 |
| 037 | 계정 전환 메뉴 | 구성 후보 | task-controls 양 플랫폼 구현·검사 통과 | npm 게시·제품 적용 미실행 |
| 054 | 팔로우 프로필 카드 | 구성 후보 | FollowProfileCard 양 플랫폼 구현·검사 통과 | 실제 확정값·낙관적 실패 복구; npm 게시·제품 API 연결 미실행 |
| 056 | 월·연 요금 전환 카드 | 구성 후보 | task-controls 양 플랫폼 구현·검사 통과 | npm 게시·제품 적용 미실행 |
| 059 | 참석 응답 이벤트 카드 | 구성 후보 | EventAttendanceCard 양 플랫폼 구현·검사 통과 | 실제 응답·캘린더 callback 완료 반영; npm 게시·제품 기기 API 연결 미실행 |
| 092 | 필터를 풀어 주는 빈 검색 결과 | 구성 후보 | 로컬 커밋 e8a0a152 / 관련 검사 통과 | npm 게시·소비 제품 적용 미실행 |
| 116 | 베지어 이징 곡선 | 구성 후보 | BezierEditor 양 플랫폼 구현·검사 통과 | 두 제어점 4좌표 편집·실제 easing 미리 보기; 토큰 자동 저장 없음; npm 게시 미실행 |
| 130 | CSV 필드 연결 | 구성 후보 | data-workflows 구현 / 계산·Web·Native 검사 통과 | npm 게시·소비 제품 적용 미실행 |
| 131 | 동행자 입력 묶음 | 구성 후보 | 로컬 커밋 e8a0a152 / 관련 검사 통과 | npm 게시·소비 제품 적용 미실행 |
| 141 | 단축키 조합 기록 | 구성 후보 | ShortcutRecorder Web 구현·검사 통과 | 실제 키 기록·충돌/예약키·등록 callback; Native 미지원 명시; npm 게시 미실행 |
| 144 | 열 순서 편집 | 구성 후보 | 로컬 커밋 e8a0a152 / 관련 검사 통과 | npm 게시·소비 제품 적용 미실행 |
| 160 | 이탈을 드러내는 전환 깔때기 | 구성 후보 | data-workflows 구현 / 계산·Web·Native 검사 통과 | npm 게시·소비 제품 적용 미실행 |
| 161 | 주차별로 남는 고객 격자 | 구성 후보 | data-workflows 구현 / 계산·Web·Native 검사 통과 | npm 게시·소비 제품 적용 미실행 |
| 162 | 관계를 정렬하는 상관 행렬 | 구성 후보 | data-workflows 구현 / 계산·Web·Native 검사 통과 | npm 게시·소비 제품 적용 미실행 |
| 163 | 기준을 넘어가는 실적 눈금 | 구성 후보 | data-workflows 구현 / 계산·Web·Native 검사 통과 | npm 게시·소비 제품 적용 미실행 |
| 164 | 구간을 다시 묶는 분포 | 구성 후보 | data-workflows 구현 / 계산·Web·Native 검사 통과 | npm 게시·소비 제품 적용 미실행 |
| 178 | 묶음 선택 작업대 | 구성 후보 | 로컬 커밋 e8a0a152 / 관련 검사 통과 | npm 게시·소비 제품 적용 미실행 |

## 확인한 범위

- 첫 5개: 계약 3·Web 7·Native 5건, 빌드·타입·개발 Storybook 확인.
- 데이터 6개: 계약 6·Web 5·Native 2건. 비동기 helper 추출 관련 기존 목록 편집 Web 7·Native 5건도 통과.
- Native 실제 기기·제품 API/데이터 연결·npm 게시·운영 배포는 미실행.
- 공통 도입 대상 34개(구성 21·기존 보완 13)의 로컬 API·사용 지침·예제 연결을 완료했다. 제품별 adapter 연결·Native 기기 QA·npm 게시를 완료했다는 뜻은 아니다.

Showcase 타입 검사 양쪽 통과. 실행 예제 연결 중 Web Showcase 50건 통과, Native Showcase 기존 DialogExample fixture 탐색 1건 실패(신규 데이터 API 테스트와 별도).

신규 6개 개발 Storybook 화면 확인. 두 제품 팔레트 light/dark 및 375px host 검사 통과. 본 작업의 6012 검사용 서버·탭 종료, 기존 6006 서버 보존.

도넛 제외: 공유 계산 2·Web 1·Native 1건, 기존 파이/범례 Web 4·Native 1건 통과. 원본 색·강조 선택 보존, 실제 합계/비율 재계산·모두 제외·다시 포함 확인.

선택/실행 4개: 공유 계약 3·Web 5·Native 4건 통과. 양 플랫폼 빌드·타입, 공개 예제 타입, 두 제품 팔레트 light/dark·375px host와 Web 개발 Storybook 4개 화면 확인. 실제 인증·결제·기기 QA는 미실행.

미디어 재생 제어: 계약 2·Web 4·Native 3건 통과. 실제 HTML 영상 재생·일시 정지와 실패 보존, Web 개발 Storybook의 실제 seeked 위치·light/dark 화면, 두 팔레트·375px host 확인. 모핑 중 React 추가 commit 없음과 reduced motion 정착 검사. Native Expo Video adapter 연결·타입 확인, 기기 재생은 미실행. 본 작업의 6012 서버·탭 종료.

나머지 17개는 작성 도구·소셜·버튼/차트/탭을 병렬로 구현하고 전송·스트리밍과 통합했다. 공유 계약 17건, 변경된 Web 브라우저 35건·Native host 23건 묶음 검사 통과 후 시각 QA 수정에 해당하는 Web 작성 도구 4건·탭 2건·전송 5건 및 Native 작성 도구 1건·전송 2건도 통과했다. 양 renderer 빌드·타입과 양 Showcase 타입 통과. 실제 네트워크 응답 바이트·UTF-8 decoder 검사를 포함한다.

등록된 새 Web Story ID 28개와 Native 자동 registry 연결, 공개 API map 및 선택 사용 지침 10개를 확인했다. Native 키보드 단축키는 지원하지 않으며 capability에 명시한다. 모핑 프레임은 DOM/SVG/Animated host를 직접 갱신하고, reduced motion·비활성·백그라운드 정착을 검사했다.

최종 Web 개발 Storybook에서 실제 253,703바이트 전송, 단축키 기록·등록·1회 실행, 팔로우/참석·캘린더 예제 확정, 검색 제안 2개, 실제 message-72 답장 전송, 세 토글의 확정 인원, UTF-8 응답의 실제 fetch 완료, pager 선택, 베지어 개선 화면·미리 보기를 확인했다. 제품 서버·AI 추론·기기 캘린더가 연결됐다는 근거는 아니다. 본 작업의 6012 서버·검증 탭과 실패 검사 PNG를 정리하고 기존 6006 서버 및 다른 세션 변경을 보존했다.
