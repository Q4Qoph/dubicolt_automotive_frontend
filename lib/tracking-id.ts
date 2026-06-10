/** Strip display prefixes (e.g. `#DBK-123`) so IDs are safe in URL paths. */
export function normalizeTrackingId(input: string): string {
  return input.trim().replace(/^#+/, '').trim();
}
