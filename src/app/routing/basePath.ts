/**
 * Prefixes an app-absolute path (e.g. "/demo/fundicao-dc") with Vite's
 * configured base path, so plain `<a href>` tags and manual History API
 * calls resolve correctly under a subpath deploy (GitHub Pages project
 * pages serve at "/<repo>/"), not just at the domain root used locally.
 */
export function withBase(path: string): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;
}
