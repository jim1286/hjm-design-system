# Affix — Web 상단 고정

2026-09-30: 사용자의 구현 요청으로 기존 수요 대기 결정을 대체한다. `position: fixed`로 복제/이동하면
초점과 폼 상태를 잃거나 폭을 다시 측정해야 하므로 CSS sticky로 원래 DOM과 문서 흐름을 유지한다.
JS는 고정 상태 관측과 화면보다 큰 콘텐츠의 해제에만 사용한다.

`@hjmds/react/affix`의 `Affix`는 `children`, `offset`(기본 0, 유한한 비음수 CSS px),
`disabled`, `onChange(affixed)`를 받는다. 가장 가까운 스크롤 조상의 상단에서 offset만큼 떨어져
고정된다. 부모의 끝에서 해제된다. 부모에 스크롤할 공간이 있어야 하며, 부모의 overflow 설정은
CSS sticky의 기준을 바꾼다. 부모 자체가 콘텐츠와 같은 높이면 고정 구간이 없다.

- `onChange`는 최초 상태와 이후 상태 전환에 호출한다. 렌더링마다 호출하지 않는다.
- 스크롤·리사이즈는 animation frame으로 모아 측정하고 unmount 시 observer/listener/frame을 해제한다.
- 콘텐츠가 스크롤 영역 높이에서 offset을 뺀 값보다 크면 일반 흐름으로 돌려 가려진 영역이 없게 한다.
- disabled/offset 변경에도 자식을 재마운트하지 않아 입력값·초점이 유지된다.
- 상단 고정만 지원하며 bottom 고정·portal·다중 sticky 영역 자동 충돌 조정은 제공하지 않는다.
- 별도 role이나 live announcement를 강제하지 않는다. 자식 의미·접근성 이름은 제품이 소유한다.

```tsx
<Affix offset={16} onChange={setPinned}>
  <Button onClick={save}>{t('form.save')}</Button>
</Affix>
```

계약: [affix.ts](../src/affix.ts). UI: [renderer](../../react/src/affix.tsx).
사용 예제: [Web additions](../../../showcase/web/src/patterns/WebAdditions.stories.tsx).
검증: [브라우저 스크롤·초점 회귀](../../react/test/web-additions.browser.test.tsx).
