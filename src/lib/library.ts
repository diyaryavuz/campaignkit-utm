import { buildLink, fields, type Campaign } from './campaign';
export const STORAGE_KEY = 'campaignkit.library.v1';
export const LIMIT = 500;
export type SavedLink = { id: string; createdAt: string; campaign: Campaign; link: string };
export function createRecord(campaign: Campaign): SavedLink {
  return { id: crypto.randomUUID(), createdAt: new Date().toISOString(), campaign: { ...campaign }, link: buildLink(campaign) };
}
export function mergeRecords(existing: SavedLink[], incoming: SavedLink[]): SavedLink[] {
  const links = new Set(existing.map(x => x.link));
  const merged = [...existing];
  for (const item of incoming) if (!links.has(item.link)) { links.add(item.link); merged.push(item); }
  if (merged.length > LIMIT) throw new Error('LIBRARY_LIMIT');
  return merged;
}
export function backup(records: SavedLink[]): string { return JSON.stringify({ version: 1, records }, null, 2); }
/** Leap years: divisible by 4, except centuries unless divisible by 400. */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
/** Accept only calendar-real ISO-like instants; Date.parse alone normalizes Feb 30. */
export function isStrictCreatedAt(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return false;
  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}
export function parseBackup(text: string): SavedLink[] {
  if (text.length > 5_000_000) throw new Error('FILE_TOO_LARGE');
  const data: unknown = JSON.parse(text);
  if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 || !('records' in data) || !Array.isArray(data.records) || data.records.length > LIMIT) throw new Error('INVALID_BACKUP');
  const ids = new Set<string>();
  return mergeRecords([], data.records.map((row: unknown) => {
    if (!row || typeof row !== 'object' || !('campaign' in row) || !row.campaign || typeof row.campaign !== 'object') throw new Error('INVALID_RECORD');
    const source = row.campaign as Record<string, unknown>;
    if (['url', ...fields].some(key => typeof source[key] !== 'string')) throw new Error('INVALID_RECORD');
    const campaign = Object.fromEntries(['url', ...fields].map(key => [key, source[key]])) as Campaign;
    const item = createRecord(campaign); // Never trust a stored URL or HTML; regenerate from validated fields.
    if ('id' in row && typeof row.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id) && !ids.has(row.id.toLowerCase())) item.id = row.id;
    ids.add(item.id.toLowerCase());
    if ('createdAt' in row && typeof row.createdAt === 'string' && isStrictCreatedAt(row.createdAt)) item.createdAt = new Date(row.createdAt).toISOString();
    return item;
  }));
}
export function csv(records: SavedLink[]): string {
  // Prevent spreadsheet formula execution while keeping RFC 4180 quoting.
  const escape = (value: string) => '"' + (/^[=+@\-\t\r\n]/.test(value.trimStart()) || /^[\t\r\n]/.test(value) ? "'" + value : value).replace(/"/g, '""') + '"';
  return '\uFEFF' + [['campaign', 'source', 'medium', 'content', 'term', 'destination', 'generated_url', 'created_at'], ...records.map(r => [r.campaign.campaign, r.campaign.source, r.campaign.medium, r.campaign.content, r.campaign.term, r.campaign.url, r.link, r.createdAt])].map(row => row.map(escape).join(',')).join('\r\n');
}
export function loadLibrary(): { records: SavedLink[]; error: string; raw: string } {
  let raw = '';
  try { raw = localStorage.getItem(STORAGE_KEY) || ''; return { records: raw ? parseBackup(raw) : [], error: '', raw }; }
  catch { return { records: [], error: 'STORAGE_UNAVAILABLE', raw }; }
}
export function persist(records: SavedLink[]): void {
  localStorage.setItem(STORAGE_KEY, backup(records)); // Exceptions bubble up: UI must not claim success.
}
