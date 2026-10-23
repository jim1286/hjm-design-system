import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, Text } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { IconButton, IconButtonLink, type IconButtonLinkRenderProps } from "../src/actions.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });
function flat(style: unknown): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : style && typeof style === "object" ? style as Record<string, unknown> : {};
}
const resolveStyle = (style: unknown) => flat(typeof style === "function" ? style({ pressed: false }) : style);
const settings = { kind: "internal", href: "/settings" } as const;

it("navigates as a link with the IconButton frame and paints the current screen like a selected IconButton", () => {
  const onNavigate = vi.fn();
  act(() => { tree = create(<HjmNativeProvider>
    <IconButtonLink label="설정" shape="circle" destination={settings} onNavigate={onNavigate} current><Text>⚙</Text></IconButtonLink>
    <IconButton label="설정" shape="circle" selected onPress={() => {}}><Text>⚙</Text></IconButton>
  </HjmNativeProvider>); });
  const [link, button] = tree!.root.findAllByType(Pressable);
  expect(link!.props).toMatchObject({ accessibilityRole: "link", role: "link", accessibilityLabel: "설정" });
  expect(link!.props.accessibilityState).toMatchObject({ selected: true, disabled: false });
  expect(resolveStyle(link!.props.style)).toEqual(resolveStyle(button!.props.style));
  act(() => link!.props.onPress());
  expect(onNavigate).toHaveBeenCalledWith(settings);
});

it("hands the prepared control to a router link and blocks a disabled destination", () => {
  const rendered: IconButtonLinkRenderProps[] = [];
  const renderLink = (props: IconButtonLinkRenderProps) => {
    rendered.push(props);
    const { destination: _destination, ...pressable } = props;
    return <Pressable {...pressable} testID="router-link" />;
  };
  act(() => { tree = create(<HjmNativeProvider>
    <IconButtonLink label="설정" destination={settings} renderLink={renderLink}><Text>⚙</Text></IconButtonLink>
  </HjmNativeProvider>); });
  expect(rendered[0]).toMatchObject({ destination: settings, accessibilityRole: "link", accessibilityLabel: "설정", disabled: false });
  expect(tree!.root.findAll((node) => node.props.testID === "router-link" && typeof node.type !== "string")).toHaveLength(1);

  const onNavigate = vi.fn();
  act(() => tree!.update(<HjmNativeProvider>
    <IconButtonLink label="설정" destination={settings} onNavigate={onNavigate} disabled><Text>⚙</Text></IconButtonLink>
  </HjmNativeProvider>));
  const link = tree!.root.findByType(Pressable);
  expect(link.props.disabled).toBe(true);
  act(() => link.props.onPress());
  expect(onNavigate).not.toHaveBeenCalled();
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => act(() => { create(<HjmNativeProvider><IconButtonLink label="설정" destination={settings}><Text>⚙</Text></IconButtonLink></HjmNativeProvider>); }))
    .toThrow(/renderLink or onNavigate/);
  consoleError.mockRestore();
});
