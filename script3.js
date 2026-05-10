
const qs=id=>document.getElementById(id), KEY='awc_v20_', mails=[{name:'Willem',email:'willem@amsterdamwarehouse.com'},{name:'Christiaan',email:'christiaan@amsterdamwarehouse.com'},{name:'Warehouse',email:'warehouse@amsterdamwarehouse.com'},{name:'Jacco',email:'jacco@amsterdamwarehouse.com'},{name:'Bas',email:'Bas@amsterdamwarehouse.com'},{name:'Edo',email:'Edo@amsterdamwarehouse.com'},{name:'Daan',email:'Daan@amsterdamwarehouse.com'},{name:'Mira',email:'mira@amsterdamwarehouse.com'},{name:'Order',email:'order@amsterdamwarehouse.com'},{name:'Amazon Neomounts',email:'amazon1@neomounts.com'}];let lang='nl', deferredPrompt=null, photos={p:[],m:[],i:[],w:[],o:[]}, orderFiles=[];
const tabs=[['dashboard','📊 Dashboard','Overzicht, trends en export'],['pallets','📦 Pallets','Pallettelling met foto en PDF'],['personnel','👥 Personeel','Aanwezigheid per medewerker'],['warehouse','🏭 Warehouse','Ruimtecheck hal, expeditie, terrein en meer'],['orders','⚖️ Order wegen','Gewicht, colli, pallets, afmetingen en artikelen'],['machines','🛠 Machines','Slimme machinekeuring'],['incidents','⚠️ Incidenten','Incident / bijna ongeval'],['damage','💥 Schade','Schade registratie'],['manco','📉 Manco','Manco registratie'],['manual','📖 Handleiding','Gebruiksaanwijzing Nederlands / Engels']];
const critical=['Remmen werken goed','Stuurinrichting werkt goed','Hefmast/vorken veilig','Hydrauliek geen lekkage','Noodstop/veiligheid werkt','Buitenterrein: geen direct gevaar'];
const checkItems=['Algemene staat schoon en veilig','Accu/batterij in goede staat','Geen vloeistoflekkage','Wielen/banden in goede staat','Remmen werken goed','Stuurinrichting werkt goed','Hefmast/vorken veilig','Hydrauliek geen lekkage','Claxon werkt','Verlichting/signalen werken','Noodstop/veiligheid werkt','Stoel/bediening in goede staat','Buitenterrein: geen direct gevaar','Geen losse of uitstekende delen','Ladingdrager/palletvork geen schade'];let checks={};
const PERSON_KEY=KEY+'personList';
const tabLabelsEN={'📊 Dashboard':'📊 Dashboard','📦 Pallets':'📦 Pallets','👥 Personeel':'👥 Staff','🏭 Warehouse':'🏭 Warehouse','⚖️ Order wegen':'⚖️ Order weighing','🛠 Machines':'🛠 Machines','⚠️ Incidenten':'⚠️ Incidents','💥 Schade':'💥 Damage','📉 Manco':'📉 Shortage','📖 Handleiding':'📖 User guide'};
const tabSubsEN={'Overzicht, trends en export':'Overview, trends and export','Pallettelling met foto en PDF':'Pallet count with photo and PDF','Aanwezigheid per medewerker':'Attendance per employee','Ruimtecheck hal, expeditie, terrein en meer':'Area check for hall, expedition, outside and more','Gewicht, colli, pallets, afmetingen en artikelen':'Weight, packages, pallets, dimensions and items','Slimme machinekeuring':'Smart machine inspection','Incident / bijna ongeval':'Incident / near miss','Schade registratie':'Damage registration','Manco registratie':'Shortage registration','Gebruiksaanwijzing Nederlands / Engels':'User guide Dutch / English'};
function initNavLabels(){qs('nav').innerHTML=tabs.map(x=>`<button id="nav_${x[0]}" onclick="show('${x[0]}')">${lang==='en'?(tabLabelsEN[x[1]]||x[1]):x[1]}</button>`).join('')}
function applyI18n(){document.documentElement.lang=lang;const ml=qs('mlang');if(ml)ml.textContent=lang==='nl'?'EN':'NL';document.querySelectorAll('.manual-nl').forEach(e=>e.classList.toggle('hide',lang!=='nl'));document.querySelectorAll('.manual-en').forEach(e=>e.classList.toggle('hide',lang!=='en'));document.querySelectorAll('[data-nl][data-en]').forEach(e=>{e.textContent=e.getAttribute(lang==='en'?'data-en':'data-nl')});document.getElementById('langNL')?.classList.toggle('lang-active',lang==='nl');document.getElementById('langEN')?.classList.toggle('lang-active',lang==='en');document.getElementById('heroLangNL')?.classList.toggle('active',lang==='nl');document.getElementById('heroLangEN')?.classList.toggle('active',lang==='en');}
function setLang(l){lang=l;localStorage.setItem(KEY+'lang',l);initNavLabels();show(document.querySelector('.tab.active')?.id||'dashboard');}

let persons=JSON.parse(localStorage.getItem(PERSON_KEY)||'[]');
const rooms=['Hal','Expeditie','Buitenterrein','Entresol','Kantine','Kantoor','Technische ruimte','Overige ruimte'];
let selectedRoom='Hal';
const warehouseRoomItems={
  'Hal':['Rijroutes en werkpaden vrij','Vloer schoon, droog en veilig','Stellingen / opslag schadevrij','Goederen stabiel en veilig gestapeld','Geen losliggende folie, hout of afval','Brandblussers en noodmiddelen bereikbaar','Nooduitgangen / vluchtroutes vrij','Verlichting voldoende en werkend','Geen lekkage of gevaarlijke situatie'],
  'Expeditie':['Laad- en loszone vrij en veilig','Dockdeuren / overheaddeuren werken goed','Docklevellers / laadbruggen schadevrij','Geen obstakels bij docks of deuren','Vloer schoon, droog en veilig','Pallets en zendingen staan stabiel opgesteld','Brandblussers en noodmiddelen bereikbaar','Nooduitgangen / vluchtroutes vrij','Verlichting voldoende en werkend','Geen lekkage of gevaarlijke situatie'],
  'Buitenterrein':['Terrein vrij van zwerfafval en losse materialen','Rijroutes voor vrachtwagens vrij','Geen gevaarlijke kuilen, verzakkingen of gladde plekken','Hekwerk, poorten en terreinbeveiliging in orde','Parkeerplaatsen en laad-/losplekken veilig bruikbaar','Afwatering/putten vrij en niet verstopt','Buitenverlichting werkt voldoende','Geen onbeheerde pallets, afval of obstakels tegen gevel/nooddeur','Nooduitgangen aan buitenzijde vrij bereikbaar','Geen lekkage, morsing of gevaarlijke situatie'],
  'Entresol':['Trap en leuning stevig en schadevrij','Entresolvloer schoon en vrij van losse materialen','Maximale belasting niet overschreden','Opslag staat stabiel en niet te dicht bij rand','Valbeveiliging / hekwerk aanwezig en schadevrij','Geen geblokkeerde toegang of vluchtroute','Verlichting voldoende en werkend','Brandblussers en noodmiddelen bereikbaar','Geen lekkage of gevaarlijke situatie'],
  'Kantine':['Vloer schoon, droog en veilig','Tafels en stoelen heel en netjes','Afvalbakken niet overvol','Koelkast/magnetron/koffiehoek schoon','Geen etensresten of ongedierte-indicatie','EHBO/noodmiddelen bereikbaar indien aanwezig','Elektrische apparaten en kabels veilig','Verlichting voldoende en werkend','Geen lekkage of gevaarlijke situatie'],
  'Kantoor':['Werkplekken netjes en veilig','Vloer vrij van kabels en struikelgevaar','Elektrische apparatuur/kabels veilig','Nooduitgang / looproute vrij','Brandblussers en noodmiddelen bereikbaar','Verlichting en klimaat werkbaar','Geen overvolle afvalbakken of brandgevaar','Geen lekkage of gevaarlijke situatie'],
  'Technische ruimte':['Ruimte alleen toegankelijk voor bevoegd personeel','Vloer vrij van obstakels en afval','Elektrakasten/installaties vrij bereikbaar','Geen opslag voor of tegen installaties','Ventilatie vrij en werkend','Blusmiddelen/noodmiddelen bereikbaar','Waarschuwingsstickers/signalisatie aanwezig','Geen lekkage, brandlucht of gevaarlijke situatie'],
  'Overige ruimte':['Ruimte schoon en veilig','Geen obstakels of losliggende materialen','Vloer/wanden/plafond zonder gevaarlijke schade','Opslag staat stabiel en veilig','Noodmiddelen bereikbaar indien aanwezig','Vluchtroute of toegang vrij','Verlichting voldoende en werkend','Geen lekkage of gevaarlijke situatie']
};
function warehouseItems(){return warehouseRoomItems[selectedRoom]||warehouseRoomItems['Overige ruimte']}
function warehouseCriticalForRoom(){return warehouseItems().filter(x=>['Brandblussers en noodmiddelen bereikbaar','Nooduitgangen / vluchtroutes vrij','Nooduitgangen aan buitenzijde vrij bereikbaar','Geen lekkage of gevaarlijke situatie','Geen lekkage, morsing of gevaarlijke situatie','Geen lekkage, brandlucht of gevaarlijke situatie','Elektrakasten/installaties vrij bereikbaar','Valbeveiliging / hekwerk aanwezig en schadevrij','Maximale belasting niet overschreden','Docklevellers / laadbruggen schadevrij'].includes(x))}
let wchecks={};
function resetWarehouseChecks(){wchecks={};warehouseItems().forEach(c=>wchecks[c]=null)}
const APP_BUILD='20260502-REALTIME-LANG-PRO-V1';

function repoGuardCheck(){ return true; }
}

let __awcReloadingForUpdate=false;
let __awcSWRegistration=null;
function setUpdateStatus(state,msg){
  const el=document.getElementById('updateStatus');
  if(!el)return;
  el.classList.remove('checking','bad');
  if(state==='checking')el.classList.add('checking');
  if(state==='bad')el.classList.add('bad');
  if(msg)el.textContent=msg;
}
function showUpdateBanner(){document.getElementById('updateBanner')?.classList.add('show');applyI18n();}
function hideUpdateBanner(){document.getElementById('updateBanner')?.classList.remove('show');}
function markLangButtons(){
  document.getElementById('langNL')?.classList.toggle('lang-active',lang==='nl');
  document.getElementById('langEN')?.classList.toggle('lang-active',lang==='en');
}
const __oldSetLang=setLang;
setLang=function(l){__oldSetLang(l);markLangButtons();applyI18n();};
async function clearAllAppCaches(){
  if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)));}
  if('serviceWorker' in navigator){
    const regs=await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(async r=>{try{await r.update();}catch(e){} if(r.waiting)r.waiting.postMessage({type:'SKIP_WAITING'});}));
  }
}
async function forceUpdateNow(){
  try{
    setUpdateStatus('checking', lang==='en'?'🔄 Updating...':'🔄 Bijwerken...');
    sessionStorage.setItem('awc_cache_msg', lang==='en'?'App updated. You are now using the newest version.':'App bijgewerkt. Je gebruikt nu de nieuwste versie.');
    await clearAllAppCaches();
    const url=new URL(location.href);
    url.searchParams.set('v',APP_BUILD+'-'+Date.now());
    location.replace(url.toString());
  }catch(e){
    console.warn('Update failed',e);
    setUpdateStatus('bad', lang==='en'?'⚠️ Update failed':'⚠️ Update mislukt');
    alert(lang==='en'?'Update failed. Clear app cache/storage once in Android settings.':'Update mislukt. Wis één keer cache/opslag via Android app-info.');
  }
}
function registerSWUpdateFix(){
  markLangButtons();
  if(!('serviceWorker' in navigator)){setUpdateStatus('bad', lang==='en'?'⚠️ No offline support':'⚠️ Geen offline support');return;}
  window.addEventListener('load',async()=>{
    try{
      setUpdateStatus('checking', lang==='en'?'🔎 Checking...':'🔎 Controleren...');
      const reg=await navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'});
      __awcSWRegistration=reg;
      await reg.update();
      if(reg.waiting)showUpdateBanner();
      reg.addEventListener('updatefound',()=>{
        const nw=reg.installing;
        if(!nw)return;
        setUpdateStatus('checking', lang==='en'?'⬇️ Downloading update':'⬇️ Update downloaden');
        nw.addEventListener('statechange',()=>{
          if(nw.state==='installed'&&navigator.serviceWorker.controller)showUpdateBanner();
          if(nw.state==='activated')setUpdateStatus('ok', lang==='en'?'✅ Up-to-date':'✅ Actueel');
        });
      });
      navigator.serviceWorker.addEventListener('message',event=>{
        if(event.data&&event.data.type==='AWC_UPDATED')showUpdateBanner();
      });
      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if(__awcReloadingForUpdate)return;
        __awcReloadingForUpdate=true;
        const url=new URL(location.href);url.searchParams.set('v',APP_BUILD+'-'+Date.now());location.replace(url.toString());
      });
      setUpdateStatus('ok', lang==='en'?'✅ Up-to-date':'✅ Actueel');
      setInterval(()=>{__awcSWRegistration?.update?.();},30*60*1000);
    }catch(e){console.warn('Service worker update failed',e);setUpdateStatus('bad', lang==='en'?'⚠️ Update check failed':'⚠️ Updatecheck mislukt');}
  });
}


