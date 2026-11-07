"""Bloco 03/A — UX V9: navegação, foco, dark mode e 8 viewports no Chromium real.
Não confirma WCAG 2.2 AA integral, login, AI, admin nem produção remota.
"""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright,expect
import json
import math

ROOT=Path(__file__).resolve().parents[1]
SIZES=(320,360,390,430,768,1024,1440,1920)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass

def luminance(rgb):
 comps=[]
 for component in rgb:
  v=component/255
  comps.append(v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4)
 return .2126*comps[0]+.7152*comps[1]+.0722*comps[2]

def contrast(a,b):
 high=max(luminance(a),luminance(b))
 low=min(luminance(a),luminance(b))
 return (high+.05)/(low+.05)

def rgb(text):
 import re
 m=re.match(r'rgba?\((\d+),\s*(\d+),\s*(\d+)',text)
 assert m,text
 return tuple(map(int,m.groups()))

state={
 'schema':9,'revision':3,'onboarding':True,'goals':[],
 'profile':{'minutes':120,'weekdays':[1,2,3,4,5],
            'dailyMinutes':None,'confidence':'Não sei avaliar',
            'difficulties':[],'style':'Aprendizagem mista'},
 'assessments':[],'tasks':[],'draft':None
}
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
  for width in SIZES:
   context=browser.new_context(viewport={'width':width,'height':850},reduced_motion='reduce')
   context.add_init_script("(state)=>{localStorage.setItem('vyzo-academy-v9-guest-1',JSON.stringify(state));}",state)
   page=context.new_page()
   errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   page.goto(f'http://127.0.0.1:{server.server_port}/academy/v9.html',wait_until='networkidle')
   expect(page.locator('#v9-content h1').first).to_be_visible()
   nav=page.locator('#v9-nav')
   first=nav.locator('button[data-page="hub"]')
   assert first.get_attribute('aria-current')=='page',(width,'initial aria-current')
   assert first.evaluate('(e)=>getComputedStyle(e).minHeight') in ('44px',),width
   mobile=width<=900
   toggle=page.locator('#v9-nav-toggle')
   if mobile:
    expect(toggle).to_be_visible()
    assert toggle.get_attribute('aria-expanded')=='false'
    toggle.click()
    assert toggle.get_attribute('aria-expanded')=='true'
    assert 'is-expanded' in nav.get_attribute('class')
    assert nav.locator('[data-page="revisions"]').is_visible()
    page.keyboard.press('Escape')
    assert toggle.get_attribute('aria-expanded')=='false'
    assert page.evaluate('document.activeElement.id')=='v9-nav-toggle'
    toggle.click()
   else:
    expect(toggle).to_be_hidden()
   nav.locator('button[data-page="goals"]').click()
   assert page.locator('button[data-page="goals"]').first.get_attribute('aria-current')=='page'
   assert first.get_attribute('aria-current') is None
   assert page.evaluate('document.activeElement.tagName')=='H1'
   if mobile: assert toggle.get_attribute('aria-expanded')=='false'
   # Tema noturno: contraste mínimo do texto da navegação contra seu painel.
   page.locator('#v9-theme').click()
   colors=nav.locator('button[data-page="study"]').evaluate("""e=>{
     const color=getComputedStyle(e).color;
     const background=getComputedStyle(e.closest('nav')).backgroundColor;
     return {color,background};
   }""")
   ratio=contrast(rgb(colors['color']),rgb(colors['background']))
   assert ratio>=4.5,(width,ratio,colors)
   # O menu não deve desaparecer com zoom/reflow nem causar rolagem horizontal da página.
   dims=page.evaluate("""()=>({
     width:window.innerWidth,
     document:document.documentElement.scrollWidth,
     body:document.body.scrollWidth,
     navWidth:document.querySelector('#v9-nav').clientWidth,
     navScroll:document.querySelector('#v9-nav').scrollWidth
   })""")
   assert dims['document']<=dims['width']+1,(width,dims)
   assert not errors,(width,errors)
   # Navegação e alternância de tema não devem sobrescrever dados do estudante.
   saved=page.evaluate("localStorage.getItem('vyzo-academy-v9-guest-1')")
   assert json.loads(saved)==state,(width,'local user data altered by navigation')
   page.close()
   context.close()
  browser.close()
 print('PASS Block03/A Chromium: 320/360/390/430/768/1024/1440/1920, menu, Esc, foco, aria-current, dark contrast, no overflow, V9 backup preserved')
finally:
 server.shutdown()
 server.server_close()
