export const USD_TO_KES = 135;

export function usdToKes(usd: number): number {
  if (!Number.isFinite(usd)) return 0;
  return Math.round(usd * USD_TO_KES);
}

export function kesToUsd(kes: number): number {
  if (!Number.isFinite(kes)) return 0;
  return Math.round((kes / USD_TO_KES) * 100) / 100;
}

export function formatPrice(usd: number): string {
  return usdToKes(usd).toLocaleString('en-KE');
}

export function formatAmount(kes: number): string {
  return Math.round(kes).toLocaleString('en-KE');
}

export function formatKshLabelFromKes(kes: number): string {
  return `KSh ${formatAmount(kes)}`;
}

export function formatCompactKes(kes: number): string {
  const n = Math.round(Number(kes) || 0);
  if (n >= 1_000_000) return `KSh ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `KSh ${Math.round(n / 1_000)}K`;
  return formatKshLabelFromKes(n);
}

/** Ensure displayed prices include KSh prefix */
export function formatKshLabel(value: string | number): string {
  const text = typeof value === 'number' ? formatAmount(value) : String(value).trim();
  if (!text) return 'KSh 0';
  if (/^ksh/i.test(text)) return text;
  const numeric = text.replace(/[^0-9.,]/g, '');
  return numeric ? `KSh ${numeric}` : text;
}

/** @deprecated use formatPrice */
export const formatKsh = formatPrice;
/** @deprecated use formatAmount */
export const formatKshAmount = formatAmount;

/** Parse formatted price strings (with or without currency prefix) */
export function parseKsh(value: string): number {
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** Strip KSh / $ prefix for money input fields */
export function stripCurrencyPrefix(value: string): string {
  return String(value)
    .replace(/^(est\.?\s*)?(ksh|kes|\$)\s*/i, '')
    .replace(/,/g, '')
    .trim();
}
