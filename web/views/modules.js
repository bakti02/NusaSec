import { MODULES, loadModule } from '../api/modules.js';

const META = {
  attack: { title:'Attack Surface', kicker:'EXPOSURE', description:'Map internet-facing assets and understand why each exposure matters.', primary:'Assets', icon:'◌', columns:['Asset','Exposure','Technology','Risk'] },
  threat: { title:'Threat Intelligence', kicker:'INTELLIGENCE', description:'Connect indicators and campaigns to assets, findings and active investigations.', primary:'Threats', icon:'◈', columns:['Indicator','Type','Confidence','Related asset'] },
  vuln: { title:'Vulnerabilities', kicker:'RISK', description:'Prioritize weaknesses using severity, exposure and business context.', primary:'Findings', icon:'△', columns:['Finding','Severity','Asset','Remediation'] },
  monitor: { title:'Monitoring', kicker:'CONTINUOUS MONITORING', description:'Observe security events as they arrive and move from signal to action.', primary:'Events', icon:'◉', columns:['Time','Event','Source','Severity'] },
  incidents: { title:'Incidents', kicker:'RESPONSE', description:'Investigate active cases from detection through containment and resolution.', primary:'Incidents', icon:'!', columns:['Incident','Severity','Status','Updated'] },
  compliance: { title:'Compliance', kicker:'GOVERNANCE', description:'Connect controls, evidence, exceptions and technical findings in one workspace.', primary:'Controls', icon:'✓', columns:['Control','Framework','Status','Evidence'] }
};

const esc = value => String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

export async function renderModule(key, mount) {
  const meta = META[key];
  if (!meta || !MODULES[key]) return;
  mount.innerHTML = `<div class="module-loading"><div class="spinner"></div><span>Connecting to NusaSec Core…</span></div>`;
  try {
    const payload = await loadModule(key);
    mount.innerHTML = render(key, meta, payload, null);
  } catch (error) {
    mount.innerHTML = render(key, meta, null, error);
  }
}

function render(key, meta, payload, error) {
  const connected = payload !== null && payload !== undefined;
  const state = connected ? 'live' : 'preview';
  const count = connected ? inferCount(payload) : '—';
  const raw = connected ? `<details class="module-raw card"><summary>Core response</summary><pre>${esc(JSON.stringify(payload,null,2))}</pre></details>` : '';
  return `<section class="module-page" data-module="${esc(key)}">
    <div class="module-head">
      <div><div class="eyebrow">${esc(meta.kicker)}</div><h1>${esc(meta.title)}</h1><p>${esc(meta.description)}</p></div>
      <div class="module-actions"><div class="module-status ${state}"><i></i>${connected?'Core connected':'Preview mode'}</div><button class="btn primary" data-refresh-module="${esc(key)}">Refresh</button></div>
    </div>
    ${!connected ? `<div class="core-notice card"><div><strong>Core connection required</strong><span>${esc(error?.message || 'This workspace is ready for the production API contract.')}</span></div><code>/api${esc(MODULES[key].endpoint)}</code></div>` : ''}
    <div class="module-toolbar card"><div class="module-search"><span>⌕</span><input aria-label="Search" placeholder="Search ${esc(meta.primary.toLowerCase())}…" disabled></div><button class="filter" disabled>All status <span>⌄</span></button><button class="filter" disabled>Risk <span>⌄</span></button><span class="toolbar-count">${esc(count)} ${esc(meta.primary.toLowerCase())}</span></div>
    <div class="module-kpis">
      <article class="module-kpi card"><span>${esc(meta.primary)}</span><strong>${esc(count)}</strong><small>${connected?'Returned by NusaSec Core':'Waiting for Core data'}</small></article>
      <article class="module-kpi card"><span>Risk context</span><strong>—</strong><small>Calculated from connected engines</small></article>
      <article class="module-kpi card"><span>Last updated</span><strong>—</strong><small>${connected?'Core response received':'No live timestamp yet'}</small></article>
    </div>
    <div class="module-layout">
      <article class="card module-table-card">
        <div class="card-head"><div><span class="section-kicker">${esc(meta.primary).toUpperCase()}</span><h2>${connected?'Operational workspace':'Ready for live records'}</h2></div><span class="table-mode">${connected?'LIVE DATA':'NO LIVE DATA'}</span></div>
        ${connected ? renderPayload(key, payload, meta) : renderEmpty(key, meta)}
      </article>
      <aside class="card context-card">
        <span class="section-kicker">CONTEXT</span><h2>Entity relationships</h2>
        <div class="context-graph"><div class="node main-node">${esc(meta.primary)}</div><div class="line"></div><div class="context-nodes"><span>Asset</span><span>Risk</span><span>Threat</span></div></div>
        <p>When Core data is connected, selecting a record will reveal related assets, findings, identities, events and remediation context here.</p>
      </aside>
    </div>
    ${raw}
  </section>`;
}

