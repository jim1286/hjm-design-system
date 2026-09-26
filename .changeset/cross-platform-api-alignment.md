---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

같은 의도가 Web과 Native에서 다른 이름·모양이던 API를 맞춥니다. 모두 추가 변경이며 기존 이름은 1.x 동안 유지합니다.

- `HjmProvider`·`HjmNativeProvider`에 `brandPalette` prop을 추가합니다. 이전에는 브랜드를 넣으려면 전체 `value`를
  직접 만들어야 했고, 그러면 Provider가 OS theme·글자 크기·모션 설정 관찰을 멈췄습니다. 중첩 Provider는
  가장 가까운 상위의 브랜드를 물려받습니다. 브랜드 경계 규칙은 `docs/brand-boundary.md`입니다.
- Web `TextField`에 `onValueChange(value)`를 추가합니다. Native `TextField`·Web `TextArea`와 같은 이름·모양이며 DOM `onChange`도 계속 호출됩니다.
- Native field류에 `description`을 추가합니다(Web과 같은 이름). `supportText`는 deprecated alias로 남습니다.
- Native `useToastRegion()`에 `publish`를 추가합니다(Web `useToast().publish`와 contract store와 같은 이름). `show`는 deprecated alias로 남습니다.
- Web `Sheet`에 recipe의 `size`(auto·medium·large·full)를 추가합니다. Native에는 이미 있었습니다. 사용자가 높이를 바꾸는 `detents`가 있으면 `activeDetent`가 우선합니다.
