import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { Button } from "../src/actions.js";
import { HjmNativeProvider } from "../src/provider.js";
import { PermissionScreen } from "../src/screen-flows.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });

it("renders recheck and the alternative path as footer secondaries in contract order", () => {
  const recheck = vi.fn(), photo = vi.fn();
  const screen = (status: "denied" | "unavailable") => <HjmNativeProvider><PermissionScreen title="카메라" status={status} explanation="안내"
    request={{ label: "허용", onAction: vi.fn() }} settings={{ label: "설정 열기", onAction: vi.fn() }} continueAction={{ label: "계속", onAction: vi.fn() }}
    recheck={{ label: "다시 확인", onAction: recheck }} alternative={{ label: "사진에서 선택", onAction: photo, pending: true }} skip={{ label: "편명으로 등록", onAction: vi.fn() }} /></HjmNativeProvider>;
  act(() => { tree = create(screen("denied")); });
  const buttons = () => tree!.root.findAllByType(Button);
  expect(buttons().map(button => [button.props.children, button.props.tone])).toEqual([
    ["설정 열기", "primary"], ["다시 확인", "secondary"], ["사진에서 선택", "secondary"], ["편명으로 등록", "ghost"],
  ]);
  // A pending alternative shows its own progress and cannot be pressed twice.
  expect(buttons()[2]!.props).toMatchObject({ loading: true, disabled: true });
  act(() => buttons()[1]!.props.onPress());
  expect(recheck).toHaveBeenCalledOnce();
  act(() => tree!.update(screen("unavailable")));
  expect(buttons().map(button => button.props.children)).toEqual(["사진에서 선택", "편명으로 등록"]);
});
