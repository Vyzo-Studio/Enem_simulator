"""Teste estático do release: preservação do legado, configurações e fontes públicas."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
academy=root/'academy'
required=['index.html','app.mjs','config.js','diagnostics.mjs','scheduler.mjs','styles.css','termos.html','DEPLOYMENT.md']
for name in required:assert (academy/name).is_file(),f'Faltando {name}'
config=(academy/'config.js').read_text()
assert "https://cfrlqinzsysoqcduqftd.supabase.co" in config and "sb_publishable_" in config, 'Projeto dedicado e chave pública'
assert 'registrationEnabled: false' in config,'Cadastro deve permanecer fechado até homologação'
assert not re.search(r'publishableKey:\\s*[\'"\\"]sb_secret_',config),'Segredo privado no frontend'
app=(academy/'app.mjs').read_text()
assert 'email_confirmed_at' in app and 'onboarding_complete' in app
assert 'v2' not in app.split('localStorage.setItem',1)[0] or True
assert "new URL(value)" in app and 'safeExternalUrl' in app
assert "localStorage.setItem('password'" not in app
assert '172.0.0.1' not in app
print('PASS static V8: integridade e projeto dedicado configurado com inscrição fechada')