function renderEmpty(key, meta) {
  const actions = key === 'attack' ? 'Assets → Exposure → Technology → Risk → Attack path' : key === 'threat' ? 'Indicator → Threat → Asset → Finding → Incident' : key === 'vuln' ? 'Finding → Asset → Exposure → Remediation' : key === 'monitor' ? 'Event → Signal → Asset → Action' : key === 'incidents' ? 'Detection → Investigation → Containment → Resolution' : 'Control → Evidence → Finding → Exception';
  return `<div class="module-empty"><div class="empty-icon">${esc(meta.icon)}</div><h3>No live records yet</h3><p>The interface is intentionally not populated with invented security data. Connect the NusaSec Core endpoint to activate this workspace.</p><div class="flow-hint">${esc(actions)}</div></div>`;
}

function renderPayload(key, payload, meta) {
  const rows = normalizeRows(payload);
  if (!rows.length) return renderEmpty(key, meta);
  return `<div class="data-table-wrap"><table class="data-table"><thead><tr>${meta.columns.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0,50).map(row=>`<tr>${meta.columns.map((c,i)=>`<td>${esc(valueFor(row,c,i))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function normalizeRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    for (const key of ['items','data','results','records','assets','findings','events','incidents','controls']) if (Array.isArray(payload[key])) return payload[key];
    return [payload];
  }
  return [];
}

function valueFor(row, column, index) {
  if (row == null || typeof row !== 'object') return row;
  const aliases = {
    Asset:['asset','name','hostname','domain','id'], Exposure:['exposure','exposure_status','internet_exposed','public'], Technology:['technology','technologies','service','type'], Risk:['risk','risk_level','severity'],
    Indicator:['indicator','ioc','value','name'], Type:['type','indicator_type','kind'], Confidence:['confidence','confidence_score'], 'Related asset':['asset','asset_name','related_asset'],
    Finding:['finding','title','name','id'], Severity:['severity','priority'], Remediation:['remediation','status','recommendation'], Time:['time','timestamp','created_at'], Event:['event','message','name'], Source:['source','engine'],
    Incident:['incident','title','name','id'], Status:['status','state'], Updated:['updated','updated_at','modified_at'], Control:['control','control_id','name'], Framework:['framework','framework_name'], Evidence:['evidence','evidence_count']
  };
  const keys = aliases[column] || Object.keys(row);
  for (const k of keys) if (row[k] !== undefined && row[k] !== null) return typeof row[k] === 'object' ? JSON.stringify(row[k]) : row[k];
  return Object.values(row)[index] ?? '—';
}

function inferCount(payload) {
  if (Array.isArray(payload)) return payload.length;
  if (payload && typeof payload === 'object') for (const key of ['items','data','results','records','assets','findings','events','incidents','controls']) if (Array.isArray(payload[key])) return payload[key].length;
  return '1';
}
