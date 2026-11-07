"""Browser real para o mapa público de referências BNCC/ENEM, sem backend e sem contas."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright,expect

ROOT=Path(__file__).resolve().parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
thread=Thread(target=server.serve_forever,daemon=True)
thread.start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
  for width in [320,390,1024]:
   page=browser.new_page(viewport={'width':width,'height':820})
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto('http://127.0.0.1:%s/academy/curriculo.html'%server.server_port)
   expect(page.get_by_role('heading',name='Mapa curricular')).to_be_visible()
   expect(page.get_by_text('EF03MA06')).to_be_visible()
   expect(page.locator('.curr-status')).to_contain_text('Sem aulas ou questões escolares aprovadas')
   assert page.locator('#curr-grade-list button').count()==5
   assert page.locator('#curr-subject-list button').count()==8
   assert page.get_by_role('button',name='Língua Inglesa').count()==0
   page.locator('#curr-stage').select_option('fundamental2')
   assert page.locator('#curr-grade-list button').count()==4
   assert page.get_by_role('button',name='Língua Inglesa').count()==1
   page.get_by_role('button',name='7º ano').click()
   assert page.locator('#curr-grade-list button[aria-pressed="true"]').inner_text()=='7º ano'
   page.locator('#curr-stage').select_option('medio')
   assert page.locator('#curr-grade-list button').count()==3
   expect(page.get_by_text('habilidades EM13',exact=False)).to_be_visible()
   page.locator('#curr-stage').select_option('enem')
   assert page.locator('#curr-grade-list button').count()==1
   expect(page.get_by_role('button',name='Redação')).to_be_visible()
   page.get_by_role('button',name='Redação').click()
   expect(page.get_by_text('matriz de avaliação do ENEM',exact=False)).to_be_visible()
   assert page.get_by_role('link',name='Matrizes de Referência do ENEM').get_attribute('href').startswith('https://www.gov.br/inep/')
   assert not page.evaluate('document.documentElement.scrollWidth > window.innerWidth'),width
   assert not errors,(width,errors)
   page.close()
  browser.close()
 print('PASS browser curriculum: 320/390/1024, séries EF/EM, ENEM, filtro e indicador de material não aprovado')
finally:
 server.shutdown()
 server.server_close()
