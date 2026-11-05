#!/usr/bin/env python3
"""Reconstrói index.html a partir dos arquivos em src/. Sem dependências externas."""
import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'src/template.html').read_text(encoding='utf8')
css=(ROOT/'src/styles.css').read_text(encoding='utf8')
html=html.replace('<link rel="stylesheet" href="src/styles.css">','<style id="bundled-styles">'+css+'</style>')
for name in ('questions.js','extra_questions.js','advanced_questions.js','legacy.js','app.js','mentor.js'):
    source=(ROOT/'src'/name).read_text(encoding='utf8')
    src='<script src="src/'+name+'" defer></script>'
    assert src in html, f'Template não contém {src}'
    html=html.replace(src,'<script data-source="'+name+'">\n'+source+'\n</script>')
target=ROOT/'index.html'
if '--check' in sys.argv:
    assert target.exists() and target.read_text(encoding='utf8')==html,'index.html desatualizado: execute python3 scripts/build.py'
    print('OK: bundle de distribuição idêntico à fonte')
else:
    target.write_text(html,encoding='utf8')
    print(f'Gerado {target.name} ({len(html):,} caracteres)')
