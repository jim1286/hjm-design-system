import { useState } from "react";
import { Pressable, TextInput } from "react-native";
import { act, create } from "react-test-renderer";
import { beforeEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { Mentions, type MentionCandidate } from "../src/mentions.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

export const mentionsNativeActionCases = [{ componentId: "mentions" }] as const;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
});

it("reports the caret query after commit and inserts the chosen candidate without losing the suffix", async () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/mentions-actions.test.tsx")?.scenarios.map(({ id }) => id)).toEqual(expect.arrayContaining(["native-actions", "long-copy"]));
  const errors: string[] = [];
  const consoleError = vi.spyOn(console, "error").mockImplementation((...args) => {
    errors.push(args.map(String).join(" "));
  });
  const candidate: MentionCandidate = { id: "mina", label: "미나" };

  function Harness() {
    const [value, setValue] = useState("@mi 뒤 문장");
    const [query, setQuery] = useState("");
    const candidates = query === "mi" ? [candidate] : [];
    return (
      <HjmNativeProvider>
        <Mentions
          accessibilityLabel="메모"
          value={value}
          onValueChange={setValue}
          triggers={[{ id: "person", trigger: "@" }]}
          candidates={candidates}
          onMentionQueryChange={(match) => setQuery(match?.query ?? "")}
          emptyMessage="결과가 없어요"
          listLabel="추천 대상"
        />
      </HjmNativeProvider>
    );
  }

  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<Harness />); });
  const input = renderer!.root.findByType(TextInput);
  await act(async () => input.props.onSelectionChange({ nativeEvent: { selection: { start: 3, end: 3 } } }));

  const list = renderer!.root.find((node) => node.props.accessibilityRole === "list");
  expect(list.props.accessibilityLabel).toBe("추천 대상");
  const option = renderer!.root.findByType(Pressable);
  expect(option.props.accessibilityRole).toBe("button");
  expect(option.props.accessibilityLabel).toBe("미나");
  await act(async () => option.props.onPress());
  expect(renderer!.root.findByType(TextInput).props.value).toBe("@미나  뒤 문장");
  expect(errors.join("\n")).not.toContain("Cannot update a component");
  act(() => renderer!.unmount());
  consoleError.mockRestore();
});
