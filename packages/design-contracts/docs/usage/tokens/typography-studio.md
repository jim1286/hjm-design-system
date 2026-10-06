# 글꼴 편집

- 단계: 토큰
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [테마 작업실](../../theme-studio.md), `src/foundations.ts`(`fontFamily`), `showcase/web/src/foundations/TypographyStudio.stories.tsx`, `showcase/native/src/TypographyStudio.stories.tsx`, `showcase/shared/typography-studio.ts`
- 스토리북: `배포/토큰/편집 도구/글꼴 편집`

## 언제 쓰나

제품 서체 후보를 정할 때, 후보 폰트를 기본 서체와 나란히 같은 크기로 그려 한글·영문·숫자·긴 문장을 비교하고
출처·라이선스를 함께 기록하는 작업 도구다. 공개 API가 없는 Storybook 도구이며 HJM 토큰을 바꾸지 않는다.

도구 흐름:

1. 후보 폰트를 넣는다. Web은 `.woff`·`.woff2`·`.ttf`·`.otf` 파일 선택, Native는 사용 권한이 있는 OTF·TTF 주소(`https://` 또는 `file://`)를 넣고 "서체 불러오기".
2. 상태 문구가 비어 있음 → 불러오는 중 → 불러옴 / 실패로 바뀐다. 실패하면 기본 서체로 표시한다.
3. "기본 서체"와 "비교할 서체" 두 카드에서 `heading` 크기 제목, 본문, 굵은 본문을 비교한다. 한글 글리프가 없는 부분은 기본 서체로 대체될 수 있다.
4. 서체 출처·라이선스 문서 주소를 적고, 아래 "서체 후보 설정" 코드 블록을 기록으로 가져간다.

## 값

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| 비교 기준 서체 | Web `system-ui, sans-serif`, Native OS 기본 | `--hjm-font-family-ui`(HJM 기본 목록은 [타이포그래피](typography.md)) | — | "기본 서체" 카드 |
| 비교 글자 크기 | `typography.heading` 24 · `typography.body` 14 · body bold | `--hjm-type-heading-*` · `--hjm-type-body-*` | `theme.tokens.typography` | 두 카드가 같은 단계로 그린다 |
| 산출물(Web) | `{ fileName, source, license, status, fallback: "system-ui, sans-serif" }` JSON | — | — | 후보 기록. 폰트 파일은 포함하지 않는다 |
| 산출물(Native) | `{ family, status, source, license }` JSON | — | — | 후보 기록 |
| `status` | `empty` · `loading` · `ready` · `error` | — | — | 불러오기 상태 |

## 쓰는 법

후보가 정해지면 제품이 폰트 파일과 라이선스를 소유하고 제품 앱에서 등록한다. HJM 컴포넌트는 Web에서 Provider 루트의 서체를,
`host="contents"`일 때는 제품 루트의 서체를 상속한다.

```tsx
// Web
import { HjmProvider } from "@hjmds/react/provider";

// 제품 CSS: @font-face { font-family: "ProductSans"; src: url("/fonts/product-sans.woff2") format("woff2"); }
// 제품 CSS: .product-root { font-family: "ProductSans", system-ui, sans-serif; }
<div className="product-root">
  <HjmProvider host="contents">{app}</HjmProvider>
</div>
```

```tsx
// Native
import { useFonts } from "expo-font";

const [loaded] = useFonts({ ProductSans: require("./assets/fonts/ProductSans.otf") });
// HJM Native 컴포넌트는 fontFamily를 지정하지 않는다. 제품 서체 적용 범위는 제품 Text 래퍼가 정한다.
```

## 하지 말 것

- 라이선스가 확인되지 않은 폰트를 제품에 넣지 않는다. 도구에 적은 출처·라이선스 주소를 제품 문서에 남긴다.
- 도구에서 불러온 폰트를 저장·배포 경로로 쓰지 않는다. Web 파일은 현재 미리보기에서만 쓰고, Native 등록은 앱 종료까지만 남는다.
- `--hjm-font-family-ui`를 제품 CSS에서 재정의하지 않는다([브랜드 경계 §3](../../brand-boundary.md)).
- 서체를 바꾸면서 글자 크기·줄 높이 토큰을 함께 바꾸지 않는다. 같은 크기에서 비교한 결과로 고른다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 폰트 입력 | 파일 선택, `FontFace`로 메모리에서 등록(업로드 없음) | 주소 입력, `expo-font` `loadAsync` |
| 초기화 | 등록한 폰트를 문서에서 제거 | 기본 서체로 돌아가지만 등록은 앱 종료까지 유지 |
| 서체 적용 | 스타일 `fontFamily: "<family>", system-ui, sans-serif` | 등록이 끝난 뒤에만 `fontFamily` 적용 |
