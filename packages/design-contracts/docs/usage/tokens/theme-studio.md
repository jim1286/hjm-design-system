# 테마 편집

- 단계: 토큰
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [테마 작업실](../../theme-studio.md), [브랜드 경계](../../brand-boundary.md), `src/theme-studio.ts`, `src/palette-contrast.ts`, `showcase/web/src/foundations/ThemeStudio.stories.tsx`, `showcase/native/src/ThemeStudio.stories.tsx`
- 스토리북: `배포/토큰/편집 도구/테마 편집`

## 언제 쓰나

제품 브랜드 색을 정할 때, 바꿀 색을 light·dark 양쪽에서 실제 컴포넌트에 입혀 보고 대비를 확인한 뒤
Provider에 넣을 `brandPalette` 설정을 얻는 작업 도구다. 새 테마 엔진이나 자동 색 생성기가 아니다.

도구 흐름(Storybook 화면, Web·Native 같음):

1. light·dark 각각 세 역할(주요 버튼 배경 `primary`, 주요 버튼 글자 `onPrimary`, 브랜드 강조 글자 `contentBrand`)에 `#rrggbb`를 넣고 적용한다.
2. 같은 화면 아래 샘플(버튼·입력·비활성·오류·아이콘·알림·기록 목록)이 그 팔레트로 다시 그려진다.
3. "색 대비 확인"에서 각 쌍의 대비·기준·통과 여부를 본다. 미달이 하나라도 있으면 색을 고친다.
4. "설정 내보내기"로 `{ "brandPalette": … }` JSON을 받는다(Web 파일 다운로드, Native OS 공유). 아래 코드 블록에서 복사해도 된다.

## 값

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `StudioColorRole` | `primary` · `onPrimary` · `contentBrand` | `--hjm-color-primary` · `--hjm-color-on-primary` · `--hjm-color-content-brand` | `theme.colors.primary` 등 | 도구에서 바꿀 수 있는 세 역할 |
| `applyStudioColor(palette, theme, role, color)` | 여섯 자리 HEX만 허용(아니면 `TypeError`), 소문자로 저장, 입력 객체 불변 | — | `@hjmds/design-contracts/theme-studio` | 역할 하나의 색 바꾸기 |
| `studioReport(palette, theme)` | 각 규칙의 `foreground`·`background`·`ratio`·`minimum`·`pass` | — | `@hjmds/design-contracts/theme-studio` | HJM 기본 팔레트에 바꾼 값을 합쳐 대비 검사. 통과 판정은 반올림 전 값 |
| `exportStudioPalette(palette)` | `{ "brandPalette": { "light": {…}, "dark": {…} } }` JSON 문자열 | — | `@hjmds/design-contracts/theme-studio` | 산출물. 바꾼 key만 담는다 |
| 대비 기준 | 글자 4.5 · 형태(`primary`·`borderControl`)와 `textWeak` 3 | — | `paletteContrastRules` | [색상](color.md)의 쌍 표와 같다 |

## 쓰는 법

산출물은 Provider의 `brandPalette` prop에 그대로 넣고, 같은 값을 제품 테스트에서 `checkBrandPaletteContrast`로 검사한다.

```tsx
// Web
import { HjmProvider } from "@hjmds/react/provider";
import { brandPalette } from "./brand-palette"; // 테마 편집에서 내보낸 JSON의 brandPalette

<HjmProvider brandPalette={brandPalette}>{app}</HjmProvider>
```

```tsx
// Native
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { checkBrandPaletteContrast } from "@hjmds/design-contracts/palette-contrast";
import { brandPalette } from "./brand-palette";

<HjmNativeProvider brandPalette={brandPalette} safeAreaInsets={insets}>{app}</HjmNativeProvider>

// 제품 테스트
expect(checkBrandPaletteContrast(brandPalette)).toEqual([]);
```

## 하지 말 것

- 통과 표시를 전체 접근성 인증으로 보고하지 않는다. 지정된 색 쌍의 대비일 뿐이고 hover·focus·실제 배경은 따로 확인한다.
- 내보낸 JSON을 HJM 중앙 토큰이나 다른 제품 기본값으로 쓰지 않는다. 그 제품의 `brandPalette`에만 쓴다.
- 도구 밖에서 `--hjm-color-*`를 재정의해 같은 효과를 내지 않는다([브랜드 경계 §3](../../brand-boundary.md)).
- Showcase 샘플 문구·예시 색을 제품에 복사하지 않는다. 도구의 라벨·오류 문구는 showcase 소유다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 내보내기 | `hjm-brand-palette.json` 파일 다운로드 | OS 공유 시트(`Share.share`) |
| 기록 샘플 | DataTable | List |
| 키보드 | — | 입력이 키보드에 가리지 않게 스크롤이 키보드 높이를 따른다 |
