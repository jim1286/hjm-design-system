import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Layout } from "../src/layout.js";
import { BottomNavigation } from "../src/bottom-navigation.js";
import type { BottomNavigationDescriptor } from "@hjmds/design-contracts/components/bottom-navigation";
import {
  Image,
  type ImageAdapterProps,
  type ImageProps,
} from "../src/supplemental-display.js";

describe("Layout Web renderer", () => {
  it("renders ordered Web landmarks and a bypass link", () => {
    const markup = renderToStaticMarkup(
      <Layout
        mainId="primary-content"
        skipLinkLabel="본문으로 건너뛰기"
        header={<button type="button">메뉴</button>}
        sidebar={{
          mode: "persistent",
          role: "navigation",
          label: "주 메뉴",
          children: <a href="/home">홈</a>,
        }}
        footer="법적 고지"
      >
        본문
      </Layout>,
    );

    expect(markup).toContain('data-hjm-component="Layout"');
    expect(markup).toContain('href="#primary-content"');
    expect(markup).toContain("<header");
    expect(markup).toMatch(/<nav[^>]*aria-label="주 메뉴"/u);
    expect(markup).toContain('<main id="primary-content"');
    expect(markup).toContain('tabindex="-1"');
    expect(markup).toContain("<footer");
    expect(markup.match(/<main[\s>]/gu)).toHaveLength(1);
    expect(markup.indexOf("hjm-layout__skip-link")).toBeLessThan(
      markup.indexOf("<header"),
    );
    expect(markup.indexOf("<header")).toBeLessThan(markup.indexOf("<nav"));
    expect(markup.indexOf("<nav")).toBeLessThan(markup.indexOf("<main"));
    expect(markup.indexOf("<main")).toBeLessThan(markup.indexOf("<footer"));
  });

  it("composes navigation in one contentinfo and one navigation landmark", () => {
    const descriptor: BottomNavigationDescriptor<"home" | "profile", "home" | "user"> = {
      accessibilityLabel: "주요 탐색",
      selectedKey: "home",
      items: [
        { id: "home", label: "홈", icon: { name: "home" } },
        { id: "profile", label: "내 정보", icon: { name: "user" } },
      ],
    };
    const markup = renderToStaticMarkup(
      <Layout
        footer={(
          <BottomNavigation
            descriptor={descriptor}
            getHref={(item) => `/${item.id}`}
            renderIcon={({ name }) => <span>{name}</span>}
          />
        )}
      >
        본문
      </Layout>,
    );

    expect(markup.match(/<footer[\s>]/gu)).toHaveLength(1);
    expect(markup.match(/<nav[\s>]/gu)).toHaveLength(1);
    expect(markup).toMatch(/<footer[^>]*>[\s\S]*<nav[^>]*aria-label="주요 탐색"/u);
  });

  it("hands the real overlay landmark to a separate composition owner", () => {
    const markup = renderToStaticMarkup(
      <Layout
        skipLinkLabel="본문으로 건너뛰기"
        sidebar={{
          mode: "overlay",
          role: "complementary",
          label: "필터",
          children: <label>팀 <input /></label>,
          renderOverlay: (landmark: ReactElement) => (
            <div data-side-panel-owner="true">{landmark}</div>
          ),
        }}
      >
        결과
      </Layout>,
    );

    expect(markup).toContain('data-sidebar-mode="overlay"');
    expect(markup).toContain('data-side-panel-owner="true"');
    expect(markup).toMatch(/<aside[^>]*aria-label="필터"/u);
    expect(markup).not.toContain("aria-modal");
  });

  it("enforces the shared descriptor and a usable main target", () => {
    expect(() =>
      renderToStaticMarkup(
        <Layout header="반복 내비게이션">본문</Layout>,
      ),
    ).toThrow(/skipLinkLabel/);
    expect(() =>
      renderToStaticMarkup(<Layout mainId=" ">본문</Layout>),
    ).toThrow(/mainId/);
    expect(() =>
      renderToStaticMarkup(<Layout mainId="main content">본문</Layout>),
    ).toThrow(/whitespace/);
  });
});

describe("Image Web renderer", () => {
  it("renders intrinsic dimensions, fit, and informative alt copy", () => {
    const markup = renderToStaticMarkup(
      <Image
        src="https://cdn.example.com/chart.png"
        width={800}
        height={400}
        fit="contain"
        decorative={false}
        accessibilityLabel="2026 시즌 기록 차트"
      />,
    );

    expect(markup).toContain('class="hjm-image"');
    expect(markup).toContain('data-status="loading"');
    expect(markup).toContain('data-fit="contain"');
    expect(markup).toContain('src="https://cdn.example.com/chart.png"');
    expect(markup).toContain('width="800"');
    expect(markup).toContain('height="400"');
    expect(markup).toContain('alt="2026 시즌 기록 차트"');
    expect(markup).toContain("object-fit:contain");
    expect(markup).toContain("aspect-ratio:2");
  });

  it("keeps decorative images out of the accessibility tree", () => {
    const markup = renderToStaticMarkup(
      <Image src="/texture.png" width={64} height={64} />,
    );

    expect(markup).toContain('alt=""');
    expect(markup).toContain('aria-hidden="true"');
  });

  it("passes the canonical contract through a framework adapter", () => {
    let received: ImageAdapterProps | undefined;
    const markup = renderToStaticMarkup(
      <Image
        src="/poster.png"
        width={320}
        height={180}
        fit="cover"
        decorative={false}
        accessibilityLabel="경기 포스터"
        imageProps={{
          loading: "lazy",
          className: "product-asset",
          style: { objectFit: "contain" },
        }}
        renderImage={(adapterProps) => {
          received = adapterProps;
          const { ref, ...imageProps } = adapterProps;
          return <img {...imageProps} ref={ref} data-framework-image="true" />;
        }}
      />,
    );

    expect(received).toMatchObject({
      src: "/poster.png",
      alt: "경기 포스터",
      width: 320,
      height: 180,
      loading: "lazy",
    });
    expect(received?.className).toContain("hjm-image__asset");
    expect(received?.className).toContain("product-asset");
    expect(received?.style.objectFit).toBe("cover");
    expect(markup).toContain('data-framework-image="true"');
  });

  it("does not sanitize invalid runtime descriptors before validation", () => {
    const invalid = {
      src: "/decorative.png",
      width: 100,
      height: 100,
      decorative: true,
      accessibilityLabel: "잘못된 이름",
    } as unknown as ImageProps;

    expect(() => renderToStaticMarkup(<Image {...invalid} />)).toThrow(
      /must not provide accessibilityLabel/,
    );
  });
});
