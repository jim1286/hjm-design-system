import { act, create, type ReactTestRenderer } from "react-test-renderer";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { describe, expect, it, vi } from "vitest";

import { HjmNativeProvider } from "../src/provider.js";
import { UploadItem } from "../src/upload-item.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Component-scoped action and copy proof; this renderer does not claim hardware keyboard behavior. */
export const uploadItemActionCases = [{ componentId: "upload-item" }] as const;

function render(node: React.ReactNode): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<HjmNativeProvider reducedMotion theme="light">{node}</HjmNativeProvider>, { createNodeMock: () => ({}) });
  });
  return renderer!;
}

function allText(renderer: ReactTestRenderer): string[] {
  return renderer.root.findAll((node) => typeof node.props.children === "string")
    .map((node) => node.props.children as string);
}

describe("Native UploadItem status and actions", () => {
  it("preserves long localized copy, exposes uploading as busy, and invokes cancel with the file id", () => {
    const onCancel = vi.fn();
    const longName = "여행 사진 원본 최종 수정본 ".repeat(8) + "photo.png";
    const longStatus = "업로드 중 · 서버에서 파일을 확인하고 있습니다. 네트워크가 느리면 조금 더 걸릴 수 있어요.";
    const renderer = render(
      <UploadItem
        descriptor={{
          id: "photo",
          name: longName,
          sizeLabel: "압축 전 원본 파일 · 약 1.2 MB (네트워크 상태에 따라 시간이 더 걸릴 수 있음)",
          state: { status: "uploading", progress: 0.64, progressLabel: longStatus },
        }}
        labels={{ pending: "대기 중", uploading: "업로드 중", success: "완료", cancel: "취소", retry: "다시 시도" }}
        onCancel={onCancel}
      />,
    );

    const row = renderer.root.find((node) => node.props.accessibilityLabel === longName);
    expect(row.props.accessibilityState).toEqual({ busy: true });
    expect(allText(renderer)).toContain(longName);
    expect(allText(renderer)).toContain("압축 전 원본 파일 · 약 1.2 MB (네트워크 상태에 따라 시간이 더 걸릴 수 있음)");
    expect(allText(renderer)).toContain(longStatus);

    const cancel = renderer.root.find((node) => node.props.accessibilityLabel === "취소" && node.props.accessibilityRole === "button");
    expect(cancel.props.accessibilityRole).toBe("button");
    act(() => cancel.props.onPress());
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledWith("photo");
    expect(renderer.root.findAll((node) => node.props.accessibilityLabel === "다시 시도")).toHaveLength(0);
  });

  it("exposes retry only for an error and clears the busy state", () => {
    const onRetry = vi.fn();
    const renderer = render(
      <UploadItem
        descriptor={{ id: "archive", name: "archive.zip", state: { status: "error", message: "서버에서 파일을 저장하지 못했습니다" } }}
        labels={{ pending: "대기 중", uploading: "업로드 중", success: "완료", cancel: "취소", retry: "다시 시도" }}
        onRetry={onRetry}
      />,
    );

    const row = renderer.root.find((node) => node.props.accessibilityLabel === "archive.zip");
    expect(row.props.accessibilityState).toEqual({ busy: false });
    const retry = renderer.root.find((node) => node.props.accessibilityLabel === "다시 시도" && node.props.accessibilityRole === "button");
    act(() => retry.props.onPress());
    expect(onRetry).toHaveBeenCalledWith("archive");
    expect(renderer.root.findAll((node) => node.props.accessibilityLabel === "취소")).toHaveLength(0);
  });
});
