// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import App from './App';
import { backup, createRecord, STORAGE_KEY } from './lib/library';
import { emptyCampaign } from './lib/campaign';
import { TEMPLATE_KEY } from './lib/templates';
beforeEach(()=>localStorage.clear());
afterEach(()=>{cleanup();vi.restoreAllMocks();});

it.each(['tr','en'] as const)('focuses the destination when reusing a saved link with the keyboard (%s)',async lang=>{
  const user=userEvent.setup();
  const campaign={...emptyCampaign,url:'https://example.com/campaign?ref=library',source:'newsletter',medium:'email',campaign:'keyboard_reuse'};
  localStorage.setItem(STORAGE_KEY,backup([createRecord(campaign)]));
  render(<App/>);
  if(lang==='en')await user.click(screen.getByRole('button',{name:'Switch to English'}));
  await user.click(screen.getByRole('button',{name:lang==='tr'?'Kampanya kütüphanesi 01':'Campaign library 01'}));
  screen.getByRole('button',{name:lang==='tr'?'Yeniden kullan':'Reuse'}).focus();
  await user.keyboard('{Enter}');
  const destination=screen.getByRole('textbox',{name:lang==='tr'?'Hedef adres':'Destination URL'});
  expect(destination).toHaveFocus();
  expect(destination).toHaveValue(campaign.url);
  await user.tab();
  expect(screen.getByRole('textbox',{name:lang==='tr'?'Kaynak':'Source'})).toHaveFocus();
  expect(screen.getByRole('textbox',{name:lang==='tr'?'Kampanya adı':'Campaign name'})).toHaveValue(campaign.campaign);
});

it('focuses the destination when starting from an empty library',async()=>{
  const user=userEvent.setup();render(<App/>);
  await user.click(screen.getByRole('button',{name:'Kampanya kütüphanesi 00'}));
  screen.getByRole('button',{name:'Bağlantı oluştur'}).focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('textbox',{name:'Hedef adres'})).toHaveFocus();
});

it('keeps focus on the sidebar when navigating back to the builder',async()=>{
  const user=userEvent.setup();render(<App/>);
  await user.click(screen.getByRole('button',{name:'Toplu bağlantılar 02'}));
  const builder=screen.getByRole('button',{name:'Bağlantı oluşturucu 01'});
  await user.click(builder);
  expect(builder).toHaveFocus();
});

it('persists and explicitly applies a naming template while preserving the destination', async()=>{
  const user=userEvent.setup(); const app=render(<App/>);
  await user.click(screen.getByRole('button',{name:'Örnek doldur'}));
  await user.type(screen.getByRole('textbox',{name:'Şablon adı'}),'Instagram story');
  await user.click(screen.getByRole('button',{name:'Şablonu kaydet'}));
  app.unmount(); render(<App/>);
  fireEvent.change(screen.getByRole('textbox',{name:'Hedef adres'}),{target:{value:'https://example.com/new?ref=keep#section'}});
  fireEvent.change(screen.getByRole('textbox',{name:'Anahtar kelime'}),{target:{value:'old'}});
  await user.selectOptions(screen.getByRole('combobox',{name:'Kayıtlı şablon'}),'Instagram story');
  expect(screen.getByRole('textbox',{name:'Kaynak'})).toHaveValue('');
  await user.click(screen.getByRole('button',{name:'Şablonu uygula'}));
  expect(screen.getByRole('textbox',{name:'Kaynak'})).toHaveValue('instagram');
  expect(screen.getByRole('textbox',{name:'Anahtar kelime'})).toHaveValue('');
  expect(screen.getByRole('textbox',{name:'Hedef adres'})).toHaveValue('https://example.com/new?ref=keep#section');
  await user.click(screen.getByRole('button',{name:'Switch to English'}));
  vi.spyOn(window,'confirm').mockReturnValue(false);
  await user.click(screen.getByRole('button',{name:'Delete template'}));
  expect(screen.getByRole('option',{name:'Instagram story'})).toBeInTheDocument();
  vi.mocked(window.confirm).mockReturnValue(true);
  await user.click(screen.getByRole('button',{name:'Delete template'}));
  expect(screen.queryByRole('option',{name:'Instagram story'})).not.toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(TEMPLATE_KEY)!).templates).toHaveLength(0);
});

it('preserves unreadable templates and only resets them after explicit confirmation', async()=>{
  localStorage.setItem(TEMPLATE_KEY,'{broken');
  const user=userEvent.setup();render(<App/>);
  expect(screen.getByRole('alert')).toHaveTextContent('Şablonlar okunamadı');
  expect(screen.queryByRole('button',{name:'Şablonu kaydet'})).not.toBeInTheDocument();
  expect(localStorage.getItem(TEMPLATE_KEY)).toBe('{broken');
  expect(screen.getByRole('button',{name:'Kütüphaneye kaydet'})).toBeEnabled();
  vi.spyOn(window,'confirm').mockReturnValue(true);
  await user.click(screen.getByRole('button',{name:'Şablonları sıfırla'}));
  expect(screen.getByRole('button',{name:'Şablonu kaydet'})).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(TEMPLATE_KEY)!).templates).toEqual([]);
});

