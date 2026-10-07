import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Platform, Text as NativeText, TextInput } from "react-native";
import { expect, it } from "vitest";
import { defineHjmDesignProfile, hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";
import { PasswordField, SearchField, TextArea, TextField } from "../src/inputs.js";
import { Combobox } from "../src/forms.js";
import { NumberField } from "../src/number-field.js";
import { Slider } from "../src/slider.js";
import { TagsInput } from "../src/tags-input.js";
import { CodeBlock } from "../src/code-block.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const flatten = (style: unknown): Record<string, unknown> => Array.isArray(style)
  ? Object.assign({}, ...style.map(flatten)) : (style ?? {}) as Record<string, unknown>;
const custom = defineHjmDesignProfile({ extends: "paper", tokens: {
  fontFamily: { ui: ["ProductUI"], code: ["ProductMono"] },
  typography: { body: { fontSize: 19, lineHeight: 30 } },
} });
const mono = () => Platform.OS === "ios" ? "Menlo" : "monospace";

it("keeps each editor and its draft while inherited UI fonts reach raw hosts across ten presets and reset", () => {
  let tree!: ReactTestRenderer;
  const ui = (profile: typeof custom | undefined) => <HjmNativeProvider reducedMotion theme="dark" textScale={2} direction="rtl" {...(profile ? { designProfile: profile } : {})}>
    <HjmNativeProvider>
      <Text>본문</Text>
      <TextField label="필드" />
      <TextArea label="여러 줄" />
      <SearchField label="검색" clearLabel="검색 지우기" busyLabel="검색 중" />
      <PasswordField label="암호" autofillHint="current" revealLabel="보기" concealLabel="숨기기" />
      <TagsInput label="태그" defaultTags={["숲"]} composeRemoveLabel={tag => `${tag} 삭제`} />
      <Combobox label="자동완성" items={[{ id: "a", label: "하나", textValue: "하나" }]} clearLabel="지우기" dismissLabel="닫기" emptyMessage="없음" loadingMessage="검색 중" />
      <NumberField label="숫자" defaultValue={3} min={0} max={10} incrementLabel="증가" decrementLabel="감소" />
      <Slider label="범위" min={0} max={10} defaultValue={4} incrementLabel="높이기" decrementLabel="낮추기" />
      <CodeBlock label="소스" language="TypeScript" code="const 기록 = 1;" />
    </HjmNativeProvider>
  </HjmNativeProvider>;
  try {
    act(() => { tree = create(ui(custom)); });
    const editors = tree.root.findAllByType(TextInput);
    expect(editors).toHaveLength(7);
    for (const input of editors) act(() => input.props.onChangeText(input.props.accessibilityLabel === "숫자" ? "3." : "입력 중인 초안"));
    for (const profile of [custom, ...Object.values(hjmDesignPresets), undefined]) {
      act(() => tree.update(ui(profile)));
      const expectedUI = profile === custom ? "ProductUI" : profile === hjmDesignPresets.terminal ? mono() : undefined;
      const currentEditors = tree.root.findAllByType(TextInput);
      currentEditors.forEach((input, index) => {
        expect(input).toBe(editors[index]);
        expect(input.props.value).toBe(input.props.accessibilityLabel === "숫자" ? "3." : "입력 중인 초안");
        expect(flatten(input.props.style).fontFamily).toBe(expectedUI);
        expect(input.props.allowFontScaling).toBe(false);
      });
      const tagsEditor = tree.root.findByType(TagsInput).findByType(TextInput);
      expect(flatten(tagsEditor.props.style)).toMatchObject({
        fontSize: (profile?.tokens.typography.body.fontSize ?? 14) * 2,
        lineHeight: (profile?.tokens.typography.body.lineHeight ?? 20) * 2,
      });
      const label = tree.root.findAllByType(NativeText).find(node => node.props.children === "본문")!;
      expect(flatten(label.props.style).fontFamily).toBe(expectedUI);
      for (const node of tree.root.findByType(Slider).findAllByType(NativeText)) {
        expect(flatten(node.props.style).fontFamily).toBe(expectedUI);
      }
      for (const node of tree.root.findByType(NumberField).findAllByType(NativeText)) {
        expect(flatten(node.props.style).fontFamily).toBe(expectedUI);
      }
      expect(flatten(tree.root.findByType(NumberField).findByType(TextInput).props.style).fontVariant).toEqual(["tabular-nums"]);
      const code = tree.root.findByType(CodeBlock).findAllByType(NativeText);
      expect(flatten(code.find(node => node.props.children === "TypeScript")!.props.style).fontFamily).toBe(expectedUI);
      expect(flatten(code.find(node => node.props.selectable)!.props.style).fontFamily).toBe(profile === custom ? "ProductMono" : mono());
      expect(tree.root.findByType(NumberField).findByType(TextInput).props.accessibilityValue.now).toBe(3);
    }
  } finally { if (tree) act(() => tree.unmount()); }
});

it.each(["ios", "android"] as const)("translates generic mono fonts on %s and lets a neutral subtree restore its OS UI font", os => {
  const oldOS = Platform.OS;
  Platform.OS = os;
  let tree!: ReactTestRenderer;
  const neutral = defineHjmDesignProfile({ id: "neutral-subtree" });
  try {
    act(() => { tree = create(<HjmNativeProvider reducedMotion designProfile={hjmDesignPresets.terminal}>
      <TextField label="터미널" />
      <HjmNativeProvider designProfile={neutral}>
        <TextField label="중립" /><CodeBlock label="코드" code="const x = 1;" />
      </HjmNativeProvider>
    </HjmNativeProvider>); });
    const fields = tree.root.findAllByType(TextInput);
    expect(flatten(fields.find(node => node.props.accessibilityLabel === "터미널")!.props.style).fontFamily).toBe(os === "ios" ? "Menlo" : "monospace");
    expect(flatten(fields.find(node => node.props.accessibilityLabel === "중립")!.props.style).fontFamily).toBeUndefined();
    expect(flatten(tree.root.findByType(CodeBlock).findAllByType(NativeText).find(node => node.props.selectable)!.props.style).fontFamily).toBe(os === "ios" ? "Menlo" : "monospace");
  } finally {
    if (tree) act(() => tree.unmount());
    Platform.OS = oldOS;
  }
});

it("uses an explicitly registered Inter family even though the neutral web fallback stack starts with Inter", () => {
  const profile = defineHjmDesignProfile({ tokens: { fontFamily: { ui: ["Inter"] } } });
  let tree!: ReactTestRenderer;
  try {
    act(() => { tree = create(<HjmNativeProvider reducedMotion designProfile={profile}>
      <Text>본문</Text><TextField label="편집" />
    </HjmNativeProvider>); });
    expect(flatten(tree.root.findByType(TextInput).props.style).fontFamily).toBe("Inter");
    expect(flatten(tree.root.findAllByType(NativeText).find(node => node.props.children === "본문")!.props.style).fontFamily).toBe("Inter");
  } finally { if (tree) act(() => tree.unmount()); }
});
