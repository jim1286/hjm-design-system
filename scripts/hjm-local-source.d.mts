export function localSource(root: string, env?: NodeJS.ProcessEnv): null | { root: string; projectRoot: string; aliases: Record<string, string>; peers: string[] };
export function withMetro<T>(config: T, root: string, env?: NodeJS.ProcessEnv): T;
export function withNext<T>(config: T, root: string, phase: string, env?: NodeJS.ProcessEnv): T;
// Bundler hook signatures differ across installed Vite versions; keep this adapter dependency-free.
export function vitePlugin(root?: string, env?: NodeJS.ProcessEnv): { name: string; enforce: 'pre'; config: (...args: any[]) => any; resolveId: (...args: any[]) => any };
