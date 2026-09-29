# Watermark — Web 반복 텍스트

2026-09-30: 사용자의 구현 요청으로 기존 수요 대기 결정을 대체한다. 외부 이미지·canvas 의존성을
추가하지 않고 inline SVG pattern으로 텍스트 타일을 반복한다. 문자열을 HTML이나 SVG 소스로
삽입하는 대신 React text node를 사용하여 임의 마크업이 실행되지 않게 한다.

`@hjmds/react/watermark`의 `Watermark`는 `text`(문자열 또는 1–3줄 배열)와 `children`을 받는다.
각 줄은 1–120글자다. `tileWidth`(기본 240, 최소 80), `tileHeight`(160, 최소 60),
`rotate`(-22°, -90~90), `opacity`(0.12, 0~1)를 조절할 수 있다. 기본 기하는 계약 recipe가 소유한다.
긴 표식은 큰 타일을 지정한다. 텍스트 색상은 HJM textSub 토큰을 따른다.

오버레이는 접근성 트리에서 제외하고 포인터·텍스트 선택을 가로채지 않는다. 중요한 출처/보안
고지는 읽을 수 있는 본문으로도 제공한다. 여러 인스턴스는 고유 pattern ID를 사용한다.
SVG는 인쇄에도 포함되는 DOM 콘텐츠다. 인쇄 설정별 결과는 소비 환경에서 확인한다.
이는 장식용 출처 표시이며 스크린샷 방지·삭제 방지·정보 유출 방지 기능이 아니다.
이미지 워터마크와 다운로드 파일에 삽입하는 인코딩 기능은 제공하지 않는다.

```tsx
<Watermark text={[t('document.draft'), projectName]}>
  <DocumentPreview />
</Watermark>
```

계약: [watermark.ts](../src/watermark.ts). UI: [renderer](../../react/src/watermark.tsx).
사용 예제: [Web additions](../../../showcase/web/src/patterns/WebAdditions.stories.tsx).
검증: [계약 회귀](../test/web-additions.test.ts), [브라우저 동작](../../react/test/web-additions.browser.test.tsx).
