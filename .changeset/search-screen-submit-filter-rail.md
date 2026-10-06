---
"@hjmds/react": minor
"@hjmds/react-native": minor
---

SearchScreen gains two optional props on Web and Native. `onSubmit(query)` is the commit signal of the default search field (Web Enter with `enterKeyHint="search"`, ignored while an IME is composing; Native keyboard search key via `returnKeyType="search"`/`onSubmitEditing`), so products can separate typing suggestions from committed results and record only committed recent searches without rebuilding the field through `queryField` (which keeps owning its own submit). `filtersOverflow="scroll"` keeps `filters` on one horizontally scrolling line that bleeds to the screen edges (Web `.hjm-search-screen__filters`, Native horizontal `ScrollView`), capping the pinned area at large text; the default `"wrap"` keeps the previous layout. No migration is needed.

The experimental Storybook search screens (`실험/화면/공통 화면/검색`, `실험/화면/기본 흐름/검색과 필터`) are redesigned around two-step search, a pinned chip rail, a draft/applied filter sheet with a live result count, sort in the results header, and in-body loading/empty/error states, sharing one Web/Native fixture. New still-state stories: typing, results, filtered, filter sheet; `Empty` now means zero results.
