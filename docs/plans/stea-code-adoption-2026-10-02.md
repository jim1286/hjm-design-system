# STEA Code 도입 후보와 HJM 적용 설계

조사일·검토일: 2026-10-02 · 상태: 10개 검토, 7개 구성 스토리북 배포(2026-10-02 승인), HJM 개선 3건 · 범위: React Web + React Native

사용자가 STEA Code의 유용한 인사이트를 조사하고, 도입할 항목을 문서로 남긴 뒤
멈추도록 요청했다. **이 문서는 제안이며 구현·스토리북 등록·배포 승인이 아니다.**
이 문서 작성 후 컴포넌트 구현, 의존성 설치, 커밋·push, npm 게시, 소비 앱 이관은 진행하지 않는다.

## 흡수 검증 결과 (2026-10-02 후속)

사용자가 추천 10개를 흡수할 만한지 모두 확인한 뒤 개발을 시작하라고 요청했다. 이 절이 위 추천표보다 우선한다.

**원본 확인 방법.** 사이트의 공개 API `GET https://code.stea.africa/api/stea-code/catalog`와
`/api/stea-code/products/<slug>`에서 상품 정의·전체 HTML·포함 목록을 받았다.
카탈로그는 **102개**다. 아래 "확인 범위"의 "102+ 표기는 실제와 다르다"는 판단은 화면에서
50개까지만 펼친 결과였으므로 정정한다. 10개 후보의 원본 14개는 모두 `price 0 / free`이며
Vanilla HTML·CSS 단일 파일이다. React·React Native 구현은 없다.

**출처와 권리.** 10개 원본 중 9개 항목의 소스에 `From Uiverse.io by <작성자>` 주석이 있다
(Order Tracking Stepper=PriyanshuGupta28, Sales Stat Card=Yaya12085, Upcoming Meetings=juyi_2230,
Anatomy Button=barisdogansutcu, Coral Flip=joe-watson-sbf, Sci-Fi Ticket=zeeshan_2112,
Dot Spinner=abrahamcalsin, Block Swap=satyamchaudharydev, Ripple Grid=alexruix).
Retro Pixel Bat은 `@thecodetutor` 표기만 있고 라이선스가 없다. Secure Vault·Play-Pause·Day-Night·
Pixel Coin은 출처 표기가 없다. STEA 번들에는 `STEA Code personal license. Redistribution as a
standalone product is not permitted.` 문구와 personal 라이선스 주문 API가 있다. 원저작 조건과
STEA 조건이 겹치므로 **소스·자산은 복사하지 않고 행동만 HJM 기존 계약으로 다시 구현한다.**

