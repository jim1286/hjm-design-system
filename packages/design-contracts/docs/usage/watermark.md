# Watermark 사용 지침

적용: `@hjmds/react` 1.12.1 (Native 없음) · 검토일: 2026-10-06 ·
계약: [Watermark](../watermark.md), recipe `watermarkRecipe`(`src/watermark.ts`)

## 언제 쓰나

Web에서 문서 미리보기·초안 화면 위에 "초안", 프로젝트 이름 같은 **장식용 출처 표시 텍스트**를 비스듬히
반복해 깔 때 쓴다. inline SVG pattern이라 외부 요청·canvas가 없고, 오버레이는 클릭·텍스트 선택을 막지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 스크린샷·복제·유출 방지 | 없음. Watermark는 보안 기능이 아니다 |
| 반드시 읽혀야 하는 출처·보안 고지 | 본문 [Notice](notice.md) 또는 [Text](text.md) |
| 이미지 워터마크, 다운로드 파일에 삽입 | 없음(제공하지 않음) |
| 화면 상태 배지("초안" 한 곳 표시) | [Badge](badge.md), [Tag](tag.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Watermark` | `/watermark`만(root 없음) | 없음 | 기본 |

## 최소 사용 예

```tsx
// Web
import { Watermark } from "@hjmds/react/watermark";

<Watermark text={[t("document.draft"), projectName]}>
  <DocumentPreview />
</Watermark>
```

Native: 없음.

## 축과 기본값

- `text`: 문자열 또는 1~3줄 배열. 각 줄은 비어 있지 않고 120자 이하.
- `tileWidth` 240(최소 80), `tileHeight` 160(최소 60), `rotate` -22(-90~90), `opacity` 0.12(0~1). 범위를 벗어나면 `TypeError`.
- 글자 색은 `--hjm-color-text-sub` 토큰이다. 색 prop은 없다.

## 꼭 지킬 것

- 표시 문구는 i18n 키로 만들고, 프로젝트명 같은 데이터는 그대로 넘긴다. 문자열은 React text node로만 들어가 마크업으로 해석되지 않는다.
- 긴 문구는 줄을 자르지 말고 `tileWidth`·`tileHeight`를 키운다.
- 오버레이는 `aria-hidden`이다. 보조기술 사용자에게도 필요한 내용이면 본문에 따로 쓴다.
- `className`·`style`·`ref`를 받지 않는다. 배치는 감싸는 요소에서 한다. 오버레이 위치는 `hjm-watermark`의
  `position: relative`에 의존하므로 `@hjmds/react`의 `styles.css`가 필요하다.

## 함정

- SVG는 DOM 콘텐츠라 인쇄에도 나온다. 인쇄 결과는 소비 환경에서 확인한다(계약 문서 기준, HJM이 인쇄를 검증하지 않음).
