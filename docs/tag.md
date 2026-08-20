# Tag contract

**문제.** 화면에 반복해서 등장하는 한 조각의 정적 메타데이터 — `좌익수`, `A등급`,
`2026 시즌` — 에 일관된 이름과 톤을 붙입니다. 이 라벨은 누를 수 없고, 선택되지도 않고,
지워지지도 않습니다.

**일반화한 계약.** 필수 `label`과 선택적 `tone`만 받는 표현 계약입니다(Statistic처럼
제품이 완성한 문자열을 받습니다). id, collection 멤버십, 선택 state는 없습니다 — Tag는
Collection 기본 계약의 대상이 아니라 낱개 표시 단위입니다.

```ts
const positionTag = { label: "좌익수" } satisfies TagDescriptor;
const gradeTag = { label: "A등급", tone: "success" } satisfies TagDescriptor;
```

**HJM 기본값.** `tone`은 `neutral | info | success | attention | brand` 다섯 가지 공용
의미로 좁힙니다. `warning`과 `danger`는 포함하지 않습니다 — 위험이나 경고를 알리는 것은
Notice/Badge의 역할이고, Tag는 사실을 나열할 뿐 위협하지 않습니다. 기본 tone은 `neutral`.

## Chip과의 경계

이 시스템에는 이미 `Chip`(beta)이 있습니다. Chip은 action/radio/checkbox 의미를 가진
**누를 수 있는** 입력입니다 — `chipBehavior`가 `selected`, `onPress`, keyboard activation을
계약으로 소유합니다. Tag는 그 반대입니다.

- `tagRecipe`에는 `states`, `focus`, `selectionIndicator`가 없습니다. 아무것도 눌리거나
  포커스를 받지 않기 때문입니다.
- `closable`(지울 수 있는 태그)은 이 계약에 **없습니다**. 태그를 지우는 것은 선택 해제이고,
  선택 해제는 Chip의 `selected` 축이 이미 소유한 문제입니다. Tag에 별도의 dismiss 축을
  추가하면 같은 "선택 해제"를 두 컴포넌트가 서로 다른 이름으로 계약하게 됩니다.
- 모양도 다릅니다. `chipRecipe`와 `badgeRecipe`는 `radius: "full"`(pill)을 쓰지만
  `tagRecipe`는 `radius: "sm"`의 사각형입니다. 정적 라벨을 pill로 그리면 누를 수 있다는
  암묵적 신호를 주므로, 형태 자체로도 상호작용 가능성을 부정합니다.
- 야잘알의 `AppBadge`가 지금 이 역할(포지션·등급·시즌 라벨)을 수행하고 있습니다. Tag는
  그 패턴을 공용 계약으로 승격한 것이며, 실제 마이그레이션은 이후 vertical slice에서
  검증합니다.

## 플랫폼 번역

Web과 Native 모두 순수 text + background 조각입니다. 상호작용이 없으므로 별도의
keyboard, focus, accessibilityState 계약이 필요 없습니다 — 접근성 트리에는 보이는 텍스트
노드 하나로 충분합니다. 여러 Tag를 한 줄에 나열할 때 간격 조합은 나중에 Stack/Inline
recipe가 안정화되면 그쪽에 위임하고, 이 계약에는 넣지 않습니다.

기본 높이는 20px이지만 고정 높이가 아닙니다. Dynamic Type에서 한 줄 라벨의 고유 높이만큼
늘어나며, renderer는 라벨을 고정 프레임 안에서 자르지 않습니다.

## 검증 화면 (예정)

야잘알 선수 카드의 포지션/등급 라벨, FA 등급 시트의 등급 칩을 첫 vertical slice 후보로
남깁니다. `planned → beta` 승격은 실제 화면 적용 후 리드가 결정합니다.