| 후보 | 판정 | HJM 대조 근거 |
| --- | --- | --- |
| 진행 단계 / Order Tracking Stepper | **흡수(구성)** | `Steps`가 `currentStepStatus: "error"`를, `Timeline`이 tone을 이미 제공한다. 원본은 고정 클래스 3상태라 요청·확정·실패·재시도가 없다. 이 연결이 실제 효용이다 |
| 인증번호 상태 / Secure Vault Access | **흡수(구성)** | `OtpField`(error·busy·붙여넣기 정규화)+`ContentTransition`+`Result`. 원본은 `errorRate: 0.15` 무작위 실패라 복구 흐름을 재현할 수 없다. 기존 OtpField 예제는 입력·오류 표시만 있고 제출·재전송·잠김이 없다 |
| 일정 요약 / Upcoming Meetings Card | **흡수(구성)** | `SegmentedControl`+`List/ListRow`+`ContentTransition`. 빈 날짜 상태가 원본에 없어 추가 |
| 수치 요약 / Sales Stat Card | **흡수(구성)** | `Statistic.trend`가 방향·의미(tone)·문구를 분리해 원본(색만으로 증감 표시)보다 이미 낫다. 새 API 없이 비교 기간 전환과 "증가가 나쁜 지표"만 보여 준다 |
| 구조 설명 도구 / Anatomy Button | **보류** | 제품 화면 기능이 아니고, 실제 토큰 값을 렌더된 요소에서 재는 도구가 필요하다. 토큰 문서(Web·Native) 개편과 같이 결정한다 |
| 픽셀 캐릭터 / Retro Pixel Bat | **실험(2026-10-02 사용자 요청으로 전환)** — 원래 판단: 제외 | 원본 자산 권리 불명. `Asset.kind`는 icon·image·lottie·video뿐이라 스프라이트는 새 공개 축이 된다. 필요하면 Lottie로 같은 효과를 낸다 |
| 아이콘 상태 토글 / Play-Pause 등 | **제외** | 재생 상태는 스위치가 아니라 누름 버튼 의미다. `IconButton selected`(aria-pressed)가 이미 있다. `Switch`에 아이콘 축을 추가할 제품 요구가 없다 |
| 로딩 2~3종 | **제외** | Native `Spinner`는 플랫폼 `ActivityIndicator`다. 웹 전용 변형을 추가하면 두 renderer가 갈리고, 로딩은 스피너 하나라는 로그인 지침과도 겹친다 |
| 앞뒤 카드 / Coral Flip Card | **실험(사용자 요청으로 전환)** — 원래 판단: 보류 | `Card+ContentTransition`로 명시 버튼 전환은 가능하다. 3D 회전은 Native 비용·접근성 대체가 미확인이고 쓰려는 제품 화면이 없다 |
| 티켓 / Sci-Fi Event Ticket | **실험(사용자 요청으로 전환)** — 원래 판단: 제외 | 고유 행동 없이 `Card+DescriptionList` 배치뿐이다. 원본의 3D tilt·격자 배경은 기본 테마와 충돌 |

**착수한 범위.** 흡수 4개를 Web·Native `실험/구성/`에 기본·어두운 테마·큰 글자로 등록했다.
상태 규칙은 `showcase/shared/stea-compositions.ts`가 소유하고 `showcase/native/src/stea-compositions.test.ts`가
검사한다. 같은 날 사용자가 판단을 바꿔 앞뒤 카드·픽셀 캐릭터·티켓도 실험으로 만들라고 요청했다
(아래 "추가 실험 3종"). 위 표의 원래 판단 근거는 기록으로 남긴다.

- `실험/구성/진행 단계/처리 단계와 재시도`
- `실험/구성/인증/인증번호 확인과 다시 입력`
- `실험/구성/일정/날짜 선택과 예정 목록`
- `실험/구성/데이터 요약/수치와 이전 대비 변화`

**구현 중 확인한 HJM 한계 → 2026-10-02 사용자 요청으로 수정.**
- `Steps`에 "전체 완료" 상태가 없었다. `currentStepStatus: "complete"`를 추가했다(minor Changeset
  `steps-complete-cursor`, 계약 문서 [steps](../../packages/design-contracts/docs/steps.md)). 주문 구성은
  `Result`로 바꾸던 우회를 지우고 Steps가 전체 완료를 표시한다. complete인 커서에는 `aria-current`가 없다.
- Web `OtpField busy`가 input을 disabled로 바꿔 포커스가 body로 빠졌다. busy를 read-only + `aria-busy`로
  바꿨다(patch Changeset `otp-field-busy-focus`, [otp-field](../../packages/design-contracts/docs/otp-field.md)).
  처음에 "Native OtpField에는 busy가 없다"고 적은 것은 틀렸다. Native는 공통 입력 props의 `busy`를
  이미 지원했고, 구성의 `editable` 우회를 `busy`로 바꿨다.
