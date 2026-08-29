import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { BottomNavigationDescriptor } from "@hjmds/design-contracts/components/bottom-navigation";
import {
  BottomNavigation,
  HjmProvider,
  getBottomNavigationGridColumn,
  shouldHideBottomNavigationForKeyboard,
} from "../src/index.js";

const descriptor: BottomNavigationDescriptor<"home" | "search" | "profile", "home" | "search" | "user"> = {
  accessibilityLabel: "주요 탐색",
  selectedKey: "home",
  items: [
    { id: "home", label: "홈", icon: { name: "home" } },
    {
      id: "search",
      label: "검색",
      icon: { name: "search" },
      badge: { count: 3, accessibilityLabel: "읽지 않은 검색 알림 3개" },
    },
    { id: "profile", label: "내 정보", icon: { name: "user" }, disabled: true },
  ],
};

describe("Web BottomNavigation", () => {
  it("renders persistent destinations with link, selection, badge, and disabled semantics", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <BottomNavigation
          descriptor={descriptor}
          getHref={(item) => `/${item.id}`}
          renderIcon={({ name, size, strokeWidth }) => (
            <span data-icon={name} data-size={size} data-stroke={strokeWidth} />
          )}
        />
      </HjmProvider>,
    );

    expect(markup).toMatch(/<nav[^>]*aria-label="주요 탐색"/u);
    expect(markup).toContain('href="/home"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('aria-label="검색, 읽지 않은 검색 알림 3개"');
    expect(markup).toContain('aria-hidden="true" class="hjm-bottom-navigation__badge">3</span>');
    expect(markup).toContain('aria-disabled="true"');
    expect(markup).not.toContain('href="/profile"');
  });

  it("keeps center-gap placement and keyboard occlusion deterministic", () => {
    expect(getBottomNavigationGridColumn(0, 4, "center-gap")).toBe(1);
    expect(getBottomNavigationGridColumn(2, 4, "center-gap")).toBe(4);
    expect(getBottomNavigationGridColumn(2, 4, "equal")).toBeUndefined();
    expect(shouldHideBottomNavigationForKeyboard({
      behavior: "hide",
      layoutViewportHeight: 800,
      visualViewportHeight: 600,
      visualViewportScale: 1,
    })).toBe(true);
    expect(shouldHideBottomNavigationForKeyboard({
      behavior: "hide",
      layoutViewportHeight: 800,
      visualViewportHeight: 600,
      visualViewportScale: 2,
    })).toBe(false);
  });

  it("preserves canonical semantics through a framework link adapter", () => {
    const markup = renderToStaticMarkup(
      <BottomNavigation
        descriptor={descriptor}
        getHref={(item) => `/${item.id}`}
        renderIcon={({ name }) => <span>{name}</span>}
        renderLink={({ children, ...props }) => (
          <a {...props} data-framework-link="next">{children}</a>
        )}
      />,
    );

    expect(markup).toContain('data-framework-link="next"');
    expect(markup).toContain('href="/home"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('class="hjm-bottom-navigation__item"');
  });
});
