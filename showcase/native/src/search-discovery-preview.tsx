import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { ChevronDown, ChevronLeft, History, Search, SlidersHorizontal, X } from "lucide-react-native";
import { SearchScreen } from "@hjmds/react-native/screen-flows";
import { ScreenLayout } from "@hjmds/react-native/screens";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { Button, IconButton } from "@hjmds/react-native/actions";
import { Chip, Switch } from "@hjmds/react-native/inputs";
import { ListRow } from "@hjmds/react-native/data-display";
import { Heading } from "@hjmds/react-native/heading";
import { LoadMore } from "@hjmds/react-native/navigation";
import { Notice } from "@hjmds/react-native/feedback";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { PreviewPhoto } from "./reference-screen-parts";
import {
  appliedFilterChips, commitRecentSearch, countDiscovery, discoveryCopy as copy, discoveryKinds,
  discoveryPageSize, discoveryPeriods, discoverySeed, discoverySorts, discoveryTopics, entryDescription,
  isDiscoveryFilterDefault, kindFacetLabel, periodFacetLabel, removeDiscoveryFilter,
  resetDiscoveryFilters, searchDiscovery, sortLabel, suggestDiscovery, toggleDiscoveryKind,
  type AppliedFilterKey, type DiscoveryEntry, type DiscoveryFilters, type DiscoverySort, type DiscoveryView, type FilterScope,
} from "../../shared/search-discovery";

type Params = Readonly<{ query: string; filters: DiscoveryFilters; sort: DiscoverySort }>;
export type SearchDiscoveryPreviewProps = Readonly<{ view?: DiscoveryView; tools?: boolean }>;

/**
 * Native twin of the Web preview: product-side wiring of the public SearchScreen two-step API (2026-10-06).
 * This file owns only example data, requests, icons and copy; phases, commit routing, sections, the
 * draft/applied filter sheet, empty causes, loading rows and count announcements are SearchScreen's.
 */