- `Progress`의 `max` 기본값이 Web 100, Native 1로 달랐다. `progressRecipe.defaults.max`(100)를 두 renderer가
  읽게 했다. Native 기본값이 바뀌는 호환 파괴 변경이라 1.11.0 선례(사용자의 관리 소비 앱 전수 이관 결정)를 따라 1.12.0 minor Changeset(`progress-max-default`)과
  [이관표](../../packages/design-contracts/docs/migration-native-legacy-removal.md)에 실었다. Native UploadItem은
  0–1 비율을 Web처럼 백분율로 넘긴다. 관리 소비처 중 BurnTok 쇼케이스 `value={0.64}` 한 곳이 이관 대상이다.

**검증.** 2026-10-02 Web Storybook(로컬 dev, 420px)에서 Playwright로 실패→재시도→완료,
오답→오류→수정 시 오류 해제→3회 잠김→재전송→정답→결과 포커스, 날짜 전환·빈 날짜·키보드 화살표,
어두운 테마·큰 글자 가로 넘침 없음을 확인했다. 그 과정에서 재전송 카운트다운이 확인 요청마다 다시
시작되는 버그를 찾아 고쳤다. Web·Native showcase `tsc`·vitest·`verify:tokens`가 통과했다.
Native는 기존 iPhone 17 시뮬레이터(iOS 27.0, 다른 세션과 순서 조율)에서 showcase 개발 클라이언트와
Metro 8084로 실행했다. idb 접근성 트리와 캡처로 실패 표시가 거절 단계에 붙고 재시도로 확정되는 흐름,
6자리 입력 시 자동 제출·오답 오류·남은 횟수·정답 후 결과 화면, 날짜 전환과 빈 날짜, 어두운 테마 수치 카드,
큰 글자 일정 카드를 확인했다. 이 과정에서 위 `Progress max` 차이와 빈 상태 문구가 Native에서 큰 틈을
남기는 문제를 고쳤다. 개발 빌드 확인이며 Release·실기기 성능은 측정하지 않았다.
**스토리북 배포:** 2026-10-02 사용자 승인("다 배포로 옮겨줘 맞는 곳들에")으로 7개 모두 `배포/구성/`으로 옮겼다. 경로표는 [탐색 기준](../STORYBOOK_NAVIGATION.md#stea-후보-구성-배포-승인-2026-10-02).

**추가 실험 3종 (2026-10-02).** 원본 코드·이미지는 쓰지 않았다. 데이터는 `showcase/shared/stea-expressions.ts`,
프레임 검사는 `showcase/native/src/stea-expressions.test.ts`다.

- `실험/구성/정보 카드/앞면과 상세 정보 전환`: 3D 회전 대신 `ContentTransition`(scale)으로 요약 ↔ `DescriptionList`를
  바꾼다. 전환 버튼은 면 밖에 둬 포커스가 사라지지 않고, 면 상태를 낭독한다(Web 숨김 status, Native announce).
- `실험/구성/빈 상태/캐릭터와 시작 행동`: 박쥐 대신 새로 그린 12×12 "말랑이" 4프레임을 테마 색으로 칠한다
  (Web SVG, Native View; 같은 색 가로 칸을 묶어 요소 수를 줄임). 프레임 상태는 캐릭터 안에만 있고,
  멈춤 버튼(WCAG 2.2.2)·모션 감소·탭 숨김/앱 배경에서 타이머를 걸지 않는다. `EmptyState`가 아이콘을
  장식으로 숨기므로 캐릭터에도 접근성 이름을 두지 않는다. `Asset`에 스프라이트 종류를 추가하지 않았다.
- `실험/구성/정보 카드/일정과 식별 정보 티켓`: `Card + DescriptionList + QRCode`. QR을 못 읽는 경우의 안내와
  예매 번호를 함께 둔다. Web `QRCode`의 svg가 inline이라 글자 fallback이 옆으로 흘러 블록으로 감쌌다.

Web은 Playwright 스크립트(로컬 Storybook, 420px)로 면 전환 후 버튼 포커스 유지, 캐릭터 프레임 변화·멈춤·모션 감소
정지, 큰 글자 티켓 가로 넘침 없음, 주문 전체 완료 시 `aria-current` 0개, OTP 확인 중·실패 후 input 포커스 유지,
`Progress` 76/100을 확인했고 콘솔 오류는 없었다.
Native는 같은 날 iPhone 17 시뮬레이터(iOS 27.0, 다른 세션과 순서 조율)에서 면 전환, 어두운 테마 캐릭터,
큰 글자 티켓, 주문 전체 완료(Steps complete), OTP `busy` 자동 확인 → 오답 오류를 확인했다. Native `EmptyState`가
일러스트 칸을 `glyph.lg`로 고정해 캐릭터가 제목 위로 넘치던 문제를 공개 `illustrationStyle`로 칸 크기를 맞춰 고쳤다.
Native `busy` 동안 iOS 키보드가 유지되는지는 idb 입력 방식 차이로 확정하지 못했다(미확인).

## 확인 범위와 근거

- [사이트](https://code.stea.africa/), [전체 카탈로그](https://code.stea.africa/code)의
  `All / All Products / All Frameworks`에서 `Show more`를 끝까지 펼쳐 **50개 항목**을 확인했다.
  홈의 `102+ COMPONENTS / 11 CATEGORIES` 표기는 실제 확인한 개수와 다르므로 전수 검토 분모로 쓰지 않는다.
- 카탈로그에서 14개 분류 버튼을 확인했다. 공개된 50개는 8개 분류에 속한다.
  네비게이션 분류는 있으나 이번 전체 목록에서 네비게이션 예제를 확인하지 못했다.
- 50개 항목의 이름·분류·공개 미리보기 구조를 훑었고, 아래에 항목별 판단을 남겼다.
  **50개 모두의 상세 설명·소스·상호작용·성능을 검증한 것은 아니다.**
  상세 팝업을 반복 탐색하는 중 브라우저 자동화가 멈췄으며, 중단 요청에 따라 추가 조사를 멈춘다.
- [Retro Pixel Bat 상세](https://code.stea.africa/products/retro-pixel-bat-flying-animation)의
  시각 표현과 설명을 확인했다. 설명에는 7프레임 투명 스프라이트, CSS steps,
  0.4초 반복, 384×384 표시, pointer-events 비활성화가 명시돼 있다.
  페이지의 `60 FPS`는 제작자의 설명이며 직접 측정한 결과가 아니다.
- `Free` 및 `Free to use`, `Copy AI Prompt`, `Copy Source Code` 버튼을 확인했다.
  **개별 원본 코드·이미지의 라이선스, 재배포 권한, 원저작자 조건은 미확인이다.**
  무료 표시를 MIT·오픈소스 라이선스 확인으로 대신하지 않는다. 복사한 코드 확보도 확인하지 못했다.
- HJM 현재 소스의 [공개 API 대응표](../generated/public-component-map.md),
  [상호작용 품질](../INTERACTION_QUALITY.md), [스토리북 분류](../STORYBOOK_NAVIGATION.md)를 대조했다.
  아래 API는 현재 checkout에 있는 항목이며 npm 설치본 지원까지 확인한 것은 아니다.

## 도입을 추천하는 목록

P1은 먼저 검토할 제품 효용, P2는 선택적 표현, P3는 별도 실험을 뜻한다.
이는 구현 순서 제안이며 성능·효과 점수나 사용자 승인 상태가 아니다.
원본 이름별 새 API를 만들지 않고 **기존 HJM 기능의 표현·구성**을 우선한다.

| 우선 | 도입할 경험 / 원본 | HJM에 녹이는 방식 | Web / Native 적용 | 제안 스토리북 위치 |
| --- | --- | --- | --- | --- |
| P1 | **진행 단계와 현재 상태 연결** / Order Tracking Stepper | 기존 `Steps + Timeline + Card` 구성. 대기·진행·완료·오류를 구분하고 실제 작업 상태로 전환 | 공통 단계 모델, 웹은 키보드·앱은 탭 조작. 완료는 서버 확정 후 | 실험/구성/진행 단계/처리 단계와 재시도 |
| P1 | **인증번호 입력→검증→성공·실패** / Secure Vault Access | 기존 `OtpField + ContentTransition`에 검증 상태 연결. 입력 중 위치를 바꾸지 않고 제출 후 제한된 전환만 적용 | 붙여넣기·자동완성·삭제·초점·재전송·실패 후 수정 흐름을 플랫폼별 구현 | 실험/구성/인증/인증번호 확인과 다시 입력 |
| P1 | **날짜 선택과 일정 요약을 한 카드에** / Upcoming Meetings Card | `Calendar 또는 Tabs + Card + ListRow`. 선택 날짜·목록·빈 상태를 연결 | 좁은 화면은 가로 날짜 선택과 세로 목록, 넓은 화면은 병치. 선택 상태 공유 | 실험/구성/일정/날짜 선택과 예정 목록 |
| P1 | **수치·변화량의 명확한 위계** / Sales Stat Card | 기존 `Statistic / AnimatedStatistic`의 구성 예제. 제목·값·변화 방향·비교 기준을 분리 | 숫자 전환은 기존 adapter, 큰 글자·모션 감소에서는 정적 표시 | 실험/구성/데이터 요약/수치와 이전 대비 변화 |
| P1 | **컴포넌트 구조를 눈으로 설명하는 도구** / Anatomy Button | 실제 HJM 간격·크기·반경·타깃 영역에 주석을 붙이는 검사·학습 예제. 별도 제품 버튼 API는 불필요 | 웹·앱에서 같은 토큰 이름과 실제 값을 표시. 제품 화면에는 개발 설명을 넣지 않음 | 실험/토큰/구조 확인/버튼 간격과 터치 영역 |
| P2 | **픽셀 캐릭터의 짧고 선명한 반복 표현** / Retro Pixel Bat | `Asset / EmptyState`에 선택적 스프라이트 표현을 합성. 원본 박쥐 자산 채택은 권리 확인 후 결정. 기본은 자체 자산과 공유 프레임 설정 | 웹은 steps 기반 프레임 전환, 앱은 네이티브 이미지 프레임 또는 기존 애니메이션 경로. HTML/WebView로 이식하지 않음 | 실험/컴포넌트/미디어/픽셀 캐릭터; 활용 조합은 실험/구성/빈 상태/캐릭터와 시작 행동 |
| P2 | **선택에 반응하는 작은 아이콘 변화** / Play-Pause, Day-Night, Pixel Coin Toggle | 기존 `Switch / IconButton`의 표현 후보. 토글 이름마다 API를 추가하지 않음. 재생 상태는 실제 플레이어 상태에서 받음 | 동일 선택 의미·라벨·disabled. 앱은 탭, 웹은 키보드·포커스도 유지 | 실험/컴포넌트/선택/아이콘으로 확인하는 켜짐과 꺼짐 |
| P2 | **정돈된 로딩 표현 2~3종** / Dot Spinner, Block Swap, Ripple Grid | 기존 `Spinner`의 선택적 표현 후보로 비교. 로더 16종을 각각 공개 컴포넌트로 만들지 않음 | 웹·앱은 같은 크기·색 토큰·busy 의미. 작은 버튼에서는 기존 스피너 우선 | 실험/컴포넌트/상태와 알림/로딩 표현 비교 |
| P2 | **앞뒤 정보 전환** / Coral Flip Card | `Card + ContentTransition` 구성. hover 장식보다 명시적인 앞면·뒷면 버튼을 먼저 제공 | 웹 hover는 보조, 모바일·앱은 탭 버튼. 모션 감소에서는 즉시 면 전환 | 실험/구성/정보 카드/앞면과 상세 정보 전환 |
| P2 | **공유·입장·기록을 위한 티켓 구조** / Sci-Fi Event Ticket | `Card + Asset + DescriptionList`로 정보 순서를 흡수. SF 색상·브랜드를 기본 테마로 복사하지 않음 | 좁은 화면·긴 한글에서도 날짜·장소·식별 정보 유지. 공유 데이터는 제품 소유 | 실험/구성/정보 카드/일정과 식별 정보 티켓 |

**첫 검토 묶음:** 진행 단계, 인증번호 상태, 일정 요약, 수치 요약, 구조 설명 도구.
**시각적 개성을 위한 묶음:** 픽셀 캐릭터, 아이콘 상태 변화, 로딩 2~3종, 앞뒤 카드, 티켓.
첫 묶음은 기존 API 구성으로 효용을 확인하고, 두 번째 묶음은 선택적 표현으로 비교한다.

## 전수 목록과 판단

`구성`은 기존 HJM으로 만든 조합, `표현`은 기존 의미에 추가하는 시각 후보,
`참조`는 원리만 참고하고 독립 도입을 추천하지 않는 항목이다.
번호는 이번 조사에서 보인 순서이며 원사이트의 영구 ID가 아니다.

| 번호 | 공개 항목 | 판단 / 이유 |
| --- | --- | --- |
| 01 | Strands | P3 표현: 랜딩·브랜드 배경에 한정. 기본 앱 화면은 제외 |
| 02 | Logo Loop | P2 구성: 소개·파트너 영역용. 멈춤·정적 목록을 갖춘 웹 우선 후보 |
| 03 | Ghost Cursor | 참조: 포인터 전용 장식, 모바일 공통 기능으로 부적합 |
| 04 | Elastic Mesh | P3 표현: 힘에 반응하고 복귀하는 원리만 실험. 기본 조작과 스크롤 침범 금지 |
| 05 | Glow Cursor | 참조: Ghost Cursor와 목적 중복, 기본 커서 교체 불필요 |
| 06 | Retro Pixel Bat Flying Animation | P2 표현: 픽셀 스프라이트 후보, 자산 권리·앱 프레임 경로 미확인 |
| 07 | Pulsing Neon Heart Particle Animation | P2 참조: 기존 Celebration의 사용자 의도 기반 일회성 효과로 응용 |
| 08 | Secure Vault Access | P1 구성: 기존 OtpField의 검증·복구 흐름 보강 |
| 09 | Bouncing Ball Loader | 참조: 기본 로딩보다 브랜드용 후보, 독립 로더 API 불필요 |
| 10 | YES / NO Toggle | P2 표현: 기존 Switch에서 선택값의 가독성 비교 |
| 11 | Eclipse Toggle | 참조: 테마 토글 후보와 의미 중복 |
| 12 | Plane Flight Switch | P2 제품 표현: 비행·여행 맥락에서만 검토, 공통 기본값 제외 |
| 13 | Gooey SVG Toggle | P3 표현: 유체 변형의 비용·가독성 확인 후 제한적으로 검토 |
| 14 | Play / Pause Toggle | P2 표현: 실제 재생 상태와 연결되는 IconButton 조합 |
| 15 | Purple Ring Toggle | 참조: 색·링 변형 외 고유 행동이 없어 독립 도입 제외 |
| 16 | Light & Dark Theme Switch | P2 표현: 기존 테마 선택의 아이콘 전환 후보 |
| 17 | Day / Night Toggle | P2 표현: 16번과 비교 후 하나만 선택 |
| 18 | Install Button | 참조: 설치 의도·처리·완료 분리만 흡수. checkbox 기반 설치 시뮬레이션을 실제 작업으로 복사하지 않음 |
| 19 | Pixel Coin Toggle | P2 표현: 픽셀 테마의 선택적 Switch 표현 |
| 20 | Skeuomorphic On/Off Toggle | 참조: 강한 입체 표현은 기본 테마에서 제외 |
| 21 | Animated Toggle Switch | P2 표현: 기존 Switch의 이동·색 전환 비교 |
| 22 | Brutalist Profile Card | 참조: 정보 위계만 활용. 브랜드가 강하고 기존 Card·Avatar와 중복 |
| 23 | Dark Error Alert | 참조: 기존 Alert/Toast의 어두운 테마 대비 비교용, 새 알림 API 불필요 |
| 24 | Coral Flip Card | P2 구성: 명시 조작이 있는 앞뒤 정보 전환 |
| 25 | Order Tracking Stepper | P1 구성: 단계 상태와 실제 작업 결과 연결 |
| 26 | Sci-Fi Event Ticket | P2 구성: 정보·식별자·공유 구조 흡수 |
| 27 | Sales Stat Card | P1 구성: 기존 Statistic으로 수치·변화량 구분 |
| 28 | Upcoming Meetings Card | P1 구성: 날짜 선택·일정 목록·빈 상태 연결 |
| 29 | Matrix Digital Rain | P3 표현: 고밀도 반복 배경은 기본 화면 제외 |
| 30 | Retro TV 404 | P2 제품 구성: 명확한 복귀 행동을 갖춘 EmptyState/Result 표현, 공통 기본값 제외 |
| 31 | Cloud Loader | 참조: 콘텐츠 맥락용 후보, 기본 Spinner와 별도 의미 없음 |
| 32 | Gradient Glow Pill Button — Join on GitHub | 참조: CTA 강조만 참고. 기존 Button과 중복 |
| 33 | Wave Button — Sliding Label with SVG Ocean | 참조: 장식이 라벨을 바꾸거나 가리는 효과는 기본 버튼에서 제외 |
| 34 | Anatomy Button — Design Annotations | P1 도구: 간격·반경·타깃 영역을 실제 토큰으로 설명 |
| 35 | Generative Branching Tree Background | P3 표현: 창작·브랜드 배경 한정, Canvas 지속 비용 실측 필요 |
| 36 | Block Swap Spinner — Rotating Squares | P2 표현: 로딩 비교 후보 1 |
| 37 | Bouncing Basketball — 3D Loader | 참조: 운동 제품의 선택적 표현, 공통 로딩 제외 |
| 38 | WiFi Loader — Searching Rings | P2 제품 표현: 탐색·연결 의도일 때만, 화면의 상태 글자는 HJM 규칙에 맞게 처리 |
| 39 | Loading Bar — Progress Loader | 참조: 측정 가능한 작업은 기존 Progress, 불확정 작업은 Spinner. 장식 백분율 금지 |
| 40 | Book Flip Loader — Pages Turning | P2 제품 표현: 읽기·기록 맥락 한정. Components 분류를 HJM에서 그대로 복사하지 않음 |
| 41 | Orbit Loader — Glowing Ring | 참조: 기본 링 Spinner와 중복. Generating 글자는 시각적으로 제거 |
| 42 | Ripple Grid — 3×3 Loading Cells | P2 표현: 로딩 비교 후보 2 |
| 43 | Ring Pulse Loader — Multi-Ring Spinner | 참조: 링 계열 중복, 여러 로더 API로 분리하지 않음 |
| 44 | Radial Pulse Spinner — 10-Spoke Loader | 참조: 45번과 비교 후 한 종류만 선택 |
| 45 | Dot Spinner — Pulsing Radial Loader | P2 표현: 로딩 비교 후보 3 |
| 46 | Pill Morph Loader — Animated Loading Bar | 참조: 공간을 크게 쓰고 시각 로딩 문구가 있음. 기본 버튼 로딩 제외 |
| 47 | Hourglass Loader — Sand Timer | 참조: 시간 의미와 실제 남은 시간을 혼동하지 않게, 기본 로딩 제외 |
| 48 | Rubik's Cube Loader — 3D Rotating Cube | 참조: 복잡한 3D 장식은 기본 로딩 제외 |
| 49 | AI Matrix Loader — Binary Cascade | 참조: 기존 ThinkingOrb·Spinner의 AI 상태와 목적 중복 |
| 50 | Spectrum Loader — Animated Loading Text | 제외: 로딩 중 글자를 숨기라는 사용자 정책과 충돌 |

분류 집계: Animations 6, Backgrounds 3, Buttons 4, Cards 6, Components 3,
Forms 1, Loaders 16, Toggle Switches 11 = 50.
Logo Loop·특수 제품 표현·P3 배경은 보조 후보이며 첫 도입 묶음에는 포함하지 않는다.

## 적용할 때 유지할 기준

이 기준은 새로운 승인 절차가 아니라 기존 HJM 지침을 이번 후보에 적용한 설계다.

1. **실험부터:** [분류 기준](../STORYBOOK_NAVIGATION.md)에 따라 지원하는 웹·앱에
   `실험/토큰 → 컴포넌트 → 구성 → 화면` 중 실제 역할로 등록한다.
   사용자 승인 전 `배포`로 이동하지 않는다. 이 문서 저장을 승인으로 해석하지 않는다.
2. **기존 상태 의미 재사용:** Switch·Spinner·Steps·OtpField·Card를 이름만 바꿔 중복 생성하지 않는다.
   서버 작업·인증 결과·재생 상태·재시도는 제품이 소유하고 HJM은 표현과 접근성을 소유한다.
3. **로딩은 스피너만 시각 표시:** 버튼의 기존 폭·높이를 유지하고 글자·아이콘을 숨긴다.
   접근성 이름·busy 의미는 유지한다. 로그인은 카드 크기를 유지한 중앙 로딩 하나를 따른다.
   원본의 Loading/Generating 문구를 그대로 복사하지 않는다.
4. **픽셀 표현은 선택적:** 확대 시 픽셀 경계를 보존하고 프레임·크기·배경을 분리한다.
   프레임 변경마다 전체 화면을 재렌더하지 않는다. 화면 이탈·앱 배경 전환 시 반복을 정리하고,
   reduced motion에서는 대표 정적 프레임을 표시한다.
5. **데모의 자동 진행을 실제 상태로 대체:** 일정·설치·OTP·진행률의 고정 데이터와 타이머를
   제품의 사실처럼 사용하지 않는다. 성공 확정 전 성공 애니메이션을 보여주지 않는다.
6. **테마·조작·비용 검증:** 기본·어두운 테마·큰 글자·좁은 화면·모션 감소를 비교한다.
   웹 키보드·포커스와 앱 터치·접근성 대체 조작을 확인한다. 지속 효과는 실제 소비 화면에서
   변경 전후 프레임·메모리 비용을 측정한다. 개발 미리보기로 실기기 성능을 보증하지 않는다.

## 재개할 때 남은 확인

- 선정된 항목만 상세 소스·원저작자·자산·라이선스·재배포 조건을 확인한다.
  UI 모티브 재구현과 외부 소스·이미지 복사를 구분한다.
- 50개 전 항목의 상세 검증은 미완료다. 특히 자동 검증·재전송·토글·flip·날짜 선택의
  실패·취소·키보드 동작과 reduced motion은 구현 착수 전에 추가 확인한다.
- 픽셀 캐릭터와 로딩 3종은 비교 시안을 먼저 만들고 최종 채택 개수를 결정한다.
- 실제 제품 과제가 있는 P1 구성부터 연결한다. 공개 API를 늘릴 필요가 생기면
  [기여 지침](../../CONTRIBUTING.md)의 중복 검토와 양쪽 renderer 계약을 따른다.

**최초 작성 시점 상태:** 후보 문서만 작성했다. 이후 진행은 맨 위 "흡수 검증 결과" 절에 있다.
설치·스토리북 배포·npm 게시·앱 반영은 여전히 하지 않았다.
