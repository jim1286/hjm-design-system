# QRCode 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [QRCode](../qr-code.md), recipe `qrCodeRecipe`(`src/qr-code-recipe.ts`)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `QRCode` | `/qr-code` | `/qr-code` | 기본. root에서는 내보내지 않는다 |

granular subpath로만 가져온다. 이 subpath는 optional peer를 import 한다.

| renderer | 필요한 peer(정확한 버전, `peerDependenciesMeta` optional) |
| --- | --- |
| Web | `qrcode-generator` 2.0.4 |
| Native | `qrcode-generator` 2.0.4, `react-native-svg` 15.15.5(native 모듈, dev client 재빌드 필요) |

## 최소 사용 예

```tsx
// Web
import { QRCode } from "@hjmds/react/qr-code";

<QRCode
  value={inviteUrl}
  label={t("invite.qrLabel")}
  fallback={<Button tone="secondary" onClick={copyLink}>{t("invite.copyLink")}</Button>}
/>
```

```tsx
// Native
import { QRCode } from "@hjmds/react-native/qr-code";

<QRCode
  value={inviteUrl}
  label={t("invite.qrLabel")}
  size={224}
  fallback={<Button tone="secondary" onPress={copyLink}>{t("invite.copyLink")}</Button>}
/>
```

## 축과 기본값

- `value`(필수), `label`(필수, 접근성 이름), `fallback`(필수, QR 아래에 그려지는 대체 행동).
- `size`: 기본 `192`. 실제 크기는 모듈 수의 정수배로 내림된다.
- `level`: 오류 정정 `L` · `M`(기본) · `Q` · `H`.
- Props는 이 다섯 개뿐이다. `style`·`className`·`layoutStyle`은 없다. 배치는 감싸는 레이아웃에서 한다.

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
