# 날짜 직접 입력 레퍼런스와 공통 초안 계약

- 날짜: 2026-10-07
- 기준 checkout: HJM main 2f5a49e 이후
- 범위: Component Gallery Date input의 공식 예제 일부와 내부 계약. 전체 18개나 신규 실험 완료가 아님.

## 원본 관찰

[목록](https://component.gallery/components/date-input/)의 18개 중
[GOV.UK](https://design-system.service.gov.uk/components/date-input/) 공식 설명·예제 HTML을 읽고,
IAB에서 [기본 예제](https://design-system.service.gov.uk/components/date-input/default/)와
[단일 오류 예제](https://design-system.service.gov.uk/components/date-input/error-single/)를 확인했다.
기본 예제에서 가상 값 day=29 → Tab으로 month 초점 이동 → month=Feb → year=20을 입력했다.
1280×720 캡처에서 세 입력의 값과 연도 초점 표시가 보였고 부분 입력은 그대로 남았다.
원본 단일 오류 예제에서는 day=6/month=3을 보존하고 year만 빈 빨간 테두리로 표시했다.
예제는 정적 markup이라 값 입력 후 서버 날짜 검증·저장 성공까지 확인한 것이 아니다.

[Wise compact date input](https://wise.design/components/compact-date-input)은 텍스트 도구에서
거의 빈 응답이었고 실제 브라우저에서는 /404로 이동했다. 이를 동작 검토 완료로 세지 않는다.
브라우저의 문서 링크가 없는 임의 주소를 추측하지 않았으며 나머지 16개 예제는 미검토다.

## HJM 판단과 구현

기존 Web DatePicker는 달력 dialog를 여는 trigger, Native는 Sheet trigger다. Calendar는
제품 소유 날짜 배열을 받으며 날짜 체계·로케일·시계 계산을 하지 않는다. 직접 입력 초안을
DatePicker의 committed ISO 문자열로 매번 바꾸면 미완성 연도·월 이름·교정 중 값이 소실된다.

`src/date-entry.ts`에 내부 후보 계약을 추가했다. 원문 year/month/day 초안을 그대로 보존하고
제품이 준 순서로 필드를 반환한다. 완전 공백은 required 여부로 구분하고 부분 누락은 다른
검증보다 먼저 표시한다. 모든 필드가 있으면 제품 parse adapter가 완성 여부·달력/범위 정책과
문구 코드·대상 필드를 반환한다. parse에는 동결된 복사본을 보내 원래 초안이 변하지 않게 한다.
HJM은 Date 정규화나 영어 월 이름 테이블을 추가하지 않는다. 자동완성·초점·제출 시 검증 노출은
renderer 연결 단계에서 다뤄야 하며 resolver 호출 자체가 UI 오류 노출을 의미하지 않는다.

## 검사

- 신규 6개 테스트 통과: 원문/전각·한글 보존, optional empty와 partial 구분, 누락 우선,
  parser 위임/동결 초안, 미완성 연도, 실패 수정 후 오류 제거, 여섯 필드 순서, 잘못된 adapter 거부.
- contracts typecheck·build 통과.
- 실제 윤년·지역별 파싱은 제품 adapter 영역이며 mock parser 테스트를 그 검증으로 주장하지 않는다.

## 남은 작업

양 renderer 공개 구성, fieldset/Native 각 필드의 그룹 이름·설명, 날짜 자동완성 플랫폼 지원,
월 이름 키보드 접근, IME, 오류 노출 시점, 큰 글자·좁은 폭·RTL·테마·스크린리더를 연결/검증해야 한다.
현재 package export·공개 renderer·Storybook 실험 등록은 없다. 실험 수는 14개이고 승격·릴리스·
Utilverse 적용과 무관한 준비 단계다. 브라우저 캡처는 인라인 관찰이며 별도 원시 파일을 보존하지 않았다.


## 공개 구성·15번째 실험 연결 — 5f14fe1 이후

DateEntry를 Field optional extension으로 분류하고 contracts/Web/Native의 전용 date-entry
subpath로 공개했다. root barrel에 추가하지 않는다. 새 primitive 대신 기존 TextField를 세 번
합성한다. `실험/구성/입력과 작성/날짜 직접 입력`에 기본·다크·큰 글자·RTL 스토리와 사용 지침을
양쪽에 추가했다. package export의 JSON 변경 이유는 이 분리와 지침에 기록한다.

브라우저 회귀 3개는 부분 입력→교정·Tab·320px 폭, readOnly, 예제 파서의 윤년/전각/불가능한
날짜를 검사한다. Native 회귀 4개는 원문·오류 대상·순서 전환·잠긴 입력 callback과 iOS
contentType 연결을 검사한다. contracts 7개는 기존 6개와 오류 노출 정책/빈 문구 거부다.
RN 0.86 runtime은 bday 토큰을 변환하지만 패키지의 지원 RN 타입에서는 이를 받지 않아,
Android autoComplete birthdate-*와 iOS 명시적 textContentType을 연결했다. cast로 숨기지 않았다.

IAB의 실제 Web 기본 화면에서 2023/Feb/29를 확인해 세 필드 오류를 관찰한 후 2024로 교정해
2024-02-29를 확인했다. 입력 순서를 일/월/연도로 바꿔도 값과 결과가 보존됐다. 이때 예시 hint가
기존 순서에 머무는 오류를 발견해 order에 맞춰 바꾸도록 수정했다. 1280×720 light/LTR 확인이다.

기존 iPhone 17 Pro/iOS 26.5 Expo Go/8084에서 신규 스토리를 직접 열었다. idb/ simctl 대체
도구로 입력·접근성 값·화면을 확인했다. 첫 입력 묶음에서 연도/월 값이 남지 않았지만 빌드·
Fast Refresh와 겹쳐 원인을 확정하지 않았다. 빌드 종료 확인 뒤 각 필드 값을 읽으며 다시 입력해
2024/2/29와 확인한 날짜 2024-02-29를 확인했다. 알파벳 키 주입은 한글 자판으로 ㄹㄷㅠ가 입력돼
세 글자를 삭제하고 숫자 월로 교정했다. 따라서 Native 영어 월 이름 입력 성공으로 세지 않는다.
키보드가 열린 채 확인 버튼과 결과에 접근할 수 있었다. 개발 도구 톱니가 일 라벨 일부를 가리킨
캡처는 제품 겹침으로 분류하지 않으며 원시 캡처는 이 기록 후 제거한다.

모듈 graph는 Web date-entry/forms/internal 3개, Native date-entry/inputs 및 내부 field·state·
style·provider 등 10개를 조사해 budget에 등록했다. 새 외부 의존성은 없다. 양 renderer build,
각 package 타입, 양 Showcase 타입, API map/usage/Storybook 규격, renderer/contracts bundle,
workspace sync 검사를 수행했다. 신규 지침/Changeset과 생성 dist를 같은 변경에 포함한다.

아직 Native 큰 글자·오류 교정/재정렬·영어 월, 양쪽 제품 팔레트·다크/RTL 시각 검토, 실제
자동완성·VoiceOver/TalkBack·Android·IME 상세 검증은 남았다. 15번째 실험 등록을 승격·게시·
Utilverse 채택 완료로 세지 않는다. 전체 레퍼런스 전수 검토도 여전히 미완료다.


## 큰 글자·그룹 오류 후속 — 060842a 이후

Web IAB 390×844, dark/RTL/textScale=2에서 공백 제출 시 같은 오류가 세 칸 아래 반복되어
확인/순서 버튼이 아래로 밀렸다. DateEntry 오류를 그룹에서 한 번 표시하고, Web은 각 input의
aria-invalid/aria-describedby로 연결했다. 기존 TextField의 aria-invalid만으로는 테두리가 바뀌지
않던 경로를 공통 FieldFrame invalid 상태에 연결했다. Native는 TextField invalid와 외부
accessibilityHint를 지원하고 그룹 Text/한 번의 iOS announce로 표시한다. error prop은 기존대로
인라인 오류와 hint를 공급한다. 스크린리더 실제 낭독을 확인했다는 뜻은 아니다.

같은 Web 조건의 수정 후 화면에서 오류 한 번·세 칸 오류 테두리와 두 행동 버튼을 확인했다.
추가 브라우저 회귀는 320px/2배 글자 × light/dark × LTR/RTL에서 오류 ID 존재·44px 이상 입력
높이·가로 넘침 없음·순서 재배치 후 같은 DOM 노드와 초점 보존을 확인했다.

iPhone 17 Pro/iOS 26.5/Expo Go 8084 LargeText 스토리는 최초에 ScrollView가 없어 스와이프해도
결과(y864)에 접근할 수 없었다. 예제 화면에 키보드 inset을 처리하는 ScrollView를 추가했다.
수정 후 스와이프로 결과 y700에 접근했고 공백 제출 오류가 한 번 표시됐다. 이어 연도2024,
월2, 일29를 입력해 오류를 없애고 키보드가 열린 상태에서 날짜 확인→2024-02-29 결과를
확인했다. 입력 내부에서 시작한 첫 스와이프는 이동하지 않았으나 라벨 영역에서 시작하자
스크롤됐다. DateEntry 자체에 중첩 스크롤을 넣지 않고 화면 호스트가 맡는다. 현재 확인은
light/LTR/2배 글자며 다른 팔레트·Android·Native RTL/다크·VoiceOver/TalkBack·자동완성은 남았다.

Native 전체 102파일/1,207 테스트 통과. 첫 전체 실행은 새 subpath가 package export 허용 목록에
빠져 1건 실패했다. Native·Web·contracts 경계 목록을 실제 공개 진입점과 맞췄다(contracts의
기존 text-annotation 누락도 포함). Native 전체 재실행 통과, Web 관련 필드4파일/25개와 후속
DateEntry4개, Web package1개·contracts package4개 통과. iOS announce 중복 억제와 외부 hint
회귀가 포함되며 실제 assistive technology 실행과 구분한다. 원시 iOS 결과 캡처는 기록 후 제거한다.
