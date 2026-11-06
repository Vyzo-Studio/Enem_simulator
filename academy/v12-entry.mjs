import {getVerifiedStudent} from './v12-auth-core.mjs';
const box=document.getElementById('v12-state');
const cfg=window.VYZO_ACADEMY_CLOUD||{};
const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(String(cfg.url||''))&&/^sb_publishable_[A-Za-z0-9_-]+$/.test(String(cfg.publishableKey||''));
function status(title,description,showLinks=false){
 box.replaceChildren();
 const h=document.createElement('h2');h.textContent=title;
 const p=document.createElement('p');p.textContent=description;box.append(h,p);
 if(showLinks){
   const line=document.createElement('div');line.className='v12-actions';
   const links=[
     ['Criar minha conta','./?auth=signup'],
     ['Já tenho conta — Entrar','./?auth=login'],
     ['Esqueci minha senha','./?auth=forgot']
   ];
   for(const [label,url] of links){
     const a=document.createElement('a');a.className='btn'+(line.children.length?' secondary':'');
     a.textContent=label;a.href=url;line.append(a);
   }box.append(line);
 }
}
async function boot(){
 if(!configured){status('Inscrições ainda não abertas','A autenticação segura da VYZO ACADEMY depende da implantação de um projeto Supabase exclusivo. Nenhuma senha será solicitada antes dessa verificação.');return;}
 try{
   const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/+esm');
   const client=createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
   const user=await getVerifiedStudent(client);
   if(user){location.replace('./');return;}
   status('Entre ou crie sua conta para continuar','Para iniciar qualquer estudo, é necessário confirmar seu e-mail e entrar na sua conta. Não há modo visitante.',true);
 }catch(error){
   status('Não foi possível verificar seu acesso','Confira sua conexão. O sistema não liberará atividades sem autenticação válida.');
 }
}
boot();
