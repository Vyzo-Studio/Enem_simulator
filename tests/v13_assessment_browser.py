"""V13: integração da composição equilibrada e questionário completo no Chromium com dados locais artificiais."""
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
src=(Path(__file__).resolve().parent/'v10_browser.py').read_text(encoding='utf8').split('with sync_playwright() as p:')[0]
ns={'__file__':str(Path(__file__).resolve().parent/'v10_browser.py')}
exec(src,ns)
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
  for width in (320,390,768,1440):
    page=browser.new_page(viewport={'width':width,'height':830})
    ns['storage'](page)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(ns['HTML'],wait_until='load')
    expect(page.get_by_text('Antes de começar, vamos conhecer seus objetivos.')).to_be_visible()
    page.locator('input[name="exam_type"][value="ENEM"]').check()
    page.get_by_role('button',name='Continuar').click()
    expect(page.get_by_text('Conte um pouco sobre cada prova')).to_be_visible()
    expect(page.locator('#v9-foreign_0')).to_be_visible()
    page.locator('#v9-foreign_0').select_option('Espanhol')
    page.get_by_role('button',name='Continuar').click()
    page.get_by_role('button',name='Continuar').click()
    page.get_by_role('button',name='Preparar meus diagnósticos').click()
    page.locator('.v9-nav button[data-page="diagnostics"]').click()
    page.locator('button[data-action="choose-assessment"]').first.click()
    expect(page.get_by_text('Composição do seu simulado')).to_be_visible()
    page.locator('#exam-length').select_option('30')
    block=page.locator('#v13-composition')
    expect(block).to_contain_text('Linguagens')
    expect(block).to_contain_text('Natureza')
    assert not block.locator('.v9-warn').count()
    page.get_by_role('button',name='COMEÇAR DIAGNÓSTICO').click()
    state=page.evaluate("()=>JSON.parse(localStorage.getItem('vyzo-academy-v9-guest-1'))")
    assessment=state['assessments'][-1]
    assert len(assessment['ids'])==30
    assert len(set(assessment['ids']))==30
    assert assessment['blueprint']['areas']=={'Linguagens':8,'Humanas':8,'Natureza':7,'Matemática':7}
    assert assessment['blueprint']['language']=='Espanhol'
    assert page.evaluate("""()=>{const a=JSON.parse(localStorage.getItem('vyzo-academy-v9-guest-1')).assessments.at(-1);
      return a.ids.every(id=>BANK.find(q=>q.id===id)?.subject!=='Inglês')&&a.ids.some(id=>BANK.find(q=>q.id===id)?.subject==='Espanhol')}""")
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),width
    page.locator('input[name="answer"][value="0"]').check()
    page.once('dialog',lambda d:d.accept())
    page.get_by_role('button',name='Finalizar avaliação').click()
    expect(page.get_by_text('Desempenho por área')).to_be_visible()
    assert page.locator('.v9-table').count()>=3
    assert not errors,errors
    page.close()
  browser.close()
print('PASS V13: prévia 8/8/7/7, gabarito, espanhol, 30 questões, relatório e mobile.')
