import type { ComponentRef } from "react";
import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { PageIndicator } from "@hjmds/react-native/carousel";
import { Surface, Text } from "@hjmds/react-native/primitives";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { pageIndicatorExample } from "../../../shared/navigation-layout-examples";

// A product-owned paging ScrollView with HJM's position dots (Carousel's dot row, 2026-10-18).
function PageIndicatorPreview() {
  const [page, setPage] = useState(0), [width, setWidth] = useState(320);
  const pager = useRef<ComponentRef<typeof ScrollView>>(null);
  const reducedMotion = useHjmNativeTheme().environment.reducedMotion;
  const go = (index: number) => { setPage(index); pager.current?.scrollTo({ x: index * width, animated: !reducedMotion }); };
  return <View style={{ gap: 8 }}>
    <ScrollView ref={pager} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      onMomentumScrollEnd={(event) => setPage(Math.round(event.nativeEvent.contentOffset.x / Math.max(1, width)))}>
      {Array.from({ length: pageIndicatorExample.count }, (_, index) => <View key={index} style={{ width, padding: 8 }}
        accessibilityElementsHidden={index !== page} importantForAccessibility={index !== page ? "no-hide-descendants" : "auto"}>
        <Surface padding="md" bordered><Text>{pageIndicatorExample.page(index + 1)}</Text></Surface>
      </View>)}
    </ScrollView>
    <PageIndicator label={pageIndicatorExample.label} count={pageIndicatorExample.count} currentIndex={page}
      onCurrentIndexChange={go} composeAccessibleName={pageIndicatorExample.pageName} labels={pageIndicatorExample.labels} />
    {/* The same confirmed pager position can also be displayed without another set of targets. */}
    <PageIndicator label={pageIndicatorExample.label} count={pageIndicatorExample.count} currentIndex={page}
      interactive={false} maxVisibleDots={2} onCurrentIndexChange={go} composeAccessibleName={pageIndicatorExample.pageName} labels={pageIndicatorExample.labels} />
  </View>;
}

const meta = { title: "배포/컴포넌트/탐색/페이지 위치 표시", component: PageIndicatorPreview, parameters: { hjm: { componentIds: ["page-indicator"] } } } satisfies Meta<typeof PageIndicatorPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
