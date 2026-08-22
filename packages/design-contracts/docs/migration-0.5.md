# v0.5 migration

v0.4 → v0.5는 기존 foundation/recipe 런타임 값을 유지하는 additive release입니다. 다만
catalog status를 그대로 열거하거나 Showcase route 존재를 renderer 증거로 사용한 소비자는
아래 두 가지를 확인해야 합니다.

## 소비자가 확인할 변경

### DesignSystemProvider maturity

`DesignSystemProvider`는 `beta`에서 `planned + contract-ready`로 정정됐습니다. 환경 resolver가
존재한다는 사실만으로 실제 Web/RN Context adapter가 검증됐다고 볼 수 없기 때문입니다.
catalog status를 exhaustive하게 단정하는 테스트는 새 값을 반영해야 합니다. 공개 환경 API는
삭제되지 않았습니다.

### Ant Design coverage 명칭

`summarizeAntDesignCoverage()`의 renderer를 암시하던 필드는 deprecated alias로 유지되며,
새 코드는 maturity 전용 필드를 사용합니다.

| 기존 alias | 새 필드 | 실제 의미 |
| --- | --- | --- |
| `fullyPreviewable` | `fullyMature` | 모든 HJM target이 stable/beta |
| `partiallyPreviewable` | `partiallyMature` | target 일부만 stable/beta |
| `contractOnly` | `plannedOnly` | target이 모두 planned |

실제 Web preview 수는 Showcase evidence registry에서 별도로 읽습니다.

## 신규 foundation

- `fontFamily.ui | code`
- `fontWeight.regular | medium | semibold | bold | heavy`
- `letterSpacing.tight | normal | wide`
- `numeric.proportional | tabular`
- `heading.level1 ... level5`

기존 `typography` key와 런타임 숫자·weight 값은 유지됩니다. recipe 내부 weight도 같은 foundation
값을 참조하므로 화면 변화 없이 단일 출처가 됩니다.

## Provider 계약

`resolveDesignSystemEnvironment()`는 기존 호출을 유지하면서 선택적인 parent/system signal을
받습니다.

```ts
const value = resolveDesignSystemProviderValue(
  { direction: "rtl" },
  {
    parent: parentValue.environment,
    systemTheme: "dark",
    systemTextScale: 1.25,
    systemReducedMotion: true,
  },
);

// resolveColorReference에 그대로 전달
value.palette;
```

축별 우선순위는 `explicit input → resolved parent → system signal → HJM default`입니다.
`parent`는 반드시 이미 해석된 light/dark 환경이어야 하며 `theme: "system"`을 허용하지 않습니다.
임의 theme/component token override와 React/RN Context는 계속 코어 범위 밖입니다.

## Showcase와 CI

- 91개 canonical route를 Web reference, contract-only, Web unsupported로 분리합니다.
- planned route는 구현된 것처럼 보이는 JSX를 렌더링하지 않습니다.
- Home/Explorer 수치는 실제 evidence registry에서 계산합니다.
- Storybook manager와 preview가 foundation token을 사용합니다.
- token-boundary 검사와 static classification 검사가 Showcase check에 포함됩니다.
- Ant Design reference는 6.6.1로 고정됩니다. v0.7부터 외부 registry drift 검사는 자동 CI가
  아니라 필요할 때 실행하는 `pnpm reference:antd:verify`로 단순화되었습니다.
- GitHub Pages workflow는 Node 24 기반 action major를 사용합니다.

## 권장 전환 순서

1. package/tag를 `v0.5.0`으로 고정
2. Provider adapter가 OS 신호를 한 번만 측정하고 새 resolver에 전달하는지 확인
3. 로컬 raw font weight 대신 `fontWeight` foundation 사용
4. AntD coverage UI가 deprecated previewable alias를 renderer 수치로 표시하지 않는지 확인
5. Web/RN 제품 fixture에서 light/dark, RTL, 200% text, Reduce Motion 검증
6. `pnpm check`와 제품별 renderer/접근성 테스트 실행
