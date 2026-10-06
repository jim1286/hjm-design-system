import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, History, Search, SlidersHorizontal, X } from "lucide-react";
import { SearchScreen } from "@hjmds/react/screen-flows";
import { ScreenLayout } from "@hjmds/react/screens";
import { Stack, Text } from "@hjmds/react/layout";
import { Button, IconButton } from "@hjmds/react/actions";
import { Chip, Switch } from "@hjmds/react/selection";
import { ListRow } from "@hjmds/react/display";
import { Heading } from "@hjmds/react/heading";
import { Notice } from "@hjmds/react/feedback";
import { LoadMore } from "@hjmds/react/navigation";
import { PreviewPhoto } from "./reference-screen-parts";
import {
  appliedFilterChips, commitRecentSearch, countDiscovery, discoveryCopy as copy, discoveryKinds,
  discoveryPageSize, discoveryPeriods, discoverySeed, discoverySorts, discoveryTopics, entryDescription, highlightRange,
  isDiscoveryFilterDefault, kindFacetLabel, periodFacetLabel, removeDiscoveryFilter,
  resetDiscoveryFilters, searchDiscovery, sortLabel, suggestDiscovery, toggleDiscoveryKind,
  type AppliedFilterKey, type DiscoveryEntry, type DiscoveryFilters, type DiscoverySort, type DiscoveryView, type FilterScope,
} from "../../../shared/search-discovery";

type Params = Readonly<{ query: string; filters: DiscoveryFilters; sort: DiscoverySort }>;
export type SearchDiscoveryPreviewProps = Readonly<{ view?: DiscoveryView; tools?: boolean }>;

/**
 * Product-side wiring of the public SearchScreen two-step API (2026-10-06): this file owns only example data,
 * requests and copy. Phases, commit routing, recent/suggested sections, applied-filter chips, the draft/applied
 * filter sheet, empty causes, loading rows, focus after removal and count announcements are SearchScreen's.
 * Until 2026-10-06 this preview implemented all of that itself, so products had to copy Showcase code.
 */
