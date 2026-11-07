"""Writing Lab A1 — Chromium com banco Supabase SIMULADO.
Não valida autenticação/serviço real (Stage 03 ainda em draft).
"""
from playwright.sync_api import sync_playwright,expect
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from browser_v8 import build_html
import json
import time

ROOT=Path(__file__).resolve().parents[1]
OWNER='2caed453-479e-40a8-a884-1a2800000001'
def seed():
 return {
  'academy_profiles':[{'id':'profile-1','user_id':OWNER,'display_name':'Estudante Teste',
   'onboarding_complete':True,'availability':{'0':0,'1':120,'2':120,'3':120,'4':120,'5':120,'6':0}}],
  'academy_goals':[{'id':'goal-1','user_id':OWNER,'exam_type':'ENEM','exam_name':'ENEM 2026','status':'active'}],
  'academy_essays':[{'id':'essay-old','user_id':OWNER,'title':'Minha redação antiga',
   'body':'Texto histórico intacto.','prompt':'Proposta legada pessoal.',
   'versions':[{'at':'2026-10-01T00:00:00Z','body':'Original de outubro.','prompt':'Tema antigo'}],
   'created_at':'2026-10-01T00:00:00Z','updated_at':'2026-10-01T00:00:00Z'}]
 }

def html_with_rows(rows):
 html=build_html(mock=True)
 assert 'window.__mockRows = Object.create(null);' in html
 payload=json.dumps(rows,ensure_ascii=False).replace('</','<\\/')
 return html.replace('window.__mockRows = Object.create(null);','window.__mockRows = '+payload+';')

class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
  widths=[320,360,390,430,768,1024,1440,1920]
  for width in widths:
   page=browser.new_page(viewport={'width':width,'height':880})
   errors=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   page.goto('http://127.0.0.1:%s/academy/index.html'%server.server_port)
   page.set_content(html_with_rows(seed()),wait_until='load')
   expect(page.get_by_role('heading',name='Visão geral')).to_be_visible(timeout=4000)
   if width<=740:
    page.locator('#mobile-menu').click()
   page.locator('#app-nav [data-page="essay"]').click()
   expect(page.get_by_role('heading',name='Laboratório de redação')).to_be_visible()
   expect(page.get_by_text('TEMA AUTORAL DE TREINO').first).to_be_visible()
   assert page.locator('[data-action="essay-start-proposal"]').count()==1
   page.locator('#essay-category').select_option('concurso')
   expect(page.get_by_text('Ainda não há proposta editorialmente conferida')).to_be_visible()
   page.locator('#essay-category').select_option('enem')
   if width==390:
    page.locator('#essay-mode').select_option('simulado')
   page.locator('[data-action="essay-start-proposal"]').click()
   expect(page.get_by_role('heading',name='Editor de redação')).to_be_visible(timeout=4000)
   expect(page.get_by_role('heading',name='Coletânea de textos motivadores')).to_be_visible()
   assert page.locator('.essay-source-table tbody tr').count()==3
   expect(page.get_by_text('84,8%',exact=True)).to_be_visible()
   assert page.locator('a[href^="https://www.gov.br/inep"]').count()>=1
   assert page.locator('#essay-body').is_visible()
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),width
   if width==390:
    assert page.get_by_text('Roteiro de planejamento antes da entrega').count()==0
    body='A internet facilita muitos serviços públicos.\n\nEntretanto, a diferença territorial dificulta acesso em algumas comunidades.'
    page.locator('#essay-body').fill(body)
    expect(page.locator('#essay-count')).to_contain_text('2 parágrafos')
    expect(page.locator('#essay-save-status')).to_contain_text('Salva na nuvem',timeout=5000)
    assert page.evaluate("window.__mockRows.academy_essays.find(x=>x.proposal_id)?.body")==body
    page.locator('[data-action="essay-timer"]').click()
    page.wait_for_timeout(1150)
    page.locator('[data-action="essay-timer"]').click()
    expect(page.locator('#essay-save-status')).to_contain_text('Salva na nuvem',timeout=5000)
    assert page.evaluate("window.__mockRows.academy_essays.find(x=>x.proposal_id).elapsed_seconds")>=1
    page.locator('[data-action="essay-focus"]').click()
    assert not page.locator('.topbar').is_visible()
    page.locator('[data-action="essay-focus"]').click()
    assert page.locator('.topbar').is_visible()
    page.locator('[data-action="essay-version"]').click()
    expect(page.get_by_text('Histórico de versões (1)')).to_be_visible()
    rows=page.evaluate('JSON.parse(JSON.stringify(window.__mockRows))')
    old=next(x for x in rows['academy_essays'] if x['id']=='essay-old')
    new=next(x for x in rows['academy_essays'] if x.get('proposal_id'))
    assert old['body']=='Texto histórico intacto.'
    assert len(old['versions'])==1 and old['versions'][0]['body']=='Original de outubro.'
    assert len(new['versions'])==1 and new['versions'][0]['body']==body
    assert new['versions'][0]['mode']=='simulado'
    assert new['proposal_version']==1 and new['user_id']==OWNER
    # Sem envio a provedores de IA, sem score artificial e sem IDs alterados.
    assert new.get('assessment') is None
    # Recuperação: digite, interrompa antes do debounce e recarregue com o estado salvo.
    unsent=body+'\n\nUma proposta futura deve ser avaliada.'
    page.locator('#essay-body').fill(unsent)
    assert page.evaluate("sessionStorage.length")>0
    page.set_content(html_with_rows(rows),wait_until='load')
    expect(page.get_by_role('heading',name='Visão geral')).to_be_visible()
    if width<=740:page.locator('#mobile-menu').click()
    page.locator('#app-nav [data-page="essay"]').click()
    page.once('dialog',lambda dlg:dlg.accept())
    page.locator('[data-action="essay-open"][data-id="'+new['id']+'"]').click()
    expect(page.locator('#essay-body')).to_have_value(unsent,timeout=3000)
    expect(page.locator('#essay-save-status')).to_contain_text('Salva na nuvem',timeout=5000)
    assert page.evaluate("window.__mockRows.academy_essays.find(x=>x.proposal_id)?.body")==unsent
    assert page.evaluate("window.__mockRows.academy_essays.find(x=>x.proposal_id).versions.length")==1
    print('PASS Writing Lab A1: proposta, simulado, IBGE, autosave, timer, foco, versões legadas e recuperação de cache na aba')
   assert not errors,(width,errors)
   page.close()
  browser.close()
 print('PASS Writing Lab A1 responsive: '+','.join(map(str,widths))+'px, sem overflow nas telas da redação')
finally:
 server.shutdown()
 server.server_close()
