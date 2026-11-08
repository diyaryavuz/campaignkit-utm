import { describe, expect, it } from 'vitest';
import { backup, createRecord, csv, isStrictCreatedAt, mergeRecords, parseBackup } from './library';
import { emptyCampaign } from './campaign';
const campaign = { ...emptyCampaign, url: 'https://example.com', source: 'instagram', medium: 'paid_social', campaign: 'autumn' };
describe('local campaign library', () => {
  it('round trips a backup and ignores a forged generated link', () => {
    const original = createRecord(campaign);
    const data = JSON.parse(backup([original]));
    data.records[0].link = 'javascript:alert(1)';
    const parsed = parseBackup(JSON.stringify(data));
    expect(parsed[0].link).toBe(original.link);
    expect(parsed[0].createdAt).toBe(original.createdAt);
  });
  it('rejects invalid backup rows as a whole', () => {
    const data = JSON.parse(backup([createRecord(campaign)]));
    data.records.push({ campaign: { ...campaign, url: 'javascript:alert(1)' } });
    expect(() => parseBackup(JSON.stringify(data))).toThrow();
    expect(() => parseBackup('{broken')).toThrow();
    expect(() => parseBackup('{"version":2,"records":[]}')).toThrow();
    expect(() => parseBackup('x'.repeat(5_000_001))).toThrow();
  });
  it('merges without overwriting or duplicating existing records', () => {
    const first = createRecord(campaign);
    const second = createRecord({ ...campaign, content: 'video' });
    const merged = mergeRecords([first], [createRecord(campaign), second]);
    expect(merged).toHaveLength(2);
    expect(merged[0]).toBe(first);
    expect(() => mergeRecords(Array.from({length:500},(_,i)=>({...first,link:'https://example.com/?id='+i})),[second])).toThrow('LIBRARY_LIMIT');
  });
  it('escapes CSV quotes and neutralizes formula prefixes', () => {
    const file = csv([createRecord({ ...campaign, campaign: '=1+1', content: 'a,"b"\nline' })]);
    expect(file.startsWith('\uFEFF')).toBe(true);
    expect(file).toContain('"\'=1+1"');
    expect(file).toContain('"a,""b""\nline"');
    expect(csv([createRecord({ ...campaign, term: '  +SUM(A1)' })])).toContain("'  +SUM(A1)");
  });
  it('keeps only calendar-real createdAt values from imports', () => {
    const base = createRecord(campaign);
    const payload = (createdAt: string) => {
      const data = JSON.parse(backup([base]));
      data.records[0].createdAt = createdAt;
      return parseBackup(JSON.stringify(data))[0];
    };
    // Impossible dates fall back to a fresh timestamp instead of Date normalizing them.
    const feb30 = payload('2023-02-30T12:00:00.000Z');
    expect(feb30.createdAt).not.toBe(new Date('2023-02-30T12:00:00.000Z').toISOString());
    expect(Number.isFinite(Date.parse(feb30.createdAt))).toBe(true);
    const nonLeap = payload('2023-02-29T12:00:00.000Z');
    expect(nonLeap.createdAt).not.toBe(new Date('2023-02-29T12:00:00.000Z').toISOString());
    // Leap years including century rule: 2000 yes, 1900 no, 2024 yes.
    expect(payload('2024-02-29T12:00:00.000Z').createdAt).toBe('2024-02-29T12:00:00.000Z');
    expect(payload('2000-02-29T00:00:00.000Z').createdAt).toBe('2000-02-29T00:00:00.000Z');
    expect(payload('1900-02-29T00:00:00.000Z').createdAt).not.toBe(new Date('1900-02-29T00:00:00.000Z').toISOString());
    // Valid timezone offsets preserve the instant as ISO UTC.
    expect(payload('2024-06-01T15:30:00+05:00').createdAt).toBe('2024-06-01T10:30:00.000Z');
    expect(payload('2024-06-01T10:30:00-05:00').createdAt).toBe('2024-06-01T15:30:00.000Z');
  });
});

it('preserves stable library IDs across reloads and repairs duplicate imported IDs', () => {
  const first = createRecord(campaign), second = createRecord({...campaign, content:'second'});
  expect(parseBackup(backup([first]))[0].id).toBe(first.id);
  second.id = first.id;
  const parsed = parseBackup(backup([first,second]));
  expect(parsed[0].id).toBe(first.id);
  expect(parsed[1].id).not.toBe(first.id);
});

it('rejects normalized midnight and incomplete backup timestamps', () => {
  for (const value of ['2026-11-08T24:00:00Z','2026-11-08T12:00Z','2026-11-08T12:00:00','2026-11-08T12:60:00Z']) expect(isStrictCreatedAt(value)).toBe(false);
  expect(isStrictCreatedAt('2026-11-08T12:00:00.123+03:00')).toBe(true);
});

it('skips links differing only in query key order without rewriting the original', () => {
  const first = createRecord({...campaign,url:'https://example.com/?b=2&a=1#keep'});
  const reordered = createRecord({...campaign,url:'https://example.com/?a=1&b=2#keep'});
  expect(mergeRecords([first],[reordered])).toEqual([first]);
  const different = createRecord({...campaign,url:'https://example.com/?a=1&b=2#other'});
  expect(mergeRecords([first],[different])).toHaveLength(2);
});
