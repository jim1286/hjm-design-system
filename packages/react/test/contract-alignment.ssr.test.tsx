import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  CheckboxGroup,
  CounterBadge,
  HjmProvider,
  Icon,
  LoadMore,
  Radio,
  Select,
  Tabs,
  Toast,
} from "../src/index.js";

describe("active renderer SSR evidence", () => {
  it("renders the six supplemental components without browser globals", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="dark" direction="rtl" textScale={2}>
        <Icon name="back" />
        <Icon name="info" decorative={false} accessibilityLabel="정보" />
        <CounterBadge count={120} max={99} />
        <Radio label="단일" name="mode" defaultChecked />
        <CheckboxGroup
          label="항목"
          defaultValue={new Set(["a"])}
          items={[
            { id: "a", label: "A" },
            { id: "b", label: "B", disabled: true },
          ]}
        />
        <LoadMore
          descriptor={{
            state: { status: "ready", requestKey: "next" },
            labels: {
              loadMore: "더 보기",
              loading: "불러오는 중",
              retry: "다시 시도",
              complete: "완료",
            },
          }}
          onLoadMore={async () => undefined}
        />
        <Toast
          descriptor={{
            id: "saved",
            description: "저장했습니다.",
            closeLabel: "닫기",
          }}
          onDismissRequest={vi.fn()}
        />
      </HjmProvider>,
    );

    expect(markup).toContain('data-transform="mirror-inline"');
    expect(markup).toContain('role="img" aria-label="정보"');
    expect(markup).toContain(">99+<");
    expect(markup).toContain('type="radio"');
    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain(">더 보기<");
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-label="닫기"');
  });

  it("renders canonical Select and core-default Tabs semantics", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Select
          emptySelectionLabel="선택 안 함"
          label="구단"
          placeholder="구단 선택"
          name="team"
          defaultSelectedKey="lg"
          defaultOpen
          items={[
            { id: "lg", label: "LG", textValue: "LG" },
            { id: "kt", label: "KT", textValue: "KT" },
          ]}
        />
        <Tabs
          label="정보"
          items={[
            { id: "overview", label: "개요", panel: "개요 내용" },
            { id: "history", label: "기록", panel: "기록 내용" },
          ]}
        />
      </HjmProvider>,
    );

    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain('role="listbox"');
    expect(markup).toContain('aria-activedescendant=');
    expect(markup).toContain('type="hidden" name="team" value="lg"');
    expect(markup).toContain('aria-orientation="horizontal"');
    expect(markup.match(/role="tabpanel"/g)).toHaveLength(1);
    expect(markup).toContain('data-mount-policy="active"');
    expect(markup).toContain('data-panel-mode="keyed"');
  });
});
