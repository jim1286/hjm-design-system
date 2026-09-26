---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

브랜드가 들어오는 경로를 `brandPalette` 하나로 정하고, 제품 팔레트의 대비를 검사하는 도구와 opt-in 레이어 stylesheet를 추가합니다.

- `@hjmds/design-contracts/palette-contrast`를 추가합니다. `checkBrandPaletteContrast(brandPalette)`는 Provider와 같은 방식으로
  theme별 병합 결과를, `checkPaletteContrast(palette)`는 완성된 팔레트를 검사해 WCAG 기준 미달 쌍을 돌려줍니다.
  본문 글자(`text`·`textBody`·`textMuted`·`textSub`·`contentBrand`·`danger` on `bg`·`surface`)와 채운 버튼 라벨은 4.5:1,
  `primary`·`borderControl` 윤곽과 `textWeak`(비활성·장식 등급, canvas 위 `border.strong`)는 3:1입니다.
- 이 검사로 기본 라이트 `textSub`가 `surface` 위 4.19:1로 AA 미달임을 찾아 `#6b7684` → `#65707d`로 고칩니다.
  `Text tone="subtle"` 등 `textSub`를 쓰는 글자가 약간 진해집니다. `borderControl`은 그대로입니다.
- 브랜드 규칙의 단일 원본 `docs/brand-boundary.md`를 둡니다. 지원 경로는 `brandPalette` 부분 병합뿐이고 모든 브랜드 팔레트는
  대비 검사를 통과해야 합니다. `.hjm-*` 선택자·`--hjm-*` 변수 재정의는 지원하는 테마 경로가 아니며, 이전 문서들의 상충하던
  문구(특이도를 맞춘 재정의 허용, partial override 배제)를 정정합니다.
- `@hjmds/react/styles.layered.css`를 추가합니다. `styles.css`와 같은 규칙을 `@layer hjm { }`으로 감싼 파일이며 빌드가
  한 원본에서 생성합니다. 이 파일을 쓰면 레이어 밖의 제품 CSS(전역 요소 리셋 포함)가 특이도와 무관하게 HJM을 이기므로
  전환 전에 전역 선택자를 점검해야 합니다. 기본 `styles.css`는 호환성을 위해 레이어 밖에 그대로 둡니다.
