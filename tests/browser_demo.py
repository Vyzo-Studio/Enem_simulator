"""Teste público do questionário demonstrativo, sem conta ou nuvem."""
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
def fixture():
    html=(root/'academy/demo.html').read_text(encoding='utf8')
    html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+(root/'academy/styles.css').read_text(encoding='utf8')+'</style>')
    for name in ['questions.js','extra_questions.js','advanced_questions.js']:
        html=html.replace('<script src="../src/'+name+'" defer></script>','<script>'+(root/'src'/name).read_text(encoding='utf8')+'</script>')
    html=html.replace('<script type="module" src="./demo.mjs"></script>','<script>'+(root/'academy/demo.mjs').read_text(encoding='utf8')+'</script>')
    return html
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width in [320,390,768,1440]:
        page=browser.new_page(viewport={'width':width,'height':860})
        errs=[];page.on('pageerror',lambda e: errs.append(str(e)))
        page.set_content(fixture(),wait_until='load')
        expect(page.get_by_text('Questão 1 de 10')).to_be_visible()
        assert page.locator('input[name="demo-option"]').count()==5
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),width
        page.locator('input[value="1"]').check()
        expect(page.get_by_text('1 respondidas')).to_be_visible()
        page.get_by_role('button',name='Próxima →').click()
        expect(page.get_by_text('Questão 2 de 10')).to_be_visible()
        page.get_by_role('button',name='← Anterior').click()
        expect(page.locator('input[value="1"]')).to_be_checked()
        page.once('dialog',lambda d:d.accept())
        page.get_by_role('button',name='Finalizar e corrigir').click()
        expect(page.get_by_text('Correção do questionário demonstrativo')).to_be_visible()
        assert page.locator('.demo-correction').count()==10
        assert not errs,errs
        page.close()
    browser.close()
print('PASS DEMO: 10 questões, marcação, navegação, correção, layouts 320/390/768/1440')
