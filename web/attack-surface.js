(() => {
  const root = document.getElementById('module-root');
  if (!root) return;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const api = async (path) => {
    const r = await fetch(`/api${path}`, { credentials: 'include' });
    if (!r.ok) throw new Error(`API ${r.status}`);
    return r.json();
  };
  const arr = (x) => Array.isArray(x) ? x : (x?.items || x?.data || x?.results || x?.assets || []);
  const render = (data) => {
    const items = arr(data);
    root.innerHTML = `<section class="entity-workspace">
      <header class="workspace-head"><div><div class="eyebrow">ATTACK SURFACE</div><h1>Know what is exposed.</h1><p>Discover internet-facing assets and understand the context behind every exposure.</p></div><button id="refresh-assets" class="btn-primary">Refresh</button></header>
      <div class="workspace-toolbar"><input id="asset-search" placeholder="Search assets, domains, IPs..." /><select id="asset-risk"><option value="">All risk</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select><span class="data-state">${items.length ? `${items.length} assets` : 'No Core data'}</span></div>
      <div class="entity-layout"><div class="entity-table"><div class="table-title">Assets</div><div id="asset-rows">${items.length ? items.map((a,i)=>`<button class="entity-row" data-i="${i}"><span><strong>${esc(a.name || a.domain || a.hostname || a.ip || `Asset ${i+1}`)}</strong><small>${esc(a.type || a.kind || 'Asset')} · ${esc(a.technology || 'Unknown technology')}</small></span><span class="risk ${esc(String(a.risk||a.severity||'').toLowerCase())}">${esc(a.risk || a.severity || '—')}</span></button>`).join('') : '<div class="empty-state"><strong>Waiting for NusaSec Core</strong><span>Assets will appear here when the Attack Surface engine provides data.</span></div>'}</div></div><aside class="entity-detail" id="asset-detail"><div class="detail-empty"><span>SELECT AN ASSET</span><strong>Context will appear here</strong><p>Choose an asset to inspect exposure, technology, findings and related risk.</p></div></aside></div></section>`;
    const detail = document.getElementById('asset-detail');
    items.forEach((a,i)=>document.querySelector(`[data-i="${i}"]`)?.addEventListener('click',()=>{ detail.innerHTML=`<div class="eyebrow">ASSET DETAIL</div><h2>${esc(a.name||a.domain||a.hostname||a.ip||`Asset ${i+1}`)}</h2><div class="detail-risk">${esc(a.risk||a.severity||'—')}</div><dl><dt>Type</dt><dd>${esc(a.type||a.kind||'—')}</dd><dt>Technology</dt><dd>${esc(a.technology||'—')}</dd><dt>Exposure</dt><dd>${esc(a.exposure||a.status||'—')}</dd><dt>Address</dt><dd>${esc(a.ip||a.url||a.domain||'—')}</dd></dl><div class="context-block"><span>Risk context</span><p>Related vulnerabilities, threats and attack paths will be resolved from NusaSec Core.</p></div>`;}));
    document.getElementById('refresh-assets')?.addEventListener('click', load);
    document.getElementById('asset-search')?.addEventListener('input', e=>{const q=e.target.value.toLowerCase(); document.querySelectorAll('.entity-row').forEach(r=>r.hidden=!r.innerText.toLowerCase().includes(q));});
  };
  async function load(){ try { render(await api('/attack-surface')); } catch(e) { render([]); const s=document.querySelector('.data-state'); if(s) s.textContent='Core unavailable'; } }
  load();
})();