export function SearchDiscoveryPreview({ view = "idle", tools = false }: SearchDiscoveryPreviewProps) {
  const seed = discoverySeed(view);
  const [query, setQuery] = useState(seed.query);
  const [committed, setCommitted] = useState(seed.committed);
  const [suggestFor, setSuggestFor] = useState(seed.query);
  const [applied, setApplied] = useState(seed.filters);
  const [sort, setSort] = useState<DiscoverySort>("relevance");
  const [shown, setShown] = useState<Params>({ query: seed.committed, filters: seed.filters, sort: "relevance" });
  const [status, setStatus] = useState<"ready" | "loading" | "error">(view === "loading" ? "loading" : view === "error" ? "error" : "ready");
  const [recents, setRecents] = useState<readonly string[]>(seed.recents);
  const [sheetOpen, setSheetOpen] = useState(view === "sheet");
  const [scope, setScope] = useState<FilterScope>("all");
  const [visible, setVisible] = useState(discoveryPageSize);
  const [failNext, setFailNext] = useState(false);
  const [restricted, setRestricted] = useState(view === "restricted");
  const [detail, setDetail] = useState<DiscoveryEntry | null>(null);
  const [home, setHome] = useState(false);
  const failRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const searchHost = useRef<HTMLDivElement>(null);
  const returnTo = useRef<{ element: HTMLElement | null; scrollTop: number }>({ element: null, scrollTop: 0 });
  const pendingFocus = useRef<null | (() => void)>(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  useLayoutEffect(() => { pendingFocus.current?.(); pendingFocus.current = null; });

  // Demo latency makes loading and failure observable; a product passes its own request state.
  const request = (next: Params) => {
    clearTimeout(timer.current);
    setStatus("loading");
    timer.current = setTimeout(() => {
      if (failRef.current) { failRef.current = false; setFailNext(false); setStatus("error"); return; }
      setShown(next); setVisible(discoveryPageSize); setStatus("ready");
    }, 400);
  };
  const current: Params = { query: committed, filters: applied, sort };
  // SearchScreen calls this for every commit only (never for debounced typing) with a trimmed, nonblank query.
  const commit = (next: string) => { setCommitted(next); setRecents(items => commitRecentSearch(items, next)); request({ ...current, query: next }); };
  const applyFilters = (filters: DiscoveryFilters) => { setApplied(filters); request({ ...current, filters }); };
  const openSheet = (next: FilterScope) => { setScope(next); setSheetOpen(true); };
  const bodyOf = () => searchHost.current?.querySelector<HTMLElement>(".hjm-screen__body");
  const openDetail = (entry: DiscoveryEntry, element: HTMLElement) => {
    returnTo.current = { element, scrollTop: bodyOf()?.scrollTop ?? 0 };
    setDetail(entry);
  };
  const closeDetail = () => {
    pendingFocus.current = () => {
      const body = bodyOf();
      if (body) body.scrollTop = returnTo.current.scrollTop;
      returnTo.current.element?.focus({ preventScroll: true });
    };
    setDetail(null);
  };

  const results = searchDiscovery(shown.query, shown.filters, shown.sort);
  const filtered = appliedFilterChips(applied).length > 0;

  // Product-owned chips after SearchScreen's own "필터" trigger: quick toggles apply at once, facets open one section.
  const rail = <Stack axis="inline" gap="xs" role="group" aria-label={copy.railLabel}>
    <Chip selectionMode="multiple" label={copy.photoOnly} selected={applied.photoOnly} onSelectedChange={photoOnly => applyFilters({ ...applied, photoOnly })} />
    <Chip selectionMode="multiple" label={copy.savedOnly} selected={applied.savedOnly} onSelectedChange={savedOnly => applyFilters({ ...applied, savedOnly })} />
    <Chip label={periodFacetLabel(applied)} aria-label={`${periodFacetLabel(applied)}, ${copy.facetChange}`} aria-haspopup="dialog" trailing={<ChevronDown size={16} />} onPress={() => openSheet("period")} />
    <Chip label={kindFacetLabel(applied)} aria-label={`${kindFacetLabel(applied)}, ${copy.facetChange}`} aria-haspopup="dialog" trailing={<ChevronDown size={16} />} onPress={() => openSheet("kind")} />
  </Stack>;

  const sheetContent = (draft: DiscoveryFilters, setDraft: (next: DiscoveryFilters) => void) => <Stack gap="xl">
    {scope !== "period" ? <Stack gap="sm">
      {scope === "all" ? <Heading level="level5" semanticLevel={3}>{copy.kindTitle}</Heading> : null}
      <Stack axis="inline" wrap gap="xs" role="group" aria-label={copy.kindTitle}>{discoveryKinds.map(kind => <Chip key={kind.id} selectionMode="multiple" label={kind.label}
        selected={draft.kinds.includes(kind.id)} onSelectedChange={selected => setDraft(toggleDiscoveryKind(draft, kind.id, selected))} />)}</Stack>
    </Stack> : null}
    {scope !== "kind" ? <Stack gap="sm">
      {scope === "all" ? <Heading level="level5" semanticLevel={3}>{copy.periodTitle}</Heading> : null}
      <Stack axis="inline" wrap gap="xs" role="radiogroup" aria-label={copy.periodTitle}>{discoveryPeriods.map(period => <Chip key={period.id} selectionMode="single" label={period.label}
        selected={draft.period === period.id} onSelectedChange={() => setDraft({ ...draft, period: period.id })} />)}</Stack>
    </Stack> : null}
    {scope === "all" ? <Stack gap="sm">
      <Heading level="level5" semanticLevel={3}>{copy.conditionTitle}</Heading>
      <Switch presentation="row" label={copy.photoOnlyRow} checked={draft.photoOnly} onCheckedChange={photoOnly => setDraft({ ...draft, photoOnly })} />
      <Switch presentation="row" label={copy.savedOnlyRow} checked={draft.savedOnly} onCheckedChange={savedOnly => setDraft({ ...draft, savedOnly })} />
    </Stack> : null}
  </Stack>;

  return <Stack gap="sm">
    {tools ? <Button tone="ghost" onClick={() => { failRef.current = !failNext; setFailNext(!failNext); }}>{failNext ? copy.failNextArmed : copy.failNext}</Button> : null}
    <div style={{ height: "90dvh" }}>
      {/* Keep the search mounted behind detail so query, conditions, sort and scroll survive the round trip. */}
      <div ref={searchHost} hidden={!!detail || home} style={{ height: "100%" }}>
        <SearchScreen title={copy.screenTitle} queryLabel={copy.queryLabel} queryClearLabel={copy.clear}
          leading={<IconButton label={copy.back} tone="ghost" onClick={() => setHome(true)}><ChevronLeft size={20} /></IconButton>}
          state={restricted ? { kind: "restricted", title: copy.restrictedTitle, description: copy.restrictedBody } : { kind: "ready" }}
          stateAction={restricted ? <Button onClick={() => setRestricted(false)}>{copy.login}</Button> : null}
          query={query} onQueryChange={value => { setQuery(value); if (!value.trim()) setCommitted(""); }}
          onSearch={(value, { signal }) => { if (!signal.aborted) setSuggestFor(value); }}
          committedQuery={committed} onSubmit={commit} filtersOverflow="scroll" filters={rail}
          // Reference search services show the target as a placeholder only; the label stays the accessible name.
          queryLabelVisibility="hidden" searching={status === "loading"} searchingLabel={copy.loadingLabel}
          recentQueries={{ items: recents, title: copy.recentTitle, clearAllLabel: copy.recentClearAll, onClearAll: () => setRecents([]),
            removeLabel: copy.recentRemove, onRemove: item => setRecents(items => items.filter(value => value !== item)), icon: <History size={18} />, removeIcon: <X size={18} /> }}
          suggestedQueries={{ title: copy.topicsTitle, items: discoveryTopics }}
          suggestions={{ items: suggestDiscovery(suggestFor).map(item => ({ query: item.text, match: item })), commitLabel: copy.commitRow, countLabel: copy.suggestionCount, icon: <Search size={18} /> }}
          resultSummary={{
            count: status === "loading" ? null : results.length, countLabel: copy.resultCount, loadingLabel: copy.loadingLabel,
            sort: { label: copy.sortLabel, triggerLabel: copy.sortTrigger(sortLabel(sort)), value: sort, options: discoverySorts, icon: <ChevronDown size={16} />,
              onChange: id => { setSort(id as DiscoverySort); request({ ...current, sort: id as DiscoverySort }); } },
            ...(status === "error" ? { notice: <Notice tone="danger" title={copy.errorTitle} description={copy.errorBody} action={<Button tone="secondary" size="small" onClick={() => request(current)}>{copy.retry}</Button>} /> } : {}),
            empty: filtered ? { title: copy.emptyFilterTitle, description: copy.emptyFilterBody } : { title: copy.emptyQueryTitle(shown.query), description: copy.emptyQueryBody },
          }}
          appliedFilters={{ items: appliedFilterChips(applied), removeLabel: copy.removeFilter, onRemove: key => applyFilters(removeDiscoveryFilter(applied, key as AppliedFilterKey)),
            clearAllLabel: copy.clearFilters, onClearAll: () => applyFilters(resetDiscoveryFilters(applied, "all")), removeIcon: <X size={14} /> }}
          filterSheet={{ open: sheetOpen, onOpenChange: open => { if (open) setScope("all"); setSheetOpen(open); },
            title: scope === "kind" ? copy.kindTitle : scope === "period" ? copy.periodTitle : copy.filter, size: scope === "all" ? "large" : "auto",
            value: applied, onApply: applyFilters, count: draft => countDiscovery(committed, draft),
            reset: draft => resetDiscoveryFilters(draft, scope), isDefault: draft => isDiscoveryFilterDefault(draft, scope), renderContent: sheetContent,
            labels: { close: copy.close, reset: copy.sheetReset, apply: count => copy.sheetApply(count ?? 0) },
            trigger: { label: copy.filterLabel, accessibilityLabel: copy.filterAccessible, icon: <SlidersHorizontal size={16} /> } }}>
          <Stack gap="xxs">
            {results.slice(0, visible).map(entry => <ListRow key={entry.id} title={<Highlighted text={entry.title} range={highlightRange(entry.title, shown.query)} />} description={entryDescription(entry)} onClick={event => openDetail(entry, event.currentTarget)} />)}
            {results.length > discoveryPageSize ? <LoadMore mode="manual" density="compact" onLoadMore={async () => setVisible(value => value + discoveryPageSize)}
              descriptor={{ labels: copy.loadMore, state: visible >= results.length ? { status: "complete" } : { status: "ready", requestKey: `page-${visible}` } }} /> : null}
          </Stack>
        </SearchScreen>
      </div>
      {detail ? <ScreenLayout title={copy.detailTitle} leading={<IconButton autoFocus label={copy.back} tone="ghost" onClick={closeDetail}><ChevronLeft size={20} /></IconButton>}>
        <Stack gap="lg">{detail.hasPhoto ? <PreviewPhoto index={Number(detail.id) % 3} label={detail.title} /> : null}<Heading level="level4" semanticLevel={2}>{detail.title}</Heading><Text tone="muted">{entryDescription(detail)}</Text><Text>{detail.excerpt}</Text></Stack>
      </ScreenLayout> : null}
      {home ? <ScreenLayout title={copy.home}><Button onClick={() => setHome(false)}>{copy.reopen}</Button></ScreenLayout> : null}
    </div>
  </Stack>;
}

/** Result titles still bold the match; the suggestion rows get the same from SearchScreen via `match`. */
function Highlighted({ text, range }: { text: string; range: Readonly<{ start: number; end: number }> | null }) {
  if (!range) return <>{text}</>;
  return <>{text.slice(0, range.start)}<Text as="span" emphasis="strong">{text.slice(range.start, range.end)}</Text>{text.slice(range.end)}</>;
}
