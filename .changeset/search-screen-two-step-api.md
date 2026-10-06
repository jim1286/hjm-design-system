---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

SearchScreen now owns the two-step search flow that only existed in the Storybook preview, so products can adopt it through the public API instead of copying Showcase code. All props are optional and additive on Web and Native; without them SearchScreen renders and behaves exactly as before.

- `committedQuery` (requires `onSubmit`) splits idle / typing / results. Every commit — Enter or the keyboard search key, the "search ‘q’" row, a suggestion, a recent or suggested query — goes through `onSubmit` with a trimmed, nonblank value; debounced `onSearch` never does, so "record only committed searches" holds at the API. `onSubmit` (unreleased) now trims and drops blank commits.
- `recentQueries` (rows commit, per-row remove, clear all), `suggestedQueries` (chips, also shown under a query-caused zero result) and `suggestions` (commit row plus up to six rows, `match` bolded on Web).
- `resultSummary` (count with polite announcement, `null` = loading skeleton rows instead of `children`, sort Menu that scrolls back to the top, a `notice` slot for retained-results errors, `empty` copy with a cause-specific recovery), `appliedFilters` (removable chips plus clear all) and `filterSheet` (draft copied on open, discarded on any close, applied only from the primary action whose label carries the live `count(draft)`; reset always present and disabled at the default; optional rail trigger named with the applied count).
- Web moves focus after removing an applied chip or recent row to the next item, then the filter trigger or the search field. Native keeps the screen-reader cursor.
- `queryLabelVisibility="hidden"` drops the visible label and uses `queryLabel` as the accessible name and placeholder.
- `searching` + `searchingLabel` (both or neither) is one name for the default field's progress (Web `loading`, Native `busy`/`busyLabel`). Native SearchField ignores typing while busy, so turn it on for committed result requests only.
- `@hjmds/design-contracts/screen-patterns` adds `resolveSearchScreenPhase`, `resolveSearchCommit`, `resolveSearchEmptyCause`, `resolveFocusAfterRemoval` and `searchScreenRecipe`.

The `배포/화면/검색/검색 결과와 필터` previews now use this API and keep only example data. Native `./screen-flows` and `./saved-items` gain two reviewed module edges (heading, navigation). No migration is needed.
