import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageIndicator } from "@hjmds/react/carousel";
import { useHjmTheme } from "@hjmds/react/provider";
import { Surface, Text } from "@hjmds/react/layout";
import { pageIndicatorExample } from "../../../shared/navigation-layout-examples";

// A product-owned scroll-snap pager with HJM's position dots (Carousel's dot row, 2026-10-18).
function PageIndicatorPreview() {
  const [page, setPage] = useState(0);
  const pager = useRef<HTMLDivElement>(null);
  const reducedMotion = useHjmTheme().environment.reducedMotion;
  const go = (index: number) => { setPage(index); pager.current?.scrollTo({ left: index * pager.current.clientWidth, behavior: reducedMotion ? "instant" : "smooth" }); };
  return <div style={{ display: "grid", gap: 8, maxInlineSize: 402 }}>
    <div ref={pager} style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory" }}
      onScrollEnd={(event) => { const node = event.currentTarget; setPage(Math.round(node.scrollLeft / Math.max(1, node.clientWidth))); }}>
      {Array.from({ length: pageIndicatorExample.count }, (_, index) => <div key={index} aria-hidden={index !== page} inert={index !== page}
        style={{ flex: "0 0 100%", scrollSnapAlign: "start", padding: 8, boxSizing: "border-box" }}>
        <Surface padding="md" bordered><Text>{pageIndicatorExample.page(index + 1)}</Text></Surface>
      </div>)}
    </div>
    <PageIndicator label={pageIndicatorExample.label} count={pageIndicatorExample.count} currentIndex={page}
      onCurrentIndexChange={go} composeAccessibleName={pageIndicatorExample.pageName} />
    {/* The same confirmed pager position can also be displayed without another set of targets. */}
    <PageIndicator label={pageIndicatorExample.label} count={pageIndicatorExample.count} currentIndex={page}
      interactive={false} maxVisibleDots={2} onCurrentIndexChange={go} composeAccessibleName={pageIndicatorExample.pageName} />
  </div>;
}

const meta = { id: "components-navigation-page-indicator", title: "배포/컴포넌트/탐색/페이지 위치 표시", component: PageIndicatorPreview } satisfies Meta<typeof PageIndicatorPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
