# Stable Core 0.8

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
