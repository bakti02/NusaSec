async function api(path, options={}) { const r=await fetch(`/api${path}`, {...options, credentials:'include', headers:{'Content-Type':'application/json',...(options.headers||{})}}); if(!r.ok) throw new Error(`API ${r.status}`); return r.status===204?null:r.json(); }
window.NusaSecInternal={api};
