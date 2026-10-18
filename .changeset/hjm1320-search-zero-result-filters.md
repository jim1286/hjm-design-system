---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

SearchScreen accepts `filtersRole` (`"narrow"` default, `"scope"`). Scope filters choose what is searched (search kind, region, map area), so the filter rail and sheet trigger now stay on a query-caused zero result as its recovery path instead of being hidden; narrowing filters keep the previous behaviour. The rule moved to the new contract resolver `resolveSearchFilterRailVisible` (with `SearchFiltersRole`) that both renderers call.
