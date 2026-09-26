# Stable Core

## 1.5.0 승격

다음 13개를 stable로 올렸습니다: `Text`, `Icon`, `Stack`, `Container`, `DesignSystemProvider`,
`IconButton`, `Badge`, `Card`, `Tag`, `Notice`, `Progress`, `Spinner`, `Skeleton`.

- 근거: 1.5.0에서 renderer 시나리오 증거를 이름뿐인 검사에서 실제 검사로 바꿨습니다
  (Web `test/scenario-matrix.browser.test.tsx`, Native `test/scenario-matrix.test.tsx`). 두 renderer에서
  요구 시나리오가 모두 통과하고 세 제품 이상이 쓰는 컴포넌트만 올렸습니다.
- 이 전환으로 Web의 "모든 시나리오 증거 완비"는 33개에서 16개로 줄었다가 승격 대상 보강 뒤
  24개가 됐습니다. 줄어든 것은 이전 수치가 과대 표시였기 때문입니다.
- 아이콘·로딩 표시·구분선처럼 보이는 글자 슬롯이 없는 컴포넌트는 long-copy 요구에서 뺐습니다
  (`showcase.ts`의 `textlessComponentNames`).
- keyboard·platform-parity를 요구하는 컴포넌트(Checkbox, Switch, Dialog, Sheet 등)는 그 증거가
  아직 없어 beta로 남습니다. 생성된 evidence 문서의 "Missing required scenarios"가 남은 일입니다.

## 0.8 첫 stable slice

첫 renderer stable slice는 `Surface`, `Button`, `Field`, `TextArea`다. 이 네 컴포넌트는
계약이 이미 stable이고 Web/RN renderer가 같은 public intent를 실행한다.

## 승격 증거

- 두 surface의 default·dark·long copy·large text·RTL·reduced motion·accessibility matrix
- `Field` Web label activation, native Tab stop, invalid description linkage
- Native `Field` host control의 focus/setText action과 accessible name/hint
- package granular export와 bundle graph boundary
- canonical Web/Native Showcase renderer

`Surface`, `Button`, `TextArea`는 추가 keyboard model을 발명하지 않고 host semantics를
그대로 사용한다. `Field`만 공통 behavior가 있으므로 dedicated keyboard/host-action proof를
연결한다.

## stable이 보장하지 않는 것

- 제품의 폼 validation 정책이나 서버 오류 번역
- arbitrary style override 또는 모든 브랜드 palette
- 모든 OS·브라우저 조합의 영구 호환
- 제품이 전달한 copy, URL, file의 신뢰성

새 회귀가 발견되면 stable 표면을 조용히 beta로 낮추지 않는다. patch에서 회귀를 고치거나,
API 변경이 필요하면 Changeset과 migration을 함께 제공한다.
