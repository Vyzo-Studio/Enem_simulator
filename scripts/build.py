#!/usr/bin/env python3
"""Reconstrói index.html a partir dos arquivos em src/. Nenhuma dependência externa."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
template = (ROOT / "src/template.html").read_text(encoding="utf-8")
css = (ROOT / "src/styles.css").read_text(encoding="utf-8")
html = template.replace('<link rel="stylesheet" href="src/styles.css">', '<style id="bundled-styles">' + css + '</style>')
for name in ("questions.js", "legacy.js", "app.js"):
    source = (ROOT / "src" / name).read_text(encoding="utf-8")
    src = '<script src="src/' + name + '" defer></script>'
    assert src in html, f"Template não contém {src}"
    html = html.replace(src, '<script data-source="' + name + '">\n' + source + '\n</script>')
target = ROOT / "index.html"
if "--check" in sys.argv:
    existing = target.read_text(encoding="utf-8") if target.exists() else None
    if existing != html:
        raise SystemExit("ERRO: index.html está desatualizado. Execute python scripts/build.py")
    print("OK: index.html reproduz fielmente os módulos em src/")
else:
    target.write_text(html, encoding="utf-8")
    print(f"Gerado {target} ({len(html):,} caracteres)")
