---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Skeleton: 펄스를 기본값으로 켜고, native renderer가 recipe를 실제로 소비하게 한다.

`skeletonRecipe.defaults.animated`를 `false`에서 `true`로 바꾼다. 정지한 회색 블록은
로딩이 아니라 깨진 화면으로 읽힌다는 보고가 BurnTok 웹 피드에서 나왔고, 그 자리는
결국 소비 앱이 매번 `animated`를 켜서 쓰고 있었다. `reducedMotion: "static"`은 그대로라
접근성 기본값은 이 전환으로 바뀌지 않는다.

React Native `Skeleton`은 지금까지 recipe의 shape도 animation도 읽지 않고 높이 16의
정지 View만 그렸다. 같은 recipe를 쓰는 web renderer와 표현이 갈려 있었다. 이제 recipe의
shape·배경·opacity 구간을 그대로 소비하고, `environment.reducedMotion`이 아닐 때만
펄스를 돌린다. 새 의존성은 추가하지 않았다 (`Animated` 사용).

React renderer는 원 지름·펄스 길이·곡선·opacity 구간을 provider가 내보내는
`--hjm-skeleton-*` 변수로 읽는다. 그 값들이 stylesheet에 literal로 박혀 있는 동안에는
recipe를 바꿔도 CSS가 따라오지 않았고, 게이트는 이 파일을 텍스트로만 읽어 드리프트를
잡지 못한다.

## 소비 측 migration

- **`animated`를 끄고 싶은 자리**: `<Skeleton animated={false} />`로 명시한다.
  기존에 `animated`를 지정하지 않던 skeleton은 이제 펄스가 돈다.
- **React**: `--hjm-skeleton-*` 변수는 `HjmProvider`가 내보낸다. provider 밖에서
  `.hjm-skeleton`을 직접 렌더하던 곳이 있으면 provider 안으로 넣는다.
- **React Native**: `width`/`height`/`radius`는 그대로 동작하며 `shape`보다 우선한다.
  세 값을 모두 생략하던 호출부는 기본 높이가 16에서 `shape="block"`의 recipe 값(32)으로
  바뀌므로 확인이 필요하다. 포트폴리오 안에서는 taground `around` 화면이 유일한
  호출부이고 `height`/`radius`를 명시하고 있어 영향이 없다.