function init(){repoGuardCheck();lang=localStorage.getItem(KEY+'lang')||'nl';const cm=sessionStorage.getItem('awc_cache_msg');if(cm){sessionStorage.removeItem('awc_cache_msg');setTimeout(()=>alert(cm),400)}initNavLabels();mails.forEach(m=>document.querySelectorAll('select[id$="_mail"]').forEach(s=>s.innerHTML+=`<option value="${m.email}">${m.name}</option>`));checkItems.forEach(c=>checks[c]=null);resetWarehouseChecks();renderChecks();renderRooms();renderWarehouseChecks();renderPersonnel();['p','m','i','w'].forEach(prefix=>attachPhotos(prefix));addRow('d');addRow('c');addOrderRow();updateOrderTotals();initSig();setNow();renderAll();document.addEventListener('input',()=>{updatePallet();updateMachineStatus();updateOrderTotals();updateWA()});document.addEventListener('change',()=>{updatePallet();updateMachineStatus();updateOrderTotals();updateWA()});window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e});registerSWUpdateFix();} 
function show(id){document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));qs(id).classList.add('active');tabs.forEach(x=>qs('nav_'+x[0])?.classList.toggle('active',x[0]===id));const tab=tabs.find(x=>x[0]===id);qs('pageTitle').textContent=(lang==='en'?(tabLabelsEN[tab[1]]||tab[1]):tab[1]).replace(/^[^ ]+ /,'');qs('pageSub').textContent=lang==='en'?(tabSubsEN[tab[2]]||tab[2]):tab[2];document.getElementById('side')?.classList.remove('open');applyI18n();updateWA()}function installApp(){if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;return}const h=document.getElementById('installHelp');if(h){h.classList.add('show');h.scrollIntoView({behavior:'smooth',block:'nearest'});applyI18n();}else{alert(lang==='en'?'Use the browser menu to install the app.':'Gebruik het browsermenu om de app te installeren.')}}
function now(){return new Date().toLocaleString('nl-NL')}function setNow(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());qs('i_time').value=d.toISOString().slice(0,16)}function hist(t){return JSON.parse(localStorage.getItem(KEY+t)||'[]')}function saveHist(t,o){const a=hist(t);a.unshift({...o,id:crypto.randomUUID?.()||Date.now(),timestamp:now()});localStorage.setItem(KEY+t,JSON.stringify(a));renderAll()}function msg(id,txt,ok=false){qs(id).innerHTML=txt?`<div class="notice ${ok?'ok':'err'}">${txt}</div>`:''}function val(id){return qs(id).value.trim()}function num(id){return Number(qs(id).value||0)}
function attachPhotos(prefix){qs(prefix+'_photos').addEventListener('change',async e=>{photos[prefix]=[];for(const f of e.target.files){photos[prefix].push(await fileData(f))}qs(prefix+'_prev').innerHTML=photos[prefix].map(src=>`<img src="${src}">`).join('');updateWA()})}function fileData(f){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)})}
function currentPallet(){return{type:'Pallets',user:val('p_user'),location:val('p_loc'),email:val('p_mail'),euro:num('p_euro'),blok:num('p_blok'),two:num('p_2m'),dpb:num('p_dpb'),total:num('p_euro')+num('p_blok')+num('p_2m')+num('p_dpb'),photos:photos.p}}function updatePallet(){const p=currentPallet();qs('p_sum').innerHTML=[['Euro',p.euro],['Blok',p.blok],['2 meter',p.two],['DPB',p.dpb],['Totaal',p.total],['Foto’s',p.photos.length]].map(x=>`<div class="stat"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')}function savePallet(){const p=currentPallet();if(!p.user)return msg('palletMsg','Vul gebruiker in.');saveHist('pallets',p);msg('palletMsg','Pallettelling opgeslagen.',true)}function mailPallet(){const p=currentPallet();location.href=`mailto:${p.email}?subject=AWC pallettelling ${p.location}&body=${encodeURIComponent(textPallet(p))}`}
function renderChecks(){qs('checks').innerHTML=checkItems.map(c=>`<div class="row ${critical.includes(c)?'critical':''}" id="r_${safe(c)}"><b>${c}${critical.includes(c)?'<span class="tag">KRITIEK</span>':''}</b><button class="choice y" onclick="setCheck('${c}',true)">JA</button><button class="choice n" onclick="setCheck('${c}',false)">NEE</button></div>`).join('')}function safe(s){return s.replace(/\W/g,'_')}function setCheck(c,v){checks[c]=v;const r=qs('r_'+safe(c));r.querySelector('.y').classList.toggle('active',v===true);r.querySelector('.n').classList.toggle('active',v===false);r.classList.toggle('bad',v===false);updateMachineStatus()}function machineResult(){const values=Object.values(checks), missing=values.filter(v=>v===null).length,bad=Object.entries(checks).filter(([k,v])=>v===false),crit=bad.filter(([k])=>critical.includes(k));let status=missing?'NOG NIET COMPLEET':bad.length?'AANDACHT NODIG':'GOEDGEKEURD';if(crit.length)status='AFGEKEURD';return{missing,bad,crit,status}}function updateMachineStatus(){const r=machineResult(),el=qs('m_status');el.textContent=r.status;el.className='pill '+(r.status==='GOEDGEKEURD'?'approved':r.status==='AFGEKEURD'?'rejected':'warning');qs('m_advice').textContent=r.crit.length?'Machine niet gebruiken. Kritieke fout gemeld.':r.bad.length?'Toelichting en foto verplicht bij fout.':'Alles lijkt in orde zodra alle punten zijn ingevuld.'}function currentMachine(){return{type:'Machine',user:val('m_user'),location:val('m_loc'),email:val('m_mail'),machine:val('m_type'),nr:val('m_nr'),serial:val('m_serial'),notes:val('m_notes'),checks:Object.entries(checks).map(([item,value])=>({item,value,critical:critical.includes(item)})),photos:photos.m,status:machineResult().status,signature:qs('sig').toDataURL('image/png')}}function saveMachine(){const m=currentMachine(),r=machineResult();if(!m.user||!m.nr)return msg('mMsg','Vul gebruiker en machinenummer in.');if(r.missing)return msg('mMsg','Vul alle controlepunten in.');if(r.bad.length&&(!m.notes||!m.photos.length))return msg('mMsg','Bij NEE zijn toelichting én foto verplicht.');saveHist('machines',m);msg('mMsg','Machinecheck opgeslagen.',true)}function mailMachine(){const m=currentMachine();location.href=`mailto:${m.email}?subject=AWC machinecheck ${m.nr} ${m.status}&body=${encodeURIComponent(textMachine(m))}`}
function currentIncident(){return{type:'Incident',user:val('i_user'),location:val('i_loc'),email:val('i_mail'),time:val('i_time'),what:val('i_what'),cause:val('i_cause'),injury:val('i_injury'),danger:val('i_danger'),action:val('i_action'),photos:photos.i}}function saveIncident(){const i=currentIncident();if(!i.user||!i.what)return msg('iMsg','Vul melder en gebeurtenis in.');saveHist('incidents',i);msg('iMsg','Incident opgeslagen.',true)}function mailIncident(){const i=currentIncident();location.href=`mailto:${i.email}?subject=AWC incident ${i.location}&body=${encodeURIComponent(Object.entries(i).filter(([k])=>k!=='email').map(([k,v])=>`${k}: ${v}`).join('\n'))}`}
function addRow(p){const box=qs(p+'_rows'),id=p+'_'+Date.now()+Math.random();box.insertAdjacentHTML('beforeend',`<div class="item" data-row="${p}"><div class="grid g3"><div><label>Artikel</label><input class="art"></div><div><label>Aantal</label><input type="number" min="0" class="qty" value="0"></div><div><label>Locatie</label><input class="loc"></div><div><label>${p==='d'?'Schadetype':'Barcode/status'}</label><input class="kind"></div><div><label>Opmerking</label><input class="rem"></div><div><label>Foto</label><input type="file" accept="image/*" multiple onchange="rowPhoto(this)"></div></div><div class="preview"></div><button class="smallbtn" style="margin-top:8px;background:#dc2626" onclick="this.closest('.item').remove()">Verwijder</button></div>`)}async function rowPhoto(inp){const arr=[];for(const f of inp.files)arr.push(await fileData(f));inp.closest('.item').dataset.photos=JSON.stringify(arr);inp.closest('.item').querySelector('.preview').innerHTML=arr.map(s=>`<img src="${s}">`).join('')}function getRows(p){return[...qs((p==='damage'?'d':'c')+'_rows').querySelectorAll('.item')].map(r=>({article:r.querySelector('.art').value,qty:Number(r.querySelector('.qty').value||0),location:r.querySelector('.loc').value,kind:r.querySelector('.kind').value,remarks:r.querySelector('.rem').value,photos:JSON.parse(r.dataset.photos||'[]')})).filter(r=>r.article||r.qty||r.location||r.kind||r.remarks||r.photos.length)}function saveRows(t){const p=t==='damage'?'d':'c',data={type:t,user:val(p+'_user'),location:val(p+'_loc'),client:val(p+'_client'),rows:getRows(t),total:getRows(t).reduce((a,b)=>a+b.qty,0)};if(!data.user||!data.rows.length)return msg(p==='d'?'dMsg':'cMsg','Vul gebruiker en minimaal één regel in.');saveHist(t,data);msg(p==='d'?'dMsg':'cMsg','Registratie opgeslagen.',true)}

function savePersons(){localStorage.setItem(PERSON_KEY,JSON.stringify(persons))}
const personStatusOptions=[['aanwezig','✅ Aanwezig'],['verlof','🌴 Verlof'],['ziek','🤒 Ziek'],['te laat','⏱ Te laat'],['afwezig','❌ Afwezig'],['niet ingeroosterd','📅 Niet ingeroosterd']];function personStatusLabel(v){const nl={aanwezig:'✅ Aanwezig',verlof:'🌴 Verlof',ziek:'🤒 Ziek','te laat':'⏱ Te laat',afwezig:'❌ Afwezig','niet ingeroosterd':'📅 Niet ingeroosterd'};const en={aanwezig:'✅ Present',verlof:'🌴 Leave',ziek:'🤒 Sick','te laat':'⏱ Late',afwezig:'❌ Absent','niet ingeroosterd':'📅 Not scheduled'};return (lang==='en'?en:nl)[v]||v}
function personCounts(){return{present:persons.filter(p=>p.status==='aanwezig').length,leave:persons.filter(p=>p.status==='verlof').length,sick:persons.filter(p=>p.status==='ziek').length,late:persons.filter(p=>p.status==='te laat').length,absent:persons.filter(p=>p.status==='afwezig').length,notScheduled:persons.filter(p=>p.status==='niet ingeroosterd').length,total:persons.length}}
function personnelStatus(){const c=personCounts();if(!c.total)return'GEEN TEAM';if(c.sick+c.absent>=2)return'ACTIE VEREIST';if(c.sick||c.absent||c.late||c.leave)return'AANDACHT NODIG';return'GOEDGEKEURD'}
function addPerson(){const input=qs('pers_name'),name=(input.value||'').trim();if(!name)return msg('persMsg','Vul eerst een naam in.');persons.push({name,status:'aanwezig',note:''});input.value='';savePersons();renderPersonnel()}
function removePerson(i){persons.splice(i,1);savePersons();renderPersonnel()}
function setPersonStatus(i,status){persons[i].status=status;savePersons();renderPersonnel();updateWA()}
function updatePersonNote(i,value){persons[i].note=value;savePersons();updateWA()}
function setAllPresent(){persons.forEach(p=>p.status='aanwezig');savePersons();renderPersonnel()}
function resetPersonStatus(){persons.forEach(p=>{p.status='aanwezig';p.note='' });savePersons();renderPersonnel()}
function clearPersonList(){if(!confirm('Alle namen uit de personeelslijst wissen?'))return;persons=[];savePersons();renderPersonnel()}
function renderPersonnel(){const list=qs('pers_list');if(!list)return;const c=personCounts(),st=personnelStatus();qs('pers_counts').innerHTML=[['Aanwezig',c.present],['Verlof',c.leave],['Ziek',c.sick],['Te laat',c.late],['Afwezig',c.absent],['Niet ingeroosterd',c.notScheduled]].map(x=>`<div class="stat"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('');const badge=qs('pers_status');badge.textContent=st;badge.className='pill '+(st==='GOEDGEKEURD'?'approved':st==='ACTIE VEREIST'?'rejected':'warning');qs('pers_advice').textContent=st==='GOEDGEKEURD'?'Bezetting compleet.':st==='ACTIE VEREIST'?'Meerdere zieken/afwezigen: actie of vervanging nodig.':st==='GEEN TEAM'?'Voeg medewerkers toe aan de lijst.':'Controleer verlof, ziekmeldingen, te laat, afwezigen en niet ingeroosterden.';list.innerHTML=persons.length?persons.map((p,i)=>{const cls=p.status==='ziek'?'sick':p.status==='verlof'?'leave':p.status==='afwezig'?'absent':p.status==='te laat'?'late':p.status==='niet ingeroosterd'?'leave':'';return `<div class="person-card ${cls}"><div class="person-head"><b>${p.name}</b><button class="smallbtn" style="background:#dc2626" onclick="removePerson(${i})">Verwijderen</button></div><div class="person-select"><div><label>Status</label><select onchange="setPersonStatus(${i},this.value)">${personStatusOptions.map(o=>`<option value="${o[0]}" ${p.status===o[0]?'selected':''}>${personStatusLabel(o[0])}</option>`).join('')}</select></div><div><label>Opmerking / reden</label><input placeholder="Bijv. reden, vervanger of tijd" value="${(p.note||'').replace(/"/g,'&quot;')}" oninput="updatePersonNote(${i},this.value)"></div></div><div class="mini">Status: ${p.status}</div></div>`}).join(''):'<div class="item">Nog geen medewerkers toegevoegd.</div>'}

let rosterFoundNames=[];
function rosterMsg(txt){const el=qs('roster_status');if(el)el.textContent=txt}
function setRosterProgress(pct){const el=qs('roster_progress');if(el)el.style.width=Math.max(0,Math.min(100,pct))+'%'}
async function previewRosterImage(inp){const f=inp.files&&inp.files[0];if(!f)return;const src=await fileData(f);qs('roster_preview').innerHTML=`<img src="${src}" alt="Rooster preview">`;rosterMsg('Foto geladen. Klik op Scan roosterfoto om namen te lezen.');setRosterProgress(0)}
function cleanRosterName(line){
  let x=(line||'').replace(/[|_•·;:]+/g,' ').replace(/\s+/g,' ').trim();
  x=x.replace(/\b(0?[0-9]|1[0-9]|2[0-3])[:.][0-5][0-9]\b/g,'').replace(/\b\d{1,2}[-\/ ]\d{1,2}([-\/ ]\d{2,4})?\b/g,'');
  x=x.replace(/\b(ma|di|wo|do|vr|za|zo|mon|tue|wed|thu|fri|sat|sun|dag|avond|nacht|weekend|pauze|shift|start|eind|totaal|datum|naam|afdeling|warehouse|verlof|ziek|vrij)\b/ig,'');
  x=x.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' .-]/g,' ').replace(/\s+/g,' ').trim();
  if(x.length<3||x.length>45)return'';
  const words=x.split(' ').filter(Boolean);
  if(words.length>4)return'';
  if(!/[A-Za-zÀ-ÖØ-öø-ÿ]{2}/.test(x))return'';
  return words.map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');
}
function extractRosterNames(text){
  const skip=/\b(rooster|planning|datum|shift|start|eind|pauze|afdeling|locatie|warehouse|aanwezig|verlof|ziek|vrij|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag)\b/i;
  const raw=(text||'').split(/\n|\r/).map(r=>r.trim()).filter(Boolean);
  const names=[];
  raw.forEach(line=>{
    if(skip.test(line)&&line.split(/\s+/).length<5)return;
    const parts=line.split(/\s{2,}|\t|,/).map(cleanRosterName).filter(Boolean);
    (parts.length?parts:[cleanRosterName(line)]).forEach(n=>{if(n&&!names.some(x=>x.toLowerCase()===n.toLowerCase()))names.push(n)})
  });
  return names.slice(0,60);
}
function renderRosterNames(){
  const box=qs('roster_names');if(!box)return;
  box.innerHTML=rosterFoundNames.length?rosterFoundNames.map((n,i)=>`<div class="ocr-name-row"><input value="${String(n).replace(/"/g,'&quot;')}" oninput="rosterFoundNames[${i}]=this.value"><button class="smallbtn" style="background:#dc2626" onclick="rosterFoundNames.splice(${i},1);renderRosterNames()">×</button></div>`).join('')+'<button class="smallbtn" onclick="rosterFoundNames.push(\'\');renderRosterNames()">+ Naam toevoegen</button>':'<div class="item">Nog geen namen gevonden. Je kunt na de scan namen handmatig corrigeren.</div>';
}
async function scanRosterPhoto(){
  const inp=qs('roster_photo'),file=inp&&inp.files&&inp.files[0];
  if(!file)return rosterMsg('Upload eerst een roosterfoto of screenshot.');
  if(!window.Tesseract)return rosterMsg('OCR kon niet laden. Controleer internetverbinding en probeer opnieuw.');
  rosterMsg('OCR scant de roosterfoto...');setRosterProgress(5);
  try{
    const res=await Tesseract.recognize(file,'nld+eng',{logger:m=>{if(m.status==='recognizing text')setRosterProgress(Math.round((m.progress||0)*90)+5)}});
    setRosterProgress(100);
    rosterFoundNames=extractRosterNames(res.data.text);
    renderRosterNames();
    rosterMsg(rosterFoundNames.length?`${rosterFoundNames.length} mogelijke naam/namen gevonden. Controleer de lijst en klik op Namen overnemen.`:'Geen duidelijke namen gevonden. Probeer een scherpere/rechtere foto of voeg namen handmatig toe.');
  }catch(e){console.error(e);rosterMsg('Scannen mislukt. Probeer een scherpere foto of gebruik handmatig toevoegen.');setRosterProgress(0)}
}
function applyRosterNames(){
  const names=rosterFoundNames.map(n=>String(n||'').trim()).filter(Boolean);
  if(!names.length)return rosterMsg('Geen namen om over te nemen.');
  let added=0;
  names.forEach(name=>{if(!persons.some(p=>p.name.toLowerCase()===name.toLowerCase())){persons.push({name,status:'aanwezig',note:''});added++}});
  savePersons();renderPersonnel();updateWA();rosterMsg(`${added} nieuwe naam/namen overgenomen naar de personeelslijst.`);
}
function clearRosterScan(){rosterFoundNames=[];if(qs('roster_photo'))qs('roster_photo').value='';if(qs('roster_preview'))qs('roster_preview').innerHTML='';setRosterProgress(0);renderRosterNames();rosterMsg('Scan gewist. Upload eventueel een nieuwe roosterfoto.')}

function currentPersonnel(){return{type:'Personeel',lead:val('pers_lead'),shift:val('pers_shift'),location:val('pers_loc'),notes:val('pers_notes'),people:persons.map(p=>({...p})),counts:personCounts(),status:personnelStatus()}}
function savePersonnel(){const p=currentPersonnel();if(!p.lead)return msg('persMsg','Vul teamleider in.');if(!p.people.length)return msg('persMsg','Voeg minimaal één medewerker toe.');saveHist('personnel',p);msg('persMsg','Personeel check opgeslagen.',true)}
function mailPersonnel(){const p=currentPersonnel();location.href=`mailto:${p.email}?subject=AWC personeel check ${p.shift} ${p.status}&body=${encodeURIComponent(textPersonnel(p))}`}
function personIcon(st){return st==='aanwezig'?'✅':st==='verlof'?'🌴':st==='ziek'?'🤒':st==='te laat'?'⏱':st==='niet ingeroosterd'?'📅':'❌'}
function textPersonnel(p){return `👥 AWC Personeel check
Teamleider: ${p.lead}
Shift: ${p.shift}
Locatie: ${p.location}
Status: ${p.status}
Aanwezig: ${p.counts.present}
Verlof: ${p.counts.leave}
Ziek: ${p.counts.sick}
Te laat: ${p.counts.late}
Afwezig: ${p.counts.absent}

${p.people.map(x=>`${personIcon(x.status)} ${x.name} - ${x.status}${x.note?' - '+x.note:''}`).join('\n')}

Opmerking: ${p.notes||'-'}`}

function renderRooms(){const box=qs('room_buttons');if(!box)return;box.innerHTML=rooms.map(r=>`<button class="roombtn ${r===selectedRoom?'active':''}" onclick="setRoom('${r}')">${r}</button>`).join('');qs('custom_room_wrap').classList.toggle('hide',selectedRoom!=='Overige ruimte');updateWarehouseStatus()}
function setRoom(r){selectedRoom=r;resetWarehouseChecks();renderRooms();renderWarehouseChecks();updateWA()}
function renderWarehouseChecks(){const box=qs('w_checks');if(!box)return;const crit=warehouseCriticalForRoom();box.innerHTML=warehouseItems().map(c=>`<div class="row ${crit.includes(c)?'critical':''}" id="wr_${safe(c)}"><b>${c}${crit.includes(c)?'<span class="tag">KRITIEK</span>':''}</b><button class="choice y" onclick="setWarehouseCheck('${c}',true)">JA</button><button class="choice n" onclick="setWarehouseCheck('${c}',false)">NEE</button></div>`).join('')}
function setWarehouseCheck(c,v){wchecks[c]=v;const r=qs('wr_'+safe(c));r.querySelector('.y').classList.toggle('active',v===true);r.querySelector('.n').classList.toggle('active',v===false);r.classList.toggle('bad',v===false);updateWarehouseStatus()}
function warehouseResult(){const values=Object.values(wchecks),missing=values.filter(v=>v===null).length,bad=Object.entries(wchecks).filter(([k,v])=>v===false),crit=bad.filter(([k])=>warehouseCriticalForRoom().includes(k));let status=missing?'NOG NIET COMPLEET':bad.length?'AANDACHT NODIG':'GOEDGEKEURD';if(crit.length)status='AFGEKEURD';return{missing,bad,crit,status}}
function updateWarehouseStatus(){if(!qs('w_status'))return;const r=warehouseResult(),el=qs('w_status');el.textContent=r.status;el.className='pill '+(r.status==='GOEDGEKEURD'?'approved':r.status==='AFGEKEURD'?'rejected':'warning');qs('w_advice').textContent=r.crit.length?'Ruimte direct veiligstellen. Kritieke fout gemeld.':r.bad.length?'Toelichting en foto verplicht bij fout.':'Alles lijkt in orde zodra alle punten zijn ingevuld.'}
function currentWarehouse(){return{type:'Warehouse ruimtecheck',user:val('w_user'),location:val('w_loc'),email:val('w_mail'),room:selectedRoom==='Overige ruimte'?(val('w_custom_room')||'Overige ruimte'):selectedRoom,notes:val('w_notes'),checks:Object.entries(wchecks).map(([item,value])=>({item,value,critical:warehouseCriticalForRoom().includes(item)})),photos:photos.w,status:warehouseResult().status}}
function saveWarehouse(){const w=currentWarehouse(),r=warehouseResult();if(!w.user)return msg('wMsg','Vul controleur in.');if(selectedRoom==='Overige ruimte'&&!val('w_custom_room'))return msg('wMsg','Vul de naam van de overige ruimte in.');if(r.missing)return msg('wMsg','Vul alle controlepunten in.');if(r.bad.length&&(!w.notes||!w.photos.length))return msg('wMsg','Bij NEE zijn toelichting én foto verplicht.');saveHist('warehouse',w);msg('wMsg','Warehouse ruimtecheck opgeslagen.',true)}
function mailWarehouse(){const w=currentWarehouse();location.href=`mailto:${w.email}?subject=AWC warehouse check ${w.room} ${w.status}&body=${encodeURIComponent(textWarehouse(w))}`}
function textWarehouse(w){return `🏭 AWC Warehouse ruimtecheck\nStatus: ${w.status}\nControleur: ${w.user}\nLocatie: ${w.location}\nRuimte: ${w.room}\n\n${w.checks.map(c=>`${c.value===true?'✅':c.value===false?'❌':'⬜'} ${c.item}`).join('\n')}\n\nToelichting: ${w.notes||'-'}`}

function addOrderRow(){const box=qs('o_rows');if(!box)return;box.insertAdjacentHTML('beforeend',`<div class="item" data-order-row><div class="grid g4"><div><label>Artikelnummer</label><input class="o_art" placeholder="Artikelnummer" oninput="updateOrderTotals()"></div><div><label>Hoeveelheid artikelen</label><input type="number" min="0" class="o_qty" value="0" oninput="updateOrderTotals()"></div><div><label>Aantal colli</label><input type="number" min="0" step="1" class="o_colli" value="0" oninput="syncOrderPackages(this.closest('[data-order-row]'))"></div><div><label>Aantal pallets</label><input type="number" min="0" step="1" class="o_pallets" value="0" oninput="syncOrderPackages(this.closest('[data-order-row]'))"></div><div style="grid-column:1/-1"><label>Opmerking artikelregel</label><input class="o_rem" placeholder="Bijv. afwijking, verpakking, label" oninput="updateOrderTotals()"></div></div><div class="muted" style="margin:10px 0 6px">Vul hieronder per colli/pallet het netto gewicht en de afmetingen in.</div><div class="o_packages"></div><button class="smallbtn" style="margin-top:8px;background:#dc2626" onclick="this.closest('.item').remove();updateOrderTotals()">Verwijder regel</button></div>`);syncOrderPackages(box.lastElementChild);updateOrderTotals()}
function packageArticleHtml(data={}){return `<div class="grid g3 o_pkg_article_row" style="margin-top:8px;align-items:end"><div><label>Artikelnummer</label><input class="o_pkg_art" placeholder="Artikelnummer" value="${data.article||''}" oninput="updateOrderTotals()"></div><div><label>Hoeveelheid</label><input type="number" min="0" step="1" class="o_pkg_qty" value="${data.qty||0}" oninput="updateOrderTotals()"></div><div><button class="smallbtn" style="background:#dc2626;width:100%" onclick="this.closest('.o_pkg_article_row').remove();updateOrderTotals()">Verwijder artikel</button></div></div>`}
function packageHtml(type,index,data={}){const label=type==='colli'?'Colli':'Pallet';const arts=(data.articles&&data.articles.length?data.articles:[{}]).map(packageArticleHtml).join('');return `<div class="item" data-package data-type="${type}" data-index="${index}" style="background:#fff;border-style:dashed"><b>${label} ${index}</b><div class="grid g4" style="margin-top:8px"><div><label>Netto gewicht kg</label><input type="number" min="0" step="0.01" class="o_pkg_weight" value="${data.weight||0}" oninput="updateOrderTotals()"></div><div><label>Lengte cm</label><input type="number" min="0" step="0.1" class="o_pkg_l" value="${data.length||0}" oninput="updateOrderTotals()"></div><div><label>Breedte cm</label><input type="number" min="0" step="0.1" class="o_pkg_w" value="${data.width||0}" oninput="updateOrderTotals()"></div><div><label>Hoogte cm</label><input type="number" min="0" step="0.1" class="o_pkg_h" value="${data.height||0}" oninput="updateOrderTotals()"></div></div><div class="muted" style="margin-top:10px">Artikelen in deze ${label.toLowerCase()}</div><div class="o_pkg_articles">${arts}</div><button class="smallbtn" style="margin-top:8px" onclick="addPackageArticle(this)">+ Artikel toevoegen aan ${label.toLowerCase()}</button></div>`}
function addPackageArticle(btn){const box=btn.closest('[data-package]').querySelector('.o_pkg_articles');box.insertAdjacentHTML('beforeend',packageArticleHtml({}));updateOrderTotals()}
function readPackages(row){return[...row.querySelectorAll('[data-package]')].map(p=>{const l=Number(p.querySelector('.o_pkg_l')?.value||0),w=Number(p.querySelector('.o_pkg_w')?.value||0),h=Number(p.querySelector('.o_pkg_h')?.value||0);const articles=[...p.querySelectorAll('.o_pkg_article_row')].map(a=>({article:a.querySelector('.o_pkg_art')?.value.trim()||'',qty:Number(a.querySelector('.o_pkg_qty')?.value||0)})).filter(a=>a.article||a.qty);return{type:p.dataset.type,index:Number(p.dataset.index||0),weight:Number(p.querySelector('.o_pkg_weight')?.value||0),length:l,width:w,height:h,volume_m3:Math.round((l*w*h/1000000)*1000)/1000,articles}})}
function syncOrderPackages(row){if(!row)return;const existing={};readPackages(row).forEach(p=>existing[`${p.type}-${p.index}`]=p);const colli=Math.max(0,Math.floor(Number(row.querySelector('.o_colli')?.value||0))),pallets=Math.max(0,Math.floor(Number(row.querySelector('.o_pallets')?.value||0)));row.querySelector('.o_colli').value=colli;row.querySelector('.o_pallets').value=pallets;let html='';for(let i=1;i<=colli;i++)html+=packageHtml('colli',i,existing[`colli-${i}`]);for(let i=1;i<=pallets;i++)html+=packageHtml('pallet',i,existing[`pallet-${i}`]);row.querySelector('.o_packages').innerHTML=html||'<div class="muted">Vul eerst aantal colli of pallets in.</div>';updateOrderTotals()}
function orderRows(){return[...qs('o_rows').querySelectorAll('[data-order-row]')].map(r=>{const packages=readPackages(r),colli=Number(r.querySelector('.o_colli').value||0),pallets=Number(r.querySelector('.o_pallets').value||0),weight=Math.round(packages.reduce((a,b)=>a+b.weight,0)*100)/100,volume_m3=Math.round(packages.reduce((a,b)=>a+b.volume_m3,0)*1000)/1000,articleQty=packages.reduce((a,p)=>a+(p.articles||[]).reduce((x,y)=>x+y.qty,0),0);return{article:r.querySelector('.o_art').value.trim(),qty:articleQty||Number(r.querySelector('.o_qty').value||0),colli,pallets,weight,volume_m3,packages,remarks:r.querySelector('.o_rem').value.trim()}}).filter(r=>r.article||r.qty||r.colli||r.pallets||r.weight||r.volume_m3||r.remarks||r.packages.some(p=>(p.articles||[]).length))}
function orderTotals(rows=orderRows()){return{qty:rows.reduce((a,b)=>a+b.qty,0),colli:rows.reduce((a,b)=>a+b.colli,0),pallets:rows.reduce((a,b)=>a+b.pallets,0),weight:Math.round(rows.reduce((a,b)=>a+b.weight,0)*100)/100,volume:Math.round(rows.reduce((a,b)=>a+b.volume_m3,0)*1000)/1000,lines:rows.length}}
function updateOrderTotals(){if(!qs('o_totals'))return;const t=orderTotals();qs('o_totals').innerHTML=[['Regels',t.lines],['Hoeveelheid',t.qty],['Colli',t.colli],['Pallets',t.pallets],['Netto gewicht kg',t.weight],['Volume m³',t.volume]].map(x=>`<div class="stat"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')}
function currentOrder(){const rows=orderRows();return{type:'Order wegen',user:val('o_user'),location:val('o_loc'),email:val('o_mail'),order:val('o_order'),client:val('o_client'),notes:val('o_notes'),rows,totals:orderTotals(rows)}}
function saveOrder(){const o=currentOrder();if(!o.user||!o.order)return msg('oMsg','Vul gebruiker en ordernummer in.');if(!o.rows.length)return msg('oMsg','Voeg minimaal één orderregel toe.');saveHist('orders',o);msg('oMsg','Orderweging opgeslagen.',true)}
function mailOrder(){const o=currentOrder();location.href=`mailto:${o.email}?subject=AWC orderweging ${o.order}&body=${encodeURIComponent(textOrder(o))}`}
function packageText(p){const label=p.type==='colli'?'Colli':'Pallet';const arts=(p.articles||[]).map(a=>`    • Artikel ${a.article||'-'} | aantal ${a.qty}`).join('\n');return `  - ${label} ${p.index}: ${p.weight} kg netto | ${p.length}x${p.width}x${p.height} cm | ${p.volume_m3} m³${arts?'\n'+arts:''}`}
function textOrder(o){return `⚖️ AWC Orderweging
Gebruiker: ${o.user}
Locatie: ${o.location}
Order: ${o.order}
Klant/leverancier: ${o.client||'-'}
Regels: ${o.totals.lines}
Hoeveelheid: ${o.totals.qty}
Colli: ${o.totals.colli}
Pallets: ${o.totals.pallets}
Netto gewicht: ${o.totals.weight} kg
Volume: ${o.totals.volume} m³

${o.rows.map(r=>`Artikel ${r.article||'-'} | aantal ${r.qty} | colli ${r.colli} | pallets ${r.pallets} | netto ${r.weight} kg | volume ${r.volume_m3} m³${r.remarks?' | '+r.remarks:''}\n${(r.packages||[]).map(packageText).join('\n')}`).join('\n\n')}

Opmerking: ${o.notes||'-'}`}


function currentRowsData(t){const p=t==='damage'?'d':'c';const rows=getRows(t);return{type:t,user:val(p+'_user'),location:val(p+'_loc'),email:val(p+'_mail'),client:val(p+'_client'),rows,total:rows.reduce((a,b)=>a+b.qty,0),photoCount:rows.reduce((a,b)=>a+(b.photos?.length||0),0)}}
function textRows(t,data=currentRowsData(t)){const title=t==='damage'?'💥 AWC Schade registratie':'📉 AWC Manco registratie';const soort=t==='damage'?'Schadetype':'Barcode/status';const regels=data.rows.length?data.rows.map((r,i)=>`${i+1}. Artikel: ${r.article||'-'} | Aantal: ${r.qty||0} | Locatie: ${r.location||'-'} | ${soort}: ${r.kind||'-'} | Opmerking: ${r.remarks||'-'} | Foto’s: ${(r.photos||[]).length}`).join('\n'):'Geen regels ingevuld';return `${title}\nGebruiker: ${data.user||'-'}\nVestiging: ${data.location||'-'}\nKlant/leverancier: ${data.client||'-'}\nTotaal stuks: ${data.total||0}\nAantal foto's: ${data.photoCount||0}\n\nRegels:\n${regels}\n\nLet op: de mail bevat de tekstgegevens. Voeg de PDF/foto’s handmatig toe als bijlage wanneer nodig.`}
function mailRows(t){const data=currentRowsData(t);if(!data.user||!data.rows.length)return msg(t==='damage'?'dMsg':'cMsg','Vul gebruiker en minimaal één regel in voordat je mailt.');const onderwerp=t==='damage'?`AWC schade registratie ${data.location}`:`AWC manco registratie ${data.location}`;location.href=`mailto:${data.email}?subject=${encodeURIComponent(onderwerp)}&body=${encodeURIComponent(textRows(t,data))}`}
function renderAll(){renderStats();renderHistory('pallets','p_hist');renderHistory('personnel','pers_hist');renderHistory('warehouse','w_hist');renderHistory('orders','o_hist');renderHistory('machines','m_hist');renderHistory('incidents','i_hist');renderHistory('damage','d_hist');renderHistory('manco','c_hist');updatePallet();updateMachineStatus();updateWarehouseStatus();renderPersonnel();updateOrderTotals();updateWA()}
function renderStats(){const ps=hist('pallets'),per=hist('personnel'),ws=hist('warehouse'),os=hist('orders'),ms=hist('machines'),is=hist('incidents'),ds=hist('damage'),cs=hist('manco');const totalP=ps.reduce((a,b)=>a+(b.total||0),0),faults=ms.filter(m=>m.status!=='GOEDGEKEURD').length+ws.filter(w=>w.status!=='GOEDGEKEURD').length;qs('stats').innerHTML=[['Palletchecks',ps.length],['Personeel checks',per.length],['Warehousecontroles',ws.length],['Orderwegingen',os.length],['Machinechecks',ms.length],['Afgekeurd/aandacht',faults],['Incidenten',is.length],['Schades',ds.length],['Manco',cs.length],['Totaal pallets',totalP],['Laatste update',[...ps,...per,...ws,...os,...ms,...is,...ds,...cs][0]?.timestamp||'-']].map(x=>`<div class="stat"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('');const all=[...ps.map(x=>['Pallets',x]),...per.map(x=>['Personeel',x]),...ws.map(x=>['Warehouse',x]),...os.map(x=>['Order',x]),...ms.map(x=>['Machines',x]),...is.map(x=>['Incident',x]),...ds.map(x=>['Schade',x]),...cs.map(x=>['Manco',x])].slice(0,8);qs('recent').innerHTML=all.length?all.map(([t,x])=>`<div class="item"><b>${t}</b><div>${x.user||x.lead||x.location||'-'} • ${x.timestamp||''}</div><div class="muted">${x.status||x.room||x.location||''}</div></div>`).join(''):'<div class="item">Nog geen registraties.</div>';qs('loctable').innerHTML=['Conakryweg','Slego','Buitenterrein'].map(l=>`<tr><td>${l}</td><td>${ps.filter(x=>x.location===l).length}</td><td>${ms.filter(x=>x.location===l).length}</td><td>${is.filter(x=>x.location===l).length}</td><td>${ds.filter(x=>x.location===l).length}</td><td>${cs.filter(x=>x.location===l).length}</td></tr>`).join('')}function renderHistory(t,id){const a=hist(t);qs(id).innerHTML=a.length?a.map(x=>`<div class="item"><div class="itemtop"><div><b>${x.type||t} - ${x.user||'-'}</b><div class="muted">${x.timestamp} • ${x.location||''} ${x.status?'• '+x.status:''}</div></div><button class="smallbtn" onclick="pdfAny('${t}','${x.id}')">PDF</button></div></div>`).join(''):'<div class="item">Nog geen historie.</div>'}
function doc(title){const {jsPDF}=window.jspdf;const d=new jsPDF('p','mm','a4');d.setFillColor(17,17,17);d.rect(0,0,210,28,'F');d.setTextColor(255,122,0);d.setFontSize(18);d.text('AWC Warehouse Tool',12,18);d.setTextColor(255);d.setFontSize(10);d.text('Amsterdam Warehouse Company • Conakryweg / Slego',118,12);d.text(new Date().toLocaleString('nl-NL'),118,18);d.setTextColor(17);d.setFontSize(16);d.text(title,12,42);return d}function addLines(d,lines,y=52){d.setFontSize(10);lines.forEach(line=>{if(y>275){d.addPage();y=18}d.text(String(line),12,y);y+=7});return y}async function addImgs(d,imgs,y){for(const im of imgs||[]){if(y>220){d.addPage();y=18}try{d.addImage(im,'JPEG',12,y,52,38);y+=44}catch(e){}}return y}async function pdfPallet(p){let d=doc('Pallettelling');let y=addLines(d,[`Gebruiker: ${p.user}`,`Locatie: ${p.location}`,`Euro: ${p.euro}`,`Blok: ${p.blok}`,`2 meter: ${p.two}`,`DPB: ${p.dpb}`,`Totaal: ${p.total}`]);y=await addImgs(d,p.photos,y);d.save(`AWC-pallettelling-${Date.now()}.pdf`)}async function pdfMachine(m){let d=doc(`Machinecheck - ${m.status}`);let y=addLines(d,[`Gebruiker: ${m.user}`,`Locatie: ${m.location}`,`Machine: ${m.machine}`,`Nummer: ${m.nr}`,`Serienummer: ${m.serial}`,`Status: ${m.status}`,`Toelichting: ${m.notes||'-'}`]);m.checks.forEach(c=>{y=addLines(d,[`${c.value===true?'JA':c.value===false?'NEE':'-'} - ${c.item}${c.critical?' (KRITIEK)':''}`],y)});y=await addImgs(d,m.photos,y);try{d.addImage(m.signature,'PNG',120,230,60,25)}catch(e){}d.save(`AWC-machinecheck-${m.nr||Date.now()}.pdf`)}async function pdfPersonnel(p){let d=doc(`Personeel check - ${p.status}`);let y=addLines(d,[`Teamleider: ${p.lead}`,`Shift: ${p.shift}`,`Locatie: ${p.location}`,`Status: ${p.status}`,`Aanwezig: ${p.counts.present}`,`Verlof: ${p.counts.leave||0}`,`Ziek: ${p.counts.sick||0}`,`Te laat: ${p.counts.late}`,`Afwezig: ${p.counts.absent}`,`Niet ingeroosterd: ${p.counts.notScheduled||0}`,`Opmerking: ${p.notes||'-'}`]);y=addLines(d,['','Medewerkers:'],y);p.people.forEach(x=>{y=addLines(d,[`${x.name} - ${x.status}${x.note?' - '+x.note:''}`],y)});d.save(`AWC-personeel-${Date.now()}.pdf`)}
async function pdfOrder(o){let d=doc(`Orderweging - ${o.order||''}`);let y=addLines(d,[`Gebruiker: ${o.user}`,`Locatie: ${o.location}`,`Ordernummer: ${o.order}`,`Klant/leverancier: ${o.client||'-'}`,`Regels: ${o.totals.lines}`,`Hoeveelheid: ${o.totals.qty}`,`Colli: ${o.totals.colli}`,`Pallets: ${o.totals.pallets}`,`Netto gewicht: ${o.totals.weight} kg`,`Volume: ${o.totals.volume} m3`,`Opmerking: ${o.notes||'-'}`]);y=addLines(d,['','Orderregels:'],y);o.rows.forEach(r=>{y=addLines(d,[`${r.article||'-'} | aantal ${r.qty} | colli ${r.colli} | pallets ${r.pallets} | netto ${r.weight} kg | volume ${r.volume_m3} m3${r.remarks?' | '+r.remarks:''}`],y);(r.packages||[]).forEach(p=>{const label=p.type==='colli'?'Colli':'Pallet';y=addLines(d,[`  - ${label} ${p.index}: ${p.weight} kg netto | ${p.length}x${p.width}x${p.height} cm | ${p.volume_m3} m3`],y);(p.articles||[]).forEach(a=>{y=addLines(d,[`      Artikel ${a.article||'-'} | aantal ${a.qty}`],y)})})});d.save(`AWC-orderweging-${o.order||Date.now()}.pdf`)}

async function pdfWarehouse(w){let d=doc(`Warehousecontrole - ${w.status}`);let y=addLines(d,[`Controleur: ${w.user}`,`Locatie: ${w.location}`,`Ruimte: ${w.room}`,`Status: ${w.status}`,`Toelichting: ${w.notes||'-'}`]);w.checks.forEach(c=>{y=addLines(d,[`${c.value===true?'JA':c.value===false?'NEE':'-'} - ${c.item}${c.critical?' (KRITIEK)':''}`],y)});y=await addImgs(d,w.photos,y);d.save(`AWC-warehouse-${w.room||Date.now()}.pdf`)}
async function pdfIncident(i){let d=doc('Incidentrapport');let y=addLines(d,[`Melder: ${i.user}`,`Locatie: ${i.location}`,`Tijd: ${i.time}`,`Letsel/schade: ${i.injury}`,`Direct gevaar: ${i.danger}`,`Gebeurtenis: ${i.what}`,`Oorzaak: ${i.cause}`,`Actie/preventie: ${i.action}`]);y=await addImgs(d,i.photos,y);d.save(`AWC-incident-${Date.now()}.pdf`)}async function pdfRows(t){const p=t==='damage'?'d':'c',data={type:t,user:val(p+'_user'),location:val(p+'_loc'),client:val(p+'_client'),rows:getRows(t),total:getRows(t).reduce((a,b)=>a+b.qty,0)};let d=doc(t==='damage'?'Schade registratie':'Manco registratie');let y=addLines(d,[`Gebruiker: ${data.user}`,`Locatie: ${data.location}`,`Klant/leverancier: ${data.client}`,`Totaal stuks: ${data.total}`]);for(const r of data.rows){y=addLines(d,[`${r.article} | aantal ${r.qty} | locatie ${r.location} | ${r.kind} | ${r.remarks}`],y);y=await addImgs(d,r.photos,y)}d.save(`AWC-${t}-${Date.now()}.pdf`)}function pdfAny(t,id){const x=hist(t).find(o=>o.id===id);if(t==='pallets')pdfPallet(x);if(t==='personnel')pdfPersonnel(x);if(t==='warehouse')pdfWarehouse(x);if(t==='orders')pdfOrder(x);if(t==='machines')pdfMachine(x);if(t==='incidents')pdfIncident(x);if(t==='damage'||t==='manco'){let d=doc(t);addLines(d,JSON.stringify(x,null,2).split('\n'));d.save(`AWC-${t}.pdf`)}}
function textPallet(p){return `📦 AWC Pallettelling\nGebruiker: ${p.user}\nLocatie: ${p.location}\nEuro: ${p.euro}\nBlok: ${p.blok}\n2 meter: ${p.two}\nDPB: ${p.dpb}\nTotaal: ${p.total}`}function textMachine(m){return `🛠 AWC Machinecheck\nStatus: ${m.status}\nGebruiker: ${m.user}\nMachine: ${m.machine} ${m.nr}\nLocatie: ${m.location}\n\n${m.checks.map(c=>`${c.value===true?'✅':c.value===false?'❌':'⬜'} ${c.item}`).join('\n')}\n\nToelichting: ${m.notes||'-'}`}function updateWA(){const active=document.querySelector('.tab.active')?.id;let txt='AWC Warehouse Tool';if(active==='pallets')txt=textPallet(currentPallet());if(active==='personnel')txt=textPersonnel(currentPersonnel());if(active==='warehouse')txt=textWarehouse(currentWarehouse());if(active==='orders')txt=textOrder(currentOrder());if(active==='machines')txt=textMachine(currentMachine());if(active==='incidents')txt='⚠️ AWC Incident\n'+val('i_what');if(active==='damage')txt=textRows('damage');if(active==='manco')txt=textRows('manco');qs('wa').href='https://wa.me/?text='+encodeURIComponent(txt+'\n\n'+location.href)}
function excelRows(t){let data=hist(t);if(!data.length&&['damage','manco'].includes(t))data=getRows(t);if(!Array.isArray(data))data=[data];const flat=data.map(o=>{const c={...o};delete c.photos;delete c.signature;delete c.checks;delete c.rows;return c});const ws=XLSX.utils.json_to_sheet(flat),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,t);XLSX.writeFile(wb,`AWC-${t}.xlsx`)}function exportAllExcel(){['pallets','personnel','warehouse','orders','machines','incidents','damage','manco'].forEach(t=>{if(hist(t).length)excelRows(t)})}function backupJSON(){const data={pallets:hist('pallets'),personnel:hist('personnel'),warehouse:hist('warehouse'),orders:hist('orders'),machines:hist('machines'),incidents:hist('incidents'),damage:hist('damage'),manco:hist('manco')};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='AWC-backup.json';a.click()}async function restoreJSON(inp){const text=await inp.files[0].text(),data=JSON.parse(text);Object.entries(data).forEach(([k,v])=>localStorage.setItem(KEY+k,JSON.stringify(v)));renderAll()}function clearAll(){if(confirm('Alles wissen?')){['pallets','personnel','warehouse','orders','machines','incidents','damage','manco'].forEach(k=>localStorage.removeItem(KEY+k));renderAll()}}
function initSig(){const c=qs('sig'),ctx=c.getContext('2d');function resize(){c.width=c.offsetWidth*2;c.height=c.offsetHeight*2;ctx.scale(2,2);ctx.lineWidth=3;ctx.lineCap='round'}resize();let draw=false;function pos(e){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return{x:p.clientX-r.left,y:p.clientY-r.top}}c.onpointerdown=e=>{draw=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};c.onpointermove=e=>{if(!draw)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke()};c.onpointerup=()=>draw=false}function clearSig(){const c=qs('sig');c.getContext('2d').clearRect(0,0,c.width,c.height)}

/* V23.8 fixes: Excel, PDF layout, bigger photos, damage/manco saved PDF */
function saveRows(t){const p=t==='damage'?'d':'c',rows=getRows(t),data={type:t,user:val(p+'_user'),location:val(p+'_loc'),email:val(p+'_mail'),client:val(p+'_client'),rows,total:rows.reduce((a,b)=>a+b.qty,0),photoCount:rows.reduce((a,b)=>a+(b.photos?.length||0),0)};if(!data.user||!data.rows.length)return msg(p==='d'?'dMsg':'cMsg','Vul gebruiker en minimaal één regel in.');saveHist(t,data);msg(p==='d'?'dMsg':'cMsg','Registratie opgeslagen.',true)}
function addLines(d,lines,y=52){d.setFontSize(10);lines.forEach(line=>{const wrapped=d.splitTextToSize(String(line),180);wrapped.forEach(w=>{if(y>275){d.addPage();y=18}d.text(w,12,y);y+=6});});return y}
async function addImgs(d,imgs,y){for(const im of imgs||[]){try{const props=d.getImageProperties(im);const pageW=210,maxW=150,maxH=105;let w=maxW,h=(props.height*maxW)/props.width;if(h>maxH){h=maxH;w=(props.width*maxH)/props.height}if(y+h>282){d.addPage();y=18}d.setFontSize(9);d.setTextColor(80);d.text('Foto',12,y);y+=4;d.addImage(im,props.fileType||'JPEG',(pageW-w)/2,y,w,h);y+=h+10;d.setTextColor(17)}catch(e){}}return y}
function packageText(p){const label=p.type==='colli'?'Colli':'Pallet';const arts=(p.articles||[]).map(a=>`      Artikel: ${a.article||'-'}\n      Aantal: ${a.qty}`).join('\n');return `${label} ${p.index}\n  Netto gewicht: ${p.weight} kg\n  Lengte: ${p.length} cm\n  Breedte: ${p.width} cm\n  Hoogte: ${p.height} cm\n  Volume: ${p.volume_m3} m³${arts?'\n  Artikelen:\n'+arts:''}`}
function textOrder(o){return `⚖️ AWC Orderweging\n\nGebruiker: ${o.user}\nLocatie: ${o.location}\nOrder: ${o.order}\nKlant/leverancier: ${o.client||'-'}\n\nTOTALEN\nRegels: ${o.totals.lines}\nHoeveelheid: ${o.totals.qty}\nColli: ${o.totals.colli}\nPallets: ${o.totals.pallets}\nNetto gewicht: ${o.totals.weight} kg\nVolume: ${o.totals.volume} m³\n\nORDERREGELS\n${o.rows.map((r,i)=>`Regel ${i+1}\nArtikelregel: ${r.article||'-'}\nAantal: ${r.qty}\nColli: ${r.colli}\nPallets: ${r.pallets}\nNetto gewicht: ${r.weight} kg\nVolume: ${r.volume_m3} m³\nOpmerking: ${r.remarks||'-'}\n${(r.packages||[]).map(packageText).join('\n\n')}`).join('\n\n')}\n\nOpmerking algemeen: ${o.notes||'-'}`}
async function pdfOrder(o){let d=doc(`Orderweging - ${o.order||''}`);let y=addLines(d,[`Gebruiker: ${o.user}`,`Locatie: ${o.location}`,`Ordernummer: ${o.order}`,`Klant/leverancier: ${o.client||'-'}`,'',`Regels: ${o.totals.lines}`,`Hoeveelheid: ${o.totals.qty}`,`Colli: ${o.totals.colli}`,`Pallets: ${o.totals.pallets}`,`Netto gewicht: ${o.totals.weight} kg`,`Volume: ${o.totals.volume} m3`,`Opmerking: ${o.notes||'-'}`]);y=addLines(d,['','Orderregels:'],y);o.rows.forEach((r,i)=>{y=addLines(d,[`Regel ${i+1}`,`Artikelregel: ${r.article||'-'}`,`Aantal: ${r.qty}`,`Colli: ${r.colli}`,`Pallets: ${r.pallets}`,`Netto gewicht: ${r.weight} kg`,`Volume: ${r.volume_m3} m3`,`Opmerking: ${r.remarks||'-'}`],y);(r.packages||[]).forEach(p=>{const label=p.type==='colli'?'Colli':'Pallet';y=addLines(d,[`  ${label} ${p.index}`,`  Netto gewicht: ${p.weight} kg`,`  Lengte: ${p.length} cm`,`  Breedte: ${p.width} cm`,`  Hoogte: ${p.height} cm`,`  Volume: ${p.volume_m3} m3`],y);(p.articles||[]).forEach(a=>{y=addLines(d,[`    Artikel: ${a.article||'-'}`,`    Aantal: ${a.qty}`],y)});y+=2});y+=3});d.save(`AWC-orderweging-${o.order||Date.now()}.pdf`)}
function textRows(t,data=currentRowsData(t)){const title=t==='damage'?'💥 AWC Schade registratie':'📉 AWC Manco registratie';const soort=t==='damage'?'Schadetype':'Barcode/status';const regels=data.rows.length?data.rows.map((r,i)=>`Regel ${i+1}\nArtikel: ${r.article||'-'}\nAantal: ${r.qty||0}\nLocatie: ${r.location||'-'}\n${soort}: ${r.kind||'-'}\nOpmerking: ${r.remarks||'-'}\nFoto’s: ${(r.photos||[]).length}`).join('\n\n'):'Geen regels ingevuld';return `${title}\n\nGebruiker: ${data.user||'-'}\nVestiging: ${data.location||'-'}\nKlant/leverancier: ${data.client||'-'}\nTotaal stuks: ${data.total||0}\nAantal foto's: ${data.photoCount||0}\n\nREGELS\n${regels}\n\nLet op: de mail bevat de tekstgegevens. Voeg de PDF/foto’s handmatig toe als bijlage wanneer nodig.`}
async function pdfRowsData(t,data){const title=t==='damage'?'Schade registratie':'Manco registratie';const soort=t==='damage'?'Schadetype':'Barcode/status';let d=doc(title);let y=addLines(d,[`Gebruiker: ${data.user||'-'}`,`Locatie: ${data.location||'-'}`,`Klant/leverancier: ${data.client||'-'}`,`Totaal stuks: ${data.total||0}`,`Aantal foto's: ${data.photoCount||data.rows.reduce((a,b)=>a+(b.photos?.length||0),0)}`]);y=addLines(d,['','Regels:'],y);for(const [i,r] of data.rows.entries()){y=addLines(d,[`Regel ${i+1}`,`Artikel: ${r.article||'-'}`,`Aantal: ${r.qty||0}`,`Locatie: ${r.location||'-'}`,`${soort}: ${r.kind||'-'}`,`Opmerking: ${r.remarks||'-'}`,`Foto's: ${(r.photos||[]).length}`],y);y=await addImgs(d,r.photos,y);y+=2}d.save(`AWC-${t}-${Date.now()}.pdf`)}
async function pdfRows(t){pdfRowsData(t,currentRowsData(t))}
function pdfAny(t,id){const x=hist(t).find(o=>o.id===id);if(t==='pallets')pdfPallet(x);if(t==='personnel')pdfPersonnel(x);if(t==='warehouse')pdfWarehouse(x);if(t==='orders')pdfOrder(x);if(t==='machines')pdfMachine(x);if(t==='incidents')pdfIncident(x);if(t==='damage'||t==='manco')pdfRowsData(t,x)}
function excelValue(v){return v===undefined||v===null?'':v}
function excelFlatten(t,data){const rows=[];if(t==='orders'){data.forEach(o=>{(o.rows||[]).forEach((r,ri)=>{if((r.packages||[]).length){(r.packages||[]).forEach(pkg=>{if((pkg.articles||[]).length){pkg.articles.forEach(a=>rows.push({Datum:o.timestamp,Type:o.type,Gebruiker:o.user,Locatie:o.location,Order:o.order,Klant:o.client,Regel:ri+1,Artikelregel:r.article,RegelAantal:r.qty,Colli:r.colli,Pallets:r.pallets,Soort:pkg.type,Nummer:pkg.index,NettoGewichtKg:pkg.weight,LengteCm:pkg.length,BreedteCm:pkg.width,HoogteCm:pkg.height,VolumeM3:pkg.volume_m3,Artikelnummer:a.article,ArtikelAantal:a.qty,Opmerking:r.remarks}))}else rows.push({Datum:o.timestamp,Type:o.type,Gebruiker:o.user,Locatie:o.location,Order:o.order,Klant:o.client,Regel:ri+1,Artikelregel:r.article,RegelAantal:r.qty,Colli:r.colli,Pallets:r.pallets,Soort:pkg.type,Nummer:pkg.index,NettoGewichtKg:pkg.weight,LengteCm:pkg.length,BreedteCm:pkg.width,HoogteCm:pkg.height,VolumeM3:pkg.volume_m3,Opmerking:r.remarks})})}else rows.push({Datum:o.timestamp,Type:o.type,Gebruiker:o.user,Locatie:o.location,Order:o.order,Klant:o.client,Regel:ri+1,Artikelregel:r.article,RegelAantal:r.qty,Colli:r.colli,Pallets:r.pallets,NettoGewichtKg:r.weight,VolumeM3:r.volume_m3,Opmerking:r.remarks})})});return rows}if(t==='damage'||t==='manco'){const soort=t==='damage'?'Schadetype':'BarcodeStatus';data.forEach(o=>{const base=o.rows?o:{user:val((t==='damage'?'d':'c')+'_user'),location:val((t==='damage'?'d':'c')+'_loc'),client:val((t==='damage'?'d':'c')+'_client'),rows:data};(base.rows||[]).forEach((r,i)=>{const row={Datum:base.timestamp,Type:t,Gebruiker:base.user,Vestiging:base.location,KlantLeverancier:base.client,Regel:i+1,Artikel:r.article,Aantal:r.qty,Locatie:r.location,Opmerking:r.remarks,FotoAantal:(r.photos||[]).length};row[soort]=r.kind;rows.push(row)})});return rows}if(t==='machines'||t==='warehouse'){data.forEach(o=>{if((o.checks||[]).length){o.checks.forEach(c=>rows.push({Datum:o.timestamp,Type:o.type,Gebruiker:o.user,Locatie:o.location,Status:o.status,Onderdeel:c.item,Antwoord:c.value===true?'JA':c.value===false?'NEE':'',Kritiek:c.critical?'JA':'NEE',Toelichting:o.notes||''}))}else rows.push(o)});return rows}if(t==='personnel'){data.forEach(o=>(o.people||[]).forEach(p=>rows.push({Datum:o.timestamp,Teamleider:o.lead,Shift:o.shift,Locatie:o.location,Status:o.status,Medewerker:p.name,Aanwezigheidsstatus:p.status,Opmerking:p.note||'',AlgemeneOpmerking:o.notes||''})));return rows}return data.map(o=>{const c={...o};delete c.photos;delete c.signature;delete c.checks;delete c.rows;delete c.people;return c})}
function excelRows(t){let data=hist(t);if(!data.length&&['damage','manco'].includes(t))data=[currentRowsData(t)];if(!data.length)return alert('Geen gegevens om naar Excel te exporteren. Sla eerst een registratie op of vul regels in.');const flat=excelFlatten(t,data).map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,excelValue(v)])));if(!flat.length)return alert('Geen regels gevonden voor Excel.');const ws=XLSX.utils.json_to_sheet(flat),wb=XLSX.utils.book_new();ws['!cols']=Object.keys(flat[0]).map(k=>({wch:Math.min(Math.max(k.length+4,14),32)}));XLSX.utils.book_append_sheet(wb,ws,t.substring(0,31));XLSX.writeFile(wb,`AWC-${t}-${new Date().toISOString().slice(0,10)}.xlsx`)}
function exportAllExcel(){const wb=XLSX.utils.book_new();let added=0;['pallets','personnel','warehouse','orders','machines','incidents','damage','manco'].forEach(t=>{const data=hist(t);if(data.length){const flat=excelFlatten(t,data);if(flat.length){const ws=XLSX.utils.json_to_sheet(flat);ws['!cols']=Object.keys(flat[0]).map(k=>({wch:Math.min(Math.max(k.length+4,14),32)}));XLSX.utils.book_append_sheet(wb,ws,t.substring(0,31));added++}}});if(!added)return alert('Er is nog geen historie om te exporteren.');XLSX.writeFile(wb,`AWC-alles-${new Date().toISOString().slice(0,10)}.xlsx`)}


/* V24 Full NL/EN language layer - language is saved per user and can be switched anytime */
const I18N={
  nl:{
    langName:'Nederlands', yes:'JA', no:'NEE', none:'-', photo:'Foto', photos:'Foto’s', line:'Regel', lines:'Regels', total:'Totaal', totals:'TOTALEN', orderLines:'ORDERREGELS', note:'Opmerking', generalNote:'Opmerking algemeen', user:'Gebruiker', location:'Locatie', recipient:'Ontvanger', save:'Opslaan', mail:'Mail', excel:'Excel', history:'Historie', pdf:'PDF', installMsg:'Installeren werkt alleen via HTTPS, bijvoorbeeld GitHub Pages, en wanneer de browser de app als PWA accepteert. Android/Chrome: open de site en kies menu ⋮ > App installeren of Toevoegen aan startscherm. iPhone/Safari: Deel-knop > Zet op beginscherm. Niet via een lokaal bestand openen.',
    'Dashboard':'Dashboard','Professional workplace registration with PDF, history and status logic.':'Professionele warehouse registratie met dashboard, PDF, Excel, historie en statuslogica.','Recente registraties':'Recente registraties','Locatie overzicht':'Locatie overzicht','Data beheer':'Data beheer','Alles naar Excel':'Alles naar Excel','Backup JSON':'Backup JSON','Backup importeren':'Backup importeren','Alles wissen':'Alles wissen','Pallettelling':'Pallettelling','Gebruiker':'Gebruiker','Ontvanger':'Ontvanger','Foto\'s':'Foto\'s','Opslaan':'Opslaan','Machine checklist':'Machine checklist','Buitenterrein':'Buitenterrein','Machine':'Machine','Machinenummer':'Machinenummer','Serienummer':'Serienummer','Live keuringsstatus':'Live keuringsstatus','Controlepunten':'Controlepunten','Toelichting / reparatieverzoek':'Toelichting / reparatieverzoek','Handtekening':'Handtekening','Handtekening wissen':'Handtekening wissen','Personeel check':'Personeel check','Teamleider':'Teamleider','Shift':'Shift','Dag':'Dag','Avond':'Avond','Nacht':'Nacht','Weekend':'Weekend','Live personeelsstatus':'Live personeelsstatus','Telling':'Telling','Rooster uploaden vanaf foto/screenshot':'Rooster uploaden vanaf foto/screenshot','📸 Scan roosterfoto':'📸 Scan roosterfoto','✔ Namen overnemen':'✔ Namen overnemen','Scan wissen':'Scan wissen','Medewerker toevoegen':'Medewerker toevoegen','+ Toevoegen':'+ Toevoegen','Iedereen aanwezig':'Iedereen aanwezig','Status resetten':'Status resetten','Alle namen wissen':'Alle namen wissen','Namenlijst':'Namenlijst','Algemene opmerking':'Algemene opmerking','Warehouse ruimte check':'Warehouse ruimte check','Controleur':'Controleur','Kies ruimte':'Kies ruimte','Naam overige ruimte':'Naam overige ruimte','Live ruimtestatus':'Live ruimtestatus','Toelichting / actiepunt':'Toelichting / actiepunt','Incident / bijna ongeval':'Incident / bijna ongeval','Melder':'Melder','Datum/tijd':'Datum/tijd','Wat is er gebeurd?':'Wat is er gebeurd?','Oorzaak':'Oorzaak','Letsel/schade?':'Letsel/schade?','Nee':'Nee','Ja':'Ja','Direct gevaar?':'Direct gevaar?','Actie en preventie':'Actie en preventie','Schade registratie':'Schade registratie','Vestiging':'Vestiging','Klant / leverancier':'Klant / leverancier','+ Schaderegel':'+ Schaderegel','Manco registratie':'Manco registratie','+ Mancoregel':'+ Mancoregel','Order wegen / ordermeting':'Order wegen / ordermeting','Ordernummer':'Ordernummer','Orderregels':'Orderregels','+ Artikelregel toevoegen':'+ Artikelregel toevoegen','Gebruiksaanwijzing':'Gebruiksaanwijzing','Nederlands':'Nederlands','English':'English','Geen gegevens om naar Excel te exporteren. Sla eerst een registratie op of vul regels in.':'Geen gegevens om naar Excel te exporteren. Sla eerst een registratie op of vul regels in.','Geen regels gevonden voor Excel.':'Geen regels gevonden voor Excel.','Er is nog geen historie om te exporteren.':'Er is nog geen historie om te exporteren.','Alles wissen?':'Alles wissen?','Nog geen registraties.':'Nog geen registraties.','Nog geen historie.':'Nog geen historie.',
    'Artikel':'Artikel','Aantal':'Aantal','Schadetype':'Schadetype','Barcode/status':'Barcode/status','Verwijder':'Verwijder','Artikelregel':'Artikelregel','Colli':'Colli','Pallet':'Pallet','Pallets':'Pallets','Netto gewicht':'Netto gewicht','Lengte':'Lengte','Breedte':'Breedte','Hoogte':'Hoogte','Volume':'Volume','Artikelen':'Artikelen','Artikelnummer':'Artikelnummer','ArtikelAantal':'ArtikelAantal','Aantal foto\'s':'Aantal foto\'s','Geen regels ingevuld':'Geen regels ingevuld','Let op: de mail bevat de tekstgegevens. Voeg de PDF/foto’s handmatig toe als bijlage wanneer nodig.':'Let op: de mail bevat de tekstgegevens. Voeg de PDF/foto’s handmatig toe als bijlage wanneer nodig.',
    statusApproved:'GOEDGEKEURD', statusAttention:'AANDACHT NODIG', statusRejected:'AFGEKEURD', statusIncomplete:'NOG NIET COMPLEET', present:'Aanwezig', leave:'Verlof', sick:'Ziek', late:'Te laat', absent:'Afwezig', notScheduled:'Niet ingeroosterd', staff:'Personeel', shortage:'Manco', damage:'Schade'
  },
  en:{
    langName:'English', yes:'YES', no:'NO', none:'-', photo:'Photo', photos:'Photos', line:'Line', lines:'Lines', total:'Total', totals:'TOTALS', orderLines:'ORDER LINES', note:'Note', generalNote:'General note', user:'User', location:'Location', recipient:'Recipient', save:'Save', mail:'Email', excel:'Excel', history:'History', pdf:'PDF', installMsg:'Installation only works via HTTPS, for example GitHub Pages, and when the browser accepts the app as a PWA. Android/Chrome: open the site and choose menu ⋮ > Install app or Add to home screen. iPhone/Safari: Share button > Add to Home Screen. Do not open it as a local file.',
    'Dashboard':'Dashboard','Professionele warehouse registratie met dashboard, PDF, Excel, historie en statuslogica.':'Professional workplace registration with PDF, history and status logic.','Versie 1.0 • Definitieve basisversie':'Version 1.0 • Stable release','Recente registraties':'Recent registrations','Locatie overzicht':'Location overview','Locatie':'Location','Pallets':'Pallets','Machines':'Machines','Incidenten':'Incidents','Schade':'Damage','Manco':'Shortage','Data beheer':'Data management','Alles naar Excel':'Export all to Excel','Backup JSON':'Backup JSON','Backup importeren':'Import backup','Alles wissen':'Clear all','Pallettelling':'Pallet count','Gebruiker':'User','Conakryweg':'Conakryweg','Slego':'Slego','Ontvanger':'Recipient','Euro':'Euro','Blok':'Block','2 meter':'2 meter','DPB':'DPB','Foto\'s':'Photos','Opslaan':'Save','PDF':'PDF','Mail':'Email','Excel':'Excel','Historie':'History','Machine checklist':'Machine checklist','Buitenterrein':'Outdoor area','Machine':'Machine','Reachtruck':'Reach truck','EPT / pompwagen':'EPT / pallet truck','Heftruck':'Forklift','Stapelaar':'Stacker','Machinenummer':'Machine number','Serienummer':'Serial number','Live keuringsstatus':'Live inspection status','Vul alle punten in. Kritieke fouten keuren de machine automatisch af.':'Complete all items. Critical faults automatically reject the machine.','PRO-regels':'PRO rules','Bij elke NEE zijn toelichting en foto verplicht. Remmen, stuurinrichting, hefmast/vorken, hydrauliek, noodstop en buitenterreinveiligheid zijn kritisch.':'For every NO, an explanation and photo are required. Brakes, steering, mast/forks, hydraulics, emergency stop and outdoor-area safety are critical.','Controlepunten':'Checkpoints','Toelichting / reparatieverzoek':'Explanation / repair request','Handtekening':'Signature','Handtekening wissen':'Clear signature','Personeel check':'Staff check','Teamleider':'Team leader','Shift':'Shift','Dag':'Day','Avond':'Evening','Nacht':'Night','Weekend':'Weekend','Live personeelsstatus':'Live staff status','Voeg medewerkers toe en vink aanwezigheid af.':'Add employees and set their attendance status.','Telling':'Count','Rooster uploaden vanaf foto/screenshot':'Upload schedule from photo/screenshot','📸 Scan roosterfoto':'📸 Scan schedule photo','✔ Namen overnemen':'✔ Apply names','Scan wissen':'Clear scan','Upload een duidelijke foto of screenshot van het rooster. De app probeert namen automatisch te herkennen.':'Upload a clear photo or screenshot of the schedule. The app will try to recognise names automatically.','Medewerker toevoegen':'Add employee','+ Toevoegen':'+ Add','Iedereen aanwezig':'Everyone present','Status resetten':'Reset status','Alle namen wissen':'Clear all names','Namenlijst':'Name list','Algemene opmerking':'General note','Warehouse ruimte check':'Warehouse area check','Controleur':'Inspector','Kies ruimte':'Choose area','Naam overige ruimte':'Name other area','Live ruimtestatus':'Live area status','Kies een ruimte en vul alle punten in.':'Choose an area and complete all items.','Bij NEE zijn foto en toelichting verplicht. Kritieke veiligheidsfouten geven automatisch afgekeurd.':'For NO answers, a photo and explanation are required. Critical safety faults automatically result in rejected status.','Toelichting / actiepunt':'Explanation / action point','Incident / bijna ongeval':'Incident / near miss','Melder':'Reporter','Datum/tijd':'Date/time','Wat is er gebeurd?':'What happened?','Oorzaak':'Cause','Letsel/schade?':'Injury/damage?','Nee':'No','Ja':'Yes','Direct gevaar?':'Immediate danger?','Actie en preventie':'Action and prevention','Schade registratie':'Damage registration','Vestiging':'Site','Klant / leverancier':'Customer / supplier','+ Schaderegel':'+ Damage line','Manco registratie':'Shortage registration','+ Mancoregel':'+ Shortage line','Order wegen / ordermeting':'Order weighing / measuring','Ordernummer':'Order number','Orderregels':'Order lines','+ Artikelregel toevoegen':'+ Add item line','Gebruiksaanwijzing':'User guide','Nederlands':'Dutch','English':'English','Geen gegevens om naar Excel te exporteren. Sla eerst een registratie op of vul regels in.':'No data to export to Excel. Save a registration first or enter lines.','Geen regels gevonden voor Excel.':'No lines found for Excel.','Er is nog geen historie om te exporteren.':'There is no history to export yet.','Alles wissen?':'Clear everything?','Nog geen registraties.':'No registrations yet.','Nog geen historie.':'No history yet.',
    'Artikel':'Item','Aantal':'Quantity','Schadetype':'Damage type','Barcode/status':'Barcode/status','Opmerking':'Note','Foto':'Photo','Verwijder':'Remove','Artikelregel':'Item line','Colli':'Packages','Pallet':'Pallet','Netto gewicht':'Net weight','Lengte':'Length','Breedte':'Width','Hoogte':'Height','Volume':'Volume','Artikelen':'Items','Artikelnummer':'Item number','ArtikelAantal':'Item quantity','Aantal foto\'s':'Photo count','Geen regels ingevuld':'No lines entered','Let op: de mail bevat de tekstgegevens. Voeg de PDF/foto’s handmatig toe als bijlage wanneer nodig.':'Note: the email contains the text data. Add the PDF/photos manually as attachments when needed.',
    statusApproved:'APPROVED', statusAttention:'ATTENTION NEEDED', statusRejected:'REJECTED', statusIncomplete:'NOT COMPLETE YET', present:'Present', leave:'Leave', sick:'Sick', late:'Late', absent:'Absent', notScheduled:'Not scheduled', staff:'Staff', shortage:'Shortage', damage:'Damage'
  }
};
function tr(k){return (I18N[lang]&&I18N[lang][k])||I18N.nl[k]||k}
function translateStatus(s){const m={GOEDGEKEURD:'statusApproved','AANDACHT NODIG':'statusAttention',AFGEKEURD:'statusRejected','NOG NIET COMPLEET':'statusIncomplete',aanwezig:'present',verlof:'leave',ziek:'sick','te laat':'late',afwezig:'absent','niet ingeroosterd':'notScheduled'};return tr(m[s]||s)}
function translateDOM(){
  document.documentElement.lang=lang; qs('mlang').textContent=lang==='nl'?'EN':'NL';
  document.querySelectorAll('.manual-nl').forEach(e=>e.classList.toggle('hide',lang!=='nl'));
  document.querySelectorAll('.manual-en').forEach(e=>e.classList.toggle('hide',lang!=='en'));
  const tags='h1,h2,h3,p,label,button,th,small,option,b,span,td,div.muted';
  document.querySelectorAll(tags).forEach(el=>{
    if(el.closest('.manual-nl,.manual-en')) return;
    if(el.tagName==='OPTION' && el.parentElement && el.parentElement.id && el.parentElement.id.endsWith('_mail')) return;
    if(['INPUT','TEXTAREA','SELECT'].includes(el.tagName)) return;
    const raw=(el.dataset.nlText||el.textContent||'').trim(); if(!raw) return;
    if(!el.dataset.nlText) el.dataset.nlText=raw;
    const base=el.dataset.nlText;
    const translated=tr(base);
    if(translated!==base || lang==='en') el.textContent=translated;
    else if(lang==='nl') el.textContent=base;
  });
  document.querySelectorAll('input,textarea').forEach(el=>{ if(el.placeholder){ if(!el.dataset.nlPh) el.dataset.nlPh=el.placeholder; el.placeholder=tr(el.dataset.nlPh); }});
}
applyI18n=translateDOM;
const oldSetLang=setLang; setLang=function(l){lang=l;localStorage.setItem(KEY+'lang',l);initNavLabels();show(document.querySelector('.tab.active')?.id||'dashboard');translateDOM();renderAll();};

function yn(v){return v===true?tr('yes'):v===false?tr('no'):tr('none')}
function doc(title){const {jsPDF}=window.jspdf;const d=new jsPDF('p','mm','a4');d.setFillColor(17,17,17);d.rect(0,0,210,28,'F');d.setTextColor(255,122,0);d.setFontSize(18);d.text('AWC Warehouse Tool',12,18);d.setTextColor(255);d.setFontSize(10);d.text('Amsterdam Warehouse Company • Conakryweg / Slego',118,12);d.text(new Date().toLocaleString(lang==='en'?'en-GB':'nl-NL'),118,18);d.setTextColor(17);d.setFontSize(16);d.text(title,12,42);return d}
function updateMachineStatus(){const r=machineResult(),el=qs('m_status');el.textContent=translateStatus(r.status);el.className='pill '+(r.status==='GOEDGEKEURD'?'approved':r.status==='AFGEKEURD'?'rejected':'warning');qs('m_advice').textContent=r.crit.length?(lang==='en'?'Do not use the machine. Critical fault reported.':'Machine niet gebruiken. Kritieke fout gemeld.'):r.bad.length?(lang==='en'?'Explanation and photo required for a NO answer.':'Toelichting en foto verplicht bij fout.'):(lang==='en'?'Everything looks OK once all items are completed.':'Alles lijkt in orde zodra alle punten zijn ingevuld.')}
function personStatusLabel(v){const icons={aanwezig:'✅ ',verlof:'🌴 ',ziek:'🤒 ','te laat':'⏱ ',afwezig:'❌ ','niet ingeroosterd':'📅 '};return (icons[v]||'')+translateStatus(v)}
function packageText(p){const label=p.type==='colli'?tr('Colli'):tr('Pallet');const arts=(p.articles||[]).map(a=>`      ${tr('Artikelnummer')}: ${a.article||'-'}\n      ${tr('Aantal')}: ${a.qty}`).join('\n');return `${label} ${p.index}\n  ${tr('Netto gewicht')}: ${p.weight} kg\n  ${tr('Lengte')}: ${p.length} cm\n  ${tr('Breedte')}: ${p.width} cm\n  ${tr('Hoogte')}: ${p.height} cm\n  ${tr('Volume')}: ${p.volume_m3} m³${arts?'\n  '+tr('Artikelen')+':\n'+arts:''}`}
function textPallet(p){return `📦 AWC ${tr('Pallettelling')}\n${tr('Gebruiker')}: ${p.user}\n${tr('Locatie')}: ${p.location}\nEuro: ${p.euro}\n${tr('Blok')}: ${p.blok}\n2 meter: ${p.two}\nDPB: ${p.dpb}\n${tr('Totaal')}: ${p.total}`}
function textMachine(m){return `🛠 AWC ${tr('Machine checklist')}\n${tr('Status')||'Status'}: ${translateStatus(m.status)}\n${tr('Gebruiker')}: ${m.user}\n${tr('Machine')}: ${m.machine} ${m.nr}\n${tr('Locatie')}: ${m.location}\n\n${m.checks.map(c=>`${c.value===true?'✅':c.value===false?'❌':'⬜'} ${c.item}`).join('\n')}\n\n${tr('Toelichting / actiepunt')}: ${m.notes||'-'}`}
function textPersonnel(p){return `👥 AWC ${tr('Personeel check')}\n${tr('Teamleider')}: ${p.lead}\n${tr('Shift')}: ${p.shift}\n${tr('Locatie')}: ${p.location}\n${tr('Status')||'Status'}: ${translateStatus(p.status)}\n${tr('Aanwezig')||'Aanwezig'}: ${p.counts.present}\n${tr('Verlof')||'Verlof'}: ${p.counts.leave||0}\n${tr('Ziek')||'Ziek'}: ${p.counts.sick||0}\n${tr('Te laat')||'Te laat'}: ${p.counts.late}\n${tr('Afwezig')||'Afwezig'}: ${p.counts.absent}\n\n${(p.people||[]).map(x=>`${x.name} - ${personStatusLabel(x.status)}${x.note?' - '+x.note:''}`).join('\n')}\n\n${tr('Algemene opmerking')}: ${p.notes||'-'}`}
function textWarehouse(w){return `🏭 AWC ${tr('Warehouse ruimte check')}\n${tr('Status')||'Status'}: ${translateStatus(w.status)}\n${tr('Controleur')}: ${w.user}\n${tr('Locatie')}: ${w.location}\n${tr('Kies ruimte')}: ${w.room}\n\n${w.checks.map(c=>`${c.value===true?'✅':c.value===false?'❌':'⬜'} ${c.item}`).join('\n')}\n\n${tr('Toelichting / actiepunt')}: ${w.notes||'-'}`}
function textOrder(o){return `⚖️ AWC ${tr('Order wegen / ordermeting')}\n\n${tr('Gebruiker')}: ${o.user}\n${tr('Locatie')}: ${o.location}\n${tr('Ordernummer')}: ${o.order}\n${tr('Klant / leverancier')}: ${o.client||'-'}\n\n${tr('totals')}\n${tr('Regels')}: ${o.totals.lines}\n${tr('Aantal')}: ${o.totals.qty}\n${tr('Colli')}: ${o.totals.colli}\n${tr('Pallets')}: ${o.totals.pallets}\n${tr('Netto gewicht')}: ${o.totals.weight} kg\n${tr('Volume')}: ${o.totals.volume} m³\n\n${tr('orderLines')}\n${o.rows.map((r,i)=>`${tr('Regel')} ${i+1}\n${tr('Artikelregel')}: ${r.article||'-'}\n${tr('Aantal')}: ${r.qty}\n${tr('Colli')}: ${r.colli}\n${tr('Pallets')}: ${r.pallets}\n${tr('Netto gewicht')}: ${r.weight} kg\n${tr('Volume')}: ${r.volume_m3} m³\n${tr('Opmerking')}: ${r.remarks||'-'}\n${(r.packages||[]).map(packageText).join('\n\n')}`).join('\n\n')}\n\n${tr('generalNote')}: ${o.notes||'-'}`}
function textRows(t,data=currentRowsData(t)){const title=t==='damage'?`💥 AWC ${tr('Schade registratie')}`:`📉 AWC ${tr('Manco registratie')}`;const soort=t==='damage'?tr('Schadetype'):tr('Barcode/status');const regels=data.rows.length?data.rows.map((r,i)=>`${tr('Regel')} ${i+1}\n${tr('Artikel')}: ${r.article||'-'}\n${tr('Aantal')}: ${r.qty||0}\n${tr('Locatie')}: ${r.location||'-'}\n${soort}: ${r.kind||'-'}\n${tr('Opmerking')}: ${r.remarks||'-'}\n${tr('Foto\'s')}: ${(r.photos||[]).length}`).join('\n\n'):tr('Geen regels ingevuld');return `${title}\n\n${tr('Gebruiker')}: ${data.user||'-'}\n${tr('Vestiging')}: ${data.location||'-'}\n${tr('Klant / leverancier')}: ${data.client||'-'}\n${tr('Totaal stuks')||'Totaal stuks'}: ${data.total||0}\n${tr('Aantal foto\'s')}: ${data.photoCount||0}\n\n${tr('Regels').toUpperCase()}\n${regels}\n\n${tr('Let op: de mail bevat de tekstgegevens. Voeg de PDF/foto’s handmatig toe als bijlage wanneer nodig.')}`}
async function pdfPallet(p){let d=doc(tr('Pallettelling'));let y=addLines(d,[`${tr('Gebruiker')}: ${p.user}`,`${tr('Locatie')}: ${p.location}`,`Euro: ${p.euro}`,`${tr('Blok')}: ${p.blok}`,`2 meter: ${p.two}`,`DPB: ${p.dpb}`,`${tr('Totaal')}: ${p.total}`]);y=await addImgs(d,p.photos,y);d.save(`AWC-pallettelling-${Date.now()}.pdf`)}
async function pdfMachine(m){let d=doc(`${tr('Machine checklist')} - ${translateStatus(m.status)}`);let y=addLines(d,[`${tr('Gebruiker')}: ${m.user}`,`${tr('Locatie')}: ${m.location}`,`${tr('Machine')}: ${m.machine}`,`${tr('Machinenummer')}: ${m.nr}`,`${tr('Serienummer')}: ${m.serial}`,`Status: ${translateStatus(m.status)}`,`${tr('Toelichting / actiepunt')}: ${m.notes||'-'}`]);m.checks.forEach(c=>{y=addLines(d,[`${yn(c.value)} - ${c.item}${c.critical?' (CRITICAL/KRITIEK)':''}`],y)});y=await addImgs(d,m.photos,y);try{d.addImage(m.signature,'PNG',120,230,60,25)}catch(e){}d.save(`AWC-machinecheck-${m.nr||Date.now()}.pdf`)}
async function pdfPersonnel(p){let d=doc(`${tr('Personeel check')} - ${translateStatus(p.status)}`);let y=addLines(d,[`${tr('Teamleider')}: ${p.lead}`,`${tr('Shift')}: ${p.shift}`,`${tr('Locatie')}: ${p.location}`,`Status: ${translateStatus(p.status)}`,`${tr('Aanwezig')||'Aanwezig'}: ${p.counts.present}`,`${tr('Verlof')||'Verlof'}: ${p.counts.leave||0}`,`${tr('Ziek')||'Ziek'}: ${p.counts.sick||0}`,`${tr('Te laat')||'Te laat'}: ${p.counts.late}`,`${tr('Afwezig')||'Afwezig'}: ${p.counts.absent}`,`${tr('Niet ingeroosterd')||'Niet ingeroosterd'}: ${p.counts.notScheduled||0}`,`${tr('Opmerking')}: ${p.notes||'-'}`]);y=addLines(d,['',tr('Namenlijst')+':'],y);p.people.forEach(x=>{y=addLines(d,[`${x.name} - ${personStatusLabel(x.status)}${x.note?' - '+x.note:''}`],y)});d.save(`AWC-personeel-${Date.now()}.pdf`)}
async function pdfOrder(o){let d=doc(`${tr('Order wegen / ordermeting')} - ${o.order||''}`);let y=addLines(d,[`${tr('Gebruiker')}: ${o.user}`,`${tr('Locatie')}: ${o.location}`,`${tr('Ordernummer')}: ${o.order}`,`${tr('Klant / leverancier')}: ${o.client||'-'}`,'',`${tr('Regels')}: ${o.totals.lines}`,`${tr('Aantal')}: ${o.totals.qty}`,`${tr('Colli')}: ${o.totals.colli}`,`${tr('Pallets')}: ${o.totals.pallets}`,`${tr('Netto gewicht')}: ${o.totals.weight} kg`,`${tr('Volume')}: ${o.totals.volume} m3`,`${tr('Opmerking')}: ${o.notes||'-'}`]);y=addLines(d,['',tr('Orderregels')+':'],y);o.rows.forEach((r,i)=>{y=addLines(d,[`${tr('Regel')} ${i+1}`,`${tr('Artikelregel')}: ${r.article||'-'}`,`${tr('Aantal')}: ${r.qty}`,`${tr('Colli')}: ${r.colli}`,`${tr('Pallets')}: ${r.pallets}`,`${tr('Netto gewicht')}: ${r.weight} kg`,`${tr('Volume')}: ${r.volume_m3} m3`,`${tr('Opmerking')}: ${r.remarks||'-'}`],y);(r.packages||[]).forEach(p=>{y=addLines(d,packageText(p).split('\n'),y);y+=2});y+=3});d.save(`AWC-orderweging-${o.order||Date.now()}.pdf`)}
async function pdfWarehouse(w){let d=doc(`${tr('Warehouse ruimte check')} - ${translateStatus(w.status)}`);let y=addLines(d,[`${tr('Controleur')}: ${w.user}`,`${tr('Locatie')}: ${w.location}`,`${tr('Kies ruimte')}: ${w.room}`,`Status: ${translateStatus(w.status)}`,`${tr('Toelichting / actiepunt')}: ${w.notes||'-'}`]);w.checks.forEach(c=>{y=addLines(d,[`${yn(c.value)} - ${c.item}${c.critical?' (CRITICAL/KRITIEK)':''}`],y)});y=await addImgs(d,w.photos,y);d.save(`AWC-warehouse-${w.room||Date.now()}.pdf`)}
async function pdfIncident(i){let d=doc(lang==='en'?'Incident report':'Incidentrapport');let y=addLines(d,[`${tr('Melder')}: ${i.user}`,`${tr('Locatie')}: ${i.location}`,`${tr('Datum/tijd')}: ${i.time}`,`${tr('Letsel/schade?')}: ${i.injury}`,`${tr('Direct gevaar?')}: ${i.danger}`,`${tr('Wat is er gebeurd?')}: ${i.what}`,`${tr('Oorzaak')}: ${i.cause}`,`${tr('Actie en preventie')}: ${i.action}`]);y=await addImgs(d,i.photos,y);d.save(`AWC-incident-${Date.now()}.pdf`)}
async function pdfRowsData(t,data){const title=t==='damage'?tr('Schade registratie'):tr('Manco registratie');const soort=t==='damage'?tr('Schadetype'):tr('Barcode/status');let d=doc(title);let y=addLines(d,[`${tr('Gebruiker')}: ${data.user||'-'}`,`${tr('Locatie')}: ${data.location||'-'}`,`${tr('Klant / leverancier')}: ${data.client||'-'}`,`${tr('Totaal')}: ${data.total||0}`,`${tr('Aantal foto\'s')}: ${data.photoCount||data.rows.reduce((a,b)=>a+(b.photos?.length||0),0)}`]);y=addLines(d,['',tr('Regels')+':'],y);for(const [i,r] of data.rows.entries()){y=addLines(d,[`${tr('Regel')} ${i+1}`,`${tr('Artikel')}: ${r.article||'-'}`,`${tr('Aantal')}: ${r.qty||0}`,`${tr('Locatie')}: ${r.location||'-'}`,`${soort}: ${r.kind||'-'}`,`${tr('Opmerking')}: ${r.remarks||'-'}`,`${tr('Foto\'s')}: ${(r.photos||[]).length}`],y);y=await addImgs(d,r.photos,y);y+=2}d.save(`AWC-${t}-${Date.now()}.pdf`)}
function localizeKeys(obj){const map={Datum:lang==='en'?'Date':'Datum',Type:'Type',Gebruiker:tr('Gebruiker'),Locatie:tr('Locatie'),Order:tr('Ordernummer'),Klant:tr('Klant / leverancier'),Regel:tr('Regel'),Artikelregel:tr('Artikelregel'),RegelAantal:lang==='en'?'Line quantity':'RegelAantal',Colli:tr('Colli'),Pallets:tr('Pallets'),Soort:lang==='en'?'Type':'Soort',Nummer:lang==='en'?'Number':'Nummer',NettoGewichtKg:lang==='en'?'NetWeightKg':'NettoGewichtKg',LengteCm:lang==='en'?'LengthCm':'LengteCm',BreedteCm:lang==='en'?'WidthCm':'BreedteCm',HoogteCm:lang==='en'?'HeightCm':'HoogteCm',VolumeM3:'VolumeM3',Artikelnummer:tr('Artikelnummer'),ArtikelAantal:lang==='en'?'ItemQuantity':'ArtikelAantal',Opmerking:tr('Opmerking'),Vestiging:tr('Vestiging'),KlantLeverancier:tr('Klant / leverancier'),Artikel:tr('Artikel'),Aantal:tr('Aantal'),FotoAantal:lang==='en'?'PhotoCount':'FotoAantal',Schadetype:tr('Schadetype'),BarcodeStatus:tr('Barcode/status'),Teamleider:tr('Teamleider'),Medewerker:lang==='en'?'Employee':'Medewerker',Aanwezigheidsstatus:lang==='en'?'AttendanceStatus':'Aanwezigheidsstatus',AlgemeneOpmerking:tr('Algemene opmerking'),Status:'Status',Onderdeel:lang==='en'?'Checkpoint':'Onderdeel',Antwoord:lang==='en'?'Answer':'Antwoord',Kritiek:lang==='en'?'Critical':'Kritiek',Toelichting:lang==='en'?'Explanation':'Toelichting'};return Object.fromEntries(Object.entries(obj).map(([k,v])=>[map[k]||k,v]));}
function excelRows(t){let data=hist(t);if(!data.length&&['damage','manco'].includes(t))data=[currentRowsData(t)];if(!data.length)return alert(tr('Geen gegevens om naar Excel te exporteren. Sla eerst een registratie op of vul regels in.'));const flat=excelFlatten(t,data).map(r=>localizeKeys(Object.fromEntries(Object.entries(r).map(([k,v])=>[k,excelValue(v)]))));if(!flat.length)return alert(tr('Geen regels gevonden voor Excel.'));const ws=XLSX.utils.json_to_sheet(flat),wb=XLSX.utils.book_new();ws['!cols']=Object.keys(flat[0]).map(k=>({wch:Math.min(Math.max(k.length+4,14),32)}));XLSX.utils.book_append_sheet(wb,ws,t.substring(0,31));XLSX.writeFile(wb,`AWC-${t}-${new Date().toISOString().slice(0,10)}.xlsx`)}
function exportAllExcel(){const wb=XLSX.utils.book_new();let added=0;['pallets','personnel','warehouse','orders','machines','incidents','damage','manco'].forEach(t=>{const data=hist(t);if(data.length){const flat=excelFlatten(t,data).map(localizeKeys);if(flat.length){const ws=XLSX.utils.json_to_sheet(flat);ws['!cols']=Object.keys(flat[0]).map(k=>({wch:Math.min(Math.max(k.length+4,14),32)}));XLSX.utils.book_append_sheet(wb,ws,t.substring(0,31));added++}}});if(!added)return alert(tr('Er is nog geen historie om te exporteren.'));XLSX.writeFile(wb,`AWC-alles-${new Date().toISOString().slice(0,10)}.xlsx`)}
const oldRenderAll=renderAll; renderAll=function(){oldRenderAll();translateDOM();};


/* V24 extra dynamic translations */
Object.assign(I18N.nl,{Aanwezig:'Aanwezig',Verlof:'Verlof',Ziek:'Ziek','Te laat':'Te laat',Afwezig:'Afwezig','Niet ingeroosterd':'Niet ingeroosterd','niet ingeroosterd':'Niet ingeroosterd',Status:'Status','Totaal stuks':'Totaal stuks','Hoeveelheid artikelen':'Hoeveelheid artikelen','Aantal colli':'Aantal colli','Aantal pallets':'Aantal pallets','Opmerking artikelregel':'Opmerking artikelregel','Vul hieronder per colli/pallet het netto gewicht en de afmetingen in.':'Vul hieronder per colli/pallet het netto gewicht en de afmetingen in.','Netto gewicht kg':'Netto gewicht kg','Lengte cm':'Lengte cm','Breedte cm':'Breedte cm','Hoogte cm':'Hoogte cm','Artikelen in deze colli':'Artikelen in deze colli','Artikelen in deze pallet':'Artikelen in deze pallet','+ Artikel toevoegen aan colli':'+ Artikel toevoegen aan colli','+ Artikel toevoegen aan pallet':'+ Artikel toevoegen aan pallet','Vul eerst aantal colli of pallets in.':'Vul eerst aantal colli of pallets in.','Verwijder regel':'Verwijder regel','Verwijderen':'Verwijderen','Opmerking / reden':'Opmerking / reden','Bijv. reden, vervanger of tijd':'Bijv. reden, vervanger of tijd','Nog geen medewerkers toegevoegd.':'Nog geen medewerkers toegevoegd.','Bezetting compleet.':'Bezetting compleet.','Meerdere zieken/afwezigen: actie of vervanging nodig.':'Meerdere zieken/afwezigen: actie of vervanging nodig.','Voeg medewerkers toe aan de lijst.':'Voeg medewerkers toe aan de lijst.','Controleer verlof, ziekmeldingen, te laat, afwezigen en niet ingeroosterden.':'Controleer verlof, ziekmeldingen, te laat, afwezigen en niet ingeroosterden.','ACTIE VEREIST':'ACTIE VEREIST','GEEN TEAM':'GEEN TEAM','Personeel checks':'Personeel checks','Warehousecontroles':'Warehousecontroles','Orderwegingen':'Orderwegingen','Machinechecks':'Machinechecks','Afgekeurd/aandacht':'Afgekeurd/aandacht','Incidenten':'Incidenten','Schades':'Schades','Laatste update':'Laatste update','Totaal pallets':'Totaal pallets','Palletchecks':'Palletchecks'});
Object.assign(I18N.en,{Aanwezig:'Present',Verlof:'Leave',Ziek:'Sick','Te laat':'Late',Afwezig:'Absent','Niet ingeroosterd':'Not scheduled','niet ingeroosterd':'Not scheduled',Status:'Status','Totaal stuks':'Total pieces','Hoeveelheid artikelen':'Item quantity','Aantal colli':'Number of packages','Aantal pallets':'Number of pallets','Opmerking artikelregel':'Item-line note','Vul hieronder per colli/pallet het netto gewicht en de afmetingen in.':'Enter the net weight and dimensions for each package/pallet below.','Netto gewicht kg':'Net weight kg','Lengte cm':'Length cm','Breedte cm':'Width cm','Hoogte cm':'Height cm','Artikelen in deze colli':'Items in this package','Artikelen in deze pallet':'Items in this pallet','+ Artikel toevoegen aan colli':'+ Add item to package','+ Artikel toevoegen aan pallet':'+ Add item to pallet','Vul eerst aantal colli of pallets in.':'First enter the number of packages or pallets.','Verwijder regel':'Remove line','Verwijderen':'Remove','Opmerking / reden':'Note / reason','Bijv. reden, vervanger of tijd':'E.g. reason, replacement or time','Nog geen medewerkers toegevoegd.':'No employees added yet.','Bezetting compleet.':'Staffing complete.','Meerdere zieken/afwezigen: actie of vervanging nodig.':'Multiple sick/absent employees: action or replacement needed.','Voeg medewerkers toe aan de lijst.':'Add employees to the list.','Controleer verlof, ziekmeldingen, te laat, afwezigen en niet ingeroosterden.':'Check leave, sick reports, late arrivals and absences.','ACTIE VEREIST':'ACTION REQUIRED','GEEN TEAM':'NO TEAM','Personeel checks':'Staff checks','Warehousecontroles':'Warehousecontroles','Orderwegingen':'Order weighings','Machinechecks':'Machine checks','Afgekeurd/aandacht':'Rejected/attention','Schades':'Damage reports','Laatste update':'Last update','Totaal pallets':'Total pallets','Palletchecks':'Pallet checks'});
const __oldAddRow=addRow; addRow=function(p){__oldAddRow(p); translateDOM();};
const __oldAddOrderRow=addOrderRow; addOrderRow=function(){__oldAddOrderRow(); translateDOM();};
const __oldSyncOrderPackages=syncOrderPackages; syncOrderPackages=function(row){__oldSyncOrderPackages(row); translateDOM();};
const __oldAddPackageArticle=addPackageArticle; addPackageArticle=function(btn){__oldAddPackageArticle(btn); translateDOM();};
const __oldRenderPersonnel=renderPersonnel; renderPersonnel=function(){__oldRenderPersonnel(); const st=personnelStatus(); const badge=qs('pers_status'); if(badge) badge.textContent=translateStatus(st); translateDOM();};

/* Versie 1.0 */
function addMailExtras(){document.querySelectorAll('select[id$="_mail"]').forEach(sel=>{sel.multiple=true;sel.size=Math.min(5,mails.length);const prefix=sel.id.replace('_mail','');if(!qs(prefix+'_cc')&&sel.parentElement){sel.parentElement.insertAdjacentHTML('afterend',`<div><label>CC</label><input id="${prefix}_cc" placeholder="CC"></div><div><label>BCC</label><input id="${prefix}_bcc" placeholder="BCC"></div>`);}})}
function mailValues(prefix){const sel=qs(prefix+'_mail');let to=sel?[...sel.selectedOptions].map(o=>o.value).filter(Boolean):[];if(!to.length&&sel?.options?.length)to=[sel.options[0].value];return{to:to.join(','),cc:val(prefix+'_cc'),bcc:val(prefix+'_bcc')}}
function openMail(prefix,subject,body){const m=mailValues(prefix),q=[];if(m.cc)q.push('cc='+encodeURIComponent(m.cc));if(m.bcc)q.push('bcc='+encodeURIComponent(m.bcc));q.push('subject='+encodeURIComponent(subject));q.push('body='+encodeURIComponent(body));location.href=`mailto:${m.to}?${q.join('&')}`}
function smartDate(){return new Date().toLocaleDateString(lang==='en'?'en-GB':'nl-NL',{day:'2-digit',month:'2-digit'}).replaceAll('/','-')}
function mailFooter(files=[]){const list=files.length?'\n\n'+(lang==='en'?'Files/photos to attach manually:':'Bestanden/foto\'s handmatig toevoegen als bijlage:')+'\n'+files.map(f=>'• '+f.name).join('\n'):'';return `\n\n---\n${lang==='en'?'Generated with':'Gemaakt met'} AWC Warehouse Tool v1.0${list}\n${lang==='en'?'Note: add the generated PDF/photos manually as attachments in your mail app.':'Let op: voeg de gegenereerde PDF/foto\'s handmatig toe als bijlage in je mailprogramma.'}`}
async function handleOrderFiles(e){orderFiles=[];photos.o=[];for(const f of e.target.files){if(f.type.startsWith('image/')){const data=await fileData(f);orderFiles.push({name:f.name,type:f.type,data,isImage:true});photos.o.push(data)}else orderFiles.push({name:f.name,type:f.type||'file',isImage:false})}qs('o_prev').innerHTML=orderFiles.map(f=>f.isImage?`<div><img src="${f.data}"><div class="mini">${f.name}</div></div>`:`<div class="item" style="padding:10px"><b>📎 ${f.name}</b><div class="mini">PDF/bestand</div></div>`).join('');updateWA()}
function businessDoc(title,meta=''){const {jsPDF}=window.jspdf,d=new jsPDF('p','mm','a4');d.setFillColor(17,17,17);d.rect(0,0,210,34,'F');d.setFillColor(255,122,0);d.roundedRect(12,8,22,18,3,3,'F');d.setTextColor(17);d.setFontSize(11);d.setFont(undefined,'bold');d.text('AWC',16,20);d.setTextColor(255);d.setFontSize(17);d.text('Amsterdam Warehouse Company',40,15);d.setFontSize(9);d.setFont(undefined,'normal');d.text('Conakryweg / Slego • Amsterdam',40,22);d.text('Warehouse Tool v1.0',40,28);d.setTextColor(255,122,0);d.setFontSize(10);d.text(new Date().toLocaleString(lang==='en'?'en-GB':'nl-NL'),150,15);d.setTextColor(17);d.setFontSize(16);d.setFont(undefined,'bold');d.text(title,12,48);if(meta){d.setFontSize(10);d.setFont(undefined,'normal');d.setTextColor(90);d.text(meta,12,55)}d.setDrawColor(255,122,0);d.setLineWidth(.6);d.line(12,60,198,60);return d}
doc=businessDoc;
function ensurePage(d,y,need=10){if(y+need>285){d.addPage();return 18}return y}
function addSection(d,title,y){y=ensurePage(d,y,14);d.setFillColor(255,247,237);d.roundedRect(12,y,186,9,2,2,'F');d.setTextColor(17);d.setFontSize(11);d.setFont(undefined,'bold');d.text(title,15,y+6);return y+14}
function addKeyValues(d,pairs,y){d.setFontSize(10);d.setFont(undefined,'normal');for(const [k,v] of pairs){const lines=d.splitTextToSize(String(v??'-'),118);y=ensurePage(d,y,7*lines.length);d.setTextColor(95);d.text(String(k),14,y);d.setTextColor(17);d.text(lines,72,y);y+=Math.max(7,lines.length*5)}return y}
addLines=function(d,lines,y=66){d.setFontSize(10);d.setFont(undefined,'normal');for(const line of lines){const split=d.splitTextToSize(String(line),180);y=ensurePage(d,y,split.length*5+2);d.text(split,14,y);y+=Math.max(7,split.length*5)}return y};
addImgs=async function(d,imgs,y){let nr=1;for(const im of imgs||[]){try{const props=d.getImageProperties(im);let maxW=150,maxH=105,w=maxW,h=(props.height*maxW)/props.width;if(h>maxH){h=maxH;w=(props.width*maxH)/props.height}y=ensurePage(d,y,h+16);d.setFontSize(9);d.setTextColor(80);d.text(`${lang==='en'?'Photo':'Foto'} ${nr++}`,14,y);y+=5;d.addImage(im,props.fileType||'JPEG',(210-w)/2,y,w,h);y+=h+10}catch(e){}}return y};
function fileListForPdf(d,files,y){const non=(files||[]).filter(f=>!f.isImage);if(!non.length)return y;y=addSection(d,lang==='en'?'Attached file names':'Bestandsnamen bijlagen',y);return addLines(d,non.map(f=>'• '+f.name),y)}
async function pdfOrder(o){let d=doc(`${tr('Order wegen / ordermeting')} - ${o.order||''}`,`${tr('Klant / leverancier')}: ${o.client||'-'}`);let y=66;y=addSection(d,lang==='en'?'General':'Algemeen',y);y=addKeyValues(d,[[tr('Gebruiker'),o.user],[tr('Locatie'),o.location],[tr('Ordernummer'),o.order],[tr('Klant / leverancier'),o.client||'-'],[tr('Opmerking'),o.notes||'-']],y);y=addSection(d,lang==='en'?'Totals':'Totalen',y);y=addKeyValues(d,[[tr('Regels'),o.totals.lines],[tr('Aantal'),o.totals.qty],[tr('Colli'),o.totals.colli],[tr('Pallets'),o.totals.pallets],[tr('Netto gewicht'),o.totals.weight+' kg'],[tr('Volume'),o.totals.volume+' m³']],y);y=addSection(d,tr('Orderregels'),y);o.rows.forEach((r,i)=>{y=addKeyValues(d,[[`${tr('Regel')} ${i+1}`,r.article||'-'],[tr('Aantal'),r.qty],[tr('Colli'),r.colli],[tr('Pallets'),r.pallets],[tr('Netto gewicht'),r.weight+' kg'],[tr('Volume'),r.volume_m3+' m³'],[tr('Opmerking'),r.remarks||'-']],y);(r.packages||[]).forEach(p=>{y=addLines(d,packageText(p).split('\n'),y);y+=2});y+=2});const _files=o.files||orderFiles; y=await addImgs(d,_files.filter(f=>f.isImage).map(f=>f.data).filter(Boolean),y); y=fileListForPdf(d,_files,y);d.save(`AWC-orderweging-${o.order||Date.now()}.pdf`)}
async function pdfRowsData(t,data){const title=t==='damage'?tr('Schade registratie'):tr('Manco registratie');const soort=t==='damage'?tr('Schadetype'):tr('Barcode/status');let d=doc(title,`${tr('Klant / leverancier')}: ${data.client||'-'}`);let y=66;y=addSection(d,lang==='en'?'General':'Algemeen',y);y=addKeyValues(d,[[tr('Gebruiker'),data.user||'-'],[tr('Locatie'),data.location||'-'],[tr('Klant / leverancier'),data.client||'-'],[tr('Totaal'),data.total||0],[tr('Aantal foto\'s'),data.photoCount||data.rows.reduce((a,b)=>a+(b.photos?.length||0),0)]],y);y=addSection(d,tr('Regels'),y);for(const [i,r] of data.rows.entries()){y=addKeyValues(d,[[`${tr('Regel')} ${i+1}`,''],[tr('Artikel'),r.article||'-'],[tr('Aantal'),r.qty||0],[tr('Locatie'),r.location||'-'],[soort,r.kind||'-'],[tr('Opmerking'),r.remarks||'-'],[tr('Foto\'s'),(r.photos||[]).length]],y);y=await addImgs(d,r.photos,y);y+=2}d.save(`AWC-${t}-${Date.now()}.pdf`)}
async function pdfRows(t){return pdfRowsData(t,currentRowsData(t))}
function currentRowsData(t){const p=t==='damage'?'d':'c',rows=getRows(t);return{type:t,user:val(p+'_user'),location:val(p+'_loc'),email:mailValues(p).to,client:val(p+'_client'),rows,total:rows.reduce((a,b)=>a+b.qty,0),photoCount:rows.reduce((a,b)=>a+(b.photos?.length||0),0)}}
function currentOrder(){const rows=orderRows();return{type:'Order wegen',user:val('o_user'),location:val('o_loc'),email:mailValues('o').to,order:val('o_order'),client:val('o_client'),notes:val('o_notes'),rows,totals:orderTotals(rows),files:orderFiles}}
function mailOrder(){const o=currentOrder();openMail('o',`${lang==='en'?'Weighing report':'Weegrapport'} – ${smartDate()} – ${o.order||tr('Ordernummer')}`,textOrder(o)+mailFooter(orderFiles))}
function mailRows(t){const data=currentRowsData(t);if(!data.user||!data.rows.length)return msg(t==='damage'?'dMsg':'cMsg',lang==='en'?'Enter user and at least one line before emailing.':'Vul gebruiker en minimaal één regel in voordat je mailt.');const prefix=t==='damage'?'d':'c',subject=t==='damage'?`${lang==='en'?'Damage report':'Schade melding'} – ${smartDate()} – ${data.client||data.location||''}`:`${lang==='en'?'Shortage report':'Manco melding'} – ${smartDate()} – ${data.client||data.location||''}`;openMail(prefix,subject,textRows(t,data)+mailFooter([]))}
function mailPallet(){const p=currentPallet();openMail('p',`AWC ${tr('Pallettelling')} – ${smartDate()} – ${p.location}`,textPallet(p)+mailFooter([]))}
function mailMachine(){const m=currentMachine();openMail('m',`AWC ${tr('Machine checklist')} – ${smartDate()} – ${m.nr||m.machine} – ${m.status}`,textMachine(m)+mailFooter([]))}
function mailWarehouse(){const w=currentWarehouse();openMail('w',`AWC ${tr('Warehouse ruimte check')} – ${smartDate()} – ${w.room} – ${w.status}`,textWarehouse(w)+mailFooter([]))}
function mailPersonnel(){const p=currentPersonnel();openMail('pers',`AWC ${tr('Personeel check')} – ${smartDate()} – ${p.location} – ${p.status}`,textPersonnel(p)+mailFooter([]))}
function mailIncident(){const i=currentIncident();openMail('i',`AWC ${lang==='en'?'Incident report':'Incidentmelding'} – ${smartDate()} – ${i.location}`,`⚠️ AWC ${lang==='en'?'Incident report':'Incidentmelding'}\n\n${tr('Melder')}: ${i.user}\n${tr('Locatie')}: ${i.location}\n${tr('Datum/tijd')}: ${i.time}\n${tr('Wat is er gebeurd?')}: ${i.what}\n${tr('Oorzaak')}: ${i.cause}\n${tr('Actie en preventie')}: ${i.action}`+mailFooter([]))}
function improveWorksheet(ws,rows){if(!rows.length)return;ws['!cols']=Object.keys(rows[0]).map(k=>({wch:Math.min(Math.max(String(k).length+6,16),38)}));ws['!autofilter']={ref:XLSX.utils.encode_range({s:{r:0,c:0},e:{r:Math.max(rows.length,1),c:Object.keys(rows[0]).length-1}})}}
function excelRows(t){let data=hist(t);if(!data.length&&['damage','manco'].includes(t))data=[currentRowsData(t)];if(!data.length&&t==='orders')data=[currentOrder()];if(!data.length)return alert(tr('Geen gegevens om naar Excel te exporteren. Sla eerst een registratie op of vul regels in.'));const flat=excelFlatten(t,data).map(r=>localizeKeys(Object.fromEntries(Object.entries(r).map(([k,v])=>[k,excelValue(v)]))));if(!flat.length)return alert(tr('Geen regels gevonden voor Excel.'));const ws=XLSX.utils.json_to_sheet(flat),wb=XLSX.utils.book_new();improveWorksheet(ws,flat);XLSX.utils.book_append_sheet(wb,ws,t.substring(0,31));XLSX.writeFile(wb,`AWC-${t}-${new Date().toISOString().slice(0,10)}.xlsx`)}
function exportAllExcel(){const wb=XLSX.utils.book_new();let added=0;['pallets','personnel','warehouse','orders','machines','incidents','damage','manco'].forEach(t=>{const data=hist(t);if(data.length){const flat=excelFlatten(t,data).map(localizeKeys);if(flat.length){const ws=XLSX.utils.json_to_sheet(flat);improveWorksheet(ws,flat);XLSX.utils.book_append_sheet(wb,ws,t.substring(0,31));added++}}});if(!added)return alert(tr('Er is nog geen historie om te exporteren.'));XLSX.writeFile(wb,`AWC-alles-${new Date().toISOString().slice(0,10)}.xlsx`)}

Object.assign(I18N.nl,{"Foto's / bestanden voor klant":"Foto's / bestanden voor klant",'Algemeen':'Algemeen','Totalen':'Totalen'});Object.assign(I18N.en,{"Foto's / bestanden voor klant":"Photos / files for customer",'Algemeen':'General','Totalen':'Totals'});


/* Versie 1.0 - laatste correcte build */
function addMailExtras(){
  document.querySelectorAll('select[id$="_mail"]').forEach(sel=>{sel.multiple=true;sel.size=Math.min(5,mails.length);});
  document.querySelectorAll('[id$="_cc"],[id$="_bcc"]').forEach(el=>el.closest('div')?.remove());
}
function mailValues(prefix){
  const sel=qs(prefix+'_mail');
  let to=sel?[...sel.selectedOptions].map(o=>o.value).filter(Boolean):[];
  if(!to.length&&sel?.options?.length)to=[sel.options[0].value];
  return{to:to.join(',')};
}
function openMail(prefix,subject,body){
  const m=mailValues(prefix);
  location.href=`mailto:${m.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function businessDoc(title,meta=''){
  const {jsPDF}=window.jspdf, d=new jsPDF('p','mm','a4');
  const now=new Date().toLocaleString(lang==='en'?'en-GB':'nl-NL');
  try{d.addImage('icon.png','PNG',12,10,20,20);}catch(e){d.setDrawColor(30);d.rect(12,10,20,20);d.setFontSize(10);d.setFont(undefined,'bold');d.text('AWC',16,23);}
  d.setTextColor(20);d.setFont(undefined,'bold');d.setFontSize(14);d.text('Amsterdam Warehouse Company',38,15);
  d.setFont(undefined,'normal');d.setFontSize(8.5);d.setTextColor(75);
  ['Slego 1a, 1046 BM Amsterdam','Conakryweg 6, 1047 HS Amsterdam','info@amsterdamwarehouse.com','+31 (0)20-3081287'].forEach((line,i)=>d.text(line,38,21+i*4.5));
  d.setFontSize(8.5);d.setTextColor(75);d.text(now,198,15,{align:'right'});
  d.setDrawColor(210);d.setLineWidth(.3);d.line(12,38,198,38);
  d.setTextColor(20);d.setFont(undefined,'bold');d.setFontSize(16);d.text(title,12,50);
  if(meta){d.setFont(undefined,'normal');d.setFontSize(9.5);d.setTextColor(80);d.text(d.splitTextToSize(meta,180),12,57);}
  d.setDrawColor(225);d.setLineWidth(.25);d.line(12,63,198,63);
  return d;
}
doc=businessDoc;
function addSection(d,title,y){y=ensurePage(d,y,12);d.setTextColor(20);d.setFont(undefined,'bold');d.setFontSize(10.5);d.text(String(title).toUpperCase(),14,y);d.setDrawColor(225);d.setLineWidth(.2);d.line(14,y+2,196,y+2);return y+8;}
function addKeyValues(d,pairs,y){d.setFontSize(9.5);d.setFont(undefined,'normal');for(const [k,v] of pairs){const lines=d.splitTextToSize(String(v??'-'),120);y=ensurePage(d,y,Math.max(7,lines.length*5));d.setTextColor(95);d.setFont(undefined,'bold');d.text(String(k),14,y);d.setTextColor(20);d.setFont(undefined,'normal');d.text(lines,72,y);y+=Math.max(7,lines.length*5);}return y;}
addImgs=async function(d,imgs,y){let nr=1;for(const im of imgs||[]){try{const props=d.getImageProperties(im);let maxW=120,maxH=90,w=maxW,h=(props.height*maxW)/props.width;if(h>maxH){h=maxH;w=(props.width*maxH)/props.height;}y=ensurePage(d,y,h+14);d.setFontSize(8.5);d.setTextColor(80);d.text(`${lang==='en'?'Photo':'Foto'} ${nr++}`,14,y);y+=4;d.setDrawColor(210);d.rect(14,y,w,h);d.addImage(im,props.fileType||'JPEG',14,y,w,h);y+=h+8;}catch(e){}}return y;};
function improveWorksheet(ws,rows){if(!rows.length)return;const cols=Object.keys(rows[0]);ws['!cols']=cols.map(k=>({wch:Math.min(Math.max(k.length+8,...rows.slice(0,50).map(r=>String(r[k]??'').length+2)),42)}));ws['!autofilter']={ref:XLSX.utils.encode_range({s:{r:0,c:0},e:{r:rows.length,c:cols.length-1}})};ws['!freeze']={xSplit:0,ySplit:1};}
function excelRows(t){let data=hist(t);if(!data.length&&['damage','manco'].includes(t))data=[currentRowsData(t)];if(!data.length&&t==='orders')data=[currentOrder()];if(!data.length)return alert(tr('Geen gegevens om naar Excel te exporteren. Sla eerst een registratie op of vul regels in.'));const flat=excelFlatten(t,data).map(r=>localizeKeys(Object.fromEntries(Object.entries(r).map(([k,v])=>[k,excelValue(v)]))));if(!flat.length)return alert(tr('Geen regels gevonden voor Excel.'));const ws=XLSX.utils.json_to_sheet(flat),wb=XLSX.utils.book_new();improveWorksheet(ws,flat);XLSX.utils.book_append_sheet(wb,ws,t.substring(0,31));XLSX.writeFile(wb,`AWC-${t}-${new Date().toISOString().slice(0,10)}.xlsx`);}
function exportAllExcel(){const wb=XLSX.utils.book_new();let added=0;['pallets','personnel','warehouse','orders','machines','incidents','damage','manco'].forEach(t=>{const data=hist(t);if(data.length){const flat=excelFlatten(t,data).map(localizeKeys);if(flat.length){const ws=XLSX.utils.json_to_sheet(flat);improveWorksheet(ws,flat);XLSX.utils.book_append_sheet(wb,ws,t.substring(0,31));added++;}}});if(!added)return alert(tr('Er is nog geen historie om te exporteren.'));XLSX.writeFile(wb,`AWC-alles-${new Date().toISOString().slice(0,10)}.xlsx`);}
const __v261init=init;init=function(){__v261init();addMailExtras();qs('o_photos')?.addEventListener('change',handleOrderFiles);translateDOM?.();};

/* Personnel output fix - only absent/not present or full list choice */
function getPersonnelReportMode(){return qs('pers_report_mode')?.value || 'absent'}
function isNotPresentStatus(status){return status !== 'aanwezig'}
function personnelGroups(p){
  const people=(p.people||[]);
  return {
    present: people.filter(x=>x.status==='aanwezig'),
    notPresent: people.filter(x=>isNotPresentStatus(x.status))
  };
}
function personnelLine(x){return `${x.name} - ${personStatusLabel(x.status)}${x.note?' - '+x.note:''}`}
function currentPersonnel(){
  return {type:'Personeel',lead:val('pers_lead'),shift:val('pers_shift'),location:val('pers_loc'),email:mailValues('pers').to,notes:val('pers_notes'),reportMode:getPersonnelReportMode(),people:persons.map(p=>({...p})),counts:personCounts(),status:personnelStatus()}
}
function textPersonnel(p){
  const g=personnelGroups(p);
  const mode=p.reportMode||getPersonnelReportMode();
  const title=lang==='en'?'AWC Staff check':'AWC Personeel check';
  const notTitle=lang==='en'?'NOT PRESENT':'AFWEZIG / NIET AANWEZIG';
  const fullTitle=lang==='en'?'FULL STAFF LIST':'VOLLEDIGE PERSONEELSLIJST';
  const noAbs=lang==='en'?'No absent/not present employees.':'Geen afwezigen/niet aanwezigen.';
  let txt=`👥 ${title}\n${tr('Teamleider')}: ${p.lead||'-'}\n${tr('Shift')}: ${p.shift||'-'}\n${tr('Locatie')}: ${p.location||'-'}\n${tr('Status')||'Status'}: ${translateStatus(p.status)}\n\n${notTitle} (${g.notPresent.length})\n`;
  txt += g.notPresent.length ? g.notPresent.map(personnelLine).join('\n') : noAbs;
  if(mode==='all'){
    txt += `\n\n${fullTitle} (${(p.people||[]).length})\n` + ((p.people||[]).length ? (p.people||[]).map(personnelLine).join('\n') : '-');
  }
  txt += `\n\n${tr('Algemene opmerking')}: ${p.notes||'-'}`;
  return txt;
}
async function pdfPersonnel(p){
  const g=personnelGroups(p);
  const mode=p.reportMode||getPersonnelReportMode();
  const d=doc(lang==='en'?'Staff check':'Personeel check', `${tr('Shift')}: ${p.shift||'-'} • ${tr('Locatie')}: ${p.location||'-'}`);
  let y=66;
  y=addSection(d,lang==='en'?'Summary':'Samenvatting',y);
  y=addKeyValues(d,[[tr('Teamleider'),p.lead||'-'],[tr('Shift'),p.shift||'-'],[tr('Locatie'),p.location||'-'],[tr('Status')||'Status',translateStatus(p.status)],[lang==='en'?'Not present':'Afwezig / niet aanwezig',g.notPresent.length],[tr('Algemene opmerking'),p.notes||'-']],y);
  y=addSection(d,lang==='en'?'Not present':'Afwezig / niet aanwezig',y);
  if(g.notPresent.length){
    g.notPresent.forEach((x,i)=>{y=addKeyValues(d,[[`${i+1}. ${x.name}`,`${personStatusLabel(x.status)}${x.note?' - '+x.note:''}`]],y);});
  }else{
    y=addLines(d,[lang==='en'?'No absent/not present employees.':'Geen afwezigen/niet aanwezigen.'],y);
  }
  if(mode==='all'){
    y=addSection(d,lang==='en'?'Full staff list':'Volledige personeelslijst',y);
    (p.people||[]).forEach((x,i)=>{y=addKeyValues(d,[[`${i+1}. ${x.name}`,`${personStatusLabel(x.status)}${x.note?' - '+x.note:''}`]],y);});
  }
  d.save(`AWC-personeel-${Date.now()}.pdf`);
}
function mailPersonnel(){
  const p=currentPersonnel();
  const absentCount=personnelGroups(p).notPresent.length;
  openMail('pers',`AWC ${tr('Personeel check')} – ${smartDate()} – ${p.location||''} – ${absentCount} ${lang==='en'?'not present':'afwezig'}`,textPersonnel(p)+mailFooter([]));
}


/* FINAL 1.0 clean output fix: no emoji in PDF/mail, WhatsApp keeps informal icons */
function cleanStatusLabel(status){
  const nl={aanwezig:'Aanwezig',verlof:'Verlof',ziek:'Ziek','te laat':'Te laat',afwezig:'Afwezig','niet ingeroosterd':'Niet ingeroosterd'};
  const en={aanwezig:'Present',verlof:'Leave',ziek:'Sick','te laat':'Late',afwezig:'Absent','niet ingeroosterd':'Not scheduled'};
  return (lang==='en'?en:nl)[status] || status || '-';
}
function personnelLinePlain(x){return `${x.name} - ${cleanStatusLabel(x.status)}${x.note?' - '+x.note:''}`}
function personnelLineWhatsApp(x){return `${personIcon(x.status)} ${x.name} (${cleanStatusLabel(x.status)})${x.note?' - '+x.note:''}`}
function textPersonnelPlain(p){
  const g=personnelGroups(p);
  const mode=p.reportMode||getPersonnelReportMode();
  const title=lang==='en'?'AWC Staff check':'AWC Personeel check';
  const notTitle=lang==='en'?'NOT PRESENT':'AFWEZIG / NIET AANWEZIG';
  const fullTitle=lang==='en'?'FULL STAFF LIST':'VOLLEDIGE PERSONEELSLIJST';
  const noAbs=lang==='en'?'No absent/not present employees.':'Geen afwezigen/niet aanwezigen.';
  let txt=`${title}\n${tr('Teamleider')}: ${p.lead||'-'}\n${tr('Shift')}: ${p.shift||'-'}\n${tr('Locatie')}: ${p.location||'-'}\n${tr('Status')||'Status'}: ${translateStatus(p.status)}\n\n${notTitle} (${g.notPresent.length})\n`;
  txt += g.notPresent.length ? g.notPresent.map(personnelLinePlain).join('\n') : noAbs;
  if(mode==='all'){
    txt += `\n\n${fullTitle} (${(p.people||[]).length})\n` + ((p.people||[]).length ? (p.people||[]).map(personnelLinePlain).join('\n') : '-');
  }
  txt += `\n\n${tr('Algemene opmerking')}: ${p.notes||'-'}`;
  return txt;
}
function textPersonnelWhatsApp(p){
  const g=personnelGroups(p);
  const mode=p.reportMode||getPersonnelReportMode();
  const title=lang==='en'?'AWC Staff check':'AWC Personeel check';
  const notTitle=lang==='en'?'❗ Not present':'❗ Afwezig / niet aanwezig';
  const fullTitle=lang==='en'?'👥 Full staff list':'👥 Volledige personeelslijst';
  const noAbs=lang==='en'?'No absent/not present employees.':'Geen afwezigen/niet aanwezigen.';
  let txt=`👥 ${title}\n${tr('Teamleider')}: ${p.lead||'-'}\n${tr('Shift')}: ${p.shift||'-'}\n${tr('Locatie')}: ${p.location||'-'}\n${tr('Status')||'Status'}: ${translateStatus(p.status)}\n\n${notTitle} (${g.notPresent.length})\n`;
  txt += g.notPresent.length ? g.notPresent.map(personnelLineWhatsApp).join('\n') : noAbs;
  if(mode==='all'){
    txt += `\n\n${fullTitle} (${(p.people||[]).length})\n` + ((p.people||[]).length ? (p.people||[]).map(personnelLineWhatsApp).join('\n') : '-');
  }
  txt += `\n\n${tr('Algemene opmerking')}: ${p.notes||'-'}`;
  return txt;
}
textPersonnel=textPersonnelPlain;
pdfPersonnel=async function(p){
  const g=personnelGroups(p);
  const mode=p.reportMode||getPersonnelReportMode();
  const d=doc(lang==='en'?'Staff check':'Personeel check', `${tr('Shift')}: ${p.shift||'-'} • ${tr('Locatie')}: ${p.location||'-'}`);
  let y=66;
  y=addSection(d,lang==='en'?'Summary':'Samenvatting',y);
  y=addKeyValues(d,[[tr('Teamleider'),p.lead||'-'],[tr('Shift'),p.shift||'-'],[tr('Locatie'),p.location||'-'],[tr('Status')||'Status',translateStatus(p.status)],[lang==='en'?'Not present':'Afwezig / niet aanwezig',g.notPresent.length],[tr('Algemene opmerking'),p.notes||'-']],y);
  y=addSection(d,lang==='en'?'Not present':'Afwezig / niet aanwezig',y);
  if(g.notPresent.length){
    g.notPresent.forEach((x,i)=>{y=addKeyValues(d,[[`${i+1}. ${x.name}`,`${cleanStatusLabel(x.status)}${x.note?' - '+x.note:''}`]],y);});
  }else{
    y=addLines(d,[lang==='en'?'No absent/not present employees.':'Geen afwezigen/niet aanwezigen.'],y);
  }
  if(mode==='all'){
    y=addSection(d,lang==='en'?'Full staff list':'Volledige personeelslijst',y);
    (p.people||[]).forEach((x,i)=>{y=addKeyValues(d,[[`${i+1}. ${x.name}`,`${cleanStatusLabel(x.status)}${x.note?' - '+x.note:''}`]],y);});
  }
  d.save(`AWC-personeel-${Date.now()}.pdf`);
};
mailPersonnel=function(){
  const p=currentPersonnel();
  const absentCount=personnelGroups(p).notPresent.length;
  openMail('pers',`AWC ${tr('Personeel check')} – ${smartDate()} – ${p.location||''} – ${absentCount} ${lang==='en'?'not present':'afwezig'}`,textPersonnelPlain(p)+mailFooter([]));
};
updateWA=function(){
  const active=document.querySelector('.tab.active')?.id;let txt='AWC Warehouse Tool';
  if(active==='pallets')txt=textPallet(currentPallet());
  if(active==='personnel')txt=textPersonnelWhatsApp(currentPersonnel());
  if(active==='warehouse')txt=textWarehouse(currentWarehouse());
  if(active==='orders')txt=textOrder(currentOrder());
  if(active==='machines')txt=textMachine(currentMachine());
  if(active==='incidents')txt='⚠️ AWC Incident\n'+val('i_what');
  if(active==='damage')txt=textRows('damage');
  if(active==='manco')txt=textRows('manco');
  qs('wa').href='https://wa.me/?text='+encodeURIComponent(txt+'\n\n'+location.href);
};


/* === AWC ULTIMATE LANGUAGE + INSTALL PATCH === */
(function(){
  const EN = {
    'AWC TOOL • V2 PRO':'AWC TOOL • V2 PRO',
    'Dagelijkse controle in één professioneel dashboard':'Daily checks in one professional dashboard',
    'Alle dagelijkse controles staan hieronder als duidelijke tegels. Kies één onderdeel en werk vanuit dezelfde professionele stijl.':'All daily checks are listed below as clear tiles. Choose one section and work in the same professional style.',
    '🇳🇱 Nederlands':'🇳🇱 Dutch','🇬🇧 English':'🇬🇧 English','📲 App installeren':'📲 Install app','🔄 Cache updaten':'🔄 Update cache',
    'Amsterdam Warehouse Company':'Amsterdam Warehouse Company','Slego 1a, 1046 BM Amsterdam':'Slego 1a, 1046 BM Amsterdam','Conakryweg 6, 1047 HS Amsterdam':'Conakryweg 6, 1047 HS Amsterdam','info@amsterdamwarehouse.com':'info@amsterdamwarehouse.com','+31 (0)20-3081287':'+31 (0)20-3081287',
    'Pallettelling':'Pallet count','Pallets':'Pallets','Personeelscontrole':'Staff control','Personeel check':'Staff check','Personeel':'Staff','Warehousecontrole':'Warehouse control','Warehouse ruimte check':'Warehouse area check','Order wegen':'Order weighing','Order wegen / ordermeting':'Order weighing / measuring','Machinekeuring':'Machine inspection','Machine checklist':'Machine checklist','Incidenten':'Incidents','Incident / bijna ongeval':'Incident / near miss','Schade':'Damage','Schade registratie':'Damage registration','Manco':'Shortage','Manco registratie':'Shortage registration','Handleiding':'User guide','Gebruiksaanwijzing':'User guide',
    'Aanwezig, afwezig, ziek of te laat':'Present, absent, sick or late','Hallen, expeditie en buitenterrein':'Halls, expedition and outdoor area','Machinecheck met status':'Machine check with status','Incident of bijna-ongeval':'Incident or near miss','Schade melden met foto':'Report damage with photo','Manco melden met foto':'Report shortage with photo','Telling, foto en PDF':'Count, photo and PDF','Gewicht, colli en afmetingen':'Weight, packages and dimensions',
    'Dashboard':'Dashboard','Professionele warehouse registratie met dashboard, PDF, Excel, historie en statuslogica.':'Professional warehouse registration with dashboard, PDF, Excel, history and status logic.','V2 PRO • FULL LANG build 2026.05.02':'V2 PRO • FULL LANG build 2026.05.02','Up-to-date':'Up-to-date','✅ Up-to-date':'✅ Up-to-date','Cache updaten':'Update cache','Installeren':'Install','App installeren':'Install app',
    'Recente registraties':'Recent registrations','Locatie overzicht':'Location overview','Data beheer':'Data management','Alles naar Excel':'Export all to Excel','Backup JSON':'Backup JSON','Backup importeren':'Import backup','Alles wissen':'Clear all','Nog geen registraties.':'No registrations yet.','Nog geen historie.':'No history yet.','Historie':'History',
    'Gebruiker':'User','Naam':'Name','Locatie':'Location','Ontvanger':'Recipient','Foto\'s':'Photos','Foto’s':'Photos','Opslaan':'Save','PDF':'PDF','Mail':'Email','Excel':'Excel','Totaal':'Total','Blok':'Block','Opmerking':'Remark','Algemene opmerking':'General remark','Toelichting':'Explanation','Toelichting / actiepunt':'Explanation / action point','Toelichting / reparatieverzoek':'Explanation / repair request','Status':'Status',
    'Machine':'Machine','Reachtruck':'Reach truck','EPT / pompwagen':'EPT / pallet truck','Heftruck':'Forklift','Stapelaar':'Stacker','Machinenummer':'Machine number','Serienummer':'Serial number','Buitenterrein':'Outdoor area','Live keuringsstatus':'Live inspection status','Controlepunten':'Checkpoints','PRO-regels':'PRO rules','Handtekening':'Signature','Handtekening wissen':'Clear signature',
    'Teamleider':'Team leader','Shift':'Shift','Dag':'Day','Avond':'Evening','Nacht':'Night','Weekend':'Weekend','Live personeelsstatus':'Live staff status','Telling':'Count','Rooster uploaden vanaf foto/screenshot':'Upload schedule from photo/screenshot','📸 Scan roosterfoto':'📸 Scan schedule photo','✔ Namen overnemen':'✔ Apply names','Scan wissen':'Clear scan','Medewerker toevoegen':'Add employee','+ Toevoegen':'+ Add','Iedereen aanwezig':'Everyone present','Status resetten':'Reset status','Alle namen wissen':'Clear all names','Namenlijst':'Name list','Aanwezig':'Present','Verlof':'Leave','Ziek':'Sick','Te laat':'Late','Afwezig':'Absent','Niet ingeroosterd':'Not scheduled','niet ingeroosterd':'Not scheduled','Niet ingeroosterd':'Not scheduled','niet ingeroosterd':'Not scheduled',
    'Controleur':'Inspector','Kies ruimte':'Choose area','Naam overige ruimte':'Name other area','Live ruimtestatus':'Live area status','Hal':'Hall','Expeditie':'Expedition','Entresol':'Mezzanine','Technische ruimte':'Technical room','Kantoor / kantine':'Office / canteen','Overige ruimte':'Other area',
    'Melder':'Reporter','Datum/tijd':'Date/time','Wat is er gebeurd?':'What happened?','Oorzaak':'Cause','Letsel/schade?':'Injury/damage?','Direct gevaar?':'Immediate danger?','Actie en preventie':'Action and prevention','Nee':'No','Ja':'Yes',
    'Vestiging':'Site','Klant / leverancier':'Customer / supplier','Artikel':'Item','Aantal':'Quantity','Schadetype':'Damage type','Barcode/status':'Barcode/status','+ Schaderegel':'+ Damage line','+ Mancoregel':'+ Shortage line','Ordernummer':'Order number','Orderregels':'Order lines','+ Artikelregel toevoegen':'+ Add item line','Artikelregel':'Item line','Colli':'Packages','Pallet':'Pallet','Netto gewicht':'Net weight','Lengte':'Length','Breedte':'Width','Hoogte':'Height','Volume':'Volume','Artikelnummer':'Item number','Verwijder':'Remove',
    'Vul alle punten in. Kritieke fouten keuren de machine automatisch af.':'Complete all items. Critical faults automatically reject the machine.','Bij elke NEE zijn toelichting en foto verplicht. Remmen, stuurinrichting, hefmast/vorken, hydrauliek, noodstop en buitenterreinveiligheid zijn kritisch.':'For every NO, an explanation and photo are required. Brakes, steering, mast/forks, hydraulics, emergency stop and outdoor-area safety are critical.','Voeg medewerkers toe en vink aanwezigheid af.':'Add employees and set their attendance status.','Upload een duidelijke foto of screenshot van het rooster. De app probeert namen automatisch te herkennen.':'Upload a clear photo or screenshot of the schedule. The app will try to recognise names automatically.','Kies een ruimte en vul alle punten in.':'Choose an area and complete all items.','Bij NEE zijn foto en toelichting verplicht. Kritieke veiligheidsfouten geven automatisch afgekeurd.':'For NO answers, a photo and explanation are required. Critical safety faults automatically result in rejected status.',
    'Open deze site via de GitHub Pages-link. Android/Chrome: tik op ⋮ en kies ‘App installeren’ of ‘Toevoegen aan startscherm’.':'Open this site through the GitHub Pages link. Android/Chrome: tap ⋮ and choose “Install app” or “Add to home screen”.'
  };
  const NL = Object.fromEntries(Object.keys(EN).map(k=>[EN[k],k]));
  function cleanText(t){return (t||'').replace(/\s+/g,' ').trim();}
  function trans(t){
    const raw=cleanText(t); if(!raw) return t;
    if(lang==='en') return EN[raw] || (I18N?.en?.[raw]) || raw;
    return NL[raw] || (I18N?.nl?.[raw]) || raw;
  }
  function setText(el,txt){ if(el.childNodes.length===1 && el.firstChild.nodeType===3) el.textContent=txt; }
  window.translateWholeApp=function(){
    document.documentElement.lang=lang;
    document.querySelectorAll('.manual-nl').forEach(e=>e.classList.toggle('hide',lang!=='nl'));
    document.querySelectorAll('.manual-en').forEach(e=>e.classList.toggle('hide',lang!=='en'));
    document.querySelectorAll('[data-nl][data-en]').forEach(el=>{ el.textContent=el.getAttribute(lang==='en'?'data-en':'data-nl'); });
    document.querySelectorAll('h1,h2,h3,h4,p,label,button,small,b,span,th,td,option,div.muted,a.contact-line,a').forEach(el=>{
      if(el.closest('.manual-nl,.manual-en')) return;
      if(el.tagName==='OPTION' && el.parentElement && el.parentElement.id && el.parentElement.id.endsWith('_mail')) return;
      if(el.id==='wa') return;
      const raw=cleanText(el.dataset.baseText || el.textContent);
      if(!raw) return;
      if(!el.dataset.baseText) el.dataset.baseText=raw;
      const nt=trans(el.dataset.baseText);
      if(nt!==cleanText(el.textContent)) setText(el,nt);
    });
    document.querySelectorAll('input,textarea').forEach(el=>{
      if(el.placeholder){ if(!el.dataset.basePh) el.dataset.basePh=el.placeholder; el.placeholder=trans(el.dataset.basePh); }
    });
    document.getElementById('langNL')?.classList.toggle('lang-active',lang==='nl');
    document.getElementById('langEN')?.classList.toggle('lang-active',lang==='en');
    document.getElementById('heroLangNL')?.classList.toggle('active',lang==='nl');
    document.getElementById('heroLangEN')?.classList.toggle('active',lang==='en');
  };
  const _initNavLabels=window.initNavLabels;
  window.initNavLabels=function(){ _initNavLabels?.(); setTimeout(translateWholeApp,0); };
  window.applyI18n=window.translateDOM=window.translateWholeApp;
  window.setLang=function(l){
    lang=l; localStorage.setItem(KEY+'lang',l);
    initNavLabels();
    const active=document.querySelector('.tab.active')?.id || 'dashboard';
    show(active);
    renderAll();
    translateWholeApp();
  };
  const _renderAll=window.renderAll;
  window.renderAll=function(){ _renderAll?.(); setTimeout(translateWholeApp,0); };
  const _show=window.show;
  window.show=function(id){ _show(id); setTimeout(translateWholeApp,0); };
  window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); deferredPrompt=e; });
  window.installApp=async function(){
    const help=document.getElementById('installHelp');
    if(deferredPrompt){
      deferredPrompt.prompt();
      try{ await deferredPrompt.userChoice; }catch(e){}
      deferredPrompt=null;
      return;
    }
    if(help){
      help.classList.add('show');
      help.textContent=lang==='en'
        ? 'Chrome has not released the install popup yet. Use the browser menu ⋮ and choose “Install app” or “Add to home screen”. This is an Android/Chrome rule; a website cannot force the native install popup.'
        : 'Chrome geeft de installatie-popup nog niet vrij. Gebruik het browsermenu ⋮ en kies “App installeren” of “Toevoegen aan startscherm”. Dit is een Android/Chrome-regel; een website kan de native installatie-popup niet afdwingen.';
      help.scrollIntoView({behavior:'smooth',block:'nearest'});
    }
  };
})();
/* === END PATCH === */


/* === FINAL OVERRIDES: browser back + full app translation + install fallback === */
(function(){
  const FULL_EN = {
    'Pallettelling':'Pallet count','Palletchecks':'Pallet checks','Personeel checks':'Staff checks','Warehousecontroles':'Warehouse checks','Orderwegingen':'Order weighings','Afgekeurd/aandacht':'Rejected/attention','Totaal pallets':'Total pallets','Laatste update':'Last update','Locatie overzicht':'Location overview','Data beheer':'Data management','Locatie':'Location','Machines':'Machines','Incidenten':'Incidents','Schade':'Damage','Manco':'Shortage','Pallets':'Pallets','Laatste check':'Last check','Laatst bijgewerkt':'Last updated','LIVE':'LIVE',
    'Algemene staat schoon en veilig':'General condition clean and safe','Accu/batterij in goede staat':'Battery in good condition','Geen vloeistoflekkage':'No fluid leakage','Wielen/banden in goede staat':'Wheels/tires in good condition','Remmen werken goed':'Brakes work properly','Stuurinrichting werkt goed':'Steering works properly','Hefmast/vorken veilig':'Mast/forks are safe','Hydrauliek geen lekkage':'Hydraulics: no leakage','Claxon werkt':'Horn works','Verlichting/signalen werken':'Lights/signals work','Noodstop/veiligheid werkt':'Emergency stop/safety works','Stoel/bediening in goede staat':'Seat/controls in good condition','Buitenterrein: geen direct gevaar':'Outdoor area: no immediate danger','Geen losse of uitstekende delen':'No loose or protruding parts','Ladingdrager/palletvork geen schade':'Load carrier/pallet forks not damaged',
    'Rijroutes en werkpaden vrij':'Driving routes and work paths clear','Vloer schoon, droog en veilig':'Floor clean, dry and safe','Stellingen / opslag schadevrij':'Racking/storage free from damage','Goederen stabiel en veilig gestapeld':'Goods stacked stable and safely','Geen losliggende folie, hout of afval':'No loose foil, wood or waste','Brandblussers en noodmiddelen bereikbaar':'Fire extinguishers and emergency equipment accessible','Nooduitgangen / vluchtroutes vrij':'Emergency exits / escape routes clear','Verlichting voldoende en werkend':'Lighting sufficient and working','Geen lekkage of gevaarlijke situatie':'No leakage or dangerous situation',
    'Laad- en loszone vrij en veilig':'Loading/unloading zone clear and safe','Dockdeuren / overheaddeuren werken goed':'Dock doors / overhead doors work properly','Docklevellers / laadbruggen schadevrij':'Dock levellers / loading bridges undamaged','Geen obstakels bij docks of deuren':'No obstacles near docks or doors','Pallets en zendingen staan stabiel opgesteld':'Pallets and shipments are positioned safely',
    'Terrein vrij van zwerfafval en losse materialen':'Yard free of litter and loose materials','Rijroutes voor vrachtwagens vrij':'Truck routes clear','Geen gevaarlijke kuilen, verzakkingen of gladde plekken':'No dangerous holes, subsidence or slippery spots','Hekwerk, poorten en terreinbeveiliging in orde':'Fencing, gates and site security in order','Parkeerplaatsen en laad-/losplekken veilig bruikbaar':'Parking and loading/unloading spaces safe to use','Afwatering/putten vrij en niet verstopt':'Drainage/drains clear and not blocked','Buitenverlichting werkt voldoende':'Outdoor lighting works sufficiently','Geen onbeheerde pallets, afval of obstakels tegen gevel/nooddeur':'No unattended pallets, waste or obstacles against facade/emergency door','Nooduitgangen aan buitenzijde vrij bereikbaar':'Emergency exits accessible from outside','Geen lekkage, morsing of gevaarlijke situatie':'No leakage, spill or dangerous situation',
    'Trap en leuning stevig en schadevrij':'Stairs and handrail secure and undamaged','Entresolvloer schoon en vrij van losse materialen':'Mezzanine floor clean and free of loose materials','Maximale belasting niet overschreden':'Maximum load not exceeded','Opslag staat stabiel en niet te dicht bij rand':'Storage is stable and not too close to the edge','Valbeveiliging / hekwerk aanwezig en schadevrij':'Fall protection / railing present and undamaged','Geen geblokkeerde toegang of vluchtroute':'No blocked access or escape route',
    'Tafels en stoelen heel en netjes':'Tables and chairs intact and tidy','Afvalbakken niet overvol':'Bins not overfull','Koelkast/magnetron/koffiehoek schoon':'Fridge/microwave/coffee area clean','Geen etensresten of ongedierte-indicatie':'No food residue or signs of pests','EHBO/noodmiddelen bereikbaar indien aanwezig':'First aid/emergency equipment accessible if present','Elektrische apparaten en kabels veilig':'Electrical appliances and cables safe',
    'Werkplekken netjes en veilig':'Workstations tidy and safe','Vloer vrij van kabels en struikelgevaar':'Floor free from cables and trip hazards','Elektrische apparatuur/kabels veilig':'Electrical equipment/cables safe','Nooduitgang / looproute vrij':'Emergency exit / walking route clear','Verlichting en klimaat werkbaar':'Lighting and climate workable','Geen overvolle afvalbakken of brandgevaar':'No overfull bins or fire risk',
    'Ruimte alleen toegankelijk voor bevoegd personeel':'Room accessible only to authorised staff','Vloer vrij van obstakels en afval':'Floor free from obstacles and waste','Elektrakasten/installaties vrij bereikbaar':'Electrical cabinets/installations accessible','Geen opslag voor of tegen installaties':'No storage in front of or against installations','Ventilatie vrij en werkend':'Ventilation clear and working','Blusmiddelen/noodmiddelen bereikbaar':'Firefighting/emergency equipment accessible','Waarschuwingsstickers/signalisatie aanwezig':'Warning stickers/signage present','Geen lekkage, brandlucht of gevaarlijke situatie':'No leakage, burning smell or dangerous situation',
    'Ruimte schoon en veilig':'Area clean and safe','Geen obstakels of losliggende materialen':'No obstacles or loose materials','Vloer/wanden/plafond zonder gevaarlijke schade':'Floor/walls/ceiling without dangerous damage','Opslag staat stabiel en veilig':'Storage is stable and safe','Noodmiddelen bereikbaar indien aanwezig':'Emergency equipment accessible if present','Vluchtroute of toegang vrij':'Escape route or access clear',
    'GOEDGEKEURD':'APPROVED','AFGEKEURD':'REJECTED','AANDACHT':'ATTENTION','NOG NIET COMPLEET':'NOT COMPLETE','Alle punten zijn akkoord.':'All items are OK.','Kritieke fout gevonden. Niet gebruiken tot herstel.':'Critical fault found. Do not use until repaired.','Er zijn aandachtspunten. Maak actie aan.':'There are attention points. Create an action.','Vul alle punten in.':'Complete all items.','Vul alle punten in. Kritieke fouten keuren de machine automatisch af.':'Complete all items. Critical faults automatically reject the machine.',
    'Personeelscontrole':'Staff check','Warehousecontrole':'Warehouse check','Machinekeuring':'Machine inspection','Order wegen':'Order weighing','Pallettelling':'Pallet count','Machine checklist':'Machine checklist','Warehouse check':'Warehouse check','Incidentrapport':'Incident report','Schade registratie':'Damage registration','Manco registratie':'Shortage registration','Orderweging':'Order weighing','Personeel check':'Staff check',
    'Nederlands':'Dutch','English':'English','Terug naar menu':'Back to menu','Menu':'Menu','Nieuwe registratie':'New registration','Kies één onderdeel':'Choose one module'
  };
  const FULL_NL = Object.fromEntries(Object.entries(FULL_EN).map(([k,v])=>[v,k]));
  function norm(t){ return (t||'').replace(/\s+/g,' ').trim(); }
  function translateValue(t){ const n=norm(t); if(!n) return t; return lang==='en' ? (FULL_EN[n] || (window.EN&&EN[n]) || n) : (FULL_NL[n] || n); }
  function translateNodeText(root=document){
    root.querySelectorAll('[data-nl][data-en]').forEach(el=>{el.textContent=el.getAttribute(lang==='en'?'data-en':'data-nl')});
    root.querySelectorAll('h1,h2,h3,h4,p,label,button,small,b,span,th,td,option,div.muted,div.mini,div.module-hint,div.status,div.item').forEach(el=>{
      if(el.closest('.manual-nl,.manual-en')) return;
      if(el.children.length>0 && !['BUTTON','OPTION','SPAN','B','SMALL','LABEL','TH','TD'].includes(el.tagName)) return;
      let base=el.dataset.i18nBase || norm(el.textContent); if(!base) return;
      if(!el.dataset.i18nBase) el.dataset.i18nBase=base;
      const out=translateValue(base);
      if(out!==norm(el.textContent)) el.textContent=out;
    });
    root.querySelectorAll('input,textarea').forEach(el=>{ if(el.placeholder){ if(!el.dataset.i18nPh) el.dataset.i18nPh=el.placeholder; el.placeholder=translateValue(el.dataset.i18nPh); }});
    document.getElementById('langNL')?.classList.toggle('lang-active',lang==='nl');
    document.getElementById('langEN')?.classList.toggle('lang-active',lang==='en');
    document.getElementById('heroLangNL')?.classList.toggle('active',lang==='nl');
    document.getElementById('heroLangEN')?.classList.toggle('active',lang==='en');
  }
  window.translateWholeApp=function(){
    document.documentElement.lang=lang;
    document.querySelectorAll('.manual-nl').forEach(e=>e.classList.toggle('hide',lang!=='nl'));
    document.querySelectorAll('.manual-en').forEach(e=>e.classList.toggle('hide',lang!=='en'));
    translateNodeText(document);
  };
  const oldApply=window.applyI18n; window.applyI18n=function(){ try{oldApply&&oldApply();}catch(e){} translateWholeApp(); };
  const oldRenderChecks=window.renderChecks; if(oldRenderChecks) window.renderChecks=function(){ oldRenderChecks(); setTimeout(translateWholeApp,0); };
  const oldRenderWarehouseChecks=window.renderWarehouseChecks; if(oldRenderWarehouseChecks) window.renderWarehouseChecks=function(){ oldRenderWarehouseChecks(); setTimeout(translateWholeApp,0); };
  const oldRenderRooms=window.renderRooms; if(oldRenderRooms) window.renderRooms=function(){ oldRenderRooms(); setTimeout(translateWholeApp,0); };
  const oldRenderPersonnel=window.renderPersonnel; if(oldRenderPersonnel) window.renderPersonnel=function(){ oldRenderPersonnel(); setTimeout(translateWholeApp,0); };
  const oldRenderAll=window.renderAll; window.renderAll=function(){ oldRenderAll&&oldRenderAll(); setTimeout(translateWholeApp,0); };
  const originalShow=window.show;
  let internalNav=false;
  window.show=function(id, fromPop=false){
    if(!document.getElementById(id)) id='dashboard';
    originalShow&&originalShow(id);
    if(!fromPop && history.state?.tab!==id){ history.pushState({tab:id},'', '#'+id); }
    if(id!=='dashboard' && !document.querySelector('#'+id+' .module-back')){
      const sec=document.getElementById(id);
      const back=document.createElement('div'); back.className='module-back'; back.innerHTML='<button type="button" onclick="show(\'dashboard\')">← Terug naar menu</button>';
      sec.prepend(back);
    }
    setTimeout(translateWholeApp,0);
  };
  window.addEventListener('popstate', e=>{
    const tab=e.state?.tab || 'dashboard';
    window.show(tab,true);
  });
  const oldSetLang=window.setLang;
  window.setLang=function(l){
    lang=l; localStorage.setItem(KEY+'lang',l);
    try{ initNavLabels(); }catch(e){}
    try{ renderChecks(); renderRooms(); renderWarehouseChecks(); renderPersonnel(); renderAll(); }catch(e){}
    const active=document.querySelector('.tab.active')?.id || 'dashboard';
    originalShow&&originalShow(active);
    translateWholeApp();
  };
  window.installApp=async function(){
    const help=document.getElementById('installHelp');
    if(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches){
      if(help){help.classList.add('show'); help.textContent=lang==='en'?'The app is already installed.':'De app is al geïnstalleerd.';} return;
    }
    if(deferredPrompt){
      try{ deferredPrompt.prompt(); await deferredPrompt.userChoice; }catch(e){}
      deferredPrompt=null; return;
    }
    if(help){
      help.classList.add('show');
      help.textContent=lang==='en'?'Open the browser menu ⋮ and choose “Install app” or “Add to home screen”. Chrome only shows the native install button when it decides the PWA is ready.' : 'Open het browsermenu ⋮ en kies “App installeren” of “Toevoegen aan startscherm”. Chrome toont de native installatieknop alleen wanneer de PWA door Chrome is vrijgegeven.';
    }
  };
  document.addEventListener('DOMContentLoaded',()=>{
    if(!history.state) history.replaceState({tab:'dashboard'},'', location.hash||'#dashboard');
    setTimeout(()=>{translateWholeApp();},250);
  });
})();


/* === FINAL REALTIME TRANSLATION PRO + NO-POPUP INSTALL === */
(function(){
  const FINAL_EN = {
    // dashboard / app shell
    'AWC TOOL • V2 PRO':'AWC TOOL • V2 PRO','Dagelijkse controle in één professioneel dashboard':'Daily checks in one professional dashboard','Alle dagelijkse controles staan hieronder als duidelijke tegels. Kies één onderdeel en werk vanuit dezelfde professionele stijl.':'All daily checks are listed below as clear tiles. Choose one module and work in the same professional style.','Nederlands':'Dutch','English':'English','App installeren':'Install app','📲 App installeren':'📲 Install app','Cache updaten':'Update cache','🔄 Cache updaten':'🔄 Update cache','Dashboard':'Dashboard','Professionele warehouse registratie met dashboard, PDF, Excel, historie en statuslogica.':'Professional warehouse registration with dashboard, PDF, Excel, history and status logic.','Terug naar menu':'Back to menu','← Terug naar menu':'← Back to menu','Open deze site via de GitHub Pages-link. Android/Chrome: tik op ⋮ en kies ‘App installeren’ of ‘Toevoegen aan startscherm’.':'Open this site through the GitHub Pages link. Android/Chrome: tap ⋮ and choose “Install app” or “Add to home screen”.',
    // modules
    'Pallettelling':'Pallet count','Pallets':'Pallets','Personeelscontrole':'Staff check','Personeel':'Staff','Personeel check':'Staff check','Warehousecontrole':'Warehouse check','Warehouse ruimte check':'Warehouse area check','Warehouse':'Warehouse','Order wegen':'Order weighing','Orderweging':'Order weighing','Order wegen / ordermeting':'Order weighing / measuring','Machinekeuring':'Machine inspection','Machines':'Machines','Machine checklist':'Machine checklist','Incidenten':'Incidents','Incident / bijna ongeval':'Incident / near miss','Schade':'Damage','Schade registratie':'Damage registration','Manco':'Shortage','Manco registratie':'Shortage registration','Handleiding':'User guide','Gebruiksaanwijzing':'User guide',
    'Telling, foto en PDF':'Count, photo and PDF','Aanwezig, afwezig, ziek of te laat':'Present, absent, sick or late','Hallen, expeditie en buitenterrein':'Halls, expedition and outdoor area','Gewicht, colli en afmetingen':'Weight, packages and dimensions','Machinecheck met status':'Machine check with status','Incident of bijna-ongeval':'Incident or near miss','Schade melden met foto':'Report damage with photo','Manco melden met foto':'Report shortage with photo',
    // generic labels/buttons
    'Gebruiker':'User','Naam':'Name','Locatie':'Location','Vestiging':'Site','Ontvanger':'Recipient','Foto':'Photo','Foto\'s':'Photos','Foto’s':'Photos','Foto\'s / bestanden voor klant':'Photos / files for customer','Opslaan':'Save','PDF':'PDF','Mail':'Email','Excel':'Excel','Historie':'History','Totaal':'Total','Totalen':'Totals','Blok':'Block','Euro':'Euro','2 meter':'2 metre','Opmerking':'Remark','Algemene opmerking':'General remark','Toelichting':'Explanation','Toelichting / actiepunt':'Explanation / action point','Toelichting / reparatieverzoek':'Explanation / repair request','Status':'Status','JA':'YES','NEE':'NO','Ja':'Yes','Nee':'No','Kritiek':'Critical','KRITIEK':'CRITICAL','Verwijderen':'Remove','Verwijder':'Remove','Regel':'Line','Regels':'Lines','Nieuwe registratie':'New registration','Nog geen registraties.':'No registrations yet.','Nog geen historie.':'No history yet.','Alles naar Excel':'Export all to Excel','Backup JSON':'Backup JSON','Backup importeren':'Import backup','Alles wissen':'Clear all','Data beheer':'Data management','Recente registraties':'Recent registrations','Locatie overzicht':'Location overview','Laatste check':'Last check','Laatst bijgewerkt':'Last updated','Laatste update':'Last update','Geen gegevens':'No data',
    // machine
    'Machine':'Machine','Reachtruck':'Reach truck','EPT / pompwagen':'EPT / pallet truck','Heftruck':'Forklift','Stapelaar':'Stacker','Machinenummer':'Machine number','Serienummer':'Serial number','Buitenterrein':'Outdoor area','Live keuringsstatus':'Live inspection status','Controlepunten':'Checkpoints','PRO-regels':'PRO rules','Handtekening':'Signature','Handtekening wissen':'Clear signature','GOEDGEKEURD':'APPROVED','AFGEKEURD':'REJECTED','AANDACHT NODIG':'ATTENTION NEEDED','AANDACHT':'ATTENTION','NOG NIET COMPLEET':'NOT COMPLETE','Machine niet gebruiken. Kritieke fout gemeld.':'Do not use the machine. Critical fault reported.','Toelichting en foto verplicht bij fout.':'Explanation and photo required for a fault.','Alles lijkt in orde zodra alle punten zijn ingevuld.':'Everything appears OK once all items are completed.','Vul alle punten in.':'Complete all items.','Vul alle punten in. Kritieke fouten keuren de machine automatisch af.':'Complete all items. Critical faults automatically reject the machine.','Bij elke NEE zijn toelichting en foto verplicht. Remmen, stuurinrichting, hefmast/vorken, hydrauliek, noodstop en buitenterreinveiligheid zijn kritisch.':'For every NO, explanation and photo are required. Brakes, steering, mast/forks, hydraulics, emergency stop and outdoor safety are critical.',
    // machine check items
    'Algemene staat schoon en veilig':'General condition clean and safe','Accu/batterij in goede staat':'Battery in good condition','Geen vloeistoflekkage':'No fluid leakage','Wielen/banden in goede staat':'Wheels/tires in good condition','Remmen werken goed':'Brakes work properly','Stuurinrichting werkt goed':'Steering works properly','Hefmast/vorken veilig':'Mast/forks are safe','Hydrauliek geen lekkage':'Hydraulics: no leakage','Claxon werkt':'Horn works','Verlichting/signalen werken':'Lights/signals work','Noodstop/veiligheid werkt':'Emergency stop/safety works','Stoel/bediening in goede staat':'Seat/controls in good condition','Buitenterrein: geen direct gevaar':'Outdoor area: no immediate danger','Geen losse of uitstekende delen':'No loose or protruding parts','Ladingdrager/palletvork geen schade':'Load carrier/pallet forks not damaged',
    // personnel
    'Teamleider':'Team leader','Shift':'Shift','Dag':'Day','Avond':'Evening','Nacht':'Night','Weekend':'Weekend','Live personeelsstatus':'Live staff status','Telling':'Count','Rooster uploaden vanaf foto/screenshot':'Upload schedule from photo/screenshot','📸 Scan roosterfoto':'📸 Scan schedule photo','✔ Namen overnemen':'✔ Apply names','Scan wissen':'Clear scan','Medewerker toevoegen':'Add employee','+ Toevoegen':'+ Add','Iedereen aanwezig':'Everyone present','Status resetten':'Reset status','Alle namen wissen':'Clear all names','Namenlijst':'Name list','Aanwezig':'Present','Verlof':'Leave','Ziek':'Sick','Te laat':'Late','Afwezig':'Absent','Niet ingeroosterd':'Not scheduled','niet ingeroosterd':'Not scheduled','Opmerking / reden':'Remark / reason','Bijv. reden, vervanger of tijd':'E.g. reason, replacement or time','Nog geen medewerkers toegevoegd.':'No employees added yet.','Bezetting compleet.':'Staffing complete.','Meerdere zieken/afwezigen: actie of vervanging nodig.':'Multiple sick/absent employees: action or replacement needed.','Voeg medewerkers toe aan de lijst.':'Add employees to the list.','Controleer verlof, ziekmeldingen, te laat, afwezigen en niet ingeroosterden.':'Check leave, sick reports, late arrivals and absences.','ACTIE VEREIST':'ACTION REQUIRED','GEEN TEAM':'NO TEAM','Voeg medewerkers toe en vink aanwezigheid af.':'Add employees and set attendance status.','Upload een duidelijke foto of screenshot van het rooster. De app probeert namen automatisch te herkennen.':'Upload a clear photo or screenshot of the schedule. The app will try to recognise names automatically.',
    // warehouse rooms/items
    'Controleur':'Inspector','Kies ruimte':'Choose area','Naam overige ruimte':'Name other area','Live ruimtestatus':'Live area status','Hal':'Hall','Expeditie':'Expedition','Entresol':'Mezzanine','Kantine':'Canteen','Kantoor':'Office','Kantoor / kantine':'Office / canteen','Technische ruimte':'Technical room','Overige ruimte':'Other area','Kies een ruimte en vul alle punten in.':'Choose an area and complete all items.','Bij NEE zijn foto en toelichting verplicht. Kritieke veiligheidsfouten geven automatisch afgekeurd.':'For NO answers, photo and explanation are required. Critical safety faults automatically result in rejected status.',
    'Rijroutes en werkpaden vrij':'Driving routes and work paths clear','Vloer schoon, droog en veilig':'Floor clean, dry and safe','Stellingen / opslag schadevrij':'Racking/storage free from damage','Goederen stabiel en veilig gestapeld':'Goods stacked stable and safely','Geen losliggende folie, hout of afval':'No loose foil, wood or waste','Brandblussers en noodmiddelen bereikbaar':'Fire extinguishers and emergency equipment accessible','Nooduitgangen / vluchtroutes vrij':'Emergency exits / escape routes clear','Verlichting voldoende en werkend':'Lighting sufficient and working','Geen lekkage of gevaarlijke situatie':'No leakage or dangerous situation','Laad- en loszone vrij en veilig':'Loading/unloading zone clear and safe','Dockdeuren / overheaddeuren werken goed':'Dock doors / overhead doors work properly','Docklevellers / laadbruggen schadevrij':'Dock levellers / loading bridges undamaged','Geen obstakels bij docks of deuren':'No obstacles near docks or doors','Pallets en zendingen staan stabiel opgesteld':'Pallets and shipments are positioned safely','Terrein vrij van zwerfafval en losse materialen':'Yard free of litter and loose materials','Rijroutes voor vrachtwagens vrij':'Truck routes clear','Geen gevaarlijke kuilen, verzakkingen of gladde plekken':'No dangerous holes, subsidence or slippery spots','Hekwerk, poorten en terreinbeveiliging in orde':'Fencing, gates and site security in order','Parkeerplaatsen en laad-/losplekken veilig bruikbaar':'Parking and loading/unloading spaces safe to use','Afwatering/putten vrij en niet verstopt':'Drainage/drains clear and not blocked','Buitenverlichting werkt voldoende':'Outdoor lighting works sufficiently','Geen onbeheerde pallets, afval of obstakels tegen gevel/nooddeur':'No unattended pallets, waste or obstacles against facade/emergency door','Nooduitgangen aan buitenzijde vrij bereikbaar':'Emergency exits accessible from outside','Geen lekkage, morsing of gevaarlijke situatie':'No leakage, spill or dangerous situation','Trap en leuning stevig en schadevrij':'Stairs and handrail secure and undamaged','Entresolvloer schoon en vrij van losse materialen':'Mezzanine floor clean and free of loose materials','Maximale belasting niet overschreden':'Maximum load not exceeded','Opslag staat stabiel en niet te dicht bij rand':'Storage is stable and not too close to the edge','Valbeveiliging / hekwerk aanwezig en schadevrij':'Fall protection / railing present and undamaged','Geen geblokkeerde toegang of vluchtroute':'No blocked access or escape route','Tafels en stoelen heel en netjes':'Tables and chairs intact and tidy','Afvalbakken niet overvol':'Bins not overfull','Koelkast/magnetron/koffiehoek schoon':'Fridge/microwave/coffee area clean','Geen etensresten of ongedierte-indicatie':'No food residue or signs of pests','EHBO/noodmiddelen bereikbaar indien aanwezig':'First aid/emergency equipment accessible if present','Elektrische apparaten en kabels veilig':'Electrical appliances and cables safe','Werkplekken netjes en veilig':'Workstations tidy and safe','Vloer vrij van kabels en struikelgevaar':'Floor free from cables and trip hazards','Elektrische apparatuur/kabels veilig':'Electrical equipment/cables safe','Nooduitgang / looproute vrij':'Emergency exit / walking route clear','Verlichting en klimaat werkbaar':'Lighting and climate workable','Geen overvolle afvalbakken of brandgevaar':'No overfull bins or fire risk','Ruimte alleen toegankelijk voor bevoegd personeel':'Room accessible only to authorised staff','Vloer vrij van obstakels en afval':'Floor free from obstacles and waste','Elektrakasten/installaties vrij bereikbaar':'Electrical cabinets/installations accessible','Geen opslag voor of tegen installaties':'No storage in front of or against installations','Ventilatie vrij en werkend':'Ventilation clear and working','Blusmiddelen/noodmiddelen bereikbaar':'Firefighting/emergency equipment accessible','Waarschuwingsstickers/signalisatie aanwezig':'Warning stickers/signage present','Geen lekkage, brandlucht of gevaarlijke situatie':'No leakage, burning smell or dangerous situation','Ruimte schoon en veilig':'Area clean and safe','Geen obstakels of losliggende materialen':'No obstacles or loose materials','Vloer/wanden/plafond zonder gevaarlijke schade':'Floor/walls/ceiling without dangerous damage','Opslag staat stabiel en veilig':'Storage is stable and safe','Noodmiddelen bereikbaar indien aanwezig':'Emergency equipment accessible if present','Vluchtroute of toegang vrij':'Escape route or access clear',
    // incidents / damage / orders
    'Melder':'Reporter','Datum/tijd':'Date/time','Wat is er gebeurd?':'What happened?','Oorzaak':'Cause','Letsel/schade?':'Injury/damage?','Direct gevaar?':'Immediate danger?','Actie en preventie':'Action and prevention','Klant / leverancier':'Customer / supplier','Artikel':'Item','Aantal':'Quantity','Schadetype':'Damage type','Barcode/status':'Barcode/status','+ Schaderegel':'+ Damage line','+ Mancoregel':'+ Shortage line','Ordernummer':'Order number','Orderregels':'Order lines','+ Artikelregel toevoegen':'+ Add item line','Artikelregel':'Item line','Colli':'Packages','Pallet':'Pallet','Netto gewicht':'Net weight','Lengte':'Length','Breedte':'Width','Hoogte':'Height','Volume':'Volume','Artikelnummer':'Item number'
  };
  const FINAL_NL = Object.fromEntries(Object.entries(FINAL_EN).map(([nl,en])=>[en,nl]));
  function nrm(t){return String(t||'').replace(/\s+/g,' ').trim();}
  function convertText(txt){
    const key=nrm(txt); if(!key) return txt;
    if(lang==='en') return FINAL_EN[key] || (window.I18N&&I18N.en&&I18N.en[key]) || key;
    return FINAL_NL[key] || (window.I18N&&I18N.nl&&I18N.nl[key]) || key;
  }
  function translateElementText(el){
    if(!el || el.closest('script,style,svg,canvas')) return;
    if(el.closest('.manual-nl,.manual-en')) return;
    if(el.tagName==='OPTION' && el.parentElement && el.parentElement.id && el.parentElement.id.endsWith('_mail')) return;
    const hasElementChildren=[...el.children].length>0;
    if(hasElementChildren && !['BUTTON','OPTION','LABEL','SPAN','B','SMALL','TH','TD','A'].includes(el.tagName)) return;
    const current=nrm(el.textContent); if(!current) return;
    if(!el.dataset.awcBaseText){
      el.dataset.awcBaseText = FINAL_NL[current] || current;
    }
    const out=convertText(el.dataset.awcBaseText);
    if(out && out!==current) el.textContent=out;
  }
  function realtimeTranslate(root=document){
    document.documentElement.lang=lang;
    root.querySelectorAll('.manual-nl').forEach(e=>e.classList.toggle('hide',lang!=='nl'));
    root.querySelectorAll('.manual-en').forEach(e=>e.classList.toggle('hide',lang!=='en'));
    root.querySelectorAll('[data-nl][data-en]').forEach(el=>{el.textContent=el.getAttribute(lang==='en'?'data-en':'data-nl'); el.dataset.awcBaseText=el.getAttribute('data-nl');});
    root.querySelectorAll('h1,h2,h3,h4,h5,p,label,button,small,b,span,th,td,option,a,div.muted,div.mini,div.module-hint,div.status,div.item,div.stat,div.tag').forEach(translateElementText);
    root.querySelectorAll('input,textarea').forEach(el=>{
      if(el.placeholder){ if(!el.dataset.awcBasePlaceholder) el.dataset.awcBasePlaceholder=FINAL_NL[nrm(el.placeholder)] || el.placeholder; el.placeholder=convertText(el.dataset.awcBasePlaceholder); }
      if(el.value && ['button','submit','reset'].includes((el.type||'').toLowerCase())){ if(!el.dataset.awcBaseValue) el.dataset.awcBaseValue=FINAL_NL[nrm(el.value)] || el.value; el.value=convertText(el.dataset.awcBaseValue); }
    });
    document.getElementById('langNL')?.classList.toggle('lang-active',lang==='nl');
    document.getElementById('langEN')?.classList.toggle('lang-active',lang==='en');
    document.getElementById('heroLangNL')?.classList.toggle('active',lang==='nl');
    document.getElementById('heroLangEN')?.classList.toggle('active',lang==='en');
  }
  window.translateWholeApp = window.translateDOM = window.applyI18n = function(){ realtimeTranslate(document); };
  const _renderChecks=window.renderChecks; if(_renderChecks) window.renderChecks=function(){ _renderChecks(); realtimeTranslate(document); };
  const _renderWarehouseChecks=window.renderWarehouseChecks; if(_renderWarehouseChecks) window.renderWarehouseChecks=function(){ _renderWarehouseChecks(); realtimeTranslate(document); };
  const _renderRooms=window.renderRooms; if(_renderRooms) window.renderRooms=function(){ _renderRooms(); realtimeTranslate(document); };
  const _renderPersonnel=window.renderPersonnel; if(_renderPersonnel) window.renderPersonnel=function(){ _renderPersonnel(); realtimeTranslate(document); };
  const _renderAll=window.renderAll; if(_renderAll) window.renderAll=function(){ _renderAll(); realtimeTranslate(document); };
  const _show=window.show; if(_show) window.show=function(id,fromPop){ _show(id,fromPop); realtimeTranslate(document); };
  window.setLang=function(l){
    lang=l; localStorage.setItem(KEY+'lang',l);
    try{ initNavLabels(); }catch(e){}
    try{ renderChecks(); renderRooms(); renderWarehouseChecks(); renderPersonnel(); renderAll(); }catch(e){}
    const active=document.querySelector('.tab.active')?.id || (location.hash?location.hash.slice(1):'dashboard');
    if(document.getElementById(active)){ try{ window.show(active,true); }catch(e){} }
    realtimeTranslate(document);
  };
  window.installApp=async function(){
    const help=document.getElementById('installHelp');
    if(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches){ if(help){help.classList.add('show'); help.textContent=lang==='en'?'The app is already installed.':'De app is al geïnstalleerd.';} return; }
    if(deferredPrompt){ try{ deferredPrompt.prompt(); await deferredPrompt.userChoice; }catch(e){} deferredPrompt=null; return; }
    if(help){ help.classList.add('show'); help.textContent=lang==='en'?'The install button is not available yet. Open the browser menu ⋮ and choose “Install app” or “Add to home screen”.':'De installatieknop is nog niet beschikbaar. Open het browsermenu ⋮ en kies “App installeren” of “Toevoegen aan startscherm”.'; help.scrollIntoView({behavior:'smooth',block:'nearest'}); }
  };
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>realtimeTranslate(document),50));
})();

// PWA Builder ready registration: direct, stable and without URL version tricks.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' }).catch(console.warn);
  });
}

init();



/* === AWC PERSONEEL: NIET INGEROOSTERD ZICHTBAARHEID IN HETZELFDE KEUZEMENU === */
(function(){
  function normStatus(s){ return String(s||'').toLowerCase().trim(); }
  function isAbsentCore(s){ return ['verlof','ziek','te laat','afwezig'].includes(normStatus(s)); }
  function isNotScheduled(s){ return normStatus(s)==='niet ingeroosterd'; }
  window.awcPersonnelMode = function(p){ return (p && p.reportMode) || (document.getElementById('pers_report_mode')?.value) || 'absent'; };
  window.awcShowNotScheduled = function(mode){ return mode==='absent_with_unscheduled' || mode==='all'; };
  window.awcPeopleForOutput = function(p){
    const people=(p&&p.people)||[];
    const mode=window.awcPersonnelMode(p);
    if(mode==='all') return people;
    return people.filter(x => isAbsentCore(x.status) || (window.awcShowNotScheduled(mode) && isNotScheduled(x.status)));
  };
  window.personnelGroups = function(p){
    const people=(p&&p.people)||[];
    const mode=window.awcPersonnelMode(p);
    return {
      all: people,
      present: people.filter(x=>normStatus(x.status)==='aanwezig'),
      notScheduled: people.filter(x=>isNotScheduled(x.status)),
      notPresent: mode==='all' ? people.filter(x=>isAbsentCore(x.status) || isNotScheduled(x.status)) : window.awcPeopleForOutput(p)
    };
  };
  function labelPlain(x){ return (typeof personnelLinePlain==='function') ? personnelLinePlain(x) : `${x.name} - ${x.status}${x.note?' - '+x.note:''}`; }
  function labelWhats(x){ return (typeof personnelLineWhatsApp==='function') ? personnelLineWhatsApp(x) : `${x.name} - ${x.status}${x.note?' - '+x.note:''}`; }
  function cleanLabel(status){ return (typeof cleanStatusLabel==='function') ? cleanStatusLabel(status) : status; }
  window.textPersonnelPlain = function(p){
    const mode=window.awcPersonnelMode(p), list=window.awcPeopleForOutput(p);
    const title=lang==='en'?'AWC Staff check':'AWC Personeel check';
    const sectionTitle = mode==='all' ? (lang==='en'?'FULL STAFF LIST':'VOLLEDIGE PERSONEELSLIJST') : (window.awcShowNotScheduled(mode) ? (lang==='en'?'NOT PRESENT + NOT SCHEDULED':'AFWEZIG + NIET INGEROOSTERD') : (lang==='en'?'NOT PRESENT':'AFWEZIG / NIET AANWEZIG'));
    const none=lang==='en'?'No employees in this selection.':'Geen medewerkers in deze selectie.';
    let txt=`${title}\n${tr('Teamleider')}: ${p.lead||'-'}\n${tr('Shift')}: ${p.shift||'-'}\n${tr('Locatie')}: ${p.location||'-'}\n${tr('Status')||'Status'}: ${translateStatus(p.status)}\n\n${sectionTitle} (${list.length})\n`;
    txt += list.length ? list.map(labelPlain).join('\n') : none;
    txt += `\n\n${tr('Algemene opmerking')}: ${p.notes||'-'}`;
    return txt;
  };
  window.textPersonnelWhatsApp = function(p){
    const mode=window.awcPersonnelMode(p), list=window.awcPeopleForOutput(p);
    const title=lang==='en'?'AWC Staff check':'AWC Personeel check';
    const sectionTitle = mode==='all' ? (lang==='en'?'👥 Full staff list':'👥 Volledige personeelslijst') : (window.awcShowNotScheduled(mode) ? (lang==='en'?'❗ Not present + 📅 Not scheduled':'❗ Afwezig + 📅 Niet ingeroosterd') : (lang==='en'?'❗ Not present':'❗ Afwezig / niet aanwezig'));
    const none=lang==='en'?'No employees in this selection.':'Geen medewerkers in deze selectie.';
    let txt=`👥 ${title}\n${tr('Teamleider')}: ${p.lead||'-'}\n${tr('Shift')}: ${p.shift||'-'}\n${tr('Locatie')}: ${p.location||'-'}\n${tr('Status')||'Status'}: ${translateStatus(p.status)}\n\n${sectionTitle} (${list.length})\n`;
    txt += list.length ? list.map(labelWhats).join('\n') : none;
    txt += `\n\n${tr('Algemene opmerking')}: ${p.notes||'-'}`;
    return txt;
  };
  window.textPersonnel = window.textPersonnelPlain;
  window.pdfPersonnel = async function(p){
    const mode=window.awcPersonnelMode(p), list=window.awcPeopleForOutput(p);
    const d=doc(lang==='en'?'Staff check':'Personeel check', `${tr('Shift')}: ${p.shift||'-'} • ${tr('Locatie')}: ${p.location||'-'}`);
    let y=66;
    const sectionTitle = mode==='all' ? (lang==='en'?'Full staff list':'Volledige personeelslijst') : (window.awcShowNotScheduled(mode) ? (lang==='en'?'Not present + not scheduled':'Afwezig + niet ingeroosterd') : (lang==='en'?'Not present':'Afwezig / niet aanwezig'));
    y=addSection(d,lang==='en'?'Summary':'Samenvatting',y);
    y=addKeyValues(d,[[tr('Teamleider'),p.lead||'-'],[tr('Shift'),p.shift||'-'],[tr('Locatie'),p.location||'-'],[tr('Status')||'Status',translateStatus(p.status)],[sectionTitle,list.length],[tr('Algemene opmerking'),p.notes||'-']],y);
    y=addSection(d,sectionTitle,y);
    if(list.length){ list.forEach((x,i)=>{y=addKeyValues(d,[[`${i+1}. ${x.name}`,`${cleanLabel(x.status)}${x.note?' - '+x.note:''}`]],y);}); }
    else { y=addLines(d,[lang==='en'?'No employees in this selection.':'Geen medewerkers in deze selectie.'],y); }
    d.save(`AWC-personeel-${Date.now()}.pdf`);
  };
  window.mailPersonnel = function(){
    const p=currentPersonnel(); const count=window.awcPeopleForOutput(p).length;
    openMail('pers',`AWC ${tr('Personeel check')} – ${smartDate()} – ${p.location||''} – ${count} ${lang==='en'?'selected':'geselecteerd'}`,window.textPersonnelPlain(p)+mailFooter([]));
  };
  const oldExcelFlatten = window.excelFlatten;
  window.excelFlatten = function(t,data){
    if(t==='personnel'){
      const rows=[];
      (data||[]).forEach(o=>window.awcPeopleForOutput(o).forEach(p=>rows.push({Datum:o.timestamp,Teamleider:o.lead,Shift:o.shift,Locatie:o.location,Status:o.status,Medewerker:p.name,Aanwezigheidsstatus:cleanLabel(p.status),Opmerking:p.note||'',AlgemeneOpmerking:o.notes||''})));
      return rows;
    }
    return oldExcelFlatten ? oldExcelFlatten(t,data) : data;
  };
  const oldUpdateWA=window.updateWA;
  window.updateWA=function(){
    const active=document.querySelector('.tab.active')?.id;
    if(active==='personnel'){
      const txt=window.textPersonnelWhatsApp(currentPersonnel());
      const wa=document.getElementById('wa'); if(wa) wa.href='https://wa.me/?text='+encodeURIComponent(txt+'\n\n'+location.href);
      return;
    }
    if(oldUpdateWA) return oldUpdateWA();
  };
})();
/* === END AWC PERSONEEL ZICHTBAARHEID === */

