# Icon contract

`Icon`은 Lucide 같은 외부 아이콘 패키지를 public API로 노출하지 않습니다. HJM의 semantic
name을 제품 adapter가 Web SVG 또는 React Native glyph로 번역해, 아이콘 패키지를 바꾸어도
화면의 의미와 크기·색·stroke 문법은 유지합니다.

- 기본 icon은 장식입니다. 주변 label이나 button accessible name이 같은 의미를 이미 전달하면
  Web은 accessibility tree에서 숨기고 RN은 `accessible={false}`로 렌더링합니다.
- icon 자체만 정보를 전달할 때만 `decorative: false`와 현지화된 `accessibilityLabel`을 함께
  사용합니다. 이 경우 대비가 약한 `decorative` tone은 허용하지 않습니다.
- icon-only action의 이름은 Icon이 아니라 바깥 `IconButton`/Link가 소유합니다. 예를 들어
  돋보기 모양을 “돋보기”라고 읽지 않고 button이 “검색” 동작을 읽습니다.
- `back`, `forward`, `chevronStart`, `chevronEnd`는 논리 방향이므로 RTL에서 mirror합니다.
  위/아래·상태·미디어 icon은 고정 방향입니다.
- renderer는 recipe의 glyph size, semantic tone, regular/strong stroke, round cap/join을 모두
  소비하고 임의 `size`, `color`, `strokeWidth`로 정체성을 우회하지 않습니다. 제품 팀 색처럼
  검증된 도메인 색은 제품 adapter가 별도 product icon contract로 제한합니다.
- `inverse` tone은 brand/danger처럼 `onPrimary` 대비가 검증된 어두운 fill 위에서만 사용합니다.
  일반 canvas/surface 위의 정보 icon에는 사용할 수 없습니다.

WAI의 기준처럼 주변 텍스트와 중복되는 그림은 장식으로 숨기고, 기능을 단독으로 전달하는
그림은 모양 이름이 아니라 동작/목적을 접근성 이름으로 제공합니다.
