// vitest (vite-node) implements import.meta.glob; the packages do not depend on vite directly, so the
// `vite/client` reference is unavailable and the tests declare the one member they use (2026-10-18).
interface ImportMeta {
  glob<T = unknown>(pattern: string): Record<string, () => Promise<T>>;
}
