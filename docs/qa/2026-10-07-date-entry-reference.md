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
