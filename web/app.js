const state = { user: null, apiBase: (window.NUSASEC_API_BASE || localStorage.getItem('nusasec_api_base') || '').replace(/\/$/, '') };
function resolveApi(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith('/api/')) return `${state.apiBase}${normalized}`;
  if (normalized.startsWith('/v1/')) return `${state.apiBase}/api${normalized}`;
  return `${state.apiBase}/api/v1${normalized}`;
}
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const response = await fetch(resolveApi(path), { ...options, credentials: 'include', headers });
  if (!response.ok) { const error = new Error(`API ${response.status}`); error.status = response.status; throw error; }
  return response.status === 204 ? null : response.json();
}
function configureApiBase(value) {
  state.apiBase = String(value || '').replace(/\/$/, '');
  if (state.apiBase) localStorage.setItem('nusasec_api_base', state.apiBase);
  else localStorage.removeItem('nusasec_api_base');
}
window.NusaSec = { api, state, resolveApi, configureApiBase };
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-action="logout"]').forEach(el => el.addEventListener('click', async event => {
    event.preventDefault();
    try { await api('/auth/logout', { method: 'POST' }); } finally { location.href = '../login/'; }
  }));
});
