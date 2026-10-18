---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Pagination accepts results without a known total: `descriptor={{ currentPage, hasNext }}` with `composeCurrentPageLabel({ page })` renders previous, a product-composed current page label (`paginationRecipe.pageLabel`) and next, with no numbered window. Contracts add `PaginationOpenEndedDescriptor`, `isPaginationOpenEndedDescriptor` and `resolvePaginationOpenEndedDescriptor`; the bounded forms and `composeAccessibleName` are unchanged.
