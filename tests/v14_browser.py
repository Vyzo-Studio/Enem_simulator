"""V14: edição segura de provas, foco por matéria e cronômetros em Chromium (local)."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parent
source=(ROOT/'v9_browser.py').read_text(encoding='utf8').split('with sync_playwright() as p:')[0]
ns={'__file__':str(ROOT/'v9_browser.py')}
exec(source,ns)
HTML=ns['fixture']()
KEY='vyzo-academy-v9-guest-1'

def seed(goal,assessments=None,tasks=None):
    return {KEY:json.dumps({
        'schema':9,'revision':1,'onboarding':True,
        'profile':{'minutes':120,'weekdays':[1,2,3,4,5],
                   'dailyMinutes':{'0':0,'1':60,'2':120,'3':90,'4':60,'5':120,'6':0},
                   'confidence':'Iniciante','difficulties':[],'style':'Aprendizagem mista'},
        'goals':[goal], 'assessments':assessments or [],'tasks':tasks or [],'draft':None
    },ensure_ascii=False)}

GOAL={'id':'g-v14','type':'ENEM','name':'ENEM teste','subjects':['Matemática'],
      'foreignLanguage':'Inglês','priority':'high','status':'preparing',
      'createdAt':1000,'examDate':'','institution':'','position':'','board':'','edition':''}

def setup(page, data):
    ns['storage'](page,data)
    page.evaluate('window.__fakeNow=Date.now();Date.now=()=>window.__fakeNow')
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(HTML,wait_until='load')
    expect(page.locator('.v9-nav')).to_be_visible()
    return errors

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
    for width in (320,390,768,1440):
        # Edição curricular, arquivo de provas, duplicação sem respostas.
        page=browser.new_page(viewport={'width':width,'height':850},accept_downloads=True)
        old={'id':'history','goalId':'g-v14','kind':'initial','status':'completed',
             'ids':['old-a','old-b','old-c'],'answers':{'old-a':0,'old-b':1,'old-c':2},
             'report':{'answered':3,'correct':2,'accuracy':66},'completedAt':1000}
        pending={'id':'pending','goalId':'g-v14','day':'2026-11-30','minutes':60,
                 'startMinute':540,'status':'pending','parts':{'theory':20,'example':10,'practice':20,'review':10}}
        errors=setup(page,seed(GOAL,[old],[pending]))
        page.locator('.v9-nav button[data-page="plan"]').click()
        expect(page.get_by_text('Disponibilidade semanal:',exact=False)).to_be_visible()
        page.get_by_role('button',name='Remarcar').first.click()
        page.locator('#v14-new-day').fill('2026-12-06') # Domingo, sem disponibilidade
        page.get_by_role('button',name='Confirmar remarcação').click()
        saved=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
        assert saved['tasks'][0]['day']=='2026-11-30'
        page.locator('#v14-new-day').fill('2026-12-01') # Terça-feira
        page.get_by_role('button',name='Confirmar remarcação').click()
        saved=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
        assert saved['tasks'][0]['day']=='2026-12-01'
        page.get_by_role('button',name='Semana').click()
        page.locator('button[data-action="plan-view"][data-view="all"]').click()
        page.locator('.v9-nav button[data-page="goals"]').click()
        page.get_by_role('button',name='Editar prova').click()
        expect(page.get_by_text('Editar prova',exact=True)).to_be_visible()
        page.locator('#v9-name').fill('ENEM atualizado')
        page.locator('#v9-subjects').fill('Física')
        page.locator('#v9-topics').fill('Eletricidade')
        page.once('dialog',lambda d:d.accept())
        page.get_by_role('button',name='Salvar alterações').click()
        state=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
        assert len(state['assessments'])==1 and state['assessments'][0]['id']=='history'
        assert state['goals'][0]['name']=='ENEM atualizado'
        assert state['goals'][0]['subjects']==['Física']
        assert state['goals'][0]['curriculumHistory'][0]['subjects']==['Matemática']
        assert state['tasks'][0]['status']=='superseded'
        page.get_by_role('button',name='Duplicar configuração').click()
        state=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
        assert len(state['goals'])==2 and state['goals'][0]['id']!=state['goals'][1]['id']
        assert len(state['assessments'])==1
        page.once('dialog',lambda d:d.accept())
        page.get_by_role('button',name='Arquivar').first.click()
        state=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
        assert state['goals'][0]['status']=='archived'
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),width
        assert not errors,(width,errors)
        page.close()

    # Cronômetro ativo: suspender, avançar o relógio e retomar.
    page=browser.new_page(viewport={'width':390,'height':850})
    errors=setup(page,seed(GOAL))
    page.locator('.v9-nav button[data-page="diagnostics"]').click()
    page.get_by_role('button',name='Começar diagnóstico').first.click()
    expect(page.locator('#v13-exam-mode')).to_have_value('area')
    expect(page.locator('#v13-area')).to_have_value('Matemática')
    page.locator('#exam-length').select_option('10')
    expect(page.locator('#start-diagnostic-form button[type="submit"]')).to_be_enabled()
    page.get_by_role('button',name='COMEÇAR DIAGNÓSTICO').click()
    expect(page.get_by_text('Diagnóstico de conhecimento')).to_be_visible()
    # Resposta errada real alimenta o centro de erros sem simular explicações.
    wrong=page.evaluate("""(key)=>{
       const id=JSON.parse(localStorage.getItem(key)).assessments[0].ids[0];
       return (window.QUESTION_BANK.find(q=>q.id===id).answer+1)%5;
    }""",KEY)
    page.locator(f'input[name="answer"][value="{wrong}"]').check()
    page.evaluate('window.__fakeNow+=90000')
    page.wait_for_timeout(1150)
    expect(page.locator('#v9-clock')).to_contain_text('01:30')
    page.get_by_role('button',name='Salvar e continuar depois').click()
    state=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
    assert state['assessments'][0]['timer']['runningSince'] is None
    assert state['assessments'][0]['timer']['elapsedMs']==90000
    page.evaluate('window.__fakeNow+=180000')
    page.get_by_role('button',name='Retomar avaliação').first.click()
    expect(page.locator('#v9-clock')).to_contain_text('01:30')
    page.once('dialog',lambda d:d.accept())
    page.get_by_role('button',name='Finalizar avaliação').click()
    state=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
    assert state['assessments'][0]['timer']['finishedElapsedMs']==90000
    assert state['assessments'][0]['status']=='completed'
    page.locator('.v9-nav button[data-page="revisions"]').click()
    expect(page.get_by_text('Questões que precisam de atenção')).to_be_visible()
    assert page.locator('details.v9-detail').count()==1
    page.locator('.v9-nav button[data-page="library"]').click()
    expect(page.get_by_text('Biblioteca de estudos',exact=True)).to_be_visible()
    assert page.locator('.v14-library-item').count()>0
    page.locator('#v14-library-search').fill('assunto-nao-cadastrado-xyz')
    assert page.locator('.v14-library-item:visible').count()==0
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
    assert not errors,errors
    page.close()

    # Prazo oficial contínuo: expira mesmo com a avaliação suspensa.
    page=browser.new_page(viewport={'width':390,'height':850})
    errors=setup(page,seed(GOAL))
    page.locator('.v9-nav button[data-page="diagnostics"]').click()
    page.get_by_role('button',name='Começar diagnóstico').first.click()
    page.locator('#exam-length').select_option('10')
    page.locator('#v14-timer-mode').select_option('countdown')
    page.locator('#v14-time-limit').fill('1')
    page.get_by_role('button',name='COMEÇAR DIAGNÓSTICO').click()
    page.get_by_role('button',name='Salvar e continuar depois').click()
    page.evaluate('window.__fakeNow+=61000')
    page.get_by_role('button',name='Retomar avaliação').first.click()
    expect(page.get_by_text('Seu diagnóstico está pronto')).to_be_visible()
    state=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
    assert state['assessments'][0]['status']=='completed'
    assert state['assessments'][0]['report']['blank']==10
    assert state['assessments'][0]['timer']['finishedElapsedMs']==60000
    assert not errors,errors
    page.close()
    browser.close()
print('PASS V14 Chromium: edição e arquivo, histórico, foco, cronômetro pausável, expiração contínua e 4 larguras')
