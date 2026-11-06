"""V15: percursos escolares no navegador real, sem fingir que há conteúdos escolares validados."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parent
prefix=(ROOT/'v9_browser.py').read_text(encoding='utf8').split('with sync_playwright() as p:')[0]
ns={'__file__':str(ROOT/'v9_browser.py')}
exec(prefix,ns)
HTML=ns['fixture']()
KEY='vyzo-academy-v9-guest-1'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for stage,grade,width in [('fundamental1',3,320),('fundamental2',7,390),('medio',2,768)]:
        page=browser.new_page(viewport={'width':width,'height':900})
        ns['storage'](page)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(HTML,wait_until='load')
        expect(page.get_by_role('heading',name='Qual é o seu objetivo de aprendizagem?')).to_be_visible()
        page.locator('#v15-learning-path').select_option('school')
        page.get_by_role('button',name='Continuar').click()
        expect(page.get_by_role('heading',name='Conte um pouco sobre cada prova')).to_be_visible()
        assert page.get_by_label('Banca (opcional)').count()==0
        page.locator('#v15-school-stage-0').select_option(stage)
        page.locator('#v15-school-year-0').select_option(str(grade))
        page.locator('#v9-name_0').fill('Reforço escolar')
        page.locator('#v9-subjects_0').fill('Matemática, Língua Portuguesa')
        page.get_by_role('button',name='Continuar').click()
        expect(page.get_by_text('Quanto tempo você pode estudar por dia?')).to_be_visible()
        page.get_by_role('button',name='Continuar').click()
        page.get_by_role('button',name='Preparar meus diagnósticos').click()
        state=page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',KEY)
        assert state['schema']==9
        assert len(state['goals'])==1 and len(state['assessments'])==0
        goal=state['goals'][0]
        assert goal['type']=='Prova escolar'
        assert goal['educationStage']==stage and goal['schoolYear']==grade
        assert goal['provisional'] is False
        page.locator('.v9-nav button[data-page="goals"]').click()
        page.get_by_role('button',name='Ver situação do conteúdo').first.click()
        expect(page.get_by_text('O diagnóstico escolar específico desta série ainda não está disponível.',exact=False)).to_be_visible()
        assert page.locator('#start-diagnostic-form').count()==0
        page.get_by_role('button',name='Editar objetivo').click()
        assert page.locator('#v15-school-stage-edit').count()==1
        assert page.get_by_label('Banca organizadora').count()==0
        page.locator('#v15-school-stage-edit').select_option('medio')
        page.locator('#v15-school-year-edit').select_option('2')
        page.once('dialog',lambda d:d.accept())
        page.get_by_role('button',name='Salvar alterações').click()
        current=page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).goals[0]',KEY)
        assert current['educationStage']=='medio' and current['schoolYear']==2
        assert current['curriculumHistory'][0]['schoolYear']==grade
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),(width,'horizontal overflow')
        page.locator('.v9-nav button[data-page="past-papers"]').click()
        expect(page.get_by_role('heading',name='Provas anteriores')).to_be_visible()
        page.locator('#v15-past-year').select_option('2024')
        expect(page.locator('#v15-past-selection')).to_contain_text('2024')
        assert 'gov.br/inep' in page.get_by_role('link',name='Abrir provas e gabaritos oficiais no Inep').get_attribute('href')
        assert not errors,(width,errors)
        print('PASS V15 Chromium:',stage,grade,width,'px, escola sem banca, histórico, acervo oficial')
        page.close()
    browser.close()
