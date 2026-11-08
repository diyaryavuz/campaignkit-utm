// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import Templates from './Templates';
import { emptyCampaign } from './lib/campaign';
import { addTemplate, serializeTemplates, TEMPLATE_KEY } from './lib/templates';
afterEach(()=>{cleanup();localStorage.clear();vi.restoreAllMocks();});
it('exports exact naming templates separately from campaign destinations', async()=>{
  const templates=addTemplate([],'Newsletter',{...emptyCampaign,source:'Email Team'});
  localStorage.setItem(TEMPLATE_KEY,serializeTemplates(templates));
  const download=vi.fn();const user=userEvent.setup();
  render(<Templates lang="en" campaign={emptyCampaign} onApply={vi.fn()} onNotice={vi.fn()} onDownload={download}/>);
  await user.click(screen.getByRole('button',{name:'Back up templates'}));
  expect(download).toHaveBeenCalledWith(serializeTemplates(templates),'campaignkit-templates.json','application/json');
});

it('imports template backups and leaves conflicting backups untouched',async()=>{
  const existing=addTemplate([],'Weekly',{...emptyCampaign,source:'newsletter'});
  localStorage.setItem(TEMPLATE_KEY,serializeTemplates(existing));
  const notice=vi.fn();
  render(<Templates lang="en" campaign={emptyCampaign} onApply={vi.fn()} onNotice={notice} onDownload={vi.fn()}/>);
  const upload=(templates:typeof existing)=>{
    const file=new File(['backup'],'templates.json',{type:'application/json'});
    Object.defineProperty(file,'text',{value:async()=>serializeTemplates(templates)});
    fireEvent.change(screen.getByLabelText('Choose template backup'),{target:{files:[file]}});
  };
  upload(addTemplate([],'Social',{...emptyCampaign,source:'instagram'}));
  await waitFor(()=>expect(screen.getByRole('option',{name:'Social'})).toBeInTheDocument());
  const before=localStorage.getItem(TEMPLATE_KEY);
  upload(addTemplate([],'weekly',{...emptyCampaign,source:'different'}));
  await waitFor(()=>expect(notice).toHaveBeenLastCalledWith(expect.stringContaining('conflicts')));
  expect(localStorage.getItem(TEMPLATE_KEY)).toBe(before);
});
