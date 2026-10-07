import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, ScrollView, View } from "react-native";
import { expect, it, vi } from "vitest";
import { defineHjmDesignProfile, hjmDesignPresets, type HjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmNativeProvider } from "../src/provider.js";
import { Top } from "../src/top.js";
import { Text } from "../src/primitives.js";
import { topRecipe } from "@hjmds/design-contracts/components/top";
import { FilePicker } from "../src/file-picker.js";
import { UploadItem } from "../src/upload-item.js";
import { TransferList } from "../src/transfer-list.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// The shared Native host mock keeps style arrays intact; inspect the host cascade here.
const flatten = (style: unknown): Record<string, unknown> => Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : (style ?? {}) as Record<string, unknown>;

it("follows nearest corners across theme changes without resetting upload actions, picker availability or selection", async () => {
  let tree!: ReactTestRenderer; const retry = vi.fn(); const move = vi.fn();
  const pick = vi.fn(async () => [{ id: "photo", name: "photo.png", mimeType: "image/png", sizeBytes: 10 }]);
  const selected = vi.fn(); const pickError = vi.fn();
  const content = <>
    <FilePicker descriptor={{ accept: ["image/*"] }} label="Files" buttonLabel="Pick" onPick={pick} onPickError={pickError} onSelect={selected} />
    <FilePicker descriptor={{}} label="Locked files" buttonLabel="Locked" onPick={pick} onPickError={pickError} onSelect={selected} disabled />
    <UploadItem descriptor={{ id: "archive", name: "archive.zip", state: { status: "error", message: "Failed" } }} labels={{ pending: "Pending", uploading: "Uploading", success: "Done", cancel: "Cancel", retry: "Retry" }} onRetry={retry} />
    <TransferList items={[{ id: "one", label: "Permission", textValue: "Permission" }]} labels={{ source: "Available", target: "Selected", toTarget: "Add", toSource: "Remove", selectAll: "All", empty: "Empty" }} onMove={move} />
  </>;
  const render = (profile: HjmDesignProfile | undefined, theme: "light" | "dark") => <HjmNativeProvider designProfile={hjmDesignPresets.forest} theme={theme} textScale={1} reducedMotion>
    <HjmNativeProvider designProfile={profile ?? hjmDesignPresets.neutral}><HjmNativeProvider>{content}</HjmNativeProvider></HjmNativeProvider>
  </HjmNativeProvider>;
  const action = (label: string) => tree.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === label)!;
  try {
    act(() => { tree = create(render(undefined, "light")); });
    act(() => action("Permission").props.onPress());
    const permission = action("Permission"); const trigger = action("Pick");
    const product = defineHjmDesignProfile({ id: "product-corners", tokens: { radius: { md: 29 } } });
    for (const theme of ["light", "dark"] as const) for (const profile of [...Object.values(hjmDesignPresets), product, undefined]) {
      act(() => tree.update(render(profile, theme)));
      const expected = profile?.tokens.radius.md ?? 12;
      expect(action("Permission")).toBe(permission);
      expect(permission.props.accessibilityState.checked).toBe(true);
      expect(action("Locked").props.disabled).toBe(true);
      const pickerStyle = flatten(trigger.props.style({ pressed: false }));
      expect(pickerStyle.borderRadius).toBe(expected); expect(pickerStyle.minHeight).toBeGreaterThanOrEqual(44);
      const upload = tree.root.findByType(UploadItem).findAllByType(View).find(node => flatten(node.props.style)?.minHeight === 68)!;
      expect(flatten(upload.props.style).borderRadius).toBe(expected);
      for (const panel of tree.root.findAllByType(ScrollView)) expect(flatten(panel.props.style).borderRadius).toBe(expected);
    }
    act(() => action("Retry").props.onPress()); expect(retry).toHaveBeenCalledWith("archive");
    await act(async () => action("Locked").props.onPress()); expect(pick).not.toHaveBeenCalled();
    await act(async () => trigger.props.onPress()); expect(selected).toHaveBeenCalledWith(expect.objectContaining({ accepted: [expect.objectContaining({ id: "photo" })] })); expect(pickError).not.toHaveBeenCalled();
    act(() => action("Add").props.onPress()); expect(move).toHaveBeenCalledWith(["one"], "toTarget");
    expect(tree.root.findAllByType(ScrollView).find(node => node.props.accessibilityLabel === "Selected")!.findAllByType(Pressable).some(node => node.props.accessibilityLabel === "Permission")).toBe(true);
    // An absent profile keeps the existing numeric frame even outside a preset hierarchy.
    act(() => tree.update(<HjmNativeProvider textScale={1}>{content}</HjmNativeProvider>));
    expect(flatten(action("Pick").props.style({ pressed: false })).borderRadius).toBe(12);
  } finally { if (tree) act(() => tree.unmount()); }
});

it("resolves Top visual metrics and display family from the closest profile without replacing its action host", () => {
  let tree!: ReactTestRenderer; const actionPress = vi.fn();
  let actionHost: ReturnType<ReactTestRenderer["root"]["find"]> | undefined;
  const product = defineHjmDesignProfile({ id: "top-product", tokens: { heading: { level2: { fontSize: 35, lineHeight: 45, fontWeight: "500" } }, typography: { titleLarge: { fontSize: 23, lineHeight: 33, fontWeight: "600" } }, fontFamily: { display: ["Georgia"] } } });
  const content = <><Top descriptor={{ title: "Large title", size: "large", headingLevel: 3 }} trailing={<Pressable accessibilityLabel="Title action" onPress={actionPress}><Text>Action</Text></Pressable>} /><Top descriptor={{ title: "Medium title", size: "medium", headingLevel: 2 }} /></>;
  try {
    for (const profile of [product, hjmDesignPresets.editorial, hjmDesignPresets.neutral, undefined]) {
      const ui = <HjmNativeProvider textScale={1}><HjmNativeProvider {...(profile ? { designProfile: profile } : {})}>{content}</HjmNativeProvider></HjmNativeProvider>;
      act(() => { if (tree) tree.update(ui); else tree = create(ui); });
      const currentAction = tree.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === "Title action")!;
      if (!actionHost) actionHost = currentAction;
      expect(currentAction).toBe(actionHost);
      const titles = tree.root.findAllByType(Text).filter(node => node.props.accessibilityRole === "header");
      for (const [index, size] of ["large", "medium"].entries()) {
        const metrics = profile ? size === "large" ? profile.tokens.heading.level2 : profile.tokens.typography.titleLarge : topRecipe.sizes[size as "large" | "medium"].title;
        expect(flatten(titles[index]!.props.style)).toMatchObject(metrics);
      }
      expect(tree.root.findAll(node => typeof node.type === "string" && node.props.accessibilityRole === "header").map(node => flatten(node.props.style).fontFamily)).toEqual(profile?.tokens.fontFamily.display ? ["Georgia", "Georgia"] : [undefined, undefined]);
    }
    const action = tree.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === "Title action")!;
    act(() => action.props.onPress()); expect(actionPress).toHaveBeenCalledOnce();
  } finally { if (tree) act(() => tree.unmount()); }
});
