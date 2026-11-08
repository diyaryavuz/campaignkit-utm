import { describe, expect, it } from 'vitest';
import { buildLink, buildVariants, emptyCampaign, normalizeValue, validate } from './campaign';
const sample = { ...emptyCampaign, url: 'https://example.com/offer?ref=home#details', source: 'instagram', medium: 'paid_social', campaign: 'autumn_2026' };
describe('campaign links', () => {
  it('preserves query and fragment, safely encodes values', () => {
    const url = new URL(buildLink({ ...sample, content: 'story & video + Türkçe' }));
    expect(url.searchParams.get('ref')).toBe('home');
    expect(url.hash).toBe('#details');
    expect(url.searchParams.get('utm_content')).toBe('story & video + Türkçe');
  });
  it.each(['javascript:alert(1)', 'ftp://example.com', 'example.com', 'https://'])('rejects invalid URL: %s', url => {
    expect(() => buildLink({ ...sample, url })).toThrow();
  });
  it('rejects credentials, missing fields and oversize values', () => {
    expect(validate({ ...sample, url: 'https://user:secret@example.com' }).errors).toContainEqual({ field: 'url', code: 'credentials' });
    expect(() => buildLink({ ...sample, source: '  ' })).toThrow();
    expect(() => buildLink({ ...sample, campaign: 'x'.repeat(201) })).toThrow();
  });
  it('replaces duplicate UTM keys, removes empty optional fields, preserves identifiers', () => {
    const url = new URL(buildLink({ ...sample, url: 'https://example.com/?utm_source=old&utm_source=older&utm_content=old&gclid=abc&utm_id=42' }));
    expect(url.searchParams.getAll('utm_source')).toEqual(['instagram']);
    expect(url.searchParams.has('utm_content')).toBe(false);
    expect(url.searchParams.get('gclid')).toBe('abc');
    expect(url.searchParams.get('utm_id')).toBe('42');
    expect(validate({ ...sample, url: url.href }).warnings.some(x => x.code === 'tracking')).toBe(true);
  });
  it('warns without silently normalizing', () => {
    const input = { ...sample, campaign: 'İlk Kampanya' };
    expect(validate(input).warnings).toContainEqual({ field: 'campaign', code: 'case' });
    expect(new URL(buildLink(input)).searchParams.get('utm_campaign')).toBe('İlk Kampanya');
    expect(normalizeValue('  İLK Yaz İndirimi  ')).toBe('ilk_yaz_indirimi');
  });
  it('validates bulk rows independently', () => {
    const rows = buildVariants(sample, [{ id: '1', source: '', medium: 'email', content: '' }, { id: '2', source: 'newsletter', medium: 'email', content: 'cta' }]);
    expect(rows[0].errors.length).toBeGreaterThan(0);
    expect(rows[1].errors).toHaveLength(0);
    expect(rows[1].campaign.campaign).toBe(sample.campaign);
    expect(() => buildVariants(sample, [])).toThrow();
  });
});

it('rejects hidden control characters instead of silently stripping them from URLs', () => {
  for (const url of ['https://exa\tmple.com', 'https://example.com/a\nb', 'https://example.com/\u0000']) expect(() => buildLink({...sample,url})).toThrow('INVALID_CAMPAIGN');
  expect(new URL(buildLink({...sample,url:'https://example.com/a%0Ab'})).pathname).toBe('/a%0Ab');
});

it('warns about uppercase characters beyond the Latin and Turkish alphabets', () => {
  for (const campaign of ['Été','Αθήνα','Кампания']) expect(validate({...sample,campaign}).warnings).toContainEqual({field:'campaign',code:'case'});
  expect(validate({...sample,campaign:'été'}).warnings).not.toContainEqual({field:'campaign',code:'case'});
});
