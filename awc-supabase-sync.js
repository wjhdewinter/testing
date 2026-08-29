/* AWC Tool 2.0 - Supabase team activity sync
   Keeps the existing localStorage workflow intact and adds a shared audit/activity feed.
*/
(function () {
  'use strict';

  const SUPABASE_URL = 'https://ghhcnzjdzmuupigspppl.supabase.co';
  const SUPABASE_KEY = 'sb_publishable__tat43V0qbu_yu3lKiIFaA_w0nseD02';
  const ACTIVITY_TABLE = 'awc_tool_activity';
  const RECORDS_TABLE = 'awc_tool_records';
  const HISTORY_MODULES = ['pallets','personnel','warehouse','orders','machines','incidents','damage','manco'];

  let client = null;
  let currentUser = null;
  let realtimeChannel = null;
  let hooksInstalled = false;
  let memberRole = '';
  let recordsChannel = null;
  let activityDays = 1;
  let activityModule = '';

  const moduleNames = {
    pallets: 'Wegen / pallets',
    personnel: 'Personeel',
    warehouse: 'Warehouse check',
    orders: 'Orders',
    machines: 'Machines',
    incidents: 'Incidenten / BHV',
    damage: 'Schade',
    manco: 'Manco',
    scans: 'Openstaande zendingen'
  };

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[ch]));
  }

  function safePayload(value, depth = 0) {
    if (depth > 8) return '[te diep genest]';
    if (value == null || typeof value === 'number' || typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      if (value.startsWith('data:image/')) return '[afbeelding niet in log opgeslagen]';
      return value;
    }
    if (Array.isArray(value)) return value.map(v => safePayload(v, depth + 1));
    if (typeof value === 'object') {
      const out = {};
      Object.entries(value).forEach(([k, v]) => {
        if (/photo|image|signature|sig|base64/i.test(k)) return;
        out[k] = safePayload(v, depth + 1);
      });
      return out;
    }
    return String(value);
  }

  function describe(module, data) {
    const d = data || {};
    const interesting = [
      d.user, d.name, d.employee, d.person, d.order, d.orderNo, d.orderNumber,
      d.shipment, d.shipmentNumber, d.number, d.location, d.room, d.type
    ].filter(Boolean);
    const base = moduleNames[module] || module || 'AWC Tool';
    return interesting.length ? `${base}: ${interesting.slice(0, 2).join(' - ')}` : `${base} opgeslagen`;
  }

  async function cloudLog(module, action, description, payload) {
    if (!client || !currentUser) return;
    const row = {
      user_id: currentUser.id,
      actor_email: (currentUser.email || '').toLowerCase(),
      module: module || 'algemeen',
      action: action || 'opgeslagen',
      description: description || '',
      payload: safePayload(payload || {})
    };
    const { error } = await client.from(ACTIVITY_TABLE).insert(row);
    if (error) console.warn('AWC cloudlog:', error.message);
  }

  function makeUi() {
    if (document.getElementById('awcTeamBtn')) return;

    const style = document.createElement('style');
    style.textContent = `
      #awcTeamBtn{position:fixed;right:14px;top:82px;z-index:9997;border:0;border-radius:999px;
        padding:11px 15px;background:#0f172a;color:#fff;font-weight:700;box-shadow:0 6px 22px #0004;cursor:pointer}
      #awcTeamBtn .dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;margin-right:7px}
      #awcTeamBtn.online .dot{background:#22c55e}
      #awcTeamModal,#awcAuthModal{position:fixed;inset:0;z-index:10000;background:#0009;display:none;
        align-items:center;justify-content:center;padding:14px}
      #awcTeamModal.open,#awcAuthModal.open{display:flex}
      .awcCloudCard{width:min(760px,96vw);max-height:90vh;overflow:auto;background:#fff;color:#111827;border-radius:18px;
        box-shadow:0 24px 80px #0007;padding:18px}
      .awcCloudHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
      .awcCloudHead h2{margin:0;font-size:22px}
      .awcCloudClose{border:0;background:#eef2f7;border-radius:10px;padding:8px 11px;font-size:18px;cursor:pointer}
      .awcCloudMuted{color:#64748b;font-size:13px}
      .awcCloudLogin{display:grid;gap:10px;margin-top:14px}
      .awcCloudLogin input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #cbd5e1;border-radius:10px;font-size:16px}
      .awcCloudLogin button,.awcCloudAction{border:0;border-radius:10px;padding:11px 14px;background:#0f172a;color:#fff;font-weight:700;cursor:pointer}
      #awcAuthError{color:#b91c1c;min-height:20px;font-size:14px}
      .awcActivity{padding:12px 0;border-bottom:1px solid #e5e7eb}
      .awcActivity:last-child{border-bottom:0}
      .awcActivityTop{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
      .awcActivityTitle{font-weight:750}
      .awcActivityMeta{font-size:12px;color:#64748b;margin-top:4px}
      .awcActivity{cursor:pointer}
      .awcActivity:hover{background:#f8fafc}
      .awcDetail{display:none;margin-top:12px;padding:12px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;cursor:default}
      .awcDetail.open{display:block}
      .awcDetailGrid{display:grid;grid-template-columns:minmax(130px,190px) 1fr;gap:7px 12px;font-size:14px}
      .awcDetailKey{font-weight:700;color:#334155;word-break:break-word}
      .awcDetailVal{white-space:pre-wrap;word-break:break-word}
      .awcDetailSection{margin:10px 0 4px;font-weight:800;color:#0f172a}
      .awcToggleHint{font-size:12px;color:#2563eb;margin-top:6px;font-weight:700}
      .awcCloudToolbar{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 4px}
      .awcDeleteActivity{border:0;border-radius:8px;padding:6px 9px;background:#fee2e2;color:#991b1b;font-weight:800;cursor:pointer;font-size:12px}
      .awcRetention{margin:8px 0 12px;padding:9px 11px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;color:#1e3a8a;font-size:13px}
      .awcTeamFilters{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin:0 0 12px}.awcFilterBtn,.awcModuleFilter{border:1px solid #cbd5e1;background:white;border-radius:9px;padding:8px 10px;font-weight:700}.awcFilterBtn.active{background:#0f172a;color:white}.awcActivityBadge{display:inline-block;border-radius:999px;padding:3px 7px;font-size:11px;font-weight:800;margin-right:5px}.awcBadgeNew{background:#dcfce7;color:#166534}.awcBadgeChange{background:#dbeafe;color:#1e40af}.awcBadgeDelete{background:#fee2e2;color:#991b1b}
      @media(max-width:600px){
        #awcTeamBtn{right:9px;top:74px;padding:10px 13px}
        .awcCloudCard{padding:14px;border-radius:14px}
      }`;
    document.head.appendChild(style);

    document.body.insertAdjacentHTML('beforeend', `
      <button id="awcTeamBtn" type="button" title="Teamactiviteit"><span class="dot"></span>Team</button>

      <div id="awcAuthModal">
        <div class="awcCloudCard">
          <div class="awcCloudHead"><h2>AWC Team – inloggen</h2></div>
          <div class="awcCloudMuted">Gebruik hetzelfde account als bij Dockregistratie. Zo kunnen wijzigingen veilig aan de juiste collega worden gekoppeld.</div>
          <div class="awcCloudLogin">
            <input id="awcAuthEmail" type="email" autocomplete="username" placeholder="E-mailadres">
            <input id="awcAuthPassword" type="password" autocomplete="current-password" placeholder="Wachtwoord">
            <button id="awcAuthLogin" type="button">Inloggen</button>
            <div id="awcAuthError"></div>
          </div>
        </div>
      </div>

      <div id="awcTeamModal">
        <div class="awcCloudCard">
          <div class="awcCloudHead">
            <div><h2>Teamactiviteit</h2><div id="awcTeamUser" class="awcCloudMuted"></div></div>
            <button id="awcTeamClose" class="awcCloudClose" type="button">✕</button>
          </div>
          <div class="awcCloudToolbar">
            <button id="awcTeamRefresh" class="awcCloudAction" type="button">Vernieuwen</button>
            <button id="awcTeamClear" class="awcCloudAction" type="button" style="display:none;background:#b91c1c">Teamlog wissen</button>
            <button id="awcTeamLogout" class="awcCloudAction" type="button">Uitloggen</button>
          </div>
          <div class="awcRetention"><b>Teamoverzicht</b> toont recente wijzigingen. De echte gegevens staan centraal en verschijnen ook in de betreffende modules. Teamactiviteit wordt 30 dagen bewaard.</div>
          <div class="awcTeamFilters">
            <button type="button" class="awcFilterBtn active" data-days="1">Vandaag</button>
            <button type="button" class="awcFilterBtn" data-days="7">Deze week</button>
            <button type="button" class="awcFilterBtn" data-days="30">30 dagen</button>
            <select id="awcModuleFilter" class="awcModuleFilter">
              <option value="">Alle modules</option>
              <option value="warehouse">Warehouse</option>
              <option value="personnel">Personeel</option>
              <option value="scans">Openstaande zendingen</option>
              <option value="orders">Orders</option>
              <option value="pallets">Pallets</option>
              <option value="machines">Machines</option>
              <option value="incidents">Incidenten</option>
              <option value="damage">Schade</option>
              <option value="manco">Manco</option>
            </select>
          </div>
          <div id="awcActivityList"><div class="awcCloudMuted">Activiteit laden…</div></div>
        </div>
      </div>
    `);

    document.getElementById('awcTeamBtn').addEventListener('click', async () => {
      if (!currentUser) {
        document.getElementById('awcAuthModal').classList.add('open');
        return;
      }
      document.getElementById('awcTeamModal').classList.add('open');
      await loadActivity();
    });
    document.getElementById('awcTeamClose').addEventListener('click', () => document.getElementById('awcTeamModal').classList.remove('open'));
    document.getElementById('awcTeamRefresh').addEventListener('click', loadActivity);
    document.getElementById('awcTeamClear').addEventListener('click', clearActivityLog);
    document.querySelectorAll('.awcFilterBtn').forEach(btn => btn.addEventListener('click', () => {
      activityDays = Number(btn.dataset.days || 1);
      document.querySelectorAll('.awcFilterBtn').forEach(b => b.classList.toggle('active', b === btn));
      loadActivity();
    }));
    document.getElementById('awcModuleFilter').addEventListener('change', e => {
      activityModule = e.target.value || '';
      loadActivity();
    });
    document.getElementById('awcTeamLogout').addEventListener('click', async () => {
      await client.auth.signOut();
      currentUser = null;
      setStatus(false);
      document.getElementById('awcTeamModal').classList.remove('open');
      document.getElementById('awcAuthModal').classList.add('open');
    });
    document.getElementById('awcAuthLogin').addEventListener('click', login);
    document.getElementById('awcAuthPassword').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  }

  function setStatus(online) {
    const btn = document.getElementById('awcTeamBtn');
    if (btn) btn.classList.toggle('online', !!online);
    const u = document.getElementById('awcTeamUser');
    if (u) u.textContent = currentUser?.email ? `Ingelogd: ${currentUser.email}` : 'Niet ingelogd';
  }

  async function memberIsActive() {
    const email = (currentUser?.email || '').toLowerCase();
    if (!email) return false;
    const { data, error } = await client
      .from('awc_app_members')
      .select('email,active,role')
      .ilike('email', email)
      .maybeSingle();
    if (error) return false;
    memberRole = data?.role || '';
    const clearBtn = document.getElementById('awcTeamClear');
    if (clearBtn) clearBtn.style.display = memberRole === 'beheerder' ? '' : 'none';
    return !!data?.active;
  }

  async function login() {
    const email = document.getElementById('awcAuthEmail').value.trim();
    const password = document.getElementById('awcAuthPassword').value;
    const err = document.getElementById('awcAuthError');
    err.textContent = '';
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      err.textContent = 'Inloggen mislukt. Controleer e-mailadres en wachtwoord.';
      return;
    }
    currentUser = data.user;
    if (!(await memberIsActive())) {
      await client.auth.signOut();
      currentUser = null;
      err.textContent = 'Dit account heeft geen actieve toegang tot de AWC app.';
      return;
    }
    document.getElementById('awcAuthModal').classList.remove('open');
    setStatus(true);
    installHooks();
    subscribeActivity();
    subscribeCentralRecords();
    await migrateLocalHistoryOnce();
    await hydrateCentralData();
    await loadActivity();
  }

  function fmtTime(value) {
    try {
      return new Intl.DateTimeFormat('nl-NL', {
        dateStyle: 'short', timeStyle: 'short'
      }).format(new Date(value));
    } catch (_) { return value || ''; }
  }

  function labelKey(key) {
    const labels = {
      date:'Datum', time:'Tijd', timestamp:'Tijdstip', savedAt:'Opgeslagen op', user:'Medewerker',
      name:'Naam', email:'E-mail', location:'Locatie', room:'Ruimte', order:'Order', orderNo:'Ordernummer',
      orderNumber:'Ordernummer', shipment:'Zending', shipmentNumber:'Zendingnummer', code:'Zendingnummer',
      status:'Status', note:'Opmerking', notes:'Opmerkingen', remark:'Opmerking', remarks:'Opmerkingen',
      type:'Type', amount:'Aantal', quantity:'Aantal', weight:'Gewicht', net:'Netto', gross:'Bruto',
      length:'Lengte', width:'Breedte', height:'Hoogte', items:'Zendingen / regels'
    };
    if (labels[key]) return labels[key];
    return String(key).replace(/_/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase());
  }

  function scalar(value) {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? 'Ja' : 'Nee';
    return String(value);
  }

  function renderObject(obj, level = 0) {
    if (obj === null || obj === undefined) return '<div class="awcDetailVal">-</div>';
    if (Array.isArray(obj)) {
      if (!obj.length) return '<div class="awcDetailVal">Geen regels</div>';
      return obj.map((item, i) => {
        if (item && typeof item === 'object') {
          return `<div class="awcDetailSection">Regel ${i + 1}</div><div class="awcDetailGrid">${renderPairs(item, level + 1)}</div>`;
        }
        return `<div class="awcDetailVal">${esc(i + 1)}. ${esc(scalar(item))}</div>`;
      }).join('');
    }
    if (typeof obj === 'object') return `<div class="awcDetailGrid">${renderPairs(obj, level + 1)}</div>`;
    return `<div class="awcDetailVal">${esc(scalar(obj))}</div>`;
  }

  function renderPairs(obj, level = 0) {
    return Object.entries(obj || {}).map(([key, value]) => {
      if (value && typeof value === 'object') {
        return `<div class="awcDetailKey">${esc(labelKey(key))}</div><div class="awcDetailVal">${renderObject(value, level + 1)}</div>`;
      }
      return `<div class="awcDetailKey">${esc(labelKey(key))}</div><div class="awcDetailVal">${esc(scalar(value))}</div>`;
    }).join('');
  }

  function toggleActivityDetail(id) {
    const el = document.getElementById(`awc-detail-${id}`);
    if (el) el.classList.toggle('open');
  }


  function appPrefix() {
    try { return typeof KEY !== 'undefined' ? KEY : 'awc_v20_'; } catch (_) { return 'awc_v20_'; }
  }

  function localHistory(module) {
    try { return JSON.parse(localStorage.getItem(appPrefix() + module) || '[]'); } catch (_) { return []; }
  }

  function currentScansPayload() {
    try {
      if (typeof window.currentScanReport === 'function') return window.currentScanReport();
    } catch (_) {}
    try {
      const key = appPrefix() + 'open_shipments_full_pro_v1';
      return { items: JSON.parse(localStorage.getItem(key) || '[]') };
    } catch (_) { return { items: [] }; }
  }

  async function upsertCentralRecord(module, record) {
    if (!client || !currentUser || !record) return;
    const recordId = String(record.id ?? record.record_id ?? (module === 'scans' ? 'current' : ''));
    if (!recordId) return;
    const row = {
      module,
      record_id: recordId,
      data: safePayload(record),
      actor_email: (currentUser.email || '').toLowerCase(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    const { error } = await client.from(RECORDS_TABLE).upsert(row, { onConflict: 'module,record_id' });
    if (error) console.warn('AWC centrale database:', error.message);
  }

  async function syncCurrentScans() {
    const report = currentScansPayload();
    await upsertCentralRecord('scans', { ...report, id: 'current' });
  }

  async function migrateLocalHistoryOnce() {
    if (!client || !currentUser) return;
    const flag = appPrefix() + 'cloud_records_migrated_v1_' + currentUser.id;
    if (localStorage.getItem(flag) === '1') return;
    for (const module of HISTORY_MODULES) {
      const rows = localHistory(module);
      for (const row of rows) {
        if (row?.id != null) await upsertCentralRecord(module, row);
      }
    }
    const scans = currentScansPayload();
    if (Array.isArray(scans?.items) && scans.items.length) {
      await upsertCentralRecord('scans', { ...scans, id: 'current' });
    }
    localStorage.setItem(flag, '1');
  }

  async function refreshCentralModule(module) {
    if (!client || !currentUser) return;
    if (module === 'scans') {
      const { data } = await client.from(RECORDS_TABLE)
        .select('data').eq('module','scans').eq('record_id','current').is('deleted_at', null).maybeSingle();
      if (data?.data?.items && typeof window.awcApplyCloudScans === 'function') {
        window.awcApplyCloudScans(data.data.items);
      }
      return;
    }
    if (!HISTORY_MODULES.includes(module)) return;
    const { data, error } = await client.from(RECORDS_TABLE)
      .select('data,updated_at').eq('module', module).is('deleted_at', null)
      .order('updated_at', { ascending: false }).limit(500);
    if (error) return;
    const cloudRows = (data || []).map(x => x.data).filter(Boolean);
    const localRows = localHistory(module);
    const byId = new Map();
    [...localRows, ...cloudRows].forEach(row => {
      const id = String(row?.id ?? '');
      if (id) byId.set(id, row);
    });
    const rows = [...byId.values()].sort((a,b) => String(b.timestamp||b.savedAt||'').localeCompare(String(a.timestamp||a.savedAt||'')));
    localStorage.setItem(appPrefix() + module, JSON.stringify(rows));
    try { if (typeof window.renderAll === 'function') window.renderAll(); } catch (_) {}
  }

  async function hydrateCentralData() {
    for (const module of HISTORY_MODULES) await refreshCentralModule(module);
    await refreshCentralModule('scans');
  }

  function subscribeCentralRecords() {
    if (!client || !currentUser || recordsChannel) return;
    recordsChannel = client.channel('awc-tool-central-records')
      .on('postgres_changes', { event: '*', schema: 'public', table: RECORDS_TABLE }, payload => {
        const module = payload?.new?.module || payload?.old?.module;
        if (module) refreshCentralModule(module);
      })
      .subscribe();
  }

  async function deleteActivity(id) {
    if (memberRole !== 'beheerder') return;
    if (!confirm('Deze Team-melding verwijderen?')) return;
    const { error } = await client.from(ACTIVITY_TABLE).delete().eq('id', id);
    if (error) alert('Verwijderen mislukt: ' + error.message);
    else loadActivity();
  }

  async function clearActivityLog() {
    if (memberRole !== 'beheerder') return;
    if (!confirm('Alle Teamactiviteit wissen? De centrale registraties blijven bewaard.')) return;
    const { error } = await client.from(ACTIVITY_TABLE).delete().lt('created_at', '9999-12-31T23:59:59Z');
    if (error) alert('Teamlog wissen mislukt: ' + error.message);
    else loadActivity();
  }

  async function loadActivity() {
    if (!client || !currentUser) return;
    const list = document.getElementById('awcActivityList');
    list.innerHTML = '<div class="awcCloudMuted">Activiteit laden…</div>';
    let q = client
      .from(ACTIVITY_TABLE)
      .select('id,created_at,actor_email,module,action,description,payload')
      .gte('created_at', new Date(Date.now() - activityDays * 86400000).toISOString())
      .order('created_at', { ascending: false })
      .limit(200);
    if (activityModule) q = q.eq('module', activityModule);
    const { data, error } = await q;

    if (error) {
      list.innerHTML = `<div class="awcCloudMuted">Kon teamactiviteit niet laden: ${esc(error.message)}</div>`;
      return;
    }
    if (!data?.length) {
      list.innerHTML = '<div class="awcCloudMuted">Nog geen gedeelde activiteiten.</div>';
      return;
    }
    list.innerHTML = data.map(row => `
      <div class="awcActivity" onclick="window.awcToggleActivityDetail('${row.id}')">
        <div class="awcActivityTop">
          <div class="awcActivityTitle">${esc(row.description || (moduleNames[row.module] || row.module))}</div>
          <div style="display:flex;align-items:center;gap:7px">
            <div class="awcCloudMuted">${esc(fmtTime(row.created_at))}</div>
            ${memberRole === 'beheerder' ? `<button class="awcDeleteActivity" type="button" onclick="event.stopPropagation();window.awcDeleteActivity('${row.id}')">Wissen</button>` : ''}
          </div>
        </div>
        <div class="awcActivityMeta">${esc(row.actor_email)} · ${esc(moduleNames[row.module] || row.module)} · ${esc(row.action)}</div>
        <div class="awcToggleHint">Tik om volledige registratie te bekijken</div>
        <div id="awc-detail-${row.id}" class="awcDetail" onclick="event.stopPropagation()">
          ${renderObject(row.payload || {})}
        </div>
      </div>`).join('');
  }

  function subscribeActivity() {
    if (!client || !currentUser || realtimeChannel) return;
    realtimeChannel = client
      .channel('awc-tool-team-activity')
      .on('postgres_changes', { event: '*', schema: 'public', table: ACTIVITY_TABLE }, () => {
        if (document.getElementById('awcTeamModal')?.classList.contains('open')) loadActivity();
      })
      .subscribe();
  }

  function wrap(name, after) {
    const original = window[name];
    if (typeof original !== 'function' || original.__awcCloudWrapped) return;
    const wrapped = function (...args) {
      const result = original.apply(this, args);
      Promise.resolve(result).finally(() => {
        try { after.apply(this, args); } catch (e) { console.warn('AWC cloud hook:', e); }
      });
      return result;
    };
    wrapped.__awcCloudWrapped = true;
    window[name] = wrapped;
  }

  function installHooks() {
    if (hooksInstalled) return;
    hooksInstalled = true;

    wrap('saveHist', (module, data) => {
      const saved = localHistory(module)[0] || data;
      upsertCentralRecord(module, saved);
      cloudLog(module, 'opgeslagen', describe(module, saved), saved);
    });

    wrap('saveScans', () => {
      const report = currentScansPayload();
      const items = report?.items || [];
      upsertCentralRecord('scans', { ...report, id: 'current' });
      cloudLog('scans', 'lijst opgeslagen', `Openstaande zendingen: ${items.length} zending(en)`, report);
    });

    wrap('addScan', value => {
      syncCurrentScans();
      cloudLog('scans', 'zending toegevoegd', `Zending toegevoegd: ${String(value || '').slice(0, 80)}`, currentScansPayload());
    });

    wrap('removeScan', () => {
      syncCurrentScans();
      cloudLog('scans', 'zending verwijderd', 'Zending uit de centrale openstaande zendingenlijst verwijderd', currentScansPayload());
    });

    wrap('removeSelectedScans', () => {
      syncCurrentScans();
      cloudLog('scans', 'zendingen verwijderd', 'Geselecteerde zendingen verwijderd', currentScansPayload());
    });

    wrap('clearScans', () => {
      syncCurrentScans();
      cloudLog('scans', 'lijst leeggemaakt', 'Openstaande zendingenlijst leeggemaakt', currentScansPayload());
    });

    wrap('setScanStatus', (index, status) => {
      syncCurrentScans();
      cloudLog('scans', 'status gewijzigd', `Zendingstatus gewijzigd naar ${status}`, currentScansPayload());
    });

    wrap('bulkSetStatus', status => {
      syncCurrentScans();
      cloudLog('scans', 'statussen gewijzigd', `Meerdere zendingen gewijzigd naar ${status}`, currentScansPayload());
    });
  }

  window.awcToggleActivityDetail = toggleActivityDetail;
  window.awcDeleteActivity = deleteActivity;

  async function initCloud() {
    makeUi();

    if (!window.supabase?.createClient) {
      console.warn('AWC Team: Supabase SDK niet geladen');
      return;
    }

    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });

    const { data } = await client.auth.getSession();
    currentUser = data?.session?.user || null;

    if (currentUser && !(await memberIsActive())) {
      await client.auth.signOut();
      currentUser = null;
    }

    setStatus(!!currentUser);
    if (currentUser) {
      installHooks();
      subscribeActivity();
      subscribeCentralRecords();
      await migrateLocalHistoryOnce();
      await hydrateCentralData();
    } else {
      document.getElementById('awcAuthModal').classList.add('open');
    }

    client.auth.onAuthStateChange(async (_event, session) => {
      currentUser = session?.user || null;
      setStatus(!!currentUser);
      if (currentUser) {
        await memberIsActive();
        installHooks();
        subscribeActivity();
        subscribeCentralRecords();
        await migrateLocalHistoryOnce();
        await hydrateCentralData();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCloud, { once: true });
  } else {
    initCloud();
  }
})();
