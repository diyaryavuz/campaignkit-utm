import { expect, it } from 'vitest';
import { emptyCampaign } from './campaign';
import { addTemplate, mergeTemplates, parseTemplates, serializeTemplates, TEMPLATE_LIMIT } from './templates';

it('round-trips exact UTM values without saving the destination', () => {
  const templates = addTemplate([], '  Newsletter  ', { ...emptyCampaign, url: 'https://example.com/private', source: 'Email Team', medium: 'email' });
  expect(parseTemplates(serializeTemplates(templates))).toEqual([{ name: 'Newsletter', values: { source: 'Email Team', medium: 'email', campaign: '', content: '', term: '' } }]);
  expect(serializeTemplates(templates)).not.toContain('https://example.com/private');
});

it('rejects empty fields, duplicate names, excessive fields and the template limit', () => {
  const campaign = { ...emptyCampaign, source: 'newsletter' };
  const first = addTemplate([], 'Weekly', campaign);
  expect(() => addTemplate([], 'Empty', emptyCampaign)).toThrow();
  expect(() => addTemplate(first, ' weekly ', campaign)).toThrow();
  expect(() => addTemplate([], 'Long', { ...campaign, source: 'a'.repeat(201) })).toThrow();
  const full = Array.from({ length: TEMPLATE_LIMIT }, (_, index) => ({ ...first[0], name: String(index) }));
  expect(() => addTemplate(full, 'Extra', campaign)).toThrow();
  expect(first).toHaveLength(1);
});

it('rejects malformed or unsupported stored data', () => {
  for (const raw of ['{broken', '{"version":2,"templates":[]}', '{"version":1,"templates":[{"name":"bad","values":{}}]}', 'x'.repeat(100_001)]) {
    expect(() => parseTemplates(raw)).toThrow();
  }
});

it('merges template backups additively and rejects conflicting names as a whole',()=>{
  const existing=addTemplate([],'Weekly',{...emptyCampaign,source:'newsletter'});
  expect(mergeTemplates(existing,existing)).toEqual(existing);
  const added=addTemplate([],'Social',{...emptyCampaign,source:'instagram'});
  expect(mergeTemplates(existing,added)).toHaveLength(2);
  expect(()=>mergeTemplates(existing,addTemplate([],'weekly',{...emptyCampaign,source:'other'}))).toThrow('TEMPLATE_CONFLICT');
  expect(existing).toHaveLength(1);
});
