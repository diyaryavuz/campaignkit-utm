export const fields = ['source', 'medium', 'campaign', 'content', 'term'] as const;
export type Field = typeof fields[number];
export type Campaign = { url: string } & Record<Field, string>;
export type Issue = { field: keyof Campaign; code: 'required' | 'url' | 'credentials' | 'length' | 'case' | 'spaces' | 'existing' | 'tracking' };
export const emptyCampaign: Campaign = { url: '', source: '', medium: '', campaign: '', content: '', term: '' };
export function validate(input: Campaign): { errors: Issue[]; warnings: Issue[] } {
  const errors: Issue[] = [], warnings: Issue[] = [];
  if (!input.url.trim()) errors.push({ field: 'url', code: 'required' });
  else {
    if (/[\u0000-\u001f\u007f]/.test(input.url)) errors.push({ field: 'url', code: 'url' });
    try {
      const url = new URL(input.url.trim());
      if (!['https:', 'http:'].includes(url.protocol)) errors.push({ field: 'url', code: 'url' });
      if (url.username || url.password) errors.push({ field: 'url', code: 'credentials' });
      if (fields.some(f => url.searchParams.has('utm_' + f))) warnings.push({ field: 'url', code: 'existing' });
      if (['gclid', 'dclid', 'gbraid', 'wbraid'].some(f => url.searchParams.has(f))) warnings.push({ field: 'url', code: 'tracking' });
    } catch { errors.push({ field: 'url', code: 'url' }); }
  }
  if (input.url.length > 8000) errors.push({ field: 'url', code: 'length' });
  for (const field of fields) {
    const value = input[field].trim();
    if (['source', 'medium', 'campaign'].includes(field) && !value) errors.push({ field, code: 'required' });
    if (value.length > 200) errors.push({ field, code: 'length' });
    if (/[A-ZİĞÜŞÖÇ]/.test(value)) warnings.push({ field, code: 'case' });
    if (/\s/.test(value)) warnings.push({ field, code: 'spaces' });
  }
  return { errors, warnings };
}
export function buildLink(input: Campaign): string {
  if (validate(input).errors.length) throw new Error('INVALID_CAMPAIGN');
  const url = new URL(input.url.trim());
  for (const field of fields) {
    const key = 'utm_' + field, value = input[field].trim();
    if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
  }
  return url.toString();
}
// Only called by an explicit user action; campaign names are never silently changed.
export function normalizeValue(value: string): string {
  return value.trim().toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/\s+/g, '_');
}
export type Variant = { id: string; source: string; medium: string; content: string };
export function buildVariants(input: Campaign, variants: Variant[]) {
  if (!variants.length || variants.length > 50) throw new Error('VARIANT_LIMIT');
  return variants.map(v => {
    const campaign = { ...input, source: v.source, medium: v.medium, content: v.content };
    return { id: v.id, campaign, ...validate(campaign) };
  });
}
