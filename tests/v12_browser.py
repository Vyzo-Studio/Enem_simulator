"""V12: valida a tela de autenticação fail-closed em Chromium sem Supabase.
Não tenta afirmar integração com backend real."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
root=Path(__file__).resolve().parents[1]
html=(root/'academy/v12-entry.html').read_text(encoding='utf8')
css=(root/'academy/styles.css').read_text(encoding='utf8')
config=(root/'academy/config.js').read_text(encoding='utf8')
script=(root/'academy/v12-entry.mjs').read_text(encoding='utf8')
script=script.replace("import {getVerifiedStudent} from './v12-auth-core.mjs';","const getVerifiedStudent=async()=>null;")
assert "const getVerifiedStudent=async()=>null;" in script
html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+css+'</style>')
html=html.replace('<script src="./config.js"></script>','<script>'+config+'</script>')
html=html.replace('<script type="module" src="./v12-entry.mjs"></script>','<script>'+script+'</script>')
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
  for width in [320,360,390,768,1024,1440,1920]:
    page=browser.new_page(viewport={'width':width,'height':800})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='load')
    expect(page.get_by_text('Inscrições ainda não abertas')).to_be_visible()
    expect(page.get_by_text('Nenhuma senha será solicitada',exact=False)).to_be_visible()
    assert page.locator('input[type="password"]').count()==0
    assert page.locator('input[name="diag-answer"]').count()==0
    assert not page.evaluate('document.documentElement.scrollWidth > window.innerWidth'), width
    assert not errors,errors
    page.close()
  browser.close()
print('PASS V12: bloqueio seguro sem backend, sem formulário falso, 7 resoluções')
