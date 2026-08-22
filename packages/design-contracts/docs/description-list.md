# DescriptionList contract

**문제.** 라벨-값 쌍의 묶음 — FA 등급 규정, 선수 프로필, 계약 조건 — 을 일관된 위계와
반응형 열 배치로 보여줍니다. 야잘알의 FA 등급 시트와 통산 화면이 지금 각자의 자체
구현으로 이 문제를 풀고 있습니다.

**일반화한 계약.** Statistic과 같은 원칙입니다 — 값은 제품이 이미 포맷한 문자열이고,
HJM은 stable `id`, `label`, `value`의 반복되는 읽기 순서만 소유합니다.

```ts
const gradeSheet = {
  items: [
    { id: "grade", label: "FA 등급", value: "A등급" },
    { id: "years", label: "규정 출장 시즌", value: "6시즌" },
  ],
} satisfies DescriptionListDescriptor;
```

- 각 쌍은 독립된 접근성 노드입니다. Statistic 그룹과 같은 원칙으로, renderer는 여러
  쌍을 하나의 축약된 노드로 합치지 않습니다.
- `columns`는 1 또는 2만 허용합니다(Statistic의 1–4보다 좁습니다 — 라벨-값 쌍은 통계
  카드보다 한 줄이 길어 3–4열에서 값이 쉽게 잘립니다).

**HJM 기본값.** 기본 `columns`는 2.

## 큰 글자에서의 전환 — resolver가 소유

이번 검수에서 야잘알 소비 코드가 §5 「큰 글자에서의 전환」 규칙을 다섯 번 어겼습니다.
매번 화면이 `fontScale >= 1.6`이면 `columns={1}`을 넘기는 식으로 직접 막았고, 그 완화를
빠뜨린 화면은 조용히 깨졌습니다. 야잘알 `src/components/ui/statistic-renderer-contract.ts`의
`resolveStatisticColumnCount`가 이미 같은 문제를 "화면이 배율을 판정하지 않고, 최소 칸
폭을 배율만큼 키워서 좁은 폭과 큰 글자를 같은 계산으로 흡수한다"는 형태로 풀었습니다.

DescriptionList는 이 형태를 **코어 계약 안으로** 가져와 `resolveDescriptionListColumnCount`로
공개합니다 — Statistic처럼 소비 앱이 각자 재구현하지 않고, 이 패키지가 폭·배율 판정을
소유합니다.

```ts
resolveDescriptionListColumnCount(availableWidth, requestedColumns, textScale);
```

- `availableWidth`가 유효하지 않으면(0 이하, NaN) `requestedColumns`를 그대로 돌려줍니다 —
  renderer가 아직 레이아웃을 측정하지 못한 첫 프레임을 위한 안전한 폴백입니다.
- `textScale`은 `DesignSystemProvider`의 연속값을 그대로 받으며 최소 1로 clamp합니다.
  배율이 1보다 작다고 칸을 더 좁히지 않습니다(§5가
  막은 방향).
- 같은 `availableWidth`에서 `textScale`이 커지면 `minItemWidth`가 함께 커지므로 2열이
  자연히 1열로 줄어듭니다 — 화면마다 반복해야 했던 임계값 분기가 사라집니다.

## Statistic과의 경계

DescriptionList는 Statistic의 "제품이 포맷한 문자열, 독립 접근성 노드" 원칙을 그대로
따르지만 같은 컴포넌트는 아닙니다. Statistic은 숫자 중심 지표(값이 tabular, 짧고,
trend를 가질 수 있음)이고 DescriptionList는 임의 길이 텍스트 값의 라벨-값 쌍입니다.
그래서 `value`에 `trend`가 없고, `columns` 상한이 2로 더 좁으며, `resolveDescriptionListColumnCount`의
`minItemWidth`(160)는 Statistic의 `minItemWidth`(120)와 다른 값입니다 — 통계 카드보다
라벨-값 한 줄이 넓게 필요하기 때문입니다.

## 플랫폼 번역

Web/Native 모두 `resolveDescriptionListColumnCount`가 돌려준 열 수로 CSS grid 또는
flex wrap 레이아웃을 만듭니다. 실제 측정된 컨테이너 폭과 시스템 폰트 배율은 renderer가
공급하고, 이 계약은 그 두 입력을 받아 열 수만 결정합니다.

## 검증 화면

아직 없음. 이전 판정이 후보로 든 "야잘알 FA 등급 규정 시트와 선수 프로필 화면" 둘 다
재확인 결과 근거가 되지 못한다 — `FaCenterScreen.tsx`의 FA 등급 설명과
`PlayerScreen.tsx`의 선수 정보는 실제로 이미 `AppList`/`AppListRow`(List/ListRow, 이미
beta) 조합으로 풀려 있고, `columns: 1 | 2` grid를 쓰는 라벨-값 화면이 아니다. 즉 두
화면 모두 DescriptionList가 계약하는 모양과 맞지 않는다. `planned → beta` 승격은 실제로
이 grid 모양을 쓰는 화면이 나오고 큰 글자(200% 이상) 기기 검증을 거친 뒤 리드가
진행한다.
