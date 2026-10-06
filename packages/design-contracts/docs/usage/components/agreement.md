# Agreement

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Agreement contract](../../agreement.md), `agreementRecipe`·`resolveAgreementState`(`src/agreement.ts`)
- 스토리북: `배포/컴포넌트/입력/약관 동의`

## 언제 쓰나

가입·결제·서비스 시작 앞의 약관 동의 묶음에 쓴다. 전체 동의 한 줄, 필수/선택 항목, 항목별 전문
보기가 한 덩어리로 움직이고, 제출 가능 여부(`satisfied`)를 HJM이 판정한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 법적 의미 없는 여러 선택 | [CheckboxGroup](checkbox-group.md) |
| 동의 하나를 켜고 끄는 설정(마케팅 수신 등) | [Switch](switch.md), [Checkbox](checkbox.md) |
| 로그인 화면 하단의 "계속하면 동의" 고지 | [AuthScreenLayout](auth-screen-layout.md)의 `footer` |
| 약관 전문 표시 | 제품 화면·[Sheet](sheet.md)·[Link](link.md) (Agreement는 여는 경로만 가진다) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Agreement` | 기본 | `@hjmds/react`, `/agreement` | `@hjmds/react-native`, `/agreement` |
| `AgreementDescriptor`·`AgreementState` 타입 | 보조(입력·파생 상태) | `@hjmds/design-contracts/components/agreement` | 같음 |

## 최소 사용 예

```tsx
// Web
import { Agreement } from "@hjmds/react/agreement";

<Agreement
  descriptor={{
    accessibilityLabel: t("signup.terms.group"),
    allLabel: t("signup.terms.all"),
    items: [
      { id: "tos", label: t("signup.terms.tos"), required: true, detail: { label: t("common.view"), href: "/legal/terms" } },
      { id: "marketing", label: t("signup.terms.marketing") },
    ],
  }}
  requiredLabel={t("signup.terms.required")}
  optionalLabel={t("signup.terms.optional")}
  onStateChange={(state) => setCanSubmit(state.satisfied)}
/>
```

```tsx
// Native
import { Agreement } from "@hjmds/react-native/agreement";

