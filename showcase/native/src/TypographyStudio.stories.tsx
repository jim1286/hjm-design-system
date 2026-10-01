import { PatternStatus } from "./pattern-status";
import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { ScrollView } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { TextField } from "@hjmds/react-native/inputs";
import { Button } from "@hjmds/react-native/actions";
import { CodeBlock } from "@hjmds/react-native/code-block";
import { typographyCopy as copy } from "../../shared/typography-studio";
// Expo owns process-lifetime registration. Reuse names per URI instead of leaking a new family on retry.
const candidateFamilies = new Map<string, string>();
function TypographyStudio() {
  const [uri, setUri] = useState(""); const [source, setSource] = useState(""); const [license, setLicense] = useState("");
  const [family, setFamily] = useState<string>(); const [status, setStatus] = useState<"empty" | "loading" | "ready" | "error">("empty");
  const sequence = useRef(0);
  useEffect(() => () => { sequence.current++; }, []);
  const clear = () => { sequence.current++; setFamily(undefined); setStatus("empty"); };
  async function load() {
    const id = ++sequence.current; setFamily(undefined); setStatus("loading");
    try {
      const address = uri.trim();
      if (!/^(https?:\/\/|file:\/\/)/.test(address)) throw new Error("Font URI required");
      // A guarded require stays in the Metro bundle without eager native-module execution.
      // Dynamic import produced an unknown-module error in the installed development host.
      const Font = require("expo-font") as typeof import("expo-font");
      let name = candidateFamilies.get(address);
      if (!name) { name = `HjmTypographyCandidate${candidateFamilies.size + 1}`; candidateFamilies.set(address, name); }
      await Font.loadAsync(name, { uri: address });
      if (!Font.isLoaded(name)) throw new Error("Font registration incomplete");
      if (sequence.current !== id) return;
      setFamily(name); setStatus("ready");
    } catch { if (sequence.current === id) { setFamily(undefined); setStatus("error"); } }
  }
  // Both studios edit text before an action; keep controls reachable above the iOS keyboard,
  // especially at 200% text size, instead of requiring an unavailable number-pad dismiss key.
  return <ScrollView automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ padding: spacing.lg }}><Stack gap="xl">
    <Text variant="heading">{copy.title}</Text><Text>{copy.intro}</Text>
    <TextField label="폰트 파일 주소" value={uri} onValueChange={setUri} keyboardType="url" autoCapitalize="none" autoCorrect={false}/>
    <Text tone="muted">사용 권한이 있는 OTF·TTF 파일의 주소 또는 이 기기의 파일 주소를 입력하세요.</Text>
    <Button disabled={status === "loading"} onPress={() => void load()}>서체 불러오기</Button>
    <PatternStatus>{copy[status]}</PatternStatus>
    <TextField label={copy.source} value={source} onValueChange={setSource}/>
    <TextField label={copy.license} value={license} onValueChange={setLicense}/>
    {([false, true] as const).map(candidate => <Surface key={String(candidate)} padding="lg"><Stack gap="md">
      <Text emphasis="strong">{candidate ? copy.candidate : copy.fallback}</Text>
      <Text variant="heading" style={candidate && family ? { fontFamily: family } : undefined}>{copy.sample}</Text>
      <Text style={candidate && family ? { fontFamily: family } : undefined}>{copy.body}</Text>
      <Text emphasis="strong" style={candidate && family ? { fontFamily: family } : undefined}>{copy.body}</Text>
    </Stack></Surface>)}
    <Button tone="ghost" onPress={clear}>{copy.reset}</Button>
    <CodeBlock label="서체 후보 설정" code={JSON.stringify({ family: family ?? null, status, source, license }, null, 2)} wrap/>
    <Text tone="muted">폰트 등록이 끝난 뒤에만 비교 서체를 표시해요. 초기화하면 기본 서체로 돌아가며, 등록된 폰트는 앱을 종료할 때까지 유지됩니다.</Text>
  </Stack></ScrollView>;
}
const meta = { title: "배포/토큰/글꼴 편집", component: TypographyStudio } satisfies Meta<typeof TypographyStudio>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
