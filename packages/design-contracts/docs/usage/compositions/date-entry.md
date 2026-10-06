# 날짜 직접 입력

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.13.1 이후)
- 검토일: 2026-10-07
- 근거: [날짜 입력 조사](../../../../../docs/qa/2026-10-07-date-entry-reference.md), `src/date-entry.ts`
- 스토리북: `실험/구성/입력과 작성/날짜 직접 입력`

## 언제 쓰나

사용자가 알고 있는 날짜를 직접 입력할 때 쓴다. DatePicker는 달력에서 날짜를 선택하는 API이므로
부분 연도·월 이름을 편집하는 초안을 담지 않는다. 새 DateEntry는 Field의 optional extension이며
기존 TextField를 합성한다. 달력·언어·시간대 계산은 제품이 맡는 기존 Calendar 경계를 유지한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| DateEntry | 날짜 초안·필드 순서·오류 연결 | 이 문서 |
| TextField | 각 날짜 조각 입력·포커스·오류 | [Field](../components/field.md) |
| Button | 제품의 확인/저장 | [Button](../components/button.md) |

## 배치

```text
그룹 이름
설명(선택)
[연도]   [월]   [일]   ← 제품 order
 오류     오류   오류  ← 잘못된 필드만
[확인]                ← 제품 행동
결과/서버 상태         ← 제품 소유
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web fieldset / Native View | 제품 폼 안 | 최소 폭 0, 테두리 없는 그룹 |
| 그룹 이름 | Web legend / Native Text label | 맨 위 | 아래 spacing.sm 12 |
| 입력 | TextField 3개 | order 순서 | 간격 spacing.md 16, Web 최소 10ch 자동 줄바꿈, Native 기준 spacing.xxxl × 3 × textScale |
| 오류 | TextField error | 해당 필드 아래 | 기존 Field recipe. 여러 필드에 걸친 오류는 각 해당 필드에 표시 |
| 확인 | 제품 Button | 그룹 다음 | DateEntry 내부에 저장 버튼을 넣지 않음 |

## 흐름과 상태

1. value는 `{year, month, day}` 원문 문자열이다. onValueChange는 한 필드만 바꾼 새 초안을 전달한다.
2. order는 세 필드가 중복 없이 한 번씩 나온 배열이다. RTL만으로 날짜 순서를 추측하지 않는다.
3. required 기본 false. 전체 공백은 optional이면 오류가 없고 일부만 비면 optional이어도 incomplete다.
4. 모든 조각이 있으면 parse가 valid/value 또는 incomplete·invalid/code/fields를 반환한다. 입력을
  자동 정규화하거나 다음 필드로 자동 이동하지 않는다. parse는 동결된 복사본을 받는다.
5. showErrors 기본 false. 제품은 제출/blur 정책에 맞춰 켠다. 오류 문구는 formatIssue로 지역화한다.
6. 목적이 birthdate일 때만 날짜 조각 자동완성을 요청한다. 일반 date는 off다. 실제 자동완성은 OS/브라우저 소유다.
7. monthInput 기본 text는 월 이름 입력을 허용한다. 숫자만 받는 제품은 numeric을 명시한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 세 입력과 설명 | 자동 초점 이동 없음 |
| 진행 중 | 미완성 원문 유지 | 일반 Tab/터치로 이동, validation 노출은 제품 제어 |
| 실패 | 잘못된 필드 아래 오류·테두리 | Web 연결된 오류 설명, Native 그룹+조각 이름과 오류 hint |
| 확인 | 제품에 전달한 valid 값 | 확인 UI/서버 저장은 제품 소유 |
| 비활성·읽기 전용 | 편집 차단 | 호스트가 늦게 edit 이벤트를 보내도 callback 차단 |

## 코드 골격

```tsx
// Web
import { DateEntry } from "@hjmds/react/date-entry";
// Resolver: @hjmds/design-contracts/date-entry.
<DateEntry value={draft} onValueChange={setDraft}
  order={["year", "month", "day"]}
  labels={{ label: t("date.label"), year: t("date.year"), month: t("date.month"), day: t("date.day") }}
  required showErrors={submitted} parse={parseProductDate} formatIssue={formatDateIssue}
  onBlur={part => markTouched(part)} />
```

```tsx
// Native
import { DateEntry } from "@hjmds/react-native/date-entry";
<DateEntry value={draft} onValueChange={setDraft} order={["year", "month", "day"]}
  labels={localizedLabels} parse={parseProductDate} formatIssue={formatDateIssue}
  required showErrors={submitted} />
```

parse는 순수 함수다. 네트워크 요청·Date.now·초안 변경을 넣지 않는다. 날짜 체계·허용 범위·
로케일별 숫자와 월 이름은 제품이 결정한다. valid.value는 제품이 정한 날짜 문자열이며
resolveDateEntryDraft는 실제 날짜 유효성을 다시 계산하지 않는다. 저장 실패 시 draft를 유지한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 그룹 | fieldset/legend | 각 필드의 접근성 이름에 그룹 포함 |
| 자동완성 | bday 조각 | Android birthdate 조각 + iOS 명시적 textContentType |


Web은 fieldset/legend와 필드별 label·aria-describedby를 사용한다. Native는 그룹 이름을 각 입력의
접근성 이름에 포함하며 세 입력을 하나의 접근성 노드로 합치지 않는다. Native 날짜 자동완성은
Android의 `birthdate-year/month/day`와 iOS의 명시적 `birthdateYear/Month/Day` content type을 연결한다. Web은 `bday-year/month/day`다. Web className, 양쪽 layoutStyle을 지원한다.

## 함정

- 서버 저장 완료와 valid 초안을 구분한다. 편집하면 이전 확인 결과를 무효화한다.
- Showcase의 Gregorian/영어 월 파서는 예제 정책이며 HJM 기본 파서가 아니다.
- Calendar로 부분 입력을 강제로 변환하거나 NumberField로 교체하면 원문 보존 계약이 깨진다.
- 큰 글자/RTL/제품 팔레트·Native 키보드·스크린리더·자동완성 실제 검증은 남아 있다. 실험 등록은 승격·게시가 아니다.
