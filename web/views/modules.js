import { MODULES, loadModule } from '../api/modules.js';

const demo = {
  attack: { title:'Attack Surface', kicker:'EXPOSURE', description:'Discover internet-facing assets, services and exposure paths.', metrics:[['Assets','1,284'],['Exposed services','37'],['Newly discovered','12'],['High exposure','4']] },
  threat: { title:'Threat Intelligence', kicker:'INTELLIGENCE', description:'Correlate indicators, campaigns and threats with your environment.', metrics:[['Active threats','12'],['Indicators','348'],['Correlated assets','27'],['High confidence','9']] },
  vuln: { title:'Vulnerabilities', kicker:'RISK', description:'Prioritize vulnerabilities by severity, exposure and business context.', metrics:[['Critical','6'],['High','11'],['Medium','14'],['Open','37']] },
  monitor: { title:'Monitoring', kicker:'CONTINUOUS MONITORING', description:'Observe security events and alerts as they arrive from connected engines.', metrics:[['Events / 24h','18,420'],['Open alerts','18'],['Critical alerts','2'],['Coverage','94%']] },
  incidents: { title:'Incidents', kicker:'RESPONSE', description:'Track active investigations from detection through resolution.', metrics:[['Active','3'],['Investigating','2'],['Contained','4'],['Resolved / 30d','31']] },
  compliance: { title:'Compliance', kicker:'GOVERNANCE', description:'Track controls, evidence and policy coverage across frameworks.', metrics:[['Coverage','91%'],['Controls','128'],['Evidence','342'],['Exceptions','7']] }
};

function esc(value){ return String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }

export async function renderModule(key, mount) {
  const meta = demo[key];
  if (!meta || !MODULES[key]) return;
  mount.innerHTML = `<div class="module-loading"><div class="spinner"></div><span>Connecting to NusaSec Core…</span></div>`;
  try {
    const payload = await loadModule(key);
    mount.innerHTML = render(key, meta, payload);
  } catch (error) {
    // The UI remains useful in preview when the Core is not attached yet.
    // No fake API success is reported: the state is explicitly marked as preview.
    mount.innerHTML = render(key, meta, null, error);
  }
}

function render(key, meta, payload, error) {
  const preview = !payload;
  const metrics = meta.metrics.map(([label,value]) => `<article class="module-metric card"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${preview ? 'Preview — Core not connected' : 'Live from NusaSec Core'}</small></article>`).join('');
  const raw = payload ? `<details class="module-raw card"><summary>Core response</summary><pre>${esc(JSON.stringify(payload,null,2))}</pre></details>` : '';
  return `<section class="module-page" data-module="${esc(key)}">
    <div class="module-head"><div><div class="eyebrow">${esc(meta.kicker)}</div><h1>${esc(meta.title)}</h1><p>${esc(meta.description)}</p></div><div class="module-status ${preview?'preview':'live'}"><i></i>${preview?'Preview mode':'Core connected'}</div></div>
    ${preview ? `<div class="core-notice card"><strong>Waiting for NusaSec Core</strong><span>${esc(error?.message || 'This module is ready for the production API contract.')}</span></div>` : ''}
    <div class="module-metrics">${metrics}</div>
    <div class="module-grid"><article class="card module-workspace"><div class="card-head"><div><span class="section-kicker">${esc(meta.title).toUpperCase()}</span><h2>Operational view</h2></div><button class="btn primary" data-refresh-module="${esc(key)}">Refresh</button></div><div class="empty-operational"><div class="empty-icon">${key === 'attack' ? '◌' : key === 'threat' ? '◈' : key === 'vuln' ? '△' : key === 'monitor' ? '◉' : key === 'incidents' ? '!' : '✓'}</div><h3>${preview?'Module ready for live data':'Live module connected'}</h3><p>${preview?'Connect the corresponding Core endpoint to populate assets, findings, events and records.':'Data is being supplied by the NusaSec Core API.'}</p></div></article><aside class="card module-side"><span class="section-kicker">NUSASEC CORE</span><h2>Engine connection</h2><div class="connection-row"><i class="${preview?'offline':'online'}"></i><span>${preview?'Not connected':'Connected'}</span></div><code>/api${esc(MODULES[key].endpoint)}</code><p>API adapter is isolated from the presentation layer.</p></aside></div>${raw}</section>`;
}
