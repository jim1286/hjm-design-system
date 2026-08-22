import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  Accordion,
  AlertDialog,
  Avatar,
  Breadcrumb,
  Combobox,
  DescriptionList,
  Dialog,
  Divider,
  Form,
  HjmProvider,
  NativeSelect,
  Pagination,
  Sheet,
  Table,
  TextField,
  Tooltip,
} from "../src/index.js";

describe("advanced renderer SSR", () => {
  it("keeps portal overlays SSR-safe and Tooltip relationships deterministic", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Dialog closeLabel="닫기" defaultOpen trigger={<button type="button">열기</button>} title="설정">
          본문
        </Dialog>
        <Tooltip defaultOpen trigger={<button type="button">도움말</button>} content="도움말 설명" />
      </HjmProvider>,
    );

    expect(markup).toContain('aria-haspopup="dialog"');
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).not.toContain('role="dialog"');
    expect(markup).toContain('role="tooltip"');
    expect(markup).toMatch(/aria-describedby="[^"]+-tooltip"/);
  });

  it("keeps controlled triggerless modal variants SSR-safe", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Dialog
          closeLabel="닫기"
          open
          onOpenChange={() => undefined}
          title="설정"
        />
        <AlertDialog
          open
          onOpenChange={() => undefined}
          request={{
            mode: "alert",
            title: "완료",
            description: "저장했습니다.",
            confirmLabel: "확인",
          }}
        />
        <Sheet
          closeLabel="닫기"
          open
          onOpenChange={() => undefined}
          title="필터"
        />
      </HjmProvider>,
    );

    expect(markup).not.toContain('aria-haspopup="dialog"');
    expect(markup).not.toContain('role="dialog"');
    expect(markup).not.toContain('role="alertdialog"');
  });

  it("renders native Select, editable Combobox, and Form semantics", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Form onSubmit={() => undefined} formError="저장하지 못했습니다" actions={<button>저장</button>}>
          <TextField label="이름" />
          <NativeSelect
            label="구단"
            name="team"
            defaultValue="lg"
            options={[{ value: "lg", label: "LG" }, { value: "kt", label: "KT" }]}
          />
          <Combobox
            emptyMessage="검색 결과가 없습니다"
            label="선수"
            loadingMessage="검색 중"
            name="player"
            selectionRequiredMessage="선수를 선택하세요"
            defaultOpen
            items={[{ value: "one", label: "홍길동" }, { value: "two", label: "김철수" }]}
          />
        </Form>
      </HjmProvider>,
    );

    expect(markup).toContain("<form");
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('<select name="team"');
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain('role="listbox"');
    expect(markup).toContain('role="option"');
    expect(markup).toContain('type="hidden" name="player"');
  });

  it("uses disclosure, image fallback, separator, dl, and table HTML", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light" textScale={2}>
        <Accordion
          defaultValue={["summary"]}
          items={[{ id: "summary", title: "요약", panel: "시즌 요약" }]}
        />
        <Avatar name="홍 길동" />
        <Divider />
        <DescriptionList
          columns={2}
          items={[
            { id: "team", label: "구단", value: "LG" },
            { id: "position", label: "포지션", value: "유격수" },
          ]}
        />
        <Table
          caption="선수 기록"
          emptyState="기록이 없습니다"
          rows={[{ id: "one", name: "홍길동", avg: ".312" }]}
          getRowKey={(row) => row.id}
          columns={[
            { id: "name", header: "이름", cell: (row) => row.name },
            { id: "avg", header: "타율", cell: (row) => row.avg, sortable: true },
          ]}
        />
      </HjmProvider>,
    );

    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain('role="region"');
    expect(markup).toContain('role="img" aria-label="홍 길동"');
    expect(markup).toContain('role="separator"');
    expect(markup).toContain("<dl");
    expect(markup).toContain('data-columns="2"');
    expect(markup).toContain("<table");
    expect(markup).toContain('<th scope="col"');
    expect(markup).toContain('aria-sort="none"');
  });

  it("resolves Breadcrumb and Pagination contracts into landmarks", () => {
    const onPageChange = vi.fn();
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light" direction="rtl">
        <Breadcrumb
          label="현재 위치"
          items={[
            { id: "teams", label: "구단", destination: { kind: "internal", href: "/teams" } },
            { id: "lg", label: "LG 트윈스" },
          ]}
        />
        <Pagination
          label="검색 결과 페이지"
          descriptor={{ currentPage: 3, totalPages: 10 }}
          labels={{ previous: "이전", next: "다음" }}
          composeAccessibleName={({ page, totalPages, current }) =>
            `${totalPages} 페이지 중 ${page} 페이지${current ? ", 현재" : ""}`
          }
          onPageChange={onPageChange}
        />
      </HjmProvider>,
    );

    expect(markup).toContain('<nav class="hjm-breadcrumb" aria-label="현재 위치"');
    expect(markup).toContain('href="/teams"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('aria-label="검색 결과 페이지"');
    expect(markup).toContain('aria-hidden="true">…');
    expect(markup).toContain('aria-label="10 페이지 중 3 페이지, 현재"');
  });
});
