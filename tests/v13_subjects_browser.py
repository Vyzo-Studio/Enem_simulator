"""V13: navegador real — autocomplete, chips e sincronização com formulários legados."""
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
JS=str(root/'src/subject-picker.js')
CSS=str(root/'src/subject-picker.css')
def start(page,fixture):
    page.set_content(fixture,wait_until='load')
    page.add_style_tag(path=CSS)
    page.add_script_tag(path=JS)
def test(page,width):
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    form='''<form id="form-wizard"><section class="card"><h3>ENEM</h3><label for="s0">Matérias separadas por vírgula</label>
    <input id="s0" name="subjects_0" value="Linguagens,Humanas" /></section></form>'''
    start(page,form)
    picker=page.locator('.v13-subjects')
    expect(picker).to_be_visible()
    assert picker.locator('.v13-chip').count()==2
    assert page.locator('#s0').input_value()=='Linguagens,Humanas'
    field=page.get_by_role('combobox',name='Pesquisar e adicionar matérias')
    field.fill('port')
    expect(page.get_by_role('option',name='Língua Portuguesa')).to_be_visible()
    page.get_by_role('option',name='Língua Portuguesa').click()
    assert 'Português' in page.locator('#s0').input_value()
    field.fill('matematica')
    expect(page.get_by_role('option',name='Matemática',exact=True)).to_be_visible()
    field.press('Enter')
    assert 'Matemática' in page.locator('#s0').input_value()
    before=picker.locator('.v13-chip').count()
    field.fill('matematica')
    assert page.get_by_role('option',name='Matemática',exact=True).count()==0
    assert picker.locator('.v13-chip').count()==before
    field.fill('fis')
    expect(page.get_by_role('option',name='Física',exact=True)).to_be_visible()
    field.press('Escape')
    assert page.get_by_role('option').count()==0
    field.fill('')
    field.press('Backspace')
    assert picker.locator('.v13-chip').count()==before-1
    picker.get_by_role('button',name='Remover Português').click()
    assert 'Português' not in page.locator('#s0').input_value()
    picker.get_by_role('button',name='Selecionar matérias recomendadas').click()
    for name in ('Linguagens','Humanas','Natureza','Matemática'):
        assert name in page.locator('#s0').input_value()
    picker.get_by_role('button',name='Limpar seleção').click()
    assert page.locator('#s0').input_value()==''
    picker.get_by_role('button',name='Personalizar seleção').click()
    assert field.evaluate('(el)=>document.activeElement===el')
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'), width
    assert not errors,errors
    # Recriação dinâmica do onboarding: o observer deve anexar novo seletor
    page.locator('body').evaluate("(body)=>body.innerHTML='<form><label for=\"s1\">Disciplinas</label><input id=\"s1\" name=\"subjects\" value=\"Matemática\" /></form>'")
    expect(page.locator('.v13-subjects')).to_be_visible()
    assert page.locator('input[name="subjects"]').input_value()=='Matemática'
    # Simulador clássico: o select original não fica dentro de formulário
    page.locator('body').evaluate("(body)=>body.innerHTML='<div class=\"field\"><label for=\"cfg-subject\">Disciplina</label><select id=\"cfg-subject\"><option>Todas</option><option>Português</option><option>Matemática</option></select></div>'")
    expect(page.locator('.v13-subjects')).to_be_visible()
    page.get_by_role('combobox',name='Pesquisar matéria').fill('mat')
    page.get_by_role('option',name='Matemática',exact=True).click()
    assert page.locator('#cfg-subject').input_value()=='Matemática'
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),width
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
    for width in [320,360,390,430,768,1024,1440,1920]:
        page=browser.new_page(viewport={'width':width,'height':860})
        test(page,width);page.close()
    browser.close()
print('PASS V13: teclado, acentos, chips, recomendações, formulários antigos, rerender e 8 larguras.')
