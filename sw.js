/* Cache apenas de arquivos públicos; nunca recebe redações ou respostas. */
const CACHE='vyzo-academy-shell-v14-20261106';
const FILES=['./','./index.html','./manifest.webmanifest','./assets/vyzo-academy.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('enem-intelligence-shell-')||k.startsWith('vyzo-academy-shell-'))&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(e.request.method!=='GET'||url.origin!==self.location.origin)return;
 // Portal V8: nunca interceptar, substituir ou armazenar navegações e arquivos privados.
 if(/\/academy(?:\/|$)/.test(url.pathname))return;
 if(e.request.mode==='navigate'){
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy)).catch(()=>{});}return r;}).catch(()=>caches.match('./index.html').then(r=>r||Response.error())));
  return;
 }
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
