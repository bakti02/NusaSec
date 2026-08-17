(() => {
const root=document.getElementById('products-root'); const api=window.NusaSec?.api; if(!root)return;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function load(){try{const d=await api('/v1/products/catalog/solutions'); const families=d.families||[]; root.innerHTML=families.map(f=>`<section class="card product-family"><div class="card-head"><div><span class="section-kicker">${esc(f.code)}</span><h2>${esc(f.name)}</h2></div><span class="healthy">Core catalog</span></div><p class="muted">${esc(f.description||f.outcome||'')}</p><div class="product-grid">${(f.products||[]).map(p=>`<a class="product-item" href="./product.html?code=${encodeURIComponent(p.product_code)}"><b>${esc(p.display_name)}</b><small>${esc(p.outcome||'')}</small><span>Open workspace →</span></a>`).join('')}</div></section>`).join('')||'<div class="core-empty">No public product families returned by Core.</div>'}catch(e){root.innerHTML='<div class="core-empty"><strong>NusaSec Core is not connected.</strong><span>Product families will be loaded from the canonical Core catalog when the API is available.</span></div>'}}
load();
})();