export function SearchDiscoveryPreview({ view = "idle", tools = false }: SearchDiscoveryPreviewProps) {
  const { colors } = useHjmNativeTheme();
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
  useEffect(() => () => clearTimeout(timer.current), []);

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

  const results = searchDiscovery(shown.query, shown.filters, shown.sort);
  const filtered = appliedFilterChips(applied).length > 0;
  const icon = { color: colors.text, size: 16 } as const;
  const muted = { color: colors.textMuted, size: 18 } as const;

  // Product-owned chips after SearchScreen's own "필터" trigger: quick toggles apply at once, facets open one section.
  const rail = <Stack axis="inline" gap="xs">
    <Chip selectionMode="multiple" label={copy.photoOnly} selected={applied.photoOnly} onPress={photoOnly => applyFilters({ ...applied, photoOnly })} />
    <Chip selectionMode="multiple" label={copy.savedOnly} selected={applied.savedOnly} onPress={savedOnly => applyFilters({ ...applied, savedOnly })} />
    <Chip label={periodFacetLabel(applied)} accessibilityLabel={`${periodFacetLabel(applied)}, ${copy.facetChange}`} trailing={<ChevronDown {...icon} />} onPress={() => openSheet("period")} />
    <Chip label={kindFacetLabel(applied)} accessibilityLabel={`${kindFacetLabel(applied)}, ${copy.facetChange}`} trailing={<ChevronDown {...icon} />} onPress={() => openSheet("kind")} />
  </Stack>;

  const sheetContent = (draft: DiscoveryFilters, setDraft: (next: DiscoveryFilters) => void) => <Stack gap="xl">
    {scope !== "period" ? <Stack gap="sm">
      {scope === "all" ? <Heading level="level5">{copy.kindTitle}</Heading> : null}
      <Stack axis="inline" wrap gap="xs" accessibilityLabel={copy.kindTitle}>{discoveryKinds.map(kind => <Chip key={kind.id} selectionMode="multiple" label={kind.label}
        selected={draft.kinds.includes(kind.id)} onPress={selected => setDraft(toggleDiscoveryKind(draft, kind.id, selected))} />)}</Stack>
    </Stack> : null}
    {scope !== "kind" ? <Stack gap="sm">
      {scope === "all" ? <Heading level="level5">{copy.periodTitle}</Heading> : null}
      <Stack axis="inline" wrap gap="xs" accessibilityRole="radiogroup" accessibilityLabel={copy.periodTitle}>{discoveryPeriods.map(period => <Chip key={period.id} selectionMode="single" label={period.label}
        selected={draft.period === period.id} onPress={() => setDraft({ ...draft, period: period.id })} />)}</Stack>
    </Stack> : null}
    {scope === "all" ? <Stack gap="sm">
      <Heading level="level5">{copy.conditionTitle}</Heading>
      <Switch presentation="row" label={copy.photoOnlyRow} checked={draft.photoOnly} onCheckedChange={photoOnly => setDraft({ ...draft, photoOnly })} />
      <Switch presentation="row" label={copy.savedOnlyRow} checked={draft.savedOnly} onCheckedChange={savedOnly => setDraft({ ...draft, savedOnly })} />
    </Stack> : null}
  </Stack>;

  return <Stack gap="sm">
    {tools ? <Button tone="ghost" onPress={() => { failRef.current = !failNext; setFailNext(!failNext); }}>{failNext ? copy.failNextArmed : copy.failNext}</Button> : null}
    <View style={{ height: 720 }}>
      {/* Keep the search mounted behind detail so query, conditions and sort survive the round trip. */}
      <View style={{ flex: 1, display: detail || home ? "none" : "flex" }}>
        <SearchScreen title={copy.screenTitle} queryLabel={copy.queryLabel} queryClearLabel={copy.clear}
          leading={<IconButton label={copy.back} tone="ghost" onPress={() => setHome(true)}><ChevronLeft color={colors.text} size={20} /></IconButton>}
          state={restricted ? { kind: "restricted", title: copy.restrictedTitle, description: copy.restrictedBody } : { kind: "ready" }}
          stateAction={restricted ? <Button onPress={() => setRestricted(false)}>{copy.login}</Button> : null}
          query={query} onQueryChange={value => { setQuery(value); if (!value.trim()) setCommitted(""); }}
          onSearch={(value, { signal }) => { if (!signal.aborted) setSuggestFor(value); }}
          committedQuery={committed} onSubmit={commit} filtersOverflow="scroll" filters={rail}
          // Reference search services show the target as a placeholder only; the label stays the accessible name.
          queryLabelVisibility="hidden" searching={status === "loading"} searchingLabel={copy.loadingLabel}
          scrollProps={{ keyboardDismissMode: "on-drag" }}
          recentQueries={{ items: recents, title: copy.recentTitle, clearAllLabel: copy.recentClearAll, onClearAll: () => setRecents([]),
            removeLabel: copy.recentRemove, onRemove: item => setRecents(items => items.filter(value => value !== item)), icon: <History {...muted} />, removeIcon: <X {...muted} /> }}
          suggestedQueries={{ title: copy.topicsTitle, items: discoveryTopics }}
          suggestions={{ items: suggestDiscovery(suggestFor).map(item => ({ query: item.text })), commitLabel: copy.commitRow, countLabel: copy.suggestionCount, icon: <Search {...muted} /> }}
          resultSummary={{
            count: status === "loading" ? null : results.length, countLabel: copy.resultCount, loadingLabel: copy.loadingLabel,
            sort: { label: copy.sortLabel, triggerLabel: copy.sortTrigger(sortLabel(sort)), value: sort, options: discoverySorts, dismissLabel: copy.close, icon: <ChevronDown {...icon} />,
              onChange: id => { setSort(id as DiscoverySort); request({ ...current, sort: id as DiscoverySort }); } },
            ...(status === "error" ? { notice: <Notice tone="danger" announcement="assertive" title={copy.errorTitle} description={copy.errorBody} action={<Button tone="secondary" size="small" onPress={() => request(current)}>{copy.retry}</Button>} /> } : {}),
            empty: filtered ? { title: copy.emptyFilterTitle, description: copy.emptyFilterBody } : { title: copy.emptyQueryTitle(shown.query), description: copy.emptyQueryBody },
          }}
          appliedFilters={{ items: appliedFilterChips(applied), removeLabel: copy.removeFilter, onRemove: key => applyFilters(removeDiscoveryFilter(applied, key as AppliedFilterKey)),
            clearAllLabel: copy.clearFilters, onClearAll: () => applyFilters(resetDiscoveryFilters(applied, "all")), removeIcon: <X {...icon} size={14} /> }}
          filterSheet={{ open: sheetOpen, onOpenChange: open => { if (open) setScope("all"); setSheetOpen(open); },
            title: scope === "kind" ? copy.kindTitle : scope === "period" ? copy.periodTitle : copy.filter, size: scope === "all" ? "large" : "auto",
            value: applied, onApply: applyFilters, count: draft => countDiscovery(committed, draft),
            reset: draft => resetDiscoveryFilters(draft, scope), isDefault: draft => isDiscoveryFilterDefault(draft, scope), renderContent: sheetContent,
            labels: { close: copy.close, reset: copy.sheetReset, apply: count => copy.sheetApply(count ?? 0) },
            trigger: { label: copy.filterLabel, accessibilityLabel: copy.filterAccessible, icon: <SlidersHorizontal {...icon} /> } }}>
          <Stack gap="xxs">
            {results.slice(0, visible).map(entry => <ListRow key={entry.id} title={entry.title} description={entryDescription(entry)} onPress={() => setDetail(entry)} />)}
            {results.length > discoveryPageSize ? <LoadMore mode="manual" density="compact" onLoadMore={async () => setVisible(value => value + discoveryPageSize)}
              descriptor={{ labels: copy.loadMore, state: visible >= results.length ? { status: "complete" } : { status: "ready", requestKey: `page-${visible}` } }} /> : null}
          </Stack>
        </SearchScreen>
      </View>
      {detail ? <ScreenLayout title={copy.detailTitle} leading={<IconButton label={copy.back} tone="ghost" onPress={() => setDetail(null)}><ChevronLeft color={colors.text} size={20} /></IconButton>}>
        <Stack gap="lg">{detail.hasPhoto ? <PreviewPhoto index={Number(detail.id) % 3} label={detail.title} /> : null}<Heading level="level4">{detail.title}</Heading><Text tone="muted">{entryDescription(detail)}</Text><Text>{detail.excerpt}</Text></Stack>
      </ScreenLayout> : null}
      {home ? <ScreenLayout title={copy.home}><Button onPress={() => setHome(false)}>{copy.reopen}</Button></ScreenLayout> : null}
    </View>
  </Stack>;
}
