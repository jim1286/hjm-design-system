# Heading contract

**문제.** 랜딩 히어로, 결과 화면의 큰 숫자, 카드 제목처럼 **문서 제목 단계를 실제로
그려야 하는 자리**.

**이미 있던 것을 꺼냈을 뿐이다.** `foundations`의 `heading`에는 level1 40px부터
level5 18px까지 다섯 단계가 있었지만 어떤 renderer도 노출하지 않았다 — `Text`는
`TextVariant`(최대 24px)만 받는다. 그래서 큰 제목이 필요한 화면은 제품 CSS로 폰트
크기를 직접 썼다. 이 계약은 **새 크기를 만들지 않는다.**

**Top·Section과 겹치지 않는다.**

| | 아는 것 | 갖는 것 |
| --- | --- | --- |
| `Top` | 화면의 첫 자리 | 자기 여백·eyebrow·보조 문장·보조 행동 |
| `Section` | 본문 중간의 묶음 | 헤더 행·설명·본문 슬롯 |
| `Heading` | 아무것도 | 글자 하나 |

그래서 Heading은 주변 여백을 소유하지 않는다. 담는 블록이 정한다.

**두 축은 일부러 어긋날 수 있다.** `level`은 시각적 크기, `semanticLevel`은 문서
구조다. 크게 보이는 카드 제목이 구조상 `h4`인 경우가 실제로 있고, 그때 크기를 줄이거나
구조를 왜곡하는 대신 둘을 따로 적는다. 생략하면 `level`의 숫자를 따른다.

**Native.** 접근성 role은 `header` 하나뿐이라 문서 단계는 `aria-level`로 함께 싣는다.


## 디자인 프로필의 전체 제목 크기(실험·미게시)

2026-10-07 [Heading 갤러리](https://component.gallery/components/heading/)를 비교하며
현재 renderer가 level3~5만 프로필 typography에 연결하고 level1/2는 고정값으로 남긴
누락을 확인했다. 앱이 테마를 한 번 넣어 큰 제목까지 재사용하려는 요구 때문에
[디자인 프로필](design-profile.md)의 `tokens.heading`을 다섯 시각 단계로 둔다.
본문 크기에서 큰 제목을 임의로 배율 계산하는 대안은 계층과 행간이 달라질 수 있어
채택하지 않는다. 원본 갤러리의 수치·코드·폰트 자산을 복사한 것이 아니다.

프로필이 없으면 원래 40/32/24/20/18 크기를 유지한다. 기존 level3~5 typography
alias는 helper에서 병합하고 명시적인 heading override가 마지막에 우선한다.
Web은 CSS 변수, Native는 Text host의 metrics로 반영하고 `semanticLevel`·문구·초점을
바꾸지 않는다. 테마 전환은 시각 크기만 바꾸며 실제 문서 단계는 기존 계약이 소유한다.
