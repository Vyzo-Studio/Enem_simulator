"""Regressão Chromium em HTML real com armazenamento simulado."""
from pathlib import Path
from playwright.sync_api import sync_playwright
HTML=(Path(__file__).resolve().parents[1]/"index.html").read_text(encoding="utf-8")
MOCK="""window.__mem={};const s={getItem(k){return window.__mem[k]??null},setItem(k,v){window.__mem[k]=String(v)}};Object.defineProperty(window,'localStorage',{value:s,configurable:true});Object.defineProperty(window,'sessionStorage',{value:s,configurable:true});"""
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,args=["--no-sandbox"])
    page=browser.new_page(viewport={"width":390,"height":844},accept_downloads=True)
    page.evaluate(MOCK)
    page.set_content(HTML,wait_until="domcontentloaded")
    page.wait_for_function("!!window.ENEM_TEST")
    assert len(page.evaluate("window.ENEM_TEST.getBank()"))==224
    page.evaluate("window.ENEM_BRIDGE.go('setup')")
    page.locator("#cfg-count").select_option("10")
    page.locator("#start-exam-btn").click()
    page.locator('input[data-choice="2"]').check()
    page.locator('[data-act="finish"]').first.click()
    assert page.locator("#dialog-root").is_visible()
    page.evaluate("()=>{const e=window.ENEM_BRIDGE.get().exam;e.timed=true;e.limitSecs=60;e.startedAt=Date.now()-61000}")
    page.wait_for_timeout(1500)
    assert page.locator("#dialog-root").is_hidden()
    assert page.evaluate("window.ENEM_TEST.getState().history[0].answered")==1
    before=page.evaluate("window.ENEM_TEST.getState().history.length")
    err=page.evaluate("""()=>{try{window.ENEM_TEST.applyImport({schema:2,history:[{id:"bad",ids:["X"]}]},"merge");return ""}catch(e){return e.message}}""")
    assert "Histórico incompleto" in err
    assert page.evaluate("window.ENEM_TEST.getState().history.length")==before
    for w in [320,360,390,768,1024,1440]:
        page.set_viewport_size({"width":w,"height":780})
        for route in ["home","setup","history","essay"]:
            page.evaluate("(r)=>window.ENEM_BRIDGE.go(r)",route)
            assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1"),(w,route)
    browser.close()
print("PASS: Chromium V6")
