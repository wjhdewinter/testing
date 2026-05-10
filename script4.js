
/* === AWC ACTION FIX: module buttons always work in PWA/APK === */
(function(){
  function el(id){return document.getElementById(id)}
  function currentLang(){try{return (typeof lang!=='undefined'?lang:(localStorage.getItem('awc_v20_lang')||'nl'))}catch(e){return 'nl'}}
  function translateNow(){try{ if(typeof translateWholeApp==='function') translateWholeApp(); else if(typeof applyI18n==='function') applyI18n(); }catch(e){}}
  window.show=function(id, fromPop){
    try{
      if(!el(id)) id='dashboard';
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
      el(id)?.classList.add('active');
      document.querySelectorAll('#nav button').forEach(b=>b.classList.remove('active'));
      el('nav_'+id)?.classList.add('active');
      try{
        if(typeof tabs!=='undefined'){
          const tab=tabs.find(x=>x[0]===id);
          if(tab){
            const l=currentLang();
            if(el('pageTitle')) el('pageTitle').textContent=((l==='en' && typeof tabLabelsEN!=='undefined')?(tabLabelsEN[tab[1]]||tab[1]):tab[1]).replace(/^[^ ]+ /,'');
            if(el('pageSub')) el('pageSub').textContent=(l==='en' && typeof tabSubsEN!=='undefined')?(tabSubsEN[tab[2]]||tab[2]):tab[2];
          }
        }
      }catch(e){}
      document.getElementById('side')?.classList.remove('open');
      if(id!=='dashboard'){
        const sec=el(id);
        if(sec && !sec.querySelector('.module-back')){
          const back=document.createElement('div');
          back.className='module-back';
          back.innerHTML='<button type="button" class="btn gray" data-nl="← Terug naar menu" data-en="← Back to menu">← Terug naar menu</button>';
          back.querySelector('button').addEventListener('click',function(ev){ev.preventDefault(); window.show('dashboard');});
          sec.prepend(back);
        }
        window.scrollTo({top:0,behavior:'smooth'});
      }
      if(!fromPop){
        try{ if(location.hash!=='#'+id) history.pushState({tab:id},'', '#'+id); }catch(e){}
      }
      translateNow();
      try{ if(typeof updateWA==='function') updateWA(); }catch(e){}
    }catch(err){
      console.error('AWC show failed',err);
      alert('Module openen mislukt. Druk op Cache updaten en probeer opnieuw.');
    }
  };
  window.openModule=window.show;
  document.addEventListener('click',function(ev){
    const target=ev.target.closest('[onclick], .quickcard, [data-open], [data-module]');
    if(!target) return;
    let id=target.dataset.open||target.dataset.module||'';
    const oc=target.getAttribute('onclick')||'';
    const m=oc.match(/show\(['"]([^'"]+)['"]\)/)||oc.match(/openModule\(['"]([^'"]+)['"]\)/);
    if(!id && m) id=m[1];
    if(id && ['dashboard','pallets','personnel','warehouse','orders','machines','incidents','damage','manco','manual'].includes(id)){
      ev.preventDefault(); ev.stopPropagation();
      window.show(id);
    }
  }, true);
  window.addEventListener('popstate',function(e){window.show((e.state&&e.state.tab)||'dashboard',true)});
  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('.quickcard').forEach(card=>{card.style.cursor='pointer';});
    const hash=(location.hash||'').replace('#','');
    if(hash && document.getElementById(hash)) window.show(hash,true);
  });
})();
/* === END AWC ACTION FIX === */
