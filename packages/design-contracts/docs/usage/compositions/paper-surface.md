# 종이 줄무늬 비교

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.16.0
- 검토일: 2026-10-15
- 근거: [EffectSurface 계약](../../effect-surface.md), A-02 종이 표현 후보의 줄무늬 보완
- 스토리북: `배포/구성/비교와 검증/종이 줄무늬 비교`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 구성 API가 없는 콘텐츠 묶음은 [CompositionLayout](../components/composition-layout.md)의 제목·배지·행동·본문·상태·footer 슬롯을 사용한다.

## 언제 쓰나

같은 입력·기록에서 종이 preset의 grain+ruled 상속과 앱이 지정한 평면/줄무늬 표현을 비교한다.
테마를 바꾸고 싶다는 이유로 앱이 별도 배경·입력 wrapper를 만들지 않고 기존 공개 profile와 OverviewScreen을 쓴다.
선은 정적 장식이며 글자 기준선을 맞추는 편집기 grid가 아니다. 테이프·찢어진 경계·물결/타공·회전된 내용은 제공하지 않는다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| HjmProvider/HjmNativeProvider | 앱 소유 profile 한 번 주입 | [테마](../../theming.md) |
| OverviewScreen | canvas·카드·도구·footer의 기존 틀 | [개요 화면](../components/overview-screen.md) |
| EffectSurface | 화면 내부 canvas의 grain/ruled | [배경 효과](../components/effect-surface.md) |
| SegmentedControl + 보이는 이름 Text(`label`) | 상속/명시 표현과 간격 선택. SegmentedControl `label`은 접근성 이름이라 보이는 이름을 위에 둔다 | [단일 선택](../components/segmented-control.md) |
| TextField/Button/Dialog | 초안·확인·상세와 복귀 | [입력](../components/field.md), [Dialog](../components/dialog.md) |

## 배치

```text
설명 + 표현 한계(caption)
종이 표현 [테마 따르기 / 줄무늬 없는 면 / 줄무늬 추가]
줄무늬 간격 [좁게 24 / 넓게 40]  (줄무늬 추가일 때만 사용 가능, 그 외 흐리게)
미리보기 도구: 테마 pills 10개
┌ OverviewScreen: 테마의 기존 화면/구성 기본값 ┐
│ 제목 → 설명 → 기록 도구(산책 메모 입력)     │
│ 기록 2개: 제목 → 본문                       │
│ 확인 결과 → [기록 확인] [자세히 읽기]        │
└ 정적 canvas: 내용 뒤, 입력/읽기 순서 없음 ──┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack, 스토리 `Container size="reading"` | 화면 앞쪽 비교 도구부터 세로 | gap lg20, 최대 폭 720; Native는 바깥 ScrollView와 기존 테마 비교와 같은 640host-unit 화면 viewport |
| 기록 항목 | OverviewScreen·Stack | items 본문 | gap sm12; rows/grid/cards와 화면은 profile 기본값 |
| 줄무늬 | EffectSurface | 화면 canvas 뒤 SVG | 한 선 1host unit, spacing 기본24, 명시 비교40; userSpaceOnUse |
| footer | Stack·Button | 기존 OverviewScreen footer | gap sm12, primary 확인 다음 secondary 상세 |
| 상세 | Dialog·Text | 기존 modal | 현재 초안 읽기, close/Escape·초점 복귀는 기존 계약 |

## 흐름과 상태

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 테마 따르기. paper=grain+ruled/intensity0.06/spacing24 | 테마를 subtree key로 쓰지 않음 |
| 진행 중 | 표현·간격·테마를 즉시 반영, 인위적인 대기 없음 | 동일 입력·초안 유지 |
| 줄무늬 없는 면 | canvas grain/intensity0.12/정적 | 동일 입력·초안·기록 |
| 줄무늬 추가 | canvas grain+ruled/intensity0.12/spacing24 또는40 | 동일 입력·초안·기록 |
| 상세 | 현재 초안 읽기 | 닫기와 trigger 복귀 |
| 실패 | 기존 EffectSurface의 장식 host 배경 대안 | 내용·입력과 행동 유지; peer 미설치는 번들 실패라 별도 확인 |

1. 초안을 입력한 뒤 표현·간격·테마를 바꾼다. 입력과 기록의 owner는 같은 컴포넌트에 남는다.
2. 기록 확인은 그 시점의 초안을 결과로 보관한다. 이후 입력이나 표현을 바꿔도 확인한 결과는 유지한다. Web status와 Native의 Android live region·iOS 안내로 변경을 알리며 서버 저장·자동 성공·운영 데이터 반영을 뜻하지 않는다.
3. 자세히 읽기에서 현재 초안을 확인하고 닫는다. 줄무늬를 접근성 이름/조작 요소로 노출하지 않는다.

## 코드 골격

```tsx
// Web
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmProvider } from "@hjmds/react/provider";
const productDesign = defineHjmDesignProfile({ extends: "paper", material: {
  canvas: { layers: ["grain", "ruled"], ruledSpacing: 40, intensity: 0.06, active: false },
} });
// 실제 제품의 필드/데이터/저장 흐름을 기존 OverviewScreen props로 공급한다.
<HjmProvider designProfile={productDesign}>{children}</HjmProvider>;
```

```tsx
// Native
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
const productDesign = defineHjmDesignProfile({ extends: "paper", material: {
  canvas: { layers: ["grain", "ruled"], ruledSpacing: 40, intensity: 0.06, active: false },
} });
<HjmNativeProvider designProfile={productDesign}>{children}</HjmNativeProvider>;
```

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 선 단위 | CSS pixel | logical host unit; iPhone17Pro/iOS26.5 개발 호스트에서 24/40 간격 확인 |
| 그리기 | SVG Pattern/Rect | 기존 optional react-native-svg15.15.5, 새 peer 없음 |
| 모션 | atmospheric SVG 밖 정적 | Animated scale 밖 정적 |
| 내용 | 일반 DOM 레이아웃 | 기존 Native 화면·입력 host |

강도를 올려 원제품의 종이·사진 재질과 같다고 주장하지 않는다. 중요한 문구는 불투명 Surface에 놓고 실제 대비를 확인한다.
제공하지 않는 경계를 대체한 것으로 세지 않는다. 최대 글자 조건은 사용자 지시로 실행·후속·완료 조건에서 제외한다.

Native 비교 도구를 높이 없는 Stack에 넣으면 flex 화면이 접혔고, 작은 남은 화면 높이만 주면 도구가 본문을
밀어냈다. 그래서 기존 테마 비교의 640unit viewport를 사용하고 바깥도 스크롤한다. 제품은 이 예제 높이를
복사하지 않고 실제 route 영역을 제공한다. iOS 줄무늬는 1unit 폭/백분율 Rect 조합에서 보이지 않아
spacing×spacing 타일과 명시적 물리 폭을 사용한다. [수정 전후 기기 결과](../../../../../docs/qa/2026-10-07-native-reference-validation.md)를 참고한다.

## 근거

- 2026-10-17 구성 리뷰: 예제 전용 "다음 테마"가 primary라 화면의 primary "기록 확인"과 경쟁했고, 도구 접기 제목과 입력 label이 같은 "산책 메모"였으며, 두 선택에 보이는 이름이 없었다. Web은 그룹 `disabled`를 보이지 않게 그렸다(SegmentedControl이 항목에 전달하도록 수정).
