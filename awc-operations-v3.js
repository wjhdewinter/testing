/* AWC Tool 2.0 - operational collaboration upgrades */
(function(){
'use strict';
const URL='https://ghhcnzjdzmuupigspppl.supabase.co';
const KEY='sb_publishable__tat43V0qbu_yu3lKiIFaA_w0nseD02';
const REC='awc_tool_records', ACT='awc_tool_activity', BACKUPS='awc_tool_backups';
let sb=null, user=null, role='', activityChannel=null;
const moduleNames={pallets:'Pallets',personnel:'Personeel',warehouse:'Warehouse',orders:'Orders',machines:'Machines',incidents:'Incidenten',damage:'Schade',manco:'Manco',scans:'Openstaande zendingen'};
const workflowLabels={open:'Open',in_behandeling:'In behandeling',afgerond:'Afgerond'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function css(){
 const st=document.createElement('style'); st.textContent=`
 #awcCloudState{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:9px 12px;font-size:13px;font-weight:900;background:#dcfce7;color:#166534;border:1px solid #bbf7d0}.awcOffline{background:#fff7ed!important;color:#9a3412!important;border-color:#fed7aa!important}
 #awcTeamUnread{display:none;min-width:19px;height:19px;padding:0 5px;margin-left:6px;border-radius:999px;background:#ef4444;color:#fff;font-size:11px;line-height:19px;text-align:center}
 .awcWorkflow{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:10px;padding-top:9px;border-top:1px dashed #e5e7eb}.awcWorkflow b{font-size:12px}.awcWfBtn{border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:6px 9px;font-size:12px;font-weight:800;cursor:pointer}.awcWfBtn.active{background:#111827;color:#fff;border-color:#111827}
 #awcCentralSummary{margin:0 0 16px}.awcOpsStats{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px}.awcOpsStat{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:13px}.awcOpsStat small{color:#64748b;font-weight:800}.awcOpsStat b{display:block;font-size:25px;margin-top:5px}.awcOpsHead{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
 #awcAdminModal{position:fixed;inset:0;background:#0009;z-index:10020;display:none;align-items:center;justify-content:center;padding:14px}#awcAdminModal.open{display:flex}.awcAdminCard{width:min(900px,96vw);max-height:92vh;overflow:auto;background:#fff;border-radius:18px;padding:18px}.awcAdminGrid{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;padding:9px 0;border-bottom:1px solid #e5e7eb}.awcAdminGrid select{min-height:40px;padding:7px}.awcAdminGrid button{border:0;border-radius:9px;padding:8px 10px;font-weight:800;cursor:pointer}.awcAdminTools{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.awcAdminTools button{border:0;border-radius:10px;padding:10px 12px;background:#111827;color:#fff;font-weight:800;cursor:pointer}.awcAdminTools button.orange{background:#ff7a00;color:#111}
 .awcTrashFilters{display:flex;gap:8px;flex-wrap:wrap;margin:9px 0}.awcTrashFilters input,.awcTrashFilters select{min-height:42px;padding:8px 10px;border-radius:10px;border:1px solid #cbd5e1;width:auto;flex:1;min-width:150px}
 @media(max-width:650px){.awcAdminGrid{grid-template-columns:1fr}.awcOpsStats{grid-template-columns:repeat(2,1fr)}}`;
 document.head.appendChild(st);
}

async function member(){
 const email=(user?.email||'').toLowerCase(); if(!email)return;
 const {data}=await sb.from('awc_app_members').select('role,active').ilike('email',email).maybeSingle();
 role=data?.active?(data.role||''):'';
 if(role==='beheerder') addAdminButton();
}

function addCloudState(){
 const quick=document.querySelector('.top .quick'); if(!quick||document.getElementById('awcCloudState'))return;
 const s=document.createElement('span'); s.id='awcCloudState'; quick.prepend(s); updateCloudState();
 window.addEventListener('online',updateCloudState); window.addEventListener('offline',updateCloudState);
 window.addEventListener('awc-cloud-queue-changed',updateCloudState);
}
function pendingCount(){try{return JSON.parse(localStorage.getItem('awc_v20_cloud_queue_v1')||'[]').length}catch{return 0}}
function updateCloudState(){const el=document.getElementById('awcCloudState');if(!el)return;const p=pendingCount();const on=navigator.onLine;el.classList.toggle('awcOffline',!on||p>0);el.textContent=on?(p?`⏳ ${p} wacht op sync`:'● Online · centraal opgeslagen'):`○ Offline · ${p} wacht op sync`;}

window.awcWorkflowButtons=function(module,row){
 if(module==='pallets'||module==='personnel')return '';
 const c=row?.__awc_cloud||{}; const cur=c.workflow_status||'open'; const id=row?.id||c.record_id||''; if(!id)return '';
 return `<div class="awcWorkflow"><b>Opvolging:</b>${Object.entries(workflowLabels).map(([k,l])=>`<button type="button" class="awcWfBtn ${cur===k?'active':''}" onclick="event.stopPropagation();window.awcSetWorkflow('${esc(module)}','${esc(id)}','${k}')">${l}</button>`).join('')}</div>`;
};
window.awcSetWorkflow=async function(module,id,status){
 if(!user||!navigator.onLine){alert('Voor een statuswijziging is internet nodig.');return}
 const email=(user.email||'').toLowerCase();
 const {error}=await sb.from(REC).update({workflow_status:status,status_updated_at:new Date().toISOString(),status_updated_by:email,updated_at:new Date().toISOString(),actor_email:email}).eq('module',module).eq('record_id',String(id));
 if(error){alert('Status wijzigen mislukt: '+error.message);return}
 await sb.from(ACT).insert({user_id:user.id,actor_email:email,module,action:'status gewijzigd',description:`${moduleNames[module]||module}: ${workflowLabels[status]}`,payload:{id,workflow_status:status}});
 setTimeout(()=>{try{window.renderAll?.()}catch{}},500);
};

async function dashboard(){
 if(!user)return;
 const [{data:rows},{data:todayAct}]=await Promise.all([
  sb.from(REC).select('module,data,workflow_status,updated_at').is('deleted_at',null).limit(1500),
  sb.from(ACT).select('id').gte('created_at',new Date(new Date().setHours(0,0,0,0)).toISOString()).limit(1000)
 ]);
 const all=rows||[]; const counts={}; all.forEach(r=>counts[r.module]=(counts[r.module]||0)+1);
 const scans=all.find(r=>r.module==='scans')?.data?.items?.length||0;
 const open=all.filter(r=>!['pallets','personnel','scans'].includes(r.module)&&r.workflow_status!=='afgerond').length;
 const todayChecks=all.filter(r=>['warehouse','machines','personnel'].includes(r.module)&&new Date(r.updated_at).toDateString()===new Date().toDateString()).length;
 let box=document.getElementById('awcCentralSummary'); if(!box){box=document.createElement('div');box.id='awcCentralSummary';box.className='card';document.querySelector('#dashboard .quickcards')?.after(box)}
 box.innerHTML=`<div class="awcOpsHead"><div><h3 style="margin:0">Centraal operationeel overzicht</h3><div class="muted">Live gegevens van alle ingelogde apparaten</div></div><button class="smallbtn" onclick="window.awcRefreshOperations()">Vernieuwen</button></div><div class="awcOpsStats">
 <div class="awcOpsStat"><small>Openstaande zendingen</small><b>${scans}</b></div><div class="awcOpsStat"><small>Open opvolging</small><b>${open}</b></div><div class="awcOpsStat"><small>Controles vandaag</small><b>${todayChecks}</b></div><div class="awcOpsStat"><small>Schades</small><b>${counts.damage||0}</b></div><div class="awcOpsStat"><small>Incidenten</small><b>${counts.incidents||0}</b></div><div class="awcOpsStat"><small>Teamacties vandaag</small><b>${todayAct?.length||0}</b></div></div>`;
}
window.awcRefreshOperations=dashboard;

function unreadBadge(){
 const btn=document.getElementById('awcTeamBtn'); if(!btn)return;
 let b=document.getElementById('awcTeamUnread'); if(!b){b=document.createElement('span');b.id='awcTeamUnread';btn.appendChild(b)}
 refreshUnread();
 btn.addEventListener('click',()=>{localStorage.setItem('awc_team_seen_at',new Date().toISOString());setUnread(0)});
 if(activityChannel)return;
 activityChannel=sb.channel('awc-ops-unread').on('postgres_changes',{event:'INSERT',schema:'public',table:ACT},()=>{refreshUnread();dashboard()}).subscribe();
}
async function refreshUnread(){const seen=localStorage.getItem('awc_team_seen_at')||new Date(Date.now()-86400000).toISOString();const {count}=await sb.from(ACT).select('id',{count:'exact',head:true}).gt('created_at',seen);setUnread(count||0)}
function setUnread(n){const b=document.getElementById('awcTeamUnread');if(!b)return;b.textContent=n>99?'99+':String(n);b.style.display=n?'inline-block':'none'}

function addTrashFilters(){
 const panel=document.getElementById('awcTrashPanel'); if(!panel||panel.querySelector('.awcTrashFilters'))return;
 const f=document.createElement('div');f.className='awcTrashFilters';f.innerHTML=`<input id="awcTrashSearch" placeholder="Zoek in prullenbak"><select id="awcTrashModule"><option value="">Alle modules</option>${Object.entries(moduleNames).filter(([k])=>k!=='scans').map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select>`;
 panel.querySelector('.awcRetention')?.after(f);
 const apply=()=>{const q=(document.getElementById('awcTrashSearch')?.value||'').toLowerCase();const m=document.getElementById('awcTrashModule')?.value||'';panel.querySelectorAll('.awcTrashItem').forEach(el=>{const okq=!q||(el.dataset.search||el.textContent.toLowerCase()).includes(q);const okm=!m||el.dataset.module===m;el.style.display=okq&&okm?'':'none'})};
 f.addEventListener('input',apply);f.addEventListener('change',apply);
}

function addAdminButton(){
 const bar=document.querySelector('#awcTeamModal .awcCloudToolbar'); if(!bar||document.getElementById('awcAdminBtn'))return;
 const b=document.createElement('button');b.id='awcAdminBtn';b.type='button';b.className='awcCloudAction';b.textContent='Beheer';b.onclick=openAdmin;bar.prepend(b);
 makeAdminModal();
}
function makeAdminModal(){if(document.getElementById('awcAdminModal'))return;const m=document.createElement('div');m.id='awcAdminModal';m.innerHTML=`<div class="awcAdminCard"><div class="awcCloudHead"><div><h2 style="margin:0">AWC Beheer</h2><div class="awcCloudMuted">Gebruikers, centrale data en back-ups</div></div><button class="awcCloudClose" onclick="document.getElementById('awcAdminModal').classList.remove('open')">✕</button></div><div style="padding:12px;border:1px solid #dfe5ea;border-radius:12px;margin:12px 0"><b>Nieuwe gebruiker uitnodigen</b><div class="awcCloudMuted" style="margin:4px 0 10px">Vul het e-mailadres in. De collega ontvangt een uitnodiging en kan daarna inloggen in de nieuwe AWC Tool.</div><div class="awcAdminGrid"><input id="awcInviteEmail" type="email" autocomplete="email" placeholder="naam@bedrijf.nl"><select id="awcInviteRole"><option value="medewerker">Medewerker</option><option value="beheerder">Beheerder</option></select><button class="orange" onclick="window.awcInviteUser()">Uitnodiging versturen</button></div><div id="awcInviteStatus" class="awcCloudMuted" style="margin-top:8px"></div></div><div class="awcAdminTools"><button onclick="window.awcExportAllExcel()">Alles naar Excel</button><button onclick="window.awcDownloadCloudBackup()">Backup downloaden</button><button onclick="window.awcLoadBackups()">Backups bekijken</button></div><div id="awcAdminMembers"></div><div id="awcBackupList" style="margin-top:14px"></div></div>`;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')})}
async function openAdmin(){if(role!=='beheerder')return;makeAdminModal();document.getElementById('awcAdminModal').classList.add('open');await loadMembers();await loadBackups()}
async function loadMembers(){const box=document.getElementById('awcAdminMembers');box.innerHTML='<div class="muted">Gebruikers laden…</div>';const {data,error}=await sb.functions.invoke('awc-admin-users',{body:{action:'list'}});if(error||data?.error){box.innerHTML=`<div class="notice err">${esc(data?.error||error?.message||'Fout')}</div>`;return}box.innerHTML='<h3>Gebruikers</h3>'+data.members.map(m=>`<div class="awcAdminGrid"><div><b>${esc(m.email)}</b><div class="muted">${m.active?'Actief':'Geblokkeerd'}</div></div><select id="role_${btoa(m.email).replace(/=/g,'')}"><option value="medewerker" ${m.role==='medewerker'?'selected':''}>Medewerker</option><option value="beheerder" ${m.role==='beheerder'?'selected':''}>Beheerder</option></select><button onclick="window.awcSaveMember('${esc(m.email)}','${btoa(m.email).replace(/=/g,'')}')">${m.active?'Opslaan':'Activeren'}</button></div>`).join('')}
window.awcSaveMember=async function(email,key){const sel=document.getElementById('role_'+key);const active=confirm(`Gebruiker ${email} actief houden/activeren?\nKies Annuleren om de gebruiker te deactiveren.`);const {data,error}=await sb.functions.invoke('awc-admin-users',{body:{action:'update',email,role:sel?.value||'medewerker',active}});if(error||data?.error)alert(data?.error||error.message);else loadMembers()};
window.awcInviteUser=async function(){const input=document.getElementById('awcInviteEmail');const roleEl=document.getElementById('awcInviteRole');const status=document.getElementById('awcInviteStatus');const email=(input?.value||'').trim().toLowerCase();const selectedRole=roleEl?.value||'medewerker';if(!email||!email.includes('@')){if(status)status.textContent='Vul een geldig e-mailadres in.';input?.focus();return}if(status)status.textContent='Uitnodiging wordt verstuurd…';const {data,error}=await sb.functions.invoke('awc-admin-users',{body:{action:'invite',email,role:selectedRole}});if(error||data?.error){if(status)status.textContent='Uitnodigen mislukt: '+(data?.error||error?.message||'onbekende fout');return}if(input)input.value='';if(roleEl)roleEl.value='medewerker';if(status)status.textContent=`Uitnodiging verstuurd naar ${email}. De gebruiker staat nu in het Team-overzicht.`;await loadMembers()};

window.awcExportAllExcel=function(){
  try{
    if(typeof window.exportAllExcel==='function') window.exportAllExcel();
    else alert('Excel export is op dit apparaat niet beschikbaar.');
  }catch(e){ alert('Excel export kon niet worden gestart.'); }
};

window.awcDownloadCloudBackup=async function(){const {data,error}=await sb.functions.invoke('awc-backup',{body:{}});if(error||data?.error){alert(data?.error||error.message);return}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download=`awc-cloud-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000)};
async function loadBackups(){if(role!=='beheerder')return;const box=document.getElementById('awcBackupList');if(!box)return;const {data,error}=await sb.from(BACKUPS).select('id,backup_date,created_at').order('backup_date',{ascending:false}).limit(31);if(error){box.innerHTML='<div class="muted">Backups konden niet worden geladen.</div>';return}box.innerHTML=`<h3>Automatische dagelijkse backups</h3><div class="muted">${data?.length||0} snapshot(s), maximaal 30 dagen bewaard.</div>`+(data||[]).slice(0,10).map(x=>`<div class="item"><b>${esc(x.backup_date)}</b><div class="muted">${new Date(x.created_at).toLocaleString('nl-NL')}</div></div>`).join('')}
window.awcLoadBackups=loadBackups;

function realtimeRecords(){sb.channel('awc-ops-dashboard').on('postgres_changes',{event:'*',schema:'public',table:REC},()=>{dashboard();setTimeout(()=>window.renderAll?.(),300)}).subscribe()}

async function init(){
 css(); addCloudState(); addTrashFilters();
 if(!window.supabase?.createClient)return;
 sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const {data}=await sb.auth.getSession(); user=data?.session?.user||null; if(!user)return;
 await member(); unreadBadge(); dashboard(); realtimeRecords();
 setTimeout(()=>{addTrashFilters();try{window.renderAll?.()}catch{}},800);
 const observer=new MutationObserver(()=>addTrashFilters());const panel=document.getElementById('awcTrashPanel');if(panel)observer.observe(panel,{childList:true,subtree:true});
 sb.auth.onAuthStateChange(async(_e,s)=>{user=s?.user||null;if(user){await member();dashboard();refreshUnread()}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