<Agreement
  descriptor={descriptor}
  requiredLabel={t("signup.terms.required")}
  optionalLabel={t("signup.terms.optional")}
  onDetail={(id) => openTermsSheet(id)}
  onStateChange={(state) => setCanSubmit(state.satisfied)}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor` | `{ accessibilityLabel, allLabel, items }`(`AgreementDescriptor`) | 필수 | 문구는 모두 i18n |
| 묶음 `descriptor.disabled` | `boolean` | `false` | 제출 중 전체·개별 동의 변경만 잠금. 선택/필수 판정 유지, 전문 읽기는 가능 |
| 항목 | `{ id, label, description?, disabled?, required?, detail?: { label, href? } }` | — | 필수이면서 `disabled`인 항목은 throw |
| 항목 `required` | `boolean` | `false`(선택) | 필수 항목이 하나라도 비면 `satisfied`가 `false`다 |
| 전체 동의 | tri-state(파생) | — | 저장되는 값이 아니라 개별 항목에서 파생한다. 비활성 항목은 분모에서 빠진다 |
| `checkedIds` · `defaultCheckedIds` | `ReadonlySet<Id>` | 비제어 빈 Set | 제어·비제어. 목록에서 빠진 항목의 체크는 자동으로 버려진다(`reconcileAgreementSelection`) |
| `onCheckedIdsChange` | `(ids: ReadonlySet<Id>) => void` | — | 체크 목록이 바뀔 때 |
| `onStateChange` | `(state: AgreementState) => void`, `state` = `{ all: boolean \| "mixed", satisfied: boolean, missingRequiredIds: readonly Id[] }` | — | 마운트 때 초기 상태로 한 번, 그 뒤 체크를 바꿀 때마다 호출된다(마운트 호출은 미게시(1.12.1 이후)) |
| `onDetail` | `(id: Id) => void` | — | 전문 보기. Web은 `detail.href`가 없을 때만 호출 |
| `requiredLabel` · `optionalLabel` | `string` | 필수 | 행 끝 "(필수)"·"(선택)" 문구 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 바깥 배치 전용 |
| Native `style` | — | — | deprecated — `layoutStyle` 또는 recipe(개발 모드 1회 경고, 다음 major 제거) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 폭을 꽉 채운다. 전체 동의 줄 최소 44(`control.minTouchTarget`), 항목 줄 최소 44, [전문 보기] 높이 44, 체크 표시 16×16(`spacing.md`) | `agreementRecipe`, `collectionItemContract`, `.hjm-agreement__mark` |
| 간격 | 전체 동의 ↔ 목록 `spacing.xs` 8. 전체 동의 안쪽 위아래 `spacing.sm` 12 · 좌우 `spacing.md` 16, 배경 `canvas`, 모서리 `radius.md` 12. 항목 좌우 `spacing.sm` 12, 체크↔라벨 `spacing.sm` 12, [전문 보기] 좌우 `spacing.xs` 8 | `agreementRecipe`, `.hjm-agreement*` |
| 순서·정렬 | 가입·결제 화면에서 입력 필드 아래, 제출 버튼 바로 위. 안쪽은 [전체 동의] → 항목 목록, 항목은 체크·라벨이 시작 쪽, [전문 보기]가 뒤쪽에 놓인다. 라벨은 행 폭의 70%를 기준으로 확보하고 긴 전문 버튼은 다음 줄로 이동한다. 설명은 라벨 아래 줄. 스토리는 Top → TextField → Agreement → 남은 필수 항목 안내(`role="status"`) → Button을 `Stack gap="md"`(16)로 쌓는다 | `showcase/web/src/patterns/Agreement.stories.tsx` |
| 고정·스크롤 | Agreement는 스크롤 본문에 둔다. 하단에 고정할 제출 버튼은 [BottomCTA](bottom-cta.md)로 두고 `satisfied`가 `false`면 비활성 | 같은 스토리 |
| 좁은 폭·큰 글자 | 라벨이 줄바꿈되고(`overflow-wrap: anywhere`) [전문 보기]는 끝 쪽에 남는다 | `.hjm-agreement__copy` |

```text
┌──────────────────────────────┐
│ Top: 제목·설명                │
│ [이메일 TextField]            │
│ ┌──────────────────────────┐ │
│ │ ☐ 전체 동의하기           │ │ ← all(canvas 배경)
│ └──────────────────────────┘ │
│  ☐ 이용약관 (필수)  전문 보기 │
│  ☐ 마케팅 (선택)    전문 보기 │
│    설명 한 줄                 │
│ 남은 필수 항목 안내(status)   │
│ [   가입하고 시작하기   ]     │ ← primary, satisfied 전 disabled
└──────────────────────────────┘
```

## 꼭 지킬 것

- 필수 동의 판정은 `resolveAgreementState`의 `satisfied`를 사용하고 제출 가능 여부는 제품의 입력 검증·진행 중 상태와 함께 결정한다. 묶음 잠금은 동의 사실을 바꾸지 않으므로 `satisfied`가 true인 채 잠길 수 있다. 남은 필수 항목 안내는 `missingRequiredIds`로 제품이 문장을 만든다.
- `onStateChange`는 마운트와 사용자 토글 때 알린다. 제품이 약관 버전이나 제어 `checkedIds`를 직접 바꾸면 같은 렌더에서 `resolveAgreementState(descriptor, checkedIds)`로 판정한다. 문서 버전 변경 시 이전 동의를 초기화하는 책임은 제품에 있다.
- `accessibilityLabel`·`allLabel`·항목 `label`·`requiredLabel`·`optionalLabel`은 모두 제품의 i18n 문구다.
  빈 문자열, 빈 목록, 중복 id, 필수이면서 `disabled`인 항목은 throw다.
- 약관 문구·링크 주소·법적 유효성·동의 기록 저장은 제품 소유다. HJM은 판정과 배치만 가진다.
- 전문 보기 컨트롤은 체크박스와 별개이며 눌러도 체크되지 않는다. 같은 행에 다른 누름 영역을 덧붙이지 않는다.
- 색·간격은 recipe가 정한다. 배치는 `layoutStyle`로만 한다. Native `style`은 deprecated다([소비 정책 §3](../../consumer-policy.md)).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 전문 열기 | `detail.href`가 있으면 `<a>`, 없으면 버튼이 `onDetail(id)` 호출 | `href`를 쓰지 않고 항상 `onDetail(id)` |
| 배치 prop | `layoutStyle`(+`className`) | `layoutStyle`(`style`은 deprecated) |
| `ref` | root `div`로 전달 | 없음 |

## 함정

- 1.12.1까지 `onStateChange`는 사용자가 체크를 바꿀 때만 호출돼, `defaultCheckedIds`로 필수 항목을 미리 채운 경우 첫
  `satisfied`를 받지 못했다. 미게시(1.12.1 이후) 버전은 마운트 때 초기 상태를 한 번 알린다. 1.12.1에서는 제출 버튼의 첫 상태를
  `resolveAgreementState(descriptor, checkedIds)`(`@hjmds/design-contracts/components/agreement`)로 직접 계산한다.
  호출 횟수를 세는 코드는 마운트 1회가 늘어난다.

2026-10-07 Utilverse 가입은 요청 중 필수 Checkbox 둘을 잠그는데, 개별 필수 item에 disabled를
주면 Agreement 검증이 거절했다. 묶음 `descriptor.disabled`를 추가해 필수 항목을 분모에서
빼거나 동의 값을 삭제하지 않고 변경만 막는다. 양 Showcase의 `비활성`에서 전문 읽기와 잠금
해제 후 이어서 선택을 확인할 수 있다. Web은 aria-disabled로 초점을 유지하고 키보드 토글을
막으며, Native는 disabled/accessibilityState를 함께 적용한다. 별도 전문 행동은 잠그지 않는다.

큰 글자에서도 체크 원은 16×16을 유지한다. 내부 체크는 8×4 도형(테두리 2), 혼합 표시는 10×2 도형이며 글꼴 확대에 따라 원 밖으로 커지지 않는다. Native는 Yoga의 축소 계산 때문에 70% 최소 폭도 함께 적용한다.
