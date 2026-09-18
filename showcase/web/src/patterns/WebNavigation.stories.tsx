import { useEffect, useId, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumb } from "@hjmds/react/breadcrumb";
import { Pagination } from "@hjmds/react/pagination";
import { Link } from "@hjmds/react/actions";
import { List, ListRow } from "@hjmds/react/display";
import { Section, Stack } from "@hjmds/react/layout";

const records = Array.from({ length: 125 }, (_, index) => ({ id: index + 1, title: `${index + 1}번째 산책 기록` }));
export function WebNavigationPreview() {
  const id = useId();
  const rootId = `${id}-records`; const collectionId = `${id}-walks`;
  const [collection, setCollection] = useState(true);
  const [page, setPage] = useState(1);
  const content = useRef<HTMLDivElement>(null); const previousCollection = useRef(collection);
  useEffect(() => {
    // The clicked ancestor link disappears after navigation. Move focus to the new
    // content, but never steal focus on initial catalog mounting or page changes.
    if (previousCollection.current !== collection) content.current?.focus({ preventScroll: true });
    previousCollection.current = collection;
  }, [collection]);
  useEffect(() => {
    // Scoped fragments let multiple catalog previews coexist without sharing a route.
    const route = () => { let hash: string; try { hash = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      if (hash === rootId || hash === collectionId) { setCollection(hash === collectionId); setPage(1); }
    };
    route(); window.addEventListener("hashchange", route);
    return () => window.removeEventListener("hashchange", route);
  }, [rootId, collectionId]);
  const visible = records.slice((page - 1) * 5, page * 5);
  return <Stack gap="lg"><Breadcrumb label="기록 보관함 경로" items={collection ? [
    { id: "records", label: "전체 보관함", destination: { kind: "internal", href: `#${encodeURIComponent(rootId)}` } },
    { id: "walks", label: "산책 기록" },
  ] : [{ id: "records", label: "전체 보관함" }]} />
    <div ref={content} tabIndex={-1} id={collection ? collectionId : rootId}>
      {collection ? <Section title="걸었던 날을 모아봤어요" description="산책 기록 125개"><Stack gap="md">
        {/* Keep the numeric range in reading order when the page direction is RTL. */}
        <p role="status"><bdi>{(page - 1) * 5 + 1}–{Math.min(page * 5, records.length)}</bdi>번째 기록</p>
        <List label="산책 기록 목록">{visible.map((record) => <ListRow key={record.id} title={record.title} description="걷다가 만난 풍경을 담았어요." />)}</List>
        <Pagination label="산책 기록 페이지" descriptor={{ currentPage: page, totalCount: records.length, pageSize: 5 }} labels={{ previous: "이전 페이지", next: "다음 페이지" }} composeAccessibleName={({ page: value, totalPages, current }) => `${totalPages}페이지 중 ${value}페이지${current ? ", 현재 페이지" : "로 이동"}`} onPageChange={setPage} />
      </Stack></Section> : <Section title="전체 보관함" description="다시 보고 싶은 기록을 찾아보세요.">
        <Link href={`#${encodeURIComponent(collectionId)}`}>산책 기록 125개 보기</Link>
      </Section>}
    </div>
  </Stack>;
}
const meta = { title: "Patterns/WebNavigation", component: WebNavigationPreview } satisfies Meta<typeof WebNavigationPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Records: Story = {};
export const LargeText: Story = { globals: { textScale: "2" } };
