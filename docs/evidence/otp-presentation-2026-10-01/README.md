# OTP presentation — 2026-10-01

`mobile-error.png`: real Web browser at 390×844. Entering 123456 in the underline
input updates the controlled box preview too; the error toggle preserves the value
and changes only the underline/error copy. No horizontal document overflow.
Each preview has one real input; two previews intentionally render two inputs.

Web and Native password/OTP regression suites passed 3 tests each, including both
OTP presentations. Both showcases passed typecheck and registration tests. Build,
API map and document links passed. Native input-module growth measured +360 raw /
+81 gzip bytes, recorded as a targeted budget allowance. The unrelated Native
overlays gzip failure was subsequently resolved; the complete local CI passed as recorded in the [Native integration evidence](../native-visual-integration-2026-10-01/README.md). Physical SMS autofill and Native rendering are pending.

## Native follow-up

On the existing iPhone 17 / iOS 27 simulator, inputting `123456` in the underline field updated both controlled presentations. The accessibility values matched exactly. Toggling the error on/off preserved the completed value. The preview now uses a keyboard-aware ScrollView because the numeric keyboard lacks a return key and large-text actions must remain reachable. See `OtpField-entered`, `OtpField-error` and `OtpField-recovered` in the [Native evidence](../native-visual-integration-2026-10-01/README.md). Physical SMS autofill is still outside this local-input proof.
