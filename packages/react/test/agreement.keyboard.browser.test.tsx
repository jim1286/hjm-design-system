import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import type { AgreementDescriptor } from "@hjmds/design-contracts/components/agreement";
import { Agreement } from "../src/agreement.js";
import { HjmProvider } from "../src/provider.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

export const agreementKeyboardCases = [{ componentId: "agreement" }] as const;

let container: HTMLDivElement;
let root: Root;

async function render(ui: React.ReactNode) {
  await act(async () => root.render(ui));
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

const descriptor: AgreementDescriptor = {
  accessibilityLabel: "가입 약관",
  allLabel: "전체 동의",
  items: [
    { id: "terms", label: "서비스 이용약관", required: true, detail: { label: "전문 보기" } },
    { id: "privacy", label: "개인정보 처리방침", required: true },
    { id: "news", label: "소식 받기" },
  ],
};

function Fixture({ onDetail, onSubmit }: { onDetail: (id: string) => void; onSubmit: () => void }) {
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const [satisfied, setSatisfied] = useState(false);
  return (
    <HjmProvider reducedMotion>
      <Agreement
        descriptor={descriptor}
        checkedIds={checked}
        onCheckedIdsChange={setChecked}
        onStateChange={(state) => setSatisfied(state.satisfied)}
        onDetail={onDetail}
        requiredLabel="(필수)"
        optionalLabel="(선택)"
      />
      <button type="button" disabled={!satisfied} onClick={onSubmit}>가입하기</button>
    </HjmProvider>
  );
}

const box = (label: string) => [...container.querySelectorAll<HTMLElement>('[role="checkbox"]')]
  .find((node) => node.textContent?.includes(label))!;

it("uses keyboard consent actions and keeps opening details separate from agreement", async () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/agreement.keyboard.browser.test.tsx")?.scenarios.map(({ id }) => id)).toContain("keyboard");
  const onDetail = vi.fn();
  const onSubmit = vi.fn();
  await render(<Fixture onDetail={onDetail} onSubmit={onSubmit} />);
  const submit = [...container.querySelectorAll<HTMLButtonElement>("button")]
    .find((button) => button.textContent === "가입하기")!;
  expect(submit.disabled).toBe(true);

  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(box("전체 동의"));
  await act(async () => userEvent.keyboard("{Space}"));
  expect(box("전체 동의").getAttribute("aria-checked")).toBe("true");
  expect(submit.disabled).toBe(false);

  await act(async () => userEvent.keyboard("{Space}"));
  expect(box("전체 동의").getAttribute("aria-checked")).toBe("false");
  expect(submit.disabled).toBe(true);

  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(box("서비스 이용약관"));
  await act(async () => userEvent.keyboard("{Space}"));
  expect(box("서비스 이용약관").getAttribute("aria-checked")).toBe("true");
  expect(submit.disabled).toBe(true);

  await act(async () => userEvent.tab());
  const details = container.querySelector<HTMLButtonElement>("button.hjm-agreement__detail")!;
  expect(document.activeElement).toBe(details);
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(onDetail).toHaveBeenCalledWith("terms");
  expect(box("서비스 이용약관").getAttribute("aria-checked")).toBe("true");

  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(box("개인정보 처리방침"));
  await act(async () => userEvent.keyboard("{Space}"));
  expect(submit.disabled).toBe(false);

  await act(async () => userEvent.tab()); // optional row
  await act(async () => userEvent.tab()); // submit action
  expect(document.activeElement).toBe(submit);
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(onSubmit).toHaveBeenCalledOnce();
});
