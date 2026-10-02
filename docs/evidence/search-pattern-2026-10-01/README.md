# Search pattern — 2026-10-01

Both Storybooks: `Patterns/Search`, Default/Dark/LargeText. This is a composition of existing Surface, SearchField, Button, List/ListRow, EmptyState and Sheet. No new search renderer or overlay engine is exported.

The four records are original synthetic showcase copy. Search runs synchronously on local data with NFKC normalization, Korean-locale lowercase, whitespace-separated terms and category intersection. This source has no network loading/error or permission state; a product-backed version must supply those actual source states instead of simulated request results.

[Browser evidence](browser.json) covers 390 × 844 for all three variants: query, result selection, Sheet close, empty result, reset and category selection. Each ends with one place result and no horizontal overflow. [Large text](large-text.png). Shared filter tests and both showcase checks passed. Native Default/Dark/LargeText initial views and the memo filter → detail → close flow were subsequently verified on iPhone 17 / iOS 27.0; see the [Native follow-up](../native-visual-integration-2026-10-01/README.md). No product search or private data was accessed.
