import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Layout } from "../src/layout.js";
import { Sidebar } from "../src/sidebar.js";

// 2026-10-30 desktop web shells (Diairy, BurnTok): Layout + Sidebar must form the shell without product wrappers.
describe("Layout + Sidebar desktop shell", () => {
  const sidebar = (
    <Sidebar
      size="compact"
      descriptor={{ accessibilityLabel: "주 메뉴", currentId: "home", groups: [{ id: "main", items: [{ id: "home", label: "홈", destination: { kind: "internal", href: "/home" } }] }] }}
      header={<a href="/">브랜드</a>}
      footer={<button type="button">설정</button>}
    />
  );

  it("lets the persistent column take the Sidebar's own width instead of a fixed 280", () => {
    const markup = renderToStaticMarkup(
      <Layout skipLinkLabel="본문으로 건너뛰기" sidebar={{ mode: "persistent", role: "navigation", label: "셸", children: sidebar }}>
        본문
      </Layout>,
    );
    expect(markup).not.toMatch(/inline-size:\s*280px/);
    expect(markup).toContain("--hjm-sidebar-width:220px");
  });

  it("places the header before the groups and the footer after them", () => {
    const markup = renderToStaticMarkup(sidebar);
    const header = markup.indexOf("hjm-sidebar__header");
    const group = markup.indexOf("hjm-sidebar__group");
    const footer = markup.indexOf("hjm-sidebar__footer");
    expect(header).toBeGreaterThan(-1);
    expect(header).toBeLessThan(group);
    expect(footer).toBeGreaterThan(group);
  });

  it("renders no skip link with the explicit opt-out", () => {
    const markup = renderToStaticMarkup(
      <Layout skipLink={false} sidebar={{ mode: "persistent", role: "navigation", label: "셸", children: sidebar }}>
        본문
      </Layout>,
    );
    expect(markup).not.toContain("hjm-layout__skip-link");
    expect(markup).toContain("<main");
  });
});
