import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { page } from "vitest/browser";
import { HjmProvider } from "@hjmds/react/provider";
import { ComponentExplorer } from "./ComponentExplorer.stories";
import "@hjmds/react/styles.css";
import "../showcase.css";

it("finds existing examples by everyday phrases while retaining category filters", async () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const search = async (query: string) => act(async () => page.getByRole("searchbox", { name: "검색", exact: true }).fill(query));
  try {
    await act(async () => root.render(<HjmProvider><ComponentExplorer /></HjmProvider>));
    await search("아래에서 올라오는 판");
    expect(host.querySelectorAll(".hjm-component-card")).toHaveLength(1);
    expect(host.querySelector(".hjm-component-card code")?.textContent).toBe("Sheet");
    expect(host.textContent).toContain("짧은 집중 작업은 Dialog");
    expect(host.querySelector(".hjm-component-card-footer a")?.getAttribute("href")).toBe("?path=/story/components-overlays--sheet");

    await search("밀면 삭제 버튼");
    expect(host.textContent).toContain("SwipeActions");
    expect(page.getByRole("link", { name: "끌기·밀기 실행 예제" }).element().getAttribute("href")).toBe("?path=/story/experimental-interaction-adapters--default");
    await search("휠피커");
    expect(host.textContent).toContain("selectionStyle=wheel");
    await search("  ＳＨＥＥＴ  ");
    expect(host.querySelectorAll(".hjm-component-card").length).toBeGreaterThan(0);
    await search("없는표현");
    expect(host.textContent).toContain("일치하는 컴포넌트가 없습니다");

    await act(async () => root.render(<HjmProvider><ComponentExplorer initialCategory="action" /></HjmProvider>));
    await search("아래에서 올라오는 판");
    expect(host.querySelectorAll(".hjm-component-card")).toHaveLength(0);
    await search("맨 아래 붙은 버튼");
    expect(host.querySelector(".hjm-component-card code")?.textContent).toBe("BottomCTA");
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
