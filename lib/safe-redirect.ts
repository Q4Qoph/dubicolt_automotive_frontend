/** Allow only same-origin relative paths (no protocol-relative URLs). */
export function safeRedirectPath(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;
  return trimmed;
}
