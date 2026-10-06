# QRCode

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [QRCode](../../qr-code.md), `src/qr-code-recipe.ts`(`qrCodeRecipe`)
- 스토리북: `배포/컴포넌트/데이터 표시/큐알 코드`

## 언제 쓰나

문자열(초대 링크, 연결 코드, 결제·체크인 URL)을 다른 기기의 카메라로 스캔하게 할 때 쓴다.
QR을 찍을 수 없는 사용자를 위한 대체 행동(링크 복사, 코드 직접 입력)을 항상 같이 둔다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 서버가 만든 QR 이미지를 그대로 보여 줌 | [Image](image.md) |
| 짧은 코드를 사람이 읽고 입력함 | [Text](text.md), 입력 쪽은 [OTPField](otp-field.md) |
| 링크를 눌러 이동 | [Link](link.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `QRCode` | 기본(root에서는 내보내지 않는다) | `/qr-code` | `/qr-code` |

granular subpath로만 가져온다. 이 subpath는 optional peer를 import 한다.

### 필요한 peer

정확한 버전, `peerDependenciesMeta` optional.

- Web: `qrcode-generator` 2.0.4
- Native: `qrcode-generator` 2.0.4, `react-native-svg` 15.15.5(native 모듈, dev client 재빌드 필요)

## 최소 사용 예

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { QRCode } from "@hjmds/react/qr-code";
import { Stack } from "@hjmds/react/layout";
import { spacing } from "@hjmds/design-contracts/foundations";

<QRCode
  value={inviteUrl}
  label={t("invite.qrLabel")}
  fallback={<Stack layoutStyle={{ marginTop: spacing.md }}><Button tone="secondary" onClick={copyLink}>{t("invite.copyLink")}</Button></Stack>}
/>
```

```tsx
// Native
import { Button } from "@hjmds/react-native/actions";
import { QRCode } from "@hjmds/react-native/qr-code";
import { Stack } from "@hjmds/react-native/primitives";
import { spacing } from "@hjmds/design-contracts/foundations";

<QRCode
  value={inviteUrl}
  label={t("invite.qrLabel")}
  size={224}
  fallback={<Stack layoutStyle={{ marginTop: spacing.md }}><Button tone="secondary" onPress={copyLink}>{t("invite.copyLink")}</Button></Stack>}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | 문자열 | 필수 | 비면 `TypeError`, 용량 초과는 `RangeError` |
| `label` | 문자열 | 필수 | 접근성 이름 |
| `fallback` | `ReactNode` | 필수 | QR 아래에 그려지는 대체 행동(`null`·`false`면 `TypeError`) |
| `size` | 숫자(px) | `192` | 실제 크기는 모듈 수의 정수배로 내림된다. 모듈당 2px 미만이면 `TypeError` |
| `level` | `L` · `M` · `Q` · `H` | `M` | 오류 정정 수준 |
| `layoutStyle` | 배치 전용 style 객체 | — | 루트 배치만(Native는 미게시(1.12.1 이후)) |

콜백은 없다. `style`·`className`은 두 renderer 모두 없다. 1.12.1 Native는 `layoutStyle`이 없어 감싸는 레이아웃에서 배치한다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 기본 192×192. 실제 변은 (모듈 수 + 여백 4모듈×2)의 정수배로 내림돼 `size`보다 조금 작을 수 있다. 모듈당 최소 2px. 흰 여백 4모듈이 그림 안에 포함되므로 바깥에 흰 테두리를 또 두르지 않는다 | `qrCodeRecipe.quietZone`·`minModuleSize`, `qr-code.tsx` |
| 간격 | QR과 `fallback` 사이 간격을 컴포넌트가 주지 않는다(Web CSS 없음, Native는 감싼 `View`만). `fallback` 슬롯 안의 [Stack](stack.md)에 `layoutStyle={{ marginTop: spacing.md }}`로 16을 준다. QRCode 바깥 Stack은 내부 두 요소의 간격을 바꿀 수 없다 | `packages/react/src/qr-code.tsx`, `packages/react-native/src/qr-code.tsx` |
| 순서·정렬 | QR 위, `fallback` 바로 아래. 가운데 정렬은 감싸는 레이아웃이 한다 | 같은 파일 |
| 고정·스크롤 | 고정되지 않는다. 카드·시트 본문 안에 둔다 | — |
| 좁은 폭·큰 글자 | 좁은 폭에서 `size`를 화면 폭보다 크게 두지 않는다. 큰 글자에서도 QR 크기는 그대로이고 `fallback`만 커진다 | — |

```text
┌──────────────────────┐
│      ┌────────┐      │
│      │ ▓▒▓▒▓▒ │ 192  │  ← 흰 여백 4모듈 포함
│      └────────┘      │
│    (fallback marginTop md)      │
│    [ 링크 복사 ]     │  ← fallback (필수)
└──────────────────────┘
```

## 꼭 지킬 것

- 앱에 peer가 설치돼 있는지 먼저 확인한다. 없으면 tsc·lint·단위 테스트는 통과하지만 기기 Metro 번들에서
  `Unable to resolve module`로 죽는다(2026-10 utilverse, celebration 등 같은 부류 subpath 포함).
  확인: `grep 'from "' node_modules/@hjmds/react-native/dist/qr-code.js`와 앱 `package.json` 비교.
- `label`이 비었거나 `fallback`이 없거나(`null`/`false`) `size`가 모듈당 2px 미만이면 렌더 중
  `TypeError`를 던진다. 빈 `value`·잘못된 `level`도 `TypeError`, 용량 초과는 `RangeError`다.
  사용자 입력을 그대로 넣는 화면이면 error boundary 또는 길이 제한을 둔다.
- 색은 테마와 무관하게 검정 모듈·흰 배경·4모듈 여백으로 고정된다. 브랜드 색·로고를 얹지 않는다.
- 만료·인증·목적지 권한은 서버(제품) 소유다. QR 컴포넌트는 인코딩만 보증한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 그리기 | 인라인 `<svg role="img">` | `react-native-svg`, 감싼 `View`가 `accessibilityRole="image"` |
| 필요한 peer | `qrcode-generator` | `qrcode-generator`, `react-native-svg` |
| 배치 | `layoutStyle` | `layoutStyle`(미게시(1.12.1 이후), 1.12.1은 감싸는 View) |

- 2026-10-06 독립 재구현에서 QRCode 바깥 Stack의 gap으로 내부 QR–fallback 간격을 바꿀 수 없음을 확인해 슬롯 안 여백 예제로 수정했다.
