// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import App from './App';
import { backup, createRecord, STORAGE_KEY } from './lib/library';
import { emptyCampaign } from './lib/campaign';
beforeEach(()=>localStorage.clear());
afterEach(()=>{cleanup();vi.restoreAllMocks();});

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
