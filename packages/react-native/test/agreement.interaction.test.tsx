import { act, create } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { Agreement, HjmNativeProvider } from "../src/index.js";
import type { AgreementDescriptor } from "@hjmds/design-contracts/components/agreement";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

export const agreementNativeActionCases = [{ componentId: "agreement" }] as const;

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const descriptor: AgreementDescriptor = {
  accessibilityLabel: "가입 약관",
  allLabel: "전체 동의",
  items: [
    { id: "terms", label: "서비스 이용약관", required: true, detail: { label: "전문 보기" } },
    { id: "news", label: "소식 받기" },
  ],
};

it("toggles native consent through checkbox host actions and opens details without consenting", () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/agreement.interaction.test.tsx")?.scenarios.map(({ id }) => id)).toContain("native-actions");
  const onCheckedIdsChange = vi.fn();
  const onStateChange = vi.fn();
  const onDetail = vi.fn();
  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">
        <Agreement
          descriptor={descriptor}
          onCheckedIdsChange={onCheckedIdsChange}
          onStateChange={onStateChange}
          onDetail={onDetail}
          requiredLabel="(필수)"
          optionalLabel="(선택)"
        />
      </HjmNativeProvider>,
    );
  });

  const checkboxes = () => renderer.root.findAll(
    (node) => String(node.type) === "Pressable" && node.props.accessibilityRole === "checkbox",
  );
  expect(checkboxes()).toHaveLength(3);
  act(() => checkboxes()[0]!.props.onPress());
  expect(onCheckedIdsChange).toHaveBeenLastCalledWith(new Set(["terms", "news"]));
  expect(onStateChange.mock.lastCall?.[0]).toMatchObject({ all: true, satisfied: true });

  act(() => checkboxes()[1]!.props.onPress());
  expect(onCheckedIdsChange).toHaveBeenLastCalledWith(new Set(["news"]));
  expect(onStateChange.mock.lastCall?.[0]).toMatchObject({ all: "mixed", satisfied: false });

  const stateChangeCount = onStateChange.mock.calls.length;
  const detailButton = renderer.root.find((node) => node.props.accessibilityRole === "button");
  act(() => detailButton.props.onPress());
  expect(onDetail).toHaveBeenCalledWith("terms");
  expect(onStateChange).toHaveBeenCalledTimes(stateChangeCount);
  expect(onCheckedIdsChange).toHaveBeenLastCalledWith(new Set(["news"]));
});


it("locks required consent without disabling full-text reading, then resumes from the same selection", () => {
  const changes = vi.fn(), states = vi.fn(), details = vi.fn();
  let renderer!: ReturnType<typeof create>;
  const ui = (disabled: boolean) => <HjmNativeProvider reducedMotion><Agreement descriptor={{...descriptor, disabled}} defaultCheckedIds={new Set(['terms'])} onCheckedIdsChange={changes} onStateChange={states} onDetail={details} requiredLabel="(필수)" optionalLabel="(선택)" /></HjmNativeProvider>;
  act(() => { renderer = create(ui(true)); });
  const boxes = () => renderer.root.findAll(node => String(node.type) === 'Pressable' && node.props.accessibilityRole === 'checkbox');
  expect(boxes()[0]!.props.accessibilityState.checked).toBe('mixed');
  for (const box of boxes()) {
    expect(box.props.disabled).toBe(true);
    expect(box.props.accessibilityState.disabled).toBe(true);
    act(() => box.props.onPress());
  }
  expect(changes).not.toHaveBeenCalled();
  expect(states).toHaveBeenCalledTimes(1);
  const detail = renderer.root.findAll(node => String(node.type) === 'Pressable' && node.props.accessibilityRole === 'button')[0]!;
  expect(detail.props.disabled).not.toBe(true);
  act(() => detail.props.onPress());
  expect(details).toHaveBeenCalledWith('terms');
  act(() => renderer.update(ui(false)));
  expect(boxes()[1]!.props.accessibilityState.checked).toBe(true);
  act(() => boxes()[0]!.props.onPress());
  expect(changes).toHaveBeenLastCalledWith(new Set(['terms','news']));
  expect(states.mock.lastCall?.[0].satisfied).toBe(true);
  act(() => renderer.unmount());
});
