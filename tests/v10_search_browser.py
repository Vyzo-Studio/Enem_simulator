"""Fluxo de seleção de pesquisa com dados simulados; NÃO valida busca externa real."""
from playwright.sync_api import sync_playwright,expect
ns={'__file__':'/mnt/data/vyzo_v10_work/tests/v10_browser.py'}
source=open('/mnt/data/vyzo_v10_work/tests/v10_browser.py',encoding='utf8').read().split('with sync_playwright() as p:')[0]
exec(source,ns)
with sync_playwright() as playwright:
    browser=playwright.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':390,'height':850})
    ns['storage'](page)
    page.set_content(ns['HTML'],wait_until='load')
    expect(page.get_by_text('BUSCA INTELIGENTE DE PROVAS')).to_be_visible()
    # Mock de resposta remota COM fonte; teste de interface, não de pesquisa real.
    page.evaluate('''() => {
      researchResults=[{name:'Exame demonstrativo 2026',type:'Vestibular',institution:'Universidade de exemplo',position:'Curso',board:'',edition:'2026',examDate:null,subjects:['Matemática','Português'],sources:[{url:'https://www.gov.br/inep',title:'Fonte institucional de teste'}],sourceStatus:'Fontes oficiais vinculadas; confirme o edital'}];
      renderWizard();
    }''')
    expect(page.get_by_text('Exame demonstrativo 2026')).to_be_visible()
    page.get_by_role('button',name='Adicionar esta prova').click()
    expect(page.get_by_text('Provas escolhidas com fontes vinculadas')).to_be_visible()
    page.get_by_role('button',name='Continuar').click()
    expect(page.locator('#v9-name_0')).to_have_value('Exame demonstrativo 2026')
    expect(page.get_by_role('link',name='Fonte institucional de teste')).to_be_visible()
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
    print('PASS V10: seleção da edição simulada, campos preenchidos, fonte visível e formulário existente preservado')
    browser.close()
