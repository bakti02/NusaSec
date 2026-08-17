(() => {
  const $ = s => document.querySelector(s);
  const fmt = n => Number.isFinite(Number(n)) ? Number(n).toLocaleString('en-US') : '—';
  const sev = (o, k) => Number((o && o[k]) || 0);
  const api = window.NusaSec?.api;
  const set = (sel, value) => { const el=$(sel); if(el) el.textContent=value; };
  const status = (connected, text) => { const el=$('.core-status'); if(!el)return; el.innerHTML=`<i></i> ${text}`; el.classList.toggle('offline',!connected); };
  function render(data) {
    if (!data || !data.scan) { status(false,'NusaSec Core — no scan available'); return; }
    const r=data.risk||{}, by=r.by_severity||{}, p=data.posture||{}, comp=data.compliance||{};
    status(true,`NusaSec Core · scan #${data.scan.id}`);
    set('[data-kpi="assets"]',fmt(data.assets));
    set('[data-kpi="critical"]',String(sev(by,'CRITICAL')).padStart(2,'0'));
    set('[data-kpi="findings"]',fmt(r.findings));
    const coverage = r.telemetry_coverage?.coverage_pct ?? '—'; set('[data-kpi="coverage"]',coverage==='—'?'—':`${Math.round(coverage)}%`);
    const posture = p.score ?? p.posture_score ?? p.value ?? '—'; set('[data-posture="score"]',posture); set('[data-posture="summary"]',r.summary?.overall || p.status || 'Assessment from NusaSec Core');
    set('[data-sev="critical"]',fmt(sev(by,'CRITICAL'))); set('[data-sev="high"]',fmt(sev(by,'HIGH'))); set('[data-sev="medium"]',fmt(sev(by,'MEDIUM'))); set('[data-sev="low"]',fmt(sev(by,'LOW')));
    const compValue = comp.pdp?.score ?? comp.pojk?.score ?? comp.pdp?.coverage_pct ?? null; set('[data-kpi="compliance"]',compValue==null?'—':`${Math.round(compValue)}%`);
    const nodes=r.attack_graph?.nodes||[]; const edges=r.attack_graph?.edges||[]; set('[data-graph="nodes"]',`${nodes.length} nodes`); set('[data-graph="edges"]',`${edges.length} relationships`);
    const postureDelta=data.posture_delta; set('[data-delta]',postureDelta?.change==null?'Core posture delta available':String(postureDelta.change));
    const list=$('[data-findings]'); if(list){ const findings=r.findings||[]; list.innerHTML=findings.slice(0,5).map(f=>`<a class="finding" href="./security-module.html?view=vuln"><span class="sev-dot ${String(f.severity||'').toLowerCase()}"></span><div><b>${esc(f.title||f.rule_id||f.description||'Security finding')}</b><small>${esc(f.asset_external_id||f.asset||f.rule_id||'NusaSec Risk Engine')}</small></div><strong>${esc(f.severity||'—')}</strong><span class="finding-arrow">→</span></a>`).join('') || '<div class="core-empty">No findings returned by Core.</div>'; }
    const engine=$('[data-engine-health]'); if(engine) engine.innerHTML=`<div class="core-engine"><span>Risk Engine</span><strong>${r.findings==null?'—':'READY'}</strong></div><div class="core-engine"><span>Attack Graph</span><strong>${nodes.length?'READY':'NO DATA'}</strong></div><div class="core-engine"><span>Identity Graph</span><strong>${(data.identity_graph?.nodes||[]).length?'READY':'NO DATA'}</strong></div><div class="core-engine"><span>Crypto Posture</span><strong>${data.crypto_posture?'READY':'NO DATA'}</strong></div><div class="core-engine"><span>Compliance</span><strong>${comp.pdp||comp.pojk?'READY':'NO DATA'}</strong></div><div class="core-engine"><span>PQC</span><strong>${data.pqc?'READY':'NO DATA'}</strong></div>`;
  }
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  async function load(){ try { const data=await api('/dashboard/overview'); render(data); } catch(e){ status(false, e.status ? `NusaSec Core · API ${e.status}` : 'NusaSec Core · not connected'); document.querySelectorAll('[data-kpi],[data-posture],[data-sev]').forEach(el=>{el.textContent='—'}); } }
  document.addEventListener('DOMContentLoaded',()=>{ load(); $('#run-assessment')?.addEventListener('click',()=>load()); });
})();
