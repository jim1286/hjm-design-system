# Statistic contract

Statistic은 숫자를 계산하거나 포맷하지 않습니다. 제품 adapter가 locale·단위·야구 규칙에 맞춰
완성한 문자열을 넘기고 HJM은 반복되는 정보 위계와 읽기 순서만 소유합니다.

- 각 항목은 stable `id`, 보이는 `label`, 포맷이 끝난 `value`를 가집니다.
- `prefix`, `suffix`, `hint`는 선택 사항이며 빈 문자열은 허용하지 않습니다.
- 숫자 value는 tabular glyph를 사용하고 줄 수를 제한하지 않아 큰 글자·긴 단위가 잘리지 않게 합니다.
- trend의 `direction`과 `tone`은 분리합니다. 예를 들어 투구 수 증가는 `up + danger`, 순위 숫자
  증가는 제품 의미에 따라 `up + neutral`일 수 있습니다.
- trend에는 arrow/minus mark와 현지화된 visible label이 모두 필요해 색만으로 의미를 전달하지
  않습니다.
- `StatisticGroup`은 1–4열 선호와 stable id 검증만 제공합니다. Web/RN renderer는 실제 폭과 큰
  글자에 맞춰 1열까지 wrap하며 value 줄 수를 강제로 자르지 않고, 각 Statistic을 독립 접근성
  항목으로 남깁니다.
- Statistic 자체는 interactive하지 않습니다. 탐색이나 동작은 바깥 Link/Button이 소유합니다.
