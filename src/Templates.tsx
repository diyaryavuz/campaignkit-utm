import { useState } from 'react';
import type { Campaign } from './lib/campaign';
import { addTemplate, loadTemplates, persistTemplates, serializeTemplates, TEMPLATE_LIMIT, type Template } from './lib/templates';

type Props = {
  lang: 'tr' | 'en';
  campaign: Campaign;
  onApply: (values: Template['values']) => void;
  onNotice: (message: string) => void;
  onDownload: (text: string, filename: string, type: string) => void;
};

export default function Templates({ lang, campaign, onApply, onNotice, onDownload }: Props) {
  const l = (tr: string, en: string) => lang === 'tr' ? tr : en;
  const [initial] = useState(loadTemplates);
  const [templates, setTemplates] = useState(initial.templates);
  const [blocked, setBlocked] = useState(initial.error);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState('');
  const current = templates.find(template => template.name === selected);

  function store(next: Template[]): boolean {
    try {
      persistTemplates(next);
      setTemplates(next);
      return true;
    } catch {
      onNotice(l('Şablon kaydedilemedi. Mevcut şablonlar değişmedi.', 'Could not save templates. Existing templates are unchanged.'));
      return false;
    }
  }

  return <section className="templates" aria-labelledby="templates-heading">
    <h3 id="templates-heading">{l('İsimlendirme şablonları', 'Naming templates')}</h3>
    <p className="field-hint">{l('UTM alanlarını olduğu gibi saklayın. Uygulama, boş değerler dahil UTM alanlarını değiştirir; hedef adres korunur. En fazla 20 şablon.', 'Save UTM fields exactly as entered. Applying replaces UTM fields, including blanks; the destination stays unchanged. Up to 20 templates.')}</p>
    {blocked ? <div role="alert">
      <p>{l('Şablonlar okunamadı; mevcut verinin üzerine yazılmayacak.', 'Templates could not be read; existing data will not be overwritten.')}</p>
      <button type="button" className="secondary" onClick={() => onDownload(initial.raw, 'campaignkit-templates-recovery.txt', 'text/plain')}>{l('Şablon verisini indir', 'Download template data')}</button>{' '}
      <button type="button" className="secondary" onClick={() => {
        if (window.confirm(l('Şablon verisini yedeklediniz mi? Yalnızca şablonlar sıfırlanacak.', 'Have you backed up template data? Only templates will be reset.')) && store([])) {
          setBlocked(false);
          setSelected('');
        }
      }}>{l('Şablonları sıfırla', 'Reset templates')}</button>
    </div> : <>
      <button type="button" className="secondary" disabled={!templates.length} onClick={() => onDownload(serializeTemplates(templates), 'campaignkit-templates.json', 'application/json')}>{l('Şablonları yedekle', 'Back up templates')}</button>
      <div className="template-controls">
        <label className="field"><span>{l('Şablon adı', 'Template name')}</span><input value={name} onChange={event => setName(event.target.value)} maxLength={60}/></label>
        <button type="button" className="secondary" disabled={templates.length >= TEMPLATE_LIMIT} onClick={() => {
          let next: Template[];
          try { next = addTemplate(templates, name, campaign); }
          catch { onNotice(l('Benzersiz bir şablon adı ve en az bir UTM alanı girin. Alanlar en fazla 200 karakter olabilir.', 'Enter a unique template name and at least one UTM field. Fields can contain up to 200 characters.')); return; }
          if (store(next)) { setSelected(next[next.length - 1].name); setName(''); onNotice(l('Şablon kaydedildi.', 'Template saved.')); }
        }}>{l('Şablonu kaydet', 'Save template')}</button>
      </div>
      <div className="template-controls">
        <label className="field"><span>{l('Kayıtlı şablon', 'Saved template')}</span><select value={selected} onChange={event => setSelected(event.target.value)}><option value="">{l('Şablon seçin', 'Choose a template')}</option>{templates.map(template => <option key={template.name} value={template.name}>{template.name}</option>)}</select></label>
        <button type="button" className="secondary" disabled={!current} onClick={() => { if (current) { onApply(current.values); onNotice(l('UTM şablonu uygulandı. Hedef adres korundu.', 'UTM template applied. Destination preserved.')); } }}>{l('Şablonu uygula', 'Apply template')}</button>
        <button type="button" className="text-button" disabled={!current} onClick={() => {
          if (current && window.confirm(l('Seçili şablon silinsin mi?', 'Delete the selected template?')) && store(templates.filter(template => template.name !== selected))) { setSelected(''); onNotice(l('Şablon silindi.', 'Template deleted.')); }
        }}>{l('Şablonu sil', 'Delete template')}</button>
      </div>
      <p className="field-hint">{l('Şablonlar bu tarayıcıda tutulur. Bağlantı kütüphanesinin JSON yedeğine dahil değildir.', 'Templates stay in this browser. They are separate from the link library JSON backup.')}</p>
    </>}
  </section>;
}
