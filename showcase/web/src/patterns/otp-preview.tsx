import { useState } from "react";
import { OtpField } from "@hjmds/react/forms";
import { Stack, Text } from "@hjmds/react/layout";
import { PreviewTools, PreviewToolButton } from "./preview-tools";
import { otpPreviewExample as copy } from "../../../shared/component-examples.js";

// The error toggle is a demo control, so it sits under 미리보기 도구 instead of reading as a product action (2026-10-17).
export function OtpPreview() {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  return <Stack gap="xl">
    <Text>{copy.intro}</Text>
    <OtpField label={copy.cardLabel} length={copy.length} value={value} onValueChange={setValue} />
    <OtpField label={copy.underlineLabel} presentation="underline" length={copy.length} value={value} onValueChange={setValue} {...(error ? { error: copy.error } : {})} />
    <Text>{value.length === copy.length ? copy.complete : copy.incomplete}</Text>
    <PreviewTools><PreviewToolButton selected={error} onClick={() => setError(!error)}>{copy.showError}</PreviewToolButton></PreviewTools>
  </Stack>;
}