it('retains a template in memory and storage when deletion cannot be persisted', async()=>{
  const user=userEvent.setup();render(<App/>);
  await user.click(screen.getByRole('button',{name:'Örnek doldur'}));
  await user.type(screen.getByRole('textbox',{name:'Şablon adı'}),'Keep me');
  await user.click(screen.getByRole('button',{name:'Şablonu kaydet'}));
  const before=localStorage.getItem(TEMPLATE_KEY);
  vi.spyOn(window,'confirm').mockReturnValue(true);
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('QuotaExceeded');});
  await user.click(screen.getByRole('button',{name:'Şablonu sil'}));
  expect(screen.getByText(/Şablon kaydedilemedi/)).toBeInTheDocument();
  expect(screen.getByRole('option',{name:'Keep me'})).toBeInTheDocument();
  expect(localStorage.getItem(TEMPLATE_KEY)).toBe(before);
});

it('blocks incomplete input and persists a valid link without duplicates', async()=>{
  const user=userEvent.setup(); const app=render(<App/>);
  await user.click(screen.getByRole('button',{name:'Kütüphaneye kaydet'}));
  expect(screen.getByRole('alert')).toHaveTextContent('zorunlu alanları kontrol');
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  await user.click(screen.getByRole('button',{name:'Örnek doldur'}));
  await user.click(screen.getByRole('button',{name:'Kütüphaneye kaydet'}));
  await user.click(screen.getByRole('button',{name:'Kütüphaneye kaydet'}));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).records).toHaveLength(1);
  app.unmount(); render(<App/>);
  await user.click(screen.getByRole('button',{name:'Kampanya kütüphanesi 01'}));
  expect(screen.getByRole('heading',{name:'sonbahar_2026'})).toBeInTheDocument();
  await user.type(screen.getByRole('textbox',{name:'Kütüphanede ara'}),'bulunmayan');
  expect(screen.getByText('Sonuç bulunamadı.')).toBeInTheDocument();
});
it('bulk saves distinct variants and supports the English workspace',async()=>{
  const user=userEvent.setup();render(<App/>);
  await user.click(screen.getByRole('button',{name:'Toplu bağlantılar 02'}));
  expect(screen.getByRole('button',{name:'Tümünü kopyala'})).toBeDisabled();
  await user.click(screen.getByRole('button',{name:'Örnek doldur'}));
  await user.click(screen.getByRole('button',{name:'Tümünü kaydet'}));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).records).toHaveLength(3);
  await user.click(screen.getByRole('button',{name:'Switch to English'}));
  expect(document.documentElement.lang).toBe('en');
  await user.click(screen.getByRole('button',{name:'Campaign library 03'}));
  expect(screen.getAllByRole('heading',{name:'sonbahar_2026'})).toHaveLength(3);
  await user.click(screen.getAllByRole('button',{name:'Reuse'})[0]);
  expect(screen.getByRole('textbox',{name:'Source'})).toHaveValue('instagram');
});
it('keeps a corrupt library intact and disables writes',()=>{
  localStorage.setItem(STORAGE_KEY,'{broken');render(<App/>);
  expect(screen.getByRole('alert')).toHaveTextContent('Üzerine yazılmayacak');
  expect(screen.getByRole('button',{name:'Kütüphaneye kaydet'})).toBeDisabled();
  expect(localStorage.getItem(STORAGE_KEY)).toBe('{broken');
});
it('does not claim success when the browser rejects storage writes',async()=>{
  const user=userEvent.setup();render(<App/>);
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('QuotaExceeded');});
  await user.click(screen.getByRole('button',{name:'Örnek doldur'}));
  await user.click(screen.getByRole('button',{name:'Kütüphaneye kaydet'}));
  expect(screen.getByText(/Kayıt başarısız/)).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Kampanya kütüphanesi 00'})).toBeInTheDocument();
});
it('rejects malformed imports without losing existing records',async()=>{
  const user=userEvent.setup();render(<App/>);
  await user.click(screen.getByRole('button',{name:'Örnek doldur'}));
  await user.click(screen.getByRole('button',{name:'Kütüphaneye kaydet'}));
  const before=localStorage.getItem(STORAGE_KEY);
  await user.click(screen.getByRole('button',{name:'Kampanya kütüphanesi 01'}));
  const file=new File(['invalid'],'backup.json',{type:'application/json'});
  Object.defineProperty(file,'text',{value:async()=>'{invalid'});
  fireEvent.change(screen.getByLabelText('JSON yedeği seç'),{target:{files:[file]}});
  expect(await screen.findByText(/Geçersiz veya çok büyük yedek/)).toBeInTheDocument();
  expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
});

it('preserves links saved while an imported file is still being read',async()=>{
  const user=userEvent.setup();render(<App/>);
  await user.click(screen.getByRole('button',{name:'Kampanya kütüphanesi 00'}));
  let finishRead!: (text:string)=>void;
  const pending=new Promise<string>(resolve=>{finishRead=resolve;});
  const file=new File(['pending'],'backup.json',{type:'application/json'});
  Object.defineProperty(file,'text',{value:()=>pending});
  fireEvent.change(screen.getByLabelText('JSON yedeği seç'),{target:{files:[file]}});
  await user.click(screen.getByRole('button',{name:'Bağlantı oluşturucu 01'}));
  await user.click(screen.getByRole('button',{name:'Örnek doldur'}));
  await user.click(screen.getByRole('button',{name:'Kütüphaneye kaydet'}));
  await act(async()=>finishRead(backup([createRecord({...emptyCampaign,url:'https://example.com',source:'newsletter',medium:'email',campaign:'imported'})])));
  await waitFor(()=>expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).records).toHaveLength(2));
  const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)!).records;
  expect(saved.map((r:{campaign:{campaign:string}})=>r.campaign.campaign)).toEqual(['sonbahar_2026','imported']);
});
