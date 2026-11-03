import { fields, type Campaign, type Field } from './campaign';

export const TEMPLATE_KEY = 'campaignkit.templates.v1';
export const TEMPLATE_LIMIT = 20;
export type Template = { name: string; values: Record<Field, string> };

export function parseTemplates(raw: string): Template[] {
  if (raw.length > 100_000) throw new Error('INVALID_TEMPLATES');
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 || !('templates' in data) || !Array.isArray(data.templates) || data.templates.length > TEMPLATE_LIMIT) throw new Error('INVALID_TEMPLATES');
  const names = new Set<string>();
  return data.templates.map((row: unknown) => {
    if (!row || typeof row !== 'object' || !('name' in row) || typeof row.name !== 'string' || !row.name.trim() || row.name.length > 60 || !('values' in row) || !row.values || typeof row.values !== 'object') throw new Error('INVALID_TEMPLATE');
    const values = row.values as Record<string, unknown>;
    if (fields.some(field => typeof values[field] !== 'string' || (values[field] as string).length > 200) || !fields.some(field => (values[field] as string).trim())) throw new Error('INVALID_TEMPLATE');
    const name = row.name.trim();
    const key = name.toLowerCase();
    if (names.has(key)) throw new Error('DUPLICATE_TEMPLATE');
    names.add(key);
    return { name, values: Object.fromEntries(fields.map(field => [field, values[field]])) as Template['values'] };
  });
}

export function serializeTemplates(templates: Template[]): string {
  const raw = JSON.stringify({ version: 1, templates }, null, 2);
  parseTemplates(raw);
  return raw;
}

export function addTemplate(existing: Template[], name: string, campaign: Campaign): Template[] {
  return parseTemplates(serializeTemplates([...existing, { name: name.trim(), values: Object.fromEntries(fields.map(field => [field, campaign[field]])) as Template['values'] }]));
}

export function loadTemplates(): { templates: Template[]; error: boolean; raw: string } {
  let raw = '';
  try {
    raw = localStorage.getItem(TEMPLATE_KEY) || '';
    return { templates: raw ? parseTemplates(raw) : [], error: false, raw };
  } catch {
    return { templates: [], error: true, raw };
  }
}

export function persistTemplates(templates: Template[]): void {
  localStorage.setItem(TEMPLATE_KEY, serializeTemplates(templates));
}
