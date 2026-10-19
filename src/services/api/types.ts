/**
 * API response types that components may import. Components and pages must not
 * import the API modules themselves: go through a thunk (shared state) or a
 * hook (transient server state). See the no-restricted-imports override in
 * .eslintrc.json.
 */
export type { GetCollectionResult, GlobalSearchResult } from "./datasets";
