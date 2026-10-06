import { describe, expect, it } from "vitest";
import { resolveFieldGroup, type FieldGroupDescriptor } from "../src/field-group.js";

const descriptor: FieldGroupDescriptor = {
  label: "배송지", description: "받을 주소를 입력하세요",
  fields: [{ id: "street", label: "도로명", description: "건물 번호 포함" },
    { id: "city", label: "도시" }, { id: "country", label: "국가", disabled: true }],
};

describe("related input group candidate", () => {
  it("preserves independent field feedback when a cross-field error affects only some members", () => {
    const resolved = resolveFieldGroup({ ...descriptor,
      fields: descriptor.fields.map(field => field.id === "street" ? { ...field, error: "번호를 확인하세요" } : field),
      error: { message: "도시와 국가 조합을 확인하세요", fieldIds: ["city", "country"] } });
    expect(resolved.fields.map(field => field.invalid)).toEqual([true, true, true]);
    expect(resolved.fields[0]?.support).toEqual([
      { scope: "group", kind: "description", text: descriptor.description },
      { scope: "field", kind: "description", text: "건물 번호 포함" },
      { scope: "field", kind: "error", text: "번호를 확인하세요" },
    ]);
    expect(resolved.fields[1]?.support.at(-1)).toEqual({ scope: "group", kind: "error", text: "도시와 국가 조합을 확인하세요" });
  });

  it("does not mark every field invalid for a group-only failure and clears corrected feedback", () => {
    const failed = resolveFieldGroup({ ...descriptor, error: { message: "주소를 확인할 수 없습니다", fieldIds: [] } });
    expect(failed.error).toBe("주소를 확인할 수 없습니다");
    expect(failed.fields.every(field => !field.invalid && field.support.every(item => item.kind !== "error"))).toBe(true);
    const corrected = resolveFieldGroup(descriptor);
    expect(corrected.error).toBeUndefined();
    expect(corrected.fields.every(field => !field.invalid)).toBe(true);
  });

  it("locks all fields but restores each member's own disabled policy on unlock", () => {
    expect(resolveFieldGroup({ ...descriptor, disabled: true }).fields.map(field => field.disabled)).toEqual([true, true, true]);
    expect(resolveFieldGroup({ ...descriptor, disabled: false }).fields.map(field => field.disabled)).toEqual([false, false, true]);
  });

  it("follows product order without moving errors to the wrong field after reorder", () => {
    const resolved = resolveFieldGroup({ ...descriptor, fields: [...descriptor.fields].reverse(),
      error: { message: "도시가 필요합니다", fieldIds: ["city"] } });
    expect(resolved.fields.map(field => [field.id, field.invalid])).toEqual([["country", false], ["city", true], ["street", false]]);
    expect(resolveFieldGroup({ label: "선택 항목", fields: [] }).fields).toEqual([]);
  });

  it("rejects duplicate members and stale or ambiguous error targets", () => {
    expect(() => resolveFieldGroup({ ...descriptor, fields: [descriptor.fields[0]!, descriptor.fields[0]!] })).toThrow(TypeError);
    for (const fieldIds of [["removed"], ["city", "city"]]) {
      expect(() => resolveFieldGroup({ ...descriptor, error: { message: "오류", fieldIds } })).toThrow(TypeError);
    }
    expect(() => resolveFieldGroup({ ...descriptor, label: " " })).toThrow(TypeError);
    expect(() => resolveFieldGroup({ ...descriptor, error: { message: "", fieldIds: [] } })).toThrow(TypeError);
  });

  it("returns an immutable snapshot without mutating product descriptors", () => {
    const fields = [{ id: "name", label: "이름", description: "실명" }];
    const resolved = resolveFieldGroup({ label: "연락처", fields });
    fields[0]!.label = "변경";
    expect(resolved.fields[0]?.label).toBe("이름");
    expect(Object.isFrozen(resolved.fields[0]?.support[0])).toBe(true);
    expect(Object.isFrozen(resolved.fields)).toBe(true);
  });
});
