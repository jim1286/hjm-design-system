import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { CohortRetentionTable, CorrelationMatrix, ImportFieldMapping, TargetSummary } from "../src/data-workflows.js";
import { Select } from "../src/forms.js";
import { Button } from "../src/actions.js";
import { DataTable } from "../src/data-table.js";
import { Progress } from "../src/feedback.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
vi.mock("react-native-svg", async () => {
  const { View } = await import("react-native");
  return { default: View, Circle: View, Defs: View, G: View, Line: View, LinearGradient: View, Path: View, Rect: View, Stop: View, Text: View };
});
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });

it("provides a real skip choice and only imports valid frozen mappings", async () => {
  const update = vi.fn(), importRows = vi.fn();
  act(() => { tree = create(<HjmNativeProvider><ImportFieldMapping label="연결" sources={[{ id: "a", label: "원본" }]} targets={[{ id: "name", label: "이름", required: true }]} mapping={{ a: "name" }} onMappingChange={update} onImport={importRows} dismissLabel="닫기" importLabel="가져오기" skipLabel="건너뛰기" errorLabel="실패" validationLabel={() => "필수 필드"} /></HjmNativeProvider>); });
  const select = tree!.root.findByType(Select), skip = select.props.items[0];
  act(() => select.props.onSelectionChange(skip.id)); expect(update).toHaveBeenCalledWith({ a: null });
  await act(async () => tree!.root.findAllByType(Button).find(button => button.props.children === "가져오기")!.props.onPress());
  expect(importRows).toHaveBeenCalledWith({ a: "name" }); expect(Object.isFrozen(importRows.mock.calls[0]![0])).toBe(true);
});

it("passes all cohort periods and correlation diagonals to a rectangular DataTable", () => {
  act(() => { tree = create(<HjmNativeProvider><CohortRetentionTable label="잔존율" cohortColumnLabel="주차" periods={["0주", "1주", "2주"]} cohorts={[{ id: "a", label: "10월", size: 10, retained: [10, 0] }]} formatRate={rate => `${rate * 100}%`} missingLabel="미관측" />
    <CorrelationMatrix label="상관" variableColumnLabel="변수" data={{ variables: [{ id: "a", label: "A" }, { id: "b", label: "B" }], values: [[1, -.5], [-.5, 1]] }} formatValue={String} missingLabel="미관측" />
    <TargetSummary label="목표" actual={12} target={0} formatActual={String} summaryLabel={() => "목표 미설정"} /></HjmNativeProvider>); });
  const tables = tree!.root.findAllByType(DataTable);
  expect(tables[0]!.props.renderCell("a", "p-0")).toBe("100%"); expect(tables[0]!.props.renderCell("a", "p-1")).toBe("0%"); expect(tables[0]!.props.renderCell("a", "p-2")).toBe("미관측");
  expect(tables[1]!.props.renderCell("a", "v-0")).toBe("1"); expect(tables[1]!.props.renderCell("b", "v-1")).toBe("1");
  expect(tree!.root.findAllByType(Progress)).toHaveLength(0);
});
