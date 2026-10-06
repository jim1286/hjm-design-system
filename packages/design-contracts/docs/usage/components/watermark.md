# Watermark

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Watermark](../../watermark.md), `src/watermark.ts`(`watermarkRecipe`)
- 스토리북: `배포/컴포넌트/상태와 알림/워터마크`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Watermark` | 기본 | `/watermark`만(root 없음) | — |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `text` | 문자열 또는 1~3줄 배열 | — | 각 줄은 비어 있지 않고 120자 이하 |
| `tileWidth` | 80 이상 | 240 | 범위를 벗어나면 `TypeError` |
| `tileHeight` | 60 이상 | 160 | 범위를 벗어나면 `TypeError` |
| `rotate` | -90~90 | -22 | 범위를 벗어나면 `TypeError` |
| `opacity` | 0~1 | 0.12 | 범위를 벗어나면 `TypeError` |
| `children` | `ReactNode` | — (필수) | 표시를 깔 내용 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 감싸는 루트의 바깥 배치(margin·폭·flex·`alignSelf`) |

글자 색은 `--hjm-color-text-sub` 토큰이다. 색 prop은 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 자체 크기·여백이 없다. 감싼 내용이 그대로 흐르고 오버레이가 그 영역 전체(`inset: 0`)를 덮으며, 넘치는 무늬는 영역 경계에서 잘린다. 타일 기본 240×160, -22° 회전 | `.hjm-watermark__overlay`, `watermarkRecipe` |
| 간격 | 영역 크기와 바깥 간격은 `layoutStyle`이나 감싸는 요소가 정한다 | `react/src/watermark.tsx` |
| 순서·정렬 | 내용(z-index 0) 위에 오버레이(z-index 1), 클릭·선택은 내용으로 통과 | `.hjm-watermark__content`, `.hjm-watermark__overlay`(pointer-events: none) |
| 고정·스크롤 | 표시를 깔 영역(문서 미리보기 카드·초안 본문)만 감싼다. 화면 전체나 TopBar·BottomCTA 같은 고정 영역까지 감싸지 않는다. 스크롤 영역 안에 두면 내용과 함께 스크롤되고, 스크롤 컨테이너 자체를 감싸면 무늬는 보이는 창에 고정된다 | `.hjm-watermark`(position: relative) |
| 좁은 폭·큰 글자 | 영역이 타일 하나보다 작으면 문구가 잘려 보이므로 `tileWidth`·`tileHeight`를 영역에 맞게 줄인다(최소 80×60) | `resolveWatermark` |

## 꼭 지킬 것

- 표시 문구는 i18n 키로 만들고, 프로젝트명 같은 데이터는 그대로 넘긴다. 문자열은 React text node로만 들어가 마크업으로 해석되지 않는다.
- 긴 문구는 줄을 자르지 말고 `tileWidth`·`tileHeight`를 키운다.
- 오버레이는 `aria-hidden`이다. 보조기술 사용자에게도 필요한 내용이면 본문에 따로 쓴다.
- `className`·`style`·`ref`를 받지 않는다. 배치는 `layoutStyle`이나 감싸는 요소에서 한다. 오버레이 위치는 `hjm-watermark`의
  `position: relative`에 의존하므로 `@hjmds/react`의 `styles.css`가 필요하다.

## 함정

- SVG는 DOM 콘텐츠라 인쇄에도 나온다. 인쇄 결과는 소비 환경에서 확인한다(계약 문서 기준, HJM이 인쇄를 검증하지 않음).
